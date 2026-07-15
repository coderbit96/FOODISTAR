"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Heart, LogOut, Menu, PackageCheck, ShoppingCart, Store, Truck, UserRound, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { clsx } from "clsx";
import { useRasoiGo } from "@/components/app-provider";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteNav() {
  const { profile, cart, logout, favorites } = useRasoiGo();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (!profile) return null;

  const navLinks = {
    user: [
      { href: "/", label: "Menu" },
      { href: "/orders", label: "My orders" },
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
      { href: "/admin", label: "Admin" },
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

  return (
    <header className="sticky top-0 z-30 border-b border-orange-100 bg-[#fff9f4]/90 backdrop-blur">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-2xl font-black tracking-wide text-[#f04423]">
          RasoiGo
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "brand-focus rounded-lg px-3 py-2 text-sm font-semibold transition",
                pathname === link.href
                  ? "bg-[#f04423] text-white hover:bg-[#c93418] hover:text-white"
                  : "text-slate-600 hover:bg-orange-50 hover:text-[#f04423]"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {profile.role === "user" && (
            <>
              <Link
                href="/favorites"
                className="brand-focus relative rounded-lg bg-white p-2 text-[#f04423] shadow-sm ring-1 ring-orange-100"
                aria-label="Favorites"
              >
                <Heart size={20} />
                {favorites.length > 0 && (
                  <span className="absolute -right-1 -top-1 rounded-full bg-emerald-600 px-1.5 text-[10px] font-bold text-white">
                    {favorites.length}
                  </span>
                )}
              </Link>
              <Link
                href="/cart"
                className="brand-focus relative rounded-lg bg-white p-2 text-[#f04423] shadow-sm ring-1 ring-orange-100"
                aria-label="Cart"
              >
                <ShoppingCart size={20} />
                {cart.length > 0 && (
                  <span className="absolute -right-1 -top-1 rounded-full bg-sky-600 px-1.5 text-[10px] font-bold text-white">
                    {cart.length}
                  </span>
                )}
              </Link>
            </>
          )}

          <button
            className="brand-focus hidden rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white md:inline-flex"
            onClick={handleLogout}
          >
            Sign out
          </button>

          <button
            className="brand-focus rounded-lg bg-white p-2 text-slate-900 shadow-sm ring-1 ring-orange-100 md:hidden"
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
                const Icon = link.href === "/orders" ? (profile.role === "delivery" ? Truck : PackageCheck) : link.href === "/owner" || link.href === "/admin" ? Store : link.href === "/profile" ? UserRound : ShoppingCart;
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
