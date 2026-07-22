import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Admin Dashboard",
  description: "Manage RasoiGo users, shops, menu items, orders, roles, suspensions, and platform revenue.",
  path: "/admin",
  noIndex: true
});

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}

