import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import type { BlogMeta, BlogPost } from "@/types";
import { BLOG_DIR } from "./constants";

function blogDir(): string {
  return path.join(process.cwd(), BLOG_DIR);
}

async function getMdxFiles(): Promise<string[]> {
  const dir = blogDir();
  try {
    const entries = await fs.readdir(dir);
    return entries.filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));
  } catch {
    return [];
  }
}

function parsePost(filename: string, raw: string): BlogPost {
  const { data, content } = matter(raw);
  const slug = filename.replace(/\.(mdx|md)$/, "");
  const stats = readingTime(content);
  return {
    slug,
    title: String(data.title ?? slug),
    description: String(data.description ?? ""),
    date: String(data.date ?? new Date().toISOString().slice(0, 10)),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    readingTime: stats.text,
    content,
  };
}

export async function getAllPosts(): Promise<BlogMeta[]> {
  const files = await getMdxFiles();
  const posts = await Promise.all(
    files.map(async (file) => {
      const raw = await fs.readFile(path.join(blogDir(), file), "utf-8");
      const post = parsePost(file, raw);
      const { content: _content, ...meta } = post;
      void _content;
      return meta;
    })
  );
  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  for (const ext of [".mdx", ".md"]) {
    const filePath = path.join(blogDir(), `${slug}${ext}`);
    try {
      const raw = await fs.readFile(filePath, "utf-8");
      return parsePost(`${slug}${ext}`, raw);
    } catch {
      continue;
    }
  }
  return null;
}

export async function getPostsByTag(tag: string): Promise<BlogMeta[]> {
  const posts = await getAllPosts();
  return posts.filter((p) => p.tags.includes(tag));
}

export async function getAllTags(): Promise<string[]> {
  const posts = await getAllPosts();
  const tags = new Set<string>();
  for (const post of posts) {
    for (const tag of post.tags) {
      tags.add(tag);
    }
  }
  return Array.from(tags).sort((a, b) => a.localeCompare(b, "zh-CN"));
}
