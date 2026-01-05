import { SITE_CONFIG } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 mt-12">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-600">
            © {new Date().getFullYear()} {SITE_CONFIG.author.name}. All rights reserved.
          </div>
          <div className="flex gap-4">
            <a
              href={SITE_CONFIG.author.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-emerald-600 transition"
            >
              GitHub
            </a>
            <a
              href={`mailto:${SITE_CONFIG.author.email}`}
              className="text-gray-600 hover:text-emerald-600 transition"
            >
              Email
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
