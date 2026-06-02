-- ────────────────────────────────────────────────────────────────────────────
-- Migration: Knowledge Operating System
--
-- Replaces the code-bound static wiki with a normalized, graph-ready, AI-ready
-- knowledge platform that lives entirely in Supabase.
--
-- Designed for scale: 100,000+ articles, 1,000,000+ article relations.
--
-- Sections:
--   1. Enums
--   2. Core content     (categories, articles, sections, faqs)
--   3. Taxonomy         (tags, article_tags)
--   4. Sources          (sources, references)
--   5. Knowledge graph  (relations)
--   6. Editorial        (contributors, versions, reviews)
--   7. Media            (media)
--   8. Tool integration (tool_links)
--   9. Analytics        (events, metrics)
--  10. AI readiness     (embeddings — pgvector, optional)
--  11. Full-text search (generated tsvector + GIN)
--  12. RLS policies
-- ────────────────────────────────────────────────────────────────────────────

create extension if not exists pgcrypto;

-- ── 1. Enums ──────────────────────────────────────────────────────────────────

do $$ begin
  create type knowledge_status as enum ('draft', 'in_review', 'published', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type knowledge_difficulty as enum ('foundational', 'intermediate', 'advanced', 'expert');
exception when duplicate_object then null; end $$;

do $$ begin
  -- Typed, traversable relations for the cannabis knowledge graph.
  create type knowledge_relation_type as enum (
    'related',          -- generic association
    'parent',           -- hierarchical parent
    'child',            -- hierarchical child
    'prerequisite',     -- should be understood first
    'causes',           -- A is a cause of B (e.g. pH lockout -> Mg deficiency)
    'caused_by',        -- inverse of causes
    'symptom_of',       -- A is a symptom of B
    'treats',           -- A is a corrective action for B
    'interacts_with',   -- nutrient/environmental interaction
    'antagonist_of',    -- competitive antagonism (e.g. K vs Mg uptake)
    'synergist_of',     -- synergistic effect (e.g. Ca + Mg as CalMag)
    'measured_by',      -- A is quantified by tool/metric B
    'see_also'          -- editorial cross-reference
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type knowledge_media_kind as enum ('image', 'diagram', 'chart', 'video', 'document');
exception when duplicate_object then null; end $$;

do $$ begin
  create type knowledge_tool_kind as enum ('diagnosis', 'calculator', 'simulator', 'reference', 'external');
exception when duplicate_object then null; end $$;

do $$ begin
  create type knowledge_review_status as enum ('approved', 'changes_requested', 'rejected', 'pending');
exception when duplicate_object then null; end $$;

-- ── 2. Core content ───────────────────────────────────────────────────────────

create table if not exists public.knowledge_categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  description text,
  icon        text,
  parent_id   uuid references public.knowledge_categories(id) on delete set null,
  position    int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists knowledge_categories_parent_idx
  on public.knowledge_categories(parent_id);

create table if not exists public.knowledge_contributors (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete set null,
  display_name text not null,
  role        text not null default 'editor', -- editor | reviewer | agronomist | author
  bio         text,
  credentials text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.knowledge_articles (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  title           text not null,
  summary         text,
  -- Structured body. The professional article template (Definition, Scientific
  -- Background, Plant Physiology, Symptoms, …, FAQ, Expert Tips) is stored as an
  -- ordered list of typed blocks so rendering and AI chunking are deterministic.
  body            jsonb not null default '[]'::jsonb,
  category_id     uuid references public.knowledge_categories(id) on delete set null,
  difficulty      knowledge_difficulty not null default 'intermediate',
  status          knowledge_status not null default 'draft',
  read_minutes    int,
  -- Editorial / quality signals.
  quality_score   numeric(3,2),
  author_id       uuid references public.knowledge_contributors(id) on delete set null,
  -- SEO / programmatic schema fields (Article/Entity schema generation).
  seo_title       text,
  seo_description text,
  canonical_url   text,
  entity_type     text,            -- schema.org entity (e.g. "MedicalCondition", "Thing")
  meta            jsonb not null default '{}'::jsonb,
  language         text not null default 'de',
  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists knowledge_articles_category_idx on public.knowledge_articles(category_id);
create index if not exists knowledge_articles_status_idx on public.knowledge_articles(status);
create index if not exists knowledge_articles_published_idx on public.knowledge_articles(published_at desc);
create index if not exists knowledge_articles_language_idx on public.knowledge_articles(language);

create table if not exists public.knowledge_faqs (
  id          uuid primary key default gen_random_uuid(),
  article_id  uuid not null references public.knowledge_articles(id) on delete cascade,
  question    text not null,
  answer      text not null,
  position    int not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists knowledge_faqs_article_idx on public.knowledge_faqs(article_id, position);

-- ── 3. Taxonomy ───────────────────────────────────────────────────────────────

create table if not exists public.knowledge_tags (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  kind        text not null default 'topic', -- topic | nutrient | symptom | method | entity
  created_at  timestamptz not null default now()
);

create table if not exists public.knowledge_article_tags (
  article_id  uuid not null references public.knowledge_articles(id) on delete cascade,
  tag_id      uuid not null references public.knowledge_tags(id) on delete cascade,
  primary key (article_id, tag_id)
);

create index if not exists knowledge_article_tags_tag_idx on public.knowledge_article_tags(tag_id);

-- ── 4. Sources & references ───────────────────────────────────────────────────

create table if not exists public.knowledge_sources (
  id            uuid primary key default gen_random_uuid(),
  external_id   text unique,        -- stable id from the legacy source register
  title         text not null,
  publisher     text,
  authors       text,
  year          text,
  url           text,
  doi           text,
  source_type   text not null default 'manual', -- manual | auto
  evidence_level int,               -- 1..5 (5 = systematic review / meta-analysis)
  quality_score numeric(3,2),
  meta          jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Junction: which sources an article cites (with optional citation context).
create table if not exists public.knowledge_references (
  id          uuid primary key default gen_random_uuid(),
  article_id  uuid not null references public.knowledge_articles(id) on delete cascade,
  source_id   uuid not null references public.knowledge_sources(id) on delete cascade,
  context     text,
  position    int not null default 0,
  created_at  timestamptz not null default now(),
  unique (article_id, source_id)
);

create index if not exists knowledge_references_article_idx on public.knowledge_references(article_id);
create index if not exists knowledge_references_source_idx on public.knowledge_references(source_id);

-- ── 5. Knowledge graph ────────────────────────────────────────────────────────
-- Typed, weighted, directed relations between articles. Built for traversal by
-- future AI systems (RAG context expansion, diagnostics, recommendations).

create table if not exists public.knowledge_relations (
  id            uuid primary key default gen_random_uuid(),
  from_article  uuid not null references public.knowledge_articles(id) on delete cascade,
  to_article    uuid not null references public.knowledge_articles(id) on delete cascade,
  relation_type knowledge_relation_type not null default 'related',
  weight        numeric(4,3) not null default 1.0, -- traversal strength 0..1+
  note          text,
  created_at    timestamptz not null default now(),
  unique (from_article, to_article, relation_type),
  check (from_article <> to_article)
);

create index if not exists knowledge_relations_from_idx on public.knowledge_relations(from_article, relation_type);
create index if not exists knowledge_relations_to_idx on public.knowledge_relations(to_article, relation_type);

-- ── 6. Editorial: versions & reviews ──────────────────────────────────────────

create table if not exists public.knowledge_versions (
  id            uuid primary key default gen_random_uuid(),
  article_id    uuid not null references public.knowledge_articles(id) on delete cascade,
  version       int not null,
  title         text not null,
  summary       text,
  body          jsonb not null default '[]'::jsonb,
  change_note   text,
  editor_id     uuid references public.knowledge_contributors(id) on delete set null,
  created_at    timestamptz not null default now(),
  unique (article_id, version)
);

create index if not exists knowledge_versions_article_idx on public.knowledge_versions(article_id, version desc);

create table if not exists public.knowledge_reviews (
  id            uuid primary key default gen_random_uuid(),
  article_id    uuid not null references public.knowledge_articles(id) on delete cascade,
  version_id    uuid references public.knowledge_versions(id) on delete set null,
  reviewer_id   uuid references public.knowledge_contributors(id) on delete set null,
  status        knowledge_review_status not null default 'pending',
  comment       text,
  created_at    timestamptz not null default now()
);

create index if not exists knowledge_reviews_article_idx on public.knowledge_reviews(article_id);

-- ── 7. Media ──────────────────────────────────────────────────────────────────

create table if not exists public.knowledge_media (
  id          uuid primary key default gen_random_uuid(),
  article_id  uuid references public.knowledge_articles(id) on delete cascade,
  kind        knowledge_media_kind not null default 'image',
  url         text not null,
  alt         text,
  caption     text,
  credit      text,
  position    int not null default 0,
  meta        jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists knowledge_media_article_idx on public.knowledge_media(article_id, position);

-- ── 8. Tool integration ───────────────────────────────────────────────────────
-- Connects knowledge to product tools (diagnostics, calculators) so an article
-- like "Magnesium Deficiency" surfaces the deficiency diagnosis, nutrient
-- calculator, pH calculator and VPD calculator.

create table if not exists public.knowledge_tool_links (
  id          uuid primary key default gen_random_uuid(),
  article_id  uuid not null references public.knowledge_articles(id) on delete cascade,
  tool_kind   knowledge_tool_kind not null default 'calculator',
  tool_slug   text not null,           -- e.g. 'nutrient-calculator', 'vpd', 'deficiency-diagnosis'
  label       text not null,
  href        text not null,
  position    int not null default 0,
  created_at  timestamptz not null default now(),
  unique (article_id, tool_slug)
);

create index if not exists knowledge_tool_links_article_idx on public.knowledge_tool_links(article_id, position);

-- ── 9. Analytics ──────────────────────────────────────────────────────────────
-- Persisted event store feeding the future recommendation engine. Append-only.

create table if not exists public.knowledge_events (
  id            bigint generated always as identity primary key,
  user_id       uuid references auth.users(id) on delete set null,
  session_id    text,
  article_id    uuid references public.knowledge_articles(id) on delete set null,
  event_type    text not null,  -- view | scroll_depth | read_complete | link_click |
                                 -- search_query | diagnostic_launch | calculator_launch |
                                 -- graph_traverse
  value         numeric,        -- e.g. scroll depth %, dwell seconds
  query         text,           -- for search_query events
  target_slug   text,           -- link/tool/graph target
  meta          jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now()
);

create index if not exists knowledge_events_article_idx on public.knowledge_events(article_id, created_at desc);
create index if not exists knowledge_events_type_idx on public.knowledge_events(event_type, created_at desc);
create index if not exists knowledge_events_user_idx on public.knowledge_events(user_id, created_at desc);

-- Rolled-up per-article metrics (maintained by a scheduled job; cheap to read).
create table if not exists public.knowledge_metrics (
  article_id      uuid primary key references public.knowledge_articles(id) on delete cascade,
  views           bigint not null default 0,
  unique_views    bigint not null default 0,
  avg_scroll_depth numeric(5,2) not null default 0,
  completion_rate numeric(5,2) not null default 0,
  tool_launches   bigint not null default 0,
  graph_traversals bigint not null default 0,
  updated_at      timestamptz not null default now()
);

-- ── 10. AI readiness (pgvector, optional) ─────────────────────────────────────
-- Chunked embeddings for RAG / semantic search. The extension may be unavailable
-- in some environments, so creation is guarded; the table degrades gracefully to
-- a plain jsonb embedding store when pgvector is absent.

do $$
declare
  has_vector boolean;
begin
  create extension if not exists vector;
  has_vector := true;
exception when others then
  has_vector := false;
end $$;

do $$
declare
  has_vector boolean := exists (select 1 from pg_extension where extname = 'vector');
begin
  if has_vector then
    execute $ddl$
      create table if not exists public.knowledge_embeddings (
        id          uuid primary key default gen_random_uuid(),
        article_id  uuid not null references public.knowledge_articles(id) on delete cascade,
        chunk_index int not null default 0,
        content     text not null,
        embedding   vector(1536),
        meta        jsonb not null default '{}'::jsonb,
        created_at  timestamptz not null default now(),
        unique (article_id, chunk_index)
      )
    $ddl$;
    execute 'create index if not exists knowledge_embeddings_article_idx on public.knowledge_embeddings(article_id)';
  else
    create table if not exists public.knowledge_embeddings (
      id          uuid primary key default gen_random_uuid(),
      article_id  uuid not null references public.knowledge_articles(id) on delete cascade,
      chunk_index int not null default 0,
      content     text not null,
      embedding   jsonb,
      meta        jsonb not null default '{}'::jsonb,
      created_at  timestamptz not null default now(),
      unique (article_id, chunk_index)
    );
    create index if not exists knowledge_embeddings_article_idx on public.knowledge_embeddings(article_id);
  end if;
end $$;

-- ── 11. Full-text search ──────────────────────────────────────────────────────
-- Keyword search baseline (German config) ahead of vector search. Generated
-- column keeps the tsvector in sync automatically.

alter table public.knowledge_articles
  add column if not exists search_tsv tsvector
  generated always as (
    setweight(to_tsvector('german', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('german', coalesce(summary, '')), 'B')
  ) stored;

create index if not exists knowledge_articles_search_idx
  on public.knowledge_articles using gin(search_tsv);

-- ── 12. updated_at triggers ───────────────────────────────────────────────────
-- Reuses public.tg_set_updated_at() defined in the roles migration.

do $$
declare
  t text;
begin
  foreach t in array array[
    'knowledge_categories', 'knowledge_contributors', 'knowledge_articles',
    'knowledge_sources'
  ] loop
    execute format('drop trigger if exists trg_%1$s_updated_at on public.%1$s', t);
    execute format(
      'create trigger trg_%1$s_updated_at before update on public.%1$s ' ||
      'for each row execute function public.tg_set_updated_at()', t);
  end loop;
end $$;

-- ── 13. Row Level Security ────────────────────────────────────────────────────
-- Reader model: published knowledge is world-readable (anon + authenticated).
-- Writes are restricted to staff (PROVIDER / TEAM / ADMIN roles in user_roles).
-- Analytics events are insert-only for everyone; reads are staff-only.

create or replace function public.is_knowledge_staff()
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role in ('PROVIDER', 'TEAM', 'ADMIN')
  );
$$;

do $$
declare
  t text;
begin
  foreach t in array array[
    'knowledge_categories', 'knowledge_articles', 'knowledge_faqs',
    'knowledge_tags', 'knowledge_article_tags', 'knowledge_sources',
    'knowledge_references', 'knowledge_relations', 'knowledge_contributors',
    'knowledge_versions', 'knowledge_reviews', 'knowledge_media',
    'knowledge_tool_links', 'knowledge_events', 'knowledge_metrics',
    'knowledge_embeddings'
  ] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- Public read for published articles; staff can read everything.
drop policy if exists knowledge_articles_read on public.knowledge_articles;
create policy knowledge_articles_read on public.knowledge_articles
  for select
  using (status = 'published' or public.is_knowledge_staff());

drop policy if exists knowledge_articles_write on public.knowledge_articles;
create policy knowledge_articles_write on public.knowledge_articles
  for all to authenticated
  using (public.is_knowledge_staff())
  with check (public.is_knowledge_staff());

-- Public-readable reference tables (categories, tags, sources, faqs, media,
-- references, relations, tool links, contributors). Staff-only writes.
do $$
declare
  t text;
begin
  foreach t in array array[
    'knowledge_categories', 'knowledge_faqs', 'knowledge_tags',
    'knowledge_article_tags', 'knowledge_sources', 'knowledge_references',
    'knowledge_relations', 'knowledge_contributors', 'knowledge_media',
    'knowledge_tool_links'
  ] loop
    execute format('drop policy if exists %1$s_read on public.%1$s', t);
    execute format(
      'create policy %1$s_read on public.%1$s for select using (true)', t);
    execute format('drop policy if exists %1$s_write on public.%1$s', t);
    execute format(
      'create policy %1$s_write on public.%1$s for all to authenticated ' ||
      'using (public.is_knowledge_staff()) with check (public.is_knowledge_staff())', t);
  end loop;
end $$;

-- Editorial tables: staff-only read + write.
do $$
declare
  t text;
begin
  foreach t in array array[
    'knowledge_versions', 'knowledge_reviews', 'knowledge_metrics',
    'knowledge_embeddings'
  ] loop
    execute format('drop policy if exists %1$s_staff on public.%1$s', t);
    execute format(
      'create policy %1$s_staff on public.%1$s for all to authenticated ' ||
      'using (public.is_knowledge_staff()) with check (public.is_knowledge_staff())', t);
  end loop;
end $$;

-- Analytics: anyone (incl. anon) may append events; only staff may read.
drop policy if exists knowledge_events_insert on public.knowledge_events;
create policy knowledge_events_insert on public.knowledge_events
  for insert
  with check (true);

drop policy if exists knowledge_events_read on public.knowledge_events;
create policy knowledge_events_read on public.knowledge_events
  for select
  using (public.is_knowledge_staff());
