// ──────────────────────────────────────────────────────────────────────────────
// Public Studies API – Grouped by Category
// ──────────────────────────────────────────────────────────────────────────────
//
// GET /api/public/studies/grouped
//
// Returns curated, high-quality studies from the database, grouped by their
// primary category. Designed for the platform's structured content sections.
// No authentication required — only approved/good-status studies are exposed.
//
// Query parameters:
//   limitPerCategory  – max studies per category, 1–20, default 8
//   minScore          – minimum relevance_score to include, 0–100, default 48
//
// Response shape:
//   {
//     groups: Array<{
//       category:   string,            // e.g. "anbau-postharvest"
//       label:      string,            // human-readable label
//       icon:       string,            // emoji icon
//       studies:    StudyPublic[],
//     }>,
//     total:        number,            // total studies across all groups
//     generatedAt:  string,
//   }
// ──────────────────────────────────────────────────────────────────────────────

import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { PUBLIC_STUDIES_QUALITY_FILTER } from "@/lib/studiesQuery";

export const dynamic = "force-dynamic";

const STUDIES_TABLE = "studies";
const MAX_LIMIT_PER_CATEGORY = 20;
const DEFAULT_LIMIT_PER_CATEGORY = 8;
const DEFAULT_MIN_SCORE = 48;
const CACHE_SECONDS = 120;

// ── Category display config ──────────────────────────────────────────────────
// Maps engine category slugs → display label + icon, in priority order.

export const CATEGORY_DISPLAY: Array<{
  key: string;
  label: string;
  icon: string;
  description: string;
}> = [
  {
    key: "anbau-postharvest",
    label: "Anbau & Postharvest",
    icon: "🌱",
    description: "Cultivation, grow environments, post-harvest handling and storage",
  },
  {
    key: "qualitaet-labor",
    label: "Qualität & Labor",
    icon: "🔬",
    description: "Lab analysis, contaminants, pesticides, heavy metals",
  },
  {
    key: "pharmakologie",
    label: "Pharmakologie",
    icon: "⚗️",
    description: "Pharmacokinetics, bioavailability, drug interactions",
  },
  {
    key: "medizin-evidenz",
    label: "Medizin & Evidenz",
    icon: "🩺",
    description: "Clinical trials, therapeutic applications, evidence-based medicine",
  },
  {
    key: "markt-regulierung",
    label: "Markt & Regulierung",
    icon: "📊",
    description: "Market data, regulation, policy, legalization",
  },
];

const CATEGORY_KEYS = CATEGORY_DISPLAY.map((c) => c.key);

// ── Types ────────────────────────────────────────────────────────────────────

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

// ── Helpers ──────────────────────────────────────────────────────────────────

function clampInt(raw: string | null, min: number, max: number, fallback: number): number {
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < min || n > max) return fallback;
  return n;
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

// ── Route Handler ────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  const url = new URL(request.url);

  const limitPerCategory = clampInt(
    url.searchParams.get("limitPerCategory"),
    1,
    MAX_LIMIT_PER_CATEGORY,
    DEFAULT_LIMIT_PER_CATEGORY,
  );

  const minScore = clampInt(
    url.searchParams.get("minScore"),
    0,
    100,
    DEFAULT_MIN_SCORE,
  );

  try {
    const supabase = getSupabaseServerClient();

    // Fetch the top N studies per category in a single query.
    // We over-fetch to ensure we have enough per category after server-side
    // grouping (each category gets up to `limitPerCategory` studies).
    const fetchLimit = CATEGORY_KEYS.length * MAX_LIMIT_PER_CATEGORY;

    const { data, error } = await supabase
      .from(STUDIES_TABLE)
      .select(
        "id, title, description, source, tags, category, relevance_score, editorial_priority, study_type, matched_topics, first_author, origin_label, abstract_snippet, doi, fetched_at, featured",
      )
      .or(PUBLIC_STUDIES_QUALITY_FILTER)
      .in("category", CATEGORY_KEYS)
      .gte("relevance_score", minScore)
      .order("relevance_score", { ascending: false, nullsFirst: false })
      .limit(fetchLimit);

    if (error) {
      return Response.json(
        { error: "Failed to load studies", groups: [], total: 0 },
        { status: 500 },
      );
    }

    const rows = (data ?? []) as StudyRow[];

    // Group by category, respecting the display priority order
    const byCategory = new Map<string, StudyPublic[]>();
    for (const row of rows) {
      const cat = row.category ?? "";
      if (!CATEGORY_KEYS.includes(cat)) continue;
      const existing = byCategory.get(cat) ?? [];
      if (existing.length < limitPerCategory) {
        existing.push(toPublic(row));
        byCategory.set(cat, existing);
      }
    }

    // Build ordered groups, skipping categories with no studies
    const groups = CATEGORY_DISPLAY
      .filter((c) => (byCategory.get(c.key)?.length ?? 0) > 0)
      .map((c) => ({
        category: c.key,
        label: c.label,
        icon: c.icon,
        description: c.description,
        studies: byCategory.get(c.key) ?? [],
      }));

    const total = groups.reduce((sum, g) => sum + g.studies.length, 0);

    return Response.json(
      {
        groups,
        total,
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
      { error: message, groups: [], total: 0 },
      { status: 500 },
    );
  }
}
