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
  const sourceUrls = useMemo(() => {
    if (!src || src.startsWith("/api/food-image")) return [apiImageUrl(name, category), ...imageOptions];
    if (src.startsWith("/food/image")) return [...imageOptions, src];
    return [src, ...imageOptions];
  }, [category, imageOptions, name, src]);
  const initialUrls = useMemo(
    () => Array.from(new Set([...sourceUrls, ...hardFallbacks])),
    [sourceUrls]
  );
  const [urls, setUrls] = useState(initialUrls);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadImageOptions() {
      const shouldResolveFromApi = !src || src.startsWith("/api/food-image");
      if (!shouldResolveFromApi) {
        setUrls(Array.from(new Set([...sourceUrls, ...hardFallbacks])));
        setActiveIndex(0);
        return;
      }

      try {
        const response = await fetch(apiImageUrl(name, category));
        if (!response.ok) throw new Error("Food image API failed");
        const data = (await response.json()) as { fallbackUrls?: string[]; imageUrl?: string };
        const nextUrls = Array.from(new Set([data.imageUrl, ...(data.fallbackUrls || []), ...imageOptions, ...hardFallbacks].filter(Boolean))) as string[];
        if (!cancelled) {
          setUrls(nextUrls);
          setActiveIndex(0);
        }
      } catch {
        if (!cancelled) {
          setUrls(Array.from(new Set([...imageOptions, ...hardFallbacks])));
          setActiveIndex(0);
        }
      }
    }

    void loadImageOptions();

    return () => {
      cancelled = true;
    };
  }, [category, imageOptions, name, sourceUrls, src]);

  return (
    <img
      src={urls[activeIndex] || hardFallbacks[0]}
      alt={name}
      className={className}
      loading={loading}
      onError={() => setActiveIndex((current) => Math.min(current + 1, urls.length - 1))}
    />
  );
}
