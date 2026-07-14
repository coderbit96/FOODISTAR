"use client";

import { motion } from "framer-motion";
import { Flame, Utensils } from "lucide-react";

export function Preloader() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fff9f4] px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-sm rounded-lg border border-orange-100 bg-white p-6 text-center shadow-xl shadow-orange-950/10"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg bg-[#f04423] text-white shadow-lg shadow-orange-200">
          <motion.div
            animate={{ rotate: [0, -10, 10, -6, 6, 0], scale: [1, 1.08, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Utensils size={30} />
          </motion.div>
        </div>

        <div className="mt-5 flex items-center justify-center gap-2">
          <Flame size={18} className="text-[#f04423]" />
          <p className="text-lg font-black tracking-tight text-[#f04423]">Loading FOODISTAR</p>
        </div>

        <div className="mt-4 flex justify-center gap-1.5">
          {[0, 1, 2].map((dot) => (
            <motion.span
              key={dot}
              className="h-2.5 w-2.5 rounded-full bg-[#f04423]"
              animate={{ y: [0, -8, 0], opacity: [0.45, 1, 0.45] }}
              transition={{ duration: 0.75, repeat: Infinity, delay: dot * 0.15 }}
            />
          ))}
        </div>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-orange-50">
          <motion.div
            className="h-full rounded-full bg-[#f04423]"
            initial={{ x: "-100%" }}
            animate={{ x: ["-100%", "120%"] }}
            transition={{ duration: 1.25, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </main>
  );
}
