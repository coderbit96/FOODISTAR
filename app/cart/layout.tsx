import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Cart",
  description: "Review your selected RasoiGo dishes, update quantities, and continue to checkout.",
  path: "/cart",
  noIndex: true
});

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}

