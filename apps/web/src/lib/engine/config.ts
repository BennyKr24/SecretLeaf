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

// Only clusters that match SecretLeaf's documented Wissenssystem philosophy
// (Growing, Krankheiten, Nährstoffe, Sorten, Cannabinoide, Terpene, Extrakte,
// Ernte, Trocknung, Curing — see Obsidian/04_Wissen/01_Cannabis_Wissenssystem.md).
// medizin-evidenz / pharmakologie / markt-regulierung were dropped: a home-grow
// knowledge base has no editorial use for clinical, pharmacology, or market/
// regulation studies, and pulling them in was most of the low-relevance backlog.
export const TOPIC_CLUSTERS: TopicCluster[] = [
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

// Unmistakably cannabis-specific on their own — sufficient anchor evidence
// by themselves.
export const CANNABIS_ANCHOR_UNAMBIGUOUS =
  /medical cannabis|cannabis|cannabinoid|endocannabinoid|marijuana|hashish/i;

// Short acronyms/terms that collide with unrelated fields when used alone
// (e.g. a geology paper spelling out "Thermo-Hydro-Chemical (THC)", "CBD-CdS
// thin films" in materials science, terpene-synthase papers on non-cannabis
// plants). validateCannabisAnchor() below only accepts these as anchor
// evidence when CANNABIS_ANCHOR_UNAMBIGUOUS also matches the corpus.
export const CANNABIS_ANCHOR_AMBIGUOUS =
  /\bthc\b|\bthca\b|\bcbd\b|\bcbda\b|\bcbn\b|\bcbg\b|terpene|terpenoid/i;

// Combined pattern — used for "does this look cannabis-related at all"
// checks (e.g. counting anchor mentions) once the unambiguous gate has
// already passed.
export const CANNABIS_ANCHOR = new RegExp(
  `${CANNABIS_ANCHOR_UNAMBIGUOUS.source}|${CANNABIS_ANCHOR_AMBIGUOUS.source}`,
  "i",
);

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

// ── Crossref API ────────────────────────────────────────────────────────────

export const CROSSREF_BASE_URL = "https://api.crossref.org/works";
export const CROSSREF_USER_AGENT = "SecretLeaf/1.4 (study-engine; mailto:research@secretleaf.local)";

// ── Storage ─────────────────────────────────────────────────────────────────

export const STUDIES_TABLE = "studies";
export const BATCH_INSERT_SIZE = 50;
