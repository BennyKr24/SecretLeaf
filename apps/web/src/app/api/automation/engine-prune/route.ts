// ──────────────────────────────────────────────────────────────────────────────
// Study Engine – Prune Route (Cron / Manual)
// ──────────────────────────────────────────────────────────────────────────────
//
// GET /api/automation/engine-prune?x-cron-key=...
//
// Removes low-quality studies from the database:
//   1. Studies explicitly rejected by editorial review (quality_status = 'bad')
//   2. Auto-ingested studies with a relevance score below the discard threshold
//      AND no editorial override (quality_status = 'pending', no review_note)
//
// Query parameters (all optional):
//   dryRun=true          – list candidates, do not delete
//   minAgeHours=48       – only prune studies fetched at least this long ago
//   scoreThreshold=28    – auto-prune if relevance_score <= this value
//   limit=200            – max number of records to prune per run
//
// Keeps:
//   - quality_status = 'good'   (reviewed + approved)
//   - quality_status = 'bad'    DELETED
//   - quality_status = 'pending' AND relevance_score > threshold  KEPT
//   - quality_status = 'pending' AND relevance_score <= threshold
//     AND no review_note AND fetched_at <= cutoff               DELETED
// ──────────────────────────────────────────────────────────────────────────────

import { recordAutomationRun } from "@/lib/automationRuns";
import { getCronSecret } from "@/lib/env";
import { logError, logInfo, logWarn } from "@/lib/log";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

const JOB_NAME = "engine-prune";
const STUDIES_TABLE = "studies";

/** Default min age (hours) before an auto-study is pruning-eligible. */
const DEFAULT_MIN_AGE_HOURS = 48;
/** Default score threshold — auto-studies below this are pruned. */
const DEFAULT_SCORE_THRESHOLD = 28;
/** Default max rows pruned per run. */
const DEFAULT_LIMIT = 200;

function isCronAuthorized(req: Request, configuredSecret: string): boolean {
  const auth = req.headers.get("authorization");
  const bearerToken = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  const legacyKey =
    req.headers.get("x-cron-key") ??
    new URL(req.url).searchParams.get("x-cron-key");
  return (bearerToken ?? legacyKey) === configuredSecret;
}

function parseBool(raw: string | null, fallback: boolean): boolean {
  if (raw == null) return fallback;
  return ["1", "true", "yes"].includes(raw.toLowerCase());
}

function parseIntParam(raw: string | null, fallback: number, min: number, max: number): number {
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < min || n > max) return fallback;
  return n;
}

export async function GET(req: Request) {
  const startedAt = new Date().toISOString();
  const url = new URL(req.url);

  // ── Auth ────────────────────────────────────────────────────────────────────
  let configuredSecret: string;
  try {
    configuredSecret = getCronSecret();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Missing CRON secret";
    logError("automation.engine-prune.misconfigured", { message });
    return Response.json({ error: "CRON_SECRET is not configured" }, { status: 500 });
  }

  if (!isCronAuthorized(req, configuredSecret)) {
    logWarn("automation.engine-prune.unauthorized");
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Params ──────────────────────────────────────────────────────────────────
  const dryRun = parseBool(url.searchParams.get("dryRun"), false);
  const minAgeHours = parseIntParam(url.searchParams.get("minAgeHours"), DEFAULT_MIN_AGE_HOURS, 1, 720);
  const scoreThreshold = parseIntParam(url.searchParams.get("scoreThreshold"), DEFAULT_SCORE_THRESHOLD, 0, 100);
  const limit = parseIntParam(url.searchParams.get("limit"), DEFAULT_LIMIT, 1, 2000);

  const MS_PER_HOUR = 60 * 60 * 1000;
  const cutoffIso = new Date(Date.now() - minAgeHours * MS_PER_HOUR).toISOString();

  logInfo("automation.engine-prune.start", { dryRun, minAgeHours, scoreThreshold, limit, cutoff: cutoffIso });

  try {
    const supabase = getSupabaseServerClient();

    // ── Pass 1: fetch explicitly bad studies ───────────────────────────────
    const { data: badStudies, error: badError } = await supabase
      .from(STUDIES_TABLE)
      .select("id, title, relevance_score, quality_status, fetched_at")
      .eq("quality_status", "bad")
      .limit(limit);

    if (badError) {
      logError("automation.engine-prune.fetch-bad-failed", { error: badError.message });
      await safeRecordRun(startedAt, false, 0, 0, badError.message, { dryRun });
      return Response.json({ error: badError.message }, { status: 500 });
    }

    const badRows = badStudies ?? [];

    // ── Pass 2: fetch auto-ingested studies below score threshold ───────────
    const { data: lowScoreStudies, error: lowError } = await supabase
      .from(STUDIES_TABLE)
      .select("id, title, relevance_score, quality_status, fetched_at")
      .eq("quality_status", "pending")
      .lte("relevance_score", scoreThreshold)
      .is("review_note", null)
      .contains("tags", ["auto"])
      .lte("fetched_at", cutoffIso)
      .limit(limit - badRows.length);

    if (lowError) {
      logError("automation.engine-prune.fetch-low-score-failed", { error: lowError.message });
      await safeRecordRun(startedAt, false, 0, 0, lowError.message, { dryRun });
      return Response.json({ error: lowError.message }, { status: 500 });
    }

    const lowScoreRows = lowScoreStudies ?? [];

    const allCandidates = [...badRows, ...lowScoreRows];

    if (allCandidates.length === 0) {
      logInfo("automation.engine-prune.no-candidates", {});
      await safeRecordRun(startedAt, true, 0, 0, null, { dryRun, cutoff: cutoffIso });
      return Response.json({
        ok: true,
        dryRun,
        pruned: 0,
        candidates: 0,
        message: "No prune candidates found.",
        generatedAt: new Date().toISOString(),
      });
    }

    logInfo("automation.engine-prune.candidates", {
      total: allCandidates.length,
      bad: badRows.length,
      lowScore: lowScoreRows.length,
      dryRun,
    });

    if (dryRun) {
      await safeRecordRun(startedAt, true, allCandidates.length, 0, null, { dryRun });
      return Response.json({
        ok: true,
        dryRun: true,
        pruned: 0,
        candidates: allCandidates.length,
        preview: allCandidates.slice(0, 20).map((r) => ({
          id: r.id,
          title: (r.title as string).slice(0, 80),
          score: r.relevance_score,
          status: r.quality_status,
        })),
        generatedAt: new Date().toISOString(),
      });
    }

    // ── Delete ──────────────────────────────────────────────────────────────
    const ids = allCandidates.map((r) => r.id as string);

    const { error: deleteError, count } = await supabase
      .from(STUDIES_TABLE)
      .delete({ count: "exact" })
      .in("id", ids);

    if (deleteError) {
      logError("automation.engine-prune.delete-failed", { error: deleteError.message });
      await safeRecordRun(startedAt, false, allCandidates.length, 0, deleteError.message, { dryRun });
      return Response.json({ error: deleteError.message }, { status: 500 });
    }

    const pruned = count ?? allCandidates.length;

    logInfo("automation.engine-prune.complete", {
      pruned,
      bad: badRows.length,
      lowScore: lowScoreRows.length,
    });

    await safeRecordRun(startedAt, true, allCandidates.length, pruned, null, {
      dryRun,
      badStudies: badRows.length,
      lowScoreStudies: lowScoreRows.length,
      scoreThreshold,
      minAgeHours,
    });

    return Response.json({
      ok: true,
      dryRun: false,
      pruned,
      candidates: allCandidates.length,
      breakdown: {
        bad: badRows.length,
        lowScore: lowScoreRows.length,
        scoreThreshold,
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Prune failed";
    logError("automation.engine-prune.exception", { message });
    await safeRecordRun(startedAt, false, 0, 0, message, { dryRun });
    return Response.json({ error: message }, { status: 500 });
  }
}

// ── Telemetry Helper ────────────────────────────────────────────────────────

async function safeRecordRun(
  startedAt: string,
  success: boolean,
  fetched: number,
  pruned: number,
  errorDetails: string | null,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  try {
    await recordAutomationRun({
      jobName: JOB_NAME,
      startedAt,
      finishedAt: new Date().toISOString(),
      success,
      fetched,
      inserted: 0,
      updated: pruned,
      skipped: 0,
      errorDetails,
      metadata,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "telemetry failed";
    logWarn("automation.engine-prune.telemetry-failed", { message: msg });
  }
}
