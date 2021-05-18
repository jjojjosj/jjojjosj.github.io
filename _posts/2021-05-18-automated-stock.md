---
title: "주식투자 파이썬 자동화 도전"
date: 2021-05-18 17:00:00 +0900
categories: [life]
toc: true
toc_sticky: true
toc_label: "My Table of Contents"
---

## 주식투자 파이썬 자동화 프로젝트

개인적으로 데이터 분석과 파이썬 등 여러가지를 합쳐서 일상에 도움이 되는 프로젝트(+수익 창출)가 무엇이 있을까 고민하다가, 주식 투자를 파이썬으로 자동화해보면 좋겠다고 생각했다.

1. 증권사 API를 통한 주식투자 자동화
2. 주식투자 알고리즘 최적화 기법 공부
3. 머신러닝/딥러닝 기반 주식투자 알고리즘 최적화(최종 골)

위의 단계로 주식투자를 하다 보면, 언젠가는 약간의 수익을 낼 수도 있지 않을까 하는 희망을 가져본다.

## 주식 투자를 위한 증권사 API

증권사 API에는 많은 종류가 있는데, 그 중 나는 대신증권 API를 쓰기로 했다. (계좌개설 하고 보니 대신증권은 CYBOS와 크레온 두 종류가 있었는데, 지금은 일단 CYBOS로 만들게 되었다. 크레온이 더 최신이라고 하는데, 나중에 바꾸게 될지도 모르지만 지금은 그냥 쓴다.)

## 개발환경
CYBOS API 는 32bit 파이썬을 관리자 권한 모드로 실행해야만 한다.

아래의 과정들을 거쳐 개발환경을 구성하였다. 증권사 로그인 시 보안프로그램이 많이 깔리므로, 메인 PC에서 진행하지 않고 별도의 가상머신 윈도우 환경에서 설치하였다.

1. CYBOS 프로그램 설치
2. Miniconda 32bit 환경을 설치
3. 코드 버전 관리를 위한 윈도우 Git 설치
4. 코드 개발을 편리하게 하기 위한 VSCode 설치

모두 설치하고 CYBOS plus에 로그인한 뒤, 파이썬 쪽에서는 win32com.client 모듈을 사용하기 위해서 다음의 명령어를 입력한다.

```bash
pip install pywin32
```

## 앞으로 할 일
아직 API를 상세히 공부하지는 못했지만 다음의 과정들을 공부해볼 예정이다. 

1. 주가 정보를 가져와서 pandas 데이터프레임을 활용하여 관리
2. matplotlib로 일부 정보에 대한 그래프 출력
3. scikit-learn으로 머신 러닝 기반 알고리즘 적용
4. 모의투자를 활용해서 알고리즘 테스트
5. 소액 자금 기반으로 실제 수익률 검증

언제 할 수 있을지는 모르겠지만 시작이 반이라고, 벌써 50%를 한 거니까 이제 나머지 50%만 하면 되겠지...