export interface ResourceItem {
  id: string;
  name: string;
  description: string;
  url: string;
  tags: string[];
  updatedAt: string;
}

export interface SkillItem extends ResourceItem {
  intro: string;
  workflow: string[];
  useCases: string[];
  prerequisites: string[];
  tips: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  readingTime: string;
  content: string;
  format: "markdown" | "rich";
}

export interface BlogMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  readingTime: string;
  format: "markdown" | "rich";
}

export interface SiteConfig {
  name: string;
  title: string;
  description: string;
  author: string;
  bio: string;
  github?: string;
  email?: string;
}
