// ──────────────────────────────────────────────────────────────────────────────
// Study Engine – Adaptive Scoring
// ──────────────────────────────────────────────────────────────────────────────
//
// Dynamically adjusts scoring weights based on observed feedback data.
//
// The system learns which factors predict high engagement:
// - If "high-evidence" studies get more clicks → bump evidenceLevel weight
// - If recent studies get more views → bump freshness weight
// - If topic-matched studies get more reviews → bump topicFit weight
//
// Weight adjustments are bounded (±30% from baseline) to prevent runaway drift.
// Every adjustment is logged with full rationale for auditability.
//
// The adaptive weights are stored in Supabase for persistence across restarts
// and to provide a historical audit trail.
// ──────────────────────────────────────────────────────────────────────────────

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ScoringWeights, StudyFeedbackAggregate, WeightAdjustment } from "./types";
import { SCORE_WEIGHTS } from "./config";
import type { PipelineLogger } from "./logger";

const WEIGHTS_TABLE = "scoring_weights_history";

// ── Baseline Weights ────────────────────────────────────────────────────────

/** Static baseline weights — used when no adaptive data is available. */
export const BASELINE_WEIGHTS: ScoringWeights = {
  topicFit: SCORE_WEIGHTS.topicFit,
  evidenceLevel: SCORE_WEIGHTS.evidenceLevel,
  publisherQuality: SCORE_WEIGHTS.publisherQuality,
  freshness: SCORE_WEIGHTS.freshness,
  editorialUtility: SCORE_WEIGHTS.editorialUtility,
  feedbackBoost: 0,
};

// Max deviation from baseline (±30%)
const MAX_DEVIATION = 0.30;
// Minimum number of studies with feedback before adapting
const MIN_FEEDBACK_STUDIES = 10;

// ── Weight Computation ──────────────────────────────────────────────────────

type StudyProfile = {
  studyId: string;
  evidenceLevel: number;
  publisherQuality: number;
  freshness: number;
  topicFit: number;
  editorialUtility: number;
  relevanceScore: number;
  engagementScore: number;
};

/**
 * Compute adaptive weights from feedback data and study profiles.
 *
 * Algorithm:
 * 1. Correlate each scoring factor with engagement score
 * 2. Factors with positive correlation get a weight boost
 * 3. Factors with negative correlation get a weight reduction
 * 4. All adjustments are bounded by MAX_DEVIATION
 * 5. Weights are normalized to sum to 1.0 (excluding feedbackBoost)
 */
export function computeAdaptiveWeights(
  profiles: StudyProfile[],
  logger: PipelineLogger,
): WeightAdjustment {
  if (profiles.length < MIN_FEEDBACK_STUDIES) {
    logger.info(
      `Insufficient feedback data (${profiles.length}/${MIN_FEEDBACK_STUDIES}), using baseline weights`,
    );
    return {
      weights: { ...BASELINE_WEIGHTS },
      reason: "insufficient-feedback-data",
      basedOnStudies: profiles.length,
      computedAt: new Date().toISOString(),
    };
  }

  // Compute correlation between each factor and engagement
  const factors: Array<{ key: keyof Omit<ScoringWeights, "feedbackBoost">; values: number[] }> = [
    { key: "topicFit", values: profiles.map((p) => p.topicFit) },
    { key: "evidenceLevel", values: profiles.map((p) => p.evidenceLevel) },
    { key: "publisherQuality", values: profiles.map((p) => p.publisherQuality) },
    { key: "freshness", values: profiles.map((p) => p.freshness) },
    { key: "editorialUtility", values: profiles.map((p) => p.editorialUtility) },
  ];

  const engagementValues = profiles.map((p) => p.engagementScore);

  const correlations = new Map<string, number>();
  for (const factor of factors) {
    const corr = pearsonCorrelation(factor.values, engagementValues);
    correlations.set(factor.key, Number.isFinite(corr) ? corr : 0);
  }

  // Adjust weights based on correlations
  const newWeights: ScoringWeights = { ...BASELINE_WEIGHTS };
  const adjustmentReasons: string[] = [];

  for (const factor of factors) {
    const corr = correlations.get(factor.key) ?? 0;
    const baseline = BASELINE_WEIGHTS[factor.key];

    // Scale adjustment: correlation * MAX_DEVIATION * baseline
    const adjustment = corr * MAX_DEVIATION * baseline;
    const adjusted = baseline + adjustment;

    // Clamp to bounded range
    const minVal = baseline * (1 - MAX_DEVIATION);
    const maxVal = baseline * (1 + MAX_DEVIATION);
    newWeights[factor.key] = clamp(adjusted, minVal, maxVal);

    if (Math.abs(adjustment) > 0.005) {
      const direction = adjustment > 0 ? "↑" : "↓";
      adjustmentReasons.push(
        `${factor.key}: ${direction} (corr=${corr.toFixed(3)}, ${baseline.toFixed(3)}→${newWeights[factor.key].toFixed(3)})`,
      );
    }
  }

  // Normalize core weights to sum to ~1.0
  const coreKeys: Array<keyof Omit<ScoringWeights, "feedbackBoost">> = [
    "topicFit",
    "evidenceLevel",
    "publisherQuality",
    "freshness",
    "editorialUtility",
  ];
  const coreSum = coreKeys.reduce((sum, k) => sum + newWeights[k], 0);
  if (coreSum > 0) {
    for (const k of coreKeys) {
      newWeights[k] = newWeights[k] / coreSum;
    }
  }

  // Compute feedbackBoost weight (small, capped at 0.10)
  const avgEngagement = mean(engagementValues);
  newWeights.feedbackBoost = avgEngagement > 5 ? Math.min(0.10, avgEngagement / 500) : 0;

  const reason =
    adjustmentReasons.length > 0
      ? `Adapted: ${adjustmentReasons.join("; ")}`
      : "No significant adjustments needed";

  logger.info(`Adaptive weights computed from ${profiles.length} studies`, {
    correlations: Object.fromEntries(correlations),
    weights: newWeights,
  });

  return {
    weights: newWeights,
    reason,
    basedOnStudies: profiles.length,
    computedAt: new Date().toISOString(),
  };
}

// ── Persistence ─────────────────────────────────────────────────────────────

/**
 * Save computed weights to Supabase for audit trail and persistence.
 */
export async function saveWeightAdjustment(
  supabase: SupabaseClient,
  adjustment: WeightAdjustment,
  logger: PipelineLogger,
): Promise<boolean> {
  try {
    const { error } = await supabase.from(WEIGHTS_TABLE).insert({
      weights: adjustment.weights,
      reason: adjustment.reason,
      based_on_studies: adjustment.basedOnStudies,
      computed_at: adjustment.computedAt,
    });

    if (error) {
      logger.error("Failed to save weight adjustment", { error: error.message });
      return false;
    }

    logger.info("Weight adjustment saved");
    return true;
  } catch (err) {
    logger.error("Exception saving weight adjustment", {
      error: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}

/**
 * Build study profiles by joining stored study data with feedback aggregates.
 * This is the input for computeAdaptiveWeights().
 */
export async function buildStudyProfiles(
  supabase: SupabaseClient,
  feedbackMap: Map<string, StudyFeedbackAggregate>,
  logger: PipelineLogger,
): Promise<StudyProfile[]> {
  if (feedbackMap.size === 0) return [];

  const studyIds = [...feedbackMap.keys()];

  // Fetch scoring breakdown for these studies
  const chunkSize = 200;
  const profiles: StudyProfile[] = [];

  for (let i = 0; i < studyIds.length; i += chunkSize) {
    const chunk = studyIds.slice(i, i + chunkSize);

    const { data, error } = await supabase
      .from("studies")
      .select("id, evidence_level, publisher_quality, topic_fit, relevance_score")
      .in("id", chunk);

    if (error) {
      logger.warn(`Failed to fetch study profiles (chunk ${i})`, { error: error.message });
      continue;
    }

    for (const row of data ?? []) {
      const fb = feedbackMap.get(row.id as string);
      if (!fb) continue;

      profiles.push({
        studyId: row.id as string,
        evidenceLevel: (row.evidence_level as number) ?? 50,
        publisherQuality: (row.publisher_quality as number) ?? 50,
        freshness: 50, // Not stored directly; use median as proxy
        topicFit: (row.topic_fit as number) ?? 50,
        editorialUtility: 50, // Not stored directly; use median as proxy
        relevanceScore: (row.relevance_score as number) ?? 50,
        engagementScore: fb.engagementScore,
      });
    }
  }

  logger.info(`Built ${profiles.length} study profiles for weight analysis`);
  return profiles;
}

// ── Math Utilities ──────────────────────────────────────────────────────────

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function stddev(values: number[], avg: number): number {
  if (values.length < 2) return 0;
  const variance = values.reduce((sum, v) => sum + (v - avg) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

function pearsonCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length < 3) return 0;

  const n = x.length;
  const xMean = mean(x);
  const yMean = mean(y);
  const xStd = stddev(x, xMean);
  const yStd = stddev(y, yMean);

  if (xStd === 0 || yStd === 0) return 0;

  let covariance = 0;
  for (let i = 0; i < n; i++) {
    covariance += ((x[i] ?? 0) - xMean) * ((y[i] ?? 0) - yMean);
  }
  covariance /= n - 1;

  return covariance / (xStd * yStd);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
