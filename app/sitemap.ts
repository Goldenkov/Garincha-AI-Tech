import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site";

const publicRoutes = [
  "/",
  "/pro",
  "/free",
  "/demo",
  "/partners",
  "/quick-start",
  "/tools",
  "/niches",
  "/progress",
  "/feedback",
  "/site-map",
  "/privacy",
  "/terms",
  "/en",
  "/en/partners",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map((path) => ({
    url: `${siteUrl}${path === "/" ? "" : path}`,
    lastModified: new Date(),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
