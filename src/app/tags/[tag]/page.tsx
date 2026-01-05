import { getAllTags } from '@/lib/tags';
import { getPostsByTag } from '@/lib/posts';
import PostCard from '@/components/post/PostCard';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface TagPageProps {
  params: Promise<{ tag: string }>;
}

export async function generateStaticParams() {
  const tags = getAllTags();
  return tags.map(tag => ({
    tag: tag.name,
  }));
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { tag } = await params;
  return {
    title: `Tag: ${tag}`,
    description: `${tag} 태그의 포스트 목록`,
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag } = await params;
  const posts = getPostsByTag(tag);

  if (posts.length === 0) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Tag: #{tag}</h1>
      <p className="text-gray-600 mb-8">{posts.length} posts</p>
      <div className="space-y-6">
        {posts.map(post => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
