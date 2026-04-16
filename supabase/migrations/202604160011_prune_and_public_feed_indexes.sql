-- Engine Prune: Add partial indexes to speed up low-quality study cleanup queries
-- and the public studies API.
--
-- These indexes cover the exact WHERE/ORDER BY patterns used by:
--   1. engine-prune: quality_status='bad' and quality_status='pending' + low score
--   2. /api/public/studies: public feed queries ordered by score/date

-- ── Prune indexes ────────────────────────────────────────────────────────────

-- Fast scan for editorially rejected studies
create index if not exists studies_quality_bad_idx
  on public.studies (quality_status)
  where quality_status = 'bad';

-- Fast scan for auto-ingested low-score pending studies eligible for pruning
create index if not exists studies_prune_candidates_idx
  on public.studies (relevance_score, fetched_at)
  where quality_status = 'pending';

-- ── Public feed indexes ──────────────────────────────────────────────────────

-- Top studies ordered by score (used by /api/public/studies?mode=top)
create index if not exists studies_public_top_idx
  on public.studies (relevance_score desc nulls last, editorial_priority)
  where quality_status in ('good', 'pending') and relevance_score is not null;

-- Recent studies ordered by fetch date (used by /api/public/studies?mode=recent)
create index if not exists studies_public_recent_idx
  on public.studies (fetched_at desc nulls last)
  where quality_status in ('good', 'pending');

-- Category feed (used by /api/public/studies?category=xxx)
create index if not exists studies_category_score_idx
  on public.studies (category, relevance_score desc nulls last)
  where category is not null and quality_status in ('good', 'pending');
