-- P1: Normalize study quality fields + upsert fingerprint support

alter table public.studies
  add column if not exists quality_status text not null default 'pending' check (quality_status in ('good', 'pending', 'bad')),
  add column if not exists reviewed_by uuid references auth.users(id),
  add column if not exists reviewed_at timestamptz,
  add column if not exists review_note text,
  add column if not exists source_fingerprint text;

-- Backfill quality from legacy quality:* tags
update public.studies
set quality_status = case
  when tags @> array['quality:good']::text[] then 'good'
  when tags @> array['quality:bad']::text[] then 'bad'
  else 'pending'
end
where quality_status is null
   or quality_status not in ('good', 'pending', 'bad');

create unique index if not exists studies_source_fingerprint_uidx
  on public.studies (source_fingerprint);

create index if not exists studies_quality_status_created_at_idx
  on public.studies (quality_status, created_at desc);

create index if not exists studies_reviewed_by_idx
  on public.studies (reviewed_by);
