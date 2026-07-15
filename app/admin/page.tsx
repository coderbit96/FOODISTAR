"use client";

import { BarChart3, ShieldCheck, Trash2, UserX } from "lucide-react";
import { ProtectedPage } from "@/components/protected-page";
import { useRasoiGo } from "@/components/app-provider";
import type { UserRole } from "@/lib/types";

const editableRoles: UserRole[] = ["user", "owner", "delivery"];

export default function AdminPage() {
  const {
    profile,
    data,
    adminUpdateUserRole,
    adminToggleUserSuspended,
    adminDeleteUser,
    adminDeleteShop,
    adminDeleteItem,
    adminDeleteOrder,
    adminClearNonAdmins
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

  const paidOrders = data.orders.filter((order) => order.status === "delivered");
  const revenue = paidOrders.reduce((total, order) => total + order.total, 0);
  const stats = [
    ["Users", data.users.length],
    ["Shops", data.shops.length],
    ["Items", data.items.length],
    ["Orders", data.orders.length],
    ["Paid orders", paidOrders.length],
    ["Revenue", `Rs ${revenue}`]
  ];

  return (
    <ProtectedPage>
      <main className="mx-auto w-full max-w-7xl px-4 py-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-950">Admin dashboard</h1>
            <p className="mt-2 text-sm text-slate-500">Manage users, shops, menu items, orders, and platform totals.</p>
          </div>
          <button className="brand-focus rounded-lg bg-red-600 px-4 py-3 text-sm font-black text-white" onClick={adminClearNonAdmins}>
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

        <section className="mt-6 rounded-lg border border-orange-100 bg-white p-5 shadow-sm">
          <h2 className="text-2xl font-black text-slate-950">Users</h2>
          <div className="mt-4 grid gap-3">
            {data.users.map((user) => (
              <article key={user.uid} className="grid gap-3 rounded-lg bg-slate-50 p-3 md:grid-cols-[1fr_180px_auto_auto] md:items-center">
                <div>
                  <p className="font-black text-slate-950">{user.fullName}</p>
                  <p className="text-sm text-slate-500">{user.email} {user.suspended ? ". suspended" : ""}</p>
                </div>
                <select className="brand-focus rounded-lg border border-slate-200 px-3 py-2 text-sm" value={user.role} disabled={user.role === "admin"} onChange={(event) => adminUpdateUserRole(user.uid, event.target.value as UserRole)}>
                  {user.role === "admin" && <option value="admin">Admin</option>}
                  {editableRoles.map((role) => <option key={role} value={role}>{role === "owner" ? "Restaurant Owner" : role === "delivery" ? "Delivery Partner" : "User"}</option>)}
                </select>
                <button className="brand-focus rounded-lg bg-orange-50 px-3 py-2 text-sm font-black text-[#f04423]" disabled={user.role === "admin"} onClick={() => adminToggleUserSuspended(user.uid)}>
                  <UserX className="mr-1 inline" size={16} />
                  {user.suspended ? "Unsuspend" : "Suspend"}
                </button>
                <button className="brand-focus rounded-lg bg-red-50 px-3 py-2 text-sm font-black text-red-700" disabled={user.role === "admin"} onClick={() => adminDeleteUser(user.uid)}>
                  <Trash2 className="mr-1 inline" size={16} />
                  Delete
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-3">
          <div className="flex h-[38rem] flex-col rounded-lg border border-orange-100 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black text-slate-950">Shops</h2>
            <div className="mt-4 grid min-h-0 flex-1 content-start gap-2 overflow-y-auto pr-2">
              {data.shops.map((shop) => (
                <button key={shop.id} className="brand-focus flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-left text-sm" onClick={() => adminDeleteShop(shop.id)}>
                  <span>{shop.name}</span>
                  <Trash2 size={15} className="text-red-600" />
                </button>
              ))}
            </div>
          </div>
          <div className="flex h-[38rem] flex-col rounded-lg border border-orange-100 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black text-slate-950">Items</h2>
            <div className="mt-4 grid min-h-0 flex-1 content-start gap-2 overflow-y-auto pr-2">
              {data.items.map((item) => (
                <button key={item.id} className="brand-focus flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-left text-sm" onClick={() => adminDeleteItem(item.id)}>
                  <span>{item.name}</span>
                  <Trash2 size={15} className="text-red-600" />
                </button>
              ))}
            </div>
          </div>
          <div className="flex h-[38rem] flex-col rounded-lg border border-orange-100 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black text-slate-950">Orders</h2>
            <div className="mt-4 grid gap-2">
              {data.orders.map((order) => (
                <button key={order.id} className="brand-focus flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-left text-sm" onClick={() => adminDeleteOrder(order.id)}>
                  <span>{order.id.slice(0, 12)} . Rs {order.total}</span>
                  <Trash2 size={15} className="text-red-600" />
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>
    </ProtectedPage>
  );
}
