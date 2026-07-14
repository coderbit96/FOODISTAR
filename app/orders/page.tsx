"use client";

import Link from "next/link";
import { CheckCircle2, Clock3, PackageCheck, Truck } from "lucide-react";
import { clsx } from "clsx";
import { ProtectedPage } from "@/components/protected-page";
import { useFoodistar } from "@/components/app-provider";
import type { OrderStatus } from "@/lib/types";

const statusSteps: { key: OrderStatus; label: string; icon: typeof Clock3 }[] = [
  { key: "received", label: "Received", icon: Clock3 },
  { key: "preparing", label: "Preparing", icon: PackageCheck },
  { key: "out-for-delivery", label: "Out", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 }
];

export default function OrdersPage() {
  const { data, profile } = useFoodistar();
  const orders = data.orders.filter((order) => order.userId === profile?.uid);

  return (
    <ProtectedPage>
      <main className="mx-auto w-full max-w-6xl px-4 py-6">
        <h1 className="text-3xl font-black text-slate-950">My orders</h1>
        <div className="mt-5 grid gap-4">
          {orders.map((order) => (
            <article key={order.id} className="rounded-lg border border-orange-100 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#f04423]">{order.id.slice(0, 16)}</p>
                  <h2 className="mt-2 text-xl font-black text-slate-950">Rs {order.total} cash order</h2>
                  <p className="mt-1 text-sm text-slate-500">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <span className="w-fit rounded-lg bg-emerald-50 px-3 py-2 text-sm font-black capitalize text-emerald-700">
                  {order.status.replaceAll("-", " ")}
                </span>
              </div>

              <div className="mt-5 grid gap-2 sm:grid-cols-4">
                {statusSteps.map((step) => {
                  const Icon = step.icon;
                  const active = statusSteps.findIndex((entry) => entry.key === step.key) <= statusSteps.findIndex((entry) => entry.key === order.status);
                  return (
                    <div
                      key={step.key}
                      className={clsx(
                        "rounded-lg border p-3 text-sm font-bold",
                        active ? "border-[#f04423] bg-orange-50 text-[#f04423]" : "border-slate-100 bg-slate-50 text-slate-400"
                      )}
                    >
                      <Icon size={18} />
                      <p className="mt-2">{step.label}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 grid gap-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm">
                    <span className="font-bold text-slate-700">{item.name} x {item.quantity}</span>
                    <strong>Rs {item.price * item.quantity}</strong>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-500">{order.address}</p>
            </article>
          ))}

          {orders.length === 0 && (
            <div className="rounded-lg border border-orange-100 bg-white p-8 text-center">
              <p className="font-black text-slate-950">No orders yet.</p>
              <Link href="/" className="mt-4 inline-flex rounded-lg bg-[#f04423] px-4 py-3 text-sm font-black text-white">
                Start ordering
              </Link>
            </div>
          )}
        </div>
      </main>
    </ProtectedPage>
  );
}
