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
    default: "border-border",
    green: "border-emerald-200",
    blue: "border-blue-200",
    purple: "border-purple-200",
    amber: "border-amber-200",
  };

  return (
    <div className={`rounded-2xl border bg-card p-5 shadow-sm ${colors[color]}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-fg">{label}</p>
      <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
      {description && <p className="mt-1 text-xs text-muted-fg">{description}</p>}
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
        <div className="flex items-center gap-2 text-xs text-muted-fg">
          <span>Admin</span><span>/</span><span className="font-semibold text-muted-fg">System</span>
        </div>
        <div className="mt-1 flex items-center gap-3">
          <span className="text-2xl">🖥️</span>
          <div>
            <h1 className="text-2xl font-bold text-foreground">System</h1>
            <p className="text-sm text-muted-fg">Systemstatistiken, Benutzer-Metriken und Konfiguration im Überblick.</p>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-8">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-600 dark:border-emerald-500 border-t-transparent" />
          <span className="text-sm text-muted-fg">System-Daten werden geladen...</span>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
      )}

      {stats && (
        <>
          {/* User Distribution */}
          <div className="mb-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-muted-fg">
              Benutzer nach Rolle
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Registrierte Benutzer"
                value={stats.totalAuthUsers}
                description="Alle registrierten Benutzerkonten"
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
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-muted-fg">
              Plattform-Metriken
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard label="Studien gesamt" value={stats.totalStudies} />
              <StatCard
                label="Durchläufe (24h)"
                value={stats.automationRunsLast24h}
                description="Pipeline-Durchläufe der letzten 24 Stunden"
              />
              <StatCard
                label="Feedback-Ereignisse"
                value={stats.totalFeedbackEvents}
                description="Gesamtzahl aller Nutzerbewertungen"
              />
            </div>
          </div>

          {/* Environment Configuration */}
          {envConfig && (
            <div className="mb-6">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-muted-fg">
                Umgebungs-Konfiguration
              </h2>
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <p className="mb-4 text-xs text-muted-fg">
                  Nur Lesen. Diese Werte stammen aus Umgebungsvariablen und können hier nicht geändert werden.
                </p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-xl bg-background px-4 py-3">
                    <p className="text-xs font-semibold text-muted-fg">Lookback Days</p>
                    <p className="mt-1 text-lg font-bold text-foreground">{envConfig.lookbackDays}</p>
                    <p className="text-[10px] text-muted-fg">Tage rückwärts bei Studien-Sync</p>
                  </div>
                  <div className="rounded-xl bg-background px-4 py-3">
                    <p className="text-xs font-semibold text-muted-fg">Max Attempts</p>
                    <p className="mt-1 text-lg font-bold text-foreground">{envConfig.maxAttempts}</p>
                    <p className="text-[10px] text-muted-fg">Max. Wiederholungsversuche</p>
                  </div>
                  <div className="rounded-xl bg-background px-4 py-3">
                    <p className="text-xs font-semibold text-muted-fg">Study Limit</p>
                    <p className="mt-1 text-lg font-bold text-foreground">{envConfig.studyLimit}</p>
                    <p className="text-[10px] text-muted-fg">Max. Studien pro Pipeline-Run</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* System Health Info */}
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-muted-fg">
              System-Info
            </h2>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-start justify-between rounded-xl bg-background px-4 py-3">
                  <span className="text-xs font-semibold text-muted-fg">Framework</span>
                  <span className="text-xs font-mono text-foreground">Next.js</span>
                </div>
                <div className="flex items-start justify-between rounded-xl bg-background px-4 py-3">
                  <span className="text-xs font-semibold text-muted-fg">Auth</span>
                  <span className="text-xs font-mono text-foreground">Supabase Auth</span>
                </div>
                <div className="flex items-start justify-between rounded-xl bg-background px-4 py-3">
                  <span className="text-xs font-semibold text-muted-fg">Datenbank</span>
                  <span className="text-xs font-mono text-foreground">Supabase Postgres</span>
                </div>
                <div className="flex items-start justify-between rounded-xl bg-background px-4 py-3">
                  <span className="text-xs font-semibold text-muted-fg">Zeitstempel</span>
                  <span className="text-xs font-mono text-foreground">
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
