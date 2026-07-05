import type { SiteConfig } from "@/types";

export const siteConfig: SiteConfig = {
  name: "个人站点",
  title: "全栈开发者 · MCP & Skill 策展",
  description: "分享技术博客、优质 MCP 服务器与 Cursor Agent Skill 目录。",
  author: "开发者",
  bio: "专注 Web 全栈与 AI 工具链，持续探索 MCP 协议与 Agent Skill 生态，记录实践与思考。",
  github: "https://github.com",
};

export const NAV_ITEMS = [
  { href: "/", label: "首页" },
  { href: "/blog", label: "博客" },
  { href: "/mcp", label: "MCP" },
  { href: "/skills", label: "Skill" },
] as const;

export const DATA_DIR = "data";
export const MCP_FILE = "mcp.json";
export const SKILLS_FILE = "skills.json";
export const MCP_PENDING_FILE = "mcp-pending.json";
export const SKILLS_PENDING_FILE = "skills-pending.json";
export const BLOG_DIR = "content/blog";
