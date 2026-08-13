// ──────────────────────────────────────────────────────────────────────────────
// Study Engine – Public API
// ──────────────────────────────────────────────────────────────────────────────
//
// Single entry point for the study processing engine.
//
// Usage:
//   import { runPipeline, DEFAULT_PIPELINE_CONFIG } from "@/lib/engine";
//
//   const result = await runPipeline(supabaseClient, {
//     lookbackDays: 7,
//     persistToStorage: true,
//   });
// ──────────────────────────────────────────────────────────────────────────────

export { runPipeline } from "./pipeline";
export { DEFAULT_PIPELINE_CONFIG } from "./config";

// Re-export types for consumers
export type {
  PipelineConfig,
  PipelineResult,
  PipelineMetrics,
  ProcessedStudy,
  StorageResult,
  PipelineLogEntry,
  FeedbackEvent,
  FeedbackEventType,
  StudyFeedbackAggregate,
  ScoringWeights,
  WeightAdjustment,
  PipelineHealthSnapshot,
  PipelineHealthStatus,
  ReprocessConfig,
  ReprocessResult,
} from "./types";

// Re-export individual modules for advanced usage / testing
export { fetchAllSources } from "./fetch/index";
export { fetchFromCrossref } from "./fetch/crossref";
export { normalizeStudies } from "./normalize";
export { deduplicateStudies, diceCoefficient } from "./dedup";
export { classifyStudy, classifyStudies } from "./classify";
export { scoreStudy, scoreStudies } from "./score";
export { persistStudies, fetchExistingFingerprints } from "./storage";
export { withRetry } from "./retry";
export { PipelineLogger, PipelineLogAggregator } from "./logger";

// Self-improving engine modules
export { recordFeedback, recordFeedbackBatch, computeFeedbackAggregates, topEngagedStudies } from "./feedback";
export {
  computeAdaptiveWeights,
  saveWeightAdjustment,
  buildStudyProfiles,
  BASELINE_WEIGHTS,
} from "./adaptive";
export { computePipelineHealth, shouldPipelineRun } from "./monitor";
export { runReprocessLoop, DEFAULT_REPROCESS_CONFIG } from "./reprocess";
export { CircuitBreaker, CircuitOpenError, getCircuitBreaker, getAllCircuitBreakers } from "./circuitBreaker";
