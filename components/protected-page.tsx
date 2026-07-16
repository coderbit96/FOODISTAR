"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SiteNav } from "@/components/site-nav";
import { useRasoiGo } from "@/components/app-provider";
import { Preloader } from "@/components/preloader";
import { LoginOfferPopup } from "@/components/login-offer-popup";

export function ProtectedPage({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useRasoiGo();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !profile) router.replace("/signin");
  }, [loading, profile, router]);

  if (loading || !profile) {
    return <Preloader />;
  }

  return (
    <div className="rasoigo-shell">
      <SiteNav />
      <LoginOfferPopup />
      {children}
    </div>
  );
}
