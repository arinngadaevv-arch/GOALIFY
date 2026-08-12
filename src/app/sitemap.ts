import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// A fixed date, not `new Date()` — this function reruns on every crawl
// request, so a live timestamp here would tell Google these pages change
// every single second, which is both false and wastes crawl-freshness
// signal. Bump this manually when the landing/quiz content actually changes.
const CONTENT_LAST_MODIFIED = new Date("2026-08-12");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${siteUrl}/`,
      lastModified: CONTENT_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/quiz`,
      lastModified: CONTENT_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
