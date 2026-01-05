'use client';

import { useState, useEffect } from 'react';
import lunr from 'lunr';
import PostCard from '@/components/post/PostCard';
import type { PostMeta } from '@/types/post';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PostMeta[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchIndex, setSearchIndex] = useState<lunr.Index | null>(null);
  const [posts, setPosts] = useState<PostMeta[]>([]);

  useEffect(() => {
    // Fetch posts data on mount
    fetch('/api/posts')
      .then(res => res.json())
      .then(data => {
        setPosts(data);

        // Build search index
        const idx = lunr(function() {
          this.ref('slug');
          this.field('title', { boost: 10 });
          this.field('excerpt', { boost: 5 });
          this.field('categories', { boost: 3 });
          this.field('tags', { boost: 2 });

          data.forEach((post: PostMeta) => {
            this.add({
              slug: post.slug,
              title: post.title,
              excerpt: post.excerpt || '',
              categories: Array.isArray(post.categories)
                ? post.categories.join(' ')
                : post.categories || '',
              tags: post.tags?.join(' ') || '',
            });
          });
        });

        setSearchIndex(idx);
      })
      .catch(err => console.error('Failed to load posts:', err));
  }, []);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);

    if (!searchQuery.trim() || !searchIndex) {
      setResults([]);
      return;
    }

    setIsLoading(true);

    try {
      // Try Lunr search first with wildcard for better matching
      let searchResults;
      try {
        // Add wildcard for partial matching
        const wildcardQuery = searchQuery
          .split(/\s+/)
          .map(term => `*${term}*`)
          .join(' ');
        searchResults = searchIndex.search(wildcardQuery);
      } catch {
        // Fallback to exact match if wildcard fails
        searchResults = searchIndex.search(searchQuery);
      }

      // If Lunr search returns no results, fallback to simple text matching for Korean
      let foundPosts;
      if (searchResults.length === 0) {
        const lowerQuery = searchQuery.toLowerCase();
        foundPosts = posts.filter(post => {
          const searchableText = [
            post.title,
            post.excerpt || '',
            Array.isArray(post.categories) ? post.categories.join(' ') : post.categories || '',
            post.tags?.join(' ') || '',
          ].join(' ').toLowerCase();

          return searchableText.includes(lowerQuery);
        });
      } else {
        foundPosts = searchResults
          .map(result => posts.find(p => p.slug === result.ref))
          .filter((p): p is PostMeta => p !== undefined);
      }

      setResults(foundPosts);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Search</h1>

      <div className="mb-8">
        <input
          type="text"
          value={query}
          onChange={e => handleSearch(e.target.value)}
          placeholder="검색어를 입력하세요..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
        />
      </div>

      {isLoading && <p className="text-gray-600">검색 중...</p>}

      {!isLoading && query && results.length === 0 && (
        <p className="text-gray-600">검색 결과가 없습니다.</p>
      )}

      {!isLoading && results.length > 0 && (
        <>
          <p className="text-gray-600 mb-6">{results.length}개의 포스트를 찾았습니다.</p>
          <div className="space-y-6">
            {results.map(post => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
