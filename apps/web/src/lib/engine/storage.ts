// ──────────────────────────────────────────────────────────────────────────────
// Study Engine – Storage Layer (Supabase)
// ──────────────────────────────────────────────────────────────────────────────
//
// Persists processed studies to Supabase:
// - Batch insert for new studies
// - Individual update for existing ones
// - Fingerprint-based existence check
// - No silent failures — every operation is logged
// ──────────────────────────────────────────────────────────────────────────────

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProcessedStudy, StorageResult } from "./types";
import { BATCH_INSERT_SIZE, STUDIES_TABLE } from "./config";
import type { PipelineLogger } from "./logger";

// ── Row Shape ───────────────────────────────────────────────────────────────

type StudyInsertRow = {
  title: string;
  description: string | null;
  source: string | null;
  tags: string[];
  source_fingerprint: string;
  quality_status: "pending";
  reviewed_by: null;
  reviewed_at: null;
  review_note: null;
  doi: string | null;
  study_type: string;
  evidence_level: number;
  publisher_quality: number;
  topic_fit: number;
  relevance_score: number;
  editorial_priority: string;
  matched_topics: string[];
  flags: string[];
  first_author: string | null;
  abstract_snippet: string | null;
  origin_label: string;
  affiliation_hints: string[];
  review_summary: string[];
  fetched_at: string;
};

// ── Mapping ─────────────────────────────────────────────────────────────────

function toInsertRow(study: ProcessedStudy): StudyInsertRow {
  return {
    title: study.title,
    description: study.reviewSummary.join(" ") || null,
    source: study.url ?? study.publisher,
    tags: study.tags,
    source_fingerprint: study.fingerprint,
    quality_status: "pending",
    reviewed_by: null,
    reviewed_at: null,
    review_note: null,
    doi: study.doi,
    study_type: study.studyType,
    evidence_level: study.evidenceLevel,
    publisher_quality: study.publisherQuality,
    topic_fit: study.topicFit,
    relevance_score: study.relevanceScore,
    editorial_priority: study.editorialPriority,
    matched_topics: study.matchedTopics,
    flags: study.flags,
    first_author: study.firstAuthor,
    abstract_snippet: study.abstractSnippet,
    origin_label: study.originLabel,
    affiliation_hints: study.affiliations,
    review_summary: study.reviewSummary,
    fetched_at: new Date().toISOString(),
  };
}

type UpdatePayload = Omit<StudyInsertRow, "quality_status" | "reviewed_by" | "reviewed_at" | "review_note">;

function toUpdatePayload(study: ProcessedStudy): UpdatePayload {
  return {
    title: study.title,
    description: study.reviewSummary.join(" ") || null,
    source: study.url ?? study.publisher,
    tags: study.tags,
    source_fingerprint: study.fingerprint,
    doi: study.doi,
    study_type: study.studyType,
    evidence_level: study.evidenceLevel,
    publisher_quality: study.publisherQuality,
    topic_fit: study.topicFit,
    relevance_score: study.relevanceScore,
    editorial_priority: study.editorialPriority,
    matched_topics: study.matchedTopics,
    flags: study.flags,
    first_author: study.firstAuthor,
    abstract_snippet: study.abstractSnippet,
    origin_label: study.originLabel,
    affiliation_hints: study.affiliations,
    review_summary: study.reviewSummary,
    fetched_at: new Date().toISOString(),
  };
}

// ── Fetch Existing Fingerprints ─────────────────────────────────────────────

/**
 * Fetch all fingerprints that already exist in the database.
 * Used for deduplication before insert.
 */
export async function fetchExistingFingerprints(
  supabase: SupabaseClient,
  fingerprints: string[],
  logger: PipelineLogger,
): Promise<Map<string, string>> {
  if (fingerprints.length === 0) return new Map();

  const result = new Map<string, string>();

  // Supabase `.in()` has a practical limit; chunk to be safe
  const chunkSize = 200;
  for (let i = 0; i < fingerprints.length; i += chunkSize) {
    const chunk = fingerprints.slice(i, i + chunkSize);

    const { data, error } = await supabase
      .from(STUDIES_TABLE)
      .select("id, source_fingerprint")
      .in("source_fingerprint", chunk);

    if (error) {
      logger.error(`Failed to fetch existing fingerprints (chunk ${i})`, {
        error: error.message,
      });
      throw new Error(`Fingerprint lookup failed: ${error.message}`);
    }

    for (const row of data ?? []) {
      if (typeof row.source_fingerprint === "string") {
        result.set(row.source_fingerprint, row.id as string);
      }
    }
  }

  logger.debug(`Found ${result.size} existing studies by fingerprint`);
  return result;
}

// ── Persist Studies ─────────────────────────────────────────────────────────

export type PersistResult = {
  inserted: number;
  updated: number;
  skipped: number;
  errors: string[];
  details: StorageResult[];
};

/**
 * Persist processed studies to Supabase.
 * - New studies (no existing fingerprint) → batch insert
 * - Existing studies → individual update (preserves review status)
 * - Logs every operation
 */
export async function persistStudies(
  supabase: SupabaseClient,
  studies: ProcessedStudy[],
  existingByFingerprint: Map<string, string>,
  logger: PipelineLogger,
): Promise<PersistResult> {
  const result: PersistResult = {
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: [],
    details: [],
  };

  if (studies.length === 0) {
    logger.info("Storage: nothing to persist");
    return result;
  }

  // Split into insert vs update
  const toInsert: ProcessedStudy[] = [];
  const toUpdate: Array<{ study: ProcessedStudy; existingId: string }> = [];

  for (const study of studies) {
    const existingId = existingByFingerprint.get(study.fingerprint);
    if (existingId) {
      toUpdate.push({ study, existingId });
    } else {
      toInsert.push(study);
    }
  }

  // ── Batch Insert ──────────────────────────────────────────────────────
  if (toInsert.length > 0) {
    const rows = toInsert.map(toInsertRow);

    for (let i = 0; i < rows.length; i += BATCH_INSERT_SIZE) {
      const batch = rows.slice(i, i + BATCH_INSERT_SIZE);
      const batchStudies = toInsert.slice(i, i + BATCH_INSERT_SIZE);

      const { error } = await supabase.from(STUDIES_TABLE).insert(batch);

      if (error) {
        const message = `Insert batch ${i}-${i + batch.length} failed: ${error.message}`;
        logger.error(message);
        result.errors.push(message);

        // Mark all items in failed batch
        for (const study of batchStudies) {
          result.details.push({
            fingerprint: study.fingerprint,
            action: "skipped",
            studyId: null,
            error: error.message,
          });
          result.skipped++;
        }
      } else {
        for (const study of batchStudies) {
          result.details.push({
            fingerprint: study.fingerprint,
            action: "inserted",
            studyId: null, // Supabase insert doesn't return IDs in batch mode by default
            error: null,
          });
          result.inserted++;
        }
      }
    }

    logger.info(`Inserted ${result.inserted} new studies`);
  }

  // ── Individual Updates ────────────────────────────────────────────────
  for (const { study, existingId } of toUpdate) {
    const payload = toUpdatePayload(study);

    const { error } = await supabase
      .from(STUDIES_TABLE)
      .update(payload)
      .eq("id", existingId);

    if (error) {
      const message = `Update ${existingId} failed: ${error.message}`;
      logger.error(message);
      result.errors.push(message);
      result.details.push({
        fingerprint: study.fingerprint,
        action: "skipped",
        studyId: existingId,
        error: error.message,
      });
      result.skipped++;
    } else {
      result.details.push({
        fingerprint: study.fingerprint,
        action: "updated",
        studyId: existingId,
        error: null,
      });
      result.updated++;
    }
  }

  logger.info(
    `Storage complete: ${result.inserted} inserted, ${result.updated} updated, ${result.skipped} skipped`,
    { errors: result.errors.length },
  );

  return result;
}
