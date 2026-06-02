// ────────────────────────────────────────────────────────────────────────────
// POST /api/knowledge/events
//
// Append-only analytics ingestion for the knowledge layer (Phase 8). Feeds the
// future recommendation engine. Accepts anonymous events; RLS allows insert.
// ────────────────────────────────────────────────────────────────────────────

import { z } from "zod";
import { logError } from "@/lib/log";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { recordEvent } from "@/lib/knowledge/db";

export const dynamic = "force-dynamic";

const eventSchema = z.object({
  eventType: z.enum([
    "view",
    "scroll_depth",
    "read_complete",
    "link_click",
    "search_query",
    "diagnostic_launch",
    "calculator_launch",
    "graph_traverse",
  ]),
  articleId: z.string().uuid().optional(),
  sessionId: z.string().trim().max(200).optional(),
  value: z.number().optional(),
  query: z.string().trim().max(200).optional(),
  targetSlug: z.string().trim().max(200).optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = eventSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: "Invalid event", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const supabase = getSupabaseServerClient();
    await recordEvent(supabase, parsed.data);

    return Response.json({ ok: true }, { status: 202 });
  } catch (error) {
    logError("api.knowledge.events.exception", {
      message: error instanceof Error ? error.message : String(error),
    });
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
