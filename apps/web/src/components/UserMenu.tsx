"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { Route } from "next";
import { useAuth, type AuthUser } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
// ── Avatar ────────────────────────────────────────────────────────────────────

function Avatar({ user }: { user: AuthUser }) {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-[12px] font-bold text-white ring-2 ring-white dark:ring-slate-900 select-none flex-shrink-0">
      {user.initials}
    </span>
  );
}

// ── Plan Badge ────────────────────────────────────────────────────────────────

function PlanBadge({ plan }: { plan: "free" | "pro" }) {
  if (plan === "pro") {
    return (
      <span className="ml-1 rounded-full bg-amber-100 dark:bg-amber-900 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
        PRO
      </span>
    );
  }
  return (
    <span className="ml-1 rounded-full bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
      Free
    </span>
  );
}

// ── Dropdown Item ─────────────────────────────────────────────────────────────

function MenuItem({
  href,
  icon,
  label,
  onClick,
  danger,
}: {
  href?: string;
  icon: string;
  label: string;
  onClick?: () => void;
  danger?: boolean;
}) {
  const base =
    "flex w-full items-center gap-2.5 px-3 py-2 text-[13.5px] font-medium rounded-lg transition-colors duration-100 ";
  const safe =
    "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100";
  const dangerCls =
    "text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950";

  if (href) {
    const linkProps = onClick ? { onClick: () => onClick() } : {};
    return (
      <Link
        href={href as Route}
        className={base + (danger ? dangerCls : safe)}
        {...linkProps}
      >
        <span className="text-base w-5 text-center">{icon}</span>
        {label}
      </Link>
    );
  }
  return (
    <button onClick={onClick} className={base + (danger ? dangerCls : safe)}>
      <span className="text-base w-5 text-center">{icon}</span>
      {label}
    </button>
  );
}

// ── UserMenu ──────────────────────────────────────────────────────────────────

export function UserMenu() {
  const { user, isLoggedIn, isLoading, logout } = useAuth();
  const t = useTranslations("userMenu");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    router.push("/" as Route);
  };

  // During SSR / hydration, render a stable placeholder to avoid layout shift
  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
      </div>
    );
  }

  // ── LOGGED OUT ────────────────────────────────────────────────────────────
  if (!isLoggedIn || !user) {
    return (
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
        <Link
          href="/auth"
          className="hidden sm:flex items-center gap-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950 px-3.5 py-1.5 text-[13.5px] font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-150 shadow-sm"
        >
          {t("login")}
        </Link>
      </div>
    );
  }

  // ── LOGGED IN ─────────────────────────────────────────────────────────────
  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={t("openMenu")}
        className="flex items-center gap-2 rounded-xl p-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
      >
        <Avatar user={user} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-56 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl shadow-black/10 dark:shadow-black/40 p-1.5 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* User identity header */}
          <div className="px-3 py-2.5 mb-1 rounded-lg bg-slate-50 dark:bg-slate-800/60">
            <div className="flex items-center gap-2.5">
              <Avatar user={user} />
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 truncate flex items-center gap-1">
                  {user.username}
                  <PlanBadge plan={user.plan} />
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 capitalize">
                  {user.role.toLowerCase()}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation items */}
          <MenuItem href="/dashboard/user" icon="👤" label={t("profile")} onClick={() => setOpen(false)} />
          <MenuItem href="/dashboard" icon="📊" label={t("dashboard")} onClick={() => setOpen(false)} />
          <MenuItem href="/start" icon="🌱" label={t("myGrows")} onClick={() => setOpen(false)} />

          {/* Divider */}
          <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

          {/* Preferences (inline) */}
          <div className="px-3 py-1.5 flex items-center justify-between gap-2">
            <span className="text-[12px] font-medium text-slate-400 dark:text-slate-500">{t("theme")}</span>
            <ThemeToggle />
          </div>
          <div className="px-3 py-1.5 flex items-center justify-between gap-2">
            <span className="text-[12px] font-medium text-slate-400 dark:text-slate-500">{t("language")}</span>
            <LanguageSwitcher />
          </div>

          {/* Divider */}
          <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

          <MenuItem icon="🚪" label={t("logout")} onClick={handleLogout} danger />
        </div>
      )}
    </div>
  );
}
