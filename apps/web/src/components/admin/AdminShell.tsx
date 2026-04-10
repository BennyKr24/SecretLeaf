"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useAdminAuth } from "@/lib/useAdminAuth";

const NAV_GROUPS = [
  {
    label: "Übersicht",
    items: [
      { href: "/dashboard/admin", label: "Dashboard", icon: "🏠", exact: true },
    ],
  },
  {
    label: "Inhalte",
    items: [
      { href: "/dashboard/admin/users", label: "Benutzer", icon: "👥" },
      { href: "/dashboard/admin/studies", label: "Studien", icon: "🔬" },
    ],
  },
  {
    label: "Pipeline",
    items: [
      { href: "/dashboard/admin/engine", label: "Engine", icon: "⚙️" },
      { href: "/dashboard/admin/algorithm", label: "Algorithmus", icon: "🧬" },
    ],
  },
  {
    label: "Monitoring",
    items: [
      { href: "/dashboard/admin/analytics", label: "Analytics", icon: "📊" },
      { href: "/dashboard/admin/system", label: "System", icon: "🖥️" },
      { href: "/dashboard/admin/settings", label: "Einstellungen", icon: "🔧" },
    ],
  },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const auth = useAdminAuth();
  const pathname = usePathname();

  if (auth.status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6faf7]">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#1f7a4f] border-t-transparent" />
          <p className="mt-4 text-sm text-[#4d685a]">Wird geladen…</p>
        </div>
      </div>
    );
  }

  if (auth.status === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6faf7]">
        <div className="mx-auto max-w-md rounded-2xl border border-[#d8e8dd] bg-white p-8 text-center shadow-sm">
          <p className="text-4xl">🔒</p>
          <h1 className="mt-4 text-2xl font-bold text-[#10281e]">Admin Login erforderlich</h1>
          <p className="mt-2 text-sm text-[#4d685a]">Bitte melde dich mit einem Admin-Account an.</p>
          <Link
            href="/auth"
            className="mt-6 inline-flex rounded-xl bg-[#1f7a4f] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#17613f]"
          >
            Zum Login
          </Link>
        </div>
      </div>
    );
  }

  if (auth.status === "forbidden") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6faf7]">
        <div className="mx-auto max-w-md rounded-2xl border border-[#d8e8dd] bg-white p-8 text-center shadow-sm">
          <p className="text-4xl">⛔</p>
          <h1 className="mt-4 text-2xl font-bold text-[#10281e]">Zugriff verweigert</h1>
          <p className="mt-2 text-sm text-[#4d685a]">Dein Account hat keine Admin-Berechtigung.</p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex rounded-xl border border-[#d8e8dd] px-6 py-2.5 text-sm font-semibold text-[#10281e] transition hover:bg-[#f6faf7]"
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

  return (
    <div className="flex min-h-screen bg-[#f0f7f3]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-30 flex h-screen w-60 flex-col border-r border-[#d0e5d8] bg-white shadow-sm">
        {/* Logo */}
        <div className="border-b border-[#d0e5d8] px-5 py-4">
          <Link href="/" className="flex items-center gap-2.5 text-base font-bold text-[#10281e]">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1f7a4f] text-sm">🌿</span>
            <span>SecretLeaf</span>
          </Link>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1f7a4f]" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#1f7a4f]">
              Admin Panel
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-3">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-4">
              <p className="mb-1 px-3 text-[9px] font-bold uppercase tracking-[0.25em] text-[#b0c8ba]">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive =
                    ("exact" in item && item.exact)
                      ? pathname === item.href
                      : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                        isActive
                          ? "bg-[#e5f4ea] text-[#1f7a4f] shadow-[inset_0_0_0_1px_#c5e6cf]"
                          : "text-[#4d685a] hover:bg-[#f3faf5] hover:text-[#10281e]"
                      }`}
                    >
                      <span className="w-5 text-center text-sm leading-none">{item.icon}</span>
                      <span>{item.label}</span>
                      {isActive && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#1f7a4f]" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="border-t border-[#d0e5d8] p-3">
          <div className="flex items-center gap-2.5 rounded-xl px-2 py-2">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#1f7a4f] text-xs font-bold text-white">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-[#10281e]">
                @{session.user.username}
              </p>
              <p className="text-[10px] text-[#8fa89a]">Administrator</p>
            </div>
            <button
              onClick={() => void auth.logout()}
              title="Abmelden"
              className="ml-auto flex-shrink-0 rounded-lg p-1.5 text-[#8fa89a] transition hover:bg-red-50 hover:text-red-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M19 10a.75.75 0 0 0-.75-.75H8.704l1.048-1.083a.75.75 0 1 0-1.004-1.116l-2.5 2.25a.75.75 0 0 0 0 1.116l2.5 2.25a.75.75 0 1 0 1.004-1.116L8.704 10.75H18.25A.75.75 0 0 0 19 10Z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <Link
            href="/dashboard"
            className="mt-1 flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs text-[#6b8577] transition hover:bg-[#f3faf5] hover:text-[#10281e]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
              <path fillRule="evenodd" d="M14 8a.75.75 0 0 1-.75.75H4.56l1.22 1.22a.75.75 0 1 1-1.06 1.06l-2.5-2.5a.75.75 0 0 1 0-1.06l2.5-2.5a.75.75 0 0 1 1.06 1.06L4.56 7.25h8.69A.75.75 0 0 1 14 8Z" clipRule="evenodd" />
            </svg>
            Zurück zum Dashboard
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-60 flex-1 min-h-screen">
        <div className="mx-auto max-w-6xl px-6 py-7">{children}</div>
      </main>
    </div>
  );
}
