"use client";

import { useCallback, useEffect, useState } from "react";
import { joinMultilineField, parseMultilineField } from "@/lib/skill-utils";
import type { ResourceItem, SkillItem } from "@/types";

type ResourceType = "mcp" | "skills";

interface AdminPanelProps {
  embedded?: boolean;
  defaultTab?: ResourceType;
}

interface FormData {
  id: string;
  name: string;
  description: string;
  url: string;
  tags: string;
  intro: string;
  workflow: string;
  useCases: string;
  prerequisites: string;
  tips: string;
}

const emptyForm: FormData = {
  id: "",
  name: "",
  description: "",
  url: "",
  tags: "",
  intro: "",
  workflow: "",
  useCases: "",
  prerequisites: "",
  tips: "",
};

export function AdminPanel({ embedded = false, defaultTab = "mcp" }: AdminPanelProps) {
  const [authenticated, setAuthenticated] = useState(embedded);
  const [checking, setChecking] = useState(!embedded);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<ResourceType>(defaultTab);
  const [items, setItems] = useState<ResourceItem[]>([]);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const apiBase = `/api/${activeTab}`;
  const isSkillTab = activeTab === "skills";

  const loadItems = useCallback(async () => {
    const res = await fetch(apiBase);
    if (res.ok) {
      setItems(await res.json());
    }
  }, [apiBase]);

  useEffect(() => {
    if (embedded) {
      loadItems();
      return;
    }
    fetch("/api/admin/auth")
      .then((r) => r.json())
      .then((data: { authenticated: boolean }) => {
        setAuthenticated(data.authenticated);
        if (data.authenticated) loadItems();
      })
      .finally(() => setChecking(false));
  }, [loadItems, embedded]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setAuthenticated(true);
      await loadItems();
    } else {
      setError("密码错误");
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setAuthenticated(false);
    setPassword("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const payload: Record<string, unknown> = {
      id: form.id || undefined,
      name: form.name,
      description: form.description,
      url: form.url,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    if (isSkillTab) {
      payload.intro = form.intro;
      payload.workflow = parseMultilineField(form.workflow);
      payload.useCases = parseMultilineField(form.useCases);
      payload.prerequisites = parseMultilineField(form.prerequisites);
      payload.tips = parseMultilineField(form.tips);
    }

    const res = await fetch(apiBase, {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingId ? { ...payload, id: editingId } : payload),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "操作失败");
      return;
    }

    setForm(emptyForm);
    setEditingId(null);
    await loadItems();
  }

  async function handleDelete(id: string) {
    if (!confirm("确定删除此条目？")) return;
    const res = await fetch(`${apiBase}?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (res.ok) {
      await loadItems();
    }
  }

  function startEdit(item: ResourceItem) {
    setEditingId(item.id);
    const skill = item as SkillItem;
    setForm({
      id: item.id,
      name: item.name,
      description: item.description,
      url: item.url,
      tags: item.tags.join(", "),
      intro: skill.intro ?? "",
      workflow: joinMultilineField(skill.workflow ?? []),
      useCases: joinMultilineField(skill.useCases ?? []),
      prerequisites: joinMultilineField(skill.prerequisites ?? []),
      tips: joinMultilineField(skill.tips ?? []),
    });
  }

  if (!embedded && checking) {
    return <p className="text-zinc-500">验证登录状态…</p>;
  }

  if (!embedded && !authenticated) {
    return (
      <form onSubmit={handleLogin} className="mx-auto max-w-sm space-y-4">
        <h2 className="text-xl font-semibold">Admin 登录</h2>
        <label className="block">
          <span className="text-sm font-medium">密码</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full min-h-[44px] rounded-lg border border-zinc-300 px-4 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
        <button
          type="submit"
          className="min-h-[44px] w-full rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700"
        >
          登录
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-8">
      {!embedded && (
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">资源管理</h2>
          <button
            type="button"
            onClick={handleLogout}
            className="min-h-[44px] rounded-lg border border-zinc-300 px-4 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            退出登录
          </button>
        </div>
      )}

      {!embedded && (
      <div className="flex gap-2" role="tablist">
        {(["mcp", "skills"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => {
              setActiveTab(tab);
              setForm(emptyForm);
              setEditingId(null);
            }}
            className={`min-h-[44px] rounded-lg px-4 text-sm font-medium ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            }`}
          >
            {tab === "mcp" ? "MCP" : "Skill"}
          </button>
        ))}
      </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
        <h3 className="font-medium">{editingId ? "编辑条目" : "新增条目"}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium">名称 *</span>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full min-h-[44px] rounded-lg border border-zinc-300 px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">链接 *</span>
            <input
              required
              type="url"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              className="mt-1 w-full min-h-[44px] rounded-lg border border-zinc-300 px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
        </div>
        <label className="block">
          <span className="text-sm font-medium">卡片简介</span>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        {isSkillTab && (
          <>
            <label className="block">
              <span className="text-sm font-medium">详细介绍</span>
              <textarea
                value={form.intro}
                onChange={(e) => setForm({ ...form, intro: e.target.value })}
                rows={4}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">使用流程（每行一步）</span>
              <textarea
                value={form.workflow}
                onChange={(e) => setForm({ ...form, workflow: e.target.value })}
                rows={5}
                placeholder="第一步…&#10;第二步…"
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">适用场景（每行一条）</span>
              <textarea
                value={form.useCases}
                onChange={(e) => setForm({ ...form, useCases: e.target.value })}
                rows={3}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">前置条件（每行一条）</span>
              <textarea
                value={form.prerequisites}
                onChange={(e) => setForm({ ...form, prerequisites: e.target.value })}
                rows={3}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">使用提示（每行一条）</span>
              <textarea
                value={form.tips}
                onChange={(e) => setForm({ ...form, tips: e.target.value })}
                rows={3}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              />
            </label>
          </>
        )}
        <label className="block">
          <span className="text-sm font-medium">标签（逗号分隔）</span>
          <input
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            placeholder="官方, 开发, API"
            className="mt-1 w-full min-h-[44px] rounded-lg border border-zinc-300 px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
        <div className="flex gap-3">
          <button
            type="submit"
            className="min-h-[44px] rounded-lg bg-blue-600 px-5 text-sm font-medium text-white hover:bg-blue-700"
          >
            {editingId ? "保存" : "添加"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
              className="min-h-[44px] rounded-lg border border-zinc-300 px-5 text-sm font-medium dark:border-zinc-700"
            >
              取消
            </button>
          )}
        </div>
      </form>

      <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
        {items.map((item) => (
          <li key={item.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-zinc-500">{item.description.slice(0, 80)}…</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => startEdit(item)}
                className="min-h-[44px] rounded-lg border border-zinc-300 px-4 text-sm font-medium dark:border-zinc-700"
              >
                编辑
              </button>
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                className="min-h-[44px] rounded-lg border border-red-300 px-4 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950"
              >
                删除
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
