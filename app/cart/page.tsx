"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { ProtectedPage } from "@/components/protected-page";
import { useFoodistar } from "@/components/app-provider";
import { FoodImage } from "@/components/food-image";

export default function CartPage() {
  const { cart, cartTotal, updateCartQuantity, removeFromCart } = useFoodistar();
  const deliveryFee = cartTotal >= 500 || cartTotal === 0 ? 0 : 40;

  return (
    <ProtectedPage>
      <main className="mx-auto grid w-full max-w-6xl gap-5 px-4 py-6 lg:grid-cols-[1fr_340px]">
        <section>
          <h1 className="text-3xl font-black text-slate-950">Your cart</h1>
          <div className="mt-5 grid gap-3">
            {cart.map((item) => (
              <article key={item.id} className="grid gap-4 rounded-lg border border-orange-100 bg-white p-4 shadow-sm sm:grid-cols-[96px_1fr_auto]">
                <FoodImage src={item.image} name={item.name} category={item.category} className="h-24 w-24 rounded-lg object-cover" />
                <div>
                  <h2 className="font-black text-slate-950">{item.name}</h2>
                  <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                  <p className="mt-2 text-sm font-black text-[#f04423]">Rs {item.price}</p>
                </div>
                <div className="flex items-center gap-2 sm:justify-end">
                  <button className="brand-focus rounded-lg border border-slate-200 p-2" onClick={() => updateCartQuantity(item.id, item.quantity - 1)}>
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center font-black">{item.quantity}</span>
                  <button className="brand-focus rounded-lg border border-slate-200 p-2" onClick={() => updateCartQuantity(item.id, item.quantity + 1)}>
                    <Plus size={16} />
                  </button>
                  <button className="brand-focus rounded-lg bg-red-50 p-2 text-red-600" onClick={() => removeFromCart(item.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            ))}
            {cart.length === 0 && (
              <div className="rounded-lg border border-orange-100 bg-white p-8 text-center">
                <p className="font-black text-slate-950">Your cart is empty.</p>
                <Link className="mt-4 inline-flex rounded-lg bg-[#f04423] px-4 py-3 text-sm font-black text-white" href="/">
                  Browse food
                </Link>
              </div>
            )}
          </div>
        </section>

        <aside className="h-fit rounded-lg border border-orange-100 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-slate-950">Order summary</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><strong>Rs {cartTotal}</strong></div>
            <div className="flex justify-between"><span>Delivery</span><strong>{deliveryFee ? `Rs ${deliveryFee}` : "Free"}</strong></div>
            <div className="border-t border-slate-100 pt-3 text-lg font-black">
              <div className="flex justify-between"><span>Total</span><span className="text-[#f04423]">Rs {cartTotal + deliveryFee}</span></div>
            </div>
          </div>
          <Link
            href="/checkout"
            className="brand-focus mt-5 flex w-full justify-center rounded-lg bg-slate-950 px-4 py-3 text-sm font-black text-white aria-disabled:pointer-events-none aria-disabled:opacity-50"
            aria-disabled={cart.length === 0}
          >
            Checkout
          </Link>
        </aside>
      </main>
    </ProtectedPage>
  );
}
