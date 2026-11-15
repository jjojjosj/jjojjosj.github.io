---
title: "GGUF 양자화 원리와 압축 방식의 진화"
date: 2026-11-15 11:30:00 +0900
tags: ["AI"]
categories: [AI]
---

# GGUF 양자화 원리와 압축 방식의 진화

GGUF는 llama.cpp가 쓰는 단일 파일 모델 포맷이고, 핵심 가치는 양자화로 모델을 1/2\~1/8 크기로 줄여 일반 GPU·CPU에서 돌리는 데 있습니다. 2023년 8월 기존 GGML(GGJT) 포맷을 대체했고, 현재 파일 버전은 3입니다. ([llama.cpp GGUF format](https://mintlify.com/ggml-org/llama.cpp/concepts/gguf-format), [Wikipedia](https://en.wikipedia.org/wiki/GGUF))

- **파일 하나에 전부 포함:** 텐서(가중치), 아키텍처 메타데이터, 토크나이저, 채팅 템플릿, 양자화 타입이 한 파일에 들어갑니다. 별도 config.json이나 tokenizer 파일이 필요 없어 폐쇄망 반입이 간단합니다.
- **구조:** 헤더(매직 `GGUF`, 버전, 텐서 수, KV 수) → Key-Value 메타데이터(`general.architecture`, `general.file_type` 등) → 텐서 정보 → 정렬된 텐서 데이터 순입니다.
- **mmap 로딩:** 텐서 데이터가 정렬·연속 배치돼 있어 llama.cpp가 파일을 mmap하고, OS가 필요한 가중치만 RAM으로 페이징합니다. ([ZeroEntropy](https://www.zeroentropy.dev/concepts/gguf/))
- **혼합 정밀도:** 텐서마다 양자화 타입을 따로 지정할 수 있어, 한 파일 안에 Q4\_K·Q6\_K·F32 텐서가 섞여 있는 것이 정상입니다.
- **생태계:** llama.cpp, Ollama, LM Studio, GPT4All, KoboldCpp 등이 GGUF를 기본 지원합니다.
- **맞지 않는 경우:** 추론 전용 포맷이라 학습·파인튜닝용으로는 쓰지 않습니다. GPU 클러스터에서 최대 처리량이 목표라면 safetensors + vLLM/TensorRT-LLM 쪽이 일반적입니다.

## 1. GGUF의 핵심 작동 원리: 양자화

양자화는 FP16/FP32 실수 가중치를 1.5\~8비트 정수로 바꾸고, 블록마다 작은 스케일 값을 함께 저장해 원래 값을 근사 복원하는 방식입니다. ([위키독스](https://wikidocs.net/365766), [IBM](https://www.ibm.com/kr-ko/think/topics/gguf-versus-ggml))

### 1-1. 정밀도 축소는 어떻게 동작하나

가중치 전체를 한 번에 양자화하지 않고, 32개(또는 16개) 단위 **블록**으로 자릅니다. 블록마다 값의 범위에 맞는 스케일(d)을 구하고, 각 가중치를 그 스케일 단위의 정수(q)로 반올림합니다.

$$
w \approx d \cdot q \quad (\text{대칭, Type 0}) \qquad w \approx d \cdot q + m \quad (\text{비대칭, Type 1})
$$

- 블록을 작게 나눌수록 이상치(outlier) 하나가 다른 값들의 정밀도를 망치는 범위가 좁아집니다.
- 대신 블록마다 스케일을 저장해야 하므로, 실제 용량은 “명목 비트 + 스케일 오버헤드”입니다. 예를 들어 Q4\_0은 32개당 FP16 스케일 1개를 더해 실제 4.5 bpw(bits per weight)입니다.
- 추론 시에는 블록을 역양자화(dequantize)하며 행렬 곱을 수행합니다. 토큰 생성은 메모리 대역폭이 병목이라, 읽을 바이트가 줄면 속도도 빨라집니다.
- 모든 텐서를 같은 비트로 줄이지는 않습니다. 정규화(norm) 가중치 같은 작은 1차원 텐서는 F32로 남기는 것이 일반적입니다. ([ggml quantization](https://www.mintlify.com/ggml-org/ggml/concepts/quantization))

### 1-2. 용량·메모리 계산

모델 파일 크기는 파라미터 수 × bpw ÷ 8 바이트로 거의 정확히 예측됩니다. FP16 대비 Q4\_K\_M은 약 30%, 즉 “약 4분의 1”이라는 원문 설명과 일치합니다. ([호프트](https://hoft.tistory.com/entry/llm-quantization-gptq-awq-gguf-beginner-guide))

| 모델 | FP16 (16 bpw) | Q8\_0 (≈8.5 bpw) | Q4\_K\_M (≈4.9 bpw) | IQ2\_M (≈2.9 bpw) |
| --- | --- | --- | --- | --- |
| 8B | 약 16 GB | 약 8.5 GB | 약 4.9 GB | 약 2.9 GB |
| 32B | 약 64 GB | 약 34 GB | 약 20 GB | 약 12 GB |
| 70B | 약 140 GB | 약 74 GB | 약 43 GB | 약 26 GB |

실제 실행에는 가중치 외에 **KV 캐시**와 연산 버퍼가 더 필요합니다. KV 캐시는 컨텍스트 길이에 비례해 커지므로, 파일 크기보다 1\~3 GB(긴 컨텍스트면 그 이상) 여유를 두는 것이 안전합니다. 표의 bpw는 Llama-3.1-8B 기준 실측값이며, 모델에 따라 조금씩 달라집니다.

## 2. GGUF 압축 방식의 진화

GGUF 양자화는 Legacy → K-Quants(2023년 6월) → I-Quants(2024년 1월\~)의 3세대로 발전했고, 세대가 올라갈수록 같은 크기에서 품질 손실이 작아졌습니다. 중요도 행렬(imatrix)은 별도 세대가 아니라, 여러 타입에 공통으로 적용되는 보조 기법입니다. ([YouTube 해설](https://www.youtube.com/watch?v=vW30o4U9BFE))

### 2-1. 레거시 퀀트 (Q4\_0, Q4\_1, Q5\_0, Q5\_1, Q8\_0)

- **구조:** 32개 가중치를 한 블록으로 묶고, 블록마다 FP16 스케일을 둡니다.
- **`_0`(Type 0):** 대칭 매핑, w = d × q. 스케일만 저장합니다.
- **`_1`(Type 1):** 비대칭 매핑, w = d × q + m. 최솟값(m)을 함께 저장해 0을 중심으로 치우친 분포를 더 잘 표현하지만 용량이 늘어납니다(Q4\_1 = 5.0 bpw).
- **현재 위치:** Q8\_0은 원본과 거의 구별되지 않는 품질 기준점으로 여전히 쓰입니다. Q4\_0은 일부 ARM·저사양 백엔드에서 속도 이점이 있어 남아 있고, 나머지는 K-Quants로 대체됐습니다.

### 2-2. K-Quants (Q2\_K \~ Q6\_K, `_S` / `_M` / `_L`)

K-Quants는 2023년 6월 llama.cpp [PR #1684](https://github.com/ggerganov/llama.cpp/pull/1684)으로 들어온 **2단 계층 블록(슈퍼블록)** 방식입니다. ([AI Muninn](https://ai-muninn.com/en/blog/llm-deep-dive-quantization-algorithms))

- **슈퍼블록:** 256개 가중치를 하나로 묶고 FP16 스케일(d)과 최솟값 스케일(dmin)을 한 번만 저장합니다.
- **서브블록 스케일의 양자화:** 그 안의 16·32개짜리 서브블록 스케일은 FP16이 아니라 4\~8비트 정수로, 슈퍼블록 스케일에 대한 상대값만 저장합니다. 원문의 “2중 양자화”가 바로 이 부분입니다.
- **효과:** 스케일 오버헤드가 가중치당 약 0.4비트 수준으로 줄면서도, 더 작은 단위로 스케일을 맞출 수 있어 정확도가 올라갑니다. ([ZeroEntropy](https://www.zeroentropy.dev/concepts/gguf/))

| 기본 타입 | 슈퍼블록 구성 | 서브블록 스케일 | bpw |
| --- | --- | --- | --- |
| Q2\_K | 16블록 × 16개 | scale·min 4비트 | 2.5625 |
| Q3\_K | 16블록 × 16개 | scale 6비트 | 3.4375 |
| Q4\_K | 8블록 × 32개 | scale·min 6비트 | 4.5 |
| Q5\_K | 8블록 × 32개 | scale·min 6비트 | 5.5 |
| Q6\_K | 16블록 × 16개 | scale 8비트 | 6.5625 |

출처: [llama.cpp Tensor Encoding Schemes](https://github.com/ggml-org/llama.cpp/wiki/Tensor-Encoding-Schemes)

**`_S` / `_M` / `_L` 접미사의 의미:** 이 접미사는 블록 형식이 아니라 “텐서별 타입 배합 레시피”입니다. 예를 들어 Q4\_K\_M 파일은 대부분 Q4\_K이지만, 품질에 민감한 `attn_v`·`ffn_down` 일부와 출력층을 Q6\_K로 더 높게 저장합니다. `_S`는 거의 기본 타입만, `_L`은 민감 텐서를 가장 넉넉하게 올려줍니다. ([OpenClaw 해설](https://openclawdc.com/blog/gguf-quant-names-explained/))

### 2-3. I-Quants (IQ1\_S \~ IQ4\_XS)

I-Quants는 2024년 1월 [PR #4773](https://github.com/ggml-org/llama.cpp/pull/4773)(IQ2\_XXS)부터 추가된 **벡터 양자화** 계열로, 2\~3비트 저비트 영역에서 K-Quants보다 크게 우수합니다.

- **벡터 양자화:** 가중치를 하나씩이 아니라 8개씩 묶어 8차원 벡터로 보고, 미리 정해둔 코드북(격자점 목록)에서 가장 가까운 점의 번호만 저장합니다.
- **E8 격자:** IQ2 계열은 수학적으로 가장 촘촘한 8차원 격자인 E8 격자에서, 실제 모델에 자주 나오는 256개 점을 골라 코드북으로 씁니다. 8개 가중치당 부호 7비트 + 코드북 인덱스 8비트를 사용합니다. ([PR #4773](https://github.com/ggml-org/llama.cpp/pull/4773))
- **IQ4\_NL / IQ4\_XS:** 코드북 대신 비선형 룩업 테이블로 4비트 값을 복원합니다. 균등 간격이 아니어서, 0 근처에 몰린 실제 가중치 분포를 더 잘 표현합니다.
- **이름 규칙:** XXS < XS < S < M 순으로 커집니다. 같은 비트라면 3비트 이상부터 IQ가 K보다 크기 대비 품질이 나은 것이 보통입니다. ([rentry 해설](https://rentry.co/llama-cpp-quants-or-fine-ill-do-it-myself-then-pt-2))
- **단점:** 코드북 조회 비용 때문에 CPU·Metal 등 일부 백엔드에서는 같은 크기의 K-Quant보다 느릴 수 있습니다. CUDA에서는 차이가 많이 줄었습니다.

### 2-4. 중요도 행렬 (imatrix)

imatrix는 “어느 가중치의 오차가 출력을 더 많이 망치는가”를 측정해, 양자화할 때 그 가중치의 오차를 우선 줄이도록 하는 가중치 지도입니다.

1. `llama-imatrix`로 보정(calibration)용 텍스트를 모델에 통과시킵니다.
2. 각 행렬 곱 입력 활성값의 제곱 평균을 열(column)별로 누적해 “중요도”를 구합니다.
3. `llama-quantize --imatrix`가 이 중요도를 가중치로 삼아 오차를 최소화하는 스케일·코드를 고릅니다.

- 지정된 비트를 텐서별로 바꾸는 것이 아니라, **같은 비트 안에서 반올림 방향과 스케일을 더 잘 고르는** 기법입니다.
- IQ2\_XXS·IQ2\_XS·IQ1 계열, Q2\_K\_S는 imatrix가 사실상 필수입니다. K-Quants에도 선택적으로 적용할 수 있고, 적용하면 Q4\_K\_M도 품질이 좋아집니다. ([PR #4897](https://cdn04132025.gitlink.org.cn/replica/llama.cpp/commit/147b17ac94a24d524e367cda26a9ff6245689f34))
- Hugging Face의 `bartowski`, `mradermacher`(i1) 등이 올리는 “imatrix GGUF”가 이 방식으로 만든 파일입니다.

## 3. 양자화 타입 비교표

실무 기본값은 Q4\_K\_M이고, 메모리가 부족하면 IQ4\_XS → IQ3\_M → IQ2\_M 순으로 내려가는 것이 일반적입니다. 아래 크기·속도는 llama.cpp 공식 문서의 Llama-3.1-8B 실측치입니다. ([llama.cpp quantize README](https://git.peisongxiao.com/CS348Project/llama.cpp/src/tag/b6311/tools/quantize))

| 타입 | 세대 | 실측 bpw | 8B 크기 (GiB) | 생성 속도 (t/s) | 품질 경향 | 권장 용도 |
| --- | --- | --- | --- | --- | --- | --- |
| F16 | 원본 | 16.0 | 14.96 | 29.2 | 기준 | 재양자화 원본, 평가 기준 |
| Q8\_0 | Legacy | 8.50 | 7.95 | 50.9 | 원본과 거의 동일 | 품질 최우선, 메모리 여유 |
| Q6\_K | K | 6.56 | 6.14 | 58.7 | 매우 낮은 손실 | Q8\_0 대안 |
| Q5\_K\_M | K | 5.70 | 5.33 | 67.2 | 낮은 손실 | 코딩·수학 등 정확도 민감 |
| Q4\_K\_M | K | 4.89 | 4.58 | 71.9 | 체감 손실 작음 | **기본 추천** |
| IQ4\_XS | I | 4.46 | 4.17 | 77.5 | Q4\_K\_S와 비슷 | Q4\_K\_M이 살짝 안 들어갈 때 |
| Q3\_K\_M | K | 4.00 | 3.74 | 71.7 | 손실 눈에 띈 | 구형 백엔드 호환 |
| IQ3\_M | I | 3.76 | 3.52 | 70.2 | Q3\_K\_M보다 나음 | 3비트대 추천 |
| IQ2\_M | I | 2.93 | 2.74 | 74.4 | 손실 큼 | 큰 모델(70B+)을 작은 VRAM에 |
| IQ1\_S | I | 2.00 | 1.87 | 79.7 | 실용성 낮음 | 실험용 |

- 8B 모델의 실측 bpw는 명목치보다 높습니다. 임베딩·출력층이 모델에서 차지하는 비중이 커서이고, 70B급에서는 명목치에 가까워집니다.
- 속도는 측정 환경 하나의 결과이므로 절대값보다 “비트가 줄면 대체로 빨라진다”는 경향으로 보세요.
- 품질 경향은 perplexity·KL divergence 벤치마크의 일반적 순서를 요약한 것입니다. 모델·작업별로 차이가 있으니 중요한 용도라면 직접 비교하세요. ([벤치마크 예시](https://beebopkim.github.io/2024/03/09/Benchmarks-for-lots-of-quantization-types-in-llama-cpp))

## 4. 실전 선택 가이드

원칙은 “VRAM에 전부 들어가는 가장 큰 퀀트”이고, 비슷한 용량이면 작은 모델의 높은 비트보다 큰 모델의 낮은 비트(단, 3비트 이상)가 대개 낫습니다.

| 가용 VRAM | 추천 조합 (컨텍스트 8K 전후 기준) |
| --- | --- |
| 8 GB | 8B Q4\_K\_M\~Q5\_K\_M |
| 12\~16 GB | 8B Q8\_0, 14B Q4\_K\_M\~Q6\_K |
| 24 GB | 32B Q4\_K\_M 또는 IQ4\_XS |
| 48 GB | 70B IQ4\_XS, 32B Q8\_0 |
| 80 GB | 70B Q6\_K, 대형 MoE는 IQ3\_M\~IQ2\_M |

- **CPU/GPU 분할:** VRAM이 모자라면 `-ngl`(GPU에 올릴 레이어 수)로 일부만 GPU에 올리고 나머지는 시스템 RAM에서 돌릴 수 있습니다. 단, CPU로 넘어가는 비율만큼 생성 속도가 크게 떨어집니다.
- **MoE 모델:** 전문가(expert) 텐서만 CPU로 보내는 `--override-tensor`(`-ot`) 옵션을 쓰면, 활성 파라미터가 작은 MoE는 적은 VRAM에서도 쓸만한 속도가 나옵니다.
- **KV 캐시 양자화:** `--cache-type-k q8_0 --cache-type-v q8_0`으로 KV 캐시를 절반 가까이 줄여 긴 컨텍스트를 확보할 수 있습니다(V 캐시 양자화는 Flash Attention 필요).
- **파일 이름 읽기:** `UD-`(Unsloth Dynamic), `_XL` 같은 표기는 llama.cpp 공식 타입이 아니라 업로더의 레시피 이름이라 모델마다 크기가 다릅니다. ([OpenClaw 해설](https://openclawdc.com/blog/gguf-quant-names-explained/))
- **저비트 활용 시 주의:** 3비트 미만에서는 imatrix를 적용한 파일을 고르고, 코딩·수학·장문 추론처럼 정확도에 민감한 작업은 한 단계 높은 비트를 쓰세요.

## 5. 직접 양자화하기 (llama.cpp)

Hugging Face safetensors → F16 GGUF 변환 → (선택) imatrix 생성 → 양자화 순서이며, 모두 인터넷 없이 로컨에서 수행됩니다. ([llama.cpp quantize README](https://git.peisongxiao.com/CS348Project/llama.cpp/src/tag/b6311/tools/quantize))

```bash
# 1) HF 모델 → F16 GGUF
python3 convert_hf_to_gguf.py ./models/mymodel/ --outtype f16 --outfile mymodel-f16.gguf

# 2) (선택) 중요도 행렬 생성: calibration.txt는 실제 사용 도메인과 비슷한 텍스트
llama-imatrix -m mymodel-f16.gguf -f calibration.txt -o imatrix.gguf -ngl 99

# 3) 양자화
llama-quantize mymodel-f16.gguf mymodel-Q4_K_M.gguf Q4_K_M
llama-quantize --imatrix imatrix.gguf mymodel-f16.gguf mymodel-IQ3_M.gguf IQ3_M

# 4) 품질 확인 (테스트 텍스트 기준 perplexity)
llama-perplexity -m mymodel-Q4_K_M.gguf -f test.txt -ngl 99
```

- 양자화 원본은 반드시 F16/BF16(또는 F32)으로 하세요. 이미 양자화된 파일을 다시 양자화하면 오차가 누적됩니다.
- 보정 텍스트는 수십만\~수백만 토큰이면 충분합니다. 한국어 사용이 주라면 한국어 텍스트를 섞는 것이 유리합니다.
- 폐쇄망에서는 llama.cpp를 로컬 빌드하고 `gguf` Python 패키지와 원본 safetensors만 반입하면 됩니다.
- `gguf-dump`(Python `gguf` 패키지)로 파일 안의 텐서별 타입과 메타데이터를 확인할 수 있습니다.

## 6. 다른 양자화 방식과의 비교

GGUF는 “어디서나 돌아가는 단일 파일”이 강점이고, GPTQ·AWQ는 GPU 서빙 처리량이 강점입니다. ([호프트](https://hoft.tistory.com/entry/llm-quantization-gptq-awq-gguf-beginner-guide))

| 방식 | 주 실행 환경 | 비트 | 핵심 아이디어 | 적합한 경우 |
| --- | --- | --- | --- | --- |
| GGUF | llama.cpp, Ollama, LM Studio (CPU·GPU·Apple) | 1.5\~8 | 블록 스케일 + 코드북, 텐서별 혼합 | 로컬·엣지, CPU 분할 실행 |
| GPTQ | vLLM, TGI, Transformers (GPU) | 2\~8 (주로 4) | 2차 근사(Hessian)로 오차 보상하며 순차 양자화 | GPU 서버 다중 사용자 서빙 |
| AWQ | vLLM, TGI (GPU) | 4 | 활성값이 큰 채널의 가중치를 스케일링해 보호 | GPU 서빙, 빠른 변환 |
| EXL2/EXL3 | ExLlamaV2/V3 (NVIDIA GPU) | 2\~8 (소수점 단위) | 레이어별 비트 자동 배분 | 단일 GPU 최대 속도 |
| bitsandbytes (NF4) | Transformers (GPU) | 4, 8 | 로드 시점 즉석 양자화 | QLoRA 파인튜닝 |

GPU 클러스터에서 vLLM으로 여러 사용자에게 서빙한다면 AWQ·GPTQ(또는 FP8)가, 개발자 PC나 폐쇄망 워크스테이션에서 단일 사용자가 쓴다면 GGUF가 더 간단합니다. vLLM도 GGUF를 일부 지원하지만 최적화 수준은 전용 포맷보다 낮습니다.

## 7. 최신 기법: GSQ-RCO와 NVFP4

두 기법은 성격이 다릅니다. GSQ-RCO는 기존 GGUF 타입을 그대로 쓰면서 “어떻게 양자화하고 어떻게 배합할지”를 최적화하는 방법이고, NVFP4는 NVIDIA Blackwell 하드웨어가 직접 계산하는 새 4비트 수 형식입니다.

### 7-1. GSQ-RCO (ISTA DAS Lab)

GPTQ를 만든 ISTA(오스트리아 과학기술연구소) DAS Lab의 방법으로, 결과물은 표준 GGUF라 수정 없는 llama.cpp·Ollama·LM Studio에서 바로 돌아갑니다. ([모델 카드](https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF), [MindStudio](https://www.mindstudio.ai/blog/what-is-gsq-rco-quantization/))

- **GSQ (Gumbel-Softmax Quantization):** 텐서 하나를 주어진 GGUF 타입으로 양자화할 때, 각 가중치가 어느 격자값을 고를지와 그룹 스케일을 Gumbel-Softmax 완화로 함께 학습합니다. 단순 반올림 대신 최적화로 반올림 방향을 고르는 셈입니다. ([arXiv 2604.18556](https://arxiv.org/abs/2604.18556))
- **RCO (Riemannian Constrained Optimization):** N개 텐서 각각에 K개 후보 타입 중 하나를 배정하되, 전체 크기 예산을 정확히 맞추도록 리만 다양체 위에서 작업 손실을 직접 최소화합니다. ([arXiv 2605.00649](https://arxiv.org/abs/2605.00649))
- **`_S/_M/_L`과의 차이:** 기존 레시피는 “`attn_v`는 한 단계 올린다”처럼 사람이 정한 규칙이고, RCO는 모델마다 텐서별 타입을 최적화로 찾습니다. 그래서 파일명의 `IQ3_S`는 “평균 비트 등급”일 뿐, 내부는 여러 타입이 섞여 있습니다.

**제작 절차**

1. 모든 텐서를 후보 GGUF 타입 전부로 GSQ 양자화해 “텐서 변형 데이터베이스”를 만듭니다.
2. RCO가 목표 평균 bpw를 정확히 맞추는 텐서별 타입 조합을 찾습니다.
3. 선택된 변형을 하나의 표준 GGUF로 조립합니다. 배포본에는 텐서별 배정 결과(`rco-allocation.txt`)와 사용한 imatrix가 함께 제공됩니다.

**Qwen3.8-27B 결과** (BF16 53.8 GB 기준, [모델 카드](https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF))

| 파일 | 평균 bpw | 크기 | AIME25 | GPQA-D | LCB v6 |
| --- | --- | --- | --- | --- | --- |
| BF16 (원본) | 16 | 53.8 GB | 100.00 | 89.90 | 85.71 |
| GSQ-RCO IQ3\_S | 3.50 | 11.8 GB | 100.00 | 89.39 | 85.71 |
| GSQ-RCO IQ3\_XXS | 3.00 | 10.1 GB | 100.00 | 88.89 | 84.57 |
| GSQ-RCO IQ2\_S | 2.75 | 9.3 GB | 100.00 | 86.36 | 82.29 |
| GSQ-RCO IQ2\_XS | 2.50 | 8.4 GB | 96.67 | 84.85 | 76.57 |
| Unsloth UD-IQ2\_S (비교) | 2.49 | 8.4 GB | 86.67 | 76.26 | 72.00 |

- 같은 8.4 GB에서 GSQ-RCO IQ2\_XS가 기존 UD-IQ2\_S보다 세 추론 벤치마크 모두 앞섭니다. 저비트일수록 격차가 커집니다.
- 제작사는 IQ3\_S를 “작업 기준 무손실” 권장값으로 제시합니다. 다만 제작사 측정치이므로 중요한 용도에서는 직접 확인하세요.
- 단점은 제작 비용입니다. 텐서마다 모든 후보 타입을 학습·탐색하므로, 일반 `llama-quantize`보다 훨씬 많은 GPU 시간이 듭니다. 사용자는 배포된 파일을 받아 쓰는 것이 현실적입니다. (코드: [GSQ](https://github.com/IST-DASLab/GSQ), [RCO](https://github.com/IST-DASLab/RCO))

### 7-2. NVFP4 (NVIDIA Blackwell 4비트 부동소수점)

NVFP4는 정수가 아닌 4비트 **부동소수점**(E2M1) 값에 2단 스케일을 붙인 형식으로, Blackwell 5세대 텐서 코어가 이 형식 그대로 행렬 곱을 수행합니다. ([NVIDIA 블로그](https://developer.nvidia.com/blog/introducing-nvfp4-for-efficient-and-accurate-low-precision-inference))

$$
x = x_{\mathrm{E2M1}} \times s_{\mathrm{block}}^{(\mathrm{E4M3},\ 16\ \text{개당})} \times s_{\mathrm{global}}^{(\mathrm{FP32},\ \text{텐서당})}
$$

- **요소:** E2M1(부호 1, 지수 2, 가수 1비트)로 약 ±6 범위의 비균등 값을 표현합니다.
- **1차 스케일:** 16개마다 FP8(E4M3) 스케일 1개. 2의 거듭제곱만 되는 MXFP4(E8M0)와 달리 소수점 비율까지 표현해 블록 오차가 작습니다.
- **2차 스케일:** 텐서당 FP32 스케일 1개가 E4M3의 좁은 범위를 보완합니다. ([Transformer Engine 문서](https://nvidia.github.io/TransformerEngine/features/low_precision_training/nvfp4/nvfp4.html))
- **용량:** 4비트 + 16개당 8비트 스케일 = **4.5 bpw**로, Q4\_K(4.5 bpw)와 같습니다. K-Quants의 “슈퍼블록 스케일 + 서브블록 스케일”과 같은 2단 구조를 하드웨어 표준으로 만든 것이라고 볼 수 있습니다.

| 항목 | Q4\_K\_M (GGUF) | MXFP4 | NVFP4 |
| --- | --- | --- | --- |
| 요소 형식 | 4비트 정수 | E2M1 | E2M1 |
| 블록 크기 | 32 (슈퍼블록 256) | 32 | 16 |
| 블록 스케일 | 6비트 정수 + FP16 | E8M0 (2의 거듭제곱) | E4M3 FP8 + FP32 |
| 하드웨어 가속 | 범용 (CPU·GPU·Metal) | AMD MI300X 등 OCP 표준 | NVIDIA Blackwell |
| 활성값 4비트 연산 | 불가 (가중치만) | 가능 | 가능 (W4A4) |

**GGUF·llama.cpp 지원 현황** (2026년 11월 기준)

- 2026년 3\~4월 여러 PR로 `GGML_TYPE_NVFP4`(타입 ID 40)가 추가됐고, Blackwell 네이티브 경로(PR #22196)는 4월 말 병합됐습니다. ([InsiderLLM](https://insiderllm.com/guides/fp4-inference-llamacpp-nvfp4-mxfp4/), [mradermacher 토론](https://huggingface.co/mradermacher/model_requests/discussions/2605))
- **Blackwell(RTX 50, RTX PRO 6000, B200):** FP4 텐서 코어로 네이티브 가속. **Ada:** FP4 에뮬레이션, 작은 속도 이득. **Ampere 이하(A100, RTX 3090):** 메모리 절감만 있습니다.
- **Apple Metal:** NVFP4 행렬 곱이 Metal에서 돌지 않아 Mac에서는 사실상 쓰기 어렵습니다. ([OpenClaw](https://openclawdc.com/blog/nvfp4-vs-mxfp4-local-llm/))
- **만드는 법:** 주로 NVIDIA ModelOpt나 llm-compressor로 만든 NVFP4 safetensors 체크포인트를 `convert_hf_to_gguf.py`로 변환합니다. compressed-tensors 형식 변환은 아직 일부 PR 브랜치가 필요할 수 있습니다.
- **품질:** Q4\_K\_M 대비 독립 벤치마크는 아직 부족합니다. 한 30B 사례에서는 가중치만 NVFP4(W4A16)+GPTQ 보정이 perplexity +1.97%, 활성값까지 4비트(W4A4)면 +5.69%로, 같은 조건의 GGUF Q4\_K\_XL(+1.59%)보다 약간 낮았습니다. ([Muse-Glimmer-30B](https://huggingface.co/cloudnathan5/Muse-Glimmer-30B-NVFP4))
- **선택 기준:** Blackwell GPU에서 프롬프트 처리(prefill) 속도가 중요하거나, 원본이 NVFP4로 배포된 모델을 쓸 때 유리합니다. 그 외 환경에서는 Q4\_K\_M·IQ4\_XS가 여전히 무난합니다. GPU 서버에서 vLLM·TensorRT-LLM로 서빙한다면 GGUF를 거치지 않고 NVFP4 safetensors를 직접 쓰는 쪽이 일반적입니다.

## 참고 자료

- [llama.cpp — Tensor Encoding Schemes (공식 위키)](https://github.com/ggml-org/llama.cpp/wiki/Tensor-Encoding-Schemes)
- [llama.cpp — quantize README (Llama-3.1-8B 실측표)](https://git.peisongxiao.com/CS348Project/llama.cpp/src/tag/b6311/tools/quantize)
- [llama.cpp PR #4773 — SOTA 2-bit quants (E8 격자)](https://github.com/ggml-org/llama.cpp/pull/4773)
- [llama.cpp PR #4897 — 2-bit quantizations, imatrix 연동](https://cdn04132025.gitlink.org.cn/replica/llama.cpp/commit/147b17ac94a24d524e367cda26a9ff6245689f34)
- [GGUF File Format — llama.cpp 문서](https://mintlify.com/ggml-org/llama.cpp/concepts/gguf-format)
- [GGUF — Wikipedia](https://en.wikipedia.org/wiki/GGUF)
- [GGUF and the K-Quant Family — ZeroEntropy](https://www.zeroentropy.dev/concepts/gguf/)
- [LLM Deep Dive: Quantization Algorithms — AI Muninn](https://ai-muninn.com/en/blog/llm-deep-dive-quantization-algorithms)
- [GGUF Quant Names Explained — OpenClaw](https://openclawdc.com/blog/gguf-quant-names-explained/)
- [On llama.cpp quant names — rentry](https://rentry.co/llama-cpp-quants-or-fine-ill-do-it-myself-then-pt-2)
- [Benchmarks for lots of quantization types in llama.cpp](https://beebopkim.github.io/2024/03/09/Benchmarks-for-lots-of-quantization-types-in-llama-cpp)
- [위키독스](https://wikidocs.net/365766) · [IBM: GGUF vs GGML](https://www.ibm.com/kr-ko/think/topics/gguf-versus-ggml) · [호프트 티스토리](https://hoft.tistory.com/entry/llm-quantization-gptq-awq-gguf-beginner-guide) · [다모앙](https://damoang.net/free/5300197) · [YouTube 해설](https://www.youtube.com/watch?v=vW30o4U9BFE) (원문 출처)

**GSQ-RCO·NVFP4 추가 자료**

- [ISTA-DASLab Qwen3.8-27B-GSQ-RCO-GGUF 모델 카드](https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF)
- [GSQ 논문 (arXiv 2604.18556)](https://arxiv.org/abs/2604.18556) · [RCO 논문 (arXiv 2605.00649)](https://arxiv.org/abs/2605.00649)
- [What Are GSQ and RCO? — MindStudio](https://www.mindstudio.ai/blog/what-is-gsq-rco-quantization/)
- [Introducing NVFP4 — NVIDIA 개발자 블로그](https://developer.nvidia.com/blog/introducing-nvfp4-for-efficient-and-accurate-low-precision-inference)
- [NVFP4 — Transformer Engine 문서](https://nvidia.github.io/TransformerEngine/features/low_precision_training/nvfp4/nvfp4.html)
- [FP4 Just Landed in llama.cpp — InsiderLLM](https://insiderllm.com/guides/fp4-inference-llamacpp-nvfp4-mxfp4/)
- [NVFP4 vs MXFP4 — OpenClaw](https://openclawdc.com/blog/nvfp4-vs-mxfp4-local-llm/)
- [Muse-Glimmer-30B-NVFP4 (품질 비교 사례)](https://huggingface.co/cloudnathan5/Muse-Glimmer-30B-NVFP4)
