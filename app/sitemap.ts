import type { MetadataRoute } from "next";
import { APP_BASE_URL } from "@/lib/constants";
import { db } from "@/lib/db";

type SitemapBlogSummary = {
  slug: string;
  updated_at: Date;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogsResult = await db`
    SELECT slug, updated_at FROM arnnvv_blogs ORDER BY updated_at DESC
  `;

  const blogs = blogsResult as SitemapBlogSummary[];

  const blogUrls = blogs.map((blog) => ({
    url: `${APP_BASE_URL}/blogs/${blog.slug}`,
    lastModified: blog.updated_at,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const staticUrls = [
    {
      url: APP_BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1.0,
    },
    {
      url: `${APP_BASE_URL}/blogs`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${APP_BASE_URL}/work`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${APP_BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    },
  ] satisfies MetadataRoute.Sitemap;

  return [...staticUrls, ...blogUrls];
}
