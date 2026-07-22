import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Reset Password",
  description: "Reset your RasoiGo account password securely and get back to ordering from your favorite city restaurants.",
  path: "/forgot-password"
});

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}

