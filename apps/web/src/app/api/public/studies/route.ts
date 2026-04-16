// ──────────────────────────────────────────────────────────────────────────────
// Public Studies API
// ──────────────────────────────────────────────────────────────────────────────
//
// GET /api/public/studies
//
// Returns curated, high-quality studies from the database for public display.
// No authentication required — only approved/good-status studies are exposed.
//
// Query parameters:
//   category    – filter by primary category (e.g. "anbau-postharvest")
//   limit       – max results, 1–50, default 20
//   page        – page number, default 1
//   mode        – "featured" | "recent" | "top" (default: "top")
//                 featured: featured=true flag first, then top score
//                 recent:   ordered by fetched_at desc
//                 top:      ordered by relevance_score desc
//   minScore    – minimum relevance_score, default 0
//
// Response shape:
//   { studies: StudyPublic[], total: number, page: number, totalPages: number }
// ──────────────────────────────────────────────────────────────────────────────

import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { PUBLIC_STUDIES_QUALITY_FILTER } from "@/lib/studiesQuery";

export const dynamic = "force-dynamic";

const STUDIES_TABLE = "studies";
const MAX_LIMIT = 50;
const DEFAULT_LIMIT = 20;
const CACHE_SECONDS = 120; // 2-minute CDN cache

type StudyRow = {
  id: string;
  title: string;
  description: string | null;
  source: string | null;
  tags: string[];
  category: string | null;
  relevance_score: number | null;
  editorial_priority: string | null;
  study_type: string | null;
  matched_topics: string[];
  first_author: string | null;
  origin_label: string | null;
  abstract_snippet: string | null;
  doi: string | null;
  fetched_at: string | null;
  featured: boolean;
};

type StudyPublic = {
  id: string;
  title: string;
  summary: string | null;
  source: string | null;
  doi: string | null;
  category: string | null;
  topics: string[];
  tags: string[];
  studyType: string | null;
  relevanceScore: number;
  editorialPriority: string | null;
  firstAuthor: string | null;
  originLabel: string | null;
  abstractSnippet: string | null;
  fetchedAt: string | null;
  featured: boolean;
};

function clampInt(raw: string | null, min: number, max: number, fallback: number): number {
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < min || n > max) return fallback;
  return n;
}

function sanitizeCategory(raw: string | null | undefined): string | null {
  const ALLOWED = [
    "anbau-postharvest",
    "qualitaet-labor",
    "pharmakologie",
    "medizin-evidenz",
    "markt-regulierung",
  ];
  if (!raw) return null;
  return ALLOWED.includes(raw) ? raw : null;
}

function toPublic(row: StudyRow): StudyPublic {
  return {
    id: row.id,
    title: row.title,
    summary: row.description ?? row.abstract_snippet ?? null,
    source: row.source,
    doi: row.doi,
    category: row.category,
    topics: row.matched_topics ?? [],
    tags: row.tags ?? [],
    studyType: row.study_type,
    relevanceScore: row.relevance_score ?? 0,
    editorialPriority: row.editorial_priority,
    firstAuthor: row.first_author,
    originLabel: row.origin_label,
    abstractSnippet: row.abstract_snippet,
    fetchedAt: row.fetched_at,
    featured: row.featured ?? false,
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);

  const rawLimit    = url.searchParams.get("limit");
  const rawPage     = url.searchParams.get("page");
  const rawCategory = url.searchParams.get("category");
  const rawMode     = url.searchParams.get("mode");
  const rawMinScore = url.searchParams.get("minScore");

  const limit    = clampInt(rawLimit, 1, MAX_LIMIT, DEFAULT_LIMIT);
  const page     = clampInt(rawPage, 1, 10_000, 1);
  const category = sanitizeCategory(rawCategory);
  const minScore = clampInt(rawMinScore, 0, 100, 0);

  const mode = rawMode === "recent" || rawMode === "featured" || rawMode === "top"
    ? rawMode
    : "top";

  const offset = (page - 1) * limit;

  try {
    const supabase = getSupabaseServerClient();

    let query = supabase
      .from(STUDIES_TABLE)
      .select(
        "id, title, description, source, tags, category, relevance_score, editorial_priority, study_type, matched_topics, first_author, origin_label, abstract_snippet, doi, fetched_at, featured",
        { count: "exact" }
      )
      // Serve reviewed+approved studies OR auto-ingested studies with high/medium editorial priority
      .or(PUBLIC_STUDIES_QUALITY_FILTER)
      .gte("relevance_score", minScore);

    if (category) {
      query = query.eq("category", category);
    }

    // Ordering
    if (mode === "featured") {
      query = query
        .order("featured", { ascending: false })
        .order("relevance_score", { ascending: false });
    } else if (mode === "recent") {
      query = query.order("fetched_at", { ascending: false, nullsFirst: false });
    } else {
      // "top" (default)
      query = query.order("relevance_score", { ascending: false, nullsFirst: false });
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      return Response.json(
        { error: "Failed to load studies", studies: [], total: 0, page, totalPages: 0 },
        { status: 500 },
      );
    }

    const rows = (data ?? []) as StudyRow[];
    const total = count ?? rows.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return Response.json(
      {
        studies: rows.map(toPublic),
        total,
        page,
        totalPages,
        category: category ?? null,
        mode,
        generatedAt: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=300`,
        },
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json(
      { error: message, studies: [], total: 0, page, totalPages: 0 },
      { status: 500 },
    );
  }
}
