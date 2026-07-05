import { promises as fs } from "fs";
import path from "path";
import type { ResourceItem } from "../src/types";

const DATA_DIR = path.join(process.cwd(), "data");
const MCP_FILE = path.join(DATA_DIR, "mcp.json");
const PENDING_FILE = path.join(DATA_DIR, "mcp-pending.json");

interface GitHubRepo {
  full_name: string;
  html_url: string;
  description: string | null;
  updated_at: string;
  topics?: string[];
}

interface GitHubSearchResponse {
  items: GitHubRepo[];
}

const SEARCH_QUERIES = [
  "mcp-server modelcontextprotocol",
  "model-context-protocol server",
  "topic:mcp-server stars:>10",
];

async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}

async function searchGitHub(query: string): Promise<GitHubRepo[]> {
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=updated&order=desc&per_page=15`;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "personal-site-discover-mcp",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  const res = await fetch(url, { headers });
  if (!res.ok) {
    console.warn(`GitHub search failed for "${query}": ${res.status}`);
    return [];
  }
  const data = (await res.json()) as GitHubSearchResponse;
  return data.items ?? [];
}

function repoToResource(repo: GitHubRepo): ResourceItem {
  const tags = ["GitHub", ...(repo.topics ?? []).slice(0, 4)];
  return {
    id: slugify(repo.full_name),
    name: repo.full_name.split("/").pop() ?? repo.full_name,
    description: repo.description ?? `GitHub MCP 相关仓库：${repo.full_name}`,
    url: repo.html_url,
    tags: [...new Set(tags)],
    updatedAt: repo.updated_at.slice(0, 10),
  };
}

async function main() {
  console.log("🔍 发现 MCP 候选资源…");

  const existing = await readJson<ResourceItem[]>(MCP_FILE, []);
  const pending = await readJson<ResourceItem[]>(PENDING_FILE, []);
  const knownUrls = new Set([
    ...existing.map((i) => i.url),
    ...pending.map((i) => i.url),
  ]);
  const knownIds = new Set([
    ...existing.map((i) => i.id),
    ...pending.map((i) => i.id),
  ]);

  const seen = new Set<string>();
  const candidates: ResourceItem[] = [];

  for (const query of SEARCH_QUERIES) {
    const repos = await searchGitHub(query);
    for (const repo of repos) {
      if (seen.has(repo.html_url) || knownUrls.has(repo.html_url)) continue;
      seen.add(repo.html_url);
      const item = repoToResource(repo);
      if (knownIds.has(item.id)) continue;
      candidates.push(item);
    }
    await new Promise((r) => setTimeout(r, 2000));
  }

  const merged = [...pending];
  for (const c of candidates) {
    if (!merged.some((m) => m.url === c.url || m.id === c.id)) {
      merged.push(c);
    }
  }

  await fs.writeFile(PENDING_FILE, JSON.stringify(merged, null, 2) + "\n");
  console.log(`✅ 新增 ${candidates.length} 个候选，pending 共 ${merged.length} 条`);
  console.log(`   写入 ${PENDING_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
