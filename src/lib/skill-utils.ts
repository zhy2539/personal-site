import type { SkillItem } from "@/types";

export function normalizeSkillItem(
  partial: Partial<SkillItem> & Pick<SkillItem, "name" | "url">
): Omit<SkillItem, "updatedAt"> {
  return {
    id: partial.id ?? "",
    name: partial.name,
    description: partial.description ?? "",
    url: partial.url,
    tags: partial.tags ?? [],
    intro: partial.intro ?? partial.description ?? "",
    workflow: partial.workflow ?? [],
    useCases: partial.useCases ?? [],
    prerequisites: partial.prerequisites ?? [],
    tips: partial.tips ?? [],
  };
}

export function parseMultilineField(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function joinMultilineField(items: string[]): string {
  return items.join("\n");
}
