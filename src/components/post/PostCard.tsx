import Link from 'next/link';
import { PostMeta } from '@/types/post';
import { formatDate, normalizeCategory } from '@/lib/utils';

interface PostCardProps {
  post: PostMeta;
}

export default function PostCard({ post }: PostCardProps) {
  const categories = normalizeCategory(post.categories);

  return (
    <article className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
      <Link href={`/posts/${post.slug}`}>
        <h2 className="text-2xl font-bold text-gray-900 hover:text-emerald-600 transition mb-2">
          {post.title}
        </h2>
      </Link>

      <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        <span>•</span>
        <span>{post.readingTime}</span>
      </div>

      {categories.length > 0 && (
        <div className="flex gap-2 mb-3">
          {categories.map(category => (
            <Link
              key={category}
              href={`/categories/${category}`}
              className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm hover:bg-emerald-200 transition"
            >
              {category}
            </Link>
          ))}
        </div>
      )}

      {post.excerpt && (
        <p className="text-gray-700 mb-3 line-clamp-3">{post.excerpt}</p>
      )}

      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {post.tags.map(tag => (
            <Link
              key={tag}
              href={`/tags/${tag}`}
              className="text-sm text-gray-600 hover:text-emerald-600 transition"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}
