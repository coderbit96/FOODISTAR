import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

const publicRoutes = [
  { path: "/", priority: 1 },
  { path: "/signin", priority: 0.5 },
  { path: "/signup", priority: 0.6 },
  { path: "/forgot-password", priority: 0.3 }
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return publicRoutes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified,
    changeFrequency: route.path === "/" ? "daily" : "monthly",
    priority: route.priority
  }));
}

