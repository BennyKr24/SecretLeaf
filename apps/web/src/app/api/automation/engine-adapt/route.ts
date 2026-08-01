// ──────────────────────────────────────────────────────────────────────────────
// Study Engine – Adaptive Weights API Route (Cron)
// ──────────────────────────────────────────────────────────────────────────────
//
// GET /api/automation/engine-adapt?x-cron-key=...
//
// Triggers the adaptive weight computation:
// 1. Fetches feedback aggregates
// 2. Builds study profiles
// 3. Computes new weights via correlation analysis
// 4. Persists to scoring_weights_history
//
// Should run periodically (e.g., weekly) after sufficient feedback accumulates.
// ──────────────────────────────────────────────────────────────────────────────

import { computeFeedbackAggregates } from "@/lib/engine/feedback";
import { buildStudyProfiles, computeAdaptiveWeights, saveWeightAdjustment } from "@/lib/engine/adaptive";
import { isAutomationCronAuthorized } from "@/lib/automationCron";
import { recordAutomationRun } from "@/lib/automationRuns";
import { getCronSecret } from "@/lib/env";
import { logError, logInfo, logWarn } from "@/lib/log";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { PipelineLogAggregator } from "@/lib/engine";

export const dynamic = "force-dynamic";

const JOB_NAME = "engine-adapt";

export async function GET(req: Request) {
  const startedAt = new Date().toISOString();

  // ── Auth ────────────────────────────────────────────────────────────
  let configuredSecret: string;
  try {
    configuredSecret = getCronSecret();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Missing CRON secret";
    logError("automation.engine-adapt.misconfigured", { message });
    await safeRecordRun(startedAt, false, 0, message);
    return Response.json({ error: "CRON_SECRET is not configured" }, { status: 500 });
  }

  if (!isAutomationCronAuthorized(req, configuredSecret)) {
    logWarn("automation.engine-adapt.unauthorized");
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getSupabaseServerClient();
    const logs = new PipelineLogAggregator();
    const feedbackLog = logs.createLogger("feedback-agg");
    const adaptLog = logs.createLogger("adaptive");

    // 1. Compute feedback aggregates
    const aggregates = await computeFeedbackAggregates(supabase, feedbackLog);

    if (aggregates.size === 0) {
      logInfo("automation.engine-adapt.no-data", {});
      await safeRecordRun(startedAt, true, 0, null, { reason: "No feedback data" });
      return Response.json({
        success: true,
        message: "No feedback data yet. Weights unchanged.",
        basedOnStudies: 0,
      });
    }

    // 2. Build study profiles
    const profiles = await buildStudyProfiles(supabase, aggregates, adaptLog);

    // 3. Compute adaptive weights
    const adjustment = computeAdaptiveWeights(profiles, adaptLog);

    // 4. Persist
    const saved = await saveWeightAdjustment(supabase, adjustment, adaptLog);

    logInfo("automation.engine-adapt.complete", {
      basedOnStudies: adjustment.basedOnStudies,
      reason: adjustment.reason,
      saved,
    });

    await safeRecordRun(startedAt, true, adjustment.basedOnStudies, null, {
      reason: adjustment.reason,
      saved,
      weights: adjustment.weights,
    });

    return Response.json({
      success: true,
      adjustment: {
        weights: adjustment.weights,
        reason: adjustment.reason,
        basedOnStudies: adjustment.basedOnStudies,
        computedAt: adjustment.computedAt,
      },
      saved,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Adaptation failed";
    logError("automation.engine-adapt.exception", { message });
    await safeRecordRun(startedAt, false, 0, message);
    return Response.json({ error: message }, { status: 500 });
  }
}

// ── Telemetry Helper ────────────────────────────────────────────────────────

async function safeRecordRun(
  startedAt: string,
  success: boolean,
  basedOnStudies: number,
  errorDetails: string | null,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  try {
    await recordAutomationRun({
      jobName: JOB_NAME,
      startedAt,
      finishedAt: new Date().toISOString(),
      success,
      fetched: basedOnStudies,
      inserted: 0,
      updated: 0,
      skipped: 0,
      errorDetails,
      metadata,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "telemetry failed";
    logWarn("automation.engine-adapt.telemetry-failed", { message: msg });
  }
}
