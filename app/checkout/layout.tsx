import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Checkout",
  description: "Choose your delivery address, coupon, schedule, and payment method for a RasoiGo order.",
  path: "/checkout",
  noIndex: true
});

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}

