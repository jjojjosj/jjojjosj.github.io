import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import { Post, PostMeta } from '@/types/post';
import { getExcerpt, normalizeCategory } from './utils';

const postsDirectory = path.join(process.cwd(), 'content/posts');

// Ensure directory exists
if (!fs.existsSync(postsDirectory)) {
  fs.mkdirSync(postsDirectory, { recursive: true });
}

export function getAllPosts(): Post[] {
  try {
    const fileNames = fs.readdirSync(postsDirectory);
    const allPostsData = fileNames
      .filter(fileName => fileName.endsWith('.md') || fileName.endsWith('.markdown'))
      .map(fileName => {
        const slug = fileName.replace(/\.(md|markdown)$/, '');
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);

        return {
          slug,
          content,
          readingTime: readingTime(content).text,
          excerpt: data.excerpt || getExcerpt(content),
          ...data,
        } as Post;
      });

    return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
  } catch (error) {
    console.error('Error reading posts:', error);
    return [];
  }
}

export function getPostBySlug(slug: string): Post | null {
  try {
    const fileExtensions = ['.md', '.markdown'];
    let fullPath: string | null = null;

    for (const ext of fileExtensions) {
      const testPath = path.join(postsDirectory, `${slug}${ext}`);
      if (fs.existsSync(testPath)) {
        fullPath = testPath;
        break;
      }
    }

    if (!fullPath) return null;

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      slug,
      content,
      readingTime: readingTime(content).text,
      excerpt: data.excerpt || getExcerpt(content),
      ...data,
    } as Post;
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error);
    return null;
  }
}

export function getPostsByCategory(category: string): Post[] {
  const allPosts = getAllPosts();
  return allPosts.filter(post => {
    const categories = normalizeCategory(post.categories);
    return categories.includes(category);
  });
}

export function getPostsByTag(tag: string): Post[] {
  const allPosts = getAllPosts();
  return allPosts.filter(post => post.tags?.includes(tag));
}

export function getAllPostsMeta(): PostMeta[] {
  const allPosts = getAllPosts();
  return allPosts.map(({ slug, title, date, categories, tags, readingTime, excerpt }) => ({
    slug,
    title,
    date,
    categories,
    tags,
    readingTime,
    excerpt,
  }));
}

export function getRelatedPosts(currentPost: Post, limit: number = 3): Post[] {
  const allPosts = getAllPosts().filter(post => post.slug !== currentPost.slug);
  const currentCategories = normalizeCategory(currentPost.categories);
  const currentTags = currentPost.tags || [];

  // Score posts by relevance
  const scoredPosts = allPosts.map(post => {
    let score = 0;
    const postCategories = normalizeCategory(post.categories);
    const postTags = post.tags || [];

    // Category match
    postCategories.forEach(cat => {
      if (currentCategories.includes(cat)) score += 3;
    });

    // Tag match
    postTags.forEach(tag => {
      if (currentTags.includes(tag)) score += 1;
    });

    return { post, score };
  });

  return scoredPosts
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.post);
}
