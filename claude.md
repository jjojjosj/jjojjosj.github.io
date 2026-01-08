# Claude.md

# Development Workflow

**Always use bun, not npm.**

Here are the specific commands:

1. Install dependencies: `bun install`
2. Run the development server: `bun run dev`
3. Run tests: `bun run test`
4. Typecheck: `bun run typecheck`

## 프로젝트 개요

이 프로젝트는 Next.js를 사용하는 개인 블로그입니다. (Jekyll에서 마이그레이션됨)

### 기술 스택

- **프레임워크**: Next.js 16.1.1 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS 4.0
- **Markdown 처리**: gray-matter, remark, rehype
- **검색**: Lunr.js
- **댓글 시스템**: Disqus
- **테스팅**: Playwright
- **배포**: Static Export (GitHub Pages)

### 사이트 정보

- **제목**: jjojjosj의 일상다반사
- **설명**: jjojjosj의 길고도 짧은 소소한 이야기들
- **URL**: https://jjojjosj.github.io
- **타임존**: Asia/Seoul

### 주요 라이브러리

- **Markdown**: remark, remark-gfm, remark-rehype
- **HTML 처리**: rehype-slug, rehype-highlight, rehype-autolink-headings, rehype-stringify
- **유틸리티**: date-fns (날짜 포맷), reading-time (읽기 시간 계산)
- **검색**: lunr (클라이언트 사이드 전체 텍스트 검색)
- **Sitemap**: next-sitemap

### 디렉토리 구조

```
.
├── src/
│   ├── app/                    # Next.js App Router 페이지
│   │   ├── layout.tsx          # 루트 레이아웃
│   │   ├── page.tsx            # 홈페이지
│   │   ├── posts/[slug]/       # 포스트 상세 페이지
│   │   ├── categories/         # 카테고리 페이지
│   │   ├── tags/               # 태그 페이지
│   │   ├── page/[page]/        # 페이지네이션
│   │   ├── about/              # About 페이지
│   │   ├── search/             # 검색 페이지
│   │   └── api/                # API 라우트
│   ├── components/             # React 컴포넌트
│   │   ├── layout/             # 레이아웃 컴포넌트
│   │   ├── post/               # 포스트 관련 컴포넌트
│   │   └── common/             # 공통 컴포넌트
│   ├── lib/                    # 유틸리티 함수
│   │   ├── posts.ts            # 포스트 데이터 처리
│   │   ├── markdown.ts         # Markdown 변환
│   │   ├── categories.ts       # 카테고리 처리
│   │   ├── tags.ts             # 태그 처리
│   │   ├── search.ts           # 검색 인덱스
│   │   └── utils.ts            # 유틸리티
│   ├── content/
│   │   └── posts/              # Markdown 포스트 파일
│   └── types/                  # TypeScript 타입 정의
├── public/                     # 정적 파일
│   └── assets/                 # 이미지 등
├── tests/                      # Playwright E2E 테스트
├── out/                        # 빌드 출력 (정적 사이트)
├── next.config.ts              # Next.js 설정
├── tailwind.config.ts          # Tailwind CSS 설정
└── package.json                # 프로젝트 의존성
```

### 핵심 기능

- **정적 사이트 생성 (SSG)**: 모든 페이지를 빌드 타임에 사전 렌더링
- **페이지네이션**: 페이지당 5개 포스트
- **검색 기능**: Lunr.js를 사용한 클라이언트 사이드 전체 텍스트 검색
- **카테고리 및 태그**: 포스트 분류 및 필터링
- **목차 (ToC)**: 포스트 상세 페이지 오른쪽에 고정된 인터랙티브 목차
- **작성자 프로필**: About 페이지
- **댓글 시스템**: Disqus 통합
- **읽기 시간 표시**: 자동 계산
- **관련 포스트 추천**: 카테고리 기반
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 최적화
- **코드 하이라이팅**: rehype-highlight
- **Sitemap & RSS**: SEO 최적화

### 작성자 정보

- **이름**: jjojjosj
- **소개**: 개발을 취미(목표)로 하는 인프라 엔지니어
- **위치**: Somewhere, South Korea
- **GitHub**: https://github.com/jjojjosj

### 로컬 개발 환경

#### 개발 서버 실행

```bash
npm install
npm run dev
```

http://localhost:3000 에서 확인

#### 프로덕션 빌드

```bash
npm run build
npm start
```

#### 테스트 실행

```bash
npm test                # Playwright E2E 테스트
npm run test:ui        # UI 모드로 테스트
```

### Git 관리

- **현재 브랜치**: nextjs-migration
- **메인 브랜치**: master

### 배포

- **플랫폼**: GitHub Pages
- **방식**: GitHub Actions를 통한 자동 빌드 및 배포
- **출력 디렉토리**: `out/` (Next.js static export)

### 주의사항

- 새 포스트는 `src/content/posts/` 디렉토리에 Markdown 형식으로 작성
- 이미지는 `public/assets/images/` 디렉토리에 저장
- 포스트 파일명 형식: `YYYY-MM-DD-title.md`
- Front matter에 `title`, `date`, `categories`, `tags` 필수 포함
