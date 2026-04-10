"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useAdminAuth } from "@/lib/useAdminAuth";

const NAV_ITEMS = [
  { href: "/dashboard/admin", label: "Übersicht", icon: "◉" },
  { href: "/dashboard/admin/studies", label: "Studien", icon: "◎" },
  { href: "/dashboard/admin/engine", label: "Engine", icon: "⚙" },
  { href: "/dashboard/admin/analytics", label: "Analytics", icon: "◈" },
  { href: "/dashboard/admin/settings", label: "Settings", icon: "⊞" },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const auth = useAdminAuth();
  const pathname = usePathname();

  if (auth.status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6faf7]">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#1f7a4f] border-t-transparent" />
          <p className="mt-4 text-sm text-[#4d685a]">Wird geladen...</p>
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

  return (
    <div className="flex min-h-screen bg-[#f6faf7]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-30 flex h-screen w-56 flex-col border-r border-[#d8e8dd] bg-white">
        <div className="border-b border-[#d8e8dd] px-5 py-4">
          <Link href="/" className="flex items-center gap-2 text-base font-bold text-[#10281e]">
            <span className="text-lg">🌿</span>
            <span>SecretLeaf</span>
          </Link>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#1f7a4f]">
            Admin Panel
          </p>
        </div>

        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-[#e5f4ea] text-[#1f7a4f]"
                    : "text-[#4d685a] hover:bg-[#f6faf7] hover:text-[#10281e]"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[#d8e8dd] px-4 py-3">
          <p className="truncate text-xs font-medium text-[#4d685a]">
            @{session.user.username}
          </p>
          <button
            onClick={() => void auth.logout()}
            className="mt-1 text-xs text-[#8fa89a] transition hover:text-[#a54b4b]"
          >
            Abmelden
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-56 flex-1">
        <div className="mx-auto max-w-6xl px-6 py-6">{children}</div>
      </main>
    </div>
  );
}
