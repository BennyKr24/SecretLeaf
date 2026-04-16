// ──────────────────────────────────────────────────────────────────────────────
// Study Engine – Configuration & Constants
// ──────────────────────────────────────────────────────────────────────────────

import type { PipelineConfig, TopicKey } from "./types";

// ── Default Pipeline Config ─────────────────────────────────────────────────

export const DEFAULT_PIPELINE_CONFIG: PipelineConfig = {
  lookbackDays: Number(process.env.STUDY_SYNC_LOOKBACK_DAYS ?? "7"),
  crossrefRowsPerQuery: 60,
  maxProcessed: Number(process.env.STUDY_LIMIT ?? "200"),
  minAcceptScore: 34,
  maxFetchRetries: Number(process.env.STUDY_SYNC_MAX_ATTEMPTS ?? "3"),
  fuzzyThreshold: 0.85,
  persistToStorage: true,
  skipExisting: true,
};

// ── Topic Clusters ──────────────────────────────────────────────────────────

export type TopicCluster = {
  key: TopicKey;
  queries: string[];
  include: RegExp[];
};

export const TOPIC_CLUSTERS: TopicCluster[] = [
  {
    key: "medizin-evidenz",
    queries: [
      "medical cannabis",
      "cannabinoid pain",
      "cbd anxiety",
      "cannabis sleep",
    ],
    include: [
      /pain/i,
      /anxiety/i,
      /sleep/i,
      /clinical/i,
      /patient/i,
      /therapy/i,
      /efficacy/i,
      /medical cannabis/i,
      /cannabinoid/i,
    ],
  },
  {
    key: "pharmakologie",
    queries: [
      "cannabis pharmacokinetics",
      "cannabinoid pharmacology",
      "thc cbd interactions",
    ],
    include: [
      /pharmacokinetic/i,
      /pharmacology/i,
      /bioavailability/i,
      /drug interaction/i,
      /metabolism/i,
      /dose/i,
      /oral mucosal/i,
    ],
  },
  {
    key: "qualitaet-labor",
    queries: [
      "cannabis laboratory",
      "cannabis contaminants",
      "cannabis heavy metals",
      "cannabis pesticides",
    ],
    include: [
      /laboratory/i,
      /analytical/i,
      /chromatography/i,
      /contaminant/i,
      /microbiology/i,
      /heavy metal/i,
      /pesticide/i,
      /toxicol/i,
    ],
  },
  {
    key: "anbau-postharvest",
    queries: [
      "cannabis cultivation thc cbd terpene profile",
      "cannabis curing drying storage",
      "cannabis postharvest terpene retention",
      "cannabis greenhouse indoor environmental control",
      "cannabis nutrient management yield",
      "cannabis light spectrum photoperiod indoor",
      "cannabis substrate growing medium",
      "cannabis irrigation fertigation deficiency",
    ],
    include: [
      /cultivation/i,
      /indoor/i,
      /greenhouse/i,
      /growth chamber/i,
      /post-harvest/i,
      /postharvest/i,
      /curing/i,
      /drying/i,
      /storage/i,
      /environmental control/i,
      /light spectrum/i,
      /photoperiod/i,
      /irrigation/i,
      /fertigation/i,
      /substrate/i,
      /nutrient/i,
      /vpd/i,
      /flower yield/i,
      /terpene/i,
      /terpenoid/i,
      /cannabinoid profile/i,
      /cannabinoid composition/i,
      /thc/i,
      /thca/i,
      /cbd/i,
      /cbda/i,
      /trichome/i,
      /chemotype/i,
      /cannabinoid composition/i,
      /breeding/i,
    ],
  },
  {
    key: "markt-regulierung",
    queries: [
      "cannabis regulation",
      "cannabis market",
      "medical cannabis policy",
    ],
    include: [
      /regulation/i,
      /policy/i,
      /market/i,
      /dispensar/i,
      /legalization/i,
      /public health/i,
      /retail/i,
    ],
  },
];

// ── Publisher Quality Hints ─────────────────────────────────────────────────

export const HIGH_QUALITY_PUBLISHERS: string[] = [
  "nature",
  "lancet",
  "jama",
  "nejm",
  "cochrane",
  "addiction",
  "journal of analytical toxicology",
  "clinical pharmacology",
  "pain",
  "british journal of pharmacology",
  "journal of psychopharmacology",
  "regulatory toxicology and pharmacology",
  "drug and alcohol dependence",
  "medical cannabis and cannabinoids",
  "cannabis and cannabinoid research",
  "frontiers",
  "oxford",
  "wiley",
  "springer",
  "elsevier",
  "world health organization",
];

export const MID_QUALITY_PUBLISHERS: string[] = [
  "journal",
  "pharmscitech",
  "toxicology",
  "pharmacology",
  "research",
  "review",
  "international journal",
  "mdpi",
  "sciences",
];

// ── Cannabis Anchor Pattern ─────────────────────────────────────────────────

export const CANNABIS_ANCHOR =
  /medical cannabis|cannabis|cannabinoid|endocannabinoid|\bthc\b|\bthca\b|\bcbd\b|\bcbda\b|\bcbn\b|\bcbg\b|terpene|terpenoid|marijuana|hashish/i;

// ── Hard Exclusion Rules ────────────────────────────────────────────────────

export type ExclusionRule = {
  pattern: RegExp;
  reason: string;
};

export const HARD_EXCLUSIONS: ExclusionRule[] = [
  { pattern: /corrigendum|erratum/i, reason: "erratum-corrigendum" },
  { pattern: /canine|dog\b|dogs\b|feline|cat\b|cats\b/i, reason: "non-human-veterinary" },
  { pattern: /laying hens|broiler|poultry|hens\b|hen\b/i, reason: "poultry-feed" },
  { pattern: /marine organism|marine pollution|aquatic|fish\b|shrimp\b/i, reason: "marine-topic" },
  { pattern: /hempseed meal|egg quality|dairy cow|ruminant/i, reason: "agriculture-feed" },
  { pattern: /industrial hemp breeding lines/i, reason: "industrial-hemp-low-fit" },
  { pattern: /nigella sativa/i, reason: "non-cannabis-sativa" },
  // ── Mental health / addiction hard exclusions ──────────────────────────────
  { pattern: /\bpsychosis\b|\bpsychotic\b|\bschizophrenia\b|\bschizophrenic\b/i, reason: "mental-health-exclusion" },
  { pattern: /\bsubstance use disorder\b|\bcannabis use disorder\b|\baddiction treatment\b|\bdrug abuse\b|\bsubstance abuse\b/i, reason: "addiction-disorder-topic" },
  { pattern: /\bself-harm\b|\bsuicide\b|\bsuicidal\b|\bself-medication\b/i, reason: "self-harm-topic" },
];

// ── Soft Signal Rules ───────────────────────────────────────────────────────

export type SoftSignalRule = {
  pattern: RegExp;
  score: number;
  flag: string;
};

export const SOFT_SIGNALS: SoftSignalRule[] = [
  { pattern: /systematic review|meta-analysis/i, score: 26, flag: "high-evidence" },
  { pattern: /randomized|double-blind|placebo/i, score: 20, flag: "controlled-study" },
  { pattern: /clinical trial/i, score: 8, flag: "trial" },
  { pattern: /case report/i, score: -20, flag: "case-report" },
  { pattern: /pilot trial|pilot study/i, score: -8, flag: "pilot" },
  { pattern: /protocol\b/i, score: -18, flag: "protocol" },
  { pattern: /commentary|letter to the editor|editorial/i, score: -22, flag: "low-evidence-format" },
  { pattern: /survey|cross-sectional/i, score: -6, flag: "observational" },
];

// ── Scoring Weights ─────────────────────────────────────────────────────────

export const SCORE_WEIGHTS = {
  topicFit: 0.38,
  evidenceLevel: 0.24,
  publisherQuality: 0.18,
  freshness: 0.08,
  editorialUtility: 0.12,
} as const;

// ── Evidence Level Scores by Study Type ────────────────────────────────────

export const EVIDENCE_LEVEL_SCORES: Record<string, number> = {
  "meta-analysis": 100,
  "systematic-review": 94,
  "controlled-study": 88,
  "clinical-trial": 82,
  "laboratory-study": 78,
  "observational-study": 62,
  "protocol": 36,
  "case-report": 28,
  "general-study": 56,
};

// ── Category Priority ───────────────────────────────────────────────────────

/**
 * Priority order for deriving a primary category from matched_topics.
 * Cultivation clusters come first to reflect the platform's core focus.
 */
export const CATEGORY_PRIORITY: string[] = [
  "anbau-postharvest",
  "qualitaet-labor",
  "pharmakologie",
  "medizin-evidenz",
  "markt-regulierung",
];

// ── Crossref API ────────────────────────────────────────────────────────────

export const CROSSREF_BASE_URL = "https://api.crossref.org/works";
export const CROSSREF_USER_AGENT = "SecretLeaf/1.4 (study-engine; mailto:research@secretleaf.local)";

// ── Storage ─────────────────────────────────────────────────────────────────

export const STUDIES_TABLE = "studies";
export const BATCH_INSERT_SIZE = 50;
