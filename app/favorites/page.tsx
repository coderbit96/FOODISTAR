"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { ProtectedPage } from "@/components/protected-page";
import { FoodCard } from "@/components/food-card";
import { useFoodistar } from "@/components/app-provider";

export default function FavoritesPage() {
  const { data, favorites } = useFoodistar();
  const favoriteItems = data.items.filter((item) => favorites.includes(item.id));

  return (
    <ProtectedPage>
      <main className="mx-auto w-full max-w-7xl px-4 py-6">
        <h1 className="text-3xl font-black text-slate-950">Favorites</h1>
        <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {favoriteItems.map((item) => (
            <FoodCard key={item.id} item={item} />
          ))}
        </section>
        {favoriteItems.length === 0 && (
          <div className="mt-5 rounded-lg border border-orange-100 bg-white p-8 text-center">
            <Heart className="mx-auto text-[#f04423]" />
            <p className="mt-3 font-black text-slate-950">No favorites yet.</p>
            <Link href="/" className="mt-4 inline-flex rounded-lg bg-[#f04423] px-4 py-3 text-sm font-black text-white">
              Explore menu
            </Link>
          </div>
        )}
      </main>
    </ProtectedPage>
  );
}
