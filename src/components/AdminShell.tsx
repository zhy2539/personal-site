"use client";

import { useEffect, useState } from "react";
import { AdminPanel } from "@/components/AdminPanel";
import { BlogAdminPanel } from "@/components/BlogAdminPanel";

type AdminTab = "blog" | "mcp" | "skills";

export function AdminShell() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<AdminTab>("blog");

  useEffect(() => {
    fetch("/api/admin/auth")
      .then((r) => r.json())
      .then((data: { authenticated: boolean }) => {
        setAuthenticated(data.authenticated);
      })
      .finally(() => setChecking(false));
  }, []);

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
    } else {
      setError("密码错误");
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setAuthenticated(false);
    setPassword("");
  }

  if (checking) {
    return <p className="text-zinc-500">验证登录状态…</p>;
  }

  if (!authenticated) {
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
            autoComplete="current-password"
          />
        </label>
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          className="min-h-[44px] w-full rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700"
        >
          登录
        </button>
      </form>
    );
  }

  const tabs: { id: AdminTab; label: string }[] = [
    { id: "blog", label: "博客" },
    { id: "mcp", label: "MCP" },
    { id: "skills", label: "Skill" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">管理后台</h2>
        <button
          type="button"
          onClick={handleLogout}
          className="min-h-[44px] rounded-lg border border-zinc-300 px-4 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          退出登录
        </button>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`min-h-[44px] rounded-lg px-4 text-sm font-medium ${
              activeTab === tab.id
                ? "bg-blue-600 text-white"
                : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "blog" && <BlogAdminPanel />}
      {activeTab === "mcp" && <AdminPanel defaultTab="mcp" embedded />}
      {activeTab === "skills" && <AdminPanel defaultTab="skills" embedded />}
    </div>
  );
}
