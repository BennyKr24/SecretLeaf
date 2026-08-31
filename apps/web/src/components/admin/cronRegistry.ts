// ────────────────────────────────────────────────────────────────────────────
// Cron registry
//
// One human-readable description per scheduled job, kept in sync with
// `apps/web/vercel.json` by hand (there is no runtime API for Vercel crons).
// Used by the Lage briefing ("über Nacht gelaufen") and the Betrieb page
// (docs/ADMIN_PANEL_OVERHAUL_PLAN.md §4.1 / §4.6).
//
// `jobName` matches the `job_name` written to `automation_job_runs` where the
// route records a run; a few routes don't record one yet (noted below).
// ────────────────────────────────────────────────────────────────────────────

export type CronJob = {
  /** route path under /api/automation */
  path: string;
  /** raw cron expression from vercel.json */
  schedule: string;
  /** human-readable schedule, German */
  scheduleLabel: string;
  /** short label */
  label: string;
  /** one-line description */
  description: string;
  /** `job_name` in automation_job_runs, or null if the route records none */
  jobName: string | null;
  /** rough expected duration budget in seconds — a run far over this is suspect */
  budgetSeconds: number;
};

export const CRON_JOBS: CronJob[] = [
  {
    path: "/api/automation/study-refresh",
    schedule: "17 4 * * *",
    scheduleLabel: "täglich 04:17",
    label: "Studien neu ranken",
    description: "Sortiert den Studienbestand neu (smart/fresh/quality).",
    jobName: "study-refresh",
    budgetSeconds: 60,
  },
  {
    path: "/api/automation/engine-sync",
    schedule: "37 4 * * *",
    scheduleLabel: "täglich 04:37",
    label: "Engine-Pipeline",
    description: "Volle Pipeline: fetch → normalize → dedup → classify → score → speichern.",
    jobName: "engine-sync",
    budgetSeconds: 300,
  },
  {
    path: "/api/automation/engine-health",
    schedule: "47 4 * * *",
    scheduleLabel: "täglich 04:47",
    label: "Engine-Health-Check",
    description: "Prüft Circuit-Breaker, Fehlerquoten und Pipeline-Gesundheit.",
    jobName: "engine-health",
    budgetSeconds: 30,
  },
  {
    path: "/api/automation/health-snapshot",
    schedule: "50 4 * * *",
    scheduleLabel: "täglich 04:50",
    label: "Health-Snapshot",
    description: "Schreibt plant_health_snapshots je Grow + Diagnose-Outcome-Job.",
    jobName: "health-snapshot",
    budgetSeconds: 60,
  },
  {
    path: "/api/automation/engine-adapt",
    schedule: "0 5 * * 1",
    scheduleLabel: "montags 05:00",
    label: "Adaptive Gewichte",
    description: "Berechnet Scoring-Gewichte neu und schreibt sie in engine_config.",
    jobName: "engine-adapt",
    budgetSeconds: 60,
  },
  {
    path: "/api/automation/engine-reprocess",
    schedule: "15 5 * * 1",
    scheduleLabel: "montags 05:15",
    label: "Studien neu bewerten",
    description: "Bewertet gespeicherte Studien mit der aktuellen Config neu.",
    jobName: "engine-reprocess",
    budgetSeconds: 180,
  },
  {
    path: "/api/automation/cleanup",
    schedule: "40 4 * * 0",
    scheduleLabel: "sonntags 04:40",
    label: "Aufräumen",
    description: "Löscht abgelaufene Test-User (smoke.*@example.com).",
    jobName: "cleanup",
    budgetSeconds: 30,
  },
];

export const CRON_BY_JOB_NAME: Record<string, CronJob> = Object.fromEntries(
  CRON_JOBS.filter((j) => j.jobName).map((j) => [j.jobName as string, j]),
);

// ── Schedule maths ──────────────────────────────────────────────────────────

/** Parse the 5-field cron subset we actually use and return the next run
 *  after `from` (UTC — Vercel crons run in UTC). Supports `*`, a single
 *  integer, and comma lists; enough for every entry above. */
export function nextCronRun(schedule: string, from: Date = new Date()): Date | null {
  const parts = schedule.trim().split(/\s+/);
  if (parts.length !== 5) return null;
  const [minP, hourP, domP, monP, dowP] = parts;

  const match = (field: string, value: number): boolean => {
    if (field === "*") return true;
    return field.split(",").some((tok) => Number(tok) === value);
  };

  const cursor = new Date(Date.UTC(
    from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate(),
    from.getUTCHours(), from.getUTCMinutes(), 0, 0,
  ));
  cursor.setUTCMinutes(cursor.getUTCMinutes() + 1);

  // brute-force up to ~400 days of minutes is too much; step by minute but
  // cap at 366 days — every schedule here fires at least weekly.
  const limit = new Date(cursor.getTime() + 366 * 24 * 60 * 60 * 1000);
  while (cursor < limit) {
    if (
      match(minP as string, cursor.getUTCMinutes()) &&
      match(hourP as string, cursor.getUTCHours()) &&
      match(domP as string, cursor.getUTCDate()) &&
      match(monP as string, cursor.getUTCMonth() + 1) &&
      match(dowP as string, cursor.getUTCDay())
    ) {
      return new Date(cursor);
    }
    // fast-forward: if hour/minute already past for a daily job, jump to next hour
    cursor.setUTCMinutes(cursor.getUTCMinutes() + 1);
  }
  return null;
}

/** Interval between consecutive runs, in ms — used for the stale-cron check. */
export function cronIntervalMs(schedule: string): number {
  const a = nextCronRun(schedule, new Date(0));
  if (!a) return 24 * 60 * 60 * 1000;
  const b = nextCronRun(schedule, new Date(a.getTime() + 1000));
  if (!b) return 24 * 60 * 60 * 1000;
  return b.getTime() - a.getTime();
}
