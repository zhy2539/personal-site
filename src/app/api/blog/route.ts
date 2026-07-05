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
import { BLOG_DIR } from "@/lib/constants";
import { serializeBlogPost } from "@/lib/blog-admin";

function revalidateBlog(slug: string) {
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/");
  revalidatePath("/api/rss");
}

async function persistBlog(input: BlogInput, message: string) {
  const post = await saveBlogPost(input);
  const filePath = `${BLOG_DIR}/${input.slug}.mdx`;
  if (shouldSyncToGitHub()) {
    const raw = serializeBlogPost(input);
    await syncFileToGitHub(filePath, raw, message);
  }
  revalidateBlog(input.slug);
  return post;
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

  const post = await persistBlog(input, `blog: add ${slug}`);
  return NextResponse.json(post, { status: 201 });
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

  const post = await persistBlog(input, `blog: update ${body.slug}`);
  return NextResponse.json(post);
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

  await deleteBlogPost(slug);
  const filePath = `${BLOG_DIR}/${slug}.mdx`;

  if (shouldSyncToGitHub()) {
    await deleteFileFromGitHub(filePath, `blog: delete ${slug}`);
  }

  revalidateBlog(slug);
  return NextResponse.json({ ok: true });
}
