"use client";

import { Heart, Minus, Plus, ShoppingCart, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { useRasoiGo } from "@/components/app-provider";
import { FoodImage } from "@/components/food-image";
import type { MenuItem } from "@/lib/types";

export function FoodCard({ item }: { item: MenuItem }) {
  const router = useRouter();
  const { addToCart, updateCartQuantity, cart, toggleFavorite, favorites, profile } = useRasoiGo();
  const favorite = favorites.includes(item.id);
  const canOrder = profile?.role === "user";
  const cartItem = cart.find((entry) => entry.id === item.id);
  const displayQuantity = cartItem?.quantity ?? 0;
  const readyToCheckout = displayQuantity > 0;

  const handleAddToCart = () => {
    if (!readyToCheckout) return;
    router.push("/checkout");
  };

  const handleDecreaseQuantity = () => {
    if (cartItem) {
      updateCartQuantity(item.id, cartItem.quantity - 1);
    }
  };

  const handleIncreaseQuantity = () => {
    if (cartItem) {
      updateCartQuantity(item.id, cartItem.quantity + 1);
      return;
    }
    addToCart(item, 1);
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="overflow-hidden rounded-lg border border-orange-100 bg-white shadow-sm"
    >
      <div className="relative h-44 overflow-hidden bg-orange-50">
        <FoodImage src={item.image} name={item.name} category={item.category} className="h-full w-full object-cover transition duration-500 hover:scale-105" />
        {canOrder && (
          <button
            type="button"
            className={clsx(
              "food-favorite-button absolute left-3 top-3 z-30 inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-black shadow-xl ring-2 ring-white transition hover:-translate-y-0.5",
              favorite
                ? "is-favorite bg-[#f04423] text-white"
                : "bg-white text-[#f04423] hover:bg-[#f04423] hover:text-white"
            )}
            onClick={() => toggleFavorite(item.id)}
            aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
            title={favorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart size={19} fill={favorite ? "currentColor" : "none"} />
          </button>
        )}
        <span
          className={clsx(
            "absolute right-3 top-3 rounded-lg px-2 py-1 text-xs font-black uppercase",
            item.foodType === "veg" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
          )}
        >
          {item.foodType === "veg" ? "Veg" : "Non veg"}
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-black text-slate-950">{item.name}</h3>
            <p className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">{item.description}</p>
          </div>
          <span className="shrink-0 rounded-lg bg-orange-50 px-2 py-1 text-sm font-black text-[#f04423]">
            Rs {item.price}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1 text-sm font-bold text-slate-700">
            <Star size={16} className="fill-amber-400 text-amber-400" />
            {item.rating.toFixed(1)}
          </div>

          {canOrder && (
            <div className="flex items-center">
              <div className="flex items-center overflow-hidden rounded-lg border border-slate-200">
                <button
                  className="brand-focus p-2 text-slate-700 hover:bg-slate-50"
                  onClick={handleDecreaseQuantity}
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center text-sm font-black">{displayQuantity}</span>
                <button
                  className="brand-focus p-2 text-slate-700 hover:bg-slate-50"
                  onClick={handleIncreaseQuantity}
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
                <button
                  className={clsx(
                    "brand-focus p-2 text-white transition-colors",
                    readyToCheckout ? "bg-emerald-600" : "bg-[#f04423]"
                  )}
                  onClick={handleAddToCart}
                  aria-label={readyToCheckout ? "Go to checkout" : "Add to cart"}
                >
                  <ShoppingCart size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}
