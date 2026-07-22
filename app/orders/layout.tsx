import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Orders",
  description: "Track RasoiGo order status, delivery updates, ratings, reviews, and delivery partner activity.",
  path: "/orders",
  noIndex: true
});

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return children;
}

