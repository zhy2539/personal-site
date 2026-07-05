import { Feed } from "feed";
import { getAllPosts } from "@/lib/blog";
import { siteConfig } from "@/lib/constants";

export async function GET() {
  const posts = await getAllPosts();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const feed = new Feed({
    title: siteConfig.title,
    description: siteConfig.description,
    id: siteUrl,
    link: siteUrl,
    language: "zh-CN",
    favicon: `${siteUrl}/favicon.ico`,
    copyright: `© ${new Date().getFullYear()} ${siteConfig.author}`,
  });

  for (const post of posts) {
    feed.addItem({
      title: post.title,
      id: `${siteUrl}/blog/${post.slug}`,
      link: `${siteUrl}/blog/${post.slug}`,
      description: post.description,
      date: new Date(post.date),
    });
  }

  return new Response(feed.rss2(), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
