import { searchStudies } from "@/lib/search/studyAlgorithms";
import { recordAutomationRun } from "@/lib/automationRuns";
import { getCronSecret } from "@/lib/env";
import { logError, logInfo, logWarn } from "@/lib/log";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const startedAt = new Date().toISOString();
  let configuredSecret: string;
  try {
    configuredSecret = getCronSecret();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Missing CRON secret";
    logError("automation.study-refresh.misconfigured", { message });
    try {
      await recordAutomationRun({
        jobName: "study-refresh",
        startedAt,
        finishedAt: new Date().toISOString(),
        success: false,
        fetched: 0,
        inserted: 0,
        updated: 0,
        skipped: 0,
        errorDetails: message,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "telemetry failed";
      logWarn("automation.study-refresh.telemetry-failed", { message: msg });
    }
    return Response.json({ error: "CRON_SECRET is not configured" }, { status: 500 });
  }

  // Vercel Cron sends: Authorization: Bearer <CRON_SECRET>
  const auth = req.headers.get("authorization");
  const bearerToken = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  const legacyKey =
    req.headers.get("x-cron-key") ??
    new URL(req.url).searchParams.get("x-cron-key");
  const headerSecret = bearerToken ?? legacyKey;

  if (headerSecret !== configuredSecret) {
    logWarn("automation.study-refresh.unauthorized");
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Warm up top cohorts so ranking runs periodically on the server.
    const smart = searchStudies("cannabis evidence", { limit: 12, mode: "smart" });
    const fresh = searchStudies("", { limit: 12, mode: "fresh" });
    const quality = searchStudies("", { limit: 12, mode: "quality" });

    const fetched = smart.items.length + fresh.items.length + quality.items.length;

    logInfo("automation.study-refresh.success", {
      smartCount: smart.items.length,
      freshCount: fresh.items.length,
      qualityCount: quality.items.length,
    });

    try {
      await recordAutomationRun({
        jobName: "study-refresh",
        startedAt,
        finishedAt: new Date().toISOString(),
        success: true,
        fetched,
        inserted: 0,
        updated: 0,
        skipped: 0,
        metadata: {
          smartCount: smart.items.length,
          freshCount: fresh.items.length,
          qualityCount: quality.items.length,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to record refresh run";
      logWarn("automation.study-refresh.telemetry-failed", { message });
    }

    return Response.json({
      success: true,
      fetched,
      inserted: 0,
      updated: 0,
      skipped: 0,
      errors: [],
      generatedAt: new Date().toISOString(),
      snapshots: {
        smartTop: smart.items.slice(0, 5).map((item) => ({ id: item.id, score: item.score })),
        freshTop: fresh.items.slice(0, 5).map((item) => ({ id: item.id, score: item.score })),
        qualityTop: quality.items.slice(0, 5).map((item) => ({ id: item.id, score: item.score })),
      },
      notes: [
        "Runs on Vercel cron independent of local PC sessions.",
        "This endpoint does not modify repository files.",
        "For persistent sync outside GitHub Actions use external storage (DB/Blob/KV).",
      ],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "study-refresh failed";
    logError("automation.study-refresh.exception", { message });

    try {
      await recordAutomationRun({
        jobName: "study-refresh",
        startedAt,
        finishedAt: new Date().toISOString(),
        success: false,
        fetched: 0,
        inserted: 0,
        updated: 0,
        skipped: 0,
        errorDetails: message,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "telemetry failed";
      logWarn("automation.study-refresh.telemetry-failed", { message: msg });
    }

    return Response.json(
      {
        success: false,
        fetched: 0,
        inserted: 0,
        updated: 0,
        skipped: 0,
        errors: [message],
      },
      { status: 500 }
    );
  }
}
