import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BlogCard } from "@/components/BlogCard";
import { ResourceCard } from "@/components/ResourceCard";
import { getAllPosts } from "@/lib/blog";
import { getMcpItems, getSkillItems } from "@/lib/data";
import { siteConfig } from "@/lib/constants";

export default async function HomePage() {
  const [posts, mcpItems, skillItems] = await Promise.all([
    getAllPosts(),
    getMcpItems(),
    getSkillItems(),
  ]);

  const recentPosts = posts.slice(0, 3);
  const featuredMcp = mcpItems.slice(0, 3);
  const featuredSkills = skillItems.slice(0, 3);

  return (
    <>
      <Header />
      <main id="main-content" className="mx-auto max-w-5xl flex-1 px-4 py-10 sm:px-6">
        <section aria-labelledby="hero-heading" className="mb-14">
          <h1
            id="hero-heading"
            className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50"
          >
            {siteConfig.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
            {siteConfig.bio}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/blog"
              className="inline-flex min-h-[44px] items-center rounded-lg bg-blue-600 px-5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              阅读博客
            </Link>
            <Link
              href="/mcp"
              className="inline-flex min-h-[44px] items-center rounded-lg border border-zinc-300 px-5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              浏览 MCP
            </Link>
          </div>
        </section>

        <section aria-labelledby="recent-blog" className="mb-14">
          <div className="mb-6 flex items-center justify-between">
            <h2 id="recent-blog" className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              最新博客
            </h2>
            <Link
              href="/blog"
              className="min-h-[44px] inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              查看全部 →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentPosts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        </section>

        <section aria-labelledby="featured-mcp" className="mb-14">
          <div className="mb-6 flex items-center justify-between">
            <h2 id="featured-mcp" className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              精选 MCP
            </h2>
            <Link
              href="/mcp"
              className="min-h-[44px] inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              查看全部 →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredMcp.map((item) => (
              <ResourceCard key={item.id} item={item} type="mcp" />
            ))}
          </div>
        </section>

        <section aria-labelledby="featured-skills">
          <div className="mb-6 flex items-center justify-between">
            <h2 id="featured-skills" className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              精选 Skill
            </h2>
            <Link
              href="/skills"
              className="min-h-[44px] inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              查看全部 →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredSkills.map((item) => (
              <ResourceCard key={item.id} item={item} type="skill" />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
