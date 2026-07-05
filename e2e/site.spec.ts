import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("renders hero and navigation", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "主导航" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "主导航" }).getByRole("link", { name: "博客", exact: true })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "主导航" }).getByRole("link", { name: "MCP" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "主导航" }).getByRole("link", { name: "Skill" })).toBeVisible();
  });

  test("shows recent blog posts", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "最新博客" })).toBeVisible();
  });
});

test.describe("Blog", () => {
  test("blog list page loads", async ({ page }) => {
    await page.goto("/blog");
    await expect(page.getByRole("heading", { name: "博客" })).toBeVisible();
  });

  test("blog detail page loads", async ({ page }) => {
    await page.goto("/blog/welcome");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("欢迎来到");
    await expect(page.locator("time").first()).toBeVisible();
  });
});

test.describe("MCP directory", () => {
  test("lists MCP items with search", async ({ page }) => {
    await page.goto("/mcp");
    await expect(page.getByRole("heading", { name: "MCP 目录" })).toBeVisible();
    await expect(page.getByPlaceholder("搜索名称、描述或标签")).toBeVisible();
    await expect(page.getByText("Filesystem MCP")).toBeVisible();
  });
});

test.describe("Skill directory", () => {
  test("lists Skill items", async ({ page }) => {
    await page.goto("/skills");
    await expect(page.getByRole("heading", { name: "Skill 目录" })).toBeVisible();
    await expect(page.getByText("Firecrawl Scrape")).toBeVisible();
  });

  test("skill detail page opens from list", async ({ page }) => {
    await page.goto("/skills");
    await page.getByRole("link", { name: "Firecrawl Scrape" }).click();
    await expect(page).toHaveURL(/\/skills\/firecrawl-scrape/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Firecrawl Scrape");
    await expect(page.getByRole("heading", { name: "简介" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "使用流程" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "适用场景" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "前置条件" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "使用提示" })).toBeVisible();
  });

  test("skill detail via 查看详情 link", async ({ page }) => {
    await page.goto("/skills");
    await page.getByRole("link", { name: "查看详情 →" }).first().click();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: "← 返回 Skill 目录" })).toBeVisible();
  });
});

test.describe("Mobile viewport", () => {
  test.use({ viewport: { width: 320, height: 568 } });

  test("no horizontal scroll on home", async ({ page }) => {
    await page.goto("/");
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });

  test("navigation is accessible on mobile", async ({ page }) => {
    await page.goto("/");
    const navLinks = page.getByRole("navigation", { name: "主导航" }).getByRole("link");
    await expect(navLinks.first()).toBeVisible();
  });
});
