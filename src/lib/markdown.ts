import { remark } from 'remark';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import gfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

export async function markdownToHtml(markdown: string): Promise<string> {
  const result = await remark()
    .use(gfm) // GitHub Flavored Markdown
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug) // Add IDs to headings
    .use(rehypeAutolinkHeadings) // Add links to headings
    .use(rehypeHighlight) // Syntax highlighting
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(markdown);

  return result.toString();
}

// Extract headings for Table of Contents
export interface TocItem {
  level: number;
  text: string;
  id: string;
}

export function extractTocFromMarkdown(markdown: string): TocItem[] {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const toc: TocItem[] = [];
  let match;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

    toc.push({ level, text, id });
  }

  return toc;
}
