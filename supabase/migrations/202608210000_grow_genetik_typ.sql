-- ────────────────────────────────────────────────────────────────────────────
-- Migration: Add genetik_typ (Indica/Hybrid/Sativa) to grows
-- ────────────────────────────────────────────────────────────────────────────
-- Bloom-phase duration was previously keyed off the grower's experience
-- level (getPhaseDurations in lib/grow/phases.ts) — flowering time is
-- genetically fixed (a strain property), not a function of grower skill.
-- Nullable + no default: existing grows keep their already-generated plan
-- untouched (plan durations are computed once at creation time and stored,
-- not recomputed), and application code falls back to 'hybrid' wherever
-- genetik_typ is null. See TODO.md for the research behind this change.
-- ────────────────────────────────────────────────────────────────────────────

alter table public.grows
  add column if not exists genetik_typ text;
