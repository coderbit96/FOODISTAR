import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Sign In",
  description: "Sign in to RasoiGo to browse city shops, save favorites, track orders, and manage your food delivery account.",
  path: "/signin"
});

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return children;
}

