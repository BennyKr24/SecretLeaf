"use client";

import { useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useAdminAuth } from "@/lib/useAdminAuth";
import { adminApi } from "@/lib/adminApi";

type OverviewData = {
  newToday: number;
  newThisWeek: number;
  totalStudies: number;
  pendingReview: number;
  pipelineStatus: "healthy" | "degraded" | "failing";
  lastRun: {
    success: boolean;
    finishedAt: string;
    errors: string | null;
    metadata: Record<string, unknown> | null;
  } | null;
  errorCount: number;
  consecutiveFailures: number;
};

type SystemStats = {
  usersByRole: Record<string, number>;
  totalAuthUsers: number;
  totalStudies: number;
  automationRunsLast24h: number;
  totalFeedbackEvents: number;
};

const STATUS_CONFIG = {
  healthy: { label: "Stabil", color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  degraded: { label: "Eingeschränkt", color: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  failing: { label: "Fehlerhaft", color: "bg-red-100 text-red-700", dot: "bg-red-500" },
} as const;

function StatCard({
  label,
  value,
  sub,
  accent,
  icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: "green" | "amber" | "red" | "blue";
  icon?: string;
}) {
  const accents = {
    green: "border-l-4 border-l-emerald-400",
    amber: "border-l-4 border-l-amber-400",
    red: "border-l-4 border-l-red-400",
    blue: "border-l-4 border-l-blue-400",
  };
  return (
    <div className={`rounded-2xl border border-border bg-card p-5 shadow-sm ${accent ? accents[accent] : ""}`}>
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-fg">{label}</p>
        {icon && <span className="text-xl opacity-70">{icon}</span>}
      </div>
      <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-fg">{sub}</p>}
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function AdminOverviewPage() {
  const auth = useAdminAuth();
  const [data, setData] = useState<OverviewData | null>(null);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth.status !== "authenticated") return;
    void (async () => {
      try {
        const [result, stats] = await Promise.all([
          adminApi<OverviewData>(auth.session, "overview"),
          adminApi<SystemStats>(auth.session, "system-stats"),
        ]);
        setData(result);
        setSystemStats(stats);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Fehler beim Laden");
      } finally {
        setLoading(false);
      }
    })();
  }, [auth]);

  // Greeting
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Guten Morgen";
    if (h < 18) return "Guten Tag";
    return "Guten Abend";
  }, []);

  const todayLabel = new Date().toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (auth.status !== "authenticated") return null;

  const username = auth.session.user.username;

  return (
    <div>
      {/* Header */}
      <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-fg">{todayLabel}</p>
          <h1 className="mt-1 text-2xl font-bold text-foreground">
            {greeting}, {username} 👋
          </h1>
          <p className="mt-1 text-sm text-muted-fg">
            Hier ist dein aktueller Systemüberblick.
          </p>
        </div>
        <Link
          href="/dashboard/admin/engine"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 dark:bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          <span>⚙️</span>
          Engine steuern
        </Link>
      </div>

      {loading && (
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-8">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-600 dark:border-emerald-500 border-t-transparent" />
          <span className="text-sm text-muted-fg">Daten werden geladen…</span>
        </div>
      )}

      {error && (
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <span className="text-lg">⚠️</span>
          {error}
        </div>
      )}

      {data && (
        <>
          {/* Alert Banner — only when something needs attention */}
          {(data.pipelineStatus !== "healthy" || data.pendingReview > 0 || data.consecutiveFailures > 0) && (
            <div className="mb-5 space-y-2">
              {data.pipelineStatus === "failing" && (
                <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <span>🔴</span>
                  <span className="font-semibold">Pipeline fehlerhaft</span>
                  <span className="text-red-500">—</span>
                  <span>{data.consecutiveFailures} Fehler in Folge. Bitte sofort prüfen.</span>
                  <Link href="/dashboard/admin/engine" className="ml-auto font-semibold underline hover:no-underline">
                    Zur Engine →
                  </Link>
                </div>
              )}
              {data.pipelineStatus === "degraded" && (
                <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  <span>🟡</span>
                  <span className="font-semibold">Pipeline eingeschränkt</span>
                  <span className="text-amber-500">—</span>
                  <span>{data.consecutiveFailures} Fehler in Folge. Bitte im Blick behalten.</span>
                  <Link href="/dashboard/admin/engine" className="ml-auto font-semibold underline hover:no-underline">
                    Details →
                  </Link>
                </div>
              )}
              {data.pendingReview > 0 && (
                <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                  <span>🔵</span>
                  <span><span className="font-semibold">{data.pendingReview} Studi{data.pendingReview === 1 ? "e" : "en"}</span> warten auf Prüfung.</span>
                  <Link href="/dashboard/admin/studies?filter=pending" className="ml-auto font-semibold underline hover:no-underline">
                    Jetzt prüfen →
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* KPI Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Heute neu" value={data.newToday} icon="📥" accent="green" />
            <StatCard label="Diese Woche" value={data.newThisWeek} icon="📅" />
            <StatCard label="Gesamt Studien" value={data.totalStudies} icon="🔬" />
            <StatCard
              label="Zu prüfen"
              value={data.pendingReview}
              icon="🔍"
              {...(data.pendingReview > 0 ? { accent: "amber" as const } : {})}
              sub={data.pendingReview > 0 ? "Manuelle Prüfung ausstehend" : "Alles geprüft ✓"}
            />
          </div>

          {/* Pipeline + Last Run */}
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {/* Pipeline Status */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-fg">Pipeline Status</h2>
                <Link href="/dashboard/admin/engine" className="text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline">
                  Details →
                </Link>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <span className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${STATUS_CONFIG[data.pipelineStatus].color}`}>
                  <span className={`inline-block h-2 w-2 rounded-full ${STATUS_CONFIG[data.pipelineStatus].dot}`} />
                  {STATUS_CONFIG[data.pipelineStatus].label}
                </span>
                {data.consecutiveFailures > 0 && (
                  <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-600">
                    {data.consecutiveFailures}× Fehler
                  </span>
                )}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-background p-3">
                  <p className="text-xs text-muted-fg">Fehler letzte 10 Runs</p>
                  <p className={`mt-0.5 text-xl font-bold ${data.errorCount > 0 ? "text-red-600" : "text-emerald-700 dark:text-emerald-400"}`}>
                    {data.errorCount}
                  </p>
                </div>
                <div className="rounded-xl bg-background p-3">
                  <p className="text-xs text-muted-fg">Automation Runs 24h</p>
                  <p className="mt-0.5 text-xl font-bold text-foreground">
                    {systemStats?.automationRunsLast24h ?? "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Last Run */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-fg">Letzter Pipeline-Durchlauf</h2>
              {data.lastRun ? (
                <div className="mt-3">
                  <div className="flex items-center gap-2">
                    <span className={`inline-block h-2.5 w-2.5 rounded-full ${data.lastRun.success ? "bg-emerald-500" : "bg-red-500"}`} />
                    <span className="font-semibold text-foreground">
                      {data.lastRun.success ? "Erfolgreich" : "Fehlgeschlagen"}
                    </span>
                    <span className="ml-auto text-xs text-muted-fg">{formatDate(data.lastRun.finishedAt)}</span>
                  </div>
                  {data.lastRun.metadata && (
                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                      {typeof data.lastRun.metadata.accepted === "number" && (
                        <div className="rounded-xl bg-emerald-50 px-2 py-2 text-center">
                          <p className="text-lg font-bold text-emerald-700">{data.lastRun.metadata.accepted as number}</p>
                          <p className="text-emerald-600">Angenommen</p>
                        </div>
                      )}
                      {typeof data.lastRun.metadata.rejected === "number" && (
                        <div className="rounded-xl bg-red-50 px-2 py-2 text-center">
                          <p className="text-lg font-bold text-red-600">{data.lastRun.metadata.rejected as number}</p>
                          <p className="text-red-500">Abgelehnt</p>
                        </div>
                      )}
                      {typeof data.lastRun.metadata.durationMs === "number" && (
                        <div className="rounded-xl bg-background px-2 py-2 text-center">
                          <p className="text-lg font-bold text-foreground">{Math.round((data.lastRun.metadata.durationMs as number) / 1000)}s</p>
                          <p className="text-muted-fg">Dauer</p>
                        </div>
                      )}
                    </div>
                  )}
                  {data.lastRun.errors && (
                    <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">
                      ⚠ {data.lastRun.errors}
                    </p>
                  )}
                </div>
              ) : (
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-fg">
                  <span>—</span>
                  <span>Noch kein Pipeline-Durchlauf aufgezeichnet.</span>
                </div>
              )}
            </div>
          </div>

          {/* Users + Quick Actions */}
          {systemStats && (
            <>
              <div className="mt-5">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-fg">Benutzerübersicht</h2>
                  <Link href="/dashboard/admin/users" className="text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline">
                    Alle Benutzer →
                  </Link>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard label="Registriert" value={systemStats.totalAuthUsers} icon="👤" />
                  <StatCard label="Consumer" value={systemStats.usersByRole.CONSUMER ?? 0} icon="🛒" accent="green" />
                  <StatCard label="Provider" value={systemStats.usersByRole.PROVIDER ?? 0} icon="🏪" accent="blue" />
                  <StatCard label="Admins" value={systemStats.usersByRole.ADMIN ?? 0} icon="🛡️" />
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-5">
                <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.15em] text-muted-fg">Schnellzugriff</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {([
                    {
                      href: "/dashboard/admin/users" as const,
                      icon: "👥",
                      title: "Benutzer",
                      sub: `${systemStats.totalAuthUsers} registriert`,
                      color: "hover:border-blue-300",
                    },
                    {
                      href: "/dashboard/admin/studies" as const,
                      icon: "🔬",
                      title: "Studien prüfen",
                      sub: data.pendingReview > 0 ? `${data.pendingReview} ausstehend` : "Alles aktuell",
                      color: data.pendingReview > 0 ? "border-amber-200 hover:border-amber-400" : "hover:border-emerald-300",
                    },
                    {
                      href: "/dashboard/admin/engine" as const,
                      icon: "⚙️",
                      title: "Engine",
                      sub: `Status: ${STATUS_CONFIG[data.pipelineStatus].label}`,
                      color: data.pipelineStatus === "healthy" ? "hover:border-emerald-300" : "border-amber-200 hover:border-amber-400",
                    },
                    {
                      href: "/dashboard/admin/algorithm" as const,
                      icon: "🧬",
                      title: "Algorithmus",
                      sub: "Keywords & Filter konfigurieren",
                      color: "hover:border-purple-300",
                    },
                  ]).map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:shadow-md ${item.color}`}
                    >
                      <p className="text-2xl">{item.icon}</p>
                      <p className="mt-2 text-sm font-semibold text-foreground">{item.title}</p>
                      <p className="mt-0.5 text-xs text-muted-fg">{item.sub}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
