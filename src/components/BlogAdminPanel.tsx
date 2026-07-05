"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import type { PublishResult } from "@/lib/publish-status";
import { PublishStatusBanner } from "@/components/PublishStatusBanner";
import { contentForEditor } from "@/lib/blog-admin";
import type { BlogMeta, BlogPost } from "@/types";

const RichTextEditor = dynamic(
  () =>
    import("@/components/RichTextEditor").then((m) => m.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <div className="h-72 animate-pulse rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900" />
    ),
  }
);

interface BlogForm {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string;
  content: string;
}

const emptyForm: BlogForm = {
  slug: "",
  title: "",
  description: "",
  date: new Date().toISOString().slice(0, 10),
  tags: "",
  content: "",
};

function isEmptyContent(html: string): boolean {
  const text = html.replace(/<[^>]+>/g, "").trim();
  return !text;
}

export function BlogAdminPanel() {
  const [posts, setPosts] = useState<BlogMeta[]>([]);
  const [form, setForm] = useState<BlogForm>(emptyForm);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editorKey, setEditorKey] = useState(0);
  const [publishResult, setPublishResult] = useState<PublishResult | null>(null);

  const loadPosts = useCallback(async () => {
    const res = await fetch("/api/blog");
    if (res.ok) setPosts(await res.json());
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  async function loadPost(slug: string) {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/blog?slug=${encodeURIComponent(slug)}`);
    setLoading(false);
    if (!res.ok) {
      setError("加载文章失败");
      return;
    }
    const post: BlogPost = await res.json();
    const html = await contentForEditor(post.content, post.format);
    setEditingSlug(slug);
    setForm({
      slug: post.slug,
      title: post.title,
      description: post.description,
      date: post.date,
      tags: post.tags.join(", "),
      content: html,
    });
    setEditorKey((k) => k + 1);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (isEmptyContent(form.content)) {
      setError("正文不能为空");
      return;
    }

    setLoading(true);
    setPublishResult(null);

    const payload = {
      slug: form.slug || undefined,
      title: form.title,
      description: form.description,
      date: form.date,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      content: form.content,
      format: "rich" as const,
    };

    const res = await fetch("/api/blog", {
      method: editingSlug ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        editingSlug ? { ...payload, slug: editingSlug } : payload
      ),
    });

    setLoading(false);

    const data = await res.json();

    if (!res.ok) {
      if (data.publish) {
        setPublishResult(data.publish as PublishResult);
      }
      setError(data.error ?? "保存失败");
      return;
    }

    setPublishResult(data.publish as PublishResult);
    setForm(emptyForm);
    setEditingSlug(null);
    setEditorKey((k) => k + 1);
    await loadPosts();
  }

  async function handleDelete(slug: string) {
    if (!confirm(`确定删除文章「${slug}」？`)) return;
    setPublishResult(null);
    const res = await fetch(`/api/blog?slug=${encodeURIComponent(slug)}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (res.ok) {
      if (data.publish) setPublishResult(data.publish as PublishResult);
      if (editingSlug === slug) {
        setEditingSlug(null);
        setForm(emptyForm);
        setEditorKey((k) => k + 1);
      }
      await loadPosts();
    } else {
      setError(data.error ?? "删除失败");
      if (data.publish) setPublishResult(data.publish as PublishResult);
    }
  }

  function startNew() {
    setEditingSlug(null);
    setForm({ ...emptyForm, date: new Date().toISOString().slice(0, 10) });
    setEditorKey((k) => k + 1);
    setError("");
    setPublishResult(null);
  }

  return (
    <div className="space-y-8">
      <PublishStatusBanner
        result={publishResult}
        onClose={() => setPublishResult(null)}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-500">
          富文本编辑器，手机/电脑均可使用；保存后自动同步 GitHub。
        </p>
        <button
          type="button"
          onClick={startNew}
          className="min-h-[44px] rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700"
        >
          新建文章
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-zinc-200 p-4 sm:p-5 dark:border-zinc-800"
      >
        <h3 className="font-medium">
          {editingSlug ? `编辑：${editingSlug}` : "新建文章"}
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium">标题 *</span>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="mt-1 w-full min-h-[44px] rounded-lg border border-zinc-300 px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">
              Slug {editingSlug ? "" : "（留空自动生成）"}
            </span>
            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              disabled={Boolean(editingSlug)}
              placeholder="my-post"
              className="mt-1 w-full min-h-[44px] rounded-lg border border-zinc-300 px-3 text-sm disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium">日期</span>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="mt-1 w-full min-h-[44px] rounded-lg border border-zinc-300 px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">标签（逗号分隔）</span>
            <input
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="教程, MCP"
              className="mt-1 w-full min-h-[44px] rounded-lg border border-zinc-300 px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium">摘要</span>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>

        <div>
          <span className="text-sm font-medium">正文 *</span>
          <div className="mt-1">
            <RichTextEditor
              key={editorKey}
              value={form.content}
              onChange={(html) => setForm({ ...form, content: html })}
              placeholder="开始写作…"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={loading}
            className="min-h-[44px] rounded-lg bg-blue-600 px-5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "保存中…" : editingSlug ? "保存" : "发布"}
          </button>
          {editingSlug && (
            <>
              <Link
                href={`/blog/${editingSlug}`}
                target="_blank"
                className="inline-flex min-h-[44px] items-center rounded-lg border border-zinc-300 px-5 text-sm font-medium dark:border-zinc-700"
              >
                预览
              </Link>
              <button
                type="button"
                onClick={startNew}
                className="min-h-[44px] rounded-lg border border-zinc-300 px-5 text-sm font-medium dark:border-zinc-700"
              >
                取消
              </button>
            </>
          )}
        </div>
      </form>

      <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
        {posts.map((post) => (
          <li
            key={post.slug}
            className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium">{post.title}</p>
              <p className="text-sm text-zinc-500">
                {post.date} · /blog/{post.slug}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => loadPost(post.slug)}
                className="min-h-[44px] rounded-lg border border-zinc-300 px-4 text-sm font-medium dark:border-zinc-700"
              >
                编辑
              </button>
              <button
                type="button"
                onClick={() => handleDelete(post.slug)}
                className="min-h-[44px] rounded-lg border border-red-300 px-4 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950"
              >
                删除
              </button>
            </div>
          </li>
        ))}
        {posts.length === 0 && (
          <li className="p-8 text-center text-zinc-500">暂无文章</li>
        )}
      </ul>
    </div>
  );
}
