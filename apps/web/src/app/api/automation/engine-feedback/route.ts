// ──────────────────────────────────────────────────────────────────────────────
// Study Engine – Feedback API Route
// ──────────────────────────────────────────────────────────────────────────────
//
// POST /api/automation/engine-feedback
// Records user interaction events for the self-improving engine.
//
// Body:
//   { studyId: string, eventType: "view"|"click"|"review_good"|"review_bad"|"review_skip"|"search_hit", userId?: string }
//   OR array of same for batch
// ──────────────────────────────────────────────────────────────────────────────

import { recordFeedback, recordFeedbackBatch } from "@/lib/engine/feedback";
import type { FeedbackEvent, FeedbackEventType } from "@/lib/engine";
import { logError, logInfo } from "@/lib/log";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { PipelineLogAggregator } from "@/lib/engine";

export const dynamic = "force-dynamic";

const VALID_EVENT_TYPES = new Set<FeedbackEventType>([
  "view",
  "click",
  "review_good",
  "review_bad",
  "review_skip",
  "search_hit",
]);

function isValidEvent(obj: unknown): obj is { studyId: string; eventType: FeedbackEventType; userId?: string } {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.studyId === "string" &&
    o.studyId.length > 0 &&
    typeof o.eventType === "string" &&
    VALID_EVENT_TYPES.has(o.eventType as FeedbackEventType)
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const supabase = getSupabaseServerClient();
    const logs = new PipelineLogAggregator();
    const logger = logs.createLogger("feedback-api");

    // Support single event or batch
    if (Array.isArray(body)) {
      const events: FeedbackEvent[] = [];
      for (const item of body) {
        if (!isValidEvent(item)) continue;
        events.push({
          studyId: item.studyId,
          eventType: item.eventType,
          userId: item.userId ?? null,
        });
      }

      if (events.length === 0) {
        return Response.json({ error: "No valid events in batch" }, { status: 400 });
      }

      const result = await recordFeedbackBatch(supabase, events, logger);

      logInfo("engine-feedback.batch", {
        recorded: result.recorded,
        failed: result.failed,
      });

      return Response.json({
        recorded: result.recorded,
        failed: result.failed,
      });
    }

    // Single event
    if (!isValidEvent(body)) {
      return Response.json(
        { error: "Invalid event. Required: studyId (string), eventType (view|click|review_good|review_bad|review_skip|search_hit)" },
        { status: 400 },
      );
    }

    const event: FeedbackEvent = {
      studyId: body.studyId,
      eventType: body.eventType,
      userId: body.userId ?? null,
    };

    const success = await recordFeedback(supabase, event, logger);

    return Response.json({ recorded: success ? 1 : 0 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Feedback recording failed";
    logError("engine-feedback.exception", { message });
    return Response.json({ error: message }, { status: 500 });
  }
}
