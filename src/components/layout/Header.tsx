'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/constants';

const NAV_ITEMS = [
  { href: '/about', label: 'About' },
  { href: '/categories', label: 'Categories' },
  { href: '/tags', label: 'Tags' },
  { href: '/search', label: 'Search' },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-xl sm:text-2xl font-bold text-gray-900 hover:text-emerald-600 transition truncate mr-4"
          >
            {SITE_CONFIG.title}
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:block">
            <ul className="flex gap-6">
              {NAV_ITEMS.map(item => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-gray-700 hover:text-emerald-600 transition"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Mobile hamburger button */}
          <button
            type="button"
            className="sm:hidden p-2 -mr-2 text-gray-700 hover:text-emerald-600 transition"
            aria-label="메뉴 열기"
            aria-expanded={isOpen}
            onClick={() => setIsOpen(prev => !prev)}
          >
            {isOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <nav className="sm:hidden mt-4 pb-2">
            <ul className="flex flex-col gap-1">
              {NAV_ITEMS.map(item => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block px-2 py-2 rounded text-gray-700 hover:text-emerald-600 hover:bg-gray-50 transition"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}
