// ────────────────────────────────────────────────────────────────────────────
// Admin primitive — RunHistory
//
// Renders a list of automation/cron runs. `compact` (used on the Lage
// briefing) shows one row per job with its last run; the full variant (Betrieb
// page) will add an expandable per-run detail — kept minimal for now
// (docs/ADMIN_PANEL_OVERHAUL_PLAN.md §4.1 / §4.6).
// ────────────────────────────────────────────────────────────────────────────

import type { BriefingRun } from "@/lib/admin/contracts";
import { Badge } from "@/components/ui/Badge";

function relTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.round(diffMs / 60000);
  if (min < 1) return "gerade eben";
  if (min < 60) return `vor ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `vor ${h} h`;
  const d = Math.round(h / 24);
  return `vor ${d} T`;
}

export function RunHistory({ runs }: { runs: BriefingRun[] }) {
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
      {runs.map((run) => {
        const ok = run.lastRun?.success ?? false;
        const dotClass = run.stale
          ? "bg-rose-500"
          : run.lastRun == null
            ? "bg-muted-fg/40"
            : ok
              ? "bg-primary"
              : "bg-rose-500";

        return (
          <li key={run.jobName} className="flex items-center gap-3 bg-card px-3 py-2.5 text-sm">
            <span className={`h-2 w-2 flex-shrink-0 rounded-full ${dotClass}`} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-medium text-foreground">{run.label}</span>
                {run.stale && <Badge tone="rose">überfällig</Badge>}
              </div>
              <p className="truncate text-xs text-muted-fg">
                {run.scheduleLabel}
                {run.lastRun && (
                  <>
                    {" · "}
                    {relTime(run.lastRun.finishedAt)}
                    {run.lastRun.durationSeconds != null && ` · ${run.lastRun.durationSeconds}s`}
                  </>
                )}
                {!run.lastRun && " · noch kein Lauf erfasst"}
              </p>
              {run.lastRun?.error && (
                <p className="mt-0.5 truncate text-xs text-rose-500" title={run.lastRun.error}>
                  {run.lastRun.error}
                </p>
              )}
            </div>
            <span
              className={`flex-shrink-0 text-xs font-semibold ${
                run.lastRun == null ? "text-muted-fg" : ok ? "text-primary" : "text-rose-500"
              }`}
            >
              {run.lastRun == null ? "—" : ok ? "OK" : "Fehler"}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
