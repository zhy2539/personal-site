import matter from "gray-matter";
import readingTime from "reading-time";
import type { BlogPost } from "@/types";

const GITHUB_API = "https://api.github.com";

function getToken(): string {
  return process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN ?? "";
}

function getRepo(): string {
  return process.env.GITHUB_REPO ?? "zhy2539/personal-site";
}

function getBranch(): string {
  return process.env.GITHUB_BRANCH ?? "main";
}

interface GitHubContentItem {
  name: string;
  path: string;
  type: string;
  download_url?: string;
}

function parseRaw(filename: string, raw: string): BlogPost {
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

async function githubFetch(path: string, init?: RequestInit) {
  const token = getToken();
  const res = await fetch(`${GITHUB_API}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...init?.headers,
    },
    next: { revalidate: 0 },
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API ${res.status}: ${text}`);
  }
  return res.json();
}

export function shouldReadFromGitHub(): boolean {
  return Boolean(process.env.VERCEL) && Boolean(getToken());
}

export async function getAllPostsFromGitHub(): Promise<BlogPost[]> {
  const repo = getRepo();
  const branch = getBranch();
  const items = (await githubFetch(
    `/repos/${repo}/contents/content/blog?ref=${branch}`
  )) as GitHubContentItem[] | null;

  if (!items || !Array.isArray(items)) return [];

  const posts: BlogPost[] = [];
  for (const item of items) {
    if (item.type !== "file") continue;
    if (!/\.(mdx|md)$/.test(item.name)) continue;
    const fileData = (await githubFetch(
      `/repos/${repo}/contents/${item.path}?ref=${branch}`
    )) as { content: string; encoding: string } | null;
    if (!fileData?.content) continue;
    const raw = Buffer.from(fileData.content, "base64").toString("utf-8");
    posts.push(parseRaw(item.name, raw));
  }

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function getPostBySlugFromGitHub(
  slug: string
): Promise<BlogPost | null> {
  const repo = getRepo();
  const branch = getBranch();
  for (const ext of [".mdx", ".md"]) {
    const path = `content/blog/${slug}${ext}`;
    const fileData = (await githubFetch(
      `/repos/${repo}/contents/${path}?ref=${branch}`
    )) as { content: string } | null;
    if (!fileData?.content) continue;
    const raw = Buffer.from(fileData.content, "base64").toString("utf-8");
    return parseRaw(`${slug}${ext}`, raw);
  }
  return null;
}

export async function triggerVercelDeploy(): Promise<boolean> {
  const hook = process.env.VERCEL_DEPLOY_HOOK_URL;
  if (!hook) return false;
  const res = await fetch(hook, { method: "POST" });
  return res.ok;
}
