"use client";

import { useEffect, useMemo, useState } from "react";
import { getFoodImageOptions } from "@/lib/food-images";

type FoodImageProps = {
  src: string;
  name: string;
  category?: string;
  className?: string;
  loading?: "eager" | "lazy";
};

const hardFallbacks = ["/food/image11.jpg", "/food/image8.avif"];

function apiImageUrl(name: string, category?: string) {
  const params = new URLSearchParams({ name });
  if (category) params.set("category", category);
  return `/api/food-image?${params.toString()}`;
}

export function FoodImage({ src, name, category, className, loading = "lazy" }: FoodImageProps) {
  const imageOptions = useMemo(() => getFoodImageOptions(name, category), [category, name]);
  const shouldResolveFromApi = !src || src.startsWith("/api/food-image");
  const sourceKey = `${src}|${name}|${category || ""}`;
  const sourceUrls = useMemo(() => {
    if (!src || src.startsWith("/api/food-image")) return [apiImageUrl(name, category), ...imageOptions];
    if (src.startsWith("/food/image")) return [...imageOptions, src];
    return [src, ...imageOptions];
  }, [category, imageOptions, name, src]);
  const initialUrls = useMemo(
    () => Array.from(new Set([...sourceUrls, ...hardFallbacks])),
    [sourceUrls]
  );
  const [resolvedApiUrls, setResolvedApiUrls] = useState<{ key: string; urls: string[] } | null>(null);
  const [fallbackState, setFallbackState] = useState({ key: "", index: 0 });
  const urls = resolvedApiUrls?.key === sourceKey ? resolvedApiUrls.urls : initialUrls;
  const activeIndex = fallbackState.key === sourceKey ? fallbackState.index : 0;

  useEffect(() => {
    if (!shouldResolveFromApi) return;

    let cancelled = false;
    async function loadImageOptions() {
      try {
        const response = await fetch(apiImageUrl(name, category));
        if (!response.ok) throw new Error("Food image API failed");
        const data = (await response.json()) as { fallbackUrls?: string[]; imageUrl?: string };
        const nextUrls = Array.from(new Set([data.imageUrl, ...(data.fallbackUrls || []), ...imageOptions, ...hardFallbacks].filter(Boolean))) as string[];
        if (!cancelled) {
          setResolvedApiUrls({ key: sourceKey, urls: nextUrls });
        }
      } catch {
        if (!cancelled) {
          setResolvedApiUrls({ key: sourceKey, urls: Array.from(new Set([...imageOptions, ...hardFallbacks])) });
        }
      }
    }

    void loadImageOptions();

    return () => {
      cancelled = true;
    };
  }, [category, imageOptions, name, shouldResolveFromApi, sourceKey]);

  return (
    <img
      src={urls[activeIndex] || hardFallbacks[0]}
      alt={name}
      className={className}
      loading={loading}
      decoding="async"
      onError={() => {
        setFallbackState((current) => ({
          key: sourceKey,
          index: Math.min((current.key === sourceKey ? current.index : 0) + 1, urls.length - 1)
        }));
      }}
    />
  );
}
