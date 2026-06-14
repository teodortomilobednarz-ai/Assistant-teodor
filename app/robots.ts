import type { MetadataRoute } from "next";

const siteUrl = process.env.AUTH_URL ?? "https://draidly.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The dashboard is per-user and auth-gated — keep it out of indexes.
      disallow: "/dashboard",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
