# personal-site

中文个人站点：博客、MCP 目录、Skill 目录。基于 Next.js 15 + Tailwind CSS，JSON 文件存储，零数据库运维。

## 功能

- **首页** — 个人简介、最新博客、精选 MCP/Skill
- **博客** — MDX/Markdown 文章，标签筛选，RSS 订阅
- **MCP 目录** — 搜索与标签筛选
- **Skill 目录** — 搜索与标签筛选
- **Admin 后台** — 密码鉴权，MCP/Skill 增删改
- **自动发现** — 每周 GitHub Actions 发现候选资源，生成 PR（人工审核）

## 本地启动

```bash
cd personal-site
cp .env.example .env.local
npm install
npm run dev
```

> **注意**：本项目使用 **npm**（存在 `package-lock.json`）。若曾用 pnpm 安装，请先删除 `node_modules`、`pnpm-lock.yaml`、`pnpm-workspace.yaml` 再执行 `npm install`。混用包管理器会导致 `Cannot read properties of null (reading 'matches')` 错误。

访问 http://localhost:3000

开发模式下未设置 `ADMIN_PASSWORD` 时，Admin 后台自动放行。

## 环境变量

| 变量 | 必填 | 说明 |
|------|------|------|
| `NEXT_PUBLIC_SITE_URL` | 生产 | 站点 URL，用于 RSS 等 |
| `ADMIN_PASSWORD` | 生产 | Admin 后台密码 |
| `GITHUB_TOKEN` | 可选 | 发现脚本 GitHub API 限速提升 |

## 发布博客

在 `content/blog/` 下新建 `.mdx` 或 `.md` 文件：

```mdx
---
title: 文章标题
description: 摘要
date: 2026-07-05
tags:
  - 标签1
  - 标签2
---

正文内容…
```

保存后重新 build 即可。文章按日期倒序排列，自动计算阅读时间。

## 管理 MCP/Skill

1. 访问 `/admin`，输入 `ADMIN_PASSWORD` 登录
2. 切换 MCP / Skill 标签页
3. 填写表单添加，或编辑/删除已有条目

数据存储在 `data/mcp.json` 和 `data/skills.json`。

## 运行发现脚本

手动发现新的 MCP/Skill 候选（写入 `data/*-pending.json`）：

```bash
# 可选：设置 GITHUB_TOKEN 提高 API 限额
export GITHUB_TOKEN=ghp_xxx

npm run discover:mcp      # 发现 MCP 候选
npm run discover:skills   # 发现 Skill 候选
npm run discover          # 两者都跑
```

审核 `data/mcp-pending.json` 和 `data/skills-pending.json` 后，将有价值的条目复制到正式 JSON 文件。

GitHub Actions 工作流 `.github/workflows/discover-resources.yml` 每周一 UTC 03:00 自动运行，**仅创建 PR，不自动合并**。

## 测试

```bash
npm test                  # Vitest 单元测试
npm run test:e2e:install  # 首次安装 Playwright 浏览器
npm run test:e2e          # Playwright E2E（自动 build + start）
```

E2E 覆盖：首页、博客详情、MCP/Skill 列表、320px 移动端 viewport。

## 部署（Vercel）

**线上地址**：https://personal-site-blush-ten.vercel.app

1. 将仓库导入 [Vercel](https://vercel.com) 或使用 CLI：`npx vercel deploy --prod`
2. Root Directory 设为 `personal-site`（如在 monorepo 中）
3. 设置环境变量：
   - `NEXT_PUBLIC_SITE_URL` = 你的域名（如 `https://personal-site-blush-ten.vercel.app`）
   - `ADMIN_PASSWORD` = 安全密码
4. Deploy

Admin 后台：https://personal-site-blush-ten.vercel.app/admin

## Skill 详情页

每个 Skill 条目支持独立详情页（`/skills/[id]`），包含：

- **简介** — 详细说明
- **使用流程** — 分步操作指南
- **适用场景** — 推荐使用场景
- **前置条件** — 使用前准备
- **使用提示** — 最佳实践

在 Skill 目录点击名称或「查看详情 →」即可进入。数据存储在 `data/skills.json`，可通过 Admin 后台编辑。

## 项目结构

```
personal-site/
├── content/blog/          # 博客 MDX
├── data/                  # MCP/Skill JSON 数据
├── scripts/               # 发现脚本
├── src/
│   ├── app/               # 页面与 API
│   ├── components/        # UI 组件
│   └── lib/               # 数据、鉴权、博客逻辑
├── e2e/                   # Playwright 测试
└── .github/workflows/     # 自动发现 CI
```

## 技术栈

- Next.js 15 App Router + TypeScript
- Tailwind CSS 4 + Typography
- gray-matter + react-markdown
- Vitest + Playwright
- JSON 文件存储（无数据库）
