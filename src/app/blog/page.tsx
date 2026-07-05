import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BlogCard } from "@/components/BlogCard";
import { getAllPosts, getAllTags } from "@/lib/blog";

interface BlogPageProps {
  searchParams: Promise<{ tag?: string }>;
}

export const revalidate = 0;

export const metadata = {
  title: "博客",
  description: "技术博客，分享 MCP、Skill 与全栈开发实践。",
};

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const allPosts = await getAllPosts();
  const tags = await getAllTags();
  const posts = params.tag
    ? allPosts.filter((p) => p.tags.includes(params.tag!))
    : allPosts;

  return (
    <>
      <Header />
      <main id="main-content" className="mx-auto max-w-5xl flex-1 px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              博客
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              技术文章与实践记录
            </p>
          </div>
          <Link
            href="/api/rss"
            className="inline-flex min-h-[44px] items-center rounded-lg border border-zinc-300 px-4 text-sm font-medium text-zinc-700 hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            aria-label="订阅 RSS"
          >
            RSS 订阅
          </Link>
        </div>

        {tags.length > 0 && (
          <nav className="mt-6 flex flex-wrap gap-2" aria-label="博客标签">
            <Link
              href="/blog"
              className={`inline-flex min-h-[44px] items-center rounded-lg px-3 text-sm font-medium ${
                !params.tag
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
              全部
            </Link>
            {tags.map((tag) => (
              <Link
                key={tag}
                href={`/blog?tag=${encodeURIComponent(tag)}`}
                className={`inline-flex min-h-[44px] items-center rounded-lg px-3 text-sm font-medium ${
                  params.tag === tag
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
                }`}
              >
                {tag}
              </Link>
            ))}
          </nav>
        )}

        <div className="mt-8 grid gap-4">
          {posts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>

        {posts.length === 0 && (
          <p className="mt-8 text-center text-zinc-500">暂无文章。</p>
        )}
      </main>
      <Footer />
    </>
  );
}
