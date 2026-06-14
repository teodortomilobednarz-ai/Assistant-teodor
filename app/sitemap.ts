import type { MetadataRoute } from "next";

const siteUrl = process.env.AUTH_URL ?? "https://draidly.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
