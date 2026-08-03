// ──────────────────────────────────────────────────────────────────────────────
// Health Snapshot + Diagnosis Outcome Cron
// ──────────────────────────────────────────────────────────────────────────────
//
// GET /api/automation/health-snapshot?x-cron-key=...
//
// Daily job: writes a plant_health_snapshots row for every grow, then checks
// every still-open diagnosis for its 3-day/7-day auto outcome reading. See
// lib/grow/outcomeJob.ts for the actual logic. Protected by CRON_SECRET.
// ──────────────────────────────────────────────────────────────────────────────

import { runHealthSnapshotJob, runDiagnosisOutcomeJob } from "@/lib/grow/outcomeJob";
import { isAutomationCronAuthorized } from "@/lib/automationCron";
import { getCronSecret } from "@/lib/env";
import { logError, logWarn, logInfo } from "@/lib/log";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { recordAutomationRun } from "@/lib/automationRuns";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  // ── Auth ────────────────────────────────────────────────────────────
  let configuredSecret: string;
  try {
    configuredSecret = getCronSecret();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Missing CRON secret";
    logError("automation.health-snapshot.misconfigured", { message });
    return Response.json({ error: "CRON_SECRET is not configured" }, { status: 500 });
  }

  if (!isAutomationCronAuthorized(req, configuredSecret)) {
    logWarn("automation.health-snapshot.unauthorized");
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = new Date().toISOString();
  const supabase = getSupabaseServerClient();

  try {
    const healthResult = await runHealthSnapshotJob(supabase);
    const outcomeResult = await runDiagnosisOutcomeJob(supabase);
    const finishedAt = new Date().toISOString();
    const success = healthResult.errors === 0 && outcomeResult.errors === 0;

    await recordAutomationRun({
      jobName: "health-snapshot",
      startedAt,
      finishedAt,
      success,
      fetched: healthResult.growsProcessed,
      inserted: healthResult.snapshotsWritten + outcomeResult.outcomesWritten,
      updated: outcomeResult.diagnosesResolved,
      skipped: healthResult.errors + outcomeResult.errors,
      metadata: { health: healthResult, outcomes: outcomeResult },
    });

    logInfo("automation.health-snapshot.completed", { health: healthResult, outcomes: outcomeResult });

    return Response.json({ health: healthResult, outcomes: outcomeResult, generatedAt: finishedAt });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Health snapshot job failed";
    logError("automation.health-snapshot.exception", { message });

    await recordAutomationRun({
      jobName: "health-snapshot",
      startedAt,
      finishedAt: new Date().toISOString(),
      success: false,
      fetched: 0,
      inserted: 0,
      updated: 0,
      skipped: 0,
      errorDetails: message,
    }).catch(() => {});

    return Response.json({ error: message }, { status: 500 });
  }
}
