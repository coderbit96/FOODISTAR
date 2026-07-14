"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SiteNav } from "@/components/site-nav";
import { useFoodistar } from "@/components/app-provider";
import { Preloader } from "@/components/preloader";

export function ProtectedPage({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useFoodistar();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !profile) router.replace("/signin");
  }, [loading, profile, router]);

  if (loading || !profile) {
    return <Preloader />;
  }

  return (
    <div className="foodistar-shell">
      <SiteNav />
      {children}
    </div>
  );
}
