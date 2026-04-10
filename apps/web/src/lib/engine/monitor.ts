// ──────────────────────────────────────────────────────────────────────────────
// Study Engine – Pipeline Health Monitor
// ──────────────────────────────────────────────────────────────────────────────
//
// Monitors pipeline health by analyzing recent automation runs.
// Produces a health snapshot with:
// - Overall status (healthy / degraded / failing)
// - Consecutive failure count
// - Average performance metrics
// - Data freshness calculation
// - Actionable alerts
//
// Designed to be queried by the /status page and by the pipeline itself
// (to decide whether to proceed or back off).
// ──────────────────────────────────────────────────────────────────────────────

import type { SupabaseClient } from "@supabase/supabase-js";
import type { PipelineHealthSnapshot, PipelineHealthStatus } from "./types";
import { AUTOMATION_RUNS_TABLE } from "@/lib/automationRuns";
import type { PipelineLogger } from "./logger";

// ── Thresholds ──────────────────────────────────────────────────────────────

const MAX_CONSECUTIVE_FAILURES = 3;
const STALE_DATA_HOURS = 48;
const DEGRADED_DATA_HOURS = 24;
const MAX_AVG_DURATION_MS = 120_000; // 2 minutes
const LOOKBACK_RUNS = 20;

// ── Health Check ────────────────────────────────────────────────────────────

type RunRow = {
  job_name: string;
  success: boolean;
  started_at: string;
  finished_at: string;
  fetched: number;
  inserted: number;
  error_details: string | null;
  metadata: Record<string, unknown> | null;
};

/**
 * Compute pipeline health from recent automation run records.
 *
 * @param jobName - Filter by job name (e.g., "engine-sync")
 * @param supabase - Supabase client
 * @param logger - Pipeline logger
 */
export async function computePipelineHealth(
  supabase: SupabaseClient,
  logger: PipelineLogger,
  jobName: string = "engine-sync",
): Promise<PipelineHealthSnapshot> {
  const alerts: string[] = [];

  // Fetch recent runs
  const { data, error } = await supabase
    .from(AUTOMATION_RUNS_TABLE)
    .select("job_name, success, started_at, finished_at, fetched, inserted, error_details, metadata")
    .eq("job_name", jobName)
    .order("finished_at", { ascending: false })
    .limit(LOOKBACK_RUNS);

  if (error) {
    logger.error("Failed to fetch automation runs for health check", {
      error: error.message,
    });
    return buildFallbackSnapshot(alerts, error.message);
  }

  const runs = (data ?? []) as RunRow[];

  if (runs.length === 0) {
    alerts.push("No pipeline runs found. System may not be configured.");
    return buildFallbackSnapshot(alerts);
  }

  // Parse runs
  const recentRuns = runs.map((r) => {
    const startMs = new Date(r.started_at).getTime();
    const endMs = new Date(r.finished_at).getTime();
    const durationMs = endMs - startMs;
    const errorCount = r.error_details ? 1 : 0;

    return {
      jobName: r.job_name,
      success: r.success,
      finishedAt: r.finished_at,
      durationMs: Number.isFinite(durationMs) ? durationMs : 0,
      inserted: r.inserted ?? 0,
      fetched: r.fetched ?? 0,
      errors: errorCount,
    };
  });

  // Consecutive failures (most recent first)
  let consecutiveFailures = 0;
  for (const run of recentRuns) {
    if (!run.success) {
      consecutiveFailures++;
    } else {
      break;
    }
  }

  // Last success / failure timestamps
  const lastSuccessfulRun = recentRuns.find((r) => r.success)?.finishedAt ?? null;
  const lastFailedRun = recentRuns.find((r) => !r.success)?.finishedAt ?? null;

  // Averages (over successful runs only)
  const successfulRuns = recentRuns.filter((r) => r.success);
  const avgDurationMs =
    successfulRuns.length > 0
      ? Math.round(
          successfulRuns.reduce((sum, r) => sum + r.durationMs, 0) / successfulRuns.length,
        )
      : 0;
  const avgInserted =
    successfulRuns.length > 0
      ? Math.round(
          successfulRuns.reduce((sum, r) => sum + r.inserted, 0) / successfulRuns.length,
        )
      : 0;
  const avgFetched =
    successfulRuns.length > 0
      ? Math.round(
          successfulRuns.reduce((sum, r) => sum + r.fetched, 0) / successfulRuns.length,
        )
      : 0;

  // Data freshness
  const dataFreshnessHours = lastSuccessfulRun
    ? (Date.now() - new Date(lastSuccessfulRun).getTime()) / (60 * 60 * 1000)
    : Infinity;

  // Determine overall status
  let status: PipelineHealthStatus = "healthy";

  if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
    status = "failing";
    alerts.push(
      `${consecutiveFailures} consecutive failures detected. Pipeline may need manual intervention.`,
    );
  } else if (consecutiveFailures > 0) {
    status = "degraded";
    alerts.push(
      `${consecutiveFailures} recent failure(s). Monitoring for recovery.`,
    );
  }

  if (dataFreshnessHours > STALE_DATA_HOURS) {
    status = "failing";
    alerts.push(
      `Data is stale: last successful sync was ${Math.round(dataFreshnessHours)}h ago (threshold: ${STALE_DATA_HOURS}h).`,
    );
  } else if (dataFreshnessHours > DEGRADED_DATA_HOURS) {
    if (status === "healthy") status = "degraded";
    alerts.push(
      `Data freshness warning: last sync was ${Math.round(dataFreshnessHours)}h ago.`,
    );
  }

  if (avgDurationMs > MAX_AVG_DURATION_MS && successfulRuns.length >= 3) {
    if (status === "healthy") status = "degraded";
    alerts.push(
      `Average pipeline duration (${Math.round(avgDurationMs / 1000)}s) exceeds threshold (${MAX_AVG_DURATION_MS / 1000}s).`,
    );
  }

  if (avgInserted === 0 && successfulRuns.length >= 3) {
    if (status === "healthy") status = "degraded";
    alerts.push(
      "No new studies inserted in recent successful runs. Source may be exhausted or dedup too aggressive.",
    );
  }

  logger.info(`Pipeline health: ${status}`, {
    consecutiveFailures,
    dataFreshnessHours: Math.round(dataFreshnessHours),
    avgDurationMs,
    avgInserted,
    alerts: alerts.length,
  });

  return {
    status,
    lastSuccessfulRun,
    lastFailedRun,
    consecutiveFailures,
    avgDurationMs,
    avgInserted,
    avgFetched,
    dataFreshnessHours: Math.round(dataFreshnessHours * 10) / 10,
    recentRuns: recentRuns.slice(0, 10),
    alerts,
  };
}

/**
 * Quick check: should the pipeline proceed based on health?
 * Returns false if too many consecutive failures (circuit breaker behavior).
 */
export async function shouldPipelineRun(
  supabase: SupabaseClient,
  logger: PipelineLogger,
  jobName?: string,
): Promise<{ proceed: boolean; reason: string }> {
  const health = await computePipelineHealth(supabase, logger, jobName);

  if (health.status === "failing" && health.consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
    return {
      proceed: false,
      reason: `Pipeline blocked: ${health.consecutiveFailures} consecutive failures. ${health.alerts[0] ?? ""}`,
    };
  }

  return { proceed: true, reason: `Pipeline health: ${health.status}` };
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function buildFallbackSnapshot(
  alerts: string[],
  errorMessage?: string,
): PipelineHealthSnapshot {
  if (errorMessage) {
    alerts.push(`Health check error: ${errorMessage}`);
  }

  return {
    status: alerts.length > 0 ? "degraded" : "healthy",
    lastSuccessfulRun: null,
    lastFailedRun: null,
    consecutiveFailures: 0,
    avgDurationMs: 0,
    avgInserted: 0,
    avgFetched: 0,
    dataFreshnessHours: Infinity,
    recentRuns: [],
    alerts,
  };
}
