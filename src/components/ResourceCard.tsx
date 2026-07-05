import Link from "next/link";
import type { ResourceItem } from "@/types";

interface ResourceCardProps {
  item: ResourceItem;
  type: "mcp" | "skill";
}

export function ResourceCard({ item, type }: ResourceCardProps) {
  const label = type === "mcp" ? "MCP" : "Skill";
  const detailHref = type === "skill" ? `/skills/${item.id}` : null;

  return (
    <article className="flex flex-col rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-2 flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          {detailHref ? (
            <Link
              href={detailHref}
              className="rounded-sm hover:text-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:hover:text-blue-400"
            >
              {item.name}
            </Link>
          ) : (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm hover:text-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:hover:text-blue-400"
            >
              {item.name}
            </a>
          )}
        </h3>
        <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          {label}
        </span>
      </div>
      <p className="mb-4 flex-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {item.description}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {item.tags.map((tag) => (
          <Link
            key={tag}
            href={`/${type === "mcp" ? "mcp" : "skills"}?tag=${encodeURIComponent(tag)}`}
            className="inline-flex min-h-[32px] items-center rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            {tag}
          </Link>
        ))}
        {detailHref ? (
          <Link
            href={detailHref}
            className="ml-auto inline-flex min-h-[44px] items-center text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            查看详情 →
          </Link>
        ) : (
          <time
            dateTime={item.updatedAt}
            className="ml-auto text-xs text-zinc-400 dark:text-zinc-500"
          >
            更新 {item.updatedAt}
          </time>
        )}
      </div>
    </article>
  );
}
