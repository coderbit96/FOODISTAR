import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Wallet",
  description: "Add RasoiGo wallet balance and pay for food orders.",
  path: "/wallet",
  noIndex: true
});

export default function WalletLayout({ children }: { children: React.ReactNode }) {
  return children;
}
