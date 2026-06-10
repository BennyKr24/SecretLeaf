-- Knowledge Graph alignment
-- Adds stable article keys to studies and introduces wiki_relationships
-- as the canonical graph table for Grow, Diagnose and Recommendation flows.

alter table public.studies
  add column if not exists slug text,
  add column if not exists summary text,
  add column if not exists difficulty text check (difficulty in ('einsteiger', 'fortgeschritten', 'profi')),
  add column if not exists source_count integer not null default 0,
  add column if not exists confidence_score integer not null default 50 check (confidence_score between 0 and 100),
  add column if not exists practical_interpretation text,
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists studies_slug_uidx
  on public.studies (slug)
  where slug is not null;

drop trigger if exists trg_studies_updated_at on public.studies;
create trigger trg_studies_updated_at
  before update on public.studies
  for each row execute function public.tg_set_updated_at();

create table if not exists public.wiki_relationships (
  id uuid primary key default gen_random_uuid(),
  source_slug text not null,
  source_type text not null check (source_type in (
    'study',
    'diagnosis_pattern',
    'grow_phase',
    'grow_medium',
    'grow_signal',
    'log_type',
    'task_category',
    'tool',
    'context_rule'
  )),
  target_slug text not null,
  target_type text not null check (target_type in (
    'study',
    'diagnosis_pattern',
    'grow_phase',
    'grow_medium',
    'grow_signal',
    'log_type',
    'task_category',
    'tool',
    'context_rule'
  )),
  relation_type text not null check (relation_type in (
    'related',
    'supports_diagnosis',
    'supports_recommendation',
    'supports_context_rule',
    'recommends_tool',
    'maps_task_category'
  )),
  weight integer not null default 1 check (weight between 1 and 100),
  confidence_score integer not null default 50 check (confidence_score between 0 and 100),
  evidence_level text not null default 'medium' check (evidence_level in ('low', 'medium', 'high')),
  explanation text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_slug, source_type, target_slug, target_type, relation_type)
);

create index if not exists wiki_relationships_source_idx
  on public.wiki_relationships (source_type, source_slug);

create index if not exists wiki_relationships_target_idx
  on public.wiki_relationships (target_type, target_slug);

create index if not exists wiki_relationships_relation_type_idx
  on public.wiki_relationships (relation_type);

alter table public.wiki_relationships enable row level security;

drop policy if exists wiki_relationships_select_authenticated on public.wiki_relationships;
create policy wiki_relationships_select_authenticated
on public.wiki_relationships
for select
to authenticated
using (true);

drop policy if exists wiki_relationships_provider_write on public.wiki_relationships;
create policy wiki_relationships_provider_write
on public.wiki_relationships
for all
to authenticated
using (
  exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role in ('PROVIDER', 'ADMIN', 'TEAM')
  )
)
with check (
  exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role in ('PROVIDER', 'ADMIN', 'TEAM')
  )
);

drop trigger if exists trg_wiki_relationships_updated_at on public.wiki_relationships;
create trigger trg_wiki_relationships_updated_at
  before update on public.wiki_relationships
  for each row execute function public.tg_set_updated_at();