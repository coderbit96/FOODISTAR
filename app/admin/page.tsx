"use client";

import { useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Heart,
  IndianRupee,
  MapPin,
  MessageSquare,
  PackageCheck,
  ReceiptText,
  ShieldCheck,
  Store,
  Trash2,
  TrendingUp,
    Truck,
    UserRound,
    UserX,
  Utensils,
  XCircle
} from "lucide-react";
import { clsx } from "clsx";
import { ProtectedPage } from "@/components/protected-page";
import { useRasoiGo } from "@/components/app-provider";
import type { SupportLog, UserProfile, UserRole } from "@/lib/types";

const editableRoles: UserRole[] = ["user", "owner", "delivery"];

type ConfirmAction = {
  title: string;
  message: string;
  action: () => void;
};

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function startOfWeek(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  start.setDate(start.getDate() - start.getDay());
  return start.getTime();
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1).getTime();
}

export default function AdminPage() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const {
    profile,
    data,
    adminUpdateUserRole,
    adminToggleUserSuspended,
    adminDeleteUser,
    adminDeleteShop,
    adminDeleteItem,
    adminDeleteOrder,
    adminClearActivity,
    adminClearNonAdmins,
    adminUpdateSupportTicket,
    adminAddSupportNote,
    adminAddSupportCommunication,
    adminProcessSupportCompensation,
    adminDeleteSupportTicket,
    adminClearSupportTickets,
    adminClearRefundHistory,
    adminSetCommissionRate,
    adminUpdatePartnerVerification,
    adminClearActionLogs
  } = useRasoiGo();

  if (profile?.role !== "admin") {
    return (
      <ProtectedPage>
        <main className="mx-auto w-full max-w-3xl px-4 py-10">
          <div className="rounded-lg border border-orange-100 bg-white p-8 text-center shadow-sm">
            <ShieldCheck className="mx-auto text-[#f04423]" />
            <h1 className="mt-3 text-2xl font-black text-slate-950">Admin access only</h1>
            <p className="mt-2 text-sm text-slate-500">Log in with the admin account to manage RasoiGo.</p>
          </div>
        </main>
      </ProtectedPage>
    );
  }

  const commissionRate = data.platformSettings.commissionRate;
  const paidOrders = data.orders.filter((order) => order.status === "delivered");
  const revenue = paidOrders.reduce((total, order) => total + order.total, 0);
  const commissionEarned = Math.round(revenue * (commissionRate / 100));
  const now = new Date();
  const salesWindows = [
    { label: "Daily sales", since: startOfDay(now) },
    { label: "Weekly sales", since: startOfWeek(now) },
    { label: "Monthly sales", since: startOfMonth(now) }
  ].map((window) => {
    const orders = paidOrders.filter((order) => new Date(order.createdAt).getTime() >= window.since);
    return {
      ...window,
      orders: orders.length,
      total: orders.reduce((sum, order) => sum + order.total, 0)
    };
  });
  const customers = data.users.filter((user) => user.role === "user");
  const deliveryPartners = data.users.filter((user) => user.role === "delivery");
  const restaurantOwners = data.users.filter((user) => user.role === "owner");
  const restaurantApplications = restaurantOwners
    .slice()
    .sort((left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime())
    .slice(0, 5);
  const deliveryApplications = deliveryPartners
    .slice()
    .sort((left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime())
    .slice(0, 5);
  const orderStatusCards = [
    { label: "Pending", value: data.orders.filter((order) => order.status === "pending").length, icon: Clock3 },
    { label: "Accepted", value: data.orders.filter((order) => order.status === "received").length, icon: CheckCircle2 },
    { label: "Preparing", value: data.orders.filter((order) => order.status === "preparing").length, icon: Utensils },
    { label: "Delivered", value: data.orders.filter((order) => order.status === "delivered").length, icon: PackageCheck },
    { label: "Cancelled", value: data.orders.filter((order) => order.status === "cancelled").length, icon: XCircle }
  ];
  const recentActivities = [
    ...data.orders.map((order) => ({
      id: `order-${order.id}`,
      title: `Order ${order.id.slice(0, 10)}`,
      body: `${order.status.replaceAll("-", " ")} . Rs ${order.total}`,
      createdAt: order.createdAt
    })),
    ...data.wallet.map((entry) => ({
      id: `wallet-${entry.id}`,
      title: entry.label,
      body: `${entry.type} . Rs ${entry.amount}`,
      createdAt: entry.createdAt
    })),
    ...data.notifications.map((entry) => ({
      id: `notification-${entry.id}`,
      title: entry.title,
      body: entry.body,
      createdAt: entry.createdAt
    })),
    ...data.supportLogs.map((entry) => ({
      id: `support-${entry.id}`,
      title: entry.subject,
      body: `${entry.status} . ${entry.message}`,
      createdAt: entry.createdAt
    }))
  ]
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, 8);
  const restaurantPerformance = data.shops
    .map((shop) => {
      const shopOrders = data.orders.filter((order) => order.items.some((item) => item.shopId === shop.id));
      const total = shopOrders.reduce((sum, order) => {
        const shopSubtotal = order.items
          .filter((item) => item.shopId === shop.id)
          .reduce((itemSum, item) => itemSum + item.price * item.quantity, 0);
        return sum + shopSubtotal;
      }, 0);
      return { shop, orders: shopOrders.length, total };
    })
    .sort((left, right) => right.total - left.total || right.orders - left.orders)
    .slice(0, 5);
  const itemPerformance = data.items
    .map((item) => {
      const quantity = data.orders.reduce((sum, order) => {
        const orderedItem = order.items.find((entry) => entry.id === item.id);
        return sum + (orderedItem?.quantity || 0);
      }, 0);
      return { item, quantity, total: quantity * item.price };
    })
    .sort((left, right) => right.total - left.total || right.quantity - left.quantity)
    .slice(0, 5);
  const selectedUser = data.users.find((user) => user.uid === selectedUserId) || null;
  const visibleUsers = data.users.filter((user) => user.role !== "admin");
  const stats = [
    ["Customers", customers.length],
    ["Restaurants", data.shops.length],
    ["Delivery partners", deliveryPartners.length],
    ["Orders", data.orders.length],
    ["Platform revenue", `Rs ${revenue}`],
    ["Commission", `Rs ${commissionEarned}`]
  ];
  const askToConfirm = (confirmDetails: ConfirmAction) => {
    setConfirmAction(confirmDetails);
  };
  const runConfirmedAction = () => {
    confirmAction?.action();
    setConfirmAction(null);
  };

  return (
    <ProtectedPage>
      <main className="mx-auto w-full max-w-7xl px-4 py-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-950">Admin dashboard</h1>
            <p className="mt-2 text-sm text-slate-500">Manage users, shops, menu items, orders, and platform totals.</p>
          </div>
          <button
            className="brand-focus rounded-lg bg-red-600 px-4 py-3 text-sm font-black text-white"
            onClick={() => askToConfirm({
              title: "Are you sure you want to clear all non-admin users?",
              message: "This will delete non-admin users and their related admin data.",
              action: adminClearNonAdmins
            })}
          >
            Clear all non-admin users
          </button>
        </div>

        <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {stats.map(([label, value]) => (
            <div key={label} className="rounded-lg border border-orange-100 bg-white p-4 shadow-sm">
              <BarChart3 className="text-[#f04423]" size={18} />
              <p className="mt-3 text-xs font-black uppercase text-slate-400">{label}</p>
              <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
            </div>
          ))}
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-[1fr_1.2fr]">
          <div className="rounded-lg border border-orange-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <IndianRupee className="text-[#f04423]" />
              <h2 className="text-2xl font-black text-slate-950">Sales overview</h2>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {salesWindows.map((window) => (
                <div key={window.label} className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs font-black uppercase text-slate-400">{window.label}</p>
                  <p className="mt-2 text-2xl font-black text-slate-950">Rs {window.total}</p>
                  <p className="text-sm font-semibold text-slate-500">{window.orders} delivered orders</p>
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-orange-50 p-4">
                <p className="text-xs font-black uppercase text-[#f04423]">Total platform revenue</p>
                <p className="mt-2 text-2xl font-black text-slate-950">Rs {revenue}</p>
              </div>
              <div className="rounded-lg bg-yellow-50 p-4">
                <p className="text-xs font-black uppercase text-slate-500">Commission earned</p>
                <p className="mt-2 text-2xl font-black text-slate-950">Rs {commissionEarned}</p>
                <p className="text-sm font-semibold text-slate-500">{commissionRate}% platform commission</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-orange-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <PackageCheck className="text-[#f04423]" />
              <h2 className="text-2xl font-black text-slate-950">Order status</h2>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {orderStatusCards.map(({ label, value, icon: Icon }) => (
                <div key={label} className="rounded-lg bg-slate-50 p-4">
                  <Icon className="text-[#f04423]" size={18} />
                  <p className="mt-3 text-xs font-black uppercase text-slate-400">{label}</p>
                  <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-2">
          <div className="rounded-lg border border-orange-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Store className="text-[#f04423]" />
              <h2 className="text-2xl font-black text-slate-950">Restaurant applications</h2>
            </div>
            <div className="mt-4 grid gap-2">
              {restaurantApplications.length ? restaurantApplications.map((owner) => {
                const ownerShops = data.shops.filter((shop) => shop.ownerId === owner.uid);
                return (
                  <div key={owner.uid} className="rounded-lg bg-slate-50 p-3 text-sm">
                    <p className="font-black text-slate-950">{owner.fullName}</p>
                    <p className="text-slate-500">{owner.email}</p>
                    <p className="mt-1 text-xs font-bold text-[#f04423]">{ownerShops.length ? `${ownerShops.length} shop profile` : "No shop profile yet"} . {owner.suspended ? "Suspended" : "Active"}</p>
                  </div>
                );
              }) : <p className="rounded-lg bg-slate-50 p-3 text-sm font-semibold text-slate-500">No restaurant owner applications yet.</p>}
            </div>
          </div>

          <div className="rounded-lg border border-orange-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Truck className="text-[#f04423]" />
              <h2 className="text-2xl font-black text-slate-950">Delivery applications</h2>
            </div>
            <div className="mt-4 grid gap-2">
              {deliveryApplications.length ? deliveryApplications.map((partner) => (
                <div key={partner.uid} className="rounded-lg bg-slate-50 p-3 text-sm">
                  <p className="font-black text-slate-950">{partner.fullName}</p>
                  <p className="text-slate-500">{partner.email}</p>
                  <p className="mt-1 text-xs font-bold text-[#f04423]">{partner.mobile || "No mobile added"} . {partner.suspended ? "Suspended" : "Active"}</p>
                </div>
              )) : <p className="rounded-lg bg-slate-50 p-3 text-sm font-semibold text-slate-500">No delivery partner applications yet.</p>}
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-[1fr_1fr_1.1fr]">
          <div className="rounded-lg border border-orange-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="text-[#f04423]" />
              <h2 className="text-xl font-black text-slate-950">Top restaurants</h2>
            </div>
            <div className="mt-4 grid gap-2">
              {restaurantPerformance.map(({ shop, orders, total }) => (
                <div key={shop.id} className="rounded-lg bg-slate-50 p-3 text-sm">
                  <p className="font-black text-slate-950">{shop.name}</p>
                  <p className="text-slate-500">{orders} orders . Rs {total} sales</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-orange-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Utensils className="text-[#f04423]" />
              <h2 className="text-xl font-black text-slate-950">Top food items</h2>
            </div>
            <div className="mt-4 grid gap-2">
              {itemPerformance.map(({ item, quantity, total }) => (
                <div key={item.id} className="rounded-lg bg-slate-50 p-3 text-sm">
                  <p className="font-black text-slate-950">{item.name}</p>
                  <p className="text-slate-500">{quantity} sold . Rs {total} sales</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-orange-100 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <ReceiptText className="text-[#f04423]" />
                <h2 className="text-xl font-black text-slate-950">Recent activity</h2>
              </div>
              <button
                className="brand-focus rounded-lg bg-red-50 px-3 py-2 text-xs font-black text-red-700"
                onClick={() => askToConfirm({
                  title: "Are you sure you want to clear activity details?",
                  message: "This will clear recent activity, transaction, notification, and support log details.",
                  action: adminClearActivity
                })}
                disabled={recentActivities.length === 0}
              >
                Clear activity
              </button>
            </div>
            <div className="mt-4 grid max-h-80 gap-2 overflow-y-auto pr-1">
              {recentActivities.length ? recentActivities.map((activity) => (
                <div key={activity.id} className="rounded-lg bg-slate-50 p-3 text-sm">
                  <p className="font-black text-slate-950">{activity.title}</p>
                  <p className="mt-1 text-slate-500">{activity.body}</p>
                  <p className="mt-1 text-xs font-bold text-slate-400">{new Date(activity.createdAt).toLocaleString()}</p>
                </div>
              )) : <p className="rounded-lg bg-slate-50 p-3 text-sm font-semibold text-slate-500">No recent activity yet.</p>}
            </div>
          </div>
        </section>

        <SupportTicketDashboard
          data={data}
          onUpdateTicket={adminUpdateSupportTicket}
          onAddNote={adminAddSupportNote}
          onAddCommunication={adminAddSupportCommunication}
          onProcessCompensation={adminProcessSupportCompensation}
          onDeleteTicket={(ticketId) => askToConfirm({
            title: "Are you sure you want to delete this ticket?",
            message: "This support ticket history will be deleted.",
            action: () => adminDeleteSupportTicket(ticketId)
          })}
          onClearTickets={() => askToConfirm({
            title: "Are you sure you want to clear ticket history?",
            message: "All raised support ticket history will be deleted.",
            action: adminClearSupportTickets
          })}
        />

        <CancellationRefundDashboard
          data={data}
          onClearHistory={() => askToConfirm({
            title: "Are you sure you want to clear refund history?",
            message: "Refund requests, transaction records, and cancellation metadata will be cleared.",
            action: adminClearRefundHistory
          })}
        />

        <AdminGovernanceDashboard
          data={data}
          commissionRate={commissionRate}
          onSetCommissionRate={adminSetCommissionRate}
          onVerifyPartner={adminUpdatePartnerVerification}
          onClearActionLogs={() => askToConfirm({
            title: "Are you sure you want to clear admin action log?",
            message: "All recorded admin action log entries will be deleted.",
            action: adminClearActionLogs
          })}
        />

        <section className="mt-6 rounded-lg border border-orange-100 bg-white p-5 shadow-sm">
          <h2 className="text-2xl font-black text-slate-950">Users</h2>
          <div className="mt-4 grid gap-3">
            {visibleUsers.map((user) => (
              <article
                key={user.uid}
                className={clsx(
                  "rounded-lg p-3",
                  user.role === "admin"
                    ? "border-2 border-yellow-300 bg-yellow-50 shadow-sm shadow-yellow-200"
                    : "bg-slate-50"
                )}
              >
                <div className="grid gap-3 md:grid-cols-[1fr_180px_auto_auto_auto] md:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-black text-slate-950">{user.fullName}</p>
                      {user.role === "admin" && (
                        <span className="rounded-full bg-yellow-300 px-2 py-0.5 text-[11px] font-black uppercase text-slate-950">
                          Admin account
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500">{user.email} {user.suspended ? ". suspended" : ""}</p>
                  </div>
                  <select className="brand-focus rounded-lg border border-slate-200 px-3 py-2 text-sm" value={user.role} disabled={user.role === "admin"} onChange={(event) => adminUpdateUserRole(user.uid, event.target.value as UserRole)}>
                    {user.role === "admin" && <option value="admin">Admin</option>}
                    {editableRoles.map((role) => <option key={role} value={role}>{role === "owner" ? "Restaurant Owner" : role === "delivery" ? "Delivery Partner" : "User"}</option>)}
                  </select>
                  <button className="brand-focus rounded-lg bg-white px-3 py-2 text-sm font-black text-slate-800 ring-1 ring-slate-200" onClick={() => setSelectedUserId(selectedUserId === user.uid ? null : user.uid)}>
                    <UserRound className="mr-1 inline" size={16} />
                    {selectedUserId === user.uid ? "Hide details" : "View details"}
                  </button>
                  <button className="brand-focus rounded-lg bg-orange-50 px-3 py-2 text-sm font-black text-[#f04423]" disabled={user.role === "admin"} onClick={() => adminToggleUserSuspended(user.uid)}>
                    <UserX className="mr-1 inline" size={16} />
                    {user.suspended ? "Unsuspend" : "Suspend"}
                  </button>
                  <button
                    className="brand-focus rounded-lg bg-red-50 px-3 py-2 text-sm font-black text-red-700"
                    disabled={user.role === "admin"}
                    onClick={() => askToConfirm({
                      title: "Are you sure you want to delete this user?",
                      message: `${user.fullName} and related user records will be deleted.`,
                      action: () => adminDeleteUser(user.uid)
                    })}
                  >
                    <Trash2 className="mr-1 inline" size={16} />
                    Delete
                  </button>
                </div>

                {selectedUser?.uid === user.uid && (
                  <UserDetailsPanel userId={user.uid} data={data} />
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-3">
          <div className="flex h-[38rem] flex-col rounded-lg border border-orange-100 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black text-slate-950">Shops</h2>
            <div className="mt-4 grid min-h-0 flex-1 content-start gap-2 overflow-y-auto pr-2">
              {data.shops.map((shop) => (
                <button
                  key={shop.id}
                  className="admin-list-row group flex min-h-10 w-full items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-left text-sm text-slate-900 transition-colors hover:bg-[#f04423] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f04423]"
                  onClick={() => askToConfirm({
                    title: "Are you sure you want to delete this shop?",
                    message: `${shop.name}, its items, and uploaded images will be deleted.`,
                    action: () => adminDeleteShop(shop.id)
                  })}
                >
                  <span className="min-w-0 truncate pr-3">{shop.name}</span>
                  <Trash2 size={15} className="text-red-600 transition-colors group-hover:text-white" />
                </button>
              ))}
            </div>
          </div>
          <div className="flex h-[38rem] flex-col rounded-lg border border-orange-100 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black text-slate-950">Items</h2>
            <div className="mt-4 grid min-h-0 flex-1 content-start gap-2 overflow-y-auto pr-2">
              {data.items.map((item) => (
                <button
                  key={item.id}
                  className="admin-list-row group flex min-h-10 w-full items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-left text-sm text-slate-900 transition-colors hover:bg-[#f04423] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f04423]"
                  onClick={() => askToConfirm({
                    title: "Are you sure you want to delete this item?",
                    message: `${item.name} and its uploaded image will be deleted.`,
                    action: () => adminDeleteItem(item.id)
                  })}
                >
                  <span className="min-w-0 truncate pr-3">{item.name}</span>
                  <Trash2 size={15} className="text-red-600 transition-colors group-hover:text-white" />
                </button>
              ))}
            </div>
          </div>
          <div className="flex h-[38rem] flex-col rounded-lg border border-orange-100 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black text-slate-950">Orders</h2>
            <div className="mt-4 grid gap-2">
              {data.orders.map((order) => (
                <button
                  key={order.id}
                  className="admin-list-row group flex min-h-10 w-full items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-left text-sm text-slate-900 transition-colors hover:bg-[#f04423] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f04423]"
                  onClick={() => askToConfirm({
                    title: "Are you sure you want to delete this order?",
                    message: `Order ${order.id.slice(0, 12)} will be deleted.`,
                    action: () => adminDeleteOrder(order.id)
                  })}
                >
                  <span className="min-w-0 truncate pr-3">{order.id.slice(0, 12)} . Rs {order.total}</span>
                  <Trash2 size={15} className="text-red-600 transition-colors group-hover:text-white" />
                </button>
              ))}
            </div>
          </div>
        </section>
        <ConfirmActionDialog
          confirmAction={confirmAction}
          onCancel={() => setConfirmAction(null)}
          onConfirm={runConfirmedAction}
        />
      </main>
    </ProtectedPage>
  );
}

function ConfirmActionDialog({
  confirmAction,
  onCancel,
  onConfirm
}: {
  confirmAction: ConfirmAction | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!confirmAction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-sm overflow-hidden rounded-lg bg-white text-center shadow-2xl">
        <div className="px-5 py-6">
          <h2 className="text-lg font-black text-slate-950">{confirmAction.title}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">{confirmAction.message}</p>
          <p className="mt-2 text-xs font-bold uppercase text-slate-400">This action cannot be undone.</p>
        </div>
        <div className="grid grid-cols-2 border-t border-slate-200">
          <button className="px-4 py-3 text-sm font-black text-slate-700 hover:bg-slate-50" onClick={onCancel}>
            No
          </button>
          <button className="border-l border-slate-200 px-4 py-3 text-sm font-black text-red-600 hover:bg-red-50" onClick={onConfirm}>
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}

function SupportTicketDashboard({
  data,
  onUpdateTicket,
  onAddNote,
  onAddCommunication,
  onProcessCompensation,
  onDeleteTicket,
  onClearTickets
}: {
  data: ReturnType<typeof useRasoiGo>["data"];
  onUpdateTicket: (ticketId: string, patch: Partial<Pick<SupportLog, "assignedTo" | "assignedToName" | "category" | "priority" | "status">>) => void;
  onAddNote: (ticketId: string, note: string) => void;
  onAddCommunication: (ticketId: string, message: string) => void;
  onProcessCompensation: (ticketId: string, amount: number, reason: string) => void;
  onDeleteTicket: (ticketId: string) => void;
  onClearTickets: () => void;
}) {
  const supportExecutives = data.users.filter((user) => user.role === "admin");
  const [categoryFilter, setCategoryFilter] = useState<"all" | SupportLog["category"]>("all");
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [messageDrafts, setMessageDrafts] = useState<Record<string, string>>({});
  const [compensationDrafts, setCompensationDrafts] = useState<Record<string, { amount: string; reason: string }>>({});
  const filteredTickets = data.supportLogs
    .filter((ticket) => categoryFilter === "all" || ticket.category === categoryFilter)
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());

  return (
    <section className="mt-6 rounded-lg border border-orange-100 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-950">Raised support tickets</h2>
          <p className="mt-1 text-sm text-slate-500">View user-raised tickets, status, communication, notes, refunds, and resolution history.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="brand-focus rounded-lg bg-red-50 px-3 py-2 text-sm font-black text-red-700 disabled:opacity-50" onClick={onClearTickets} disabled={data.supportLogs.length === 0}>
            Clear history
          </button>
          <label className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-black text-slate-600">
            <select className="bg-transparent outline-none" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value as "all" | SupportLog["category"])}>
              <option value="all">All categories</option>
              <option value="order">Order</option>
              <option value="payment">Payment</option>
              <option value="delivery">Delivery</option>
            </select>
          </label>
        </div>
      </div>

      <div className="mt-5 grid gap-4">
        {filteredTickets.length ? filteredTickets.map((ticket) => {
          const customer = data.users.find((user) => user.uid === ticket.userId);
          const order = ticket.orderId ? data.orders.find((entry) => entry.id === ticket.orderId) : null;
          const vendorNames = order
            ? Array.from(new Set(order.items.map((item) => data.shops.find((shop) => shop.id === item.shopId)?.name).filter(Boolean))).join(", ")
            : "No linked vendor";
          const deliveryPartner = order?.deliveryPartnerId ? data.users.find((user) => user.uid === order.deliveryPartnerId) : null;
          const compensationDraft = compensationDrafts[ticket.id] || { amount: "", reason: "" };

          return (
            <article key={ticket.id} className="rounded-lg border border-orange-100 bg-slate-50 p-4">
              <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-black text-slate-950">{ticket.subject}</h3>
                    <span className="rounded-md bg-orange-50 px-2 py-1 text-xs font-black uppercase text-[#f04423]">{ticket.category}</span>
                    <span className="rounded-md bg-white px-2 py-1 text-xs font-black uppercase text-slate-600">{ticket.priority}</span>
                    <span className="rounded-md bg-white px-2 py-1 text-xs font-black uppercase text-slate-600">{ticket.status}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{customer?.fullName || "Customer"} . {customer?.email || ticket.userId}</p>
                  <p className="mt-2 text-sm text-slate-600">{ticket.message}</p>
                  <button className="brand-focus mt-3 inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-2 text-sm font-black text-red-700" onClick={() => onDeleteTicket(ticket.id)}>
                    <Trash2 size={15} />
                    Delete ticket
                  </button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:w-[32rem]">
                  <select className="rounded-lg border border-slate-200 px-3 py-2 text-sm" value={ticket.category} onChange={(event) => onUpdateTicket(ticket.id, { category: event.target.value as SupportLog["category"] })}>
                    <option value="order">Order</option>
                    <option value="payment">Payment</option>
                    <option value="delivery">Delivery</option>
                  </select>
                  <select className="rounded-lg border border-slate-200 px-3 py-2 text-sm" value={ticket.priority} onChange={(event) => onUpdateTicket(ticket.id, { priority: event.target.value as SupportLog["priority"] })}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                  <select className="rounded-lg border border-slate-200 px-3 py-2 text-sm" value={ticket.status} onChange={(event) => onUpdateTicket(ticket.id, { status: event.target.value as SupportLog["status"] })}>
                    <option value="open">Open</option>
                    <option value="pending">Pending</option>
                    <option value="resolved">Resolved</option>
                  </select>
                  <select
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={ticket.assignedTo || ""}
                    onChange={(event) => {
                      const assignee = supportExecutives.find((user) => user.uid === event.target.value);
                      onUpdateTicket(ticket.id, { assignedTo: assignee?.uid || undefined, assignedToName: assignee?.fullName || undefined });
                    }}
                  >
                    <option value="">Unassigned</option>
                    {supportExecutives.map((user) => <option key={user.uid} value={user.uid}>{user.fullName}</option>)}
                  </select>
                </div>
              </div>

              <div className="mt-4 grid gap-4 xl:grid-cols-3">
                <section className="rounded-lg bg-white p-3">
                  <h4 className="font-black text-slate-950">Communication</h4>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold">
                    <span className="rounded-md bg-slate-100 px-2 py-1">Customer: {customer?.fullName || "Unknown"}</span>
                    <span className="rounded-md bg-slate-100 px-2 py-1">Vendor: {vendorNames}</span>
                    <span className="rounded-md bg-slate-100 px-2 py-1">Delivery: {deliveryPartner?.fullName || "Not assigned"}</span>
                  </div>
                  <div className="mt-3 grid max-h-40 gap-2 overflow-y-auto">
                    {ticket.communications.map((entry) => (
                      <div key={entry.id} className="rounded-lg bg-slate-50 p-2 text-sm">
                        <p className="font-black text-slate-950">{entry.fromName} <span className="text-xs uppercase text-slate-400">{entry.fromRole}</span></p>
                        <p className="text-slate-500">{entry.message}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <input className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Reply/update" value={messageDrafts[ticket.id] || ""} onChange={(event) => setMessageDrafts((current) => ({ ...current, [ticket.id]: event.target.value }))} />
                    <button className="rounded-lg bg-[#f04423] px-3 py-2 text-sm font-black text-white" onClick={() => {
                      onAddCommunication(ticket.id, messageDrafts[ticket.id] || "");
                      setMessageDrafts((current) => ({ ...current, [ticket.id]: "" }));
                    }}>
                      Add
                    </button>
                  </div>
                </section>

                <section className="rounded-lg bg-white p-3">
                  <h4 className="font-black text-slate-950">Internal notes</h4>
                  <div className="mt-3 grid max-h-40 gap-2 overflow-y-auto">
                    {ticket.internalNotes.length ? ticket.internalNotes.map((note) => (
                      <div key={note.id} className="rounded-lg bg-slate-50 p-2 text-sm">
                        <p className="font-black text-slate-950">{note.authorName}</p>
                        <p className="text-slate-500">{note.note}</p>
                      </div>
                    )) : <p className="text-sm font-semibold text-slate-500">No internal notes yet.</p>}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <input className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Internal note" value={noteDrafts[ticket.id] || ""} onChange={(event) => setNoteDrafts((current) => ({ ...current, [ticket.id]: event.target.value }))} />
                    <button className="rounded-lg bg-slate-950 px-3 py-2 text-sm font-black text-white" onClick={() => {
                      onAddNote(ticket.id, noteDrafts[ticket.id] || "");
                      setNoteDrafts((current) => ({ ...current, [ticket.id]: "" }));
                    }}>
                      Add
                    </button>
                  </div>
                </section>

                <section className="rounded-lg bg-white p-3">
                  <h4 className="font-black text-slate-950">Compensation and history</h4>
                  {ticket.compensation ? (
                    <p className="mt-2 rounded-lg bg-emerald-50 p-2 text-sm font-bold text-emerald-700">Rs {ticket.compensation.amount} processed: {ticket.compensation.reason}</p>
                  ) : (
                    <div className="mt-3 grid gap-2">
                      <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" inputMode="numeric" placeholder="Amount" value={compensationDraft.amount} onChange={(event) => setCompensationDrafts((current) => ({ ...current, [ticket.id]: { ...compensationDraft, amount: event.target.value } }))} />
                      <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Reason" value={compensationDraft.reason} onChange={(event) => setCompensationDrafts((current) => ({ ...current, [ticket.id]: { ...compensationDraft, reason: event.target.value } }))} />
                      <button className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-black text-white" onClick={() => {
                        onProcessCompensation(ticket.id, Number(compensationDraft.amount), compensationDraft.reason);
                        setCompensationDrafts((current) => ({ ...current, [ticket.id]: { amount: "", reason: "" } }));
                      }}>
                        Process refund
                      </button>
                    </div>
                  )}
                  <div className="mt-3 grid max-h-36 gap-2 overflow-y-auto">
                    {ticket.resolutionHistory.map((entry) => (
                      <div key={entry.id} className="rounded-lg bg-slate-50 p-2 text-xs">
                        <p className="font-black text-slate-950">{entry.action}</p>
                        <p className="text-slate-400">{entry.actorName} . {new Date(entry.createdAt).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </article>
          );
        }) : <p className="rounded-lg bg-slate-50 p-4 text-sm font-semibold text-slate-500">No support tickets yet.</p>}
      </div>
    </section>
  );
}

function CancellationRefundDashboard({
  data,
  onClearHistory
}: {
  data: ReturnType<typeof useRasoiGo>["data"];
  onClearHistory: () => void;
}) {
  const cancelledOrders = data.orders.filter((order) => order.status === "cancelled");
  const refundByOrderId = new Map(data.refundRecords.map((record) => [record.orderId, record]));
  const refundRecords = data.refundRecords
    .slice()
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
  const cancellationReasons = cancelledOrders.map((order) => {
    const customer = data.users.find((user) => user.uid === order.userId);
    const record = refundByOrderId.get(order.id);
    return {
      order,
      customer,
      reason: record?.reason || order.cancellationReason || "No reason recorded"
    };
  });
  const restaurantCancellationRates = data.shops
    .map((shop) => {
      const shopOrders = data.orders.filter((order) => order.items.some((item) => item.shopId === shop.id));
      const cancelled = shopOrders.filter((order) => order.status === "cancelled").length;
      return {
        id: shop.id,
        name: shop.name,
        cancelled,
        total: shopOrders.length,
        rate: shopOrders.length ? Math.round((cancelled / shopOrders.length) * 100) : 0
      };
    })
    .filter((entry) => entry.cancelled > 0)
    .sort((left, right) => right.rate - left.rate || right.cancelled - left.cancelled)
    .slice(0, 5);
  const partnerCancellationRates = data.users
    .filter((user) => user.role === "delivery")
    .map((partner) => {
      const partnerOrders = data.orders.filter((order) => order.deliveryPartnerId === partner.uid);
      const cancelled = partnerOrders.filter((order) => order.status === "cancelled").length;
      return {
        id: partner.uid,
        name: partner.fullName,
        cancelled,
        total: partnerOrders.length,
        rate: partnerOrders.length ? Math.round((cancelled / partnerOrders.length) * 100) : 0
      };
    })
    .filter((entry) => entry.cancelled > 0)
    .sort((left, right) => right.rate - left.rate || right.cancelled - left.cancelled)
    .slice(0, 5);
  const pendingRefundValue = data.refundRecords
    .filter((record) => record.status === "requested")
    .reduce((total, record) => total + record.amount, 0);
  const approvedRefundValue = data.refundRecords
    .filter((record) => record.status === "approved")
    .reduce((total, record) => total + record.amount, 0);
  const totalPenalties = data.refundRecords
    .filter((record) => record.status === "approved")
    .reduce((total, record) => total + record.penalty, 0);
  const hasRefundHistory = data.refundRecords.length > 0 || data.orders.some((order) => order.refundStatus || order.refundAmount !== undefined || order.cancellationPenalty !== undefined || order.refundRequestedAt);

  return (
    <section className="mt-6 rounded-lg border border-orange-100 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-950">Cancellation and refunds</h2>
          <p className="mt-1 text-sm text-slate-500">View automatic refunds, cash cancellation details, transaction records, and high cancellation areas.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="brand-focus rounded-lg bg-red-50 px-3 py-2 text-sm font-black text-red-700 disabled:opacity-50" onClick={onClearHistory} disabled={!hasRefundHistory}>
            Clear history
          </button>
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div className="rounded-lg bg-slate-50 px-3 py-2">
              <p className="text-xs font-black uppercase text-slate-400">Pending</p>
              <p className="font-black text-slate-950">Rs {pendingRefundValue}</p>
            </div>
            <div className="rounded-lg bg-slate-50 px-3 py-2">
              <p className="text-xs font-black uppercase text-slate-400">Refunded</p>
              <p className="font-black text-slate-950">Rs {approvedRefundValue}</p>
            </div>
            <div className="rounded-lg bg-slate-50 px-3 py-2">
              <p className="text-xs font-black uppercase text-slate-400">Penalties</p>
              <p className="font-black text-slate-950">Rs {totalPenalties}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4">
        <section className="rounded-lg bg-slate-50 p-4">
          <h3 className="text-lg font-black text-slate-950">Cancellation and refund details</h3>
          <div className="mt-3 grid max-h-96 gap-3 overflow-y-auto pr-1">
            {cancelledOrders.length ? cancelledOrders.map((order) => {
              const record = refundByOrderId.get(order.id);
              const customer = data.users.find((user) => user.uid === order.userId);
              const refundLabel = order.paymentMethod === "cash"
                ? "No refund required"
                : record?.status === "approved"
                  ? `Refunded Rs ${record.amount}`
                  : "Refund information pending";

              return (
                <article key={order.id} className="rounded-lg bg-white p-3 text-sm">
                  <div className="flex flex-col gap-2 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                      <p className="font-black text-slate-950">Order {order.id.slice(0, 12)} . Rs {order.total}</p>
                      <p className="text-slate-500">{customer?.fullName || "Customer"} . {customer?.email || order.userId}</p>
                      <p className="mt-1 text-xs font-bold text-red-600">Reason: {record?.reason || order.cancellationReason || "No reason recorded"}</p>
                    </div>
                    <div className="grid gap-2 text-xs font-black uppercase sm:grid-cols-3">
                      <span className="rounded-lg bg-orange-50 px-3 py-2 text-[#f04423]">{order.paymentMethod}</span>
                      <span className="rounded-lg bg-emerald-50 px-3 py-2 text-emerald-700">{refundLabel}</span>
                      <span className="rounded-lg bg-slate-50 px-3 py-2 text-slate-600">{record?.transactionId || "No transaction"}</span>
                    </div>
                  </div>
                  <p className="mt-2 text-xs font-bold text-slate-400">{order.cancelledAt ? new Date(order.cancelledAt).toLocaleString() : "Cancelled"} . {order.refundDecisionNote || "Cancellation recorded."}</p>
                </article>
              );
            }) : <p className="rounded-lg bg-white p-3 text-sm font-semibold text-slate-500">No cancellations yet.</p>}
          </div>
        </section>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <section className="rounded-lg bg-slate-50 p-4">
          <h3 className="text-lg font-black text-slate-950">Cancellation reasons</h3>
          <div className="mt-3 grid max-h-72 gap-2 overflow-y-auto pr-1">
            {cancellationReasons.length ? cancellationReasons.map(({ order, customer, reason }) => (
              <div key={order.id} className="rounded-lg bg-white p-3 text-sm">
                <p className="font-black text-slate-950">{order.id.slice(0, 12)} . {customer?.fullName || "Customer"}</p>
                <p className="mt-1 text-slate-500">{reason}</p>
              </div>
            )) : <p className="rounded-lg bg-white p-3 text-sm font-semibold text-slate-500">No cancellations yet.</p>}
          </div>
        </section>

        <section className="rounded-lg bg-slate-50 p-4">
          <h3 className="text-lg font-black text-slate-950">Refund transactions</h3>
          <div className="mt-3 grid max-h-72 gap-2 overflow-y-auto pr-1">
            {refundRecords.length ? refundRecords.map((record) => (
              <div key={record.id} className="rounded-lg bg-white p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-black text-slate-950">Rs {record.amount} . {record.type}</p>
                  <span className="rounded-md bg-orange-50 px-2 py-1 text-xs font-black uppercase text-[#f04423]">{record.status}</span>
                </div>
                <p className="mt-1 text-slate-500">Penalty Rs {record.penalty} . Order {record.orderId.slice(0, 10)}</p>
                <p className="mt-1 text-xs text-slate-400">{record.transactionId || "No transaction id yet"}</p>
              </div>
            )) : <p className="rounded-lg bg-white p-3 text-sm font-semibold text-slate-500">No refund transactions yet.</p>}
          </div>
        </section>

        <section className="rounded-lg bg-slate-50 p-4">
          <h3 className="text-lg font-black text-slate-950">High cancellation rates</h3>
          <div className="mt-3 grid gap-3">
            <div>
              <p className="text-xs font-black uppercase text-slate-400">Restaurants</p>
              <div className="mt-2 grid gap-2">
                {restaurantCancellationRates.length ? restaurantCancellationRates.map((entry) => (
                  <div key={entry.id} className="rounded-lg bg-white p-2 text-sm">
                    <p className="font-black text-slate-950">{entry.name}</p>
                    <p className="text-slate-500">{entry.cancelled}/{entry.total} cancelled . {entry.rate}%</p>
                  </div>
                )) : <p className="rounded-lg bg-white p-2 text-sm font-semibold text-slate-500">No restaurant risk yet.</p>}
              </div>
            </div>
            <div>
              <p className="text-xs font-black uppercase text-slate-400">Delivery partners</p>
              <div className="mt-2 grid gap-2">
                {partnerCancellationRates.length ? partnerCancellationRates.map((entry) => (
                  <div key={entry.id} className="rounded-lg bg-white p-2 text-sm">
                    <p className="font-black text-slate-950">{entry.name}</p>
                    <p className="text-slate-500">{entry.cancelled}/{entry.total} cancelled . {entry.rate}%</p>
                  </div>
                )) : <p className="rounded-lg bg-white p-2 text-sm font-semibold text-slate-500">No delivery risk yet.</p>}
              </div>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}

function AdminGovernanceDashboard({
  data,
  commissionRate,
  onSetCommissionRate,
  onVerifyPartner,
  onClearActionLogs
}: {
  data: ReturnType<typeof useRasoiGo>["data"];
  commissionRate: number;
  onSetCommissionRate: (rate: number) => void;
  onVerifyPartner: (uid: string, status: NonNullable<UserProfile["documentVerification"]>["status"]) => void;
  onClearActionLogs: () => void;
}) {
  const [commissionDraft, setCommissionDraft] = useState(String(commissionRate));
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    restaurantId: "all",
    city: "all",
    zone: "all",
    paymentMethod: "all",
    orderStatus: "all"
  });
  const partners = data.users.filter((user) => user.role === "owner" || user.role === "delivery");
  const pendingVerificationPartners = partners.filter((partner) => (partner.documentVerification?.status || "pending") === "pending");
  const cities = Array.from(new Set(data.shops.map((shop) => shop.city).filter(Boolean)));
  const zones = Array.from(new Set(data.shops.map((shop) => shop.zone || shop.city).filter(Boolean)));
  const filteredOrders = data.orders.filter((order) => {
    const orderTime = new Date(order.createdAt).getTime();
    const fromOk = !filters.dateFrom || orderTime >= new Date(filters.dateFrom).getTime();
    const toOk = !filters.dateTo || orderTime <= new Date(`${filters.dateTo}T23:59:59`).getTime();
    const shopsForOrder = order.items
      .map((item) => data.shops.find((shop) => shop.id === item.shopId))
      .filter((shop): shop is NonNullable<typeof shop> => Boolean(shop));
    const restaurantOk = filters.restaurantId === "all" || order.items.some((item) => item.shopId === filters.restaurantId);
    const cityOk = filters.city === "all" || shopsForOrder.some((shop) => shop.city === filters.city);
    const zoneOk = filters.zone === "all" || shopsForOrder.some((shop) => (shop.zone || shop.city) === filters.zone);
    const paymentOk = filters.paymentMethod === "all" || order.paymentMethod === filters.paymentMethod;
    const statusOk = filters.orderStatus === "all" || order.status === filters.orderStatus;
    return fromOk && toOk && restaurantOk && cityOk && zoneOk && paymentOk && statusOk;
  });
  const reportSales = filteredOrders.reduce((total, order) => total + order.total, 0);
  const reportCommission = Math.round(reportSales * (commissionRate / 100));
  const transactionLog = [
    ...data.orders.map((order) => ({
      id: `order-${order.id}`,
      title: `Order payment ${order.id.slice(0, 10)}`,
      amount: order.paymentMethod === "cash" ? 0 : order.total,
      meta: `${order.paymentMethod} . ${order.paymentStatus || "pending"} . ${order.status}`,
      createdAt: order.createdAt
    })),
    ...data.wallet.map((entry) => ({
      id: `wallet-${entry.id}`,
      title: entry.label,
      amount: entry.amount,
      meta: entry.type,
      createdAt: entry.createdAt
    })),
    ...data.refundRecords.map((record) => ({
      id: `refund-${record.id}`,
      title: `Refund ${record.orderId.slice(0, 10)}`,
      amount: record.amount,
      meta: `${record.status} . penalty Rs ${record.penalty}`,
      createdAt: record.processedAt || record.createdAt
    }))
  ].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()).slice(0, 12);
  const activeTrackingOrders = data.orders
    .filter((order) => !["delivered", "cancelled"].includes(order.status))
    .slice()
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, 8);
  const locationCoverage = Array.from(new Set(data.shops.map((shop) => `${shop.city}::${shop.zone || shop.city}`))).map((key) => {
    const [city, zone] = key.split("::");
    const shops = data.shops.filter((shop) => shop.city === city && (shop.zone || shop.city) === zone);
    const branches = shops.filter((shop) => shop.branchName).length;
    return { city, zone, shops: shops.length, branches };
  });

  return (
    <section className="mt-6 rounded-lg border border-orange-100 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-2xl font-black text-slate-950">Admin controls and reports</h2>
        <p className="mt-1 text-sm text-slate-500">Audit admin actions, verify partners, monitor payments, track orders, and filter reports.</p>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_1fr_1.1fr]">
        <section className="rounded-lg bg-slate-50 p-4">
          <h3 className="text-lg font-black text-slate-950">Commission control</h3>
          <div className="mt-3 flex gap-2">
            <input className="brand-focus min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm" inputMode="decimal" value={commissionDraft} onChange={(event) => setCommissionDraft(event.target.value)} />
            <button className="brand-focus rounded-lg bg-[#f04423] px-4 py-2 text-sm font-black text-white" onClick={() => onSetCommissionRate(Number(commissionDraft))}>
              Save
            </button>
          </div>
          <p className="mt-2 text-xs font-bold text-slate-500">Current commission: {commissionRate}% . Changes are recorded in the admin action log.</p>
        </section>

        <section className="rounded-lg bg-slate-50 p-4">
          <h3 className="text-lg font-black text-slate-950">Sensitive partner info</h3>
          <div className="mt-3 grid max-h-48 gap-2 overflow-y-auto pr-1">
            {partners.length ? partners.map((partner) => (
              <div key={partner.uid} className="rounded-lg bg-white p-3 text-sm">
                <p className="font-black text-slate-950">{partner.fullName} . {partner.role}</p>
                <p className="text-slate-500">{partner.bankDetails ? `${partner.bankDetails.bankName} . ****${partner.bankDetails.accountLast4}` : "No bank details added"}</p>
                <p className="text-xs font-bold text-slate-400">{partner.bankDetails?.upiId ? `UPI: ${partner.bankDetails.upiId}` : "Sensitive details visible only in admin panel"}</p>
              </div>
            )) : <p className="rounded-lg bg-white p-3 text-sm font-semibold text-slate-500">No vendor or delivery partners yet.</p>}
          </div>
        </section>

        <section className="rounded-lg bg-slate-50 p-4">
          <h3 className="text-lg font-black text-slate-950">Real-time order tracking</h3>
          <div className="mt-3 grid max-h-48 gap-2 overflow-y-auto pr-1">
            {activeTrackingOrders.length ? activeTrackingOrders.map((order) => (
              <div key={order.id} className="rounded-lg bg-white p-3 text-sm">
                <p className="font-black text-slate-950">{order.id.slice(0, 12)} . {order.status.replaceAll("-", " ")}</p>
                <p className="text-slate-500">{order.deliveryPartnerName || "No delivery partner"} . {order.deliveryLocation ? `Live ${order.deliveryLocation.lat}, ${order.deliveryLocation.lng}` : "No live location yet"}</p>
              </div>
            )) : <p className="rounded-lg bg-white p-3 text-sm font-semibold text-slate-500">No active orders to track.</p>}
          </div>
        </section>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_1fr]">
        <section className="rounded-lg bg-slate-50 p-4">
          <h3 className="text-lg font-black text-slate-950">Document verification</h3>
          <div className="mt-3 grid max-h-72 gap-2 overflow-y-auto pr-1">
            {pendingVerificationPartners.length ? pendingVerificationPartners.map((partner) => {
              const verification = partner.documentVerification || { status: "pending" as const };
              return (
                <div key={partner.uid} className="rounded-lg bg-white p-3 text-sm">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-black text-slate-950">{partner.fullName} . {partner.role}</p>
                      <p className="text-slate-500">{verification.documentType || (partner.role === "owner" ? "FSSAI / trade license" : "ID and vehicle proof")} . {verification.documentId || "Document pending"}</p>
                      <p className="text-xs font-black uppercase text-[#f04423]">{verification.status}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button className="rounded-lg bg-emerald-50 px-3 py-2 font-black text-emerald-700" onClick={() => onVerifyPartner(partner.uid, "verified")}>Verify</button>
                      <button className="rounded-lg bg-red-50 px-3 py-2 font-black text-red-700" onClick={() => onVerifyPartner(partner.uid, "rejected")}>Reject</button>
                    </div>
                  </div>
                </div>
              );
            }) : <p className="rounded-lg bg-white p-3 text-sm font-semibold text-slate-500">No pending partner documents to verify.</p>}
          </div>
        </section>

        <section className="rounded-lg bg-slate-50 p-4">
          <h3 className="text-lg font-black text-slate-950">Transaction log</h3>
          <div className="mt-3 grid max-h-72 gap-2 overflow-y-auto pr-1">
            {transactionLog.length ? transactionLog.map((entry) => (
              <div key={entry.id} className="rounded-lg bg-white p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-black text-slate-950">{entry.title}</p>
                  <span className="font-black text-[#f04423]">Rs {entry.amount}</span>
                </div>
                <p className="text-slate-500">{entry.meta}</p>
                <p className="text-xs text-slate-400">{new Date(entry.createdAt).toLocaleString()}</p>
              </div>
            )) : <p className="rounded-lg bg-white p-3 text-sm font-semibold text-slate-500">No financial transactions yet.</p>}
          </div>
        </section>
      </div>

      <section className="mt-4 rounded-lg bg-slate-50 p-4">
        <h3 className="text-lg font-black text-slate-950">Filtered reports</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-3 xl:grid-cols-7">
          <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" type="date" value={filters.dateFrom} onChange={(event) => setFilters((current) => ({ ...current, dateFrom: event.target.value }))} />
          <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" type="date" value={filters.dateTo} onChange={(event) => setFilters((current) => ({ ...current, dateTo: event.target.value }))} />
          <select className="rounded-lg border border-slate-200 px-3 py-2 text-sm" value={filters.restaurantId} onChange={(event) => setFilters((current) => ({ ...current, restaurantId: event.target.value }))}>
            <option value="all">All restaurants</option>
            {data.shops.map((shop) => <option key={shop.id} value={shop.id}>{shop.name}</option>)}
          </select>
          <select className="rounded-lg border border-slate-200 px-3 py-2 text-sm" value={filters.city} onChange={(event) => setFilters((current) => ({ ...current, city: event.target.value }))}>
            <option value="all">All cities</option>
            {cities.map((city) => <option key={city} value={city}>{city}</option>)}
          </select>
          <select className="rounded-lg border border-slate-200 px-3 py-2 text-sm" value={filters.zone} onChange={(event) => setFilters((current) => ({ ...current, zone: event.target.value }))}>
            <option value="all">All zones</option>
            {zones.map((zone) => <option key={zone} value={zone}>{zone}</option>)}
          </select>
          <select className="rounded-lg border border-slate-200 px-3 py-2 text-sm" value={filters.paymentMethod} onChange={(event) => setFilters((current) => ({ ...current, paymentMethod: event.target.value }))}>
            <option value="all">All payments</option>
            <option value="cash">Cash</option>
            <option value="razorpay">Razorpay</option>
            <option value="wallet">Wallet</option>
          </select>
          <select className="rounded-lg border border-slate-200 px-3 py-2 text-sm" value={filters.orderStatus} onChange={(event) => setFilters((current) => ({ ...current, orderStatus: event.target.value }))}>
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="received">Accepted</option>
            <option value="preparing">Preparing</option>
            <option value="out-for-delivery">Out for delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-white p-3"><p className="text-xs font-black uppercase text-slate-400">Orders</p><p className="text-2xl font-black text-slate-950">{filteredOrders.length}</p></div>
          <div className="rounded-lg bg-white p-3"><p className="text-xs font-black uppercase text-slate-400">Sales</p><p className="text-2xl font-black text-slate-950">Rs {reportSales}</p></div>
          <div className="rounded-lg bg-white p-3"><p className="text-xs font-black uppercase text-slate-400">Commission</p><p className="text-2xl font-black text-slate-950">Rs {reportCommission}</p></div>
        </div>
      </section>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <section className="rounded-lg bg-slate-50 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-black text-slate-950">Admin action log</h3>
            <button className="brand-focus rounded-lg bg-red-50 px-3 py-2 text-sm font-black text-red-700 disabled:opacity-50" onClick={onClearActionLogs} disabled={data.adminActionLogs.length === 0}>
              Clear log
            </button>
          </div>
          <div className="mt-3 grid max-h-64 gap-2 overflow-y-auto pr-1">
            {data.adminActionLogs.length ? data.adminActionLogs.slice(0, 12).map((entry) => (
              <div key={entry.id} className="rounded-lg bg-white p-3 text-sm">
                <p className="font-black text-slate-950">{entry.action}</p>
                <p className="text-slate-500">{entry.actorName} . {entry.targetType}</p>
                <p className="text-xs text-slate-400">{new Date(entry.createdAt).toLocaleString()}</p>
              </div>
            )) : <p className="rounded-lg bg-white p-3 text-sm font-semibold text-slate-500">No admin actions recorded yet.</p>}
          </div>
        </section>

        <section className="rounded-lg bg-slate-50 p-4">
          <h3 className="text-lg font-black text-slate-950">Cities, zones and branches</h3>
          <div className="mt-3 grid max-h-64 gap-2 overflow-y-auto pr-1">
            {locationCoverage.map((entry) => (
              <div key={`${entry.city}-${entry.zone}`} className="rounded-lg bg-white p-3 text-sm">
                <p className="font-black text-slate-950">{entry.city} . {entry.zone}</p>
                <p className="text-slate-500">{entry.shops} restaurants . {entry.branches} branch profiles</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

function UserDetailsPanel({ userId, data }: { userId: string; data: ReturnType<typeof useRasoiGo>["data"] }) {
  const user = data.users.find((entry) => entry.uid === userId);
  const userOrders = data.orders.filter((order) => order.userId === userId);
  const savedAddresses = data.addressesByUser[userId] || [];
  const favoriteItemIds = data.favoritesByUser[userId] || [];
  const favoriteRestaurantsById = new Map<string, (typeof data.shops)[number]>();
  favoriteItemIds.forEach((itemId) => {
    const item = data.items.find((entry) => entry.id === itemId);
    const shop = item ? data.shops.find((entry) => entry.id === item.shopId) : null;
    if (shop) favoriteRestaurantsById.set(shop.id, shop);
  });
  const favoriteRestaurants = Array.from(favoriteRestaurantsById.values());
  const supportLogs = data.supportLogs.filter((log) => log.userId === userId);
  const totalSpent = userOrders.reduce((total, order) => total + order.total, 0);
  const lastOrder = userOrders[0];

  if (!user) return null;

  return (
    <div className="mt-4 grid gap-4 rounded-lg border border-orange-100 bg-white p-4 lg:grid-cols-2">
      <section className="rounded-lg bg-slate-50 p-4">
        <h3 className="flex items-center gap-2 text-lg font-black text-slate-950"><UserRound size={18} className="text-[#f04423]" /> Account details</h3>
        <div className="mt-3 grid gap-2 text-sm text-slate-600">
          <p><span className="font-black text-slate-900">Name:</span> {user.fullName}</p>
          <p><span className="font-black text-slate-900">Email:</span> {user.email}</p>
          <p><span className="font-black text-slate-900">Mobile:</span> {user.mobile || "Not added"}</p>
          <p><span className="font-black text-slate-900">Role:</span> {user.role}</p>
          <p><span className="font-black text-slate-900">Status:</span> {user.suspended ? "Suspended" : "Active"}</p>
          <p><span className="font-black text-slate-900">Joined:</span> {user.createdAt ? new Date(user.createdAt).toLocaleString() : "Unknown"}</p>
          <p><span className="font-black text-slate-900">UID:</span> {user.uid}</p>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <div className="rounded-lg bg-white p-3">
            <p className="text-xs font-black uppercase text-slate-400">Orders</p>
            <p className="text-xl font-black text-slate-950">{userOrders.length}</p>
          </div>
          <div className="rounded-lg bg-white p-3">
            <p className="text-xs font-black uppercase text-slate-400">Spent</p>
            <p className="text-xl font-black text-slate-950">Rs {totalSpent}</p>
          </div>
          <div className="rounded-lg bg-white p-3">
            <p className="text-xs font-black uppercase text-slate-400">Last order</p>
            <p className="truncate text-sm font-black text-slate-950">{lastOrder ? lastOrder.id.slice(0, 10) : "None"}</p>
          </div>
        </div>
      </section>

      <section className="rounded-lg bg-slate-50 p-4">
        <h3 className="flex items-center gap-2 text-lg font-black text-slate-950"><ClipboardList size={18} className="text-[#f04423]" /> Order history</h3>
        <div className="mt-3 grid max-h-64 gap-2 overflow-y-auto pr-1">
          {userOrders.length ? userOrders.map((order) => (
            <div key={order.id} className="rounded-lg bg-white p-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="font-black text-slate-950">#{order.id.slice(0, 12)}</p>
                <span className="rounded-md bg-orange-50 px-2 py-1 text-xs font-black text-[#f04423]">Rs {order.total}</span>
              </div>
              <p className="mt-1 text-slate-500">{order.status.replaceAll("-", " ")} . {order.paymentMethod}</p>
              <p className="mt-1 text-xs text-slate-400">{new Date(order.createdAt).toLocaleString()}</p>
            </div>
          )) : <p className="rounded-lg bg-white p-3 text-sm font-semibold text-slate-500">No orders yet.</p>}
        </div>
      </section>

      <section className="rounded-lg bg-slate-50 p-4">
        <h3 className="flex items-center gap-2 text-lg font-black text-slate-950"><MapPin size={18} className="text-[#f04423]" /> Saved addresses</h3>
        <div className="mt-3 grid gap-2">
          {savedAddresses.length ? savedAddresses.map((address) => (
            <div key={address.id} className="rounded-lg bg-white p-3 text-sm">
              <p className="font-black text-slate-950">{address.label}{address.default ? " . default" : ""}</p>
              <p className="mt-1 text-slate-500">{address.line1}, {address.city}{address.landmark ? `, ${address.landmark}` : ""}</p>
            </div>
          )) : <p className="rounded-lg bg-white p-3 text-sm font-semibold text-slate-500">No saved addresses.</p>}
        </div>
      </section>

      <section className="rounded-lg bg-slate-50 p-4">
        <h3 className="flex items-center gap-2 text-lg font-black text-slate-950"><Heart size={18} className="text-[#f04423]" /> Favorite restaurants</h3>
        <div className="mt-3 grid gap-2">
          {favoriteRestaurants.length ? favoriteRestaurants.map((shop) => (
            <div key={shop.id} className="rounded-lg bg-white p-3 text-sm">
              <p className="font-black text-slate-950">{shop.name}</p>
              <p className="mt-1 text-slate-500">{shop.city} . {shop.cuisine} . {shop.rating.toFixed(1)}</p>
            </div>
          )) : <p className="rounded-lg bg-white p-3 text-sm font-semibold text-slate-500">No favorite restaurants yet.</p>}
        </div>
      </section>

      <section className="rounded-lg bg-slate-50 p-4 lg:col-span-2">
        <h3 className="flex items-center gap-2 text-lg font-black text-slate-950"><MessageSquare size={18} className="text-[#f04423]" /> Support logs</h3>
        <div className="mt-3 grid gap-2">
          {supportLogs.length ? supportLogs.map((log) => (
            <div key={log.id} className="rounded-lg bg-white p-3 text-sm">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-black text-slate-950">{log.subject}</p>
                <span className="rounded-md bg-orange-50 px-2 py-1 text-xs font-black text-[#f04423]">{log.status}</span>
              </div>
              <p className="mt-1 text-slate-500">{log.message}</p>
              <p className="mt-1 text-xs text-slate-400">{new Date(log.createdAt).toLocaleString()}</p>
            </div>
          )) : <p className="rounded-lg bg-white p-3 text-sm font-semibold text-slate-500">No support logs yet.</p>}
        </div>
      </section>
    </div>
  );
}
