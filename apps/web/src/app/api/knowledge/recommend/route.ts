// ────────────────────────────────────────────────────────────────────────────
// GET /api/knowledge/recommend?slug=<slug>&tools=<n>&articles=<n>
//
// The activation endpoint (Phase 15). Returns the unified recommendation for an
// article: ranked tools, diagnoses, calculators and related articles — the
// connected view across the knowledge graph, the tool registry and the
// diagnosis system. Powers the "now what should I do?" surface on an article.
//
// Public, read-only, CDN-cacheable.
// ────────────────────────────────────────────────────────────────────────────

import { z } from "zod";
import { logError } from "@/lib/log";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { recommendForArticle } from "@/lib/knowledge/service";

export const revalidate = 300;

const READ_CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
} as const;

const querySchema = z.object({
  slug: z.string().trim().min(1).max(200),
  tools: z.coerce.number().int().min(1).max(50).default(12),
  articles: z.coerce.number().int().min(1).max(50).default(8),
});

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const parsed = querySchema.safeParse({
      slug: url.searchParams.get("slug") ?? undefined,
      tools: url.searchParams.get("tools") ?? undefined,
      articles: url.searchParams.get("articles") ?? undefined,
    });

    if (!parsed.success) {
      return Response.json(
        { error: "Invalid query", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const supabase = getSupabaseServerClient();
    const { slug, tools, articles } = parsed.data;

    const recommendation = await recommendForArticle(supabase, slug, {
      toolLimit: tools,
      articleLimit: articles,
    });

    if (!recommendation) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    return Response.json({ recommendation }, { headers: READ_CACHE_HEADERS });
  } catch (error) {
    logError("api.knowledge.recommend.exception", {
      message: error instanceof Error ? error.message : String(error),
    });
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
