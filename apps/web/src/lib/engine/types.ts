// ──────────────────────────────────────────────────────────────────────────────
// Study Engine – Shared Types
// ──────────────────────────────────────────────────────────────────────────────

/** Raw item returned by any fetch adapter before normalization. */
export type RawStudy = {
  title: string;
  doi: string | null;
  url: string | null;
  publisher: string | null;
  year: string | null;
  abstract: string | null;
  firstAuthor: string | null;
  affiliations: string[];
  /** Adapter-specific extra fields carried through the pipeline. */
  meta: Record<string, unknown>;
};

/** Study after normalization — clean, standardized fields. */
export type NormalizedStudy = {
  title: string;
  titleNormalized: string;
  doi: string | null;
  url: string | null;
  publisher: string;
  year: string;
  abstract: string | null;
  firstAuthor: string | null;
  affiliations: string[];
  /** SHA-256 fingerprint for deduplication. */
  fingerprint: string;
  meta: Record<string, unknown>;
};

/** Deduplication verdict for a single study. */
export type DedupVerdict = {
  isDuplicate: boolean;
  reason: "doi-match" | "fingerprint-match" | "fuzzy-title-match" | null;
  matchedFingerprint: string | null;
};

// ── Classification ──────────────────────────────────────────────────────────

export type StudyType =
  | "meta-analysis"
  | "systematic-review"
  | "controlled-study"
  | "clinical-trial"
  | "laboratory-study"
  | "observational-study"
  | "protocol"
  | "case-report"
  | "general-study";

export type EditorialPriority = "high" | "medium" | "low";

export type TopicKey =
  | "medizin-evidenz"
  | "pharmakologie"
  | "qualitaet-labor"
  | "anbau-postharvest"
  | "markt-regulierung";

export type ClassificationResult = {
  studyType: StudyType;
  matchedTopics: TopicKey[];
  topicFit: number;
  flags: string[];
  /** Hard exclusion reason, if any. `null` = passes filter. */
  exclusionReason: string | null;
};

// ── Scoring ─────────────────────────────────────────────────────────────────

export type ScoreBreakdown = {
  evidenceLevel: number;
  publisherQuality: number;
  freshness: number;
  topicFit: number;
  editorialUtility: number;
  softSignalDelta: number;
};

export type ScoringResult = {
  relevanceScore: number;
  breakdown: ScoreBreakdown;
  editorialPriority: EditorialPriority;
  /** If false, study did not pass final quality gate. */
  accepted: boolean;
  rejectionReason: string | null;
};

// ── Processed Study (full enrichment) ───────────────────────────────────────

export type ProcessedStudy = {
  // Identity
  title: string;
  titleNormalized: string;
  doi: string | null;
  url: string | null;
  publisher: string;
  year: string;
  abstract: string | null;
  abstractSnippet: string | null;
  firstAuthor: string | null;
  affiliations: string[];
  originLabel: string;
  fingerprint: string;

  // Classification
  studyType: StudyType;
  matchedTopics: TopicKey[];
  topicFit: number;
  flags: string[];

  // Scoring
  relevanceScore: number;
  evidenceLevel: number;
  publisherQuality: number;
  freshness: number;
  editorialPriority: EditorialPriority;
  scoreBreakdown: ScoreBreakdown;

  // Tags (for Supabase)
  tags: string[];

  // Review summary for editorial inbox
  reviewSummary: string[];
};

// ── Storage ─────────────────────────────────────────────────────────────────

export type StorageAction = "inserted" | "updated" | "skipped";

export type StorageResult = {
  fingerprint: string;
  action: StorageAction;
  studyId: string | null;
  error: string | null;
};

// ── Pipeline ────────────────────────────────────────────────────────────────

export type PipelineMetrics = {
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  fetched: number;
  normalized: number;
  deduplicated: number;
  classified: number;
  accepted: number;
  rejected: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors: string[];
  attempts: number;
};

export type PipelineConfig = {
  /** Days to look back for new studies. */
  lookbackDays: number;
  /** Max results per Crossref query. */
  crossrefRowsPerQuery: number;
  /** Max total studies to process through the pipeline. */
  maxProcessed: number;
  /** Minimum relevance score to accept a study. */
  minAcceptScore: number;
  /** Max fetch retries per source. */
  maxFetchRetries: number;
  /** Fuzzy dedup similarity threshold (0-1). */
  fuzzyThreshold: number;
  /** Whether to persist results to Supabase. */
  persistToStorage: boolean;
  /** Whether to skip studies already in DB (by fingerprint). */
  skipExisting: boolean;
};

export type PipelineResult = {
  success: boolean;
  metrics: PipelineMetrics;
  accepted: ProcessedStudy[];
  rejected: Array<{ title: string; reason: string }>;
};

// ── Feedback ────────────────────────────────────────────────────────────────

export type FeedbackEventType = "view" | "click" | "review_good" | "review_bad" | "review_skip" | "search_hit";

export type FeedbackEvent = {
  studyId: string;
  eventType: FeedbackEventType;
  userId: string | null;
  meta?: Record<string, unknown>;
};

export type StudyFeedbackAggregate = {
  studyId: string;
  views: number;
  clicks: number;
  reviewGood: number;
  reviewBad: number;
  reviewSkip: number;
  searchHits: number;
  engagementScore: number;
};

// ── Adaptive Scoring ────────────────────────────────────────────────────────

export type ScoringWeights = {
  topicFit: number;
  evidenceLevel: number;
  publisherQuality: number;
  freshness: number;
  editorialUtility: number;
  /** Feedback-driven boost weight (0 if no feedback data). */
  feedbackBoost: number;
};

export type WeightAdjustment = {
  weights: ScoringWeights;
  reason: string;
  basedOnStudies: number;
  computedAt: string;
};

// ── Pipeline Health / Monitor ───────────────────────────────────────────────

export type PipelineHealthStatus = "healthy" | "degraded" | "failing";

export type PipelineHealthSnapshot = {
  status: PipelineHealthStatus;
  lastSuccessfulRun: string | null;
  lastFailedRun: string | null;
  consecutiveFailures: number;
  avgDurationMs: number;
  avgInserted: number;
  avgFetched: number;
  dataFreshnessHours: number;
  recentRuns: Array<{
    jobName: string;
    success: boolean;
    finishedAt: string;
    durationMs: number;
    inserted: number;
    errors: number;
  }>;
  alerts: string[];
};

// ── Circuit Breaker ─────────────────────────────────────────────────────────

export type CircuitState = "closed" | "open" | "half-open";

// ── Reprocessing ────────────────────────────────────────────────────────────

export type ReprocessConfig = {
  /** Max studies to reprocess per run. */
  batchSize: number;
  /** Minimum age in hours before a study is eligible for reprocessing. */
  minAgeHours: number;
  /** Only reprocess studies with score below this threshold. */
  maxScoreForReprocess: number;
  /** Whether to apply adaptive weights during reprocessing. */
  useAdaptiveWeights: boolean;
};

export type ReprocessResult = {
  processed: number;
  upgraded: number;
  downgraded: number;
  unchanged: number;
  /** Studies that now fail classification and have been marked quality_status='bad'. */
  markedBad: number;
  errors: string[];
};

// ── Logging ─────────────────────────────────────────────────────────────────

export type PipelineLogLevel = "debug" | "info" | "warn" | "error";

export type PipelineLogEntry = {
  ts: string;
  level: PipelineLogLevel;
  stage: string;
  message: string;
  meta?: Record<string, unknown>;
};
