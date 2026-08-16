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
import { logError, logInfo, logWarn } from "@/lib/log";
import { getAuthenticatedUser } from "@/lib/serverAuth";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { PipelineLogAggregator } from "@/lib/engine";

export const dynamic = "force-dynamic";

const MAX_BATCH_SIZE = 50;

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
    // ── Auth: Only authenticated users may submit feedback ──────────────
    const auth = await getAuthenticatedUser(req);
    if (!auth) {
      logWarn("engine-feedback.unauthorized");
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Always the verified caller's id — never trust a client-supplied
    // userId, or any logged-in user could attribute events to someone else.
    const verifiedUserId = auth.user.id;

    const body = await req.json();

    const supabase = getSupabaseServerClient();
    const logs = new PipelineLogAggregator();
    const logger = logs.createLogger("feedback-api");

    // Support single event or batch
    if (Array.isArray(body)) {
      if (body.length > MAX_BATCH_SIZE) {
        return Response.json(
          { error: `Batch too large. Maximum ${MAX_BATCH_SIZE} events per request.` },
          { status: 400 },
        );
      }

      const events: FeedbackEvent[] = [];
      for (const item of body) {
        if (!isValidEvent(item)) continue;
        events.push({
          studyId: item.studyId,
          eventType: item.eventType,
          userId: verifiedUserId,
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
      userId: verifiedUserId,
    };

    const success = await recordFeedback(supabase, event, logger);

    return Response.json({ recorded: success ? 1 : 0 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Feedback recording failed";
    logError("engine-feedback.exception", { message });
    return Response.json({ error: message }, { status: 500 });
  }
}
