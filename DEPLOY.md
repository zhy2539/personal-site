# 部署上线指南

## 一键部署流程

```bash
cd ~/Desktop/personal-site

# 1. 本地验证
npm install
npm run build
npm test

# 2. 提交代码
git add -A
git commit -m "your message"
git push origin main

# 3. 生产部署（Vercel 已关联 GitHub 时会自动部署，也可手动）
npx vercel deploy --prod
```

**线上地址**：https://personal-site-blush-ten.vercel.app

---

## 环境变量（Vercel 控制台 → Settings → Environment Variables）

| 变量 | 必填 | 说明 |
|------|------|------|
| `NEXT_PUBLIC_SITE_URL` | ✅ | 站点 URL，如 `https://personal-site-blush-ten.vercel.app` |
| `ADMIN_PASSWORD` | ✅ | 后台登录密码 |
| `GITHUB_TOKEN` | ✅ 生产 | Admin 保存博客/MCP 时同步到 GitHub |
| `GITHUB_REPO` | 可选 | 默认 `zhy2539/personal-site` |
| `GITHUB_BRANCH` | 可选 | 默认 `main` |

---

## 性能优化（已内置）

- Next.js 静态页面 + ISR（`revalidate`）
- 字体 `display: swap`，减少阻塞
- Gzip/Brotli 压缩（Vercel 默认）
- 静态资源长期缓存（`vercel.json` Cache-Control）
- TipTap 按需加载（`dynamic import`，不阻塞首屏）
- `sitemap.xml` + `robots.txt` 自动生成
- Open Graph / Twitter Card 元数据

### 进一步加速建议

1. **连接 GitHub 自动部署**：Vercel → Project → Git → Connect Repository
2. **自定义域名**：Vercel → Domains → 添加域名并更新 DNS
3. **图片**：使用 Next.js `<Image>` 组件，自动 WebP/AVIF
4. **分析**：Vercel Analytics（免费层）监控 Core Web Vitals

---

## 手机 + 电脑适配（已内置）

- 移动优先 Tailwind 响应式布局（320px ~ 1440px）
- 所有按钮/链接最小点击区域 44×44px
- Admin 富文本工具栏横向滚动，手机可用
- `viewport` 元数据 + PWA 基础配置
- 语义化 HTML + 键盘导航 + 跳过链接

---

## 后台写博客

1. 打开 https://personal-site-blush-ten.vercel.app/admin
2. 输入 `ADMIN_PASSWORD` 登录
3. 点击 **博客** 标签 → **新建文章**
4. 使用富文本编辑器写作，点击 **发布**
5. 生产环境自动提交 GitHub → Vercel 重新部署（约 1 分钟）

---

## 常见问题

**Q: 保存后线上没更新？**  
A: 确认 Vercel 已设置 `GITHUB_TOKEN`，且 token 有 `repo` + `workflow` 权限。

**Q: 推送 GitHub 失败？**  
A: 运行 `gh auth login` 重新授权，需 `workflow` scope。

**Q: npm install 报错 `matches`？**  
A: 删除 `node_modules`、`pnpm-lock.yaml` 后只用 `npm install`，不要混用 pnpm。
