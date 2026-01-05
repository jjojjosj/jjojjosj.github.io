import { getAllPosts } from './posts';

export interface TagInfo {
  name: string;
  count: number;
}

export function getAllTags(): TagInfo[] {
  const posts = getAllPosts();
  const tagMap = new Map<string, number>();

  posts.forEach(post => {
    if (post.tags) {
      post.tags.forEach(tag => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
      });
    }
  });

  return Array.from(tagMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export function getTagByName(name: string): TagInfo | null {
  const tags = getAllTags();
  return tags.find(tag => tag.name === name) || null;
}
