import Image from 'next/image';
import { SITE_CONFIG } from '@/lib/constants';
import { getAllCategories } from '@/lib/categories';
import { getAllTags } from '@/lib/tags';
import Link from 'next/link';

export default function Sidebar() {
  const categories = getAllCategories();
  const tags = getAllTags().slice(0, 10); // Top 10 tags

  return (
    <aside className="space-y-8">
      {/* Author Profile */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col items-center text-center">
          <Image
            src={SITE_CONFIG.author.avatar}
            alt={SITE_CONFIG.author.name}
            width={120}
            height={120}
            className="rounded-full mb-4"
          />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {SITE_CONFIG.author.name}
          </h3>
          <p className="text-gray-600 text-sm mb-3">
            {SITE_CONFIG.author.bio}
          </p>
          <p className="text-gray-500 text-xs mb-4">
            📍 {SITE_CONFIG.author.location}
          </p>
          <a
            href={SITE_CONFIG.author.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 hover:text-emerald-700 transition text-sm"
          >
            GitHub →
          </a>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Categories</h3>
        <ul className="space-y-2">
          {categories.map(category => (
            <li key={category.name}>
              <Link
                href={`/categories/${category.name}`}
                className="flex justify-between items-center text-gray-700 hover:text-emerald-600 transition"
              >
                <span>{category.name}</span>
                <span className="text-sm text-gray-500">{category.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Tags */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Popular Tags</h3>
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <Link
              key={tag.name}
              href={`/tags/${tag.name}`}
              className="px-3 py-1 bg-gray-100 hover:bg-emerald-100 text-gray-700 hover:text-emerald-700 rounded-full text-sm transition"
            >
              {tag.name} ({tag.count})
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
