const GITHUB_API = "https://api.github.com";

function getToken(): string | null {
  return process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN ?? null;
}

function getRepo(): string {
  return process.env.GITHUB_REPO ?? "zhy2539/personal-site";
}

function getBranch(): string {
  return process.env.GITHUB_BRANCH ?? "main";
}

interface GitHubFileResponse {
  sha?: string;
}

async function githubFetch(path: string, init?: RequestInit) {
  const token = getToken();
  if (!token) return null;

  const res = await fetch(`${GITHUB_API}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...init?.headers,
    },
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API 错误 ${res.status}: ${text}`);
  }
  return res.json();
}

async function getFileSha(filePath: string): Promise<string | null> {
  const repo = getRepo();
  const data = (await githubFetch(
    `/repos/${repo}/contents/${filePath}?ref=${getBranch()}`
  )) as GitHubFileResponse | null;
  return data?.sha ?? null;
}

/** 将文件变更同步到 GitHub（Vercel 生产环境持久化） */
export async function syncFileToGitHub(
  filePath: string,
  content: string,
  message: string
): Promise<boolean> {
  const token = getToken();
  if (!token) return false;

  const repo = getRepo();
  const sha = await getFileSha(filePath);

  await githubFetch(`/repos/${repo}/contents/${filePath}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      content: Buffer.from(content, "utf-8").toString("base64"),
      branch: getBranch(),
      ...(sha ? { sha } : {}),
    }),
  });

  return true;
}

export async function deleteFileFromGitHub(
  filePath: string,
  message: string
): Promise<boolean> {
  const token = getToken();
  if (!token) return false;

  const repo = getRepo();
  const sha = await getFileSha(filePath);
  if (!sha) return false;

  await githubFetch(`/repos/${repo}/contents/${filePath}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      sha,
      branch: getBranch(),
    }),
  });

  return true;
}

export function shouldSyncToGitHub(): boolean {
  return Boolean(getToken()) && Boolean(process.env.VERCEL);
}
