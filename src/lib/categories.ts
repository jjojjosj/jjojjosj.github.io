import { getAllPosts } from './posts';
import { normalizeCategory } from './utils';

export interface CategoryInfo {
  name: string;
  count: number;
}

export function getAllCategories(): CategoryInfo[] {
  const posts = getAllPosts();
  const categoryMap = new Map<string, number>();

  posts.forEach(post => {
    const categories = normalizeCategory(post.categories);
    categories.forEach(category => {
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });
  });

  return Array.from(categoryMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export function getCategoryByName(name: string): CategoryInfo | null {
  const categories = getAllCategories();
  return categories.find(cat => cat.name === name) || null;
}
