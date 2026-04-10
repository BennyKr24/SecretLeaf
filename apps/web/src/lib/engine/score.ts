// ──────────────────────────────────────────────────────────────────────────────
// Study Engine – Scoring Engine
// ──────────────────────────────────────────────────────────────────────────────
//
// Deterministic, explainable multi-factor scoring:
// - Evidence level (by study type)
// - Publisher quality
// - Freshness (recency)
// - Topic fit (from classification)
// - Editorial utility
// - Soft signal adjustments
//
// Final score: 0-100, breakdown fully transparent.
// ──────────────────────────────────────────────────────────────────────────────

import type {
  ClassificationResult,
  EditorialPriority,
  NormalizedStudy,
  ScoreBreakdown,
  ScoringResult,
  StudyType,
} from "./types";
import {
  EVIDENCE_LEVEL_SCORES,
  HIGH_QUALITY_PUBLISHERS,
  MID_QUALITY_PUBLISHERS,
  SCORE_WEIGHTS,
  SOFT_SIGNALS,
} from "./config";
import type { PipelineLogger } from "./logger";

// ── Helpers ─────────────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ── Evidence Level ──────────────────────────────────────────────────────────

function scoreEvidence(studyType: StudyType): number {
  return EVIDENCE_LEVEL_SCORES[studyType] ?? EVIDENCE_LEVEL_SCORES["general-study"] ?? 56;
}

// ── Publisher Quality ───────────────────────────────────────────────────────

function scorePublisher(publisher: string): number {
  const normalized = publisher.toLowerCase();

  if (HIGH_QUALITY_PUBLISHERS.some((hint) => normalized.includes(hint))) {
    return 90;
  }
  if (MID_QUALITY_PUBLISHERS.some((hint) => normalized.includes(hint))) {
    return 68;
  }
  return 54;
}

// ── Freshness ───────────────────────────────────────────────────────────────

function scoreFreshness(year: string): number {
  const currentYear = new Date().getFullYear();
  const numericYear = Number(year);

  if (!Number.isFinite(numericYear)) return 42;

  const age = currentYear - numericYear;
  if (age <= 0) return 100;
  if (age === 1) return 88;
  if (age === 2) return 76;
  if (age <= 4) return 64;
  if (age <= 6) return 52;
  return 40;
}

// ── Editorial Utility ───────────────────────────────────────────────────────

function scoreEditorialUtility(
  corpus: string,
  matchedTopics: string[],
): number {
  let score = 30;

  if (matchedTopics.length >= 2) score += 20;
  if (/patient|clinical|laboratory|quality|safety|contaminant|cultivation/i.test(corpus)) {
    score += 18;
  }
  if (/public health|market|policy/i.test(corpus)) {
    score += 8;
  }
  if (/animal feed|poultry|marine/i.test(corpus)) {
    score -= 35;
  }

  return clamp(score, 0, 100);
}

// ── Soft Signal Delta ───────────────────────────────────────────────────────

function computeSoftSignalDelta(corpus: string): { delta: number; flags: string[] } {
  const flags: string[] = [];
  let delta = 0;

  for (const signal of SOFT_SIGNALS) {
    if (signal.pattern.test(corpus)) {
      delta += signal.score;
      flags.push(signal.flag);
    }
  }

  return { delta, flags };
}

// ── Editorial Priority ──────────────────────────────────────────────────────

function deriveEditorialPriority(
  score: number,
  studyType: StudyType,
): EditorialPriority {
  if (score >= 82 && !["protocol", "case-report"].includes(studyType)) {
    return "high";
  }
  if (score >= 62) return "medium";
  return "low";
}

// ── Main Scoring Function ───────────────────────────────────────────────────

/**
 * Score a single study given its normalized data and classification.
 */
export function scoreStudy(
  study: NormalizedStudy,
  classification: ClassificationResult,
  minAcceptScore: number,
): ScoringResult {
  const corpus = `${study.title} ${study.publisher} ${study.abstract ?? ""}`.toLowerCase();

  const evidenceLevel = scoreEvidence(classification.studyType);
  const publisherQuality = scorePublisher(study.publisher);
  const freshness = scoreFreshness(study.year);
  const topicFit = classification.topicFit;
  const editorialUtility = scoreEditorialUtility(corpus, classification.matchedTopics);
  const { delta: softSignalDelta, flags: softFlags } = computeSoftSignalDelta(corpus);

  // Weighted composite score
  let rawScore =
    topicFit * SCORE_WEIGHTS.topicFit +
    evidenceLevel * SCORE_WEIGHTS.evidenceLevel +
    publisherQuality * SCORE_WEIGHTS.publisherQuality +
    freshness * SCORE_WEIGHTS.freshness +
    editorialUtility * SCORE_WEIGHTS.editorialUtility +
    softSignalDelta;

  // Penalty: no topic match
  if (classification.matchedTopics.length === 0) {
    rawScore -= 20;
  }

  // Penalty: hemp-only without cannabis terms
  if (/hemp\b/i.test(corpus) && !/cannabis|cannabinoid|thc|cbd/i.test(corpus)) {
    rawScore -= 18;
  }

  const relevanceScore = clamp(Math.round(rawScore), 0, 100);
  const editorialPriority = deriveEditorialPriority(relevanceScore, classification.studyType);

  // Accept gate
  const hasTopicMatch = classification.matchedTopics.length > 0;
  const isNotLowEvidence = !softFlags.includes("low-evidence-format");
  const meetsScoreThreshold = relevanceScore >= minAcceptScore;

  const accepted = meetsScoreThreshold && hasTopicMatch && isNotLowEvidence;

  let rejectionReason: string | null = null;
  if (!accepted) {
    if (!meetsScoreThreshold) rejectionReason = "score-below-threshold";
    else if (!hasTopicMatch) rejectionReason = "no-topic-match";
    else if (!isNotLowEvidence) rejectionReason = "low-evidence-format";
  }

  return {
    relevanceScore,
    breakdown: {
      evidenceLevel,
      publisherQuality,
      freshness,
      topicFit,
      editorialUtility,
      softSignalDelta,
    },
    editorialPriority,
    accepted,
    rejectionReason,
  };
}

/**
 * Score a batch of classified studies.
 */
export function scoreStudies(
  items: Array<{ study: NormalizedStudy; classification: ClassificationResult }>,
  minAcceptScore: number,
  logger: PipelineLogger,
): Array<{
  study: NormalizedStudy;
  classification: ClassificationResult;
  scoring: ScoringResult;
}> {
  const results = items.map(({ study, classification }) => ({
    study,
    classification,
    scoring: scoreStudy(study, classification, minAcceptScore),
  }));

  const accepted = results.filter((r) => r.scoring.accepted);
  const rejected = results.filter((r) => !r.scoring.accepted);

  const avgScore =
    accepted.length > 0
      ? Math.round(
          accepted.reduce((sum, r) => sum + r.scoring.relevanceScore, 0) / accepted.length,
        )
      : 0;

  logger.info(
    `Scoring: ${accepted.length} accepted, ${rejected.length} rejected (avg score: ${avgScore})`,
    {
      priorities: {
        high: accepted.filter((r) => r.scoring.editorialPriority === "high").length,
        medium: accepted.filter((r) => r.scoring.editorialPriority === "medium").length,
        low: accepted.filter((r) => r.scoring.editorialPriority === "low").length,
      },
    },
  );

  return results;
}
