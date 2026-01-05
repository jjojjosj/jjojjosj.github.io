import { SITE_CONFIG } from '@/lib/constants';
import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: `${SITE_CONFIG.author.name}에 대해 알아보기`,
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-8">
          <Image
            src={SITE_CONFIG.author.avatar}
            alt={SITE_CONFIG.author.name}
            width={200}
            height={200}
            className="rounded-full"
          />
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {SITE_CONFIG.author.name}
            </h1>
            <p className="text-xl text-gray-700 mb-4">{SITE_CONFIG.author.bio}</p>
            <p className="text-gray-600 mb-6">📍 {SITE_CONFIG.author.location}</p>
            <div className="flex gap-4 justify-center md:justify-start">
              <a
                href={SITE_CONFIG.author.github}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
              >
                GitHub
              </a>
              <a
                href={`mailto:${SITE_CONFIG.author.email}`}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                Email
              </a>
            </div>
          </div>
        </div>

        <div className="prose prose-lg max-w-none">
          <h2>About This Blog</h2>
          <p>{SITE_CONFIG.description}</p>

          <h2>Contact</h2>
          <ul>
            <li>
              <strong>Email:</strong> {SITE_CONFIG.author.email}
            </li>
            <li>
              <strong>GitHub:</strong>{' '}
              <a
                href={SITE_CONFIG.author.github}
                target="_blank"
                rel="noopener noreferrer"
              >
                {SITE_CONFIG.author.github}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
