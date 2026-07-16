"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import { Gift, PartyPopper, X } from "lucide-react";
import { useRasoiGo } from "@/components/app-provider";

const OFFER_DISMISSED_KEY = "rasoigo:login-offer-dismissed";
type ParticleStyle = CSSProperties & Record<`--${string}`, string | number>;

export function LoginOfferPopup() {
  const { profile } = useRasoiGo();
  const [dismissedFor, setDismissedFor] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.sessionStorage.getItem(OFFER_DISMISSED_KEY) || "";
  });
  const open = Boolean(profile && dismissedFor !== profile.uid);

  const close = () => {
    if (profile && typeof window !== "undefined") {
      window.sessionStorage.setItem(OFFER_DISMISSED_KEY, profile.uid);
      setDismissedFor(profile.uid);
    }
  };

  if (!open) return null;

  const confetti = Array.from({ length: 72 }).map((_, index) => {
    const fromRight = index % 2 === 0;
    const spread = 28 + (index % 9) * 3.5;
    const lift = 42 + (index % 11) * 2.6;
    return {
      className: fromRight ? "from-right" : "from-left",
      style: {
        "--edge": `${2 + (index % 8) * 1.3}%`,
        "--bottom": `${8 + (index % 7) * 7}px`,
        "--x": `${fromRight ? -spread : spread}vw`,
        "--y": `-${lift}vh`,
        "--delay": `${index * 34}ms`,
        "--duration": `${1450 + (index % 6) * 140}ms`,
        "--spin": `${fromRight ? -520 : 520}deg`
      } as ParticleStyle
    };
  });
  const sparkles = Array.from({ length: 18 }).map((_, index) => ({
    "--left": `${5 + index * 5.3}%`,
    "--top": `${18 + (index % 4) * 15}%`,
    "--delay": `${index * 80}ms`,
    "--duration": `${1600 + (index % 5) * 180}ms`
  }) as ParticleStyle);
  const floatingDots = Array.from({ length: 8 }).map((_, index) => ({
    "--left": `${7 + index * 12}%`,
    "--top": `${12 + (index % 3) * 26}%`,
    "--delay": `${index * 120}ms`
  }) as ParticleStyle);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-hidden bg-slate-950/45 px-4 backdrop-blur-md">
      <div className="offer-confetti" aria-hidden="true">
        {confetti.map((particle, index) => (
          <span key={index} className={particle.className} style={particle.style} />
        ))}
      </div>
      <div className="offer-sparkle" aria-hidden="true">
        {sparkles.map((style, index) => (
          <span key={index} style={style} />
        ))}
      </div>

      <div className="offer-pop relative w-full max-w-lg rounded-lg border border-orange-100 bg-white p-6 text-center shadow-2xl sm:p-7">
        <button
          type="button"
          className="absolute right-3 top-3 z-10 rounded-full bg-slate-950 p-2.5 text-white shadow-xl ring-4 ring-white transition hover:scale-105 focus-visible:outline focus-visible:outline-4 focus-visible:outline-orange-200"
          onClick={close}
          aria-label="Close offer"
        >
          <X size={18} />
        </button>

        <div className="pointer-events-none absolute inset-x-8 top-6 h-24 rounded-full bg-[#f04423]/10 blur-2xl" />
        <div className="relative">
          <div className="offer-badge mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#f04423] text-white shadow-xl shadow-orange-200">
            <PartyPopper size={34} />
          </div>
          <p className="mt-5 text-xs font-black uppercase tracking-[0.28em] text-[#f04423]">Login offer</p>
          <h2 className="mt-2 text-4xl font-black leading-tight text-slate-950">20% off any food item</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
            Celebrate your RasoiGo login with a fresh discount on your next favorite dish.
          </p>

          <div className="mt-6 grid gap-3 rounded-lg bg-[#fff3cf] p-3 sm:grid-cols-[1fr_auto] sm:items-center">
            <p className="flex items-center justify-center gap-2 text-sm font-black text-slate-900 sm:justify-start">
              <Gift size={18} className="text-[#f04423]" />
              Use code <span className="rounded-md bg-white px-2 py-1 text-[#f04423]">PARTY20</span>
            </p>
            <span className="rounded-lg bg-[#f04423] px-4 py-2 text-sm font-black text-white">
              Save today
            </span>
          </div>
        </div>
        <div className="offer-floating-dots" aria-hidden="true">
          {floatingDots.map((style, index) => (
            <span key={index} style={style} />
          ))}
        </div>
      </div>
    </div>
  );
}
