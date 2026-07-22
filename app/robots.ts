import type { MetadataRoute } from "next";
import { absoluteUrl, appUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/signin", "/signup", "/forgot-password", "/food/"],
        disallow: ["/admin", "/cart", "/checkout", "/favorites", "/orders", "/owner", "/profile", "/api/"]
      }
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: appUrl
  };
}

