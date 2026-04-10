// ──────────────────────────────────────────────────────────────────────────────
// Study Engine – Deduplication Engine
// ──────────────────────────────────────────────────────────────────────────────
//
// Three-tier deduplication:
// 1. Exact DOI match
// 2. SHA-256 fingerprint match
// 3. Fuzzy title similarity (bigram-based Sørensen–Dice coefficient)
//
// Avoids false positives by requiring high fuzzy threshold (default 0.85).
// Avoids false negatives by checking all three tiers for every item.
// ──────────────────────────────────────────────────────────────────────────────

import type { DedupVerdict, NormalizedStudy } from "./types";
import type { PipelineLogger } from "./logger";

// ── Bigram-based Similarity ─────────────────────────────────────────────────

/**
 * Generate character bigrams from a string.
 * E.g. "hello" → ["he", "el", "ll", "lo"]
 */
function bigrams(text: string): Set<string> {
  const result = new Set<string>();
  for (let i = 0; i < text.length - 1; i++) {
    result.add(text.slice(i, i + 2));
  }
  return result;
}

/**
 * Sørensen–Dice coefficient between two strings.
 * Returns a value between 0 (no overlap) and 1 (identical).
 * Operates on the normalized title for consistency.
 */
function diceCoefficient(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return 0;

  const bigramsA = bigrams(a);
  const bigramsB = bigrams(b);

  let intersection = 0;
  for (const bg of bigramsA) {
    if (bigramsB.has(bg)) intersection++;
  }

  return (2 * intersection) / (bigramsA.size + bigramsB.size);
}

// ── Deduplication Engine ────────────────────────────────────────────────────

export type DedupResult = {
  unique: NormalizedStudy[];
  duplicates: Array<{
    study: NormalizedStudy;
    verdict: DedupVerdict;
  }>;
};

/**
 * Deduplicate a list of normalized studies.
 *
 * Checks against:
 * 1. Internal duplicates within the batch
 * 2. Optionally, existing fingerprints from the database
 *
 * @param studies - Normalized studies to deduplicate
 * @param existingFingerprints - Set of fingerprints already in storage
 * @param fuzzyThreshold - Minimum Dice coefficient to consider as duplicate (0-1)
 * @param logger - Pipeline logger
 */
export function deduplicateStudies(
  studies: NormalizedStudy[],
  existingFingerprints: Set<string>,
  fuzzyThreshold: number,
  logger: PipelineLogger,
): DedupResult {
  const unique: NormalizedStudy[] = [];
  const duplicates: DedupResult["duplicates"] = [];

  // Indexes for internal dedup within batch
  const seenDois = new Map<string, number>(); // doi → index in unique[]
  const seenFingerprints = new Map<string, number>(); // fingerprint → index in unique[]
  const seenTitles: Array<{ normalized: string; index: number }> = [];

  for (const study of studies) {
    const verdict = checkDuplicate(
      study,
      seenDois,
      seenFingerprints,
      seenTitles,
      existingFingerprints,
      fuzzyThreshold,
    );

    if (verdict.isDuplicate) {
      duplicates.push({ study, verdict });
      continue;
    }

    const idx = unique.length;
    unique.push(study);

    // Register in indexes
    if (study.doi) {
      seenDois.set(study.doi, idx);
    }
    seenFingerprints.set(study.fingerprint, idx);
    seenTitles.push({ normalized: study.titleNormalized, index: idx });
  }

  logger.info(
    `Dedup: ${unique.length} unique, ${duplicates.length} duplicates from ${studies.length} input`,
    {
      byDoi: duplicates.filter((d) => d.verdict.reason === "doi-match").length,
      byFingerprint: duplicates.filter((d) => d.verdict.reason === "fingerprint-match").length,
      byFuzzy: duplicates.filter((d) => d.verdict.reason === "fuzzy-title-match").length,
    },
  );

  return { unique, duplicates };
}

function checkDuplicate(
  study: NormalizedStudy,
  seenDois: Map<string, number>,
  seenFingerprints: Map<string, number>,
  seenTitles: Array<{ normalized: string; index: number }>,
  existingFingerprints: Set<string>,
  fuzzyThreshold: number,
): DedupVerdict {
  // Tier 1: Exact DOI match (strongest signal)
  if (study.doi && seenDois.has(study.doi)) {
    return {
      isDuplicate: true,
      reason: "doi-match",
      matchedFingerprint: null,
    };
  }

  // Tier 2: SHA-256 fingerprint match (covers exact URL/title+publisher)
  if (seenFingerprints.has(study.fingerprint)) {
    return {
      isDuplicate: true,
      reason: "fingerprint-match",
      matchedFingerprint: study.fingerprint,
    };
  }

  // Check against existing DB fingerprints
  if (existingFingerprints.has(study.fingerprint)) {
    return {
      isDuplicate: true,
      reason: "fingerprint-match",
      matchedFingerprint: study.fingerprint,
    };
  }

  // Tier 3: Fuzzy title similarity
  // Only check if title is long enough to be meaningful
  if (study.titleNormalized.length >= 15) {
    for (const seen of seenTitles) {
      const similarity = diceCoefficient(study.titleNormalized, seen.normalized);
      if (similarity >= fuzzyThreshold) {
        return {
          isDuplicate: true,
          reason: "fuzzy-title-match",
          matchedFingerprint: null,
        };
      }
    }
  }

  return { isDuplicate: false, reason: null, matchedFingerprint: null };
}

// Export for testing
export { diceCoefficient, bigrams };
