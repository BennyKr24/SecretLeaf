"use client";

import { useTheme, type Theme } from "./ThemeProvider";
import { useTranslations } from "next-intl";

const icons: Record<Theme, string> = {
  light: "☀️",
  dark: "🌙",
  system: "💻",
};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const t = useTranslations("theme");

  const cycle: Theme[] = ["light", "dark", "system"];
  const idx = cycle.indexOf(theme);
  const next: Theme = cycle[idx === -1 ? 0 : (idx + 1) % cycle.length] as Theme;

  return (
    <button
      onClick={() => setTheme(next)}
      title={t(theme)}
      aria-label={t(theme)}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors duration-150"
    >
      {icons[theme]}
    </button>
  );
}
