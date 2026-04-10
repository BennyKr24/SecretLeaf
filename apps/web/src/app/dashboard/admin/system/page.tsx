"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/lib/useAdminAuth";
import { adminApi } from "@/lib/adminApi";

type SystemStats = {
  usersByRole: Record<string, number>;
  totalAuthUsers: number;
  totalStudies: number;
  automationRunsLast24h: number;
  totalFeedbackEvents: number;
};

type EnvConfig = {
  lookbackDays: number;
  maxAttempts: number;
  studyLimit: number;
};

function StatCard({
  label,
  value,
  description,
  color = "default",
}: {
  label: string;
  value: string | number;
  description?: string;
  color?: "default" | "green" | "blue" | "purple" | "amber";
}) {
  const colors = {
    default: "border-[#d8e8dd]",
    green: "border-emerald-200",
    blue: "border-blue-200",
    purple: "border-purple-200",
    amber: "border-amber-200",
  };

  return (
    <div className={`rounded-2xl border bg-white p-5 shadow-sm ${colors[color]}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8fa89a]">{label}</p>
      <p className="mt-2 text-3xl font-bold text-[#10281e]">{value}</p>
      {description && <p className="mt-1 text-xs text-[#6b8577]">{description}</p>}
    </div>
  );
}

export default function AdminSystemPage() {
  const auth = useAdminAuth();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [envConfig, setEnvConfig] = useState<EnvConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (auth.status !== "authenticated") return;
    void (async () => {
      try {
        const [systemData, settingsData] = await Promise.all([
          adminApi<SystemStats>(auth.session, "system-stats"),
          adminApi<{ envConfig: EnvConfig }>(auth.session, "settings-get"),
        ]);
        setStats(systemData);
        setEnvConfig(settingsData.envConfig);
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
      <div className="mb-7">
        <div className="flex items-center gap-2 text-xs text-[#8fa89a]">
          <span>Admin</span><span>/</span><span className="font-semibold text-[#4d685a]">System</span>
        </div>
        <div className="mt-1 flex items-center gap-3">
          <span className="text-2xl">🖥️</span>
          <div>
            <h1 className="text-2xl font-bold text-[#10281e]">System</h1>
            <p className="text-sm text-[#4d685a]">Systemstatistiken, Benutzer-Metriken und Konfiguration im Überblick.</p>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-3 rounded-2xl border border-[#d8e8dd] bg-white p-8">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#1f7a4f] border-t-transparent" />
          <span className="text-sm text-[#4d685a]">System-Daten werden geladen...</span>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
      )}

      {stats && (
        <>
          {/* User Distribution */}
          <div className="mb-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-[#8fa89a]">
              Benutzer nach Rolle
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Gesamt Auth Users"
                value={stats.totalAuthUsers}
                description="Alle registrierten Accounts"
              />
              <StatCard
                label="Consumer"
                value={stats.usersByRole.CONSUMER ?? 0}
                color="green"
                description="Standard-Benutzer"
              />
              <StatCard
                label="Provider"
                value={stats.usersByRole.PROVIDER ?? 0}
                color="blue"
                description="Anbieter"
              />
              <StatCard
                label="Admin"
                value={stats.usersByRole.ADMIN ?? 0}
                color="purple"
                description="Administratoren"
              />
            </div>
          </div>

          {/* Platform Metrics */}
          <div className="mb-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-[#8fa89a]">
              Plattform-Metriken
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard label="Studien gesamt" value={stats.totalStudies} />
              <StatCard
                label="Automation Runs (24h)"
                value={stats.automationRunsLast24h}
                description="Pipeline-Ausführungen der letzten 24 Stunden"
              />
              <StatCard
                label="Feedback Events"
                value={stats.totalFeedbackEvents}
                description="Gesamtzahl aller Nutzerfeedbacks"
              />
            </div>
          </div>

          {/* Environment Configuration */}
          {envConfig && (
            <div className="mb-6">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-[#8fa89a]">
                Umgebungs-Konfiguration
              </h2>
              <div className="rounded-2xl border border-[#d8e8dd] bg-white p-5 shadow-sm">
                <p className="mb-4 text-xs text-[#6b8577]">
                  Nur Lesen. Diese Werte stammen aus Umgebungsvariablen und können hier nicht geändert werden.
                </p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-xl bg-[#f6faf7] px-4 py-3">
                    <p className="text-xs font-semibold text-[#4d685a]">Lookback Days</p>
                    <p className="mt-1 text-lg font-bold text-[#10281e]">{envConfig.lookbackDays}</p>
                    <p className="text-[10px] text-[#8fa89a]">Tage rückwärts bei Studien-Sync</p>
                  </div>
                  <div className="rounded-xl bg-[#f6faf7] px-4 py-3">
                    <p className="text-xs font-semibold text-[#4d685a]">Max Attempts</p>
                    <p className="mt-1 text-lg font-bold text-[#10281e]">{envConfig.maxAttempts}</p>
                    <p className="text-[10px] text-[#8fa89a]">Max. Wiederholungsversuche</p>
                  </div>
                  <div className="rounded-xl bg-[#f6faf7] px-4 py-3">
                    <p className="text-xs font-semibold text-[#4d685a]">Study Limit</p>
                    <p className="mt-1 text-lg font-bold text-[#10281e]">{envConfig.studyLimit}</p>
                    <p className="text-[10px] text-[#8fa89a]">Max. Studien pro Pipeline-Run</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* System Health Info */}
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-[#8fa89a]">
              System-Info
            </h2>
            <div className="rounded-2xl border border-[#d8e8dd] bg-white p-5 shadow-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-start justify-between rounded-xl bg-[#f6faf7] px-4 py-3">
                  <span className="text-xs font-semibold text-[#4d685a]">Framework</span>
                  <span className="text-xs font-mono text-[#10281e]">Next.js</span>
                </div>
                <div className="flex items-start justify-between rounded-xl bg-[#f6faf7] px-4 py-3">
                  <span className="text-xs font-semibold text-[#4d685a]">Auth</span>
                  <span className="text-xs font-mono text-[#10281e]">Supabase Auth</span>
                </div>
                <div className="flex items-start justify-between rounded-xl bg-[#f6faf7] px-4 py-3">
                  <span className="text-xs font-semibold text-[#4d685a]">Datenbank</span>
                  <span className="text-xs font-mono text-[#10281e]">Supabase Postgres</span>
                </div>
                <div className="flex items-start justify-between rounded-xl bg-[#f6faf7] px-4 py-3">
                  <span className="text-xs font-semibold text-[#4d685a]">Zeitstempel</span>
                  <span className="text-xs font-mono text-[#10281e]">
                    {new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin" })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
