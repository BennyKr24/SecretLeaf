// ──────────────────────────────────────────────────────────────────────────────
// Study Engine – Pipeline Orchestrator
// ──────────────────────────────────────────────────────────────────────────────
//
// Wires all modules together in a deterministic sequence:
//
//   Fetch → Normalize → Dedup → Classify → Score → Assemble → Store
//
// Each stage feeds into the next. The pipeline is fully observable through
// the structured logger. Every run produces a PipelineResult with metrics.
// ──────────────────────────────────────────────────────────────────────────────

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ClassificationResult,
  NormalizedStudy,
  PipelineConfig,
  PipelineMetrics,
  PipelineResult,
  ProcessedStudy,
  ScoringResult,
} from "./types";
import { DEFAULT_PIPELINE_CONFIG } from "./config";
import { PipelineLogAggregator } from "./logger";
import { fetchAllSources } from "./fetch/index";
import { normalizeStudies, truncate } from "./normalize";
import { deduplicateStudies } from "./dedup";
import { classifyStudies } from "./classify";
import { scoreStudies } from "./score";
import { fetchExistingFingerprints, persistStudies } from "./storage";
import { shouldPipelineRun } from "./monitor";

// ── Assembly ────────────────────────────────────────────────────────────────

/** Derive the origin label for editorial display. */
function deriveOriginLabel(study: NormalizedStudy): string {
  const affiliation = study.affiliations[0];
  if (affiliation) return affiliation;
  return study.publisher;
}

/** Build a 3-line review summary in German for the editorial inbox. */
function buildReviewSummary(
  study: NormalizedStudy,
  classification: ClassificationResult,
  scoring: ScoringResult,
): string[] {
  const typeMap: Record<string, string> = {
    "meta-analysis": "Meta-Analyse mit hoher Evidenz.",
    "systematic-review": "Systematisches Review mit guter Evidenzbasis.",
    "controlled-study": "Kontrollierte Studie mit direktem Praxisbezug.",
    "clinical-trial": "Klinische Studie mit direktem Anwendungsbezug.",
    "laboratory-study": "Labor-/Analytik-Arbeit fuer Qualitaet oder Profile.",
    "observational-study": "Beobachtungsstudie, eher kontext- als beweisstark.",
    "protocol": "Studienprotokoll, relevant nur nach gezielter Kurationsentscheidung.",
    "case-report": "Einzelfallbericht, eher schwache Evidenz.",
    "general-study": "Allgemeine Studie mit Cannabis-Bezug.",
  };

  const topicText =
    classification.matchedTopics.length > 0
      ? `Fokus: ${classification.matchedTopics.join(", ")}.`
      : "Kein klarer Themencluster erkannt.";

  const origin = deriveOriginLabel(study);
  const abstractLine =
    truncate(study.abstract, 170) ?? "Kein belastbarer Abstract-Auszug verfuegbar.";

  return [
    typeMap[classification.studyType] ?? typeMap["general-study"] ?? "Allgemeine Studie mit Cannabis-Bezug.",
    `${origin} · ${study.year} · Prioritaet ${scoring.editorialPriority}. ${topicText}`,
    abstractLine,
  ];
}

/** Build tag set for a processed study. */
function buildTags(
  study: NormalizedStudy,
  classification: ClassificationResult,
): string[] {
  const tags = new Set<string>();
  tags.add("auto");
  tags.add("study-engine");
  tags.add("crossref");

  for (const topic of classification.matchedTopics) {
    tags.add(topic);
  }

  // Carry through source-level subjects
  const subjects = (study.meta as Record<string, unknown>).subjects;
  if (Array.isArray(subjects)) {
    for (const s of subjects) {
      if (typeof s === "string" && s.length > 0 && s.length < 80) {
        tags.add(s.toLowerCase());
      }
    }
  }

  return [...tags];
}

/** Assemble the final ProcessedStudy from all pipeline stages. */
function assembleProcessedStudy(
  study: NormalizedStudy,
  classification: ClassificationResult,
  scoring: ScoringResult,
): ProcessedStudy {
  const reviewSummary = buildReviewSummary(study, classification, scoring);
  const tags = buildTags(study, classification);

  return {
    // Identity
    title: study.title,
    titleNormalized: study.titleNormalized,
    doi: study.doi,
    url: study.url,
    publisher: study.publisher,
    year: study.year,
    abstract: study.abstract,
    abstractSnippet: truncate(study.abstract, 240),
    firstAuthor: study.firstAuthor,
    affiliations: study.affiliations,
    originLabel: deriveOriginLabel(study),
    fingerprint: study.fingerprint,

    // Classification
    studyType: classification.studyType,
    matchedTopics: classification.matchedTopics,
    topicFit: classification.topicFit,
    flags: classification.flags,

    // Scoring
    relevanceScore: scoring.relevanceScore,
    evidenceLevel: scoring.breakdown.evidenceLevel,
    publisherQuality: scoring.breakdown.publisherQuality,
    freshness: scoring.breakdown.freshness,
    editorialPriority: scoring.editorialPriority,
    scoreBreakdown: scoring.breakdown,

    // Meta
    tags,
    reviewSummary,
  };
}

// ── Pipeline Execution ──────────────────────────────────────────────────────

/**
 * Execute the full study ingestion pipeline.
 *
 * @param supabase - Supabase client (service role). Pass null for dry-run.
 * @param configOverrides - Partial config overrides (merged with defaults).
 * @returns Full pipeline result with metrics, accepted studies, and rejections.
 */
export async function runPipeline(
  supabase: SupabaseClient | null,
  configOverrides?: Partial<PipelineConfig>,
): Promise<PipelineResult> {
  const config: PipelineConfig = { ...DEFAULT_PIPELINE_CONFIG, ...configOverrides };
  const logs = new PipelineLogAggregator();
  const startedAt = new Date().toISOString();
  const startMs = Date.now();

  const metrics: PipelineMetrics = {
    startedAt,
    finishedAt: "",
    durationMs: 0,
    fetched: 0,
    normalized: 0,
    deduplicated: 0,
    classified: 0,
    accepted: 0,
    rejected: 0,
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: [],
    attempts: 1,
  };

  const pipelineLog = logs.createLogger("pipeline");
  pipelineLog.info("Pipeline started", { config });

  try {
    // ── Stage 0: Health Gate ──────────────────────────────────────────
    if (supabase) {
      const healthLog = logs.createLogger("health-gate");
      const { proceed, reason } = await shouldPipelineRun(supabase, healthLog);
      if (!proceed) {
        pipelineLog.warn(`Pipeline blocked by health gate: ${reason}`);
        metrics.errors.push(`health-gate: ${reason}`);
        return finalize(metrics, startMs, [], [], logs);
      }
      healthLog.info(`Health gate passed: ${reason}`);
    }

    // ── Stage 1: Fetch ────────────────────────────────────────────────
    const fetchLog = logs.createLogger("fetch");
    const fetchResult = await fetchAllSources(config, fetchLog);
    metrics.fetched = fetchResult.items.length;
    metrics.errors.push(...fetchResult.queryStats.filter((q) => q.error).map((q) => q.error!));

    if (fetchResult.items.length === 0) {
      pipelineLog.warn("Pipeline stopping: no items fetched");
      return finalize(metrics, startMs, [], [], logs);
    }

    // ── Stage 2: Normalize ────────────────────────────────────────────
    const normalizeLog = logs.createLogger("normalize");
    const normalized = normalizeStudies(fetchResult.items, normalizeLog);
    metrics.normalized = normalized.length;

    if (normalized.length === 0) {
      pipelineLog.warn("Pipeline stopping: all items dropped during normalization");
      return finalize(metrics, startMs, [], [], logs);
    }

    // ── Stage 3: Deduplicate ──────────────────────────────────────────
    const dedupLog = logs.createLogger("dedup");

    // Fetch existing fingerprints from DB if storage is enabled
    let existingFingerprints = new Set<string>();
    if (supabase && config.skipExisting) {
      const storageLog = logs.createLogger("storage-prefetch");
      const allFingerprints = normalized.map((s) => s.fingerprint);
      const existing = await fetchExistingFingerprints(supabase, allFingerprints, storageLog);
      existingFingerprints = new Set(existing.keys());
    }

    const dedupResult = deduplicateStudies(
      normalized,
      existingFingerprints,
      config.fuzzyThreshold,
      dedupLog,
    );
    metrics.deduplicated = dedupResult.unique.length;

    if (dedupResult.unique.length === 0) {
      pipelineLog.info("Pipeline stopping: all items are duplicates");
      return finalize(metrics, startMs, [], [], logs);
    }

    // ── Stage 4: Classify ─────────────────────────────────────────────
    const classifyLog = logs.createLogger("classify");
    const classifyResult = classifyStudies(dedupResult.unique, classifyLog);
    metrics.classified = classifyResult.classified.length;

    const rejected: Array<{ title: string; reason: string }> = [
      ...classifyResult.excluded,
    ];

    if (classifyResult.classified.length === 0) {
      pipelineLog.warn("Pipeline stopping: all items excluded by classification");
      return finalize(metrics, startMs, [], rejected, logs);
    }

    // ── Stage 5: Score ────────────────────────────────────────────────
    const scoreLog = logs.createLogger("score");
    const scored = scoreStudies(
      classifyResult.classified,
      config.minAcceptScore,
      scoreLog,
    );

    // ── Stage 6: Assemble ─────────────────────────────────────────────
    const acceptedItems: ProcessedStudy[] = [];

    for (const item of scored) {
      if (item.scoring.accepted) {
        acceptedItems.push(
          assembleProcessedStudy(item.study, item.classification, item.scoring),
        );
      } else {
        rejected.push({
          title: item.study.title,
          reason: item.scoring.rejectionReason ?? "rejected-by-scoring",
        });
      }
    }

    // Sort by relevance score descending and cap at maxProcessed
    acceptedItems.sort((a, b) => b.relevanceScore - a.relevanceScore);
    const finalAccepted = acceptedItems.slice(0, config.maxProcessed);

    metrics.accepted = finalAccepted.length;
    metrics.rejected = rejected.length;

    pipelineLog.info(
      `Pipeline assembled: ${finalAccepted.length} accepted, ${rejected.length} rejected`,
    );

    // ── Stage 7: Persist ──────────────────────────────────────────────
    if (supabase && config.persistToStorage && finalAccepted.length > 0) {
      const storageLog = logs.createLogger("storage");

      // Re-compute existing map for the final accepted set
      const acceptedFingerprints = finalAccepted.map((s) => s.fingerprint);
      const existingMap = await fetchExistingFingerprints(supabase, acceptedFingerprints, storageLog);

      const persistResult = await persistStudies(supabase, finalAccepted, existingMap, storageLog);
      metrics.inserted = persistResult.inserted;
      metrics.updated = persistResult.updated;
      metrics.skipped += persistResult.skipped;
      metrics.errors.push(...persistResult.errors);
    } else if (!supabase) {
      pipelineLog.info("Dry-run mode: skipping storage");
    }

    return finalize(metrics, startMs, finalAccepted, rejected, logs);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    pipelineLog.error(`Pipeline failed: ${message}`);
    metrics.errors.push(message);
    return finalize(metrics, startMs, [], [], logs, false);
  }
}

// ── Finalize ────────────────────────────────────────────────────────────────

function finalize(
  metrics: PipelineMetrics,
  startMs: number,
  accepted: ProcessedStudy[],
  rejected: Array<{ title: string; reason: string }>,
  logs: PipelineLogAggregator,
  success = true,
): PipelineResult {
  metrics.finishedAt = new Date().toISOString();
  metrics.durationMs = Date.now() - startMs;

  // Pull errors from logger if not already captured
  const logErrors = logs.getAllErrors();
  for (const err of logErrors) {
    if (!metrics.errors.includes(err)) {
      metrics.errors.push(err);
    }
  }

  const hasErrors = metrics.errors.length > 0;

  return {
    success: success && !hasErrors,
    metrics,
    accepted,
    rejected,
  };
}
