"use client";

import { useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import type { ReactNode } from "react";
import { useAdminAuth } from "@/lib/useAdminAuth";
import { IconChip } from "@/components/ui/IconChip";
import { Sheet } from "@/components/ui/Sheet";
import { ADMIN_NAV, activeAdminEntry } from "@/components/admin/nav";
import { ShieldAlert, Lock, Leaf, LogOut, ArrowLeft, Menu } from "lucide-react";

/** Sidebar content shared by the persistent desktop `<aside>` and the
 * mobile drawer (rendered inside `Sheet`) — identical markup, just a
 * different container. `onNavigate` closes the mobile drawer on tap; it's
 * undefined (no-op) on desktop where there's nothing to close. */
function AdminSidebarContent({
  pathname,
  username,
  initials,
  onLogout,
  onNavigate,
}: {
  pathname: string;
  username: string;
  initials: string;
  onLogout: () => void;
  onNavigate?: () => void;
}) {
  const activeHref = activeAdminEntry(pathname)?.href;
  return (
    <>
      {/* Logo */}
      <div className="border-b border-border px-5 py-4">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-2.5 text-base font-bold text-foreground"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-sm">
            <Leaf className="h-3.5 w-3.5 text-white" strokeWidth={2} />
          </span>
          <span>SecretLeaf</span>
        </Link>
        <div className="mt-2 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
            Admin-Bereich
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        {ADMIN_NAV.map((group) => (
          <div key={group.group} className="mb-4">
            <p className="mb-1 px-3 text-[9px] font-bold uppercase tracking-[0.25em] text-muted-fg">
              {group.group}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = activeHref === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={`flex min-h-[44px] items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-[background-color,color,box-shadow,transform] duration-150 active:scale-[0.98] ${
                      isActive
                        ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                        : "text-muted-fg hover:bg-background hover:text-foreground"
                    }`}
                  >
                    <span className="flex w-5 items-center justify-center">
                      <Icon className="h-4 w-4" strokeWidth={2} />
                    </span>
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2.5 rounded-xl px-2 py-2">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-foreground">@{username}</p>
            <p className="text-[10px] text-muted-fg">Administrator</p>
          </div>
          <button
            onClick={onLogout}
            title="Abmelden"
            className="ml-auto flex-shrink-0 rounded-lg p-1.5 text-muted-fg transition active:scale-[0.98] hover:bg-rose-500/10 hover:text-rose-400"
          >
            <LogOut className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="mt-1 flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs text-muted-fg transition active:scale-[0.98] hover:bg-background hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
          Zurück zum Dashboard
        </Link>
      </div>
    </>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const auth = useAdminAuth();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (auth.status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-4 text-sm text-muted-fg">Wird geladen…</p>
        </div>
      </div>
    );
  }

  if (auth.status === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <IconChip icon={Lock} tone="muted" size="lg" className="mx-auto" />
          <h1 className="mt-4 text-2xl font-bold text-foreground">Administratoranmeldung erforderlich</h1>
          <p className="mt-2 text-sm text-muted-fg">Bitte melde dich mit einem Admin-Konto an.</p>
          <Link
            href="/auth"
            className="mt-6 inline-flex rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            Zur Anmeldung
          </Link>
        </div>
      </div>
    );
  }

  if (auth.status === "forbidden") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <IconChip icon={ShieldAlert} tone="rose" size="lg" className="mx-auto" />
          <h1 className="mt-4 text-2xl font-bold text-foreground">Zugriff verweigert</h1>
          <p className="mt-2 text-sm text-muted-fg">Dein Konto verfügt nicht über Admin-Berechtigungen.</p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex rounded-xl border border-border px-6 py-2.5 text-sm font-semibold text-foreground transition hover:bg-background"
          >
            Zurück zum Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { session } = auth;
  const initials = session.user.username
    ? session.user.username.slice(0, 2).toUpperCase()
    : "AD";
  const activeLabel = activeAdminEntry(pathname)?.label ?? "Admin";

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar — desktop only; below md it's the drawer below instead */}
      <aside className="glass-surface fixed left-0 top-0 z-30 hidden h-screen w-60 flex-col border-r border-border md:flex">
        <AdminSidebarContent
          pathname={pathname}
          username={session.user.username}
          initials={initials}
          onLogout={() => void auth.logout()}
        />
      </aside>

      {/* Sidebar — mobile drawer, same content, opened via the hamburger
          in the mobile header below */}
      <Sheet open={drawerOpen} onClose={() => setDrawerOpen(false)} label="Admin-Navigation">
        <AdminSidebarContent
          pathname={pathname}
          username={session.user.username}
          initials={initials}
          onLogout={() => void auth.logout()}
          onNavigate={() => setDrawerOpen(false)}
        />
      </Sheet>

      {/* Main content */}
      <main className="min-h-screen flex-1 md:ml-60">
        {/* Mobile-only header: hamburger + current section, replaces the
            persistent sidebar's role below md */}
        <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3 md:hidden">
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Admin-Menü öffnen"
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-muted-fg transition-colors hover:bg-background hover:text-foreground active:scale-90"
          >
            <Menu className="h-5 w-5" strokeWidth={2} />
          </button>
          <p className="truncate text-sm font-semibold text-foreground">{activeLabel}</p>
        </div>

        <div className="mx-auto max-w-6xl px-6 py-7">{children}</div>
      </main>
    </div>
  );
}
