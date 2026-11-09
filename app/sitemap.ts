import type { MetadataRoute } from "next";

import { catalogNiches } from "@/lib/catalog";
import { siteUrl } from "@/lib/site";

const publicRoutes = ["/", "/start", "/start/idea", "/start/advisor", "/niches", "/example", "/pro", "/free", "/partners", "/feedback", "/privacy", "/terms", "/en", "/en/partners"];

export default function sitemap(): MetadataRoute.Sitemap {
  return [...publicRoutes, ...catalogNiches.map((niche) => `/niches/${niche.id}`)].map((path) => ({
    url: `${siteUrl}${path === "/" ? "" : path}`,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
