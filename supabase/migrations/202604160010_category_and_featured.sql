-- Study Engine: Add primary category and featured flag to studies table
-- Adds a derived primary category (from matched_topics) and a featured boolean
-- so individual studies can be pinned as featured content.

-- ── New columns ─────────────────────────────────────────────────────────────

alter table public.studies
  add column if not exists category text,
  add column if not exists featured boolean not null default false;

-- ── Indexes ──────────────────────────────────────────────────────────────────

create index if not exists studies_category_idx
  on public.studies (category)
  where category is not null;

create index if not exists studies_featured_idx
  on public.studies (featured)
  where featured = true;

-- ── Back-fill category from matched_topics ───────────────────────────────────
-- Uses a simple priority order: anbau-postharvest first (cultivation platform),
-- then other topic clusters in descending specificity.

update public.studies
set category = case
  when matched_topics @> array['anbau-postharvest']  then 'anbau-postharvest'
  when matched_topics @> array['qualitaet-labor']    then 'qualitaet-labor'
  when matched_topics @> array['pharmakologie']      then 'pharmakologie'
  when matched_topics @> array['medizin-evidenz']    then 'medizin-evidenz'
  when matched_topics @> array['markt-regulierung']  then 'markt-regulierung'
  when array_length(matched_topics, 1) > 0           then matched_topics[1]
  else null
end
where category is null;

-- ── Comment ──────────────────────────────────────────────────────────────────

comment on column public.studies.category is
  'Primary topic category derived from matched_topics. Populated during ingestion and reprocessing.';

comment on column public.studies.featured is
  'When true, the study is pinned as featured content in the frontend.';
