"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/lib/useAdminAuth";
import { adminApi } from "@/lib/adminApi";

type SettingsData = {
  weights: Record<string, number>;
  config: Record<string, string | undefined>;
};

export default function AdminSettingsPage() {
  const auth = useAdminAuth();
  const [data, setData] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editWeights, setEditWeights] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (auth.status !== "authenticated") return;
    void (async () => {
      try {
        const result = await adminApi<SettingsData>(auth.session, "settings-get");
        setData(result);
        const initial: Record<string, string> = {};
        for (const [k, v] of Object.entries(result.weights)) {
          initial[k] = String(v);
        }
        setEditWeights(initial);
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
    const initial: Record<string, string> = {};
    for (const [k, v] of Object.entries(data.weights)) {
      initial[k] = String(v);
    }
    setEditWeights(initial);
    setSaved(false);
  };

  if (auth.status !== "authenticated") return null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#10281e]">Settings</h1>
        <p className="mt-1 text-sm text-[#4d685a]">Adaptive Scoring Weights anpassen und Umgebungs-Konfiguration einsehen.</p>
      </div>

      {loading && (
        <div className="flex items-center gap-3 rounded-2xl border border-[#d8e8dd] bg-white p-8">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#1f7a4f] border-t-transparent" />
          <span className="text-sm text-[#4d685a]">Einstellungen werden geladen...</span>
        </div>
      )}

      {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>}
      {saved && <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">Weights erfolgreich gespeichert.</div>}

      {data && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Adaptive Weights */}
          <div className="rounded-2xl border border-[#d8e8dd] bg-white p-5 shadow-sm">
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-[0.15em] text-[#8fa89a]">Adaptive Scoring Weights</h2>
            <p className="mb-4 text-xs text-[#6b8577]">Manuell Weights überschreiben. Werden beim nächsten Adapt-Run neu berechnet.</p>

            <div className="space-y-3">
              {Object.keys(editWeights)
                .sort()
                .map((key) => (
                  <div key={key} className="flex items-center gap-3">
                    <label className="w-40 truncate text-sm font-medium text-[#10281e]" title={key}>{key}</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editWeights[key]}
                      onChange={(e) => setEditWeights({ ...editWeights, [key]: e.target.value })}
                      className="flex-1 rounded-xl border border-[#d8e8dd] px-3 py-2 text-sm font-mono outline-none transition focus:border-[#5ca87f] focus:ring-2 focus:ring-[#cfe8d6]"
                    />
                    {data.weights[key] !== undefined && parseFloat(editWeights[key] ?? "") !== data.weights[key] && (
                      <span className="text-[10px] text-amber-600">geändert</span>
                    )}
                  </div>
                ))}
            </div>

            {Object.keys(editWeights).length === 0 && (
              <p className="py-4 text-center text-sm text-[#8fa89a]">Keine Weights gespeichert. Führe zuerst &quot;Adaptive Scoring&quot; aus.</p>
            )}

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => void handleSave()}
                disabled={saving}
                className="rounded-xl bg-[#1f7a4f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#17613f] disabled:opacity-50"
              >
                {saving ? "Speichert..." : "Weights speichern"}
              </button>
              <button
                onClick={handleReset}
                className="rounded-xl border border-[#d8e8dd] px-4 py-2 text-sm font-medium text-[#4d685a] hover:bg-[#f6faf7]"
              >
                Zurücksetzen
              </button>
            </div>
          </div>

          {/* Environment Config */}
          <div className="rounded-2xl border border-[#d8e8dd] bg-white p-5 shadow-sm">
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-[0.15em] text-[#8fa89a]">Umgebungs-Konfiguration</h2>
            <p className="mb-4 text-xs text-[#6b8577]">Nur Lesen. Werte aus Umgebungsvariablen.</p>

            <div className="space-y-2">
              {Object.entries(data.config).map(([key, value]) => (
                <div key={key} className="flex items-start justify-between rounded-xl bg-[#f6faf7] px-3 py-2">
                  <span className="text-xs font-semibold text-[#4d685a]">{key}</span>
                  <span className="max-w-[50%] break-all text-right text-xs font-mono text-[#10281e]">
                    {value ?? <span className="text-amber-500">nicht gesetzt</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
