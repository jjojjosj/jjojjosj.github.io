---
title: "아나콘다 주요 명령어 모음"
date: 2019-11-16 09:43:00 +0900
categories: [IT]
---

아나콘다 명령어는 자주 쓰는 것이 아니라서 매번 헷갈린다.

주요 명령어를 정리해봤다.

#### 가상 환경 생성

작업 환경 이름은 -n 옵션으로 설정하고, python 버전은 python= 뒤에 숫자로 쓴다. 그 뒤에 인자들은 설치할 모듈들의 이름이다.

```bash
$ conda create -n myenv python=3.7 numpy scipy matplotlib pandas seaborn
```

#### 가상 환경 목록 확인

```bash
$ conda env list
```

#### 가상 환경 실행

```bash
$ conda activate myenv
```

#### 가상 환경 종료

```bash
$ conda deactivate
```
