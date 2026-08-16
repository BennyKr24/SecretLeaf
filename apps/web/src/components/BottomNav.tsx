"use client";

import { useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import { useActiveGrow } from "@/hooks/useActiveGrow";
import { MoreSheet } from "@/components/MoreSheet";
import { Sprout, LayoutDashboard, Calculator, Stethoscope, Menu, type LucideIcon } from "lucide-react";

/** Admin has its own dedicated navigation (AdminShell) — a second fixed
 * bottom bar there would compete with it for the same screen space. */
function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith("/dashboard/admin");
}

function TabLink({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-1 flex-col items-center justify-center gap-1 text-[10.5px] font-medium transition-colors duration-150 ${
        active ? "text-primary" : "text-muted-fg"
      }`}
    >
      <Icon className="h-5 w-5" strokeWidth={active ? 2.25 : 2} />
      {label}
    </Link>
  );
}

export function BottomNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { isLoggedIn } = useAuth();
  const activeGrow = useActiveGrow();
  const [moreOpen, setMoreOpen] = useState(false);

  if (isAdminRoute(pathname)) return null;

  const growHref = activeGrow ? `/grow/${activeGrow.id}` : "/start";
  const growActive = pathname === "/start" || pathname.startsWith("/grow/");
  const dashboardActive = pathname === "/dashboard" || pathname.startsWith("/dashboard/user");
  const toolsActive = pathname.startsWith("/tools");
  const diagnoseActive = pathname.startsWith("/diagnose");

  return (
    <>
      <nav
        className="glass-surface pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-border/60 backdrop-saturate-150 md:hidden"
        aria-label={t("mobileNav")}
      >
        <div className="mx-auto flex h-[60px] max-w-6xl items-stretch px-1">
          <TabLink
            href={growHref}
            icon={Sprout}
            label={activeGrow ? t("myGrow") : t("startGrow")}
            active={growActive}
          />
          {!isLoggedIn && (
            <TabLink href="/dashboard" icon={LayoutDashboard} label={t("dashboard")} active={dashboardActive} />
          )}
          <TabLink href="/tools" icon={Calculator} label={t("tools")} active={toolsActive} />
          <TabLink href="/diagnose" icon={Stethoscope} label={t("diagnose")} active={diagnoseActive} />
          <button
            onClick={() => setMoreOpen(true)}
            className="flex flex-1 flex-col items-center justify-center gap-1 text-[10.5px] font-medium text-muted-fg transition-colors duration-150"
          >
            <Menu className="h-5 w-5" strokeWidth={2} />
            {t("more")}
          </button>
        </div>
      </nav>

      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
    </>
  );
}

/** Reserves scroll space equal to the fixed bottom nav's height (+ safe
 * area) so page content and the footer never render underneath it.
 * Mirrors BottomNav's own admin-route suppression 1:1. */
export function BottomNavSpacer() {
  const pathname = usePathname();
  if (isAdminRoute(pathname)) return null;
  return <div aria-hidden className="pb-safe h-[60px] md:hidden" />;
}
