import { getAllPosts, getPostBySlug, getRelatedPosts } from '@/lib/posts';
import { markdownToHtml } from '@/lib/markdown';
import { formatDate, normalizeCategory } from '@/lib/utils';
import TableOfContents from '@/components/post/TableOfContents';
import Comments from '@/components/common/Comments';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map(post => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      tags: post.tags,
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const content = await markdownToHtml(post.content);
  const categories = normalizeCategory(post.categories);
  const relatedPosts = getRelatedPosts(post);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex gap-8">
        {/* Main Content */}
        <article className="flex-1 min-w-0 bg-white rounded-lg shadow-lg p-8">
          {/* Post Header */}
          <header className="mb-8 pb-6 border-b border-gray-200">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>

            <div className="flex items-center gap-4 text-gray-600 mb-4">
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <span>•</span>
              <span>{post.readingTime}</span>
            </div>

            {categories.length > 0 && (
              <div className="flex gap-2 mb-4">
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
          </header>

          {/* Post Content */}
          <div
            className="prose prose-lg max-w-none
              prose-headings:font-bold prose-headings:text-gray-900 prose-headings:scroll-mt-20
              prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-3
              prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
              prose-h4:text-xl prose-h4:mt-6 prose-h4:mb-3
              prose-a:text-emerald-600 hover:prose-a:text-emerald-700"
            dangerouslySetInnerHTML={{ __html: content }}
          />

          {/* Comments */}
          <Comments slug={post.slug} title={post.title} />
        </article>

        {/* Table of Contents - Desktop Only */}
        {post.toc && (
          <aside className="hidden xl:block w-64 flex-shrink-0">
            <TableOfContents />
          </aside>
        )}
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">관련 포스트</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedPosts.map(relatedPost => (
              <Link
                key={relatedPost.slug}
                href={`/posts/${relatedPost.slug}`}
                className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition"
              >
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {relatedPost.title}
                </h3>
                <p className="text-sm text-gray-600">{formatDate(relatedPost.date)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
