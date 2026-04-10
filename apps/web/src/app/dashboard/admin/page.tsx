"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  healthy: { label: "Healthy", color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  degraded: { label: "Degraded", color: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  failing: { label: "Failing", color: "bg-red-100 text-red-700", dot: "bg-red-500" },
} as const;

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-2xl border border-[#d8e8dd] bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8fa89a]">{label}</p>
      <p className="mt-2 text-3xl font-bold text-[#10281e]">{value}</p>
      {sub && <p className="mt-1 text-xs text-[#6b8577]">{sub}</p>}
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

  if (auth.status !== "authenticated") return null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#10281e]">Übersicht</h1>
        <p className="mt-1 text-sm text-[#4d685a]">Systemstatus und Kernmetriken auf einen Blick.</p>
      </div>

      {loading && (
        <div className="flex items-center gap-3 rounded-2xl border border-[#d8e8dd] bg-white p-8">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#1f7a4f] border-t-transparent" />
          <span className="text-sm text-[#4d685a]">Daten werden geladen...</span>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {data && (
        <>
          {/* KPI Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Heute neu" value={data.newToday} />
            <StatCard label="Diese Woche" value={data.newThisWeek} />
            <StatCard label="Gesamt Studien" value={data.totalStudies} />
            <StatCard label="Zu prüfen" value={data.pendingReview} sub="quality_status = pending" />
          </div>

          {/* Pipeline Status */}
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-[#d8e8dd] bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-[#8fa89a]">Pipeline Status</h2>
              <div className="mt-3 flex items-center gap-3">
                <span className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${STATUS_CONFIG[data.pipelineStatus].color}`}>
                  <span className={`inline-block h-2 w-2 rounded-full ${STATUS_CONFIG[data.pipelineStatus].dot}`} />
                  {STATUS_CONFIG[data.pipelineStatus].label}
                </span>
                {data.consecutiveFailures > 0 && (
                  <span className="text-xs text-[#6b8577]">
                    {data.consecutiveFailures} Fehler in Folge
                  </span>
                )}
              </div>
              <div className="mt-4 space-y-2 text-sm text-[#4d685a]">
                <p>
                  <span className="font-medium text-[#10281e]">Fehler (letzte 10 Runs):</span>{" "}
                  {data.errorCount}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#d8e8dd] bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-[#8fa89a]">Letzter Pipeline Run</h2>
              {data.lastRun ? (
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`inline-block h-2 w-2 rounded-full ${data.lastRun.success ? "bg-emerald-500" : "bg-red-500"}`} />
                    <span className="font-medium text-[#10281e]">
                      {data.lastRun.success ? "Erfolgreich" : "Fehlgeschlagen"}
                    </span>
                  </div>
                  <p className="text-[#4d685a]">
                    {formatDate(data.lastRun.finishedAt)}
                  </p>
                  {data.lastRun.metadata && (
                    <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                      {typeof data.lastRun.metadata.accepted === "number" && (
                        <div className="rounded-lg bg-[#f6faf7] px-2 py-1.5 text-center">
                          <p className="font-bold text-[#10281e]">{data.lastRun.metadata.accepted as number}</p>
                          <p className="text-[#8fa89a]">Accepted</p>
                        </div>
                      )}
                      {typeof data.lastRun.metadata.rejected === "number" && (
                        <div className="rounded-lg bg-[#f6faf7] px-2 py-1.5 text-center">
                          <p className="font-bold text-[#10281e]">{data.lastRun.metadata.rejected as number}</p>
                          <p className="text-[#8fa89a]">Rejected</p>
                        </div>
                      )}
                      {typeof data.lastRun.metadata.durationMs === "number" && (
                        <div className="rounded-lg bg-[#f6faf7] px-2 py-1.5 text-center">
                          <p className="font-bold text-[#10281e]">{Math.round((data.lastRun.metadata.durationMs as number) / 1000)}s</p>
                          <p className="text-[#8fa89a]">Dauer</p>
                        </div>
                      )}
                    </div>
                  )}
                  {data.lastRun.errors && (
                    <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                      {data.lastRun.errors}
                    </p>
                  )}
                </div>
              ) : (
                <p className="mt-3 text-sm text-[#4d685a]">Noch kein Pipeline-Run aufgezeichnet.</p>
              )}
            </div>
          </div>

          {/* Quick Access: User Stats */}
          {systemStats && (
            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-[#8fa89a]">Benutzer</h2>
                <Link href="/dashboard/admin/users" className="text-xs font-medium text-[#1f7a4f] hover:underline">
                  Alle Benutzer →
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Registriert" value={systemStats.totalAuthUsers} />
                <StatCard label="Consumer" value={systemStats.usersByRole.CONSUMER ?? 0} />
                <StatCard label="Provider" value={systemStats.usersByRole.PROVIDER ?? 0} />
                <StatCard label="Admins" value={systemStats.usersByRole.ADMIN ?? 0} />
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {systemStats && (
            <div className="mt-6">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-[#8fa89a]">Schnellzugriff</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Link
                  href="/dashboard/admin/users"
                  className="rounded-2xl border border-[#d8e8dd] bg-white p-4 shadow-sm transition hover:border-[#5ca87f] hover:shadow-md"
                >
                  <p className="text-lg">◷</p>
                  <p className="mt-1 text-sm font-semibold text-[#10281e]">Benutzer verwalten</p>
                  <p className="text-xs text-[#6b8577]">{systemStats.totalAuthUsers} registriert</p>
                </Link>
                <Link
                  href="/dashboard/admin/studies"
                  className="rounded-2xl border border-[#d8e8dd] bg-white p-4 shadow-sm transition hover:border-[#5ca87f] hover:shadow-md"
                >
                  <p className="text-lg">◎</p>
                  <p className="mt-1 text-sm font-semibold text-[#10281e]">Studien prüfen</p>
                  <p className="text-xs text-[#6b8577]">{data.pendingReview} ausstehend</p>
                </Link>
                <Link
                  href="/dashboard/admin/engine"
                  className="rounded-2xl border border-[#d8e8dd] bg-white p-4 shadow-sm transition hover:border-[#5ca87f] hover:shadow-md"
                >
                  <p className="text-lg">⚙</p>
                  <p className="mt-1 text-sm font-semibold text-[#10281e]">Engine steuern</p>
                  <p className="text-xs text-[#6b8577]">Pipeline kontrollieren</p>
                </Link>
                <Link
                  href="/dashboard/admin/system"
                  className="rounded-2xl border border-[#d8e8dd] bg-white p-4 shadow-sm transition hover:border-[#5ca87f] hover:shadow-md"
                >
                  <p className="text-lg">⊡</p>
                  <p className="mt-1 text-sm font-semibold text-[#10281e]">System-Info</p>
                  <p className="text-xs text-[#6b8577]">{systemStats.automationRunsLast24h} Runs (24h)</p>
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
