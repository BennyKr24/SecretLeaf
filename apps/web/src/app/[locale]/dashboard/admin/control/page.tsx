"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useAdminAuth } from "@/lib/useAdminAuth";
import { adminFetch } from "@/lib/admin/client";
import type { AdminControl, ControlFlag, DecisionEntry } from "@/lib/admin/contracts";
import { AdminPage, AdminPageSkeleton } from "@/components/admin/AdminPage";
import { Alert } from "@/components/admin/Alert";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CTAButton } from "@/components/ui/CTAButton";
import { SlidersHorizontal, Check, X } from "lucide-react";

function Toggle({ on, disabled, onChange }: { on: boolean; disabled?: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={onChange}
      className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors disabled:opacity-50 ${
        on ? "bg-primary" : "bg-border"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-card shadow transition-transform ${
          on ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

const STATUS_META: Record<DecisionEntry["status"], { label: string; tone: "amber" | "primary" | "muted" }> = {
  open: { label: "offen", tone: "amber" },
  decided: { label: "entschieden", tone: "primary" },
  dropped: { label: "verworfen", tone: "muted" },
};

function DecisionRow({
  entry,
  onPatch,
}: {
  entry: DecisionEntry;
  onPatch: (id: string, patch: { status?: DecisionEntry["status"]; decision?: string }) => Promise<void>;
}) {
  const [deciding, setDeciding] = useState(false);
  const [text, setText] = useState("");
  const meta = STATUS_META[entry.status];

  return (
    <Card padding="sm" className="space-y-2 text-sm">
      <div className="flex items-start justify-between gap-2">
        <span className="font-semibold text-foreground">{entry.title}</span>
        <Badge tone={meta.tone}>{meta.label}</Badge>
      </div>
      {entry.context && <p className="text-xs text-muted-fg">{entry.context}</p>}
      {entry.decision && (
        <p className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground">
          → {entry.decision}
        </p>
      )}
      {entry.status === "open" && (
        <div className="flex flex-wrap items-center gap-2">
          {deciding ? (
            <>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Was wurde entschieden?"
                className="min-w-[200px] flex-1 rounded-lg border border-border bg-background px-2 py-1 text-xs focus:border-primary focus:outline-none"
              />
              <button
                onClick={() => {
                  const patch: { status: "decided"; decision?: string } = { status: "decided" };
                  if (text.trim()) patch.decision = text.trim();
                  void onPatch(entry.id, patch);
                  setDeciding(false);
                }}
                className="rounded-md bg-primary px-2 py-1 text-xs font-semibold text-white"
              >
                Speichern
              </button>
              <button onClick={() => setDeciding(false)} className="rounded-md border border-border px-2 py-1 text-xs">
                Abbrechen
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setDeciding(true)}
                className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium hover:text-foreground"
              >
                <Check className="h-3 w-3" strokeWidth={2} /> Entschieden
              </button>
              <button
                onClick={() => void onPatch(entry.id, { status: "dropped" })}
                className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-fg hover:text-foreground"
              >
                <X className="h-3 w-3" strokeWidth={2} /> Verwerfen
              </button>
            </>
          )}
        </div>
      )}
    </Card>
  );
}

export default function AdminControlPage() {
  const auth = useAdminAuth();
  const [data, setData] = useState<AdminControl | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyFlag, setBusyFlag] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newContext, setNewContext] = useState("");

  const load = useCallback(async () => {
    if (auth.status !== "authenticated") return;
    try {
      setData(await adminFetch<AdminControl>(auth.session, "control"));
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

  const toggleFlag = useCallback(
    async (flag: ControlFlag) => {
      if (auth.status !== "authenticated") return;
      setBusyFlag(flag.key);
      try {
        await adminFetch(auth.session, "control", {
          method: "PATCH",
          json: { key: flag.key, enabled: !flag.enabled },
        });
        await load();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Umschalten fehlgeschlagen");
      } finally {
        setBusyFlag(null);
      }
    },
    [auth, load],
  );

  const addDecision = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (auth.status !== "authenticated" || !newTitle.trim()) return;
      try {
        await adminFetch(auth.session, "control/decisions", {
          json: { title: newTitle.trim(), context: newContext.trim() || undefined },
        });
        setNewTitle("");
        setNewContext("");
        await load();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Anlegen fehlgeschlagen");
      }
    },
    [auth, load, newTitle, newContext],
  );

  const patchDecision = useCallback(
    async (id: string, patch: { status?: DecisionEntry["status"]; decision?: string }) => {
      if (auth.status !== "authenticated") return;
      try {
        await adminFetch(auth.session, "control/decisions", { method: "PATCH", json: { id, ...patch } });
        await load();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ändern fehlgeschlagen");
      }
    },
    [auth, load],
  );

  if (auth.status !== "authenticated") return null;

  const openDecisions = data?.decisions.filter((d) => d.status === "open") ?? [];
  const otherDecisions = data?.decisions.filter((d) => d.status !== "open") ?? [];

  return (
    <AdminPage title="Steuerung" icon={SlidersHorizontal} description="Feature-Flags und Entscheidungs-Log">
      {loading && <AdminPageSkeleton rows={5} />}
      {error && (
        <Alert tone="error" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}

      {data && (
        <div className="space-y-8">
          {/* Feature-Flags */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-fg">Feature-Flags</h2>
            <div className="space-y-2">
              {data.flags.map((flag) => (
                <Card key={flag.key} padding="sm" className="flex items-center gap-3">
                  <Toggle on={flag.enabled} disabled={busyFlag === flag.key} onChange={() => void toggleFlag(flag)} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-semibold text-foreground">{flag.key}</code>
                      {flag.isDefault && <Badge tone="muted">Standard</Badge>}
                    </div>
                    <p className="text-xs text-muted-fg">{flag.description}</p>
                  </div>
                </Card>
              ))}
            </div>
            <p className="text-xs text-muted-fg">
              Wirkt serverseitig innerhalb von ~30 s. Verdrahtet: <code>ai_assistant</code> (KI-Assistent),{" "}
              <code>newsletter</code> (Anmeldung). <code>maintenance_mode</code> ist noch nicht aktiv.
            </p>
          </section>

          {/* Entscheidungs-Log */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-fg">Entscheidungs-Log</h2>

            <Card padding="sm">
              <form onSubmit={addDecision} className="flex flex-wrap items-end gap-2">
                <label className="flex flex-1 flex-col gap-1 text-xs text-muted-fg">
                  Titel
                  <input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Worüber ist noch nicht entschieden?"
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                    required
                  />
                </label>
                <label className="flex flex-[2] flex-col gap-1 text-xs text-muted-fg">
                  Kontext
                  <input
                    value={newContext}
                    onChange={(e) => setNewContext(e.target.value)}
                    placeholder="optional"
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                </label>
                <CTAButton variant="primary" size="sm" type="submit">
                  Hinzufügen
                </CTAButton>
              </form>
            </Card>

            {openDecisions.length === 0 && otherDecisions.length === 0 ? (
              <p className="rounded-xl border border-border bg-card px-4 py-6 text-center text-sm text-muted-fg">
                Noch keine Einträge.
              </p>
            ) : (
              <div className="space-y-2">
                {openDecisions.map((d) => (
                  <DecisionRow key={d.id} entry={d} onPatch={patchDecision} />
                ))}
                {otherDecisions.length > 0 && (
                  <details className="rounded-xl border border-border bg-card">
                    <summary className="cursor-pointer px-4 py-2 text-xs font-medium text-muted-fg">
                      {otherDecisions.length} erledigt / verworfen
                    </summary>
                    <div className="space-y-2 p-2">
                      {otherDecisions.map((d) => (
                        <DecisionRow key={d.id} entry={d} onPatch={patchDecision} />
                      ))}
                    </div>
                  </details>
                )}
              </div>
            )}
          </section>
        </div>
      )}
    </AdminPage>
  );
}
