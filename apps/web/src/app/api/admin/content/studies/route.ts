// ────────────────────────────────────────────────────────────────────────────
// GET /api/admin/content/studies — studies moderation queue (filter, sort, page)
//
// Ported from the old POST /api/admin/dashboard `case "studies"`. Keeps the
// engine-columns / legacy-columns fallback: a prod DB missing the engine
// fields (relevance_score, study_type, …) gets a reduced select and the
// missing fields normalised to null (docs/ADMIN_PANEL_OVERHAUL_PLAN.md §4.5).
// ────────────────────────────────────────────────────────────────────────────

import { adminRoute, parseQuery } from "@/lib/admin/http";
import { adminStudiesQuerySchema, type AdminStudiesResponse, type StudyRow } from "@/lib/admin/contracts";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

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

function normalizeLegacyStudyRow(row: Record<string, unknown>): StudyRow {
  return {
    ...(row as unknown as StudyRow),
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

type FilterableQuery<TSelf> = {
  eq: (column: string, value: unknown) => TSelf;
  gte: (column: string, value: unknown) => TSelf;
  lte: (column: string, value: unknown) => TSelf;
  ilike: (column: string, pattern: string) => TSelf;
};

export const GET = adminRoute(async ({ url }): Promise<AdminStudiesResponse> => {
  const q = parseQuery(url, adminStudiesQuerySchema);
  const offset = (q.page - 1) * q.limit;
  const supabase = getSupabaseServerClient();

  const applyFilters = <TQuery extends FilterableQuery<TQuery>>(
    query: TQuery,
    useEngineFields: boolean,
  ): TQuery => {
    let next = query;
    if (q.quality && q.quality !== "all") next = next.eq("quality_status", q.quality);
    if (useEngineFields && q.minScore !== undefined) next = next.gte("relevance_score", q.minScore);
    if (useEngineFields && q.maxScore !== undefined) next = next.lte("relevance_score", q.maxScore);
    if (q.source) next = next.ilike(useEngineFields ? "origin_label" : "source", `%${q.source}%`);
    if (q.dateFrom) next = next.gte("created_at", q.dateFrom);
    if (q.dateTo) next = next.lte("created_at", q.dateTo);
    if (q.search) next = next.ilike("title", `%${q.search}%`);
    if (useEngineFields && q.studyType && q.studyType !== "all") next = next.eq("study_type", q.studyType);
    if (useEngineFields && q.priority && q.priority !== "all") next = next.eq("editorial_priority", q.priority);
    return next;
  };

  const buildQuery = (useEngineFields: boolean) => {
    const allowedSorts = useEngineFields
      ? ["created_at", "relevance_score", "title", "fetched_at", "study_type"]
      : ["created_at", "title", "source"];
    const safeSortBy = q.sortBy && allowedSorts.includes(q.sortBy) ? q.sortBy : "created_at";

    const base = supabase
      .from(STUDIES_TABLE)
      .select(useEngineFields ? STUDIES_SELECT_ENGINE : STUDIES_SELECT_LEGACY, { count: "exact" });

    return applyFilters(base, useEngineFields)
      .order(safeSortBy, { ascending: q.sortDir === "asc" })
      .range(offset, offset + q.limit - 1);
  };

  let rows: Array<Record<string, unknown>> | null = null;
  let total: number | null = null;

  const engineResult = await buildQuery(true);
  rows = (engineResult.data as Array<Record<string, unknown>> | null) ?? null;
  total = engineResult.count ?? null;
  let errMsg = engineResult.error?.message ?? null;

  if (errMsg && isMissingColumnError(errMsg)) {
    const legacyResult = await buildQuery(false);
    rows = ((legacyResult.data as Array<Record<string, unknown>> | null) ?? []).map(normalizeLegacyStudyRow);
    total = legacyResult.count ?? null;
    errMsg = legacyResult.error?.message ?? null;
  }

  if (errMsg) throw new Error(errMsg);

  const count = total ?? 0;
  return {
    studies: (rows ?? []) as StudyRow[],
    total: count,
    page: q.page,
    limit: q.limit,
    totalPages: Math.max(1, Math.ceil(count / q.limit)),
  };
});
