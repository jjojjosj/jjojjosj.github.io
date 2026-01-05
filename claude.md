# Claude.md

## 프로젝트 개요

이 프로젝트는 Jekyll 정적 사이트 생성기를 사용하는 개인 블로그입니다.

### 기술 스택
- **프레임워크**: Jekyll
- **테마**: minimal-mistakes (버전 4.24.0)
- **스킨**: mint
- **Markdown 엔진**: kramdown
- **댓글 시스템**: Disqus

### 사이트 정보
- **제목**: jjojjosj의 일상다반사
- **설명**: jjojjosj의 길고도 짧은 소소한 이야기들
- **URL**: https://jjojjosj.github.io
- **타임존**: Asia/Seoul

### 주요 플러그인
- jekyll-paginate
- jekyll-sitemap
- jekyll-gist
- jekyll-feed
- jemoji
- jekyll-include-cache

### 디렉토리 구조
```
.
├── _config.yml          # Jekyll 설정 파일
├── _data/              # 데이터 파일
├── _includes/          # 재사용 가능한 HTML 조각
├── _layouts/           # 페이지 레이아웃
├── _pages/             # 정적 페이지
├── _posts/             # 블로그 포스트
├── _sass/              # SASS 스타일시트
├── assets/             # 이미지, CSS, JS 등
├── index.html          # 메인 페이지
└── 404.html            # 404 에러 페이지
```

### 기능
- 페이지네이션 (페이지당 5개 포스트)
- 검색 기능
- 카테고리 및 태그 아카이브
- 작성자 프로필
- 댓글 시스템
- 읽기 시간 표시
- 관련 포스트 추천

### 작성자 정보
- **이름**: jjojjosj
- **소개**: 개발을 취미(목표)로 하는 인프라 엔지니어
- **위치**: Somewhere, South Korea
- **GitHub**: https://github.com/jjojjosj

### 로컬 개발 환경 실행
```bash
bundle exec jekyll serve
```

### Git 관리
- **현재 브랜치**: next
- **메인 브랜치**: master
