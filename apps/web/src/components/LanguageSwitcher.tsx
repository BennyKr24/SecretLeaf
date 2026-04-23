"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";
import type { Route } from "next";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("language");

  const toggle = () => {
    const nextLocale = locale === "de" ? "en" : "de";
    // Persist in localStorage
    localStorage.setItem("preferred-locale", nextLocale);

    // Build the new path: strip current locale prefix if present
    let newPath = pathname;
    if (pathname.startsWith("/en")) {
      newPath = pathname.slice(3) || "/";
    }
    // For "en" add prefix, for "de" (default) none needed
    const target = nextLocale === "en" ? `/en${newPath}` : newPath;

    startTransition(() => {
      router.push(target as Route);
    });
  };

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      title={t("switchTo")}
      aria-label={t("switchTo")}
      className="flex items-center gap-0.5 h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-2 text-[12px] font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors duration-150 disabled:opacity-50"
    >
      <span className={locale === "de" ? "text-emerald-600 dark:text-emerald-400" : ""}>{t("de")}</span>
      <span className="mx-0.5 text-slate-300 dark:text-slate-600">/</span>
      <span className={locale === "en" ? "text-emerald-600 dark:text-emerald-400" : ""}>{t("en")}</span>
    </button>
  );
}
