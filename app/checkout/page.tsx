"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, IndianRupee, MapPin } from "lucide-react";
import { ProtectedPage } from "@/components/protected-page";
import { useFoodistar } from "@/components/app-provider";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, placeOrder } = useFoodistar();
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [error, setError] = useState("");
  const deliveryFee = cartTotal >= 500 || cartTotal === 0 ? 0 : 40;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    try {
      placeOrder({ address, note, scheduledFor: scheduledFor || undefined });
      router.push("/orders");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to place order.");
    }
  };

  return (
    <ProtectedPage>
      <main className="mx-auto grid w-full max-w-6xl gap-5 px-4 py-6 lg:grid-cols-[1fr_360px]">
        <form className="rounded-lg border border-orange-100 bg-white p-5 shadow-sm" onSubmit={submit}>
          <h1 className="text-3xl font-black text-slate-950">Checkout</h1>
          <p className="mt-2 text-sm text-slate-500">Payment gateway has been removed. Orders are placed as cash order requests.</p>

          <label className="mt-5 block">
            <span className="flex items-center gap-2 text-sm font-black text-slate-700"><MapPin size={17} className="text-[#f04423]" /> Delivery address</span>
            <textarea
              className="brand-focus mt-2 min-h-28 w-full resize-none rounded-lg border border-slate-200 px-3 py-3 text-sm"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              required
            />
          </label>

          <label className="mt-4 block">
            <span className="flex items-center gap-2 text-sm font-black text-slate-700"><CalendarClock size={17} className="text-[#f04423]" /> Schedule time</span>
            <input
              type="datetime-local"
              className="brand-focus mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm"
              value={scheduledFor}
              onChange={(event) => setScheduledFor(event.target.value)}
            />
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-black text-slate-700">Delivery note</span>
            <input
              className="brand-focus mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </label>

          {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <button className="brand-focus mt-5 w-full rounded-lg bg-[#f04423] px-4 py-3 text-sm font-black text-white">
            Place cash order
          </button>
        </form>

        <aside className="h-fit rounded-lg border border-orange-100 bg-slate-950 p-5 text-white shadow-sm">
          <div className="flex items-center gap-2">
            <IndianRupee size={20} className="text-orange-200" />
            <h2 className="text-xl font-black">Cash summary</h2>
          </div>
          <div className="mt-5 space-y-3 text-sm text-slate-300">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between gap-3">
                <span>{item.name} x {item.quantity}</span>
                <strong className="text-white">Rs {item.price * item.quantity}</strong>
              </div>
            ))}
            <div className="border-t border-white/10 pt-3">
              <div className="flex justify-between"><span>Delivery</span><strong className="text-white">{deliveryFee ? `Rs ${deliveryFee}` : "Free"}</strong></div>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-3 text-lg font-black text-white">
              <span>Total due</span>
              <span>Rs {cartTotal + deliveryFee}</span>
            </div>
          </div>
        </aside>
      </main>
    </ProtectedPage>
  );
}
