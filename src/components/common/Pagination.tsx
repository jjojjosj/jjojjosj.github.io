import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath?: string;
}

export default function Pagination({ currentPage, totalPages, basePath = '' }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const getPagePath = (page: number) => {
    if (page === 1) return basePath || '/';
    return `${basePath}/page/${page}`;
  };

  return (
    <nav className="flex justify-center items-center gap-2 mt-8">
      {currentPage > 1 && (
        <Link
          href={getPagePath(currentPage - 1)}
          className="px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 transition"
        >
          ← 이전
        </Link>
      )}

      {pages.map(page => {
        // Show first, last, current, and adjacent pages
        if (
          page === 1 ||
          page === totalPages ||
          (page >= currentPage - 1 && page <= currentPage + 1)
        ) {
          return (
            <Link
              key={page}
              href={getPagePath(page)}
              className={`px-4 py-2 rounded transition ${
                page === currentPage
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </Link>
          );
        } else if (page === currentPage - 2 || page === currentPage + 2) {
          return <span key={page} className="px-2">...</span>;
        }
        return null;
      })}

      {currentPage < totalPages && (
        <Link
          href={getPagePath(currentPage + 1)}
          className="px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 transition"
        >
          다음 →
        </Link>
      )}
    </nav>
  );
}
