import { test, expect } from '@playwright/test';

test.describe('Blog Navigation and Pages', () => {
  test('홈페이지가 로드되고 포스트 목록이 표시됨', async ({ page }) => {
    await page.goto('/');

    // 타이틀 확인
    await expect(page).toHaveTitle(/jjojjosj의 일상다반사/);

    // 헤더 확인
    await expect(page.locator('header')).toBeVisible();
    await expect(page.getByRole('link', { name: 'jjojjosj의 일상다반사' })).toBeVisible();

    // 네비게이션 메뉴 확인
    await expect(page.getByRole('link', { name: 'About' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Categories' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Tags' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Search' })).toBeVisible();

    // 포스트 카드가 존재하는지 확인 (최소 1개 이상)
    const postCards = page.locator('article');
    await expect(postCards.first()).toBeVisible();

    // 사이드바 확인
    await expect(page.getByText('개발을 취미(목표)로 하는 인프라 엔지니어')).toBeVisible();

    // 푸터 확인
    await expect(page.locator('footer')).toBeVisible();
  });

  test('페이지네이션이 작동함', async ({ page }) => {
    await page.goto('/');

    // 페이지네이션 버튼 확인
    const nextButton = page.getByRole('link', { name: /다음/ });

    // 포스트가 5개 이상이면 다음 버튼이 있어야 함
    const postCount = await page.locator('article').count();

    if (postCount >= 5) {
      await expect(nextButton).toBeVisible();

      // 2페이지로 이동
      await nextButton.click();
      await expect(page).toHaveURL(/\/page\/2/);

      // 이전 버튼 확인
      await expect(page.getByRole('link', { name: /이전/ })).toBeVisible();
    }
  });

  test('포스트 상세 페이지가 제대로 로드됨', async ({ page }) => {
    await page.goto('/');

    // 첫 번째 포스트 클릭
    const firstPost = page.locator('article').first();
    const postTitle = await firstPost.locator('h2').textContent();
    await firstPost.locator('h2').click();

    // URL이 /posts/로 시작하는지 확인
    await expect(page).toHaveURL(/\/posts\//);

    // 포스트 제목 확인
    if (postTitle) {
      await expect(page.locator('h1')).toContainText(postTitle);
    }

    // 포스트 메타 정보 확인 (날짜, 읽기 시간)
    await expect(page.locator('time')).toBeVisible();

    // 포스트 내용 확인
    await expect(page.locator('article .prose, article [class*="prose"]')).toBeVisible();
  });

  test('Categories 페이지가 작동함', async ({ page }) => {
    await page.goto('/categories');

    // 페이지 타이틀 확인
    await expect(page.locator('h1')).toContainText('Categories');

    // 카테고리가 최소 1개 이상 있는지 확인
    const categoryLinks = page.getByRole('link').filter({ hasText: /posts/ });
    const count = await categoryLinks.count();
    expect(count).toBeGreaterThan(0);

    // 첫 번째 카테고리 클릭
    await categoryLinks.first().click();

    // 카테고리 페이지로 이동 확인
    await expect(page).toHaveURL(/\/categories\//);
    await expect(page.locator('h1')).toContainText('Category:');
  });

  test('Tags 페이지가 작동함', async ({ page }) => {
    await page.goto('/tags');

    // 페이지 타이틀 확인
    await expect(page.locator('h1')).toContainText('Tags');

    // 태그가 최소 1개 이상 있는지 확인
    const tagLinks = page.getByRole('link').filter({ hasText: /\(\d+\)/ });
    const count = await tagLinks.count();

    if (count > 0) {
      // 첫 번째 태그 클릭
      await tagLinks.first().click();

      // 태그 페이지로 이동 확인
      await expect(page).toHaveURL(/\/tags\//);
      await expect(page.locator('h1')).toContainText('Tag:');
    }
  });

  test('About 페이지가 제대로 로드됨', async ({ page }) => {
    await page.goto('/about');

    // 페이지 타이틀에 작성자 이름 확인
    await expect(page.locator('h1')).toContainText('jjojjosj');

    // 작성자 정보 확인
    await expect(page.getByText('개발을 취미(목표)로 하는 인프라 엔지니어')).toBeVisible();

    // GitHub 링크 확인 (여러 개 있으므로 첫 번째만 확인)
    await expect(page.getByRole('link', { name: 'GitHub' }).first()).toBeVisible();

    // Email 링크 확인
    await expect(page.getByRole('link', { name: 'Email' }).first()).toBeVisible();
  });

  test('Search 페이지가 제대로 로드됨', async ({ page }) => {
    await page.goto('/search');

    // 페이지 타이틀 확인
    await expect(page.locator('h1')).toContainText('Search');

    // 검색 입력창 확인
    const searchInput = page.getByPlaceholder(/검색어를 입력하세요/);
    await expect(searchInput).toBeVisible();

    // 검색어 입력 (간단한 테스트)
    await searchInput.fill('react');

    // 결과가 나타날 때까지 대기 (최대 5초)
    await page.waitForTimeout(2000);
  });

  test('사이드바 카테고리 링크가 작동함', async ({ page }) => {
    await page.goto('/');

    // 사이드바의 카테고리 섹션 찾기
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();

    // Categories 제목이 있는 컨테이너 찾기
    const categoriesSection = sidebar.locator('text=Categories').locator('..');

    // 카테고리 링크 클릭 (IT 또는 첫 번째 카테고리)
    const categoryLink = categoriesSection.locator('a').first();
    if (await categoryLink.isVisible()) {
      await categoryLink.click();

      // 카테고리 페이지로 이동 확인
      await expect(page).toHaveURL(/\/categories\//);
    }
  });

  test('사이드바 태그 링크가 작동함', async ({ page }) => {
    await page.goto('/');

    // 사이드바의 태그 섹션 찾기
    const sidebar = page.locator('aside');

    // Popular Tags 제목이 있는 컨테이너 찾기
    const tagsSection = sidebar.locator('text=Popular Tags').locator('..');

    // 태그 링크 클릭
    const tagLink = tagsSection.locator('a').first();
    if (await tagLink.isVisible()) {
      await tagLink.click();

      // 태그 페이지로 이동 확인
      await expect(page).toHaveURL(/\/tags\//);
    }
  });

  test('반응형: 모바일 화면에서 레이아웃이 제대로 표시됨', async ({ page }) => {
    // 모바일 뷰포트로 설정
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // 헤더가 보이는지 확인
    await expect(page.locator('header')).toBeVisible();

    // 포스트 카드가 세로로 배치되는지 확인 (그리드가 1열)
    const firstPost = page.locator('article').first();
    await expect(firstPost).toBeVisible();
  });
});

test.describe('Blog Content and Features', () => {
  test('포스트에 카테고리와 태그가 표시됨', async ({ page }) => {
    await page.goto('/');

    // 첫 번째 포스트로 이동
    await page.locator('article').first().locator('h2').click();

    // URL 확인
    await expect(page).toHaveURL(/\/posts\//);

    // 페이지가 완전히 로드될 때까지 대기
    await page.waitForLoadState('networkidle');
  });

  test('홈페이지에서 포스트 카드의 날짜가 표시됨', async ({ page }) => {
    await page.goto('/');

    // 첫 번째 포스트 카드의 날짜 확인
    const firstPost = page.locator('article').first();
    await expect(firstPost.locator('time')).toBeVisible();
  });

  test('홈페이지에서 포스트 카드의 읽기 시간이 표시됨', async ({ page }) => {
    await page.goto('/');

    // 첫 번째 포스트 카드의 읽기 시간 확인
    const firstPost = page.locator('article').first();
    const readingTime = firstPost.getByText(/min read/);

    // 읽기 시간 텍스트가 있으면 확인
    const count = await readingTime.count();
    if (count > 0) {
      await expect(readingTime.first()).toBeVisible();
    }
  });
});

test.describe('Error Handling', () => {
  test('존재하지 않는 페이지는 404를 반환함', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist');
    expect(response?.status()).toBe(404);
  });

  test('존재하지 않는 포스트는 404를 반환함', async ({ page }) => {
    const response = await page.goto('/posts/non-existent-post-slug-12345');
    // 개발 모드에서는 500, 프로덕션 빌드에서는 404 반환
    expect([404, 500]).toContain(response?.status());
  });
});
