import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Mirrors proxy.ts's full protected-route list — every one of these
// requires a session (and most also require a paid plan), so an
// unauthenticated crawler hitting any of them just burns crawl budget on
// a 307 to /quiz. Keep this in sync with proxy.ts's LOGIN_ONLY_ROUTES /
// REQUIRES_PLAN_ROUTES if either list changes.
const DISALLOWED_ROUTES = [
  "/api/",
  "/home",
  "/plan",
  "/success",
  "/settings",
  "/nutrition",
  "/progress",
  "/notifications",
  "/workouts",
  "/workout",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: DISALLOWED_ROUTES,
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
