"use client";

import { useEffect, useMemo, useState } from "react";

type FoodImageProps = {
  src: string;
  name: string;
  category?: string;
  className?: string;
  loading?: "eager" | "lazy";
};

const hardFallbacks = ["/food/image2.webp", "/food/image10.avif", "/food/image1.jpg"];

function apiImageUrl(name: string, category?: string) {
  const params = new URLSearchParams({ name });
  if (category) params.set("category", category);
  return `/api/food-image?${params.toString()}`;
}

export function FoodImage({ src, name, category, className, loading = "lazy" }: FoodImageProps) {
  const initialUrls = useMemo(() => [src || apiImageUrl(name, category), ...hardFallbacks], [category, name, src]);
  const [urls, setUrls] = useState(initialUrls);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadImageOptions() {
      const shouldResolveFromApi = !src || src.startsWith("/api/food-image");
      if (!shouldResolveFromApi) {
        setUrls([src, ...hardFallbacks]);
        setActiveIndex(0);
        return;
      }

      try {
        const response = await fetch(apiImageUrl(name, category));
        if (!response.ok) throw new Error("Food image API failed");
        const data = (await response.json()) as { fallbackUrls?: string[]; imageUrl?: string };
        const nextUrls = Array.from(new Set([data.imageUrl, ...(data.fallbackUrls || []), ...hardFallbacks].filter(Boolean))) as string[];
        if (!cancelled) {
          setUrls(nextUrls);
          setActiveIndex(0);
        }
      } catch {
        if (!cancelled) {
          setUrls(hardFallbacks);
          setActiveIndex(0);
        }
      }
    }

    void loadImageOptions();

    return () => {
      cancelled = true;
    };
  }, [category, name, src]);

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
