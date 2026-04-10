// ──────────────────────────────────────────────────────────────────────────────
// Study Engine – Classification Engine
// ──────────────────────────────────────────────────────────────────────────────
//
// Assigns:
// - Study type (meta-analysis, clinical trial, etc.)
// - Matched topic clusters
// - Topic fit score (0-100)
// - Soft signal flags
// - Hard exclusion detection
//
// Purely rule-based, deterministic, and explainable.
// ──────────────────────────────────────────────────────────────────────────────

import type { ClassificationResult, NormalizedStudy, StudyType, TopicKey } from "./types";
import {
  CANNABIS_ANCHOR,
  HARD_EXCLUSIONS,
  SOFT_SIGNALS,
  TOPIC_CLUSTERS,
} from "./config";
import type { PipelineLogger } from "./logger";

// ── Helpers ─────────────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function countAnchorMatches(text: string): number {
  const matches = text.match(new RegExp(CANNABIS_ANCHOR.source, "gi"));
  return matches?.length ?? 0;
}

/** Build the combined text corpus for classification. */
function buildCorpus(study: NormalizedStudy): string {
  return `${study.title} ${study.publisher} ${study.abstract ?? ""}`.toLowerCase();
}

// ── Study Type Classification ───────────────────────────────────────────────

function classifyStudyType(text: string): StudyType {
  if (/meta-analysis/i.test(text)) return "meta-analysis";
  if (/systematic review/i.test(text)) return "systematic-review";
  if (/randomized|double-blind|placebo/i.test(text)) return "controlled-study";
  if (/clinical trial/i.test(text)) return "clinical-trial";
  if (/protocol\b/i.test(text)) return "protocol";
  if (/case report/i.test(text)) return "case-report";
  if (/analytical|chromatography|laboratory|contaminant|microbiology/i.test(text))
    return "laboratory-study";
  if (/cohort|cross-sectional|survey|observational/i.test(text))
    return "observational-study";
  return "general-study";
}

// ── Hard Exclusion ──────────────────────────────────────────────────────────

function detectHardExclusion(text: string): string | null {
  for (const rule of HARD_EXCLUSIONS) {
    if (rule.pattern.test(text)) return rule.reason;
  }
  return null;
}

// ── Cannabis Anchor Validation ──────────────────────────────────────────────

function validateCannabisAnchor(
  corpus: string,
  titleText: string,
  studyType: StudyType,
): string | null {
  if (!CANNABIS_ANCHOR.test(corpus)) {
    return "no-cannabis-anchor";
  }

  const titleHasAnchor = CANNABIS_ANCHOR.test(titleText);
  const anchorCount = countAnchorMatches(corpus);

  if (!titleHasAnchor && anchorCount < 2) {
    return "weak-cannabis-anchor";
  }

  if (!titleHasAnchor && studyType === "general-study") {
    return "generic-title-without-cannabis";
  }

  return null;
}

// ── Topic Matching ──────────────────────────────────────────────────────────

function matchTopics(text: string): {
  matchedTopics: TopicKey[];
  topicFit: number;
} {
  const matchedTopics: TopicKey[] = [];
  let topicFit = 0;

  for (const cluster of TOPIC_CLUSTERS) {
    const hits = cluster.include.filter((pattern) => pattern.test(text)).length;
    if (hits > 0) {
      matchedTopics.push(cluster.key);
      topicFit += 18 + hits * 8;
    }
  }

  // Bonus for core cannabis terms
  if (/cannabis|cannabinoid|thc|thca|cbd|cbda|cbg|cbn|terpene|terpenoid/i.test(text)) {
    topicFit += 14;
  }
  if (/quality|labor|contaminant|microbiology|pharmacokinetic|clinical|cultivation|postharvest|curing|drying|storage|greenhouse|indoor|regulation/i.test(text)) {
    topicFit += 10;
  }

  return {
    matchedTopics,
    topicFit: clamp(topicFit, 0, 100),
  };
}

// ── Soft Signals ────────────────────────────────────────────────────────────

function collectSoftSignals(text: string): {
  flags: string[];
  scoreDelta: number;
} {
  const flags: string[] = [];
  let scoreDelta = 0;

  for (const signal of SOFT_SIGNALS) {
    if (signal.pattern.test(text)) {
      scoreDelta += signal.score;
      flags.push(signal.flag);
    }
  }

  return { flags, scoreDelta };
}

// ── Main Classification Function ────────────────────────────────────────────

/**
 * Classify a single normalized study.
 * Returns classification metadata including type, topics, and exclusion status.
 */
export function classifyStudy(study: NormalizedStudy): ClassificationResult {
  const corpus = buildCorpus(study);
  const titleText = study.title.toLowerCase();

  // Step 1: Hard exclusion check
  const hardExclusion = detectHardExclusion(corpus);
  if (hardExclusion) {
    return {
      studyType: "general-study",
      matchedTopics: [],
      topicFit: 0,
      flags: [`excluded:${hardExclusion}`],
      exclusionReason: hardExclusion,
    };
  }

  // Step 2: Study type classification
  const studyType = classifyStudyType(corpus);

  // Step 3: Cannabis anchor validation
  const anchorValidation = validateCannabisAnchor(corpus, titleText, studyType);
  if (anchorValidation) {
    return {
      studyType,
      matchedTopics: [],
      topicFit: 0,
      flags: [`excluded:${anchorValidation}`],
      exclusionReason: anchorValidation,
    };
  }

  // Step 4: Topic matching
  const { matchedTopics, topicFit } = matchTopics(corpus);

  // Step 5: Soft signals
  const { flags, scoreDelta: _scoreDelta } = collectSoftSignals(corpus);

  // Note: scoreDelta is NOT applied here — it's used in the scoring engine.
  // Classification only reports the flags.

  return {
    studyType,
    matchedTopics,
    topicFit,
    flags: [...new Set(flags)].sort(),
    exclusionReason: null,
  };
}

/**
 * Classify a batch of studies.
 * Separates accepted from excluded studies.
 */
export function classifyStudies(
  studies: NormalizedStudy[],
  logger: PipelineLogger,
): {
  classified: Array<{ study: NormalizedStudy; classification: ClassificationResult }>;
  excluded: Array<{ title: string; reason: string }>;
} {
  const classified: Array<{ study: NormalizedStudy; classification: ClassificationResult }> = [];
  const excluded: Array<{ title: string; reason: string }> = [];

  for (const study of studies) {
    const classification = classifyStudy(study);

    if (classification.exclusionReason) {
      excluded.push({
        title: study.title,
        reason: classification.exclusionReason,
      });
    } else {
      classified.push({ study, classification });
    }
  }

  logger.info(`Classification: ${classified.length} accepted, ${excluded.length} excluded`, {
    studyTypes: summarizeStudyTypes(classified.map((c) => c.classification.studyType)),
    topExclusions: summarizeExclusions(excluded),
  });

  return { classified, excluded };
}

// ── Summary Helpers ─────────────────────────────────────────────────────────

function summarizeStudyTypes(types: string[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const t of types) {
    counts[t] = (counts[t] ?? 0) + 1;
  }
  return counts;
}

function summarizeExclusions(excluded: Array<{ reason: string }>): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const e of excluded) {
    counts[e.reason] = (counts[e.reason] ?? 0) + 1;
  }
  return counts;
}
