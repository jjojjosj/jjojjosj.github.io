# jjojjosj의 일상다반사

> jjojjosj의 길고도 짧은 소소한 이야기들

개인 블로그입니다. Jekyll에서 Next.js로 마이그레이션했습니다.

🔗 **사이트**: https://jjojjosj.github.io

## 기술 스택

- **프레임워크**: [Next.js 16.1.1](https://nextjs.org) (App Router)
- **언어**: [TypeScript](https://www.typescriptlang.org/)
- **스타일링**: [Tailwind CSS 4.0](https://tailwindcss.com/)
- **Markdown**: [remark](https://remark.js.org/) & [rehype](https://rehype.js.org/)
- **검색**: [Lunr.js](https://lunrjs.com/)
- **댓글**: [Disqus](https://disqus.com/)
- **테스팅**: [Playwright](https://playwright.dev/)
- **배포**: GitHub Pages (Static Export)

## 주요 기능

✨ **정적 사이트 생성 (SSG)** - 빠른 로딩과 SEO 최적화
📄 **Markdown 기반 포스팅** - 편리한 글쓰기
🔍 **전체 텍스트 검색** - Lunr.js 기반 클라이언트 사이드 검색
📑 **인터랙티브 목차** - 스크롤에 따라 하이라이트되는 ToC
🏷️ **카테고리 & 태그** - 체계적인 포스트 분류
💬 **댓글 시스템** - Disqus 통합
📱 **반응형 디자인** - 모든 기기에서 최적화된 경험
⏱️ **읽기 시간 표시** - 자동 계산
🔗 **관련 포스트 추천** - 카테고리 기반 추천

## 시작하기

### 개발 환경 설정

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 프로덕션 빌드

```bash
# 정적 사이트 빌드
npm run build

# 빌드된 사이트 미리보기
npm start
```

빌드 결과물은 `out/` 디렉토리에 생성됩니다.

### 테스트

```bash
# E2E 테스트 실행
npm test

# UI 모드로 테스트
npm run test:ui
```

## 프로젝트 구조

```
.
├── src/
│   ├── app/              # Next.js App Router 페이지
│   ├── components/       # React 컴포넌트
│   ├── lib/              # 유틸리티 함수
│   ├── content/posts/    # Markdown 포스트
│   └── types/            # TypeScript 타입
├── public/               # 정적 파일 (이미지 등)
├── tests/                # Playwright E2E 테스트
└── out/                  # 빌드 출력
```

## 새 포스트 작성하기

1. `src/content/posts/` 디렉토리에 새 Markdown 파일 생성
2. 파일명 형식: `YYYY-MM-DD-title.md`
3. Front matter 작성:

```markdown
---
title: "포스트 제목"
date: 2024-01-01
categories: [IT, Python]
tags: [nextjs, typescript, blog]
toc: true
---

포스트 내용을 여기에 작성하세요...
```

4. 이미지는 `public/assets/images/` 디렉토리에 저장
5. 개발 서버에서 확인 후 커밋

## 배포

GitHub Pages로 자동 배포됩니다.

1. `master` 브랜치에 푸시
2. GitHub Actions가 자동으로 빌드 및 배포
3. https://jjojjosj.github.io 에서 확인

## 작성자

**jjojjosj**
개발을 취미(목표)로 하는 인프라 엔지니어

- GitHub: [@jjojjosj](https://github.com/jjojjosj)
- Blog: [jjojjosj.github.io](https://jjojjosj.github.io)

## 라이선스

개인 블로그 프로젝트입니다.

---

Built with ❤️ using Next.js
