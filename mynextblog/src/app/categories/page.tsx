import { getAllCategories } from '@/lib/categories';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Categories',
  description: '카테고리별 포스트 목록',
};

export default function CategoriesPage() {
  const categories = getAllCategories();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Categories</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map(category => (
          <Link
            key={category.name}
            href={`/categories/${category.name}`}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{category.name}</h2>
            <p className="text-gray-600">{category.count} posts</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
