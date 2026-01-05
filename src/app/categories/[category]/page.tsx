import { getAllCategories } from '@/lib/categories';
import { getPostsByCategory } from '@/lib/posts';
import PostCard from '@/components/post/PostCard';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  const categories = getAllCategories();
  return categories.map(category => ({
    category: category.name,
  }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  return {
    title: `Category: ${category}`,
    description: `${category} 카테고리의 포스트 목록`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const posts = getPostsByCategory(category);

  if (posts.length === 0) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Category: {category}</h1>
      <p className="text-gray-600 mb-8">{posts.length} posts</p>
      <div className="space-y-6">
        {posts.map(post => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
