import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: "/", lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: "/optimize", lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: "/stress-test", lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: "/audit-log", lastModified: now, changeFrequency: "daily", priority: 0.8 },
  ];
}