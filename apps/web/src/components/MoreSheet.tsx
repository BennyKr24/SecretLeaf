"use client";

import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Sheet } from "@/components/ui/Sheet";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useAuth } from "@/hooks/useAuth";
import {
  Library,
  Activity,
  Search,
  User,
  Database,
  History,
  ShieldCheck,
  LogOut,
  X,
  type LucideIcon,
} from "lucide-react";

function Row({
  href,
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  href?: string;
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  danger?: boolean;
}) {
  const cls = `flex min-h-[48px] w-full items-center gap-3 rounded-xl px-3 text-[15px] font-medium transition-colors duration-100 ${
    danger
      ? "text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950"
      : "text-foreground/85 hover:bg-background hover:text-foreground"
  }`;

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={cls}>
        <span className="flex w-6 items-center justify-center">
          <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
        </span>
        {label}
      </Link>
    );
  }
  return (
    <button onClick={onClick} className={cls}>
      <span className="flex w-6 items-center justify-center">
        <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
      </span>
      {label}
    </button>
  );
}

export function MoreSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations("nav");
  const userMenu = useTranslations("userMenu");
  const { user, isLoggedIn, logout } = useAuth();
  const router = useRouter();

  const isAdmin = isLoggedIn && user?.role === "ADMIN";

  const handleLogout = async () => {
    onClose();
    await logout();
    router.push("/");
  };

  return (
    <Sheet open={open} onClose={onClose} label={t("menu")}>
      {/* Header */}
      <div className="flex flex-shrink-0 items-center justify-between border-b border-border px-4 py-3.5">
        <p className="text-sm font-bold text-foreground">{t("menu")}</p>
        <button
          onClick={onClose}
          aria-label={t("menu")}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-fg transition-colors hover:bg-background hover:text-foreground active:scale-90"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      {/* Destinations */}
      <div className="flex-1 space-y-0.5 overflow-y-auto px-2 py-2">
        <Row href="/search" icon={Search} label={t("search")} onClick={onClose} />
        <Row href="/studies" icon={Library} label={t("studies")} onClick={onClose} />
        <Row href="/status" icon={Activity} label={t("status")} onClick={onClose} />
        <Row href="/database" icon={Database} label={t("database")} onClick={onClose} />
        {isLoggedIn && (
          <>
            <Row href="/grow/history" icon={History} label={t("growHistory")} onClick={onClose} />
            <Row href="/profile" icon={User} label={userMenu("profile")} onClick={onClose} />
          </>
        )}
        {isAdmin && (
          <Row href="/dashboard/admin" icon={ShieldCheck} label={t("admin")} onClick={onClose} />
        )}
      </div>

      {/* Preferences + auth */}
      <div className="flex-shrink-0 border-t border-border px-4 py-3">
        <div className="flex items-center justify-between gap-2 py-1.5">
          <span className="text-[13px] font-medium text-muted-fg">{userMenu("theme")}</span>
          <ThemeToggle />
        </div>
        <div className="flex items-center justify-between gap-2 py-1.5">
          <span className="text-[13px] font-medium text-muted-fg">{userMenu("language")}</span>
          <LanguageSwitcher />
        </div>

        {isLoggedIn ? (
          <div className="mt-1 border-t border-border pt-1">
            <Row icon={LogOut} label={userMenu("logout")} onClick={() => void handleLogout()} danger />
          </div>
        ) : (
          <Link
            href="/auth"
            onClick={onClose}
            className="mt-2 flex min-h-[48px] w-full items-center justify-center rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950 text-[15px] font-semibold text-emerald-700 dark:text-emerald-400"
          >
            {userMenu("login")}
          </Link>
        )}
      </div>
    </Sheet>
  );
}
