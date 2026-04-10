// ──────────────────────────────────────────────────────────────────────────────
// Study Engine – Reprocess API Route (Cron)
// ──────────────────────────────────────────────────────────────────────────────
//
// GET /api/automation/engine-reprocess?x-cron-key=...
//
// Triggers the reprocessing loop to re-evaluate existing studies with
// updated scoring rules and adaptive weights.
// ──────────────────────────────────────────────────────────────────────────────

import { recordAutomationRun } from "@/lib/automationRuns";
import { runReprocessLoop } from "@/lib/engine/reprocess";
import { getCronSecret } from "@/lib/env";
import { logError, logInfo, logWarn } from "@/lib/log";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { PipelineLogAggregator } from "@/lib/engine";

export const dynamic = "force-dynamic";

const JOB_NAME = "engine-reprocess";

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
    logError("automation.engine-reprocess.misconfigured", { message });
    return Response.json({ error: "CRON_SECRET is not configured" }, { status: 500 });
  }

  if (!isCronAuthorized(req, configuredSecret)) {
    logWarn("automation.engine-reprocess.unauthorized");
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Config from query params ────────────────────────────────────────
  const url = new URL(req.url);
  const overrides: Record<string, number> = {};

  const batchParam = url.searchParams.get("batchSize");
  if (batchParam) {
    const val = Number.parseInt(batchParam, 10);
    if (Number.isFinite(val) && val >= 1 && val <= 200) overrides.batchSize = val;
  }

  const ageParam = url.searchParams.get("minAgeHours");
  if (ageParam) {
    const val = Number.parseInt(ageParam, 10);
    if (Number.isFinite(val) && val >= 1) overrides.minAgeHours = val;
  }

  // ── Run Reprocess ────────────────────────────────────────────────────
  try {
    const supabase = getSupabaseServerClient();
    const logs = new PipelineLogAggregator();
    const logger = logs.createLogger("reprocess");

    const result = await runReprocessLoop(supabase, logger, overrides);

    logInfo("automation.engine-reprocess.complete", {
      processed: result.processed,
      upgraded: result.upgraded,
      downgraded: result.downgraded,
      unchanged: result.unchanged,
      errors: result.errors.length,
    });

    const finishedAt = new Date().toISOString();

    await safeRecordRun(startedAt, finishedAt, result.errors.length === 0, {
      processed: result.processed,
      upgraded: result.upgraded,
      downgraded: result.downgraded,
      unchanged: result.unchanged,
      errors: result.errors.slice(0, 10),
    });

    return Response.json({
      success: result.errors.length === 0,
      ...result,
      generatedAt: finishedAt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Reprocess failed";
    logError("automation.engine-reprocess.exception", { message });
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}

// ── Telemetry Helper ────────────────────────────────────────────────────────

async function safeRecordRun(
  startedAt: string,
  finishedAt: string,
  success: boolean,
  metadata: Record<string, unknown>,
): Promise<void> {
  try {
    await recordAutomationRun({
      jobName: JOB_NAME,
      startedAt,
      finishedAt,
      success,
      fetched: 0,
      inserted: 0,
      updated: ((metadata.upgraded as number) ?? 0) + ((metadata.downgraded as number) ?? 0),
      skipped: (metadata.unchanged as number) ?? 0,
      metadata,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "telemetry failed";
    logWarn("automation.engine-reprocess.record-run-failed", { message: msg });
  }
}
