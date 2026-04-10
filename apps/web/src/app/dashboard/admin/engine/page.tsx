"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminAuth } from "@/lib/useAdminAuth";
import { adminApi } from "@/lib/adminApi";

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

function ActionCard({
  title,
  description,
  buttonLabel,
  buttonColor = "green",
  loading,
  onTrigger,
  children,
}: {
  title: string;
  description: string;
  buttonLabel: string;
  buttonColor?: "green" | "blue" | "amber";
  loading: boolean;
  onTrigger: () => void;
  children?: React.ReactNode;
}) {
  const colors = {
    green: "bg-[#1f7a4f] hover:bg-[#17613f]",
    blue: "bg-blue-600 hover:bg-blue-700",
    amber: "bg-amber-600 hover:bg-amber-700",
  };

  return (
    <div className="rounded-2xl border border-[#d8e8dd] bg-white p-5 shadow-sm">
      <h3 className="font-semibold text-[#10281e]">{title}</h3>
      <p className="mt-1 text-xs text-[#6b8577]">{description}</p>
      {children}
      <button
        onClick={onTrigger}
        disabled={loading}
        className={`mt-4 rounded-xl px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-50 ${colors[buttonColor]}`}
      >
        {loading ? "Wird ausgeführt..." : buttonLabel}
      </button>
    </div>
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
    void fetchLogs();
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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#10281e]">Engine Control</h1>
        <p className="mt-1 text-sm text-[#4d685a]">Pipeline manuell steuern, adaptive Weights triggern, Logs einsehen.</p>
      </div>

      {/* Action Cards */}
      <div className="grid gap-4 lg:grid-cols-3">
        <ActionCard
          title="Pipeline starten"
          description="Startet die vollständige Fetch → Normalize → Dedup → Classify → Score → Store Pipeline."
          buttonLabel={dryRun ? "Dry Run starten" : "Pipeline starten"}
          buttonColor="green"
          loading={triggeringSync}
          onTrigger={() => void triggerAction("engine-trigger", setTriggeringSync, {
            dryRun,
            lookbackDays: Number(lookbackDays) || 3,
            maxProcessed: Number(maxProcessed) || 80,
          })}
        >
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="dryRun" checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} className="rounded" />
              <label htmlFor="dryRun" className="text-xs text-[#4d685a]">Dry Run (kein DB-Write)</label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-[#8fa89a]">Lookback (Tage)</label>
                <input type="number" value={lookbackDays} onChange={(e) => setLookbackDays(e.target.value)} min={1} max={90} className="w-full rounded-lg border border-[#d8e8dd] px-2 py-1 text-xs" />
              </div>
              <div>
                <label className="block text-[10px] text-[#8fa89a]">Max Studies</label>
                <input type="number" value={maxProcessed} onChange={(e) => setMaxProcessed(e.target.value)} min={1} max={1000} className="w-full rounded-lg border border-[#d8e8dd] px-2 py-1 text-xs" />
              </div>
            </div>
          </div>
        </ActionCard>

        <ActionCard
          title="Adaptive Scoring"
          description="Berechnet optimierte Scoring-Weights basierend auf Feedback-Daten (Pearson-Korrelation)."
          buttonLabel="Weights berechnen"
          buttonColor="blue"
          loading={triggeringAdapt}
          onTrigger={() => void triggerAction("engine-adapt", setTriggeringAdapt)}
        />

        <ActionCard
          title="Reprocessing"
          description="Re-klassifiziert und re-scored bestehende Studien mit aktuellen Regeln."
          buttonLabel="Reprocessing starten"
          buttonColor="amber"
          loading={triggeringReprocess}
          onTrigger={() => void triggerAction("engine-reprocess", setTriggeringReprocess)}
        />
      </div>

      {/* Result Panel */}
      {(result || error) && (
        <div className="mt-4">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}
          {result && (
            <div className="rounded-2xl border border-[#d8e8dd] bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#10281e]">Ergebnis</h3>
                <button onClick={() => setResult(null)} className="text-xs text-[#8fa89a] hover:text-[#4d685a]">Schließen</button>
              </div>
              <pre className="mt-2 max-h-64 overflow-auto rounded-xl bg-[#f6faf7] p-3 text-xs text-[#355b49]">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Pipeline Logs */}
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#10281e]">Pipeline Logs</h2>
          <button onClick={() => void fetchLogs()} className="text-xs font-medium text-[#1f7a4f] hover:underline">
            Aktualisieren
          </button>
        </div>

        <div className="min-h-[320px] overflow-hidden rounded-2xl border border-[#d8e8dd] bg-white shadow-sm">
          {loadingLogs ? (
            <div className="flex min-h-[320px] items-center justify-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#1f7a4f] border-t-transparent" />
              <span className="text-sm text-[#4d685a]">Logs werden geladen...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#d8e8dd] bg-[#f6faf7]">
                    <th className="px-4 py-3 font-semibold text-[#4d685a]">Job</th>
                    <th className="px-3 py-3 font-semibold text-[#4d685a]">Status</th>
                    <th className="px-3 py-3 font-semibold text-[#4d685a]">Zeitpunkt</th>
                    <th className="px-3 py-3 font-semibold text-[#4d685a]">Fetched</th>
                    <th className="px-3 py-3 font-semibold text-[#4d685a]">Inserted</th>
                    <th className="px-3 py-3 font-semibold text-[#4d685a]">Updated</th>
                    <th className="px-3 py-3 font-semibold text-[#4d685a]">Fehler</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((run) => (
                    <tr key={run.id} className="border-b border-[#eef3f0] transition hover:bg-[#fbfefc]">
                      <td className="px-4 py-3 font-medium text-[#10281e]">{run.job_name}</td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold ${run.success ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${run.success ? "bg-emerald-500" : "bg-red-500"}`} />
                          {run.success ? "OK" : "Fehler"}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs text-[#6b8577]">{formatDate(run.finished_at)}</td>
                      <td className="px-3 py-3 text-xs font-mono">{run.fetched}</td>
                      <td className="px-3 py-3 text-xs font-mono">{run.inserted}</td>
                      <td className="px-3 py-3 text-xs font-mono">{run.updated}</td>
                      <td className="max-w-[200px] truncate px-3 py-3 text-xs text-red-600" title={run.error_details ?? ""}>
                        {run.error_details ?? "—"}
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-sm text-[#4d685a]">
                        Keine Logs vorhanden.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
