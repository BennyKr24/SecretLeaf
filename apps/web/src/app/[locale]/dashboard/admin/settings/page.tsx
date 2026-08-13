"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/lib/useAdminAuth";
import { adminApi } from "@/lib/adminApi";
import { Wrench } from "lucide-react";

type SettingsData = {
  weights: Record<string, number>;
  config: Record<string, string | undefined>;
  adaptiveWeights: {
    weights: Record<string, number>;
    reason: string;
    based_on_studies: number;
    computed_at: string;
  } | null;
  envConfig: {
    lookbackDays: number;
    maxAttempts: number;
    studyLimit: number;
  };
};

export default function AdminSettingsPage() {
  const auth = useAdminAuth();
  const [data, setData] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editWeights, setEditWeights] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Pipeline defaults
  const [pipelineLookback, setPipelineLookback] = useState("3");
  const [pipelineMaxStudies, setPipelineMaxStudies] = useState("80");
  const [pipelineDryRun, setPipelineDryRun] = useState(false);

  useEffect(() => {
    if (auth.status !== "authenticated") return;
    void (async () => {
      try {
        const result = await adminApi<SettingsData>(auth.session, "settings-get");
        setData(result);
        const weights = result.adaptiveWeights?.weights ?? result.weights ?? {};
        const initial: Record<string, string> = {};
        for (const [k, v] of Object.entries(weights)) {
          initial[k] = String(v);
        }
        setEditWeights(initial);
        if (result.envConfig) {
          setPipelineLookback(String(result.envConfig.lookbackDays));
          setPipelineMaxStudies(String(result.envConfig.studyLimit));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Fehler beim Laden");
      } finally {
        setLoading(false);
      }
    })();
  }, [auth]);

  const handleSave = async () => {
    if (auth.status !== "authenticated") return;
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const parsed: Record<string, number> = {};
      for (const [k, v] of Object.entries(editWeights)) {
        const num = parseFloat(v ?? "");
        if (isNaN(num)) {
          setError(`Ungültiger Wert für "${k}": ${v}`);
          setSaving(false);
          return;
        }
        parsed[k] = num;
      }
      await adminApi(auth.session, "settings-update", { weights: parsed });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Speichern fehlgeschlagen");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!data) return;
    const weights = data.adaptiveWeights?.weights ?? data.weights ?? {};
    const initial: Record<string, string> = {};
    for (const [k, v] of Object.entries(weights)) {
      initial[k] = String(v);
    }
    setEditWeights(initial);
    setSaved(false);
  };

  if (auth.status !== "authenticated") return null;

  return (
    <div>
      <div className="mb-7">
        <div className="flex items-center gap-2 text-xs text-muted-fg">
          <span>Admin</span><span>/</span><span className="font-semibold text-muted-fg">Einstellungen</span>
        </div>
        <div className="mt-1 flex items-center gap-3">
          <Wrench className="h-6 w-6 text-emerald-600" strokeWidth={2} />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Einstellungen</h1>
            <p className="text-sm text-muted-fg">Scoring Weights, Pipeline-Defaults und Systemeinstellungen konfigurieren.</p>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-8">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-600 dark:border-emerald-500 border-t-transparent" />
          <span className="text-sm text-muted-fg">Einstellungen werden geladen...</span>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
          <button onClick={() => setError(null)} className="ml-2 font-semibold hover:underline">×</button>
        </div>
      )}
      {saved && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
          Weights erfolgreich gespeichert.
          <button onClick={() => setSaved(false)} className="ml-2 font-semibold hover:underline">×</button>
        </div>
      )}

      {data && (
        <div className="space-y-6">
          {/* Adaptive Weights */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted-fg">Adaptive Bewertungsgewichtungen</h2>
                <p className="mt-1 text-xs text-muted-fg">
                  Gewichtungen manuell überschreiben. Werden beim nächsten Anpassungsdurchlauf neu berechnet.
                </p>
              </div>
              {data.adaptiveWeights && (
                <div className="text-right text-[10px] text-muted-fg">
                  <p>Letztes Update: {new Date(data.adaptiveWeights.computed_at).toLocaleDateString("de-DE")}</p>
                  <p>Basis: {data.adaptiveWeights.based_on_studies} Studien</p>
                  <p className="max-w-[200px] truncate" title={data.adaptiveWeights.reason}>{data.adaptiveWeights.reason}</p>
                </div>
              )}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {Object.keys(editWeights)
                .sort()
                .map((key) => (
                  <div key={key} className="flex items-center gap-3">
                    <label className="w-40 truncate text-sm font-medium text-foreground" title={key}>{key}</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editWeights[key]}
                      onChange={(e) => setEditWeights({ ...editWeights, [key]: e.target.value })}
                      className="flex-1 rounded-xl border border-border px-3 py-2 text-sm font-mono outline-none transition focus:border-emerald-400 dark:border-emerald-600 focus:ring-2 focus:ring-[#cfe8d6]"
                    />
                    {data.adaptiveWeights?.weights[key] !== undefined &&
                      parseFloat(editWeights[key] ?? "") !== data.adaptiveWeights.weights[key] && (
                        <span className="text-[10px] text-amber-600">geändert</span>
                      )}
                  </div>
                ))}
            </div>

            {Object.keys(editWeights).length === 0 && (
              <p className="py-4 text-center text-sm text-muted-fg">Keine Weights gespeichert. Führe zuerst &quot;Adaptive Scoring&quot; aus.</p>
            )}

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => void handleSave()}
                disabled={saving}
                className="rounded-xl bg-emerald-600 dark:bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {saving ? "Speichert..." : "Gewichtungen speichern"}
              </button>
              <button
                onClick={handleReset}
                className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-fg hover:bg-background"
              >
                Zurücksetzen
              </button>
            </div>
          </div>

          {/* Pipeline Defaults */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted-fg">Pipeline-Standardwerte</h2>
            <p className="mt-1 mb-4 text-xs text-muted-fg">
              Standard-Parameter für Pipeline-Runs. Diese Werte werden auf der Engine-Seite als Voreinstellung verwendet.
            </p>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-muted-fg">Lookback (Tage)</label>
                <input
                  type="number"
                  value={pipelineLookback}
                  onChange={(e) => setPipelineLookback(e.target.value)}
                  min={1}
                  max={90}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm outline-none transition focus:border-emerald-400 dark:border-emerald-600 focus:ring-2 focus:ring-[#cfe8d6]"
                />
                <p className="mt-1 text-[10px] text-muted-fg">Wie viele Tage rückwärts beim Sync berücksichtigt</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-fg">Max. Studien pro Run</label>
                <input
                  type="number"
                  value={pipelineMaxStudies}
                  onChange={(e) => setPipelineMaxStudies(e.target.value)}
                  min={1}
                  max={1000}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm outline-none transition focus:border-emerald-400 dark:border-emerald-600 focus:ring-2 focus:ring-[#cfe8d6]"
                />
                <p className="mt-1 text-[10px] text-muted-fg">Maximale Anzahl Studien pro Pipeline-Run</p>
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pipelineDryRun}
                    onChange={(e) => setPipelineDryRun(e.target.checked)}
                    className="rounded accent-[#1f7a4f]"
                  />
                  <span className="text-sm text-muted-fg">Dry Run als Default</span>
                </label>
              </div>
            </div>
            <p className="mt-3 text-[10px] text-muted-fg">
              Hinweis: Pipeline Defaults werden lokal im Browser gespeichert und nicht an den Server übertragen.
            </p>
          </div>

          {/* Environment Config (Read Only) */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted-fg">Umgebungs-Konfiguration</h2>
            <p className="mt-1 mb-4 text-xs text-muted-fg">Nur Lesen. Werte aus Umgebungsvariablen des Servers.</p>

            <div className="grid gap-2 sm:grid-cols-2">
              {Object.entries(data.config ?? {}).map(([key, value]) => (
                <div key={key} className="flex items-start justify-between rounded-xl bg-background px-3 py-2">
                  <span className="text-xs font-semibold text-muted-fg">{key}</span>
                  <span className="max-w-[50%] break-all text-right text-xs font-mono text-foreground">
                    {value ?? <span className="text-amber-500">nicht gesetzt</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="rounded-2xl border border-red-200 bg-card p-5 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-red-500">Gefahrenzone</h2>
            <p className="mt-1 mb-4 text-xs text-muted-fg">
              Vorsicht: Diese Aktionen können nicht rückgängig gemacht werden.
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-red-100 bg-red-50/50 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">Alle Weights zurücksetzen</p>
                  <p className="text-xs text-muted-fg">Alle manuellen Scoring-Weights löschen und auf System-Defaults zurücksetzen.</p>
                </div>
                <button
                  onClick={() => {
                    setEditWeights({});
                    void handleSave();
                  }}
                  className="shrink-0 rounded-xl border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                >
                  Zurücksetzen
                </button>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-red-100 bg-red-50/50 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">Pipeline Cache leeren</p>
                  <p className="text-xs text-muted-fg">Erzwingt vollständige Neuberechnung beim nächsten Pipeline-Run.</p>
                </div>
                <button
                  onClick={() => void adminApi(auth.session, "engine-reprocess").then(() => setSaved(true))}
                  className="shrink-0 rounded-xl border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                >
                  Cache leeren
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
