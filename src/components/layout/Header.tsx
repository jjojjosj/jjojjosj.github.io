import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/constants';

export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-emerald-600 transition">
            {SITE_CONFIG.title}
          </Link>
          <nav>
            <ul className="flex gap-6">
              <li>
                <Link href="/about" className="text-gray-700 hover:text-emerald-600 transition">
                  About
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-gray-700 hover:text-emerald-600 transition">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/tags" className="text-gray-700 hover:text-emerald-600 transition">
                  Tags
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-gray-700 hover:text-emerald-600 transition">
                  Search
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
