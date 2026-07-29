"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import SearchBar from "@/components/SearchBar";
import { UserMenu } from "@/components/UserMenu";
import { useAuth } from "@/hooks/useAuth";
import { useActiveGrow } from "@/hooks/useActiveGrow";

export function NavigationBar() {
  const t = useTranslations("nav");
  const { isLoggedIn } = useAuth();
  const activeGrow = useActiveGrow();

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-5 h-[60px] flex items-center gap-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 font-semibold text-slate-900 dark:text-slate-100 text-[15px] flex-shrink-0 tracking-tight group"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-sm transition-transform duration-200 group-hover:scale-110">
            🌿
          </span>
          <span className="hidden sm:inline">SecretLeaf</span>
        </Link>

        {/* Divider */}
        <div className="hidden md:block h-5 w-px bg-slate-200 dark:bg-slate-700" />

        {/* Primary Navigation */}
        <div className="hidden md:flex items-center gap-0.5 text-[13.5px] text-slate-600 dark:text-slate-300">
          <Link
            href={activeGrow ? `/grow/${activeGrow.id}` : "/start"}
            className="nav-link flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors duration-150"
          >
            <span className="text-[12px]">🌱</span>
            {activeGrow ? t("myGrow") : t("startGrow")}
          </Link>
          {!isLoggedIn && (
            <Link
              href="/dashboard"
              className="nav-link px-3 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors duration-150 font-medium"
            >
              {t("dashboard")}
            </Link>
          )}
          <Link
            href="/tools"
            className="nav-link px-3 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors duration-150 font-medium"
          >
            {t("tools")}
          </Link>
          <Link
            href="/diagnose"
            className="nav-link px-3 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors duration-150 font-medium"
          >
            {t("diagnose")}
          </Link>

          <span className="mx-1.5 h-4 w-px bg-slate-200 dark:bg-slate-700" />

          <Link
            href="/studies"
            className="nav-link px-3 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors duration-150 font-medium text-slate-500 dark:text-slate-400"
          >
            {t("studies")}
          </Link>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right side: Search + UserMenu (contains theme/language when logged in) */}
        <div className="flex items-center gap-2">
          <SearchBar />
          {/*
           * UserMenu handles both states:
           * - logged out → shows login button (with theme + lang toggles)
           * - logged in  → shows avatar + dropdown (theme + lang inside menu)
           */}
          <UserMenu />
        </div>
      </div>
    </nav>
  );
}
