import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Favorites",
  description: "See your saved RasoiGo dishes and quickly order from favorite restaurants again.",
  path: "/favorites",
  noIndex: true
});

export default function FavoritesLayout({ children }: { children: React.ReactNode }) {
  return children;
}

