import { describe, it, expect } from "vitest";
import { filterResources, getAllTags, slugifyId } from "./data";
import type { ResourceItem } from "@/types";

const sampleItems: ResourceItem[] = [
  {
    id: "test-mcp",
    name: "Test MCP",
    description: "A test MCP server for filesystem",
    url: "https://example.com/mcp",
    tags: ["文件", "官方"],
    updatedAt: "2026-01-01",
  },
  {
    id: "search-mcp",
    name: "Search MCP",
    description: "Web search integration",
    url: "https://example.com/search",
    tags: ["搜索", "API"],
    updatedAt: "2026-02-01",
  },
];

describe("filterResources", () => {
  it("returns all items when no filter", () => {
    expect(filterResources(sampleItems, "", null)).toHaveLength(2);
  });

  it("filters by query", () => {
    const result = filterResources(sampleItems, "filesystem", null);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Test MCP");
  });

  it("filters by tag", () => {
    const result = filterResources(sampleItems, "", "搜索");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Search MCP");
  });

  it("filters by query and tag combined", () => {
    const result = filterResources(sampleItems, "search", "API");
    expect(result).toHaveLength(1);
  });
});

describe("getAllTags", () => {
  it("returns sorted unique tags", () => {
    const tags = getAllTags(sampleItems);
    expect(tags).toHaveLength(4);
    expect(tags).toContain("API");
    expect(tags).toContain("官方");
    expect(tags).toContain("搜索");
    expect(tags).toContain("文件");
  });
});

describe("slugifyId", () => {
  it("creates slug from name", () => {
    expect(slugifyId("Hello World MCP")).toBe("hello-world-mcp");
  });

  it("handles Chinese characters", () => {
    expect(slugifyId("文件系统 MCP")).toBe("文件系统-mcp");
  });
});
