// ────────────────────────────────────────────────────────────────────────────
// GET /api/knowledge/graph?slug=<slug>&depth=<n>&limit=<n>
//
// Returns the reachable knowledge-graph subgraph (nodes + typed, weighted edges)
// for a root article. Powers related-topics UI and AI context expansion.
// ────────────────────────────────────────────────────────────────────────────

import { z } from "zod";
import { logError } from "@/lib/log";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { traverseGraph } from "@/lib/knowledge/service";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  slug: z.string().trim().min(1).max(200),
  depth: z.coerce.number().int().min(1).max(5).default(2),
  limit: z.coerce.number().int().min(1).max(500).default(50),
});

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const parsed = querySchema.safeParse({
      slug: url.searchParams.get("slug") ?? undefined,
      depth: url.searchParams.get("depth") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
    });

    if (!parsed.success) {
      return Response.json(
        { error: "Invalid query", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const supabase = getSupabaseServerClient();
    const { slug, depth, limit } = parsed.data;

    const graph = await traverseGraph(supabase, slug, {
      maxDepth: depth,
      maxNodes: limit,
    });

    if (!graph) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    return Response.json({ graph });
  } catch (error) {
    logError("api.knowledge.graph.exception", {
      message: error instanceof Error ? error.message : String(error),
    });
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
