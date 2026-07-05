import matter from "gray-matter";
import type { BlogPost } from "@/types";

export interface BlogInput {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  content: string;
}

export function slugifyBlogSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}

export function serializeBlogPost(input: BlogInput): string {
  return matter.stringify(input.content, {
    title: input.title,
    description: input.description,
    date: input.date,
    tags: input.tags,
  });
}

export function blogInputFromPost(post: BlogPost): BlogInput {
  return {
    slug: post.slug,
    title: post.title,
    description: post.description,
    date: post.date,
    tags: post.tags,
    content: post.content,
  };
}
