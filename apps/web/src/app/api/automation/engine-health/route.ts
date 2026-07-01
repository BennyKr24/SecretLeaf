// ──────────────────────────────────────────────────────────────────────────────
// Study Engine – Health Monitor API Route
// ──────────────────────────────────────────────────────────────────────────────
//
// GET /api/automation/engine-health?x-cron-key=...
//
// Returns pipeline health snapshot + circuit breaker status.
// Protected by CRON_SECRET.
// ──────────────────────────────────────────────────────────────────────────────

import { computePipelineHealth } from "@/lib/engine/monitor";
import { getAllCircuitBreakers } from "@/lib/engine/circuitBreaker";
import { isAutomationCronAuthorized } from "@/lib/automationCron";
import { getCronSecret } from "@/lib/env";
import { logError, logWarn } from "@/lib/log";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { PipelineLogAggregator } from "@/lib/engine";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  // ── Auth ────────────────────────────────────────────────────────────
  let configuredSecret: string;
  try {
    configuredSecret = getCronSecret();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Missing CRON secret";
    logError("automation.engine-health.misconfigured", { message });
    return Response.json({ error: "CRON_SECRET is not configured" }, { status: 500 });
  }

  if (!isAutomationCronAuthorized(req, configuredSecret)) {
    logWarn("automation.engine-health.unauthorized");
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getSupabaseServerClient();
    const logs = new PipelineLogAggregator();
    const logger = logs.createLogger("health-api");

    // Pipeline health
    const health = await computePipelineHealth(supabase, logger);

    // Circuit breaker snapshots
    const breakers = getAllCircuitBreakers();
    const circuitBreakers = [...breakers.values()].map((b) => b.getSnapshot());

    return Response.json({
      pipeline: health,
      circuitBreakers,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Health check failed";
    logError("automation.engine-health.exception", { message });
    return Response.json({ error: message }, { status: 500 });
  }
}
