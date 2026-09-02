"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useAdminAuth } from "@/lib/useAdminAuth";
import { adminFetch } from "@/lib/admin/client";
import type { AdminProCodesResponse, ProCode } from "@/lib/admin/contracts";
import { AdminPage, AdminPageSkeleton } from "@/components/admin/AdminPage";
import { Alert } from "@/components/admin/Alert";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CTAButton } from "@/components/ui/CTAButton";
import { Ticket, Copy, Check } from "lucide-react";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard API unavailable — silently ignore, code is still visible to select/copy manually
    }
  };
  return (
    <button
      onClick={() => void copy()}
      className="rounded-md p-1 text-muted-fg hover:text-foreground"
      title="Code kopieren"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-primary" strokeWidth={2} /> : <Copy className="h-3.5 w-3.5" strokeWidth={2} />}
    </button>
  );
}

function CreateForm({ onCreated }: { onCreated: () => void }) {
  const auth = useAdminAuth();
  const [durationDays, setDurationDays] = useState("30");
  const [maxRedemptions, setMaxRedemptions] = useState("1");
  const [note, setNote] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (auth.status !== "authenticated") return;
    setBusy(true);
    setErr(null);
    try {
      await adminFetch(auth.session, "pro-codes", {
        json: {
          durationDays: Number(durationDays),
          maxRedemptions: Number(maxRedemptions),
          note: note.trim() || undefined,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        },
      });
      setNote("");
      onCreated();
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Erstellen fehlgeschlagen");
    } finally {
      setBusy(false);
    }
  };

  const field =
    "rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none";

  return (
    <Card padding="sm" className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Code generieren</h3>
      <form onSubmit={submit} className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1 text-xs text-muted-fg">
          Dauer (Tage)
          <input
            type="number"
            min={1}
            max={3650}
            value={durationDays}
            onChange={(e) => setDurationDays(e.target.value)}
            className={`${field} w-24`}
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-fg">
          Max. Einlösungen
          <input
            type="number"
            min={1}
            value={maxRedemptions}
            onChange={(e) => setMaxRedemptions(e.target.value)}
            className={`${field} w-28`}
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-fg">
          Ablauf (optional)
          <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className={field} />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-xs text-muted-fg">
          Notiz
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className={field}
            placeholder="z. B. Beta-Tester Batch 1"
          />
        </label>
        <CTAButton variant="primary" size="sm" type="submit" disabled={busy}>
          Generieren
        </CTAButton>
      </form>
      {err && (
        <Alert tone="error" onDismiss={() => setErr(null)}>
          {err}
        </Alert>
      )}
    </Card>
  );
}

export default function AdminProCodesPage() {
  const auth = useAdminAuth();
  const [data, setData] = useState<AdminProCodesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (auth.status !== "authenticated") return;
    try {
      setData(await adminFetch<AdminProCodesResponse>(auth.session, "pro-codes"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Laden");
    } finally {
      setLoading(false);
    }
  }, [auth]);

  useEffect(() => {
    void (async () => {
      await load();
    })();
  }, [load]);

  const toggleActive = async (code: ProCode) => {
    if (auth.status !== "authenticated") return;
    setBusyId(code.id);
    try {
      await adminFetch(auth.session, `pro-codes/${code.id}`, { method: "PATCH", json: { active: !code.active } });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ändern fehlgeschlagen");
    } finally {
      setBusyId(null);
    }
  };

  if (auth.status !== "authenticated") return null;

  return (
    <AdminPage
      title="Pro-Codes"
      icon={Ticket}
      description="Einlösbare Codes für Pro-Zugang außerhalb von Stripe (Trial/Code-Interim)"
    >
      {loading && <AdminPageSkeleton rows={4} />}
      {error && (
        <Alert tone="error" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}

      {data && (
        <div className="space-y-6">
          <CreateForm onCreated={() => void load()} />

          <div className="space-y-2">
            {data.codes.map((c) => (
              <Card key={c.id} padding="sm" className="flex flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <code className="text-sm font-semibold text-foreground">{c.code}</code>
                    <CopyButton value={c.code} />
                    {!c.active && <Badge tone="muted">deaktiviert</Badge>}
                    {c.expiresAt && new Date(c.expiresAt) < new Date() && <Badge tone="amber">abgelaufen</Badge>}
                    {c.redemptionCount >= c.maxRedemptions && <Badge tone="rose">ausgeschöpft</Badge>}
                  </div>
                  <p className="text-xs text-muted-fg">
                    {c.durationDays} Tage · {c.redemptionCount}/{c.maxRedemptions} eingelöst
                    {c.expiresAt && ` · Ablauf ${formatDate(c.expiresAt)}`}
                    {c.note && ` · ${c.note}`}
                  </p>
                </div>
                <button
                  onClick={() => void toggleActive(c)}
                  disabled={busyId === c.id}
                  className="flex-shrink-0 rounded-lg border border-border px-2 py-1 text-xs font-medium text-muted-fg hover:text-foreground disabled:opacity-50"
                >
                  {c.active ? "Deaktivieren" : "Aktivieren"}
                </button>
              </Card>
            ))}
            {data.codes.length === 0 && (
              <p className="rounded-xl border border-border bg-card px-4 py-6 text-center text-sm text-muted-fg">
                Noch keine Codes.
              </p>
            )}
          </div>
        </div>
      )}
    </AdminPage>
  );
}
