"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Search, SlidersHorizontal, Store } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { clsx } from "clsx";
import { ProtectedPage } from "@/components/protected-page";
import { FoodCard } from "@/components/food-card";
import { FoodImage } from "@/components/food-image";
import { useFoodistar } from "@/components/app-provider";
import { categories, categoryImages } from "@/lib/catalog";

export default function HomePage() {
  const { data, profile } = useFoodistar();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [foodType, setFoodType] = useState("all");
  const [sort, setSort] = useState("popular");
  const [categoryScrollPaused, setCategoryScrollPaused] = useState(false);
  const [heroScrollPaused, setHeroScrollPaused] = useState(false);
  const categoryScrollRef = useRef<HTMLDivElement | null>(null);
  const heroScrollRef = useRef<HTMLDivElement | null>(null);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return data.items
      .filter((item) => {
        const shop = data.shops.find((entry) => entry.id === item.shopId);
        const matchesQuery =
          !normalizedQuery ||
          item.name.toLowerCase().includes(normalizedQuery) ||
          item.description.toLowerCase().includes(normalizedQuery) ||
          shop?.name.toLowerCase().includes(normalizedQuery);
        const matchesCategory = category === "All" || item.category === category;
        const matchesFoodType = foodType === "all" || item.foodType === foodType;
        return matchesQuery && matchesCategory && matchesFoodType;
      })
      .sort((left, right) => {
        if (sort === "price-low") return left.price - right.price;
        if (sort === "latest") return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
        return right.rating - left.rating;
      });
  }, [category, data.items, data.shops, foodType, query, sort]);

  useEffect(() => {
    const scroller = categoryScrollRef.current;
    if (!scroller || categoryScrollPaused) return;

    const timer = window.setInterval(() => {
      const maxScroll = scroller.scrollWidth - scroller.clientWidth;
      if (maxScroll <= 0) return;

      if (scroller.scrollLeft >= maxScroll - 1) {
        scroller.scrollTo({ left: 0 });
        return;
      }

      scroller.scrollLeft += 1;
    }, 24);

    return () => window.clearInterval(timer);
  }, [categoryScrollPaused]);

  useEffect(() => {
    const scroller = heroScrollRef.current;
    if (!scroller || heroScrollPaused) return;

    const timer = window.setInterval(() => {
      const maxScroll = scroller.scrollWidth - scroller.clientWidth;
      if (maxScroll <= 0) return;

      if (scroller.scrollLeft >= maxScroll - 1) {
        scroller.scrollTo({ left: 0 });
        return;
      }

      scroller.scrollLeft += 1.4;
    }, 20);

    return () => window.clearInterval(timer);
  }, [heroScrollPaused]);

  const heroItems = useMemo(() => [...data.items, ...data.items].slice(0, 18), [data.items]);

  return (
    <ProtectedPage>
      <main className="mx-auto w-full max-w-7xl px-4 py-6">
        <section>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-lg border border-orange-100 bg-white shadow-sm"
          >
            <div className="p-5 md:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <span className="mb-3 inline-flex rounded-lg bg-orange-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-[#f04423]">
                    {profile?.role === "owner" ? "Owner mode" : "Fresh near you"}
                  </span>
                  <h1 className="max-w-2xl text-3xl font-black leading-tight text-slate-950 md:text-5xl">
                    Taste Bengali classics and fast food favorites.
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
                    Explore hand-picked dishes, add them to cart, and place your FOODISTAR order in seconds.
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-3">
                  <Link href="/cart" className="brand-focus rounded-full bg-[#f04423] px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-200">
                    Open cart
                  </Link>
                  {profile?.role === "owner" && (
                    <Link href="/owner" className="brand-focus rounded-full border border-orange-100 bg-orange-50 px-5 py-3 text-sm font-black text-[#f04423]">
                      Add item
                    </Link>
                  )}
                </div>
              </div>

              <div
                ref={heroScrollRef}
                className="mt-6 flex gap-4 overflow-x-auto pb-2"
                onMouseEnter={() => setHeroScrollPaused(true)}
                onMouseLeave={() => setHeroScrollPaused(false)}
                onTouchStart={() => setHeroScrollPaused(true)}
                onTouchEnd={() => setHeroScrollPaused(false)}
              >
                {heroItems.map((item, index) => (
                  <button
                    key={`${item.id}-${index}`}
                    className="brand-focus group relative h-44 min-w-[230px] overflow-hidden rounded-lg bg-orange-50 text-left shadow-sm ring-1 ring-orange-100 md:h-52 md:min-w-[300px]"
                    onClick={() => setQuery(item.name)}
                  >
                    <FoodImage src={item.image} name={item.name} category={item.category} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <p className="truncate text-lg font-black">{item.name}</p>
                      <p className="mt-1 text-sm font-bold text-orange-100">Rs {item.price} . {item.category}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

        </section>

        <section className="mt-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-950">Browse FOODISTAR</h2>
              <p className="mt-1 text-sm text-slate-500">Filter dishes by category, preference, or freshness.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="brand-focus flex min-w-0 items-center gap-2 rounded-lg border border-orange-100 bg-white px-3 py-2 shadow-sm">
                <Search size={18} className="shrink-0 text-[#f04423]" />
                <input
                  className="w-full min-w-0 border-0 bg-transparent text-sm outline-none"
                  placeholder="Search food or shops"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </label>
              <label className="flex items-center gap-2 rounded-lg border border-orange-100 bg-white px-3 py-2 shadow-sm">
                <SlidersHorizontal size={18} className="text-[#f04423]" />
                <select className="bg-transparent text-sm font-semibold outline-none" value={sort} onChange={(event) => setSort(event.target.value)}>
                  <option value="popular">Popular</option>
                  <option value="latest">Latest</option>
                  <option value="price-low">Price low</option>
                </select>
              </label>
            </div>
          </div>

          <div
            ref={categoryScrollRef}
            className="mt-4 flex gap-3 overflow-x-auto pb-2"
            onMouseEnter={() => setCategoryScrollPaused(true)}
            onMouseLeave={() => setCategoryScrollPaused(false)}
            onTouchStart={() => setCategoryScrollPaused(true)}
            onTouchEnd={() => setCategoryScrollPaused(false)}
            onFocus={() => setCategoryScrollPaused(true)}
            onBlur={() => setCategoryScrollPaused(false)}
          >
            {categories.map((entry) => (
              <button
                key={entry}
                className={clsx(
                  "brand-focus flex min-w-32 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-black transition",
                  category === entry ? "border-[#f04423] bg-[#f04423] text-white" : "border-orange-100 bg-white text-slate-700"
                )}
                onClick={() => setCategory(entry)}
              >
                <img src={categoryImages[entry]} alt="" className="h-9 w-9 rounded-lg object-cover" />
                {entry}
              </button>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {["all", "veg", "non veg"].map((option) => (
              <button
                key={option}
                className={clsx(
                  "brand-focus rounded-lg px-3 py-2 text-sm font-black capitalize",
                  foodType === option ? "bg-slate-950 text-white" : "bg-white text-slate-600 ring-1 ring-orange-100"
                )}
                onClick={() => setFoodType(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </section>

        <motion.section layout className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <FoodCard key={item.id} item={item} />
            ))}
          </AnimatePresence>
        </motion.section>

        {filteredItems.length === 0 && (
          <div className="mt-6 rounded-lg border border-orange-100 bg-white p-8 text-center">
            <Store className="mx-auto text-[#f04423]" />
            <p className="mt-3 font-black text-slate-950">No matching dishes found.</p>
          </div>
        )}
      </main>
    </ProtectedPage>
  );
}
