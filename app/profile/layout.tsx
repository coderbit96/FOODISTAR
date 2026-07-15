import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Profile",
  description: "Manage your RasoiGo profile, contact details, role, and account information.",
  path: "/profile",
  noIndex: true
});

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}

