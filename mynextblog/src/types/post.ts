export interface Post {
  slug: string;
  title: string;
  date: string;
  categories?: string | string[];
  tags?: string[];
  toc?: boolean;
  toc_sticky?: boolean;
  toc_label?: string;
  content: string;
  readingTime: string;
  excerpt?: string;
}

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  categories?: string | string[];
  tags?: string[];
  readingTime: string;
  excerpt?: string;
}
