"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Heart, LogOut, Menu, PackageCheck, ShoppingCart, Store, Truck, UserRound, Wallet, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { clsx } from "clsx";
import { useRasoiGo } from "@/components/app-provider";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteNav() {
  const { profile, data, cart, logout, favorites, clearNotifications } = useRasoiGo();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const userNotifications = profile
    ? data.notifications
      .filter((notification) => notification.userId === profile.uid)
      .slice(0, 5)
    : [];

  if (!profile) return null;

  const navLinks = {
    user: [
      { href: "/", label: "Menu" },
      { href: "/orders", label: "My orders" },
      { href: "/wallet", label: "Wallet" },
      { href: "/profile", label: "Profile" }
    ],
    owner: [
      { href: "/owner", label: "Owner menu" },
      { href: "/orders", label: "Kitchen orders" },
      { href: "/", label: "Menu preview" },
      { href: "/profile", label: "Profile" }
    ],
    delivery: [
      { href: "/orders", label: "Delivery queue" },
      { href: "/profile", label: "Profile" }
    ],
    admin: [
      { href: "/admin", label: "Dashboard" },
      { href: "/", label: "Menu preview" },
      { href: "/profile", label: "Profile" }
    ]
  }[profile.role];

  const roleLabel = {
    user: "User",
    owner: "Restaurant Owner",
    delivery: "Delivery Partner",
    admin: "Admin"
  }[profile.role];

  const handleLogout = async () => {
    await logout();
    router.push("/signin");
  };
  const isAdmin = profile.role === "admin";
  const navActionClass = "navbar-action-button brand-focus relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg shadow-sm ring-1 transition";
  const navBadgeClass = "navbar-count-badge pointer-events-none absolute flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f04423] px-1 text-[11px] font-black leading-none text-white shadow-lg ring-2 ring-[#fff3cf]";
  const cartBadgeClass = "navbar-count-badge pointer-events-none absolute right-0 top-0 flex h-5 min-w-5 translate-x-1/3 -translate-y-1/3 items-center justify-center rounded-full bg-[#f04423] px-1 text-[11px] font-black leading-none text-white shadow-lg shadow-red-500/30 ring-[3px] ring-[#fff3cf]";

  return (
    <header className="rasoigo-navbar sticky top-0 z-30 border-b border-orange-100 bg-[#fff3cf] backdrop-blur">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-3xl font-black tracking-wide text-[#f04423]">
          RasoiGo
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "brand-focus rounded-lg px-3 py-2 text-sm font-semibold transition",
                isAdmin
                  ? pathname === link.href
                    ? "bg-[#f04423] text-white shadow-md shadow-orange-400/30 hover:bg-slate-950 hover:text-white"
                    : "text-slate-900/80 hover:bg-slate-950 hover:text-white"
                  : pathname === link.href
                    ? "bg-[#f04423] text-white hover:bg-[#c93418] hover:text-white"
                    : "text-slate-600 hover:bg-orange-50 hover:text-[#f04423]"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <div className="relative">
            <button
              type="button"
              className={clsx(
                navActionClass,
                isAdmin
                  ? "bg-slate-950 text-white ring-slate-900 hover:bg-white hover:text-[#f04423] hover:ring-orange-200"
                  : "bg-white text-slate-700 ring-orange-100 hover:bg-orange-50",
                userNotifications.length > 0 && (isAdmin ? "text-yellow-300 hover:text-[#f04423]" : "text-[#f04423]")
              )}
              onClick={() => setNotificationsOpen((value) => !value)}
              aria-label="Notifications"
            >
              <Bell size={20} />
              {userNotifications.length > 0 && (
                <span className={clsx(navBadgeClass, "-right-1.5 -top-1.5")}>
                  {userNotifications.length}
                </span>
              )}
            </button>
            {notificationsOpen && (
              <div className="absolute right-0 top-12 z-50 w-72 overflow-hidden rounded-lg border border-orange-100 bg-white shadow-xl">
                <div className="flex items-center justify-between gap-3 border-b border-orange-100 px-3 py-2">
                  <span className="text-sm font-black text-slate-950">Notifications</span>
                  {userNotifications.length > 0 && (
                    <button
                      type="button"
                      className="rounded-md bg-red-50 px-2 py-1 text-xs font-black text-[#f04423] hover:bg-red-100"
                      onClick={clearNotifications}
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {userNotifications.length > 0 ? (
                    userNotifications.map((notification) => (
                      <div key={notification.id} className="border-b border-slate-100 px-3 py-3 last:border-b-0">
                        <p className="text-sm font-black text-slate-900">{notification.title}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">{notification.body}</p>
                        <p className="mt-1 text-[11px] font-bold text-slate-400">{new Date(notification.createdAt).toLocaleString()}</p>
                      </div>
                    ))
                  ) : (
                    <p className="px-3 py-4 text-sm font-semibold text-slate-500">No notifications yet.</p>
                  )}
                </div>
              </div>
            )}
          </div>
          {profile.role === "user" && (
            <>
              <Link
                href="/favorites"
                className={clsx(
                  navActionClass,
                  favorites.length > 0
                    ? "bg-emerald-600 text-white ring-emerald-200 hover:bg-emerald-700"
                    : "bg-white text-[#f04423] ring-orange-100 hover:bg-orange-50"
                )}
                aria-label="Favorites"
              >
                <Heart size={20} />
                {favorites.length > 0 && (
                  <span className={clsx(navBadgeClass, "-right-1.5 -top-1.5")}>
                    {favorites.length}
                  </span>
                )}
              </Link>
              <Link
                href="/cart"
                className={clsx(
                  navActionClass,
                  cartCount > 0
                    ? "bg-emerald-600 text-white ring-emerald-200 hover:bg-emerald-700"
                    : "bg-white text-[#f04423] ring-orange-100 hover:bg-orange-50"
                )}
                aria-label="Cart"
              >
                <ShoppingCart size={21} />
                {cartCount > 0 && (
                  <span className={cartBadgeClass}>
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>
            </>
          )}

          <button
            className="brand-focus ml-2 hidden h-11 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white ring-1 ring-slate-900 transition hover:bg-white hover:text-[#f04423] hover:ring-orange-200 md:inline-flex"
            onClick={handleLogout}
          >
            Sign out
          </button>

          <button
            className={clsx(
              "brand-focus inline-flex h-11 w-11 items-center justify-center rounded-lg shadow-sm ring-1 md:hidden",
              isAdmin
                ? "bg-slate-950 text-white ring-slate-900 hover:bg-white hover:text-[#f04423] hover:ring-orange-200"
                : "bg-white text-slate-900 ring-orange-100 hover:bg-orange-50"
            )}
            onClick={() => setOpen((value) => !value)}
            aria-label="Open menu"
          >
            {open ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="border-t border-orange-100 bg-white px-4 py-3 md:hidden"
          >
            <div className="mb-3 flex items-center gap-3 rounded-lg bg-orange-50 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f04423] font-bold text-white">
                {profile.fullName.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900">{profile.fullName}</p>
                <p className="text-xs text-slate-500">{roleLabel}</p>
              </div>
            </div>

            <div className="grid gap-2">
              {navLinks.map((link) => {
                const Icon = link.href === "/orders" ? (profile.role === "delivery" ? Truck : PackageCheck) : link.href === "/owner" || link.href === "/admin" ? Store : link.href === "/profile" ? UserRound : link.href === "/wallet" ? Wallet : ShoppingCart;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="brand-focus flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-orange-50"
                    onClick={() => setOpen(false)}
                  >
                    <Icon size={18} className="text-[#f04423]" />
                    {link.label}
                  </Link>
                );
              })}
              <button
                className="brand-focus flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-semibold text-[#f04423] hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut size={18} />
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
