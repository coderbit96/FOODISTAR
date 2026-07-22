"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { CalendarClock, IndianRupee, MapPin } from "lucide-react";
import { ProtectedPage } from "@/components/protected-page";
import { useRasoiGo } from "@/components/app-provider";

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

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, placeOrder, profile, data, saveAddress } = useRasoiGo();
  const [address, setAddress] = useState("");
  const [addressLabel, setAddressLabel] = useState("Home");
  const [addressCity, setAddressCity] = useState("Kolkata");
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [note, setNote] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cash">("razorpay");
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const deliveryFee = cartTotal >= 500 || cartTotal === 0 ? 0 : 40;
  const addresses = profile ? data.addressesByUser[profile.uid] || [] : [];
  const bestCoupon = useMemo(() => {
    const eligible = data.coupons.filter((coupon) => coupon.active && cartTotal >= coupon.minOrder);
    const manual = eligible.find((coupon) => coupon.code.toLowerCase() === couponCode.trim().toLowerCase());
    return manual || eligible.sort((left, right) => right.discount - left.discount)[0] || null;
  }, [cartTotal, couponCode, data.coupons]);
  const selectedAddress = addresses.find((entry) => entry.id === selectedAddressId) || addresses.find((entry) => entry.default);
  const checkoutAddress = selectedAddress
    ? `${selectedAddress.label}: ${selectedAddress.line1}, ${selectedAddress.city}${selectedAddress.landmark ? `, ${selectedAddress.landmark}` : ""}`
    : address;
  const discount = bestCoupon?.discount || 0;
  const payableTotal = Math.max(0, cartTotal + deliveryFee - discount);

  if (profile?.role !== "user") {
    const target = profile?.role === "owner" ? "/owner" : "/orders";
    const label = profile?.role === "owner" ? "Open owner menu" : "Open delivery queue";
    return (
      <ProtectedPage>
        <main className="mx-auto w-full max-w-3xl px-4 py-10">
          <div className="rounded-lg border border-orange-100 bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-black text-slate-950">Customer checkout</h1>
            <p className="mt-2 text-sm text-slate-500">Only User accounts can place RasoiGo orders.</p>
            <Link className="mt-4 inline-flex rounded-lg bg-[#f04423] px-4 py-3 text-sm font-black text-white" href={target}>
              {label}
            </Link>
          </div>
        </main>
      </ProtectedPage>
    );
  }

  const saveRasoiGoOrder = (razorpay?: RazorpaySuccessResponse) => {
    placeOrder({
      address: checkoutAddress,
      addressId: selectedAddress?.id,
      note,
      scheduledFor: scheduledFor || undefined,
      couponCode: couponCode || bestCoupon?.code,
      paymentMethod,
      razorpayOrderId: razorpay?.razorpay_order_id,
      razorpayPaymentId: razorpay?.razorpay_payment_id,
      razorpaySignature: razorpay?.razorpay_signature
    });
    router.push("/orders");
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    try {
      if (paymentMethod === "cash") {
        saveRasoiGoOrder();
        return;
      }

      setPaying(true);
      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) throw new Error("Unable to load Razorpay checkout.");

      const orderResponse = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: payableTotal,
          receipt: `rasoigo-${Date.now()}`
        })
      });
      const order = await orderResponse.json();
      if (!orderResponse.ok) throw new Error(order.error || "Unable to create Razorpay order.");

      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "RasoiGo",
        description: "Food order payment",
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
            saveRasoiGoOrder(response);
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
      setError(caught instanceof Error ? caught.message : "Unable to place order.");
      setPaying(false);
    }
  };

  return (
    <ProtectedPage>
      <main className="mx-auto grid w-full max-w-6xl gap-5 px-4 py-6 lg:grid-cols-[1fr_360px]">
        <form className="rounded-lg border border-orange-100 bg-white p-5 shadow-sm" onSubmit={submit}>
          <h1 className="text-3xl font-black text-slate-950">Checkout</h1>
          <p className="mt-2 text-sm text-slate-500">Pay securely with Razorpay or place a cash order request.</p>

          <label className="mt-5 block">
            <span className="flex items-center gap-2 text-sm font-black text-slate-700"><MapPin size={17} className="text-[#f04423]" /> Delivery address</span>
            {addresses.length > 0 && (
              <select
                className="brand-focus mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm"
                value={selectedAddress?.id || ""}
                onChange={(event) => setSelectedAddressId(event.target.value)}
              >
                {addresses.map((entry) => (
                  <option key={entry.id} value={entry.id}>{entry.label} - {entry.line1}</option>
                ))}
              </select>
            )}
            <textarea
              className="brand-focus mt-2 min-h-28 w-full resize-none rounded-lg border border-slate-200 px-3 py-3 text-sm"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder={selectedAddress ? "Use selected address or type a new one" : "Type delivery address"}
              required={!selectedAddress}
            />
          </label>

          <div className="mt-3 grid gap-3 rounded-lg bg-orange-50 p-3 md:grid-cols-[1fr_1fr_auto]">
            <input className="brand-focus rounded-lg border border-orange-100 px-3 py-2 text-sm" value={addressLabel} onChange={(event) => setAddressLabel(event.target.value)} placeholder="Label" />
            <input className="brand-focus rounded-lg border border-orange-100 px-3 py-2 text-sm" value={addressCity} onChange={(event) => setAddressCity(event.target.value)} placeholder="City" />
            <button
              type="button"
              className="brand-focus rounded-lg bg-slate-950 px-3 py-2 text-sm font-black text-white"
              onClick={() => {
                if (!address.trim()) return;
                saveAddress({ label: addressLabel, line1: address, city: addressCity, default: addresses.length === 0 });
              }}
            >
              Save address
            </button>
          </div>

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
            <span className="text-sm font-black text-slate-700">Coupon</span>
            <input
              className="brand-focus mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm uppercase"
              value={couponCode}
              onChange={(event) => setCouponCode(event.target.value)}
              placeholder={bestCoupon ? `${bestCoupon.code} auto-applied` : "Enter coupon code"}
            />
            {bestCoupon && <p className="mt-2 text-xs font-bold text-emerald-700">{bestCoupon.label} applied.</p>}
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-black text-slate-700">Delivery note</span>
            <input
              className="brand-focus mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </label>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {[
              { value: "razorpay", label: "Razorpay online payment" },
              { value: "cash", label: "Cash on delivery" }
            ].map((option) => (
              <label
                key={option.value}
                className="brand-focus flex items-center gap-3 rounded-lg border border-orange-100 bg-orange-50 px-3 py-3 text-sm font-black text-slate-700"
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={option.value}
                  checked={paymentMethod === option.value}
                  onChange={() => setPaymentMethod(option.value as "razorpay" | "cash")}
                />
                {option.label}
              </label>
            ))}
          </div>

          {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <button className="brand-focus mt-5 w-full rounded-lg bg-[#f04423] px-4 py-3 text-sm font-black text-white disabled:opacity-60" disabled={paying || cart.length === 0}>
            {paying ? "Opening payment..." : paymentMethod === "razorpay" ? `Pay Rs ${payableTotal}` : "Place cash order"}
          </button>
        </form>

        <aside className="h-fit rounded-lg border border-orange-100 bg-slate-950 p-5 text-white shadow-sm">
          <div className="flex items-center gap-2">
            <IndianRupee size={20} className="text-orange-200" />
            <h2 className="text-xl font-black">Payment summary</h2>
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
            <div className="flex justify-between"><span>Coupon</span><strong className="text-white">{discount ? `- Rs ${discount}` : "Best auto"}</strong></div>
            <div className="flex justify-between border-t border-white/10 pt-3 text-lg font-black text-white">
              <span>Total due</span>
              <span>Rs {payableTotal}</span>
            </div>
          </div>
        </aside>
      </main>
    </ProtectedPage>
  );
}
