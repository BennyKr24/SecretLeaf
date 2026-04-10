// ──────────────────────────────────────────────────────────────────────────────
// Study Engine – Feedback Tracker
// ──────────────────────────────────────────────────────────────────────────────
//
// Records user interactions with studies (views, clicks, reviews, search hits).
// Aggregates feedback per study for use by the adaptive scoring engine.
//
// Data flow:
//   User action → recordFeedback() → study_feedback table
//   Periodic:    computeFeedbackAggregates() → in-memory aggregation
//                → consumed by adaptive.ts for weight adjustment
// ──────────────────────────────────────────────────────────────────────────────

import type { SupabaseClient } from "@supabase/supabase-js";
import type { FeedbackEvent, FeedbackEventType, StudyFeedbackAggregate } from "./types";
import type { PipelineLogger } from "./logger";

const FEEDBACK_TABLE = "study_feedback";

// ── Record Events ───────────────────────────────────────────────────────────

/**
 * Record a single feedback event for a study.
 * Fire-and-forget safe — errors are logged but never thrown to callers.
 */
export async function recordFeedback(
  supabase: SupabaseClient,
  event: FeedbackEvent,
  logger?: PipelineLogger,
): Promise<boolean> {
  try {
    const { error } = await supabase.from(FEEDBACK_TABLE).insert({
      study_id: event.studyId,
      event_type: event.eventType,
      user_id: event.userId,
      metadata: event.meta ?? {},
    });

    if (error) {
      logger?.warn(`Feedback record failed for study ${event.studyId}`, {
        error: error.message,
        eventType: event.eventType,
      });
      return false;
    }
    return true;
  } catch (err) {
    logger?.warn(`Feedback record exception for study ${event.studyId}`, {
      error: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}

/**
 * Record a batch of feedback events.
 * Partial failures do not abort the batch.
 */
export async function recordFeedbackBatch(
  supabase: SupabaseClient,
  events: FeedbackEvent[],
  logger?: PipelineLogger,
): Promise<{ recorded: number; failed: number }> {
  if (events.length === 0) return { recorded: 0, failed: 0 };

  const rows = events.map((e) => ({
    study_id: e.studyId,
    event_type: e.eventType,
    user_id: e.userId,
    metadata: e.meta ?? {},
  }));

  const { error } = await supabase.from(FEEDBACK_TABLE).insert(rows);

  if (error) {
    logger?.warn(`Batch feedback insert failed (${events.length} events)`, {
      error: error.message,
    });
    return { recorded: 0, failed: events.length };
  }

  return { recorded: events.length, failed: 0 };
}

// ── Aggregation ─────────────────────────────────────────────────────────────

type FeedbackRow = {
  study_id: string;
  event_type: FeedbackEventType;
  count: number;
};

/**
 * Compute engagement aggregates for all studies that have feedback.
 * Uses a server-side GROUP BY for efficiency.
 *
 * Engagement score formula:
 *   views * 1 + clicks * 3 + searchHits * 2 + reviewGood * 10 - reviewBad * 5
 */
export async function computeFeedbackAggregates(
  supabase: SupabaseClient,
  logger: PipelineLogger,
  options?: { studyIds?: string[]; sinceHoursAgo?: number },
): Promise<Map<string, StudyFeedbackAggregate>> {
  const result = new Map<string, StudyFeedbackAggregate>();

  // Use RPC for the aggregation query since Supabase JS doesn't support
  // native GROUP BY. Fall back to client-side aggregation if RPC isn't available.
  let query = supabase
    .from(FEEDBACK_TABLE)
    .select("study_id, event_type");

  if (options?.studyIds && options.studyIds.length > 0) {
    query = query.in("study_id", options.studyIds);
  }

  if (options?.sinceHoursAgo) {
    const since = new Date(Date.now() - options.sinceHoursAgo * 60 * 60 * 1000).toISOString();
    query = query.gte("created_at", since);
  }

  // Limit to prevent runaway queries
  const { data, error } = await query.limit(50_000);

  if (error) {
    logger.error("Failed to fetch feedback data", { error: error.message });
    return result;
  }

  if (!data || data.length === 0) {
    logger.debug("No feedback data found");
    return result;
  }

  // Client-side aggregation
  const counters = new Map<string, Record<FeedbackEventType, number>>();

  for (const row of data as Array<{ study_id: string; event_type: FeedbackEventType }>) {
    const sid = row.study_id;
    if (!counters.has(sid)) {
      counters.set(sid, {
        view: 0,
        click: 0,
        review_good: 0,
        review_bad: 0,
        review_skip: 0,
        search_hit: 0,
      });
    }
    const c = counters.get(sid)!;
    c[row.event_type] = (c[row.event_type] ?? 0) + 1;
  }

  for (const [studyId, counts] of counters) {
    const views = counts.view;
    const clicks = counts.click;
    const reviewGood = counts.review_good;
    const reviewBad = counts.review_bad;
    const reviewSkip = counts.review_skip;
    const searchHits = counts.search_hit;

    const engagementScore =
      views * 1 +
      clicks * 3 +
      searchHits * 2 +
      reviewGood * 10 -
      reviewBad * 5;

    result.set(studyId, {
      studyId,
      views,
      clicks,
      reviewGood,
      reviewBad,
      reviewSkip,
      searchHits,
      engagementScore,
    });
  }

  logger.info(`Computed feedback aggregates for ${result.size} studies`, {
    totalEvents: data.length,
  });

  return result;
}

/**
 * Get the top-N studies by engagement score.
 * Useful for understanding which types of studies perform well.
 */
export function topEngagedStudies(
  aggregates: Map<string, StudyFeedbackAggregate>,
  limit: number = 20,
): StudyFeedbackAggregate[] {
  return [...aggregates.values()]
    .sort((a, b) => b.engagementScore - a.engagementScore)
    .slice(0, limit);
}
