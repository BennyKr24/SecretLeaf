// ────────────────────────────────────────────────────────────────────────────
// GET /api/knowledge
//
//   ?slug=<slug>                 → single composed article
//   ?q=<term>                    → full-text search (published)
//   ?category=<slug>&limit&offset → article listing
//
// Public, read-only. Knowledge content is world-readable when published.
// ────────────────────────────────────────────────────────────────────────────

import { z } from "zod";
import { logError } from "@/lib/log";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import {
  getArticleBySlug,
  listArticles,
  searchArticles,
} from "@/lib/knowledge/db";

// Published knowledge is immutable between edits, so it is served through the
// CDN. API-1 remediation: cache reads at the edge (s-maxage) and serve stale
// while revalidating, instead of hitting Postgres on every request. Set
// `revalidate` so the route output is cacheable rather than force-dynamic.
export const revalidate = 300;

// Shared CDN cache policy for public, read-only knowledge responses.
const READ_CACHE_HEADERS = {
  "Cache-Control":
    "public, s-maxage=300, stale-while-revalidate=86400",
} as const;

const querySchema = z.object({
  slug: z.string().trim().min(1).max(200).optional(),
  q: z.string().trim().min(1).max(200).optional(),
  category: z.string().trim().min(1).max(200).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  offset: z.coerce.number().int().min(0).max(100_000).default(0),
});

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const parsed = querySchema.safeParse({
      slug: url.searchParams.get("slug") ?? undefined,
      q: url.searchParams.get("q") ?? undefined,
      category: url.searchParams.get("category") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
      offset: url.searchParams.get("offset") ?? undefined,
    });

    if (!parsed.success) {
      return Response.json(
        { error: "Invalid query", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const supabase = getSupabaseServerClient();
    const { slug, q, category, limit, offset } = parsed.data;

    if (slug) {
      const article = await getArticleBySlug(supabase, slug);
      if (!article) {
        return Response.json({ error: "Not found" }, { status: 404 });
      }
      return Response.json({ article }, { headers: READ_CACHE_HEADERS });
    }

    if (q) {
      const results = await searchArticles(supabase, q, limit);
      return Response.json(
        { query: q, results, total: results.length },
        { headers: READ_CACHE_HEADERS },
      );
    }

    const articles = await listArticles(supabase, {
      categorySlug: category,
      limit,
      offset,
    });
    return Response.json(
      { articles, limit, offset },
      { headers: READ_CACHE_HEADERS },
    );
  } catch (error) {
    logError("api.knowledge.exception", {
      message: error instanceof Error ? error.message : String(error),
    });
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
