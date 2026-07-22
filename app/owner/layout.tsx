import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Restaurant Owner Dashboard",
  description: "Manage a RasoiGo restaurant shop, menu items, order status, busy mode, and revenue analytics.",
  path: "/owner",
  noIndex: true
});

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return children;
}

