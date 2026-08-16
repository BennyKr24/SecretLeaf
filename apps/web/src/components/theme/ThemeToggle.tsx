"use client";

import { useTheme, type Theme } from "./ThemeProvider";
import { useTranslations } from "next-intl";
import { Sun, Moon, Monitor, type LucideIcon } from "lucide-react";

const icons: Record<Theme, LucideIcon> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const t = useTranslations("theme");

  const cycle: Theme[] = ["light", "dark", "system"];
  const idx = cycle.indexOf(theme);
  const next: Theme = cycle[idx === -1 ? 0 : (idx + 1) % cycle.length] as Theme;
  const Icon = icons[theme];

  return (
    <button
      onClick={() => setTheme(next)}
      title={t(theme)}
      aria-label={t(theme)}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors duration-150 md:h-8 md:w-8"
    >
      <Icon className="h-4 w-4" strokeWidth={2} />
    </button>
  );
}
