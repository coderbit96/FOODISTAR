"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, IndianRupee, Plus, ReceiptText, Trash2, Wallet } from "lucide-react";
import { ProtectedPage } from "@/components/protected-page";
import { useRasoiGo } from "@/components/app-provider";

const quickAmounts = [100, 250, 500, 1000];

type RazorpaySuccessResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
  handler: (response: RazorpaySuccessResponse) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => {
      open: () => void;
      on: (event: "payment.failed", callback: (response: { error?: { description?: string } }) => void) => void;
    };
  }
}

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function WalletPage() {
  const { profile, data, walletBalance, addWalletMoney, clearWalletHistory } = useRasoiGo();
  const [amount, setAmount] = useState("500");
  const [saved, setSaved] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const numericAmount = Math.round(Number(amount) || 0);
  const transactions = useMemo(() => (
    profile
      ? data.wallet
          .filter((entry) => entry.userId === profile.uid)
          .filter((entry) => !entry.hidden)
          .filter((entry) => entry.type !== "order" || entry.source === "wallet" || entry.label.toLowerCase().startsWith("wallet order"))
          .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
      : []
  ), [data.wallet, profile]);

  const creditWallet = (response: RazorpaySuccessResponse) => {
    addWalletMoney(numericAmount, {
      razorpayOrderId: response.razorpay_order_id,
      razorpayPaymentId: response.razorpay_payment_id,
      razorpaySignature: response.razorpay_signature
    });
    setSaved(true);
    setPaying(false);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (numericAmount <= 0) return;
    setSaved(false);
    setError("");
    setPaying(true);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) throw new Error("Unable to load Razorpay checkout.");

      const orderResponse = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: numericAmount,
          receipt: `wallet-${Date.now()}`
        })
      });
      const order = await orderResponse.json();
      if (!orderResponse.ok) throw new Error(order.error || "Unable to create Razorpay order.");

      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "RasoiGo Wallet",
        description: "Wallet top-up",
        order_id: order.id,
        prefill: {
          name: profile?.fullName,
          email: profile?.email,
          contact: profile?.mobile
        },
        theme: { color: "#f04423" },
        modal: {
          ondismiss: () => setPaying(false)
        },
        handler: async (response) => {
          try {
            const verifyResponse = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response)
            });
            const verifyPayload = await verifyResponse.json();
            if (!verifyResponse.ok || !verifyPayload.verified) {
              throw new Error(verifyPayload.error || "Payment verification failed.");
            }
            creditWallet(response);
          } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Payment verification failed.");
            setPaying(false);
          }
        }
      });

      checkout.on("payment.failed", (response) => {
        setError(response.error?.description || "Razorpay payment failed.");
        setPaying(false);
      });
      checkout.open();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to add money.");
      setPaying(false);
    }
  };

  if (profile?.role !== "user") {
    return (
      <ProtectedPage>
        <main className="mx-auto w-full max-w-3xl px-4 py-10">
          <div className="rounded-lg border border-orange-100 bg-white p-8 text-center shadow-sm">
            <Wallet className="mx-auto text-[#f04423]" size={34} />
            <h1 className="mt-3 text-2xl font-black text-slate-950">Customer wallet only</h1>
            <p className="mt-2 text-sm text-slate-500">Wallet payments are available for user accounts.</p>
            <Link className="brand-focus mt-4 inline-flex rounded-lg bg-[#f04423] px-4 py-3 text-sm font-black text-white" href="/">
              Back to menu
            </Link>
          </div>
        </main>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage>
      <main className="mx-auto w-full max-w-5xl px-4 py-6">
        <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <div className="rounded-lg border border-orange-100 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <span className="inline-flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-[#f04423]">
                  <Wallet size={15} />
                  RasoiGo Wallet
                </span>
                <h1 className="mt-4 text-4xl font-black text-slate-950">Rs {walletBalance}</h1>
                <p className="mt-2 text-sm text-slate-500">Use wallet balance for instant food checkout.</p>
              </div>
              <Link href="/checkout" className="brand-focus rounded-lg bg-slate-950 px-4 py-3 text-sm font-black text-white">
                Pay for order
              </Link>
            </div>

            <form className="mt-6 rounded-lg bg-orange-50 p-4" onSubmit={submit}>
              <h2 className="flex items-center gap-2 text-xl font-black text-slate-950">
                <IndianRupee size={20} className="text-[#f04423]" />
                Add money
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                <input
                  className="brand-focus rounded-lg border border-orange-100 px-3 py-3 text-sm font-bold"
                  inputMode="numeric"
                  value={amount}
                  onChange={(event) => {
                    setAmount(event.target.value);
                    setSaved(false);
                  }}
                  placeholder="Enter amount"
                />
                <button className="brand-focus inline-flex items-center justify-center gap-2 rounded-lg bg-[#f04423] px-4 py-3 text-sm font-black text-white disabled:opacity-50" disabled={numericAmount <= 0 || paying}>
                  <Plus size={17} />
                  {paying ? "Opening Razorpay" : "Add money"}
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {quickAmounts.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className="brand-focus rounded-lg bg-white px-3 py-2 text-sm font-black text-slate-700 ring-1 ring-orange-100 hover:bg-slate-950 hover:text-white"
                    onClick={() => {
                      setAmount(String(value));
                      setSaved(false);
                    }}
                  >
                    Rs {value}
                  </button>
                ))}
              </div>
              {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{error}</p>}
              {saved && <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">Wallet balance added after Razorpay payment.</p>}
            </form>
          </div>

          <aside className="rounded-lg border border-orange-100 bg-slate-950 p-5 text-white shadow-sm">
            <ReceiptText className="text-orange-200" size={24} />
            <h2 className="mt-3 text-2xl font-black">Wallet summary</h2>
            <div className="mt-5 grid gap-3 text-sm">
              <div className="rounded-lg bg-white/10 p-3">
                <p className="text-slate-300">Available balance</p>
                <p className="mt-1 text-3xl font-black">Rs {walletBalance}</p>
              </div>
              <div className="rounded-lg bg-white/10 p-3">
                <p className="text-slate-300">Transactions</p>
                <p className="mt-1 text-3xl font-black">{transactions.length}</p>
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-5 rounded-lg border border-orange-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-black text-slate-950">Wallet history</h2>
            <button
              type="button"
              className="brand-focus inline-flex items-center justify-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-black text-red-700 disabled:opacity-50"
              disabled={transactions.length === 0}
              onClick={() => {
                if (!window.confirm("Are you sure you want to clear wallet history?")) return;
                clearWalletHistory();
                setSaved(false);
              }}
            >
              <Trash2 size={16} />
              Clear history
            </button>
          </div>
          <div className="mt-4 grid gap-3">
            {transactions.length ? transactions.map((entry) => {
              const credit = entry.amount >= 0;
              const Icon = credit ? ArrowDownLeft : ArrowUpRight;
              return (
                <article key={entry.id} className="flex flex-col gap-3 rounded-lg bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${credit ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                      <Icon size={19} />
                    </span>
                    <div>
                      <h3 className="font-black text-slate-950">{entry.label}</h3>
                      <p className="text-xs font-bold capitalize text-slate-500">{entry.type.replaceAll("-", " ")} . {new Date(entry.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <p className={`text-lg font-black ${credit ? "text-emerald-700" : "text-red-700"}`}>
                    {credit ? "+" : "-"} Rs {Math.abs(entry.amount)}
                  </p>
                </article>
              );
            }) : (
              <p className="rounded-lg bg-slate-50 p-4 text-sm font-semibold text-slate-500">No wallet transactions yet.</p>
            )}
          </div>
        </section>
      </main>
    </ProtectedPage>
  );
}
