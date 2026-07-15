import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Create Account",
  description: "Create a RasoiGo account as a customer, restaurant owner, or delivery partner for a faster food ordering experience.",
  path: "/signup"
});

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return children;
}

