import Link from "next/link";
import type { BlogMeta } from "@/types";

interface BlogCardProps {
  post: BlogMeta;
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      <time
        dateTime={post.date}
        className="text-xs font-medium text-zinc-400 dark:text-zinc-500"
      >
        {post.date}
      </time>
      <h3 className="mt-1 text-lg font-semibold">
        <Link
          href={`/blog/${post.slug}`}
          className="text-zinc-900 hover:text-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:text-zinc-50 dark:hover:text-blue-400"
        >
          {post.title}
        </Link>
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {post.description}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {post.tags.map((tag) => (
          <Link
            key={tag}
            href={`/blog?tag=${encodeURIComponent(tag)}`}
            className="inline-flex min-h-[32px] items-center rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
          >
            {tag}
          </Link>
        ))}
        <span className="ml-auto text-xs text-zinc-400">{post.readingTime}</span>
      </div>
    </article>
  );
}
