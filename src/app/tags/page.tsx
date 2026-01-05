import { getAllTags } from '@/lib/tags';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tags',
  description: '태그별 포스트 목록',
};

export default function TagsPage() {
  const tags = getAllTags();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Tags</h1>
      <div className="flex flex-wrap gap-3">
        {tags.map(tag => (
          <Link
            key={tag.name}
            href={`/tags/${tag.name}`}
            className="px-6 py-3 bg-white rounded-lg shadow hover:shadow-lg transition text-gray-900 hover:text-emerald-600"
          >
            <span className="font-semibold">{tag.name}</span>
            <span className="ml-2 text-sm text-gray-600">({tag.count})</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
