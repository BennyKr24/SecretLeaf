"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminAuth } from "@/lib/useAdminAuth";
import { adminApi } from "@/lib/adminApi";
import { Card } from "@/components/ui/Card";
import { CTAButton } from "@/components/ui/CTAButton";
import { ResponsiveTable } from "@/components/ui/ResponsiveTable";
import { Settings } from "lucide-react";

type RunLog = {
  id: string;
  job_name: string;
  started_at: string;
  finished_at: string;
  success: boolean;
  fetched: number;
  inserted: number;
  updated: number;
  skipped: number;
  error_details: string | null;
  metadata: Record<string, unknown> | null;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit",
  });
}

type ResultStat = { label: string; value: string | number };

// Pull a friendly stat row out of whichever action produced this result —
// engine-trigger (metrics.*), engine-reprocess (top-level), engine-adapt
// (adjustment.*) all have different shapes, so this stays permissive.
function extractStats(result: Record<string, unknown>): ResultStat[] {
  const stats: ResultStat[] = [];
  const metrics = (result.metrics ?? result) as Record<string, unknown>;
  const numericKeys: Array<[string, string]> = [
    ["fetched", "Fetched"],
    ["accepted", "Akzeptiert"],
    ["rejected", "Abgelehnt"],
    ["inserted", "Inserted"],
    ["updated", "Updated"],
    ["skipped", "Skipped"],
    ["processed", "Verarbeitet"],
    ["upgraded", "Hochgestuft"],
    ["downgraded", "Runtergestuft"],
    ["unchanged", "Unverändert"],
  ];
  for (const [key, label] of numericKeys) {
    if (typeof metrics[key] === "number") stats.push({ label, value: metrics[key] as number });
  }
  const adjustment = result.adjustment as Record<string, unknown> | undefined;
  if (adjustment && typeof adjustment.basedOnStudies === "number") {
    stats.push({ label: "Basis-Studien", value: adjustment.basedOnStudies as number });
  }
  if (typeof result.appliedToEngineConfig === "boolean") {
    stats.push({ label: "Übernommen", value: result.appliedToEngineConfig ? "Ja" : "Nein" });
  }
  return stats;
}

function ActionCard({
  title,
  description,
  buttonLabel,
  variant = "primary",
  loading,
  onTrigger,
  children,
}: {
  title: string;
  description: string;
  buttonLabel: string;
  variant?: "primary" | "secondary";
  loading: boolean;
  onTrigger: () => void;
  children?: React.ReactNode;
}) {
  return (
    <Card padding="md">
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-xs text-muted-fg">{description}</p>
      {children}
      <CTAButton variant={variant} onClick={onTrigger} disabled={loading} className="mt-4">
        {loading ? "Wird ausgeführt..." : buttonLabel}
      </CTAButton>
    </Card>
  );
}

export default function AdminEnginePage() {
  const auth = useAdminAuth();
  const [logs, setLogs] = useState<RunLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Trigger states
  const [triggeringSync, setTriggeringSync] = useState(false);
  const [triggeringAdapt, setTriggeringAdapt] = useState(false);
  const [triggeringReprocess, setTriggeringReprocess] = useState(false);

  // Sync options
  const [dryRun, setDryRun] = useState(false);
  const [lookbackDays, setLookbackDays] = useState("3");
  const [maxProcessed, setMaxProcessed] = useState("80");

  const fetchLogs = useCallback(async () => {
    if (auth.status !== "authenticated") return;
    setLoadingLogs(true);
    try {
      const data = await adminApi<{ runs: RunLog[] }>(auth.session, "engine-logs", { limit: 20 });
      setLogs(data.runs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Logs konnten nicht geladen werden");
    } finally {
      setLoadingLogs(false);
    }
  }, [auth]);

  useEffect(() => {
    const t = setTimeout(() => {
      void fetchLogs();
    }, 0);
    return () => clearTimeout(t);
  }, [fetchLogs]);

  const triggerAction = async (
    action: string,
    setter: (v: boolean) => void,
    params?: Record<string, unknown>,
  ) => {
    if (auth.status !== "authenticated") return;
    setter(true);
    setResult(null);
    setError(null);
    try {
      const data = await adminApi<Record<string, unknown>>(auth.session, action, params);
      setResult(data);
      await fetchLogs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Aktion fehlgeschlagen");
    } finally {
      setter(false);
    }
  };

  if (auth.status !== "authenticated") return null;

  const stats = result ? extractStats(result) : [];

  return (
    <div>
      <div className="mb-7">
        <div className="flex items-center gap-2 text-xs text-muted-fg">
          <span>Admin</span><span>/</span><span className="font-semibold text-muted-fg">Engine</span>
        </div>
        <div className="mt-1 flex items-center gap-3">
          <Settings className="h-6 w-6 text-primary" strokeWidth={2} />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Engine Control</h1>
            <p className="text-sm text-muted-fg">Pipeline manuell steuern, adaptive Weights triggern, Logs einsehen.</p>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid gap-4 lg:grid-cols-3">
        <ActionCard
          title="Pipeline starten"
          description="Startet die vollständige Fetch → Normalize → Dedup → Classify → Score → Store Pipeline."
          buttonLabel={dryRun ? "Testlauf starten" : "Pipeline starten"}
          variant="primary"
          loading={triggeringSync}
          onTrigger={() => void triggerAction("engine-trigger", setTriggeringSync, {
            dryRun,
            lookbackDays: Number(lookbackDays) || 3,
            maxProcessed: Number(maxProcessed) || 80,
          })}
        >
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="dryRun" checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} className="accent-primary rounded" />
              <label htmlFor="dryRun" className="text-xs text-muted-fg">Testlauf (kein DB-Schreibvorgang)</label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-muted-fg">Lookback (Tage)</label>
                <input type="number" value={lookbackDays} onChange={(e) => setLookbackDays(e.target.value)} min={1} max={90} className="w-full rounded-lg border border-border bg-card px-2 py-1 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-[var(--ring)]" />
              </div>
              <div>
                <label className="block text-[10px] text-muted-fg">Max Studies</label>
                <input type="number" value={maxProcessed} onChange={(e) => setMaxProcessed(e.target.value)} min={1} max={1000} className="w-full rounded-lg border border-border bg-card px-2 py-1 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-[var(--ring)]" />
              </div>
            </div>
          </div>
        </ActionCard>

        <ActionCard
          title="Adaptive Scoring"
          description="Berechnet optimierte Bewertungsgewichtungen aus Feedback-Daten (Pearson-Korrelation) und übernimmt sie automatisch in die aktive Scoring-Konfiguration."
          buttonLabel="Gewichtungen berechnen"
          variant="secondary"
          loading={triggeringAdapt}
          onTrigger={() => void triggerAction("engine-adapt", setTriggeringAdapt)}
        />

        <ActionCard
          title="Neuverarbeitung"
          description="Klassifiziert und bewertet bestehende Studien erneut mit aktuellen Regeln."
          buttonLabel="Neuverarbeitung starten"
          variant="secondary"
          loading={triggeringReprocess}
          onTrigger={() => void triggerAction("engine-reprocess", setTriggeringReprocess)}
        />
      </div>

      {/* Result Panel */}
      {(result || error) && (
        <div className="mt-4">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
              {error}
            </div>
          )}
          {result && (
            <Card padding="md" className="tool-pop">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Ergebnis</h3>
                <button onClick={() => setResult(null)} className="text-xs text-muted-fg hover:text-foreground">Schließen</button>
              </div>
              {stats.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {stats.map((s) => (
                    <div key={s.label} className="rounded-xl border border-border bg-background px-3 py-2 text-center">
                      <p className="text-lg font-bold text-foreground">{s.value}</p>
                      <p className="text-[10px] uppercase tracking-wide text-muted-fg">{s.label}</p>
                    </div>
                  ))}
                </div>
              )}
              <details className="mt-3">
                <summary className="cursor-pointer text-xs text-muted-fg hover:text-foreground">
                  Rohdaten anzeigen
                </summary>
                <pre className="mt-2 max-h-64 overflow-auto rounded-xl bg-background p-3 text-xs text-foreground/80">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </details>
            </Card>
          )}
        </div>
      )}

      {/* Pipeline Logs */}
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Pipeline Logs</h2>
          <button onClick={() => void fetchLogs()} className="text-xs font-medium text-primary hover:underline">
            Aktualisieren
          </button>
        </div>

        <div className="min-h-[320px] overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          {loadingLogs ? (
            <div className="flex min-h-[320px] items-center justify-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="text-sm text-muted-fg">Logs werden geladen...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-muted-fg">Keine Logs vorhanden.</div>
          ) : (
            <ResponsiveTable
              rows={logs}
              rowKey={(run) => run.id}
              cellPadding="px-3 py-3"
              columns={[
                { header: "Job", isTitle: true, tdClassName: "font-medium text-foreground", cell: (run) => run.job_name },
                {
                  header: "Status",
                  cell: (run) => (
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold ${run.success ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" : "bg-rose-500/15 text-rose-700 dark:text-rose-400"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${run.success ? "bg-emerald-500" : "bg-rose-500"}`} />
                      {run.success ? "OK" : "Fehler"}
                    </span>
                  ),
                },
                { header: "Zeitpunkt", cell: (run) => formatDate(run.finished_at) },
                { header: "Fetched", tdClassName: "font-mono text-foreground/80", cell: (run) => run.fetched },
                { header: "Inserted", tdClassName: "font-mono text-foreground/80", cell: (run) => run.inserted },
                { header: "Updated", tdClassName: "font-mono text-foreground/80", cell: (run) => run.updated },
                {
                  header: "Fehler",
                  tdClassName: "max-w-[200px] truncate text-rose-600 dark:text-rose-400",
                  cell: (run) => <span title={run.error_details ?? ""}>{run.error_details ?? "—"}</span>,
                },
              ]}
            />
          )}
        </div>
      </div>
    </div>
  );
}
