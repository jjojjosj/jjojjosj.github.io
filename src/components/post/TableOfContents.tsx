'use client';

import { useEffect, useState } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents() {
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Extract headings from the document
    const headings = Array.from(document.querySelectorAll('article h1, article h2, article h3, article h4'));
    const tocItems: TocItem[] = headings.map(heading => ({
      id: heading.id,
      text: heading.textContent || '',
      level: parseInt(heading.tagName[1]),
    }));
    setToc(tocItems);

    // Intersection Observer for active heading
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -66%' }
    );

    headings.forEach(heading => observer.observe(heading));

    return () => {
      headings.forEach(heading => observer.unobserve(heading));
    };
  }, []);

  if (toc.length === 0) return null;

  return (
    <nav className="toc bg-white rounded-lg shadow-lg p-6 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
      <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">목차</h3>
      <ul className="space-y-2">
        {toc.map(item => (
          <li
            key={item.id}
            style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
          >
            <a
              href={`#${item.id}`}
              className={`text-sm hover:text-emerald-600 transition block py-1 ${
                activeId === item.id
                  ? 'text-emerald-600 font-semibold border-l-2 border-emerald-600 pl-2 -ml-2'
                  : 'text-gray-700'
              }`}
              onClick={e => {
                e.preventDefault();
                document.getElementById(item.id)?.scrollIntoView({
                  behavior: 'smooth',
                });
              }}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
