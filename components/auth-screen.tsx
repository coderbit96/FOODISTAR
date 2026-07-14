"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, Mail, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";
import { clsx } from "clsx";
import { useFoodistar } from "@/components/app-provider";
import type { UserRole } from "@/lib/types";

type Mode = "signin" | "signup" | "forgot";

const roleOptions: UserRole[] = ["user", "owner", "delivery"];

const roleLabels: Record<UserRole, string> = {
  user: "User",
  owner: "Restaurant Owner",
  delivery: "Delivery Partner"
};

export function AuthScreen({ mode }: { mode: Mode }) {
  const router = useRouter();
  const { signIn, signUp, signInWithGoogle, resetPassword } = useFoodistar();
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

  const currentMode = activeMode || mode;
  const isSignup = currentMode === "signup";
  const isForgot = currentMode === "forgot";

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
      router.push("/");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Google sign in failed.");
    } finally {
      setBusy(false);
    }
  };

  if (!activeMode && mode === "signin") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fff8ed] px-4 py-8">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative flex min-h-[540px] w-full max-w-sm flex-col overflow-hidden rounded-[30px] border border-orange-100 bg-white px-5 py-5 shadow-2xl shadow-orange-950/10"
        >
          <div className="mt-2 flex flex-col items-center text-center">
            <motion.div
              initial={{ scale: 0.92, rotate: -3 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 140, damping: 12 }}
              className="relative h-52 w-52 overflow-hidden rounded-full bg-gradient-to-br from-[#ffd22f] to-[#ff9f1c]"
            >
              <img src="/food/chef-mascot.png" alt="FOODISTAR chef" className="h-full w-full object-cover object-top" />
            </motion.div>

            <h1 className="mt-7 text-center text-4xl font-black uppercase leading-tight tracking-[0.08em] text-slate-950">
              Welcome To <span className="block bg-gradient-to-r from-[#f04423] via-[#ff9f1c] to-[#ffba08] bg-clip-text text-transparent">Foodistar</span>
            </h1>
          </div>

          <div className="mt-8 grid gap-3 pb-3">
            <button
              className="brand-focus rounded-full bg-gradient-to-r from-[#ffba08] to-[#ff9f1c] px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-200"
              onClick={() => setActiveMode("signin")}
            >
              Log in
            </button>
            <button
              className="brand-focus rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-800"
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
    <main className="flex min-h-screen items-center justify-center bg-[#fff8ed] px-4 py-8">
      <section className="flex w-full items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm rounded-[28px] bg-white p-6 shadow-2xl shadow-orange-950/10"
        >
          <div className="mb-5 text-center">
            <button
              className="brand-focus mx-auto mb-5 block h-20 w-20 overflow-hidden rounded-full bg-[#ffc22e] ring-4 ring-orange-50"
              onClick={() => mode === "signin" && setActiveMode(null)}
              aria-label="Back to welcome"
              type="button"
            >
              <img src="/food/chef-mascot.png" alt="FOODISTAR chef" className="h-full w-full object-cover object-top" />
            </button>
            <h1 className="text-3xl font-black tracking-tight text-slate-950">
              <span className="text-[#ff9f1c]">FOOD</span>ISTAR
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              {isForgot
                ? "Enter your account email to receive a reset link."
                : isSignup
                  ? "Create your account with email or Google."
                  : "Log in with email or continue with Google."}
            </p>
          </div>

          <form className="space-y-3" onSubmit={submit}>
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
                    type={showPassword ? "text" : "password"}
                    className="brand-focus w-full rounded-full border-0 bg-slate-50 px-4 py-3 pr-12 text-sm shadow-inner shadow-slate-100"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
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
                className="brand-focus w-full rounded-full border border-slate-100 bg-white px-4 py-3 text-sm font-bold text-slate-800 shadow-sm hover:bg-slate-50"
                onClick={googleAuth}
                disabled={busy}
              >
                Google
              </button>
            </>
          )}

          <div className="mt-5 flex flex-wrap justify-between gap-3 text-xs font-semibold">
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
