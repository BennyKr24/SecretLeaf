// ──────────────────────────────────────────────────────────────────────────────
// Admin Dashboard API – Overview, Studies, Engine, Analytics, Settings
// ──────────────────────────────────────────────────────────────────────────────
//
// Consolidated API for the admin control panel.
// All endpoints require ADMIN role via Bearer token.
//
// POST /api/admin/dashboard
// Body: { action: "overview" | "studies" | "engine-trigger" | ... , ...params }
// ──────────────────────────────────────────────────────────────────────────────

import { requireAdmin } from "@/lib/serverAuth";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { AUTOMATION_RUNS_TABLE } from "@/lib/automationRuns";
import { logError, logInfo } from "@/lib/log";

export const dynamic = "force-dynamic";

const STUDIES_TABLE = "studies";

const STUDIES_SELECT_ENGINE = [
  "id",
  "title",
  "description",
  "source",
  "tags",
  "quality_status",
  "relevance_score",
  "study_type",
  "editorial_priority",
  "matched_topics",
  "flags",
  "first_author",
  "origin_label",
  "created_at",
  "fetched_at",
  "doi",
].join(", ");

const STUDIES_SELECT_LEGACY = [
  "id",
  "title",
  "description",
  "source",
  "tags",
  "quality_status",
  "created_at",
].join(", ");

function isMissingColumnError(message: string | undefined): boolean {
  return typeof message === "string" && /column\s+studies\..+\s+does not exist/i.test(message);
}

function normalizeLegacyStudyRow(row: Record<string, unknown>) {
  return {
    ...row,
    relevance_score: null,
    study_type: null,
    editorial_priority: null,
    matched_topics: null,
    flags: null,
    first_author: null,
    origin_label: null,
    fetched_at: null,
    doi: null,
  };
}

/**
 * Derive a reliable base URL for internal fetch calls.
 * Priority: origin header → VERCEL_URL env → host header.
 */
function getBaseUrl(req: Request): string {
  const origin = req.headers.get("origin");
  if (origin && origin.startsWith("http")) return origin;
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) return `https://${vercelUrl}`;
  const host = req.headers.get("host");
  if (host) return `https://${host}`;
  return "";
}

type AdminAction =
  | "overview"
  | "studies"
  | "study-update"
  | "study-delete"
  | "engine-trigger"
  | "engine-adapt"
  | "engine-reprocess"
  | "engine-logs"
  | "analytics"
  | "settings-get"
  | "settings-update";

export async function POST(req: Request) {
  const adminOrResponse = await requireAdmin(req);
  if (adminOrResponse instanceof Response) return adminOrResponse;

  try {
    const body = (await req.json()) as { action: AdminAction } & Record<string, unknown>;
    const { action } = body;
    const supabase = getSupabaseServerClient();

    switch (action) {
      // ── OVERVIEW ──────────────────────────────────────────────────────
      case "overview": {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

        // Studies counts
        const [todayRes, weekRes, totalRes] = await Promise.all([
          supabase.from(STUDIES_TABLE).select("id", { count: "exact", head: true }).gte("created_at", todayStart),
          supabase.from(STUDIES_TABLE).select("id", { count: "exact", head: true }).gte("created_at", weekStart),
          supabase.from(STUDIES_TABLE).select("id", { count: "exact", head: true }),
        ]);

        // Pipeline status from recent runs
        const { data: recentRuns } = await supabase
          .from(AUTOMATION_RUNS_TABLE)
          .select("job_name, success, finished_at, error_details, metadata")
          .eq("job_name", "engine-sync")
          .order("finished_at", { ascending: false })
          .limit(10);

        const runs = recentRuns ?? [];
        let consecutiveFailures = 0;
        for (const run of runs) {
          if (!run.success) consecutiveFailures++;
          else break;
        }

        let pipelineStatus: "healthy" | "degraded" | "failing" = "healthy";
        if (consecutiveFailures >= 3) pipelineStatus = "failing";
        else if (consecutiveFailures > 0) pipelineStatus = "degraded";

        const lastRun = runs[0] ?? null;
        const errorCount = runs.filter((r) => !r.success).length;

        // Pending review count
        const { count: pendingCount } = await supabase
          .from(STUDIES_TABLE)
          .select("id", { count: "exact", head: true })
          .eq("quality_status", "pending");

        return Response.json({
          newToday: todayRes.count ?? 0,
          newThisWeek: weekRes.count ?? 0,
          totalStudies: totalRes.count ?? 0,
          pendingReview: pendingCount ?? 0,
          pipelineStatus,
          lastRun: lastRun
            ? {
                success: lastRun.success,
                finishedAt: lastRun.finished_at,
                errors: lastRun.error_details,
                metadata: lastRun.metadata,
              }
            : null,
          errorCount,
          consecutiveFailures,
        });
      }

      // ── STUDIES LIST ──────────────────────────────────────────────────
      case "studies": {
        const page = Math.max(1, Number(body.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(body.limit) || 25));
        const offset = (page - 1) * limit;
        const sortBy = (body.sortBy as string) || "created_at";
        const sortDir = body.sortDir === "asc" ? true : false;

        const applyStudiesFilters = (
          query: ReturnType<typeof supabase.from>,
          useEngineFields: boolean,
        ) => {
          let nextQuery = query;

          if (body.quality && body.quality !== "all") {
            nextQuery = nextQuery.eq("quality_status", body.quality);
          }
          if (useEngineFields && body.minScore) {
            nextQuery = nextQuery.gte("relevance_score", Number(body.minScore));
          }
          if (useEngineFields && body.maxScore) {
            nextQuery = nextQuery.lte("relevance_score", Number(body.maxScore));
          }
          if (body.source && typeof body.source === "string") {
            nextQuery = nextQuery.ilike(useEngineFields ? "origin_label" : "source", `%${body.source}%`);
          }
          if (body.dateFrom) {
            nextQuery = nextQuery.gte("created_at", body.dateFrom as string);
          }
          if (body.dateTo) {
            nextQuery = nextQuery.lte("created_at", body.dateTo as string);
          }
          if (body.search && typeof body.search === "string") {
            nextQuery = nextQuery.ilike("title", `%${body.search}%`);
          }
          if (useEngineFields && body.studyType && body.studyType !== "all") {
            nextQuery = nextQuery.eq("study_type", body.studyType);
          }
          if (useEngineFields && body.priority && body.priority !== "all") {
            nextQuery = nextQuery.eq("editorial_priority", body.priority);
          }

          return nextQuery;
        };

        const buildStudiesQuery = (useEngineFields: boolean) => {
          const allowedSorts = useEngineFields
            ? ["created_at", "relevance_score", "title", "fetched_at", "study_type"]
            : ["created_at", "title", "source"];
          const safeSortBy = allowedSorts.includes(sortBy)
            ? sortBy
            : "created_at";

          let query = supabase
            .from(STUDIES_TABLE)
            .select(useEngineFields ? STUDIES_SELECT_ENGINE : STUDIES_SELECT_LEGACY, { count: "exact" });

          query = applyStudiesFilters(query, useEngineFields);
          return query.order(safeSortBy, { ascending: sortDir }).range(offset, offset + limit - 1);
        };

        let { data, count, error } = await buildStudiesQuery(true);

        if (error && isMissingColumnError(error.message)) {
          logInfo("admin.studies.legacy-fallback", { error: error.message });
          const legacyResult = await buildStudiesQuery(false);
          data = legacyResult.data?.map((row) => normalizeLegacyStudyRow(row as Record<string, unknown>));
          count = legacyResult.count;
          error = legacyResult.error;
        }

        if (error) {
          return Response.json({ error: error.message }, { status: 500 });
        }

        return Response.json({
          studies: data ?? [],
          total: count ?? 0,
          page,
          limit,
          totalPages: Math.ceil((count ?? 0) / limit),
        });
      }

      // ── STUDY UPDATE ──────────────────────────────────────────────────
      case "study-update": {
        const studyId = body.studyId as string;
        if (!studyId) return Response.json({ error: "studyId required" }, { status: 400 });

        const updatePayload: Record<string, unknown> = {};
        if (body.qualityStatus !== undefined) updatePayload.quality_status = body.qualityStatus;
        if (body.reviewNote !== undefined) updatePayload.review_note = body.reviewNote;
        if (body.tags !== undefined) updatePayload.tags = body.tags;
        if (body.title !== undefined) updatePayload.title = body.title;
        if (body.description !== undefined) updatePayload.description = body.description;
        if (body.editorialPriority !== undefined) updatePayload.editorial_priority = body.editorialPriority;

        if (body.qualityStatus !== undefined) {
          updatePayload.reviewed_at = new Date().toISOString();
          updatePayload.reviewed_by = adminOrResponse.userId;
        }

        if (Object.keys(updatePayload).length === 0) {
          return Response.json({ error: "No fields to update" }, { status: 400 });
        }

        const { data, error } = await supabase
          .from(STUDIES_TABLE)
          .update(updatePayload)
          .eq("id", studyId)
          .select()
          .single();

        if (error) return Response.json({ error: error.message }, { status: 500 });

        logInfo("admin.study-update", { studyId, fields: Object.keys(updatePayload), by: adminOrResponse.userId });
        return Response.json({ study: data });
      }

      // ── STUDY DELETE ──────────────────────────────────────────────────
      case "study-delete": {
        const studyId = body.studyId as string;
        if (!studyId) return Response.json({ error: "studyId required" }, { status: 400 });

        const { error } = await supabase.from(STUDIES_TABLE).delete().eq("id", studyId);
        if (error) return Response.json({ error: error.message }, { status: 500 });

        logInfo("admin.study-delete", { studyId, by: adminOrResponse.userId });
        return Response.json({ deleted: true });
      }

      // ── ENGINE TRIGGER ────────────────────────────────────────────────
      case "engine-trigger": {
        const { getCronSecret } = await import("@/lib/env");
        const cronSecret = getCronSecret();
        const params = new URLSearchParams({ "x-cron-key": cronSecret });
        if (body.dryRun) params.set("dryRun", "true");
        if (body.lookbackDays) params.set("lookbackDays", String(body.lookbackDays));
        if (body.maxProcessed) params.set("maxProcessed", String(body.maxProcessed));

        const baseUrl = getBaseUrl(req);
        const url = `${baseUrl}/api/automation/engine-sync?${params.toString()}`;

        const res = await fetch(url, { cache: "no-store" });
        const result = await res.json();

        logInfo("admin.engine-trigger", { by: adminOrResponse.userId, dryRun: !!body.dryRun });
        return Response.json(result);
      }

      // ── ENGINE ADAPT ──────────────────────────────────────────────────
      case "engine-adapt": {
        const { getCronSecret } = await import("@/lib/env");
        const cronSecret = getCronSecret();

        const baseUrl = getBaseUrl(req);
        const url = `${baseUrl}/api/automation/engine-adapt?x-cron-key=${encodeURIComponent(cronSecret)}`;

        const res = await fetch(url, { cache: "no-store" });
        const result = await res.json();

        logInfo("admin.engine-adapt", { by: adminOrResponse.userId });
        return Response.json(result);
      }

      // ── ENGINE REPROCESS ──────────────────────────────────────────────
      case "engine-reprocess": {
        const { getCronSecret } = await import("@/lib/env");
        const cronSecret = getCronSecret();
        const params = new URLSearchParams({ "x-cron-key": cronSecret });
        if (body.batchSize) params.set("batchSize", String(body.batchSize));

        const baseUrl = getBaseUrl(req);
        const url = `${baseUrl}/api/automation/engine-reprocess?${params.toString()}`;

        const res = await fetch(url, { cache: "no-store" });
        const result = await res.json();

        logInfo("admin.engine-reprocess", { by: adminOrResponse.userId });
        return Response.json(result);
      }

      // ── ENGINE LOGS ───────────────────────────────────────────────────
      case "engine-logs": {
        const limit = Math.min(50, Math.max(1, Number(body.limit) || 20));

        const { data, error } = await supabase
          .from(AUTOMATION_RUNS_TABLE)
          .select("*")
          .order("finished_at", { ascending: false })
          .limit(limit);

        if (error) return Response.json({ error: error.message }, { status: 500 });
        return Response.json({ runs: data ?? [] });
      }

      // ── ANALYTICS ─────────────────────────────────────────────────────
      case "analytics": {
        // Top studies by score
        const { data: topStudies } = await supabase
          .from(STUDIES_TABLE)
          .select("id, title, relevance_score, study_type, editorial_priority, origin_label, matched_topics")
          .order("relevance_score", { ascending: false })
          .limit(20);

        // Score distribution buckets
        const { data: allScores } = await supabase
          .from(STUDIES_TABLE)
          .select("relevance_score");

        const distribution = { "0-20": 0, "21-40": 0, "41-60": 0, "61-80": 0, "81-100": 0 };
        for (const row of allScores ?? []) {
          const s = (row.relevance_score as number) ?? 0;
          if (s <= 20) distribution["0-20"]++;
          else if (s <= 40) distribution["21-40"]++;
          else if (s <= 60) distribution["41-60"]++;
          else if (s <= 80) distribution["61-80"]++;
          else distribution["81-100"]++;
        }

        // Source breakdown
        const { data: sourceData } = await supabase
          .from(STUDIES_TABLE)
          .select("origin_label");

        const sourceCounts: Record<string, number> = {};
        for (const row of sourceData ?? []) {
          const label = (row.origin_label as string) || "Unknown";
          sourceCounts[label] = (sourceCounts[label] ?? 0) + 1;
        }
        const topSources = Object.entries(sourceCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 15)
          .map(([source, count]) => ({ source, count }));

        // Type breakdown
        const { data: typeData } = await supabase
          .from(STUDIES_TABLE)
          .select("study_type");

        const typeCounts: Record<string, number> = {};
        for (const row of typeData ?? []) {
          const t = (row.study_type as string) || "unknown";
          typeCounts[t] = (typeCounts[t] ?? 0) + 1;
        }

        // Priority breakdown
        const { data: prioData } = await supabase
          .from(STUDIES_TABLE)
          .select("editorial_priority");

        const prioCounts: Record<string, number> = {};
        for (const row of prioData ?? []) {
          const p = (row.editorial_priority as string) || "unknown";
          prioCounts[p] = (prioCounts[p] ?? 0) + 1;
        }

        // Feedback stats
        const { count: totalFeedback } = await supabase
          .from("study_feedback")
          .select("id", { count: "exact", head: true });

        return Response.json({
          topStudies: topStudies ?? [],
          scoreDistribution: distribution,
          topSources,
          typeCounts,
          priorityCounts: prioCounts,
          totalFeedbackEvents: totalFeedback ?? 0,
        });
      }

      // ── SETTINGS GET ──────────────────────────────────────────────────
      case "settings-get": {
        // Current adaptive weights
        const { data: latestWeights } = await supabase
          .from("scoring_weights_history")
          .select("weights, reason, based_on_studies, computed_at")
          .order("computed_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        // Env-based config (read-only display)
        const lookbackDays = Number(process.env.STUDY_SYNC_LOOKBACK_DAYS) || 3;
        const maxAttempts = Number(process.env.STUDY_SYNC_MAX_ATTEMPTS) || 5;
        const studyLimit = Number(process.env.STUDY_LIMIT) || 80;

        return Response.json({
          adaptiveWeights: latestWeights ?? null,
          envConfig: {
            lookbackDays,
            maxAttempts,
            studyLimit,
          },
        });
      }

      // ── SETTINGS UPDATE ───────────────────────────────────────────────
      case "settings-update": {
        // Store custom weights override
        if (body.weights) {
          const { error } = await supabase.from("scoring_weights_history").insert({
            weights: body.weights,
            reason: `Manual override by admin ${adminOrResponse.email ?? adminOrResponse.userId}`,
            based_on_studies: 0,
            computed_at: new Date().toISOString(),
          });
          if (error) return Response.json({ error: error.message }, { status: 500 });

          logInfo("admin.settings-update", { by: adminOrResponse.userId, weights: body.weights });
          return Response.json({ saved: true });
        }

        return Response.json({ error: "No settings provided" }, { status: 400 });
      }

      default:
        return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Admin API error";
    logError("admin.dashboard.exception", { message });
    return Response.json({ error: message }, { status: 500 });
  }
}
