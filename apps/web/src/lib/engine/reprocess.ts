// ──────────────────────────────────────────────────────────────────────────────
// Study Engine – Reprocessing Loop
// ──────────────────────────────────────────────────────────────────────────────
//
// Periodically re-evaluates existing studies with:
// - Updated adaptive weights (from feedback-driven learning)
// - Updated classification rules (if topic clusters evolve)
//
// Goals:
// - Promote under-scored studies that got positive feedback
// - Demote over-scored studies with negative feedback
// - Catch studies that were scored before a rule update
//
// Runs as a separate cron job, independent of the ingestion pipeline.
// ──────────────────────────────────────────────────────────────────────────────

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ClassificationResult,
  NormalizedStudy,
  ReprocessConfig,
  ReprocessResult,
  ScoringResult,
} from "./types";
import { classifyStudy } from "./classify";
import { scoreStudy } from "./score";
import { STUDIES_TABLE } from "./config";
import { loadConfigSection } from "./configLoader";
import type { PipelineLogger } from "./logger";

// ── Default Config ──────────────────────────────────────────────────────────

export const DEFAULT_REPROCESS_CONFIG: ReprocessConfig = {
  batchSize: 50,
  minAgeHours: 24,
  maxScoreForReprocess: 100,
  useAdaptiveWeights: true,
};

// ── DB Row → NormalizedStudy adapter ────────────────────────────────────────

type StoredStudyRow = {
  id: string;
  title: string;
  description: string | null;
  source: string | null;
  doi: string | null;
  study_type: string | null;
  evidence_level: number | null;
  publisher_quality: number | null;
  topic_fit: number | null;
  relevance_score: number | null;
  editorial_priority: string | null;
  matched_topics: string[] | null;
  flags: string[] | null;
  first_author: string | null;
  abstract_snippet: string | null;
  origin_label: string | null;
  affiliation_hints: string[] | null;
  source_fingerprint: string;
  fetched_at: string | null;
  quality_status: string;
};

function rowToNormalizedStudy(row: StoredStudyRow): NormalizedStudy {
  return {
    title: row.title,
    titleNormalized: row.title.toLowerCase().replace(/[^a-z0-9]/g, ""),
    doi: row.doi,
    url: row.source,
    publisher: row.origin_label ?? "unknown",
    year: row.fetched_at ? new Date(row.fetched_at).getFullYear().toString() : "0",
    // abstract_snippet is the true (truncated) source abstract; description is
    // the German editorial review summary built FROM that abstract at ingest
    // time. Preferring description here was reclassifying studies against a
    // lossy, translated proxy instead of the real text — that silently wiped
    // matched_topics on previously well-classified studies.
    abstract: row.abstract_snippet ?? row.description,
    firstAuthor: row.first_author,
    affiliations: row.affiliation_hints ?? [],
    fingerprint: row.source_fingerprint,
    meta: {},
  };
}

// ── Reprocessing Logic ──────────────────────────────────────────────────────

/**
 * Fetch a batch of studies eligible for reprocessing.
 *
 * Selection criteria:
 * - Still pending (never touch studies a human already reviewed as good/bad)
 * - Older than minAgeHours
 * - Score <= maxScoreForReprocess (catches low+mid scorers first)
 * - Ordered by oldest fetched_at first (prioritize stale data)
 */
async function fetchReprocessCandidates(
  supabase: SupabaseClient,
  config: ReprocessConfig,
  logger: PipelineLogger,
): Promise<StoredStudyRow[]> {
  const cutoff = new Date(
    Date.now() - config.minAgeHours * 60 * 60 * 1000,
  ).toISOString();

  const { data, error } = await supabase
    .from(STUDIES_TABLE)
    .select(
      "id, title, description, source, doi, study_type, evidence_level, publisher_quality, topic_fit, relevance_score, editorial_priority, matched_topics, flags, first_author, abstract_snippet, origin_label, affiliation_hints, source_fingerprint, fetched_at, quality_status",
    )
    .eq("quality_status", "pending")
    .order("fetched_at", { ascending: true, nullsFirst: true })
    .limit(config.batchSize * 4);

  if (error) {
    logger.error("Failed to fetch reprocess candidates", { error: error.message });
    return [];
  }

  return ((data ?? []) as StoredStudyRow[])
    .filter((row) => {
      const fetchedAtEligible = !row.fetched_at || row.fetched_at <= cutoff;
      const score = row.relevance_score ?? 0;
      return fetchedAtEligible && score <= config.maxScoreForReprocess;
    })
    .slice(0, config.batchSize);
}

/**
 * Re-classify and re-score a single study.
 * Returns the new scoring result and whether the score changed significantly.
 */
function reprocessStudy(
  row: StoredStudyRow,
  minAcceptScore: number,
): {
  classification: ClassificationResult;
  scoring: ScoringResult;
  oldScore: number;
  newScore: number;
  delta: number;
} {
  const normalized = rowToNormalizedStudy(row);
  const classification = classifyStudy(normalized);
  const scoring = scoreStudy(normalized, classification, minAcceptScore);

  return {
    classification,
    scoring,
    oldScore: row.relevance_score ?? 0,
    newScore: scoring.relevanceScore,
    delta: scoring.relevanceScore - (row.relevance_score ?? 0),
  };
}

/**
 * Apply reprocessing updates to the database.
 */
async function applyReprocessUpdate(
  supabase: SupabaseClient,
  studyId: string,
  scoring: ScoringResult,
  classification: ClassificationResult,
  logger: PipelineLogger,
): Promise<boolean> {
  const { error } = await supabase
    .from(STUDIES_TABLE)
    .update({
      study_type: classification.studyType,
      evidence_level: scoring.breakdown.evidenceLevel,
      publisher_quality: scoring.breakdown.publisherQuality,
      topic_fit: classification.topicFit,
      relevance_score: scoring.relevanceScore,
      editorial_priority: scoring.editorialPriority,
      matched_topics: classification.matchedTopics,
      flags: classification.flags,
      fetched_at: new Date().toISOString(), // reset freshness clock
    })
    .eq("id", studyId);

  if (error) {
    logger.error(`Failed to update study ${studyId}`, { error: error.message });
    return false;
  }

  return true;
}

// ── Main Entry Point ────────────────────────────────────────────────────────

/**
 * Run the reprocessing loop: re-classify and re-score a batch of existing studies.
 *
 * @param supabase - Supabase service-role client
 * @param logger - Pipeline logger for observability
 * @param configOverrides - Optional config overrides
 * @param minAcceptScore - Minimum score for the accept gate. Defaults to the
 *   live `engine_config.scoring_params.minAcceptScore` (same source the
 *   ingestion pipeline uses) so reprocessing can't silently drift from
 *   whatever threshold is actually configured. Pass explicitly to override.
 */
export async function runReprocessLoop(
  supabase: SupabaseClient,
  logger: PipelineLogger,
  configOverrides?: Partial<ReprocessConfig>,
  minAcceptScore?: number,
): Promise<ReprocessResult> {
  const config: ReprocessConfig = {
    ...DEFAULT_REPROCESS_CONFIG,
    ...configOverrides,
  };

  let effectiveMinAcceptScore = minAcceptScore;
  if (effectiveMinAcceptScore == null) {
    const scoringParams = await loadConfigSection(supabase, "scoring_params");
    effectiveMinAcceptScore = scoringParams.minAcceptScore;
  }

  const result: ReprocessResult = {
    processed: 0,
    upgraded: 0,
    downgraded: 0,
    unchanged: 0,
    errors: [],
  };

  logger.info("Reprocess loop started", {
    batchSize: config.batchSize,
    minAgeHours: config.minAgeHours,
    maxScoreForReprocess: config.maxScoreForReprocess,
    minAcceptScore: effectiveMinAcceptScore,
  });

  // Fetch candidates
  const candidates = await fetchReprocessCandidates(supabase, config, logger);

  if (candidates.length === 0) {
    logger.info("No studies eligible for reprocessing");
    return result;
  }

  logger.info(`Found ${candidates.length} reprocess candidates`);

  // Change threshold: only update if score changed by ≥3 points
  const SIGNIFICANT_DELTA = 3;

  for (const row of candidates) {
    try {
      const { classification, scoring, oldScore, newScore, delta } = reprocessStudy(
        row,
        effectiveMinAcceptScore,
      );

      result.processed++;

      if (Math.abs(delta) < SIGNIFICANT_DELTA) {
        result.unchanged++;
        continue;
      }

      const updated = await applyReprocessUpdate(
        supabase,
        row.id,
        scoring,
        classification,
        logger,
      );

      if (!updated) {
        result.errors.push(`Failed to update study ${row.id}`);
        continue;
      }

      if (delta > 0) {
        result.upgraded++;
        logger.debug(`Upgraded study ${row.id}: ${oldScore} → ${newScore} (Δ${delta})`);
      } else {
        result.downgraded++;
        logger.debug(`Downgraded study ${row.id}: ${oldScore} → ${newScore} (Δ${delta})`);
      }
    } catch (err) {
      const message = `Reprocess failed for study ${row.id}: ${err instanceof Error ? err.message : String(err)}`;
      logger.error(message);
      result.errors.push(message);
    }
  }

  logger.info("Reprocess loop complete", {
    processed: result.processed,
    upgraded: result.upgraded,
    downgraded: result.downgraded,
    unchanged: result.unchanged,
    errors: result.errors.length,
  });

  return result;
}
