import { getAllPostsMeta } from '@/lib/posts';
import { SITE_CONFIG } from '@/lib/constants';
import PostCard from '@/components/post/PostCard';
import Pagination from '@/components/common/Pagination';
import Sidebar from '@/components/layout/Sidebar';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ page: string }>;
}

export async function generateStaticParams() {
  const allPosts = getAllPostsMeta();
  const totalPages = Math.ceil(allPosts.length / SITE_CONFIG.postsPerPage);

  // page 1은 홈페이지에서 처리하므로 page 2부터 생성
  return Array.from({ length: totalPages - 1 }, (_, i) => ({
    page: String(i + 2),
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { page } = await params;
  return {
    title: `Posts - Page ${page}`,
    description: `포스트 목록 ${page}페이지`,
  };
}

export default async function PaginatedPage({ params }: PageProps) {
  const { page } = await params;
  const pageNumber = parseInt(page, 10);

  const allPosts = getAllPostsMeta();
  const postsPerPage = SITE_CONFIG.postsPerPage;
  const totalPages = Math.ceil(allPosts.length / postsPerPage);

  if (pageNumber < 1 || pageNumber > totalPages || isNaN(pageNumber)) {
    notFound();
  }

  const startIndex = (pageNumber - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const posts = allPosts.slice(startIndex, endIndex);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {posts.map(post => (
            <PostCard key={post.slug} post={post} />
          ))}
          <Pagination currentPage={pageNumber} totalPages={totalPages} />
        </div>
        <div className="lg:col-span-1">
          <Sidebar />
        </div>
      </div>
    </div>
  );
}
