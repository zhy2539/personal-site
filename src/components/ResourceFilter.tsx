"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

interface ResourceFilterProps {
  basePath: string;
  tags: string[];
  placeholder?: string;
}

export function ResourceFilter({
  basePath,
  tags,
  placeholder = "搜索名称、描述或标签…",
}: ResourceFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const query = searchParams.get("q") ?? "";
  const activeTag = searchParams.get("tag") ?? "";

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }
      startTransition(() => {
        const qs = params.toString();
        router.push(qs ? `${basePath}?${qs}` : basePath);
      });
    },
    [basePath, router, searchParams]
  );

  return (
    <div className="space-y-4" aria-busy={isPending}>
      <label className="block">
        <span className="sr-only">搜索</span>
        <input
          type="search"
          defaultValue={query}
          placeholder={placeholder}
          onChange={(e) => updateParams({ q: e.target.value || null })}
          className="w-full min-h-[44px] rounded-lg border border-zinc-300 bg-white px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </label>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="按标签筛选">
          <button
            type="button"
            onClick={() => updateParams({ tag: null })}
            aria-pressed={!activeTag}
            className={`inline-flex min-h-[44px] items-center rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
              !activeTag
                ? "bg-blue-600 text-white"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
            }`}
          >
            全部
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() =>
                updateParams({ tag: activeTag === tag ? null : tag })
              }
              aria-pressed={activeTag === tag}
              className={`inline-flex min-h-[44px] items-center rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                activeTag === tag
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
