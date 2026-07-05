import { promises as fs } from "fs";
import path from "path";
import type { ResourceItem, SkillItem } from "@/types";
import {
  DATA_DIR,
  MCP_FILE,
  SKILLS_FILE,
  MCP_PENDING_FILE,
  SKILLS_PENDING_FILE,
} from "./constants";

function dataPath(filename: string): string {
  return path.join(process.cwd(), DATA_DIR, filename);
}

async function readJsonFile<T>(filename: string): Promise<T> {
  const filePath = dataPath(filename);
  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

async function writeJsonFile<T>(filename: string, data: T): Promise<void> {
  const filePath = dataPath(filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

export async function getMcpItems(): Promise<ResourceItem[]> {
  return readJsonFile<ResourceItem[]>(MCP_FILE);
}

export async function getSkillItems(): Promise<SkillItem[]> {
  return readJsonFile<SkillItem[]>(SKILLS_FILE);
}

export async function getSkillById(id: string): Promise<SkillItem | null> {
  const items = await getSkillItems();
  return items.find((i) => i.id === id) ?? null;
}

export async function getMcpPending(): Promise<ResourceItem[]> {
  try {
    return await readJsonFile<ResourceItem[]>(MCP_PENDING_FILE);
  } catch {
    return [];
  }
}

export async function getSkillsPending(): Promise<ResourceItem[]> {
  try {
    return await readJsonFile<ResourceItem[]>(SKILLS_PENDING_FILE);
  } catch {
    return [];
  }
}

export async function saveMcpItems(items: ResourceItem[]): Promise<void> {
  await writeJsonFile(MCP_FILE, items);
}

export async function saveSkillItems(items: SkillItem[]): Promise<void> {
  await writeJsonFile(SKILLS_FILE, items);
}

export async function saveMcpPending(items: ResourceItem[]): Promise<void> {
  await writeJsonFile(MCP_PENDING_FILE, items);
}

export async function saveSkillsPending(items: ResourceItem[]): Promise<void> {
  await writeJsonFile(SKILLS_PENDING_FILE, items);
}

export function slugifyId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}

export function filterResources(
  items: ResourceItem[],
  query: string,
  tag: string | null
): ResourceItem[] {
  const q = query.trim().toLowerCase();
  return items.filter((item) => {
    const matchesTag = !tag || item.tags.includes(tag);
    if (!q) return matchesTag;
    const haystack = [
      item.name,
      item.description,
      item.tags.join(" "),
    ]
      .join(" ")
      .toLowerCase();
    return matchesTag && haystack.includes(q);
  });
}

export function filterSkills(
  items: SkillItem[],
  query: string,
  tag: string | null
): SkillItem[] {
  const q = query.trim().toLowerCase();
  return items.filter((item) => {
    const matchesTag = !tag || item.tags.includes(tag);
    if (!q) return matchesTag;
    const haystack = [
      item.name,
      item.description,
      item.intro,
      item.workflow.join(" "),
      item.useCases.join(" "),
      item.tags.join(" "),
    ]
      .join(" ")
      .toLowerCase();
    return matchesTag && haystack.includes(q);
  });
}

export function getAllTags(items: ResourceItem[]): string[] {
  const tags = new Set<string>();
  for (const item of items) {
    for (const tag of item.tags) {
      tags.add(tag);
    }
  }
  return Array.from(tags).sort((a, b) => a.localeCompare(b, "zh-CN"));
}
