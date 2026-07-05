import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  getAllPosts,
  getPostBySlug,
  saveBlogPost,
  deleteBlogPost,
} from "@/lib/blog";
import { slugifyBlogSlug, type BlogInput } from "@/lib/blog-admin";
import {
  syncFileToGitHub,
  deleteFileFromGitHub,
  shouldSyncToGitHub,
} from "@/lib/github-content";
import { triggerVercelDeploy } from "@/lib/blog-github";
import { BLOG_DIR } from "@/lib/constants";
import { serializeBlogPost } from "@/lib/blog-admin";
import {
  buildPreviewUrl,
  type PublishResult,
  type PublishStep,
} from "@/lib/publish-status";

function revalidateBlog(slug: string) {
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/");
  revalidatePath("/api/rss");
  revalidatePath("/sitemap.xml");
}

async function persistBlog(
  input: BlogInput,
  message: string,
  isDelete = false
): Promise<PublishResult> {
  const steps: PublishStep[] = [];
  const filePath = `${BLOG_DIR}/${input.slug}.mdx`;
  const previewUrl = buildPreviewUrl(input.slug);

  // 1. 本地写入/删除（开发环境有效）
  try {
    if (isDelete) {
      await deleteBlogPost(input.slug);
      steps.push({
        name: "本地删除",
        status: process.env.VERCEL ? "warning" : "success",
        message: process.env.VERCEL
          ? "Vercel 环境为临时删除，需同步 GitHub 才持久化"
          : "已从 content/blog/ 删除",
      });
    } else {
      await saveBlogPost(input);
      steps.push({
        name: "本地保存",
        status: process.env.VERCEL ? "warning" : "success",
        message: process.env.VERCEL
          ? "Vercel 环境为临时写入，需同步 GitHub 才持久化"
          : "已写入 content/blog/",
      });
    }
  } catch (err) {
    steps.push({
      name: isDelete ? "本地删除" : "本地保存",
      status: "error",
      message: err instanceof Error ? err.message : "操作失败",
    });
    return {
      success: false,
      slug: input.slug,
      previewUrl,
      steps,
      message: isDelete ? "删除失败：本地删除出错" : "发布失败：本地保存出错",
    };
  }

  // 2. GitHub 同步（生产环境必须成功）
  if (shouldSyncToGitHub()) {
    try {
      if (isDelete) {
        await deleteFileFromGitHub(filePath, message);
      } else {
        const raw = serializeBlogPost(input);
        const synced = await syncFileToGitHub(filePath, raw, message);
        if (!synced) throw new Error("GitHub 同步返回失败");
      }
      steps.push({
        name: "GitHub 同步",
        status: "success",
        message: `已提交到 ${process.env.GITHUB_REPO ?? "zhy2539/personal-site"}`,
      });
    } catch (err) {
      steps.push({
        name: "GitHub 同步",
        status: "error",
        message: err instanceof Error ? err.message : "同步失败",
      });
      return {
        success: false,
        slug: input.slug,
        previewUrl,
        steps,
        message: "发布失败：GitHub 同步出错，请检查 GITHUB_TOKEN 权限",
      };
    }
  } else if (process.env.VERCEL) {
    steps.push({
      name: "GitHub 同步",
      status: "error",
      message: "未配置 GITHUB_TOKEN，生产环境无法持久化",
    });
    return {
      success: false,
      slug: input.slug,
      previewUrl,
      steps,
      message: "发布失败：请在 Vercel 配置 GITHUB_TOKEN",
    };
  } else {
    steps.push({
      name: "GitHub 同步",
      status: "warning",
      message: "本地开发模式，跳过 GitHub 同步",
    });
  }

  // 3. 缓存刷新
  try {
    revalidateBlog(input.slug);
    steps.push({
      name: "缓存刷新",
      status: "success",
      message: "已刷新首页、博客列表与详情页缓存",
    });
  } catch (err) {
    steps.push({
      name: "缓存刷新",
      status: "warning",
      message: err instanceof Error ? err.message : "刷新失败",
    });
  }

  // 4. 验证前台可读
  try {
    const post = await getPostBySlug(input.slug);
    if (!isDelete && post) {
      steps.push({
        name: "前台验证",
        status: "success",
        message: `文章「${post.title}」已可在前台读取`,
      });
    } else if (isDelete) {
      steps.push({
        name: "前台验证",
        status: "success",
        message: "文章已从数据源删除",
      });
    } else {
      steps.push({
        name: "前台验证",
        status: "warning",
        message: "保存成功但前台暂未读取到，请稍后刷新",
      });
    }
  } catch {
    steps.push({
      name: "前台验证",
      status: "warning",
      message: "无法验证前台状态，请手动刷新页面",
    });
  }

  // 5. 可选：触发 Vercel 重新部署
  if (shouldSyncToGitHub()) {
    const deployed = await triggerVercelDeploy();
    steps.push({
      name: "部署触发",
      status: deployed ? "success" : "warning",
      message: deployed
        ? "已触发 Vercel 重新部署"
        : "未配置 VERCEL_DEPLOY_HOOK_URL，GitHub 推送后将自动部署",
    });
  }

  return {
    success: true,
    slug: input.slug,
    previewUrl,
    steps,
    message: isDelete ? "删除成功" : "发布成功！文章已同步，前台即将更新",
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (slug) {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }
    const post = await getPostBySlug(slug);
    if (!post) {
      return NextResponse.json({ error: "未找到" }, { status: 404 });
    }
    return NextResponse.json(post);
  }

  const posts = await getAllPosts();
  return NextResponse.json(posts);
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const body = (await request.json()) as Partial<BlogInput>;
  if (!body.title?.trim()) {
    return NextResponse.json({ error: "标题为必填" }, { status: 400 });
  }

  const slug = body.slug?.trim() || slugifyBlogSlug(body.title);
  const existing = await getPostBySlug(slug);
  if (existing) {
    return NextResponse.json({ error: "slug 已存在" }, { status: 409 });
  }

  const input: BlogInput = {
    slug,
    title: body.title.trim(),
    description: body.description?.trim() ?? "",
    date: body.date ?? new Date().toISOString().slice(0, 10),
    tags: body.tags ?? [],
    content: body.content ?? "",
    format: body.format === "markdown" ? "markdown" : "rich",
  };

  const publish = await persistBlog(input, `blog: add ${slug}`);
  const post = await getPostBySlug(slug);

  if (!publish.success) {
    return NextResponse.json({ error: publish.message, publish }, { status: 500 });
  }

  return NextResponse.json({ post, publish }, { status: 201 });
}

export async function PUT(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const body = (await request.json()) as Partial<BlogInput> & { slug: string };
  if (!body.slug) {
    return NextResponse.json({ error: "缺少 slug" }, { status: 400 });
  }
  if (!body.title?.trim()) {
    return NextResponse.json({ error: "标题为必填" }, { status: 400 });
  }

  const existing = await getPostBySlug(body.slug);
  if (!existing) {
    return NextResponse.json({ error: "未找到" }, { status: 404 });
  }

  const input: BlogInput = {
    slug: body.slug,
    title: body.title.trim(),
    description: body.description?.trim() ?? "",
    date: body.date ?? existing.date,
    tags: body.tags ?? [],
    content: body.content ?? "",
    format: body.format === "markdown" ? "markdown" : "rich",
  };

  const publish = await persistBlog(input, `blog: update ${body.slug}`);
  const post = await getPostBySlug(body.slug);

  if (!publish.success) {
    return NextResponse.json({ error: publish.message, publish }, { status: 500 });
  }

  return NextResponse.json({ post, publish });
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "缺少 slug" }, { status: 400 });
  }

  const existing = await getPostBySlug(slug);
  if (!existing) {
    return NextResponse.json({ error: "未找到" }, { status: 404 });
  }

  const publish = await persistBlog(
    {
      slug,
      title: slug,
      description: "",
      date: new Date().toISOString().slice(0, 10),
      tags: [],
      content: "",
      format: "rich",
    },
    `blog: delete ${slug}`,
    true
  );

  if (!publish.success) {
    return NextResponse.json({ error: publish.message, publish }, { status: 500 });
  }

  return NextResponse.json({ ok: true, publish });
}
