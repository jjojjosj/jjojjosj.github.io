---
title: "Python collections 모듈"
date: 2020-08-17 20:26:00 +0900
categories: [Python]
---

## Python collections 모듈

파이썬은 여러 가지 내장 모듈을 포함하고 있지만, 그 중에서도 collections 모듈은 다양한 타입의 자료구조를 지원하는 모듈입니다.

아래 링크는 파이썬 3.7의 collections 모듈에 대한 공식 문서 입니다ㅣ.

<https://docs.python.org/ko/3.7/library/collections.html>

collections 모듈은 다음과 같은 클래스가 있습니다.

- namedtuple() : 튜플 서브클래스를 네임드 필드와 함께 만들기 위한 factory fuction
- deque : 리스트와 비슷한 빠른 append, pop이 가능한 컨테이너
- ChainMap : 딕셔너리와 비슷한 다중 매핑의 단일 뷰를 만드는 클래스
- Counter : 해시 가능한 객체를 셀 수 있는 딕셔너리 서브클래스
- OrderedDict : 입력된 순서를 기억하는 딕셔너리 서브클래스
- defaultdict : 빠진 값을 보충하는 factory function을 호출하는 딕셔너리 서브클래스
- UserDict : 딕셔너리 서브클래싱을 쉽게 하기 위한 딕셔너리 래퍼(wrapper)
- UserList 리스트 서브클래싱을 쉽게 하기 위한 리스트 래퍼(wrapper)
- UserString : 스트링 서브클래싱을 쉽게 하기 위한 스트링 래퍼(wrapper)

여기서는 collections의 내용만 나열하고, 다음에는 하나씩 정리하는 포스트를 올릴 예정입니다.
