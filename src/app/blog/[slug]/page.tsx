import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BlogContent } from "@/components/BlogContent";
import { getAllPosts, getPostBySlug } from "@/lib/blog";

export const revalidate = 0;

interface BlogDetailProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogDetailProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "文章未找到" };
  return {
    title: post.title,
    description: post.description,
  };
}

export default async function BlogDetailPage({ params }: BlogDetailProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <>
      <Header />
      <main id="main-content" className="mx-auto max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <Link
          href="/blog"
          className="inline-flex min-h-[44px] items-center text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          ← 返回博客列表
        </Link>

        <article className="mt-6">
          <header className="mb-8 border-b border-zinc-200 pb-6 dark:border-zinc-800">
            <time
              dateTime={post.date}
              className="text-sm font-medium text-zinc-400"
            >
              {post.date}
            </time>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {post.title}
            </h1>
            <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
              {post.description}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="inline-flex min-h-[32px] items-center rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  {tag}
                </Link>
              ))}
              <span className="ml-auto text-sm text-zinc-400">{post.readingTime}</span>
            </div>
          </header>
          <BlogContent content={post.content} format={post.format} />
        </article>
      </main>
      <Footer />
    </>
  );
}
