import matter from "gray-matter";
import type { BlogPost } from "@/types";

export interface BlogInput {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  content: string;
  format: "markdown" | "rich";
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
    format: input.format,
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
    format: post.format,
  };
}

/** 将 Markdown 转为 HTML 供富文本编辑器加载 */
export async function contentForEditor(
  content: string,
  format: "markdown" | "rich"
): Promise<string> {
  if (format === "rich") return content;
  const { marked } = await import("marked");
  return marked.parse(content, { async: false }) as string;
}
