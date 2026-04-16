// ──────────────────────────────────────────────────────────────────────────────
// Shared public-studies query helpers
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Supabase `.or()` filter string for publicly visible studies.
 *
 * Exposes:
 * - Studies explicitly marked quality_status = 'good' (human-reviewed)
 * - Auto-ingested studies still in 'pending' state that have a high or medium
 *   editorial_priority (i.e. scored well enough to be surfaced immediately)
 *
 * Studies with quality_status = 'bad' are never exposed.
 */
export const PUBLIC_STUDIES_QUALITY_FILTER =
  "quality_status.eq.good,and(quality_status.eq.pending,editorial_priority.in.(high,medium))";
