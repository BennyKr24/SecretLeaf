// ──────────────────────────────────────────────────────────────────────────────
// Admin Dashboard API — DEPRECATED, wird abgebaut
// ──────────────────────────────────────────────────────────────────────────────
//
// Die alte Sammel-Route (POST + `switch(action)`). Neue Flächen laufen über
// echte Ressourcen-Routen unter /api/admin/<modul>/ (siehe
// docs/ADMIN_PANEL_OVERHAUL_PLAN.md §7). Hier stehen nur noch die Actions,
// deren Seiten noch nicht migriert sind:
//
//   studies, study-update, study-delete   → wandern nach /api/admin/content/studies
//   users-list, user-update-role, user-delete → wandern nach /api/admin/users
//   ai-assist                             → wandert nach /api/admin/assistant
//
// Entfernt (Seiten gelöscht / ersetzt): overview, system-stats (→ /api/admin/briefing),
// engine-trigger/-adapt/-reprocess/-logs (→ /api/admin/ops[/run]),
// analytics, algorithm-get/-update/-reset, weights-history.
// ──────────────────────────────────────────────────────────────────────────────

import { requireAdmin } from "@/lib/serverAuth";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
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

type AdminAction = "studies" | "study-update" | "study-delete" | "ai-assist";

export async function POST(req: Request) {
  const adminOrResponse = await requireAdmin(req);
  if (adminOrResponse instanceof Response) return adminOrResponse;

  try {
    const body = (await req.json()) as { action: AdminAction } & Record<string, unknown>;
    const { action } = body;
    const supabase = getSupabaseServerClient();

    switch (action) {
      // ── STUDIES LIST ──────────────────────────────────────────────────
      case "studies": {
        const page = Math.max(1, Number(body.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(body.limit) || 25));
        const offset = (page - 1) * limit;
        const sortBy = (body.sortBy as string) || "created_at";
        const sortDir = body.sortDir === "asc" ? true : false;

        type FilterableQuery<TSelf> = {
          eq: (column: string, value: unknown) => TSelf;
          gte: (column: string, value: unknown) => TSelf;
          lte: (column: string, value: unknown) => TSelf;
          ilike: (column: string, pattern: string) => TSelf;
        };

        const applyStudiesFilters = <TQuery extends FilterableQuery<TQuery>>(
          query: TQuery,
          useEngineFields: boolean,
        ): TQuery => {
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
          const safeSortBy = allowedSorts.includes(sortBy) ? sortBy : "created_at";

          const query = supabase
            .from(STUDIES_TABLE)
            .select(useEngineFields ? STUDIES_SELECT_ENGINE : STUDIES_SELECT_LEGACY, { count: "exact" });

          const filteredQuery = applyStudiesFilters(query, useEngineFields);
          return filteredQuery.order(safeSortBy, { ascending: sortDir }).range(offset, offset + limit - 1);
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
            normalizeLegacyStudyRow(row),
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

      // ── AI ASSIST (Claude) ───────────────────────────────────────────
      case "ai-assist": {
        const { isFeatureEnabled } = await import("@/lib/featureFlags");
        if (!(await isFeatureEnabled("ai_assistant"))) {
          return Response.json(
            { error: "Der KI-Assistent ist aktuell deaktiviert (Steuerung → Feature-Flags)." },
            { status: 403 },
          );
        }

        const prompt = (body.prompt as string | undefined)?.trim();
        if (!prompt) {
          return Response.json({ error: "prompt fehlt" }, { status: 400 });
        }
        if (prompt.length > 8000) {
          return Response.json({ error: "prompt zu lang (max. 8000 Zeichen)" }, { status: 400 });
        }

        const { askClaude } = await import("@/lib/ai/anthropic");
        try {
          const reply = await askClaude(
            prompt,
            "Du hilfst dem Admin-Team von SecretLeaf (einer Cannabis-Grow-App) bei Notizen, " +
              "Content-Entwürfen (z. B. Wissensartikel, Studien-Zusammenfassungen) und Ideen für die App. " +
              "Antworte auf Deutsch, präzise und ohne Floskeln.",
            { feature: "admin-assistant", actorId: adminOrResponse.userId },
          );
          logInfo("admin.ai-assist", { by: adminOrResponse.userId, promptLength: prompt.length });
          return Response.json({ reply });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Claude-Anfrage fehlgeschlagen";
          logError("admin.ai-assist.exception", { message });
          return Response.json({ error: message }, { status: 502 });
        }
      }

      default:
        return Response.json({ error: `Unknown or removed action: ${action}` }, { status: 400 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Admin API error";
    logError("admin.dashboard.exception", { message });
    return Response.json({ error: message }, { status: 500 });
  }
}
