"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import type { Route } from "next";

const BANNER_KEY = "locale-banner-dismissed";

/**
 * Shows a one-time banner to English-browser users viewing the German site,
 * offering to switch to the English version.
 * Persists dismissal in localStorage.
 */
export function LocaleBanner() {
  const locale = useLocale();
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show on the German locale
    if (locale !== "de") return;
    // Only show if not yet dismissed
    if (localStorage.getItem(BANNER_KEY)) return;
    // Only show if browser prefers English
    const browserLang = navigator.language ?? navigator.languages?.[0] ?? "";
    if (browserLang.toLowerCase().startsWith("en")) {
      setVisible(true);
    }
  }, [locale]);

  if (!visible) return null;

  const dismiss = () => {
    localStorage.setItem(BANNER_KEY, "1");
    setVisible(false);
  };

  const switchToEn = () => {
    localStorage.setItem(BANNER_KEY, "1");
    localStorage.setItem("preferred-locale", "en");
    setVisible(false);
    router.push("/en" as Route);
  };

  return (
    <div
      role="banner"
      className="relative z-50 flex items-center justify-between gap-4 border-b border-blue-100 dark:border-blue-900 bg-blue-50 dark:bg-blue-950 px-5 py-2.5"
    >
      <p className="text-[13px] text-blue-700 dark:text-blue-300 font-medium">
        🇬🇧 This site is also available in{" "}
        <span className="font-semibold">English</span>.
      </p>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={switchToEn}
          className="rounded-lg border border-blue-300 dark:border-blue-700 bg-white dark:bg-blue-900 px-3 py-1 text-[12px] font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors duration-150"
        >
          Switch to English →
        </button>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="flex h-6 w-6 items-center justify-center rounded-md text-blue-400 dark:text-blue-600 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors duration-150 text-sm"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
