import type { MetadataRoute } from "next";

const BASE = "https://draidly.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/tarifs", "/privacy", "/terms", "/mentions-legales"];
  return routes.map((path) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.6,
  }));
}
