"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, Mail, ShieldCheck } from "lucide-react";
import { type ChangeEvent, type ClipboardEvent, type FormEvent, type KeyboardEvent, useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import { useRasoiGo } from "@/components/app-provider";
import type { UserRole } from "@/lib/types";

type Mode = "signin" | "signup" | "forgot";

const roleOptions: UserRole[] = ["user", "owner", "delivery"];
const THEME_KEY = "rasoigo:theme";

const roleLabels: Record<UserRole, string> = {
  user: "User",
  owner: "Restaurant Owner",
  delivery: "Delivery Partner",
  admin: "Admin"
};

function FoodPatternBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1200 760" preserveAspectRatio="xMidYMid slice">
        <defs>
          <g id="food-pizza">
            <path d="M8 49 46 8l8 55Z" fill="#ffd84d" stroke="#1f2937" strokeWidth="3" strokeLinejoin="round" />
            <path d="M18 39c12 5 23 2 31-9" stroke="#d8293d" strokeWidth="4" strokeLinecap="round" />
            <circle cx="28" cy="31" r="3" fill="#d8293d" />
            <circle cx="38" cy="43" r="3" fill="#d8293d" />
            <circle cx="45" cy="25" r="3" fill="#d8293d" />
          </g>
          <g id="food-fries">
            <path d="M16 21h30l-5 42H21L16 21Z" fill="#ef3340" stroke="#1f2937" strokeWidth="3" strokeLinejoin="round" />
            <path d="M20 22 17 4M27 22 28 2M34 22 39 3M41 22 47 7" stroke="#d5a31f" strokeWidth="4" strokeLinecap="round" />
            <path d="M24 35h13" stroke="#ffd84d" strokeWidth="5" strokeLinecap="round" />
          </g>
          <g id="food-drink">
            <path d="M18 16h28l-4 43H22L18 16Z" fill="#ef3340" stroke="#1f2937" strokeWidth="3" strokeLinejoin="round" />
            <path d="M20 29h24" stroke="#ffd84d" strokeWidth="9" />
            <path d="M31 16 43 4" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" />
            <path d="M43 4h10" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" />
          </g>
          <g id="food-hotdog">
            <path d="M11 35c4-14 37-22 47-6 8 14-30 28-43 15-3-2-4-5-4-9Z" fill="#ffd84d" stroke="#1f2937" strokeWidth="3" />
            <path d="M18 34c4-12 27-15 32-4 4 10-23 19-31 9-1-2-2-3-1-5Z" fill="#d8293d" />
            <path d="M23 33c6 3 14-5 22-1" stroke="#ffd84d" strokeWidth="3" strokeLinecap="round" />
          </g>
          <g id="food-cone">
            <path d="M19 28h27L31 62 19 28Z" fill="#ffd84d" stroke="#1f2937" strokeWidth="3" strokeLinejoin="round" />
            <path d="M17 28c1-13 29-13 31 0Z" fill="#ef6b74" stroke="#1f2937" strokeWidth="3" />
          </g>
          <g id="food-star">
            <path d="M16 2 20 11l10 1-8 7 3 10-9-5-9 5 3-10-8-7 10-1Z" fill="#ffd84d" stroke="#1f2937" strokeWidth="2" strokeLinejoin="round" />
          </g>
          <g id="food-spark">
            <path d="M12 2v20M2 12h20M5 5l14 14M19 5 5 19" stroke="#d85d73" strokeWidth="3" strokeLinecap="round" />
          </g>
        </defs>

        <rect width="1200" height="760" fill="#fff4dc" opacity="0.72" />
        <g opacity="0.88">
          <use href="#food-drink" transform="translate(20 28) rotate(-18) scale(1.05)" />
          <use href="#food-fries" transform="translate(116 34) rotate(15)" />
          <use href="#food-hotdog" transform="translate(210 20) rotate(-6) scale(0.78)" />
          <use href="#food-pizza" transform="translate(290 30) rotate(20)" />
          <use href="#food-cone" transform="translate(455 14) rotate(-18) scale(0.72)" />
          <use href="#food-drink" transform="translate(640 28) rotate(8) scale(0.72)" />
          <use href="#food-fries" transform="translate(745 8) rotate(-12) scale(0.7)" />
          <use href="#food-pizza" transform="translate(500 92) rotate(24) scale(0.48)" />
          <use href="#food-hotdog" transform="translate(590 86) rotate(-9) scale(0.48)" />
          <use href="#food-cone" transform="translate(690 88) rotate(13) scale(0.46)" />
          <use href="#food-drink" transform="translate(850 24) rotate(-5)" />
          <use href="#food-pizza" transform="translate(960 35) rotate(24) scale(0.7)" />
          <use href="#food-hotdog" transform="translate(1040 48) rotate(84)" />
          <use href="#food-fries" transform="translate(1120 26) rotate(-20)" />
          <use href="#food-drink" transform="translate(1188 128) rotate(28) scale(0.62)" />

          <use href="#food-cone" transform="translate(28 126) rotate(18) scale(0.76)" />
          <use href="#food-hotdog" transform="translate(12 210) rotate(84)" />
          <use href="#food-pizza" transform="translate(110 195) rotate(-24) scale(0.65)" />
          <use href="#food-drink" transform="translate(205 175) rotate(10) scale(0.72)" />
          <use href="#food-fries" transform="translate(305 150) rotate(-18) scale(0.66)" />
          <use href="#food-hotdog" transform="translate(760 165) rotate(-16) scale(0.72)" />
          <use href="#food-fries" transform="translate(880 175) rotate(8) scale(0.68)" />
          <use href="#food-cone" transform="translate(1040 204) rotate(18)" />
          <use href="#food-pizza" transform="translate(1130 210) rotate(30) scale(0.7)" />
          <use href="#food-fries" transform="translate(118 278) rotate(20) scale(0.58)" />
          <use href="#food-hotdog" transform="translate(238 275) rotate(-22) scale(0.58)" />
          <use href="#food-pizza" transform="translate(815 276) rotate(12) scale(0.55)" />
          <use href="#food-drink" transform="translate(935 286) rotate(-18) scale(0.58)" />

          <use href="#food-drink" transform="translate(8 390) rotate(72)" />
          <use href="#food-pizza" transform="translate(64 340) rotate(18) scale(0.68)" />
          <use href="#food-fries" transform="translate(100 430) rotate(-6)" />
          <use href="#food-pizza" transform="translate(250 442) rotate(-34) scale(0.82)" />
          <use href="#food-hotdog" transform="translate(344 370) rotate(16) scale(0.68)" />
          <use href="#food-drink" transform="translate(790 360) rotate(-11) scale(0.7)" />
          <use href="#food-pizza" transform="translate(930 422) rotate(-18)" />
          <use href="#food-cone" transform="translate(1015 365) rotate(-9) scale(0.76)" />
          <use href="#food-fries" transform="translate(1080 470) rotate(18)" />
          <use href="#food-drink" transform="translate(1165 365) rotate(12) scale(0.68)" />
          <use href="#food-cone" transform="translate(36 510) rotate(-15) scale(0.58)" />
          <use href="#food-drink" transform="translate(205 520) rotate(-9) scale(0.56)" />
          <use href="#food-fries" transform="translate(805 510) rotate(14) scale(0.58)" />
          <use href="#food-hotdog" transform="translate(965 505) rotate(-18) scale(0.56)" />
          <use href="#food-pizza" transform="translate(1160 518) rotate(-25) scale(0.55)" />

          <use href="#food-pizza" transform="translate(35 635) rotate(-15)" />
          <use href="#food-hotdog" transform="translate(125 610) rotate(10) scale(0.72)" />
          <use href="#food-cone" transform="translate(218 654) rotate(-20) scale(0.72)" />
          <use href="#food-drink" transform="translate(305 635) rotate(-3)" />
          <use href="#food-fries" transform="translate(460 635) rotate(-10) scale(0.78)" />
          <use href="#food-pizza" transform="translate(595 660) rotate(16) scale(0.62)" />
          <use href="#food-hotdog" transform="translate(730 650) rotate(-8)" />
          <use href="#food-cone" transform="translate(900 620) rotate(-12)" />
          <use href="#food-drink" transform="translate(1010 640) rotate(9) scale(0.7)" />
          <use href="#food-pizza" transform="translate(1110 635) rotate(24) scale(0.72)" />
          <use href="#food-fries" transform="translate(1180 660) rotate(-12) scale(0.55)" />
        </g>

        <g opacity="0.74">
          <use href="#food-star" transform="translate(70 135) scale(0.5)" />
          <use href="#food-star" transform="translate(185 88) scale(0.35)" />
          <use href="#food-star" transform="translate(365 80) scale(0.45)" />
          <use href="#food-star" transform="translate(512 60) scale(0.28)" />
          <use href="#food-star" transform="translate(540 48) scale(0.35)" />
          <use href="#food-star" transform="translate(650 68) scale(0.27)" />
          <use href="#food-star" transform="translate(720 95) scale(0.5)" />
          <use href="#food-star" transform="translate(905 88) scale(0.36)" />
          <use href="#food-star" transform="translate(1115 150) scale(0.42)" />
          <use href="#food-star" transform="translate(38 300) scale(0.36)" />
          <use href="#food-star" transform="translate(225 310) scale(0.34)" />
          <use href="#food-star" transform="translate(330 390) scale(0.3)" />
          <use href="#food-star" transform="translate(390 510) scale(0.32)" />
          <use href="#food-star" transform="translate(765 390) scale(0.31)" />
          <use href="#food-star" transform="translate(835 505) scale(0.3)" />
          <use href="#food-star" transform="translate(970 310) scale(0.35)" />
          <use href="#food-star" transform="translate(1160 300) scale(0.36)" />
          <use href="#food-star" transform="translate(82 570) scale(0.44)" />
          <use href="#food-star" transform="translate(185 690) scale(0.36)" />
          <use href="#food-star" transform="translate(405 664) scale(0.48)" />
          <use href="#food-star" transform="translate(850 690) scale(0.38)" />
          <use href="#food-star" transform="translate(1030 660) scale(0.44)" />
          <use href="#food-spark" transform="translate(210 160) scale(0.7)" />
          <use href="#food-spark" transform="translate(610 125) scale(0.42)" />
          <use href="#food-spark" transform="translate(325 270) scale(0.52)" />
          <use href="#food-spark" transform="translate(372 435) scale(0.42)" />
          <use href="#food-spark" transform="translate(990 158) scale(0.68)" />
          <use href="#food-spark" transform="translate(1085 310) scale(0.52)" />
          <use href="#food-spark" transform="translate(830 432) scale(0.42)" />
          <use href="#food-spark" transform="translate(250 595) scale(0.7)" />
          <use href="#food-spark" transform="translate(360 705) scale(0.5)" />
          <use href="#food-spark" transform="translate(1010 548) scale(0.7)" />
          <use href="#food-spark" transform="translate(1130 690) scale(0.5)" />
        </g>

        <rect width="1200" height="760" fill="url(#food-clear)" />
        <defs>
          <radialGradient id="food-clear" cx="50%" cy="50%" r="39%">
            <stop offset="0%" stopColor="#fff8ed" stopOpacity="0.92" />
            <stop offset="62%" stopColor="#fff8ed" stopOpacity="0.72" />
            <stop offset="100%" stopColor="#fff8ed" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}

export function AuthScreen({ mode }: { mode: Mode }) {
  const router = useRouter();
  const { signIn, signUp, signInWithGoogle, resetPassword } = useRasoiGo();
  const [activeMode, setActiveMode] = useState<Mode | null>(mode === "signin" ? null : mode);
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("user");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const currentMode = activeMode || mode;
  const isSignup = currentMode === "signup";
  const isForgot = currentMode === "forgot";
  const maskedPassword = "*".repeat(password.length);

  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  const startAppInLightMode = () => {
    window.localStorage.setItem(THEME_KEY, "light");
    document.documentElement.classList.remove("dark");
  };

  const placePasswordCursor = (position: number) => {
    window.requestAnimationFrame(() => {
      passwordInputRef.current?.setSelectionRange(position, position);
    });
  };

  const replacePasswordSelection = (replacement: string) => {
    const input = passwordInputRef.current;
    const start = input?.selectionStart ?? password.length;
    const end = input?.selectionEnd ?? start;
    setPassword(`${password.slice(0, start)}${replacement}${password.slice(end)}`);
    placePasswordCursor(start + replacement.length);
  };

  const handlePasswordKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (showPassword || event.ctrlKey || event.metaKey || event.altKey) return;

    const input = passwordInputRef.current;
    const start = input?.selectionStart ?? password.length;
    const end = input?.selectionEnd ?? start;

    if (event.key === "Backspace") {
      event.preventDefault();
      if (start !== end) {
        setPassword(`${password.slice(0, start)}${password.slice(end)}`);
        placePasswordCursor(start);
      } else if (start > 0) {
        setPassword(`${password.slice(0, start - 1)}${password.slice(end)}`);
        placePasswordCursor(start - 1);
      }
    } else if (event.key === "Delete") {
      event.preventDefault();
      if (start !== end || start < password.length) {
        setPassword(`${password.slice(0, start)}${password.slice(start === end ? end + 1 : end)}`);
        placePasswordCursor(start);
      }
    } else if (event.key.length === 1) {
      event.preventDefault();
      replacePasswordSelection(event.key);
    }
  };

  const handlePasswordPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    if (showPassword) return;
    event.preventDefault();
    replacePasswordSelection(event.clipboardData.getData("text"));
  };

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (showPassword) {
      setPassword(event.target.value);
      return;
    }

    const nextValue = event.target.value;
    if (nextValue.length < password.length) {
      setPassword(password.slice(0, nextValue.length));
      placePasswordCursor(nextValue.length);
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");

    try {
      if (isForgot) {
        await resetPassword(email);
        setMessage("Password reset email sent.");
        return;
      }
      if (isSignup) {
        await signUp({ fullName, mobile, email, password, role });
      } else {
        await signIn(email, password);
      }
      startAppInLightMode();
      router.push("/");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Authentication failed.");
    } finally {
      setBusy(false);
    }
  };

  const googleAuth = async () => {
    setBusy(true);
    setError("");
    try {
      await signInWithGoogle(role);
      startAppInLightMode();
      router.push("/");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Google sign in failed.");
    } finally {
      setBusy(false);
    }
  };

  if (!activeMode && mode === "signin") {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fff8ed] px-4 py-8">
        <FoodPatternBackground />
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative flex min-h-[540px] w-full max-w-sm flex-col overflow-hidden rounded-[30px] border border-orange-200 bg-gradient-to-br from-[#fff7ed] via-[#fff1e6] to-[#ffe5dc] px-5 py-5 shadow-2xl shadow-orange-950/15"
        >
          <div className="relative z-10 mt-2 flex flex-col items-center text-center">
            <motion.div
              initial={{ scale: 0.92, rotate: -3 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 140, damping: 12 }}
              className="relative h-52 w-52 overflow-hidden rounded-full bg-gradient-to-br from-[#ffd22f] to-[#ff9f1c]"
            >
              <img src="/food/chef-mascot.png" alt="RasoiGo chef" className="h-full w-full object-cover object-top" />
            </motion.div>

            <h1 className="mt-7 text-center text-4xl font-black uppercase leading-tight tracking-[0.08em] text-black">
              Welcome To <span className="block bg-gradient-to-r from-[#f04423] via-[#ff9f1c] to-[#ffba08] bg-clip-text text-transparent">RasoiGo</span>
            </h1>
          </div>

          <div className="relative z-10 mt-8 grid gap-3 pb-3">
            <button
              className="brand-focus rounded-full bg-gradient-to-r from-[#ffba08] to-[#ff9f1c] px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-200"
              onClick={() => setActiveMode("signin")}
            >
              Log in
            </button>
            <button
              className="brand-focus rounded-full border border-[#f04423] bg-gradient-to-r from-[#f04423] to-[#ff6b35] px-5 py-3 text-sm font-black text-white shadow-lg shadow-red-200"
              onClick={() => setActiveMode("signup")}
            >
              Sign up
            </button>
          </div>
        </motion.section>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fff8ed] px-4 py-8">
      <FoodPatternBackground />
      <section className="relative z-10 flex w-full items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full max-w-sm overflow-hidden rounded-[28px] border border-orange-200 bg-gradient-to-br from-[#fff7ed] via-[#fff1e6] to-[#ffe5dc] p-6 shadow-2xl shadow-orange-950/15"
        >
          <div className="relative z-10 mb-5 text-center">
            <button
              className="brand-focus mx-auto mb-5 block h-20 w-20 overflow-hidden rounded-full bg-[#ffc22e] ring-4 ring-orange-50"
              onClick={() => mode === "signin" && setActiveMode(null)}
              aria-label="Back to welcome"
              type="button"
            >
              <img src="/food/chef-mascot.png" alt="RasoiGo chef" className="h-full w-full object-cover object-top" />
            </button>
            <h1 className="text-3xl font-black tracking-tight text-slate-950">
              <span className="bg-gradient-to-r from-[#f04423] via-[#ff9f1c] to-[#ffba08] bg-clip-text text-transparent">RasoiGo</span>
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              {isForgot
                ? "Enter your account email to receive a reset link."
                : isSignup
                  ? "Create your account with email or Google."
                  : "Log in with email or continue with Google."}
            </p>
          </div>

          <form className="relative z-10 space-y-3" onSubmit={submit}>
            {isSignup && (
              <>
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Full name</span>
                  <input
                    className="brand-focus mt-1 w-full rounded-full border-0 bg-slate-50 px-4 py-3 text-sm shadow-inner shadow-slate-100"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Mobile</span>
                  <input
                    className="brand-focus mt-1 w-full rounded-full border-0 bg-slate-50 px-4 py-3 text-sm shadow-inner shadow-slate-100"
                    value={mobile}
                    onChange={(event) => setMobile(event.target.value)}
                  />
                </label>
              </>
            )}

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Email</span>
              <input
                type="email"
                className="brand-focus mt-1 w-full rounded-full border-0 bg-slate-50 px-4 py-3 text-sm shadow-inner shadow-slate-100"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>

            {!isForgot && (
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Password</span>
                <div className="relative mt-1">
                  <input
                    ref={passwordInputRef}
                    type="text"
                    className="brand-focus w-full rounded-full border-0 bg-slate-50 px-4 py-3 pr-12 text-sm shadow-inner shadow-slate-100"
                    value={showPassword ? password : maskedPassword}
                    onChange={handlePasswordChange}
                    onKeyDown={handlePasswordKeyDown}
                    onPaste={handlePasswordPaste}
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-slate-500"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>
            )}

            {isSignup && (
              <div>
                <span className="text-sm font-semibold text-slate-700">Role</span>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {roleOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={clsx(
                        "brand-focus rounded-2xl border px-2 py-2 text-xs font-bold transition",
                        role === option
                          ? "border-[#ff9f1c] bg-gradient-to-r from-[#ffba08] to-[#ff9f1c] text-white"
                          : "border-orange-100 bg-white text-slate-700 shadow-sm"
                      )}
                      onClick={() => setRole(option)}
                    >
                      {roleLabels[option]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <AnimatePresence>
              {(error || message) && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className={clsx(
                    "rounded-lg px-3 py-2 text-sm",
                    error ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
                  )}
                >
                  {error || message}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              className="brand-focus flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ffba08] to-[#ff9f1c] px-4 py-3 text-sm font-black text-white shadow-lg shadow-orange-200 disabled:opacity-60"
              disabled={busy}
            >
              {isForgot ? <Mail size={18} /> : <ShieldCheck size={18} />}
              {busy ? "Please wait..." : isForgot ? "Send reset email" : isSignup ? "Create account" : "Sign in"}
            </button>
          </form>

          {!isForgot && (
            <>
              <div className="my-4 flex items-center gap-3">
                <span className="h-px flex-1 bg-slate-100" />
                <span className="text-xs font-semibold text-slate-300">Or sign in with</span>
                <span className="h-px flex-1 bg-slate-100" />
              </div>

              <button
                className="brand-focus flex w-full items-center justify-center gap-3 rounded-full border border-slate-100 bg-white px-4 py-3 text-sm font-bold text-slate-800 shadow-sm hover:bg-slate-50"
                onClick={googleAuth}
                disabled={busy}
              >
                <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" />
                  <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84Z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.31 9.14 5.38 12 5.38Z" />
                </svg>
                Login with Google
              </button>
            </>
          )}

          <div className="relative z-10 mt-5 flex flex-wrap justify-between gap-3 text-xs font-semibold">
            {!isForgot && (
              <button
                type="button"
                className="text-slate-400"
                onClick={() => setActiveMode(isSignup ? "signin" : "signup")}
              >
                {isSignup ? "Already have an account? " : "Don't have an account? "}
                <span className="text-[#ff9f1c]">{isSignup ? "Log in" : "Sign up"}</span>
              </button>
            )}
            {!isForgot && (
              <Link className="text-slate-500 hover:text-[#f04423]" href="/forgot-password">
                Forgot password?
              </Link>
            )}
          </div>
        </motion.div>
      </section>
    </main>
  );
}
