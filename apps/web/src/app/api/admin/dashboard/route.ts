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
  | "settings-update"
  | "users-list"
  | "user-update-role"
  | "user-delete"
  | "system-stats"
  | "algorithm-get"
  | "algorithm-update"
  | "algorithm-reset";

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
          query: any,
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

        let studiesData: Array<Record<string, unknown>> | null = null;
        let totalCount: number | null = null;
        let queryError: string | null = null;

        const engineResult = await buildStudiesQuery(true);
        studiesData = (engineResult.data as Array<Record<string, unknown>> | null) ?? null;
        totalCount = engineResult.count ?? null;
        queryError = engineResult.error?.message ?? null;

        if (queryError && isMissingColumnError(queryError)) {
          logInfo("admin.studies.legacy-fallback", { error: queryError });
          const legacyResult = await buildStudiesQuery(false);
          studiesData = ((legacyResult.data as Array<Record<string, unknown>> | null) ?? []).map((row) =>
            normalizeLegacyStudyRow(row)
          );
          totalCount = legacyResult.count ?? null;
          queryError = legacyResult.error?.message ?? null;
        }

        if (queryError) {
          return Response.json({ error: queryError }, { status: 500 });
        }

        return Response.json({
          studies: studiesData ?? [],
          total: totalCount ?? 0,
          page,
          limit,
          totalPages: Math.ceil((totalCount ?? 0) / limit),
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

      // ── USERS LIST ────────────────────────────────────────────────────
      case "users-list": {
        const page = Math.max(1, Number(body.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(body.limit) || 25));
        const searchQuery = typeof body.search === "string" ? body.search.trim() : "";
        const roleFilter = typeof body.roleFilter === "string" ? body.roleFilter : "all";

        // Fetch users from Supabase Auth admin API (uses service role key)
        const { data: authResponse, error: authError } = await supabase.auth.admin.listUsers({
          page,
          perPage: limit,
        });

        if (authError) {
          return Response.json({ error: authError.message }, { status: 500 });
        }

        const authUsers = authResponse?.users ?? [];

        // Get all user roles
        const userIds = authUsers.map((u) => u.id);
        const { data: roleRows } = await supabase
          .from("user_roles")
          .select("user_id, role")
          .in("user_id", userIds);

        const roleMap: Record<string, string> = {};
        for (const row of roleRows ?? []) {
          roleMap[(row as { user_id: string; role: string }).user_id] =
            (row as { user_id: string; role: string }).role;
        }

        let users = authUsers.map((u) => ({
          id: u.id,
          email: u.email ?? null,
          role: roleMap[u.id] ?? "CONSUMER",
          createdAt: u.created_at,
          lastSignIn: u.last_sign_in_at ?? null,
          emailConfirmed: !!u.email_confirmed_at,
          provider: u.app_metadata?.provider ?? "email",
        }));

        // Apply filters client-side (auth.admin.listUsers doesn't support filtering)
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          users = users.filter(
            (u) =>
              (u.email && u.email.toLowerCase().includes(q)) ||
              u.id.toLowerCase().includes(q),
          );
        }
        if (roleFilter !== "all") {
          users = users.filter((u) => u.role === roleFilter);
        }

        // Get total count from auth
        // Supabase admin listUsers returns all users paginated, we'll estimate total
        // The actual total is available through a separate count
        const { data: countData } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
        const totalUsers = countData?.users ? (authResponse as any)?.total ?? users.length : users.length;

        return Response.json({
          users,
          total: totalUsers,
          page,
          limit,
          totalPages: Math.ceil(totalUsers / limit),
        });
      }

      // ── USER UPDATE ROLE ──────────────────────────────────────────────
      case "user-update-role": {
        const userId = body.userId as string;
        const newRole = body.role as string;

        if (!userId) return Response.json({ error: "userId required" }, { status: 400 });
        if (!newRole || !["CONSUMER", "PROVIDER", "ADMIN"].includes(newRole)) {
          return Response.json({ error: "Invalid role. Must be CONSUMER, PROVIDER, or ADMIN." }, { status: 400 });
        }

        // Prevent admin from demoting themselves
        if (userId === adminOrResponse.userId && newRole !== "ADMIN") {
          return Response.json({ error: "Du kannst deine eigene Admin-Rolle nicht entfernen." }, { status: 400 });
        }

        const { error } = await supabase
          .from("user_roles")
          .upsert({ user_id: userId, role: newRole }, { onConflict: "user_id" });

        if (error) return Response.json({ error: error.message }, { status: 500 });

        logInfo("admin.user-update-role", { userId, newRole, by: adminOrResponse.userId });
        return Response.json({ updated: true, userId, role: newRole });
      }

      // ── USER DELETE ───────────────────────────────────────────────────
      case "user-delete": {
        const userId = body.userId as string;
        if (!userId) return Response.json({ error: "userId required" }, { status: 400 });

        // Prevent admin from deleting themselves
        if (userId === adminOrResponse.userId) {
          return Response.json({ error: "Du kannst deinen eigenen Account nicht löschen." }, { status: 400 });
        }

        // Delete from user_roles first
        await supabase.from("user_roles").delete().eq("user_id", userId);

        // Delete from Supabase Auth
        const { error: authError } = await supabase.auth.admin.deleteUser(userId);
        if (authError) return Response.json({ error: authError.message }, { status: 500 });

        logInfo("admin.user-delete", { userId, by: adminOrResponse.userId });
        return Response.json({ deleted: true });
      }

      // ── SYSTEM STATS ──────────────────────────────────────────────────
      case "system-stats": {
        // User counts by role
        const { data: roleCounts } = await supabase
          .from("user_roles")
          .select("role");

        const usersByRole: Record<string, number> = { CONSUMER: 0, PROVIDER: 0, ADMIN: 0 };
        for (const row of roleCounts ?? []) {
          const r = (row as { role: string }).role;
          usersByRole[r] = (usersByRole[r] ?? 0) + 1;
        }

        // Total auth users
        const { data: authCount } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
        const totalAuthUsers = (authCount as any)?.total ?? 0;

        // Studies count
        const { count: studiesCount } = await supabase
          .from(STUDIES_TABLE)
          .select("id", { count: "exact", head: true });

        // Automation runs (last 24h)
        const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { count: runsLast24h } = await supabase
          .from(AUTOMATION_RUNS_TABLE)
          .select("id", { count: "exact", head: true })
          .gte("finished_at", since24h);

        // Feedback count
        const { count: feedbackCount } = await supabase
          .from("study_feedback")
          .select("id", { count: "exact", head: true });

        return Response.json({
          usersByRole,
          totalAuthUsers,
          totalStudies: studiesCount ?? 0,
          automationRunsLast24h: runsLast24h ?? 0,
          totalFeedbackEvents: feedbackCount ?? 0,
        });
      }

      // ── ALGORITHM GET ─────────────────────────────────────────────────
      case "algorithm-get": {
        const { loadFullConfig, isEngineConfigTableAvailable } = await import("@/lib/engine/configLoader");
        const tableExists = await isEngineConfigTableAvailable(supabase);
        const { config: algoConfig, fromDatabase } = await loadFullConfig(supabase);

        return Response.json({
          config: algoConfig,
          fromDatabase,
          tableExists,
        });
      }

      // ── ALGORITHM UPDATE ──────────────────────────────────────────────
      case "algorithm-update": {
        const section = body.section as string;
        const value = body.value;

        if (!section || value === undefined) {
          return Response.json({ error: "section and value required" }, { status: 400 });
        }

        const validSections = [
          "required_keywords",
          "preferred_sources",
          "blocked_sources",
          "custom_exclusions",
          "topic_clusters",
          "scoring_params",
          "cannabis_anchor",
        ];
        if (!validSections.includes(section)) {
          return Response.json({ error: `Invalid section: ${section}` }, { status: 400 });
        }

        const { saveConfigSection, resetConfigCache } = await import("@/lib/engine/configLoader");
        resetConfigCache();
        const result = await saveConfigSection(
          supabase,
          section as Parameters<typeof saveConfigSection>[1],
          value as Parameters<typeof saveConfigSection>[2],
          adminOrResponse.userId,
        );

        if (!result.success) {
          return Response.json({ error: result.error }, { status: 500 });
        }

        logInfo("admin.algorithm-update", {
          section,
          by: adminOrResponse.userId,
        });

        return Response.json({ saved: true, section });
      }

      // ── ALGORITHM RESET ───────────────────────────────────────────────
      case "algorithm-reset": {
        const section = body.section as string;

        const { getDefaultConfig, saveConfigSection, resetConfigCache } = await import("@/lib/engine/configLoader");
        const defaults = getDefaultConfig();

        if (section && section !== "all") {
          const validSections = Object.keys(defaults);
          if (!validSections.includes(section)) {
            return Response.json({ error: `Invalid section: ${section}` }, { status: 400 });
          }
          resetConfigCache();
          const result = await saveConfigSection(
            supabase,
            section as keyof typeof defaults,
            defaults[section as keyof typeof defaults],
            adminOrResponse.userId,
          );
          if (!result.success) {
            return Response.json({ error: result.error }, { status: 500 });
          }

          logInfo("admin.algorithm-reset", { section, by: adminOrResponse.userId });
          return Response.json({ reset: true, section });
        }

        // Reset all sections
        resetConfigCache();
        for (const [key, val] of Object.entries(defaults)) {
          const result = await saveConfigSection(
            supabase,
            key as keyof typeof defaults,
            val as Parameters<typeof saveConfigSection>[2],
            adminOrResponse.userId,
          );
          if (!result.success) {
            return Response.json({ error: `Failed to reset ${key}: ${result.error}` }, { status: 500 });
          }
        }

        logInfo("admin.algorithm-reset", { section: "all", by: adminOrResponse.userId });
        return Response.json({ reset: true, section: "all" });
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
