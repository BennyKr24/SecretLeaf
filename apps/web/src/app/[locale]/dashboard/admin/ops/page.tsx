"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminAuth } from "@/lib/useAdminAuth";
import { adminFetch } from "@/lib/admin/client";
import type { AdminOps, OpsJob } from "@/lib/admin/contracts";
import { AdminPage, AdminPageSkeleton } from "@/components/admin/AdminPage";
import { Alert } from "@/components/admin/Alert";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CalendarClock, Play, RotateCw, CheckCircle2, XCircle, MinusCircle } from "lucide-react";

function rel(iso: string): string {
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "gerade eben";
  if (min < 60) return `vor ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `vor ${h} h`;
  return `vor ${Math.round(h / 24)} T`;
}
function until(iso: string): string {
  const min = Math.round((new Date(iso).getTime() - Date.now()) / 60000);
  if (min < 60) return `in ${Math.max(0, min)} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `in ${h} h`;
  return `in ${Math.round(h / 24)} T`;
}

function JobRow({
  job,
  onRun,
  busy,
}: {
  job: OpsJob;
  onRun: (job: OpsJob, dryRun: boolean) => void;
  busy: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  const ok = job.lastRun?.success ?? false;
  const StateIcon = job.lastRun == null ? MinusCircle : ok ? CheckCircle2 : XCircle;
  const stateClass =
    job.stale || (job.lastRun && !ok) ? "text-rose-500" : job.lastRun == null ? "text-muted-fg" : "text-primary";

  return (
    <Card padding="sm" className="space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <StateIcon className={`h-4 w-4 flex-shrink-0 ${stateClass}`} strokeWidth={2} />
            <span className="font-semibold text-foreground">{job.label}</span>
            {job.stale && <Badge tone="rose">überfällig</Badge>}
          </div>
          <p className="mt-0.5 text-xs text-muted-fg">{job.description}</p>
          <p className="mt-1 text-xs text-muted-fg">
            {job.scheduleLabel}
            {job.nextRunIso && ` · nächster Lauf ${until(job.nextRunIso)}`}
            {job.lastRun && (
              <>
                {" · "}
                letzter {rel(job.lastRun.finishedAt)}
                {job.lastRun.durationSeconds != null && ` (${job.lastRun.durationSeconds}s)`}
              </>
            )}
          </p>
          {job.lastRun?.error && (
            <p className="mt-1 truncate text-xs text-rose-500" title={job.lastRun.error}>
              {job.lastRun.error}
            </p>
          )}
        </div>
        <div className="flex flex-shrink-0 flex-col items-end gap-1">
          {job.successRate30d != null && (
            <span className="text-xs text-muted-fg">
              {Math.round(job.successRate30d * 100)}% ok · {job.runs30d} Läufe/30 T
            </span>
          )}
          {confirming ? (
            <span className="flex items-center gap-1 text-xs">
              wirklich?
              <button
                onClick={() => {
                  setConfirming(false);
                  onRun(job, false);
                }}
                className="rounded-md bg-primary px-2 py-1 font-semibold text-white"
              >
                Ja
              </button>
              <button onClick={() => setConfirming(false)} className="rounded-md border border-border px-2 py-1">
                Nein
              </button>
            </span>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onRun(job, true)}
                disabled={busy}
                className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs font-medium text-muted-fg hover:text-foreground disabled:opacity-50"
                title="Testlauf (kein DB-Schreibvorgang)"
              >
                <RotateCw className="h-3 w-3" strokeWidth={2} /> Test
              </button>
              <button
                onClick={() => setConfirming(true)}
                disabled={busy}
                className="inline-flex items-center gap-1 rounded-lg bg-primary px-2 py-1 text-xs font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
              >
                <Play className="h-3 w-3" strokeWidth={2} /> Ausführen
              </button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function AdminOpsPage() {
  const auth = useAdminAuth();
  const [data, setData] = useState<AdminOps | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyJob, setBusyJob] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  const load = useCallback(async () => {
    if (auth.status !== "authenticated") return;
    try {
      setData(await adminFetch<AdminOps>(auth.session, "ops"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Laden");
    } finally {
      setLoading(false);
    }
  }, [auth]);

  useEffect(() => {
    // async wrapper so the setState calls in load() land after the effect
    // body returns (react-hooks/set-state-in-effect)
    void (async () => {
      await load();
    })();
  }, [load]);

  const runJob = useCallback(
    async (job: OpsJob, dryRun: boolean) => {
      if (auth.status !== "authenticated") return;
      setBusyJob(job.jobName);
      setNotice(null);
      try {
        await adminFetch(auth.session, "ops/run", { json: { job: job.jobName, dryRun } });
        setNotice({
          tone: "success",
          text: `„${job.label}" ${dryRun ? "als Testlauf " : ""}ausgeführt.`,
        });
        await load();
      } catch (err) {
        setNotice({ tone: "error", text: err instanceof Error ? err.message : "Ausführung fehlgeschlagen" });
      } finally {
        setBusyJob(null);
      }
    },
    [auth, load],
  );

  if (auth.status !== "authenticated") return null;

  return (
    <AdminPage
      title="Betrieb"
      icon={CalendarClock}
      description="Automatisierung, Läufe und Integrationen"
    >
      {loading && <AdminPageSkeleton rows={5} />}
      {error && (
        <Alert tone="error" title="Betrieb konnte nicht geladen werden">
          {error}
        </Alert>
      )}
      {notice && (
        <Alert tone={notice.tone} onDismiss={() => setNotice(null)}>
          {notice.text}
        </Alert>
      )}

      {data && (
        <div className="space-y-8">
          {/* Jobs */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-fg">Cron-Jobs</h2>
            <div className="space-y-2">
              {data.jobs.map((job) => (
                <JobRow key={job.jobName} job={job} onRun={runJob} busy={busyJob === job.jobName} />
              ))}
            </div>
          </section>

          {/* Retry-Backoff */}
          {data.errorMemory.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-fg">
                Steckt im Retry-Backoff
              </h2>
              <div className="space-y-2">
                {data.errorMemory.map((m) => (
                  <Card key={`${m.jobName}-${m.fingerprint}`} padding="sm" className="text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-foreground">{m.jobName}</span>
                      <Badge tone="rose">{m.failCount}× fehlgeschlagen</Badge>
                    </div>
                    {m.lastError && <p className="mt-1 text-xs text-rose-500">{m.lastError}</p>}
                    <p className="mt-1 text-xs text-muted-fg">
                      seit {rel(m.firstFailedAt)} · zuletzt {rel(m.lastFailedAt)}
                      {m.nextRetryAt && ` · nächster Versuch ${until(m.nextRetryAt)}`}
                    </p>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Integrationen */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-fg">Integrationen</h2>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {data.integrations.map((it) => (
                <Card key={it.key} padding="sm" className="flex items-start gap-2 text-sm">
                  {it.configured ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" strokeWidth={2} />
                  ) : (
                    <MinusCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-fg" strokeWidth={2} />
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{it.label}</p>
                    <p className="text-xs text-muted-fg">
                      {it.configured ? "konfiguriert" : "fehlt"} · {it.note}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* Letzte Läufe */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-fg">
                Letzte Läufe
              </h2>
              <button onClick={() => void load()} className="text-xs font-medium text-primary hover:underline">
                Aktualisieren
              </button>
            </div>
            {data.recentRuns.length === 0 ? (
              <p className="rounded-xl border border-border bg-card px-4 py-6 text-center text-sm text-muted-fg">
                Noch keine Läufe erfasst.
              </p>
            ) : (
              <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
                {data.recentRuns.map((r, i) => (
                  <li key={i} className="flex items-center gap-3 bg-card px-3 py-2 text-sm">
                    <span
                      className={`h-2 w-2 flex-shrink-0 rounded-full ${r.success ? "bg-primary" : "bg-rose-500"}`}
                    />
                    <span className="w-40 flex-shrink-0 truncate font-medium text-foreground">{r.jobName}</span>
                    <span className="flex-shrink-0 text-xs text-muted-fg">{rel(r.finishedAt)}</span>
                    {r.durationSeconds != null && (
                      <span className="flex-shrink-0 text-xs text-muted-fg">{r.durationSeconds}s</span>
                    )}
                    <span className="min-w-0 flex-1 truncate text-xs text-muted-fg">
                      {r.error
                        ? r.error
                        : `${r.fetched} geladen · ${r.inserted} neu · ${r.updated} akt. · ${r.skipped} übersprungen`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </AdminPage>
  );
}
