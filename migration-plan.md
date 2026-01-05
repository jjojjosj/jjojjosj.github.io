# Jekyll → Next.js 마이그레이션 계획

## 현재 상태 분석

### 콘텐츠 현황
- **포스트**: 18개 (2019~2023)
- **카테고리**: IT, Python
- **페이지**: About, Categories, Tags, 404
- **이미지**: 3개 (user.png, linkedlist.png, node.png)

### 주요 기능
- ✅ Markdown 포스트
- ✅ 카테고리/태그 시스템
- ✅ Lunr.js 검색
- ✅ Disqus 댓글 (shortname: jjojjosj-github-io)
- ✅ Table of Contents
- ✅ 읽기 시간 표시
- ✅ 페이지네이션 (5개/페이지)
- ✅ 작성자 프로필
- ✅ 소셜 공유

## 마이그레이션 전략

### Phase 1: 프로젝트 초기 설정

#### 1.1 Next.js 프로젝트 생성
```bash
# 새 브랜치 생성
git checkout -b nextjs-migration

# Next.js 프로젝트 초기화 (App Router 사용)
npx create-next-app@latest . --typescript --tailwind --app --src-dir
```

**선택 옵션:**
- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- src/ directory: Yes
- App Router: Yes
- Import alias: Yes (@/*)

#### 1.2 필수 패키지 설치
```bash
npm install gray-matter remark remark-html remark-gfm rehype-highlight reading-time date-fns
npm install -D @types/node
```

**추가 검토 필요 패키지:**
```bash
# 검색 기능
npm install flexsearch  # 또는 Lunr.js 유지

# 댓글 시스템
npm install disqus-react

# TOC 생성
npm install remark-toc rehype-slug rehype-autolink-headings

# 코드 하이라이팅
npm install rehype-pretty-code shiki

# RSS 피드
npm install feed

# 사이트맵
npm install next-sitemap
```

### Phase 2: 프로젝트 구조 설계

```
jjojjosj.github.io/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # 루트 레이아웃
│   │   ├── page.tsx                      # 홈페이지 (포스트 목록)
│   │   ├── about/
│   │   │   └── page.tsx                  # About 페이지
│   │   ├── posts/
│   │   │   ├── page.tsx                  # 전체 포스트 목록
│   │   │   ├── [slug]/
│   │   │   │   └── page.tsx              # 포스트 상세
│   │   │   └── page/
│   │   │       └── [page]/page.tsx       # 페이지네이션
│   │   ├── categories/
│   │   │   ├── page.tsx                  # 카테고리 목록
│   │   │   └── [category]/page.tsx       # 카테고리별 포스트
│   │   ├── tags/
│   │   │   ├── page.tsx                  # 태그 목록
│   │   │   └── [tag]/page.tsx            # 태그별 포스트
│   │   ├── search/
│   │   │   └── page.tsx                  # 검색 페이지
│   │   ├── api/
│   │   │   └── search/route.ts           # 검색 API (선택사항)
│   │   ├── not-found.tsx                 # 404 페이지
│   │   └── globals.css
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Navigation.tsx
│   │   ├── post/
│   │   │   ├── PostCard.tsx              # 포스트 카드
│   │   │   ├── PostHeader.tsx            # 포스트 헤더
│   │   │   ├── PostContent.tsx           # 포스트 콘텐츠
│   │   │   ├── PostMeta.tsx              # 메타 정보
│   │   │   ├── TableOfContents.tsx       # TOC
│   │   │   ├── ReadingTime.tsx           # 읽기 시간
│   │   │   └── RelatedPosts.tsx          # 관련 포스트
│   │   ├── common/
│   │   │   ├── AuthorProfile.tsx         # 작성자 프로필
│   │   │   ├── Comments.tsx              # Disqus 댓글
│   │   │   ├── SocialShare.tsx           # 소셜 공유
│   │   │   ├── Pagination.tsx            # 페이지네이션
│   │   │   ├── SearchBar.tsx             # 검색바
│   │   │   └── TagList.tsx               # 태그 목록
│   │   └── mdx/
│   │       └── MDXComponents.tsx         # 커스텀 MDX 컴포넌트
│   ├── lib/
│   │   ├── posts.ts                      # 포스트 데이터 처리
│   │   ├── markdown.ts                   # Markdown 파싱
│   │   ├── categories.ts                 # 카테고리 처리
│   │   ├── tags.ts                       # 태그 처리
│   │   ├── search.ts                     # 검색 로직
│   │   ├── utils.ts                      # 유틸리티 함수
│   │   └── constants.ts                  # 상수
│   └── types/
│       └── post.ts                       # TypeScript 타입 정의
├── content/
│   └── posts/                            # Markdown 포스트 (기존 _posts 이동)
│       ├── 2019-01-12-1st-post.md
│       └── ...
├── public/
│   ├── assets/
│   │   └── img/                          # 이미지 파일 (기존 assets/img 이동)
│   ├── favicon.ico
│   └── robots.txt
├── next.config.js
├── next-sitemap.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### Phase 3: 콘텐츠 마이그레이션

#### 3.1 포스트 파일 이동
```bash
# _posts → content/posts
mkdir -p content/posts
cp _posts/*.md content/posts/
cp _posts/*.markdown content/posts/
```

#### 3.2 Front Matter 형식 유지
**현재 형식 (Jekyll):**
```yaml
---
title: "포스트 제목"
date: 2023-01-29 12:30:00 +0900
categories: IT
tags: [react, javascript]
toc: true
toc_sticky: true
---
```

**Next.js에서도 동일하게 사용 가능** (gray-matter로 파싱)

#### 3.3 이미지 및 리소스 이동
```bash
# assets/img → public/assets/img
mkdir -p public/assets/img
cp assets/img/*.png public/assets/img/
```

**마크다운 이미지 경로 업데이트:**
- 기존: `/assets/img/image.png`
- 유지: `/assets/img/image.png` (public이 루트)

### Phase 4: 핵심 기능 구현

#### 4.1 Markdown 파싱 (`lib/markdown.ts`)
```typescript
import { remark } from 'remark';
import html from 'remark-html';
import gfm from 'remark-gfm';
import remarkToc from 'remark-toc';
import rehypeHighlight from 'rehype-highlight';

export async function markdownToHtml(markdown: string) {
  const result = await remark()
    .use(gfm)
    .use(remarkToc)
    .use(html)
    .process(markdown);

  return result.toString();
}
```

#### 4.2 포스트 데이터 처리 (`lib/posts.ts`)
```typescript
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';

const postsDirectory = path.join(process.cwd(), 'content/posts');

export interface Post {
  slug: string;
  title: string;
  date: string;
  categories?: string[];
  tags?: string[];
  toc?: boolean;
  content: string;
  readingTime: string;
  excerpt?: string;
}

export function getAllPosts(): Post[] {
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter(fileName => fileName.endsWith('.md') || fileName.endsWith('.markdown'))
    .map(fileName => {
      const slug = fileName.replace(/\.(md|markdown)$/, '');
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);

      return {
        slug,
        content,
        readingTime: readingTime(content).text,
        ...data,
      } as Post;
    });

  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): Post | null {
  // 구현...
}

export function getPostsByCategory(category: string): Post[] {
  // 구현...
}

export function getPostsByTag(tag: string): Post[] {
  // 구현...
}
```

#### 4.3 카테고리/태그 처리
```typescript
// lib/categories.ts
export function getAllCategories() {
  const posts = getAllPosts();
  const categories = new Set<string>();

  posts.forEach(post => {
    if (post.categories) {
      post.categories.forEach(cat => categories.add(cat));
    }
  });

  return Array.from(categories);
}

// lib/tags.ts - 유사한 로직
```

#### 4.4 검색 기능
**옵션 1: Lunr.js 유지**
```typescript
// lib/search.ts
import lunr from 'lunr';

export function createSearchIndex(posts: Post[]) {
  return lunr(function() {
    this.ref('slug');
    this.field('title');
    this.field('content');
    this.field('tags');

    posts.forEach(post => {
      this.add(post);
    });
  });
}
```

**옵션 2: FlexSearch (더 빠름)**
```typescript
import { Index } from 'flexsearch';
```

#### 4.5 Table of Contents
```typescript
// components/post/TableOfContents.tsx
// remark-toc로 자동 생성하거나
// 클라이언트 사이드에서 헤딩 추출
```

#### 4.6 댓글 시스템
```typescript
// components/common/Comments.tsx
import { DiscussionEmbed } from 'disqus-react';

export function Comments({ slug, title }: { slug: string; title: string }) {
  const disqusConfig = {
    url: `https://jjojjosj.github.io/posts/${slug}`,
    identifier: slug,
    title: title,
  };

  return (
    <DiscussionEmbed
      shortname="jjojjosj-github-io"
      config={disqusConfig}
    />
  );
}
```

### Phase 5: 페이지 구현

#### 5.1 홈페이지 (`app/page.tsx`)
```typescript
import { getAllPosts } from '@/lib/posts';
import PostCard from '@/components/post/PostCard';
import Pagination from '@/components/common/Pagination';

export default async function Home() {
  const allPosts = getAllPosts();
  const postsPerPage = 5;
  const posts = allPosts.slice(0, postsPerPage);

  return (
    <main>
      <div className="posts-grid">
        {posts.map(post => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
      <Pagination currentPage={1} totalPages={Math.ceil(allPosts.length / 5)} />
    </main>
  );
}
```

#### 5.2 포스트 상세 (`app/posts/[slug]/page.tsx`)
```typescript
import { getAllPosts, getPostBySlug } from '@/lib/posts';
import { markdownToHtml } from '@/lib/markdown';
import TableOfContents from '@/components/post/TableOfContents';
import Comments from '@/components/common/Comments';

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map(post => ({
    slug: post.slug,
  }));
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  const content = await markdownToHtml(post.content);

  return (
    <article>
      <PostHeader post={post} />
      {post.toc && <TableOfContents />}
      <div dangerouslySetInnerHTML={{ __html: content }} />
      <Comments slug={post.slug} title={post.title} />
    </article>
  );
}
```

#### 5.3 카테고리 페이지 (`app/categories/[category]/page.tsx`)
```typescript
import { getAllCategories, getPostsByCategory } from '@/lib/categories';

export async function generateStaticParams() {
  const categories = getAllCategories();
  return categories.map(category => ({
    category: category,
  }));
}

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const posts = getPostsByCategory(params.category);

  return (
    <div>
      <h1>{params.category}</h1>
      <PostList posts={posts} />
    </div>
  );
}
```

### Phase 6: 스타일링

#### 6.1 Tailwind CSS 설정
```javascript
// tailwind.config.ts
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Minimal Mistakes 'mint' 스킨 색상 재현
        primary: '#44b78b',
        background: '#f3f6f6',
        // ...
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'), // prose 클래스
  ],
}
```

#### 6.2 Typography 플러그인
```tsx
<article className="prose prose-lg max-w-none">
  {/* 마크다운 콘텐츠 */}
</article>
```

### Phase 7: SEO 및 메타데이터

#### 7.1 메타데이터 생성
```typescript
// app/posts/[slug]/page.tsx
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      authors: ['jjojjosj'],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
    },
  };
}
```

#### 7.2 사이트맵 생성
```javascript
// next-sitemap.config.js
module.exports = {
  siteUrl: 'https://jjojjosj.github.io',
  generateRobotsTxt: true,
  changefreq: 'weekly',
  priority: 0.7,
}
```

```json
// package.json
{
  "scripts": {
    "postbuild": "next-sitemap"
  }
}
```

#### 7.3 RSS 피드
```typescript
// app/feed.xml/route.ts
import { Feed } from 'feed';
import { getAllPosts } from '@/lib/posts';

export async function GET() {
  const posts = getAllPosts();

  const feed = new Feed({
    title: 'jjojjosj의 일상다반사',
    description: 'jjojjosj의 길고도 짧은 소소한 이야기들',
    id: 'https://jjojjosj.github.io',
    link: 'https://jjojjosj.github.io',
    language: 'ko',
    // ...
  });

  posts.forEach(post => {
    feed.addItem({
      title: post.title,
      id: `https://jjojjosj.github.io/posts/${post.slug}`,
      link: `https://jjojjosj.github.io/posts/${post.slug}`,
      date: new Date(post.date),
      // ...
    });
  });

  return new Response(feed.rss2(), {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
```

### Phase 8: 배포 설정

#### 8.1 GitHub Pages 설정
**옵션 1: GitHub Actions (추천)**

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [nextjs-migration]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Export static files
        run: npm run export

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./out
```

**next.config.js 설정:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Static HTML export
  images: {
    unoptimized: true,  // GitHub Pages는 Image Optimization 미지원
  },
  basePath: '',  // 또는 '/repository-name' (커스텀 도메인이 아닌 경우)
  trailingSlash: true,
}

module.exports = nextConfig
```

#### 8.2 Static Export
```json
// package.json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "export": "next export",
    "deploy": "npm run build && npm run export"
  }
}
```

### Phase 9: 테스트 및 검증

#### 9.1 체크리스트
- [ ] 모든 포스트가 정상적으로 표시되는가?
- [ ] 카테고리/태그 필터링이 작동하는가?
- [ ] 검색 기능이 작동하는가?
- [ ] 댓글이 정상적으로 로드되는가?
- [ ] TOC가 올바르게 생성되는가?
- [ ] 읽기 시간이 정확한가?
- [ ] 페이지네이션이 작동하는가?
- [ ] 이미지가 정상적으로 표시되는가?
- [ ] 모바일에서 반응형이 잘 작동하는가?
- [ ] SEO 메타태그가 올바른가?
- [ ] 사이트맵이 생성되는가?
- [ ] RSS 피드가 작동하는가?

#### 9.2 성능 최적화
- [ ] Lighthouse 점수 확인 (Performance, SEO, Accessibility)
- [ ] Core Web Vitals 최적화
- [ ] 이미지 최적화 (WebP 변환)
- [ ] 코드 스플리팅 확인
- [ ] 번들 사이즈 최적화

### Phase 10: 마이그레이션 완료

#### 10.1 최종 배포
```bash
# 빌드 및 테스트
npm run build
npm run export

# 로컬 테스트
npx serve out

# 배포 (GitHub Actions 자동화 또는 수동)
git add .
git commit -m "feat: migrate to Next.js"
git push origin nextjs-migration

# PR 생성 및 머지
gh pr create --title "Migrate to Next.js" --base master
```

#### 10.2 기존 Jekyll 백업
```bash
# 기존 Jekyll 설정 백업
git checkout -b jekyll-backup
git push origin jekyll-backup
```

## 예상 타임라인

| Phase | 작업 내용 | 예상 시간 |
|-------|----------|---------|
| 1 | 프로젝트 초기 설정 | 1일 |
| 2 | 프로젝트 구조 설계 | 1일 |
| 3 | 콘텐츠 마이그레이션 | 1일 |
| 4 | 핵심 기능 구현 | 3일 |
| 5 | 페이지 구현 | 2일 |
| 6 | 스타일링 | 2일 |
| 7 | SEO 및 메타데이터 | 1일 |
| 8 | 배포 설정 | 1일 |
| 9 | 테스트 및 검증 | 2일 |
| 10 | 마이그레이션 완료 | 1일 |
| **총계** | | **약 15일** |

## 고려사항 및 의사결정 포인트

### 1. 스타일링 방법
- **옵션 A**: Tailwind CSS (추천)
  - 장점: 빠른 개발, 유틸리티 우선, 번들 사이즈 최적화
  - 단점: 클래스명이 길어질 수 있음
- **옵션 B**: CSS Modules
  - 장점: 전통적인 CSS, 컴포넌트 스코핑
  - 단점: 추가 파일 관리 필요
- **옵션 C**: Styled Components / Emotion
  - 장점: CSS-in-JS, 동적 스타일링
  - 단점: 런타임 오버헤드, SSR 복잡도

### 2. 검색 엔진
- **옵션 A**: Lunr.js (기존 유지)
  - 장점: 이미 익숙함, 클라이언트 사이드
  - 단점: 인덱스 크기 증가 시 성능 저하
- **옵션 B**: FlexSearch
  - 장점: 더 빠른 성능, 작은 번들 사이즈
  - 단점: 마이그레이션 필요
- **옵션 C**: Algolia
  - 장점: 강력한 기능, 빠른 속도
  - 단점: 유료 (무료 플랜 제한적), 외부 의존성

### 3. MDX vs Markdown
- **Markdown (추천)**: 현재 콘텐츠 유지, 간단함
- **MDX**: React 컴포넌트 사용 가능, 더 유연함

### 4. 이미지 최적화
- GitHub Pages는 Next.js Image Optimization API 미지원
- 대안: 빌드 타임에 이미지 최적화 또는 외부 CDN 사용

### 5. 댓글 시스템 대안
- Disqus (기존 유지)
- Giscus (GitHub Discussions 기반)
- Utterances (GitHub Issues 기반)

## 롤백 계획

마이그레이션 중 문제 발생 시:
1. `jekyll-backup` 브랜치로 롤백
2. GitHub Pages 설정에서 브랜치 변경
3. 문제 해결 후 재시도

## 다음 단계

1. **의사결정**: 위의 옵션들에 대해 선택
2. **Phase 1 시작**: Next.js 프로젝트 초기화
3. **점진적 마이그레이션**: 한 번에 하나씩 구현 및 테스트

---

**질문이나 추가 고려사항이 있으시면 알려주세요!**
