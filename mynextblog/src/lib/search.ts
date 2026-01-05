import lunr from 'lunr';
import { Post } from '@/types/post';
import { normalizeCategory } from './utils';

export interface SearchIndex {
  index: lunr.Index;
  posts: Map<string, Post>;
}

export function createSearchIndex(posts: Post[]): lunr.Index {
  return lunr(function() {
    this.ref('slug');
    this.field('title', { boost: 10 });
    this.field('content', { boost: 5 });
    this.field('categories', { boost: 3 });
    this.field('tags', { boost: 2 });
    this.field('excerpt');

    posts.forEach(post => {
      this.add({
        slug: post.slug,
        title: post.title,
        content: post.content,
        categories: normalizeCategory(post.categories).join(' '),
        tags: post.tags?.join(' ') || '',
        excerpt: post.excerpt || '',
      });
    });
  });
}

export function searchPosts(query: string, searchIndex: lunr.Index, postsMap: Map<string, Post>): Post[] {
  if (!query.trim()) return [];

  try {
    const results = searchIndex.search(query);
    return results
      .map(result => postsMap.get(result.ref))
      .filter((post): post is Post => post !== undefined);
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}
