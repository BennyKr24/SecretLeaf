// ────────────────────────────────────────────────────────────────────────────
// GET /api/admin/ops
//
// Betrieb: die 7 Crons mit voller Lauf-Historie, das Retry-Backoff-Gedächtnis
// (automation_error_memory) und der Integrations-Status (welche env-gekoppelten
// Dienste leben). Löst die alte Engine-Seite ab
// (docs/ADMIN_PANEL_OVERHAUL_PLAN.md §4.6).
// ────────────────────────────────────────────────────────────────────────────

import { adminRoute } from "@/lib/admin/http";
import type {
  AdminOps,
  OpsJob,
  OpsErrorMemory,
  OpsIntegration,
  OpsRecentRun,
} from "@/lib/admin/contracts";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { AUTOMATION_RUNS_TABLE } from "@/lib/automationRuns";
import { CRON_JOBS, cronIntervalMs, nextCronRun } from "@/components/admin/cronRegistry";

export const dynamic = "force-dynamic";

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

type RunRow = {
  job_name: string;
  success: boolean;
  started_at: string | null;
  finished_at: string;
  fetched: number | null;
  inserted: number | null;
  updated: number | null;
  skipped: number | null;
  error_details: string | null;
  metadata: Record<string, unknown> | null;
};

const durationSeconds = (started: string | null, finished: string): number | null =>
  started == null
    ? null
    : Math.max(0, Math.round((new Date(finished).getTime() - new Date(started).getTime()) / 1000));

function integrationStatus(): OpsIntegration[] {
  const has = (name: string) => {
    const v = process.env[name];
    return typeof v === "string" && v.trim().length > 0;
  };
  return [
    { key: "cron", label: "Cron-Secret", configured: has("CRON_SECRET"), note: "CRON_SECRET — Auth für alle Automations-Routen" },
    { key: "stripe", label: "Stripe", configured: has("STRIPE_SECRET_KEY") && has("STRIPE_WEBHOOK_SECRET"), note: "STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET" },
    { key: "anthropic", label: "Anthropic (Claude)", configured: has("ANTHROPIC_API_KEY"), note: "ANTHROPIC_API_KEY — Admin-Assistent + i18n-Läufe" },
    { key: "brevo", label: "Brevo (Mail)", configured: has("BREVO_API_KEY"), note: "BREVO_API_KEY — Auth-Mails & Alerts (Branch benny/email-templates)" },
    { key: "loops", label: "Loops (Newsletter)", configured: has("LOOPS_API_KEY"), note: "LOOPS_API_KEY — Newsletter-Signups" },
    { key: "sentry", label: "Sentry", configured: has("SENTRY_DSN") || has("NEXT_PUBLIC_SENTRY_DSN"), note: "SENTRY_DSN — Fehler-Monitoring (opt-in-gated)" },
    { key: "vercel", label: "Vercel-API", configured: has("VERCEL_API_TOKEN"), note: "VERCEL_API_TOKEN — für automatischen Kosten-Sync (Phase 2)" },
  ];
}

export const GET = adminRoute(async (): Promise<AdminOps> => {
  const supabase = getSupabaseServerClient();
  const since = new Date(Date.now() - THIRTY_DAYS).toISOString();

  const [runsRes, memRes] = await Promise.all([
    supabase
      .from(AUTOMATION_RUNS_TABLE)
      .select("job_name, success, started_at, finished_at, fetched, inserted, updated, skipped, error_details, metadata")
      .gte("finished_at", since)
      .order("finished_at", { ascending: false }),
    supabase
      .from("automation_error_memory")
      .select("job_name, fingerprint, fail_count, last_error, first_failed_at, last_failed_at, next_retry_at")
      .order("last_failed_at", { ascending: false }),
  ]);

  const allRuns = (runsRes.data ?? []) as RunRow[];

  const jobs: OpsJob[] = CRON_JOBS.filter((j) => j.jobName).map((job) => {
    const jobRuns = allRuns.filter((r) => r.job_name === job.jobName);
    const last = jobRuns[0] ?? null;
    const lastSuccess = jobRuns.find((r) => r.success) ?? null;
    const successes = jobRuns.filter((r) => r.success).length;
    const durations = jobRuns
      .map((r) => durationSeconds(r.started_at, r.finished_at))
      .filter((d): d is number => d != null);
    const intervalMs = cronIntervalMs(job.schedule);

    return {
      jobName: job.jobName as string,
      path: job.path,
      label: job.label,
      description: job.description,
      schedule: job.schedule,
      scheduleLabel: job.scheduleLabel,
      nextRunIso: nextCronRun(job.schedule)?.toISOString() ?? null,
      lastRun: last
        ? {
            success: last.success,
            startedAt: last.started_at,
            finishedAt: last.finished_at,
            durationSeconds: durationSeconds(last.started_at, last.finished_at),
            error: last.error_details,
            fetched: last.fetched ?? 0,
            inserted: last.inserted ?? 0,
            updated: last.updated ?? 0,
            skipped: last.skipped ?? 0,
            metadata: last.metadata,
          }
        : null,
      successRate30d: jobRuns.length > 0 ? successes / jobRuns.length : null,
      avgDurationSeconds:
        durations.length > 0
          ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
          : null,
      runs30d: jobRuns.length,
      stale:
        !lastSuccess ||
        Date.now() - new Date(lastSuccess.finished_at).getTime() > intervalMs * 1.5,
    };
  });

  const errorMemory: OpsErrorMemory[] = (
    (memRes.data ?? []) as Array<{
      job_name: string;
      fingerprint: string;
      fail_count: number;
      last_error: string | null;
      first_failed_at: string;
      last_failed_at: string;
      next_retry_at: string | null;
    }>
  ).map((m) => ({
    jobName: m.job_name,
    fingerprint: m.fingerprint,
    failCount: m.fail_count,
    lastError: m.last_error,
    firstFailedAt: m.first_failed_at,
    lastFailedAt: m.last_failed_at,
    nextRetryAt: m.next_retry_at,
  }));

  const recentRuns: OpsRecentRun[] = allRuns.slice(0, 50).map((r) => ({
    jobName: r.job_name,
    success: r.success,
    finishedAt: r.finished_at,
    durationSeconds: durationSeconds(r.started_at, r.finished_at),
    fetched: r.fetched ?? 0,
    inserted: r.inserted ?? 0,
    updated: r.updated ?? 0,
    skipped: r.skipped ?? 0,
    error: r.error_details,
  }));

  return {
    generatedAt: new Date().toISOString(),
    jobs,
    errorMemory,
    integrations: integrationStatus(),
    recentRuns,
  };
});
