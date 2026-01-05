import { getAllPostsMeta } from '@/lib/posts';
import { SITE_CONFIG } from '@/lib/constants';
import PostCard from '@/components/post/PostCard';
import Pagination from '@/components/common/Pagination';
import Sidebar from '@/components/layout/Sidebar';

export default function Home() {
  const allPosts = getAllPostsMeta();
  const postsPerPage = SITE_CONFIG.postsPerPage;
  const posts = allPosts.slice(0, postsPerPage);
  const totalPages = Math.ceil(allPosts.length / postsPerPage);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {posts.map(post => (
            <PostCard key={post.slug} post={post} />
          ))}
          <Pagination currentPage={1} totalPages={totalPages} />
        </div>
        <div className="lg:col-span-1">
          <Sidebar />
        </div>
      </div>
    </div>
  );
}
