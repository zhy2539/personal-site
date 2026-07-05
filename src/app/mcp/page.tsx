import { Suspense } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ResourceCard } from "@/components/ResourceCard";
import { ResourceFilter } from "@/components/ResourceFilter";
import { filterResources, getAllTags, getMcpItems } from "@/lib/data";

interface McpPageProps {
  searchParams: Promise<{ q?: string; tag?: string }>;
}

export const metadata = {
  title: "MCP 目录",
  description: "优质 Model Context Protocol 服务器策展目录，支持搜索与标签筛选。",
};

export default async function McpPage({ searchParams }: McpPageProps) {
  const params = await searchParams;
  const items = await getMcpItems();
  const tags = getAllTags(items);
  const filtered = filterResources(items, params.q ?? "", params.tag ?? null);

  return (
    <>
      <Header />
      <main id="main-content" className="mx-auto max-w-5xl flex-1 px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          MCP 目录
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          策展优质 Model Context Protocol 服务器，助力 AI Agent 接入外部工具。
        </p>

        <div className="mt-8">
          <Suspense fallback={<div className="h-24 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />}>
            <ResourceFilter basePath="/mcp" tags={tags} />
          </Suspense>
        </div>

        <p className="mt-6 text-sm text-zinc-500" aria-live="polite">
          共 {filtered.length} 个结果
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {filtered.map((item) => (
            <ResourceCard key={item.id} item={item} type="mcp" />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="mt-8 text-center text-zinc-500">未找到匹配的 MCP，请调整搜索条件。</p>
        )}
      </main>
      <Footer />
    </>
  );
}
