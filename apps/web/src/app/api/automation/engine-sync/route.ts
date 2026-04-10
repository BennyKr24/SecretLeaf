// ──────────────────────────────────────────────────────────────────────────────
// Study Engine – Cron API Route
// ──────────────────────────────────────────────────────────────────────────────
//
// Replaces the old studies-sync with the full engine pipeline.
// Protected by CRON_SECRET, records automation runs.
//
// GET /api/automation/engine-sync?x-cron-key=...
//   or header: x-cron-key: ...
// ──────────────────────────────────────────────────────────────────────────────

import { recordAutomationRun } from "@/lib/automationRuns";
import { runPipeline } from "@/lib/engine";
import type { PipelineConfig } from "@/lib/engine";
import { getCronSecret } from "@/lib/env";
import { logError, logInfo, logWarn } from "@/lib/log";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

const JOB_NAME = "engine-sync";

function isCronAuthorized(req: Request, configuredSecret: string): boolean {
  const headerSecret =
    req.headers.get("x-cron-key") ??
    new URL(req.url).searchParams.get("x-cron-key");
  return headerSecret === configuredSecret;
}

export async function GET(req: Request) {
  const startedAt = new Date().toISOString();

  // ── Auth ────────────────────────────────────────────────────────────
  let configuredSecret: string;
  try {
    configuredSecret = getCronSecret();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Missing CRON secret";
    logError("automation.engine-sync.misconfigured", { message });
    await safeRecordRun(startedAt, false, 0, 0, 0, 0, message);
    return Response.json({ error: "CRON_SECRET is not configured" }, { status: 500 });
  }

  if (!isCronAuthorized(req, configuredSecret)) {
    logWarn("automation.engine-sync.unauthorized");
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Config from env / query params ──────────────────────────────────
  const url = new URL(req.url);
  const overrides: Partial<PipelineConfig> = {};

  const lookbackParam = url.searchParams.get("lookbackDays");
  if (lookbackParam) {
    const val = Number.parseInt(lookbackParam, 10);
    if (Number.isFinite(val) && val >= 1 && val <= 90) overrides.lookbackDays = val;
  }

  const limitParam = url.searchParams.get("maxProcessed");
  if (limitParam) {
    const val = Number.parseInt(limitParam, 10);
    if (Number.isFinite(val) && val >= 1 && val <= 1000) overrides.maxProcessed = val;
  }

  const dryRun = url.searchParams.get("dryRun") === "true";
  if (dryRun) {
    overrides.persistToStorage = false;
  }

  // ── Run Pipeline ────────────────────────────────────────────────────
  try {
    const supabase = dryRun ? null : getSupabaseServerClient();
    const result = await runPipeline(supabase, overrides);

    logInfo("automation.engine-sync.complete", {
      success: result.success,
      fetched: result.metrics.fetched,
      accepted: result.metrics.accepted,
      inserted: result.metrics.inserted,
      updated: result.metrics.updated,
      rejected: result.metrics.rejected,
      durationMs: result.metrics.durationMs,
    });

    await safeRecordRun(
      startedAt,
      result.success,
      result.metrics.fetched,
      result.metrics.inserted,
      result.metrics.updated,
      result.metrics.skipped,
      result.metrics.errors.length > 0 ? result.metrics.errors.join("; ") : null,
      {
        accepted: result.metrics.accepted,
        rejected: result.metrics.rejected,
        normalized: result.metrics.normalized,
        deduplicated: result.metrics.deduplicated,
        classified: result.metrics.classified,
        durationMs: result.metrics.durationMs,
        dryRun,
      },
    );

    return Response.json(
      {
        success: result.success,
        dryRun,
        metrics: {
          durationMs: result.metrics.durationMs,
          fetched: result.metrics.fetched,
          normalized: result.metrics.normalized,
          deduplicated: result.metrics.deduplicated,
          classified: result.metrics.classified,
          accepted: result.metrics.accepted,
          rejected: result.metrics.rejected,
          inserted: result.metrics.inserted,
          updated: result.metrics.updated,
          skipped: result.metrics.skipped,
          errors: result.metrics.errors.slice(0, 20),
        },
        topAccepted: result.accepted.slice(0, 10).map((s) => ({
          title: s.title,
          score: s.relevanceScore,
          type: s.studyType,
          priority: s.editorialPriority,
          topics: s.matchedTopics,
        })),
        topRejected: result.rejected.slice(0, 10),
        generatedAt: new Date().toISOString(),
      },
      {
        status: result.success ? 200 : 207,
        headers: {
          "Cache-Control": "no-store",
          "X-Pipeline-Duration-Ms": String(result.metrics.durationMs),
        },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Engine sync failed";
    logError("automation.engine-sync.exception", { message });
    await safeRecordRun(startedAt, false, 0, 0, 0, 0, message);
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}

// ── Telemetry Helper ────────────────────────────────────────────────────────

async function safeRecordRun(
  startedAt: string,
  success: boolean,
  fetched: number,
  inserted: number,
  updated: number,
  skipped: number,
  errorDetails: string | null = null,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  try {
    await recordAutomationRun({
      jobName: JOB_NAME,
      startedAt,
      finishedAt: new Date().toISOString(),
      success,
      fetched,
      inserted,
      updated,
      skipped,
      errorDetails,
      metadata,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "telemetry failed";
    logWarn("automation.engine-sync.telemetry-failed", { message });
  }
}
