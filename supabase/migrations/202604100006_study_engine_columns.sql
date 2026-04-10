-- Study Engine: Enrich studies table with structured ingestion fields
-- Adds columns for the new study processing engine while preserving
-- all existing data and RLS policies.

-- ── New columns ─────────────────────────────────────────────────────────────

alter table public.studies
  add column if not exists doi text,
  add column if not exists study_type text,
  add column if not exists evidence_level integer,
  add column if not exists publisher_quality integer,
  add column if not exists topic_fit integer,
  add column if not exists relevance_score integer,
  add column if not exists editorial_priority text check (editorial_priority in ('high', 'medium', 'low')),
  add column if not exists matched_topics text[] not null default '{}',
  add column if not exists flags text[] not null default '{}',
  add column if not exists first_author text,
  add column if not exists abstract_snippet text,
  add column if not exists origin_label text,
  add column if not exists affiliation_hints text[] not null default '{}',
  add column if not exists review_summary text[] not null default '{}',
  add column if not exists fetched_at timestamptz;

-- ── Indexes for common query patterns ───────────────────────────────────────

create index if not exists studies_relevance_score_idx
  on public.studies (relevance_score desc nulls last);

create index if not exists studies_editorial_priority_idx
  on public.studies (editorial_priority, relevance_score desc nulls last);

create index if not exists studies_study_type_idx
  on public.studies (study_type);

create index if not exists studies_doi_idx
  on public.studies (doi)
  where doi is not null;

create index if not exists studies_fetched_at_idx
  on public.studies (fetched_at desc nulls last);

-- GIN index for efficient topic/tag array searches
create index if not exists studies_matched_topics_gin_idx
  on public.studies using gin (matched_topics);

create index if not exists studies_flags_gin_idx
  on public.studies using gin (flags);
