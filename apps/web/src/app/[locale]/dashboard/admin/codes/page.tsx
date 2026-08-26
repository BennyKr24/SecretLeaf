"use client";

import { useCallback, useEffect, useState } from "react";
import { ResponsiveTable } from "@/components/ui/ResponsiveTable";
import { useAdminAuth } from "@/lib/useAdminAuth";
import { adminApi } from "@/lib/adminApi";
import { Ticket, Copy, Check } from "lucide-react";

type ProCode = {
  id: string;
  code: string;
  duration_days: number;
  max_redemptions: number;
  redemption_count: number;
  note: string | null;
  expires_at: string | null;
  active: boolean;
  created_at: string;
};

type ListResponse = { codes: ProCode[] };
type CreateResponse = { code: ProCode };

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable — silently ignore, project rule: no alert dialogs.
    }
  };

  return (
    <button
      onClick={() => void handleCopy()}
      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 transition active:scale-90 hover:bg-emerald-100 dark:hover:bg-emerald-950/40"
      title="Code kopieren"
    >
      {copied ? (
        <Check className="h-3 w-3" strokeWidth={2} />
      ) : (
        <Copy className="h-3 w-3" strokeWidth={2} />
      )}
      {copied ? "Kopiert" : "Kopieren"}
    </button>
  );
}

export default function AdminCodesPage() {
  const auth = useAdminAuth();
  const [codes, setCodes] = useState<ProCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Create form
  const [durationDays, setDurationDays] = useState("30");
  const [maxRedemptions, setMaxRedemptions] = useState("1");
  const [note, setNote] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [creating, setCreating] = useState(false);
  const [lastCreated, setLastCreated] = useState<ProCode | null>(null);

  // Inline deactivate confirm
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCodes = useCallback(async () => {
    if (auth.status !== "authenticated") return;
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi<ListResponse>(auth.session, "pro-codes-list");
      setCodes(data.codes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Codes konnten nicht geladen werden");
    } finally {
      setLoading(false);
    }
  }, [auth]);

  useEffect(() => {
    const t = setTimeout(() => {
      void fetchCodes();
    }, 0);
    return () => clearTimeout(t);
  }, [fetchCodes]);

  const handleCreate = async () => {
    if (auth.status !== "authenticated") return;

    const days = Number.parseInt(durationDays, 10);
    const max = Number.parseInt(maxRedemptions, 10);

    if (!Number.isInteger(days) || days < 1 || days > 3650) {
      setError("Dauer muss zwischen 1 und 3650 Tagen liegen.");
      return;
    }
    if (!Number.isInteger(max) || max < 1) {
      setError("Max. Einlösungen muss mindestens 1 sein.");
      return;
    }

    setCreating(true);
    setError(null);
    setSuccess(null);
    try {
      const data = await adminApi<CreateResponse>(auth.session, "pro-codes-create", {
        durationDays: days,
        maxRedemptions: max,
        note: note.trim() || undefined,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      });
      setCodes((prev) => [data.code, ...prev]);
      setLastCreated(data.code);
      setSuccess(`Code ${data.code.code} wurde erstellt.`);
      setNote("");
      setExpiresAt("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Code konnte nicht erstellt werden");
    } finally {
      setCreating(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    if (auth.status !== "authenticated") return;
    setActionLoading(true);
    setError(null);
    try {
      await adminApi(auth.session, "pro-codes-deactivate", { id });
      setSuccess("Code wurde deaktiviert.");
      setConfirmId(null);
      await fetchCodes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Code konnte nicht deaktiviert werden");
    } finally {
      setActionLoading(false);
    }
  };

  if (auth.status !== "authenticated") return null;

  const activeCount = codes.filter((c) => c.active).length;
  const totalRedemptions = codes.reduce((sum, c) => sum + c.redemption_count, 0);

  return (
    <div>
      <div className="mb-7">
        <div className="flex items-center gap-2 text-xs text-muted-fg">
          <span>Admin</span><span>/</span><span className="font-semibold text-muted-fg">Pro-Codes</span>
        </div>
        <div className="mt-1 flex items-center gap-3">
          <Ticket className="h-6 w-6 text-emerald-600" strokeWidth={2} />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Pro-Codes</h1>
            <p className="text-sm text-muted-fg">
              Einlösbare Codes, die Pro-Zugang ohne Bezahlung freischalten — für Trials, Giveaways und Tester.
              Beim Einlösen verlängert ein Code den Pro-Zeitraum des Nutzers um <span className="font-semibold">Dauer (Tage)</span>.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-fg">Codes gesamt</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{codes.length}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-fg">Aktiv</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{activeCount}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-fg">Einlösungen</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{totalRedemptions}</p>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
          <button onClick={() => setError(null)} className="ml-2 font-semibold transition-transform duration-150 active:scale-90 hover:underline">×</button>
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
          {success}
          <button onClick={() => setSuccess(null)} className="ml-2 font-semibold transition-transform duration-150 active:scale-90 hover:underline">×</button>
        </div>
      )}

      {/* Prominent last-created code */}
      {lastCreated && (
        <div className="mb-6 rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-emerald-700 dark:text-emerald-400">Neuer Code</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <code className="rounded-lg bg-card px-3 py-2 font-mono text-lg font-bold text-foreground">{lastCreated.code}</code>
            <CopyButton value={lastCreated.code} />
          </div>
          <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-400">
            {lastCreated.duration_days} Tage Pro · {lastCreated.max_redemptions}× einlösbar
            {lastCreated.expires_at ? ` · gültig bis ${formatDate(lastCreated.expires_at)}` : ""}
          </p>
        </div>
      )}

      {/* Create form */}
      <div className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-fg">Neuen Code generieren</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block">
            <span className="text-sm font-medium text-foreground">Dauer (Tage)</span>
            <input
              type="number"
              min={1}
              max={3650}
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-[var(--ring)]"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-foreground">Max. Einlösungen</span>
            <input
              type="number"
              min={1}
              value={maxRedemptions}
              onChange={(e) => setMaxRedemptions(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-[var(--ring)]"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-foreground">Notiz <span className="text-muted-fg">(optional)</span></span>
            <input
              type="text"
              placeholder="z. B. Beta-Tester Charge 1"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-[var(--ring)]"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-foreground">Code läuft ab am <span className="text-muted-fg">(optional)</span></span>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-[var(--ring)]"
            />
          </label>
        </div>
        <div className="mt-4">
          <button
            onClick={() => void handleCreate()}
            disabled={creating}
            className="rounded-xl bg-emerald-600 dark:bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition active:scale-[0.97] hover:bg-emerald-700 disabled:opacity-50"
          >
            {creating ? "Wird generiert..." : "Code generieren"}
          </button>
        </div>
      </div>

      {/* Codes Table */}
      <div className="min-h-[300px] overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-600 dark:border-emerald-500 border-t-transparent" />
            <span className="text-sm text-muted-fg">Codes werden geladen...</span>
          </div>
        ) : codes.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-muted-fg">Noch keine Codes generiert.</div>
        ) : (
          <ResponsiveTable
            rows={codes}
            rowKey={(c) => c.id}
            cellPadding="px-3 py-3"
            columns={[
              {
                header: "Code",
                isTitle: true,
                tdClassName: "font-medium text-foreground",
                cell: (c) => (
                  <div className="flex items-center gap-2">
                    <code className="font-mono text-sm font-semibold text-foreground">{c.code}</code>
                    <CopyButton value={c.code} />
                  </div>
                ),
              },
              { header: "Dauer", cell: (c) => `${c.duration_days} Tage` },
              {
                header: "Eingelöst",
                cell: (c) => `${c.redemption_count} / ${c.max_redemptions} eingelöst`,
              },
              { header: "Notiz", cell: (c) => c.note ?? "—" },
              { header: "Ablauf", cell: (c) => formatDate(c.expires_at) },
              {
                header: "Status",
                cell: (c) =>
                  c.active ? (
                    <span className="inline-flex rounded-full bg-emerald-100 dark:bg-emerald-950/40 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      Aktiv
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-border px-2.5 py-0.5 text-xs font-semibold text-foreground/70">
                      Inaktiv
                    </span>
                  ),
              },
              {
                header: "Aktionen",
                fullWidthOnMobile: true,
                cell: (c) =>
                  !c.active ? (
                    <span className="text-xs text-muted-fg">—</span>
                  ) : confirmId === c.id ? (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-fg">Sicher?</span>
                      <button
                        onClick={() => void handleDeactivate(c.id)}
                        disabled={actionLoading}
                        className="rounded-lg px-2 py-1 text-xs font-medium text-red-600 transition active:scale-90 hover:bg-red-50 disabled:opacity-50"
                      >
                        {actionLoading ? "..." : "Ja"}
                      </button>
                      <button
                        onClick={() => setConfirmId(null)}
                        className="rounded-lg px-2 py-1 text-xs font-medium text-muted-fg transition active:scale-90 hover:bg-background"
                      >
                        Nein
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmId(c.id)}
                      className="rounded-lg px-2 py-1 text-xs font-medium text-red-600 transition active:scale-90 hover:bg-red-50"
                      title="Code deaktivieren"
                    >
                      Deaktivieren
                    </button>
                  ),
              },
            ]}
          />
        )}
      </div>
    </div>
  );
}
