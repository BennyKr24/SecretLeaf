// ──────────────────────────────────────────────────────────────────────────────
// Study Engine – Normalization Layer
// ──────────────────────────────────────────────────────────────────────────────
//
// Cleans and standardizes raw study data:
// - Strips HTML tags and excess whitespace
// - Normalizes Unicode (NFD → NFC)
// - Standardizes empty/null fields to safe defaults
// - Generates deterministic SHA-256 fingerprint
// ──────────────────────────────────────────────────────────────────────────────

import { createHash } from "node:crypto";
import type { NormalizedStudy, RawStudy } from "./types";
import type { PipelineLogger } from "./logger";

// ── Text utilities ──────────────────────────────────────────────────────────

/** Remove HTML tags and collapse whitespace. */
function stripHtml(text: string): string {
  return text
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Normalize a title for comparison: lowercase, collapse whitespace, strip punctuation. */
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFC")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Clean any string field — trim, collapse whitespace. */
function cleanField(value: string | null | undefined): string | null {
  if (!value) return null;
  const cleaned = value.replace(/\s+/g, " ").trim();
  return cleaned.length > 0 ? cleaned : null;
}

/** Truncate text to max length with ellipsis. */
function truncate(text: string | null, maxLength: number): string | null {
  if (!text) return null;
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

// ── Fingerprinting ──────────────────────────────────────────────────────────

/**
 * Generate a deterministic SHA-256 fingerprint for deduplication.
 * Priority: DOI > URL > normalized title + publisher.
 */
function generateFingerprint(study: {
  doi: string | null;
  url: string | null;
  titleNormalized: string;
  publisher: string;
}): string {
  const raw = study.doi?.trim().toLowerCase()
    ?? study.url?.trim().toLowerCase()
    ?? `${study.titleNormalized}|${study.publisher.toLowerCase()}`;

  return createHash("sha256").update(raw).digest("hex");
}

// ── Normalization Pipeline ──────────────────────────────────────────────────

/**
 * Normalize a batch of raw studies.
 * Drops items with no title and logs warnings for data quality issues.
 */
export function normalizeStudies(
  raw: RawStudy[],
  logger: PipelineLogger,
): NormalizedStudy[] {
  const results: NormalizedStudy[] = [];
  let droppedCount = 0;

  for (const item of raw) {
    const title = cleanField(item.title);
    if (!title || title.length < 5) {
      droppedCount++;
      continue;
    }

    const titleNormalized = normalizeTitle(title);

    const abstract = item.abstract ? stripHtml(item.abstract) : null;

    const publisher = cleanField(item.publisher) ?? "Unknown publisher";
    const year = cleanField(item.year) ?? String(new Date().getFullYear());
    const doi = item.doi ? item.doi.trim().toLowerCase() : null;
    const url = cleanField(item.url);
    const firstAuthor = cleanField(item.firstAuthor);
    const affiliations = item.affiliations
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    const normalized: NormalizedStudy = {
      title,
      titleNormalized,
      doi,
      url,
      publisher,
      year,
      abstract: truncate(abstract, 4000),
      firstAuthor,
      affiliations: [...new Set(affiliations)].slice(0, 4),
      fingerprint: "", // placeholder, set below
      meta: item.meta,
    };

    normalized.fingerprint = generateFingerprint(normalized);

    results.push(normalized);
  }

  if (droppedCount > 0) {
    logger.warn(`Normalization dropped ${droppedCount} items with missing/short titles`);
  }

  logger.info(`Normalized ${results.length} studies from ${raw.length} raw items`);
  return results;
}

// Re-export utilities for use by other modules
export { normalizeTitle, stripHtml, cleanField, truncate, generateFingerprint };
