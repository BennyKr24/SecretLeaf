"use client";

import { useEffect, useRef, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useAuth, type AuthUser } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { User, BarChart3, Sprout, LogOut } from "lucide-react";
import type { ComponentType } from "react";

/**
 * A status dot is a state indicator, not a concept-icon — it doesn't map to
 * any Lucide glyph. Shaped to slot into MenuItem's `icon` prop alongside
 * real Lucide icons.
 */
type MenuIcon = ComponentType<{ className?: string; strokeWidth?: number }>;

function StatusDot() {
  return <span className="block h-2 w-2 rounded-full bg-emerald-400" />;
}
// ── Avatar ────────────────────────────────────────────────────────────────────

function Avatar({ user }: { user: AuthUser }) {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-[12px] font-bold text-white ring-2 ring-background select-none flex-shrink-0">
      {user.initials}
    </span>
  );
}

// ── Plan Badge ────────────────────────────────────────────────────────────────

function PlanBadge({ plan }: { plan: "free" | "pro" | "team" }) {
  const effectivePlan = plan;
  if (effectivePlan === "pro") {
    return (
      <span className="ml-1 rounded-full bg-amber-100 dark:bg-amber-900 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
        PRO
      </span>
    );
  }
  if (effectivePlan === "team") {
    return (
      <span className="ml-1 rounded-full bg-emerald-100 dark:bg-emerald-900 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
        TEAM
      </span>
    );
  }
  return (
    <span className="ml-1 rounded-full bg-border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-fg">
      Free
    </span>
  );
}

// ── Dropdown Item ─────────────────────────────────────────────────────────────

function MenuItem({
  href,
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  href?: string;
  icon: MenuIcon;
  label: string;
  onClick?: () => void;
  danger?: boolean;
}) {
  const base =
    "flex min-h-[44px] w-full items-center gap-2.5 px-3 py-2 text-[13.5px] font-medium rounded-lg transition-colors duration-100 ";
  const safe =
    "text-foreground/80 hover:bg-background hover:text-foreground";
  const dangerCls =
    "text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950";

  if (href) {
    const linkProps = onClick ? { onClick: () => onClick() } : {};
    return (
      <Link
        href={href}
        className={base + (danger ? dangerCls : safe)}
        {...linkProps}
      >
        <span className="flex w-5 items-center justify-center">
          <Icon className="h-4 w-4" strokeWidth={2} />
        </span>
        {label}
      </Link>
    );
  }
  return (
    <button onClick={onClick} className={base + (danger ? dangerCls : safe)}>
      <span className="flex w-5 items-center justify-center">
        <Icon className="h-4 w-4" strokeWidth={2} />
      </span>
      {label}
    </button>
  );
}

// ── UserMenu ──────────────────────────────────────────────────────────────────

export function UserMenu() {
  const { user, isLoggedIn, isLoading, logout } = useAuth();
  const t = useTranslations("userMenu");
  const nav = useTranslations("nav");
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
    router.push("/");
  };

  // During SSR / hydration, render a stable placeholder to avoid layout shift
  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-border animate-pulse" />
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
          className="hidden sm:flex items-center gap-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950 px-3.5 py-1.5 text-[13.5px] font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors duration-150 shadow-sm"
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
        className="flex items-center gap-2 rounded-xl p-1.5 md:p-1 hover:bg-background transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
      >
        <Avatar user={user} />
      </button>

      {/* Always mounted + class-toggled, not conditionally rendered: the
          previous `{open && ...}` relied on `animate-in`/`fade-in`/
          `slide-in-from-top-2` utility classes from the tailwindcss-animate
          plugin — which isn't installed (see tailwind.config.ts `plugins: []`),
          so this menu had ZERO transition, ever. Origin-aware glass
          materialize per DESIGN_SYSTEM.md §15.6 / apple-design §12, same
          pattern as components/ui/Dropdown.tsx. */}
      <div
        role="menu"
        className={`absolute right-0 top-[calc(100%+8px)] z-50 w-56 origin-top-right rounded-2xl border border-border bg-card/80 backdrop-blur-xl backdrop-saturate-150 shadow-xl shadow-black/10 dark:shadow-black/40 p-1.5 transition-[opacity,transform,filter] duration-200 ease-out ${
          open ? 'opacity-100 scale-100 blur-none' : 'pointer-events-none invisible opacity-0 scale-95 blur-sm'
        }`}
      >
          {/* User identity header */}
          <div className="px-3 py-2.5 mb-1 rounded-lg bg-background">
            <div className="flex items-center gap-2.5">
              <Avatar user={user} />
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-foreground truncate flex items-center gap-1">
                  {user.displayName}
                  <PlanBadge plan={user.plan} />
                </p>
                <p className="text-[11px] text-muted-fg capitalize">
                  {user.role.toLowerCase()}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation items — no items that duplicate the top nav bar */}
          <MenuItem href="/profile" icon={User} label={t("profile")} onClick={() => setOpen(false)} />
          <MenuItem href="/dashboard/user" icon={BarChart3} label={t("dashboard")} onClick={() => setOpen(false)} />
          <MenuItem href="/status" icon={StatusDot} label={nav("status")} onClick={() => setOpen(false)} />
          <MenuItem href="/start" icon={Sprout} label={t("myGrows")} onClick={() => setOpen(false)} />

          {/* Divider */}
          <div className="my-1 border-t border-border" />

          {/* Preferences (inline) */}
          <div className="px-3 py-1.5 flex items-center justify-between gap-2">
            <span className="text-[12px] font-medium text-muted-fg">{t("theme")}</span>
            <ThemeToggle />
          </div>
          <div className="px-3 py-1.5 flex items-center justify-between gap-2">
            <span className="text-[12px] font-medium text-muted-fg">{t("language")}</span>
            <LanguageSwitcher />
          </div>

          {/* Divider */}
          <div className="my-1 border-t border-border" />

          <MenuItem icon={LogOut} label={t("logout")} onClick={handleLogout} danger />
      </div>
    </div>
  );
}
