import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://personal-site-blush-ten.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();
  const skills = [
    "firecrawl-scrape",
    "create-skill",
    "workctl-operator",
    "hyperframes",
    "review-bugbot",
  ];

  return [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/mcp`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/skills`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    ...posts.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...skills.map((id) => ({
      url: `${siteUrl}/skills/${id}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
