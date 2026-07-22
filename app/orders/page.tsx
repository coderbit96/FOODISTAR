"use client";

import Link from "next/link";
import { CheckCircle2, Clock3, MapPin, PackageCheck, Phone, Star, Truck, UserRound, XCircle } from "lucide-react";
import { clsx } from "clsx";
import { useMemo, useState } from "react";
import { ProtectedPage } from "@/components/protected-page";
import { useRasoiGo } from "@/components/app-provider";
import type { OrderStatus } from "@/lib/types";

const statusSteps: { key: OrderStatus; label: string; icon: typeof Clock3 }[] = [
  { key: "pending", label: "Pending", icon: Clock3 },
  { key: "received", label: "Accepted", icon: CheckCircle2 },
  { key: "preparing", label: "Preparing", icon: PackageCheck },
  { key: "out-for-delivery", label: "Out", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 }
];

export default function OrdersPage() {
  const {
    data,
    profile,
    ownerShop,
    updateOrderStatus,
    cancelOrder,
    acceptDeliveryOrder,
    updateDeliveryLocation,
    markDeliveredWithOtp,
    rateOrderItem,
    reviewOrderShop
  } = useRasoiGo();
  const [otpByOrder, setOtpByOrder] = useState<Record<string, string>>({});
  const [reviewByOrder, setReviewByOrder] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [chartNow] = useState(() => Date.now());
  const ownedShopIds = useMemo(() => {
    if (!profile) return new Set<string>();
    return new Set(
      data.shops
        .filter((shop) => shop.ownerId === profile.uid || shop.id === ownerShop?.id)
        .map((shop) => shop.id)
    );
  }, [data.shops, ownerShop, profile]);

  const orders = useMemo(() => {
    if (!profile) return [];
    if (profile.role === "owner") {
      return data.orders.filter((order) =>
        order.items.some((item) => ownedShopIds.has(item.shopId))
      );
    }
    if (profile.role === "delivery") {
      return data.orders.filter((order) => !["delivered", "cancelled"].includes(order.status));
    }
    return data.orders.filter((order) => order.userId === profile.uid);
  }, [data.orders, ownedShopIds, profile]);

  const pageCopy = {
    user: {
      title: "My orders",
      subtitle: "Track your RasoiGo online and cash orders from kitchen to doorstep.",
      empty: "No orders yet.",
      href: "/",
      action: "Start ordering"
    },
    owner: {
      title: "Kitchen orders",
      subtitle: "Move incoming restaurant orders through prep and handoff.",
      empty: "No kitchen orders yet.",
      href: "/owner",
      action: "Open owner menu"
    },
    delivery: {
      title: "Delivery queue",
      subtitle: "Pick up active orders and mark each drop when it is done.",
      empty: "No active deliveries right now.",
      href: "/profile",
      action: "Open profile"
    },
    admin: {
      title: "Admin order view",
      subtitle: "Use the Admin dashboard for full order management.",
      empty: "No admin orders here.",
      href: "/admin",
      action: "Open admin dashboard"
    }
  }[profile?.role || "user"];

  const deliveryWallet = profile ? data.wallet.filter((entry) => entry.userId === profile.uid && entry.type === "delivery-earning") : [];
  const deliveredCount = profile ? data.orders.filter((order) => order.deliveryPartnerId === profile.uid && order.status === "delivered").length : 0;
  const deliveryEarnings = deliveryWallet.reduce((total, entry) => total + entry.amount, 0);
  const deliveryIncomingOrders = profile?.role === "delivery" ? data.orders.filter((order) => !["delivered", "cancelled"].includes(order.status)) : [];
  const deliveryCompletedOrders = profile?.role === "delivery" ? data.orders.filter((order) => order.deliveryPartnerId === profile.uid && order.status === "delivered") : [];
  const deliveryCancelledOrders = profile?.role === "delivery" ? data.orders.filter((order) => order.deliveryPartnerId === profile.uid && order.status === "cancelled") : [];
  const deliveryIncomingValue = deliveryIncomingOrders.reduce((total, order) => total + order.total, 0);
  const deliveryCompletedValue = deliveryCompletedOrders.reduce((total, order) => total + order.total, 0);
  const deliveryCancelledValue = deliveryCancelledOrders.reduce((total, order) => total + order.total, 0);
  const earningBars = [7, 14, 30].map((days) => {
    const since = chartNow - days * 24 * 60 * 60 * 1000;
    const amount = deliveryWallet
      .filter((entry) => new Date(entry.createdAt).getTime() >= since)
      .reduce((total, entry) => total + entry.amount, 0);
    return { label: `${days}d`, amount };
  });

  const actionFor = (status: OrderStatus): { label: string; next: OrderStatus } | null => {
    if (profile?.role === "owner") {
      if (status === "pending") return { label: "Accept order", next: "received" };
      if (status === "received") return { label: "Order processing", next: "preparing" };
      if (status === "preparing") return { label: "Ready for delivery", next: "out-for-delivery" };
      return null;
    }
    if (profile?.role === "delivery") {
      if (status === "received" || status === "preparing") return { label: "Pick up order", next: "out-for-delivery" };
      if (status === "out-for-delivery") return { label: "Mark delivered", next: "delivered" };
    }
    return null;
  };

  return (
    <ProtectedPage>
      <main className="mx-auto w-full max-w-6xl px-4 py-6">
        <h1 className="text-3xl font-black text-slate-950">{pageCopy.title}</h1>
        <p className="mt-2 text-sm text-slate-500">{pageCopy.subtitle}</p>
        {profile?.role === "delivery" && (
          <section className="mt-5 rounded-lg border border-orange-100 bg-white p-5 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
              <div><p className="text-sm text-slate-500">Incoming</p><p className="text-3xl font-black text-slate-950">{deliveryIncomingOrders.length}</p><p className="text-xs font-bold text-slate-500">Rs {deliveryIncomingValue}</p></div>
              <div><p className="text-sm text-slate-500">Completed</p><p className="text-3xl font-black text-slate-950">{deliveryCompletedOrders.length}</p><p className="text-xs font-bold text-slate-500">Rs {deliveryCompletedValue}</p></div>
              <div><p className="text-sm text-slate-500">Cancelled</p><p className="text-3xl font-black text-slate-950">{deliveryCancelledOrders.length}</p><p className="text-xs font-bold text-slate-500">Rs {deliveryCancelledValue}</p></div>
              <div><p className="text-sm text-slate-500">Delivered</p><p className="text-3xl font-black text-slate-950">{deliveredCount}</p></div>
              <div><p className="text-sm text-slate-500">Total earnings</p><p className="text-3xl font-black text-[#f04423]">Rs {deliveryEarnings}</p></div>
              <div><p className="text-sm text-slate-500">Average</p><p className="text-3xl font-black text-slate-950">Rs {deliveredCount ? Math.round(deliveryEarnings / deliveredCount) : 0}</p></div>
            </div>
            <div className="mt-4 flex items-end gap-3">
              {earningBars.map((bar) => (
                <div key={bar.label} className="flex flex-1 flex-col items-center gap-1 text-xs font-bold text-slate-500">
                  <div className="w-full rounded-t bg-[#f04423]" style={{ height: `${Math.max(8, bar.amount)}px` }} />
                  {bar.label}: Rs {bar.amount}
                </div>
              ))}
            </div>
          </section>
        )}
        {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div className="mt-5 grid gap-4">
          {orders.map((order) => {
            const action = actionFor(order.status);
            const visibleItems = profile?.role === "owner"
              ? order.items.filter((item) => ownedShopIds.has(item.shopId))
              : profile?.role === "delivery"
                ? []
              : order.items;
            const pickupShops = Array.from(new Set(order.items.map((item) => item.shopId)))
              .map((shopId) => data.shops.find((shop) => shop.id === shopId)?.name)
              .filter(Boolean)
              .join(", ");
            const packageCount = order.items.reduce((total, item) => total + item.quantity, 0);
            const deliveryPartner = order.deliveryPartnerId
              ? data.users.find((user) => user.uid === order.deliveryPartnerId)
              : undefined;
            const customer = data.users.find((user) => user.uid === order.userId);
            const ownerOrderSubtotal = visibleItems.reduce((total, item) => total + item.price * item.quantity, 0);
            const deliveryLocation = order.deliveryLocation;
            const mapUrl = deliveryLocation
              ? `https://www.openstreetmap.org/export/embed.html?bbox=${deliveryLocation.lng - 0.01}%2C${deliveryLocation.lat - 0.01}%2C${deliveryLocation.lng + 0.01}%2C${deliveryLocation.lat + 0.01}&layer=mapnik&marker=${deliveryLocation.lat}%2C${deliveryLocation.lng}`
              : "";

            return (
              <article key={order.id} className="rounded-lg border border-orange-100 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-[#f04423]">{order.id.slice(0, 16)}</p>
                    <h2 className="mt-2 text-xl font-black text-slate-950">
                      Rs {order.total} {order.paymentMethod === "razorpay" ? "Razorpay paid order" : "cash order"}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="w-fit rounded-lg bg-emerald-50 px-3 py-2 text-sm font-black capitalize text-emerald-700">
                      {order.status.replaceAll("-", " ")}
                    </span>
                    {profile?.role === "user" && ["pending", "received"].includes(order.status) && (
                      <button
                        className="brand-focus rounded-lg bg-red-50 px-3 py-2 text-sm font-black text-red-700"
                        onClick={() => cancelOrder(order.id)}
                      >
                        <XCircle className="mr-1 inline" size={15} />
                        Cancel
                      </button>
                    )}
                    {action && profile?.role !== "delivery" && (
                      <button
                        className="brand-focus rounded-lg bg-[#f04423] px-3 py-2 text-sm font-black text-white"
                        onClick={() => updateOrderStatus(order.id, action.next)}
                      >
                        {action.label}
                      </button>
                    )}
                    {profile?.role === "delivery" && !order.deliveryPartnerId && ["pending", "received", "preparing", "out-for-delivery"].includes(order.status) && (
                      <button
                        className="brand-focus rounded-lg bg-[#f04423] px-3 py-2 text-sm font-black text-white"
                        onClick={() => {
                          try {
                            setError("");
                            acceptDeliveryOrder(order.id);
                          } catch (caught) {
                            setError(caught instanceof Error ? caught.message : "Unable to accept assignment.");
                          }
                        }}
                      >
                        Accept assignment
                      </button>
                    )}
                  </div>
                </div>

                {order.status === "cancelled" ? (
                  <div className="mt-5 rounded-lg border border-red-100 bg-red-50 p-3 text-sm font-black text-red-700">
                    Cancelled. Refund request information is managed by admin.
                  </div>
                ) : (
                  <div className="mt-5 grid gap-2 sm:grid-cols-5">
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
                )}

                {profile?.role === "delivery" ? (
                  <div className="mt-5 grid gap-3 md:grid-cols-4">
                    <div className="rounded-lg bg-slate-50 px-3 py-3 text-sm">
                      <p className="text-xs font-black uppercase text-slate-400">Pickup</p>
                      <p className="mt-1 font-black text-slate-800">{pickupShops || "Restaurant kitchen"}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 px-3 py-3 text-sm">
                      <p className="text-xs font-black uppercase text-slate-400">Package</p>
                      <p className="mt-1 font-black text-slate-800">{packageCount} items</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 px-3 py-3 text-sm">
                      <p className="text-xs font-black uppercase text-slate-400">Order price</p>
                      <p className="mt-1 font-black text-slate-800">Rs {order.total}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 px-3 py-3 text-sm">
                      <p className="text-xs font-black uppercase text-slate-400">Payment</p>
                      <p className="mt-1 font-black text-slate-800">{order.paymentMethod === "cash" ? "COD collect" : "Online paid"} . Earn Rs 45</p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 grid gap-2">
                    {visibleItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm">
                        <span className="font-bold text-slate-700">{item.name} x {item.quantity}</span>
                        <strong>Rs {item.price * item.quantity}</strong>
                      </div>
                    ))}
                  </div>
                )}
                {profile?.role === "owner" && (
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-lg border border-orange-100 bg-orange-50 p-3 text-sm">
                      <p className="flex items-center gap-2 text-xs font-black uppercase text-slate-500">
                        <UserRound size={15} className="text-[#f04423]" />
                        Customer
                      </p>
                      <p className="mt-2 font-black text-slate-950">{customer?.fullName || "Customer"}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-600">{customer?.mobile || "No mobile added"}</p>
                      <p className="mt-1 break-all text-xs font-semibold text-slate-500">{customer?.email || order.userId}</p>
                    </div>
                    <div className="rounded-lg border border-sky-100 bg-sky-50 p-3 text-sm">
                      <p className="flex items-center gap-2 text-xs font-black uppercase text-slate-500">
                        <Truck size={15} className="text-[#f04423]" />
                        Delivery partner
                      </p>
                      <p className="mt-2 font-black text-slate-950">{deliveryPartner?.fullName || order.deliveryPartnerName || "Not accepted yet"}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-600">{deliveryPartner?.mobile || "Phone available after accept"}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        {order.deliveryPartnerId ? "Partner accepted pickup" : "Waiting for delivery partner"}
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm">
                      <p className="text-xs font-black uppercase text-slate-500">Owner order summary</p>
                      <p className="mt-2 font-black text-slate-950">Shop items: Rs {ownerOrderSubtotal}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-600">{packageCount} total package items</p>
                      <p className="mt-1 text-xs font-semibold capitalize text-slate-500">{order.paymentMethod === "cash" ? "Cash order" : "Online paid"} . {order.status.replaceAll("-", " ")}</p>
                    </div>
                  </div>
                )}
                <p className="mt-4 text-sm leading-6 text-slate-500">{order.address}</p>
                {order.scheduledFor && <p className="mt-1 text-sm font-bold text-slate-600">Scheduled: {new Date(order.scheduledFor).toLocaleString()}</p>}
                {order.couponCode && <p className="mt-1 text-sm font-bold text-emerald-700">Coupon {order.couponCode} saved Rs {order.discount || 0}</p>}
                {profile?.role === "user" && !["cancelled", "delivered"].includes(order.status) && (
                  <div className="mt-4 overflow-hidden rounded-lg border border-sky-100 bg-sky-50">
                    <div className="grid gap-3 p-4 md:grid-cols-3">
                      <div className="rounded-lg bg-white p-3 text-sm">
                        <p className="flex items-center gap-2 text-xs font-black uppercase text-slate-400">
                          <UserRound size={15} className="text-[#f04423]" />
                          Delivery partner
                        </p>
                        <p className="mt-2 font-black text-slate-900">
                          {deliveryPartner?.fullName || order.deliveryPartnerName || "Assigning soon"}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">
                          {order.deliveryPartnerId ? "Accepted your order" : "Kitchen will assign a partner"}
                        </p>
                      </div>
                      <div className="rounded-lg bg-white p-3 text-sm">
                        <p className="flex items-center gap-2 text-xs font-black uppercase text-slate-400">
                          <Phone size={15} className="text-[#f04423]" />
                          Phone number
                        </p>
                        {deliveryPartner?.mobile ? (
                          <a className="mt-2 block font-black text-slate-900 hover:text-[#f04423]" href={`tel:${deliveryPartner.mobile}`}>
                            {deliveryPartner.mobile}
                          </a>
                        ) : (
                          <p className="mt-2 font-black text-slate-900">Available after assignment</p>
                        )}
                      </div>
                      <div className="rounded-lg bg-white p-3 text-sm">
                        <p className="flex items-center gap-2 text-xs font-black uppercase text-slate-400">
                          <MapPin size={15} className="text-[#f04423]" />
                          Delivery status
                        </p>
                        <p className="mt-2 font-black text-slate-900">
                          {deliveryLocation ? "Partner is on the way" : "Waiting for live location"}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">
                          {deliveryLocation ? `Updated ${new Date(deliveryLocation.updatedAt).toLocaleTimeString()}` : `OTP: ${order.deliveryOtp}`}
                        </p>
                      </div>
                    </div>
                    {deliveryLocation && (
                      <div className="border-t border-sky-100 bg-white">
                        <iframe
                          title={`Delivery map for ${order.id}`}
                          className="h-64 w-full"
                          src={mapUrl}
                          loading="lazy"
                        />
                        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-xs font-bold text-slate-500">
                          <span>Current location: {deliveryLocation.lat}, {deliveryLocation.lng}</span>
                          <a className="text-[#f04423]" href={`https://www.openstreetmap.org/?mlat=${deliveryLocation.lat}&mlon=${deliveryLocation.lng}#map=16/${deliveryLocation.lat}/${deliveryLocation.lng}`} target="_blank" rel="noreferrer">
                            Open full map
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {profile?.role === "user" && order.status === "delivered" && (
                  <div className="mt-4 grid gap-3 rounded-lg bg-orange-50 p-3">
                    <p className="font-black text-slate-950">Rate your food</p>
                    {order.items.map((item) => (
                      <div key={`rate-${item.id}`} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white p-2 text-sm">
                        <span className="font-bold">{item.name}</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button key={rating} className="text-amber-500" onClick={() => rateOrderItem(order.id, item.id, rating)}>
                              <Star size={17} fill={(order.itemRatings?.[item.id] || 0) >= rating ? "currentColor" : "none"} />
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    {Array.from(new Set(order.items.map((item) => item.shopId))).map((shopId) => {
                      const reviewed = data.reviews.some((review) => review.orderId === order.id && review.shopId === shopId);
                      const shop = data.shops.find((entry) => entry.id === shopId);
                      return (
                        <div key={shopId} className="rounded-lg bg-white p-3">
                          <p className="text-sm font-black text-slate-950">{shop?.name || "Restaurant"} review</p>
                          <textarea
                            className="brand-focus mt-2 min-h-20 w-full resize-none rounded-lg border border-orange-100 px-3 py-2 text-sm"
                            value={reviewByOrder[`${order.id}-${shopId}`] || ""}
                            onChange={(event) => setReviewByOrder((current) => ({ ...current, [`${order.id}-${shopId}`]: event.target.value }))}
                            disabled={reviewed}
                            placeholder={reviewed ? "Review already submitted" : "Share your review"}
                          />
                          <button
                            className="brand-focus mt-2 rounded-lg bg-[#f04423] px-3 py-2 text-sm font-black text-white disabled:opacity-50"
                            disabled={reviewed}
                            onClick={() => reviewOrderShop(order.id, shopId, 5, reviewByOrder[`${order.id}-${shopId}`] || "Great food")}
                          >
                            Submit review
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
                {profile?.role === "delivery" && order.deliveryPartnerId === profile.uid && order.status === "out-for-delivery" && (
                  <div className="mt-4 grid gap-3 rounded-lg bg-slate-50 p-3 md:grid-cols-[1fr_1fr_auto_auto]">
                    <button className="brand-focus rounded-lg bg-white px-3 py-2 text-sm font-black text-slate-700 ring-1 ring-slate-200" onClick={() => updateDeliveryLocation(order.id)}>
                      Share live location
                    </button>
                    <input
                      className="brand-focus rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      placeholder="Customer OTP"
                      value={otpByOrder[order.id] || ""}
                      onChange={(event) => setOtpByOrder((current) => ({ ...current, [order.id]: event.target.value }))}
                    />
                    <button
                      className="brand-focus rounded-lg bg-[#f04423] px-3 py-2 text-sm font-black text-white"
                      onClick={() => {
                        try {
                          setError("");
                          markDeliveredWithOtp(order.id, otpByOrder[order.id] || "");
                        } catch (caught) {
                          setError(caught instanceof Error ? caught.message : "Invalid OTP.");
                        }
                      }}
                    >
                      Mark delivered
                    </button>
                    <span className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-500">Demo OTP: {order.deliveryOtp}</span>
                  </div>
                )}
              </article>
            );
          })}

          {orders.length === 0 && (
            <div className="rounded-lg border border-orange-100 bg-white p-8 text-center">
              <p className="font-black text-slate-950">{pageCopy.empty}</p>
              <Link href={pageCopy.href} className="mt-4 inline-flex rounded-lg bg-[#f04423] px-4 py-3 text-sm font-black text-white">
                {pageCopy.action}
              </Link>
            </div>
          )}
        </div>
      </main>
    </ProtectedPage>
  );
}
