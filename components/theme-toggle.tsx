"use client";

import { Moon, Sun } from "lucide-react";

const THEME_KEY = "rasoigo:theme";

export function ThemeToggle() {
  const toggleTheme = () => {
    const nextDark = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", nextDark);
    window.localStorage.setItem(THEME_KEY, nextDark ? "dark" : "light");
  };

  return (
    <button
      type="button"
      className="navbar-action-button brand-focus inline-flex h-11 w-11 items-center justify-center rounded-lg bg-white text-slate-900 shadow-sm ring-1 ring-orange-100"
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
    >
      <Moon className="theme-icon-light" size={20} />
      <Sun className="theme-icon-dark" size={20} />
    </button>
  );
}
