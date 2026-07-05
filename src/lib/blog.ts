import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import type { BlogMeta, BlogPost } from "@/types";
import { BLOG_DIR } from "./constants";
import { serializeBlogPost, type BlogInput } from "./blog-admin";

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
  const format = data.format === "rich" ? "rich" : "markdown";
  const plainText =
    format === "rich" ? content.replace(/<[^>]+>/g, " ") : content;
  const stats = readingTime(plainText);
  return {
    slug,
    title: String(data.title ?? slug),
    description: String(data.description ?? ""),
    date: String(data.date ?? new Date().toISOString().slice(0, 10)),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    readingTime: stats.text,
    content,
    format,
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

function postFilePath(slug: string): string {
  return path.join(blogDir(), `${slug}.mdx`);
}

export async function saveBlogPost(input: BlogInput): Promise<BlogPost> {
  const raw = serializeBlogPost(input);
  await fs.mkdir(blogDir(), { recursive: true });
  await fs.writeFile(postFilePath(input.slug), raw, "utf-8");
  const post = await getPostBySlug(input.slug);
  if (!post) throw new Error("保存后读取失败");
  return post;
}

export async function deleteBlogPost(slug: string): Promise<void> {
  for (const ext of [".mdx", ".md"]) {
    const filePath = path.join(blogDir(), `${slug}${ext}`);
    try {
      await fs.unlink(filePath);
      return;
    } catch {
      continue;
    }
  }
  throw new Error("文章未找到");
}

