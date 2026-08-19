-- ────────────────────────────────────────────────────────────────────────────
-- Migration: Knowledge Activation (Phase 15)
--
-- Turns the Knowledge OS from a content system into a decision system. Every
-- article becomes actionable by surfacing the right tools, calculators and
-- diagnoses — ranked by relevance and driven entirely by data (no hardcoded
-- links in application code).
--
-- Design (see docs/KNOWLEDGE_ACTIVATION_MAP.md):
--   1. knowledge_tools        — a first-class registry of every actionable tool
--                               (diagnosis, calculator, simulator, reference).
--   2. knowledge_tool_tags    — tag-based linking between tools and the shared
--                               knowledge taxonomy. Articles already carry tags;
--                               tagging tools lets relevance be computed, not
--                               hardcoded.
--   3. knowledge_tool_links   — gains an optional tool_id FK so curated, explicit
--                               links reference the registry instead of pasting a
--                               raw href/label per article.
--   4. knowledge_recommend_tools(slug) — the recommendation engine RPC. Ranks
--                               registry tools for an article by fusing explicit
--                               curation, tag overlap and category affinity.
--
-- Idempotent and re-runnable. Companion rollback:
--   202606020015_knowledge_activation_rollback.sql
-- ────────────────────────────────────────────────────────────────────────────

-- ── 1. Tool registry ─────────────────────────────────────────────────────────
-- A single catalogue of every product tool the knowledge graph can point at.
-- Replaces ad-hoc, per-article href strings with a normalized entity that can be
-- tagged, ranked and reused across thousands of articles.

create table if not exists public.knowledge_tools (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  kind        knowledge_tool_kind not null default 'calculator',
  title       text not null,
  description text,
  href        text not null,
  category    text,                                   -- free-form grouping key
  icon        text,
  position    int not null default 0,
  is_active   boolean not null default true,
  meta        jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists knowledge_tools_kind_idx on public.knowledge_tools(kind);
create index if not exists knowledge_tools_active_idx on public.knowledge_tools(is_active, position);

-- ── 2. Tool ↔ taxonomy linking ───────────────────────────────────────────────
-- Tools share the same tag vocabulary as articles. The recommendation engine
-- joins an article's tags to tool tags to compute relevance, so relationships
-- live in data and can be curated without code changes.

create table if not exists public.knowledge_tool_tags (
  tool_id  uuid not null references public.knowledge_tools(id) on delete cascade,
  tag_id   uuid not null references public.knowledge_tags(id) on delete cascade,
  weight   numeric(4,3) not null default 1.0,        -- relevance strength 0..1+
  primary key (tool_id, tag_id)
);

create index if not exists knowledge_tool_tags_tag_idx on public.knowledge_tool_tags(tag_id);

-- ── 3. Curated links reference the registry ──────────────────────────────────
-- Existing per-article tool links keep working, but a curated link can now point
-- at a registry tool by id. When tool_id is set, the engine treats it as a
-- high-confidence, hand-picked relationship.

alter table public.knowledge_tool_links
  add column if not exists tool_id uuid references public.knowledge_tools(id) on delete cascade;

create index if not exists knowledge_tool_links_tool_idx on public.knowledge_tool_links(tool_id);

-- ── 4. updated_at trigger for the registry ───────────────────────────────────

drop trigger if exists trg_knowledge_tools_updated_at on public.knowledge_tools;
create trigger trg_knowledge_tools_updated_at
  before update on public.knowledge_tools
  for each row execute function public.tg_set_updated_at();

-- ── 5. Row Level Security ─────────────────────────────────────────────────────
-- Same model as the rest of the knowledge layer: world-readable reference data,
-- staff-only writes.

alter table public.knowledge_tools enable row level security;
alter table public.knowledge_tool_tags enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['knowledge_tools', 'knowledge_tool_tags'] loop
    execute format('drop policy if exists %1$s_read on public.%1$s', t);
    execute format(
      'create policy %1$s_read on public.%1$s for select using (true)', t);
    execute format('drop policy if exists %1$s_write on public.%1$s', t);
    execute format(
      'create policy %1$s_write on public.%1$s for all to authenticated ' ||
      'using (public.is_knowledge_staff()) with check (public.is_knowledge_staff())', t);
  end loop;
end $$;

-- ── 6. Recommendation engine ─────────────────────────────────────────────────
-- Given an article slug, rank the registry tools that help a grower act on it.
--
-- Relevance is a fusion of three database-driven signals (no hardcoded links):
--   • curated    — an explicit knowledge_tool_links row referencing the tool
--                  (strongest; a human said "this tool belongs here").
--   • tag_match  — overlap between the article's tags and the tool's tags,
--                  summed by tag weight (data-driven, scales to any article).
--   • category   — the tool's category equals the article's category slug
--                  (a gentle topical nudge).
--
-- The function is STABLE and read-only; it returns only active tools and is
-- safe to call from the public, cached read path.

create or replace function public.knowledge_recommend_tools(
  root_slug   text,
  match_count int default 12
)
returns table (
  tool_id     uuid,
  slug        text,
  kind        knowledge_tool_kind,
  title       text,
  description text,
  href        text,
  category    text,
  icon        text,
  score       numeric,
  reason      text
)
language sql
stable
as $$
  with article as (
    select a.id, a.category_id
    from public.knowledge_articles a
    where a.slug = root_slug
      and a.status = 'published'
    limit 1
  ),
  art_tags as (
    select t.tag_id
    from public.knowledge_article_tags t
    where t.article_id = (select id from article)
  ),
  -- Signal 1: hand-curated links that reference the registry.
  curated as (
    select tl.tool_id, 3.0::numeric as score, 'curated'::text as reason
    from public.knowledge_tool_links tl
    where tl.article_id = (select id from article)
      and tl.tool_id is not null
  ),
  -- Signal 2: tag overlap, summed by tag weight.
  tag_match as (
    select tt.tool_id,
           sum(tt.weight)::numeric as score,
           'tag_match'::text as reason
    from public.knowledge_tool_tags tt
    join art_tags atag on atag.tag_id = tt.tag_id
    group by tt.tool_id
  ),
  -- Signal 3: topical category affinity.
  cat_match as (
    select tl.id as tool_id, 0.5::numeric as score, 'category'::text as reason
    from public.knowledge_tools tl
    join public.knowledge_categories c on c.slug = tl.category
    where c.id = (select category_id from article)
  ),
  unioned as (
    select * from curated
    union all select * from tag_match
    union all select * from cat_match
  ),
  agg as (
    select u.tool_id,
           sum(u.score) as score,
           string_agg(distinct u.reason, ',' order by u.reason) as reason
    from unioned u
    group by u.tool_id
  )
  select
    tl.id, tl.slug, tl.kind, tl.title, tl.description, tl.href,
    tl.category, tl.icon,
    round(agg.score, 3) as score,
    agg.reason
  from agg
  join public.knowledge_tools tl
    on tl.id = agg.tool_id and tl.is_active
  order by score desc, tl.position asc, tl.title asc
  limit greatest(least(coalesce(match_count, 12), 50), 1);
$$;

-- ── 7. Seed: the tool registry ───────────────────────────────────────────────
-- Mirrors apps/web/src/lib/tools/registry.ts (calculators) and
-- apps/web/src/lib/diagnose/tree.ts (diagnosis categories). Idempotent.

insert into public.knowledge_tools (slug, kind, title, description, href, category, icon, position)
values
  -- Calculators / planners
  ('naehrstoff-rechner', 'calculator', 'Nährstoff-Rechner',
   'EC-Ziel und Dosierung für dein Substrat berechnen',
   '/tools/naehrstoff-rechner', 'naehrstoffe', '🧪', 10),
  ('vpd', 'calculator', 'VPD-Rechner',
   'Optimalen VPD-Wert für jede Wachstumsphase berechnen',
   '/tools/vpd', 'klima', '💨', 20),
  ('abluft-rechner', 'calculator', 'Abluft-Rechner',
   'Luftumwälzung und Lüftergröße berechnen',
   '/tools/abluft-rechner', 'klima', '🌡️', 30),
  ('licht-rechner', 'calculator', 'Licht-Rechner',
   'PPFD, DLI und Lichtintensität berechnen',
   '/tools/licht-rechner', 'licht', '💡', 40),
  ('ertrags-schaetzer', 'calculator', 'Ertrags-Schätzer',
   'Ertragsprognose basierend auf Setup und Erfahrung',
   '/tools/ertrags-schaetzer', 'planung', '📐', 50),
  ('plans', 'reference', 'Anbau-Pläne',
   'Strukturierte Anbau- und Düngepläne für deinen Grow',
   '/tools/plans', 'planung', '🗺️', 60),
  -- Diagnoses (interactive decision trees)
  ('diagnose-blaetter', 'diagnosis', 'Blatt-Diagnose',
   'Symptome an Blättern systematisch eingrenzen',
   '/diagnose?category=blaetter', 'naehrstoffe', '🍃', 70),
  ('diagnose-wachstum', 'diagnosis', 'Wachstums-Diagnose',
   'Wachstums- und Wurzelprobleme eingrenzen',
   '/diagnose?category=wachstum', 'planung', '🌱', 80),
  ('diagnose-klima', 'diagnosis', 'Klima-Diagnose',
   'Klima- und Umgebungsstress eingrenzen',
   '/diagnose?category=klima', 'klima', '🌡️', 90),
  ('diagnose-schaedlinge', 'diagnosis', 'Schädlings-Diagnose',
   'Schädlingsbefall identifizieren und behandeln',
   '/diagnose?category=schaedlinge', 'naehrstoffe', '🐛', 100)
on conflict (slug) do update set
  kind        = excluded.kind,
  title       = excluded.title,
  description = excluded.description,
  href        = excluded.href,
  category    = excluded.category,
  icon        = excluded.icon,
  position    = excluded.position,
  updated_at  = now();

-- ── 8. Seed: canonical tool tags ─────────────────────────────────────────────
-- Ensure the domain tags the registry maps onto exist, then attach them to
-- tools. Tags are part of the shared taxonomy, so any article carrying the same
-- tag is automatically matched by knowledge_recommend_tools. Curators extend
-- these mappings via the staff write policy — no code change required.

insert into public.knowledge_tags (slug, name, kind)
values
  ('naehrstoffe', 'Nährstoffe', 'topic'),
  ('naehrstoffmangel', 'Nährstoffmangel', 'symptom'),
  ('duengung', 'Düngung', 'method'),
  ('ph-wert', 'pH-Wert', 'topic'),
  ('klima', 'Klima', 'topic'),
  ('vpd', 'VPD', 'topic'),
  ('luftfeuchtigkeit', 'Luftfeuchtigkeit', 'topic'),
  ('temperatur', 'Temperatur', 'topic'),
  ('licht', 'Licht', 'topic'),
  ('ertrag', 'Ertrag', 'topic'),
  ('schaedlinge', 'Schädlinge', 'topic'),
  ('blaetter', 'Blätter', 'topic'),
  ('wachstum', 'Wachstum', 'topic'),
  ('wurzeln', 'Wurzeln', 'topic'),
  ('planung', 'Planung', 'topic')
on conflict (slug) do nothing;

-- Map tools → tags by slug (insert-select keeps it safe if a tag is missing).
insert into public.knowledge_tool_tags (tool_id, tag_id, weight)
select tl.id, tg.id, m.weight
from (values
  ('naehrstoff-rechner', 'naehrstoffe',      1.0),
  ('naehrstoff-rechner', 'naehrstoffmangel', 0.9),
  ('naehrstoff-rechner', 'duengung',         0.9),
  ('naehrstoff-rechner', 'ph-wert',          0.6),
  ('vpd',                'klima',            1.0),
  ('vpd',                'vpd',              1.0),
  ('vpd',                'luftfeuchtigkeit', 0.9),
  ('vpd',                'temperatur',       0.8),
  ('abluft-rechner',     'klima',            0.9),
  ('abluft-rechner',     'temperatur',       0.7),
  ('abluft-rechner',     'luftfeuchtigkeit', 0.7),
  ('licht-rechner',      'licht',            1.0),
  ('licht-rechner',      'ertrag',           0.6),
  ('ertrags-schaetzer',  'ertrag',           1.0),
  ('ertrags-schaetzer',  'planung',          0.8),
  ('plans',              'planung',          1.0),
  ('diagnose-blaetter',  'blaetter',         1.0),
  ('diagnose-blaetter',  'naehrstoffmangel', 0.9),
  ('diagnose-blaetter',  'naehrstoffe',      0.6),
  ('diagnose-wachstum',  'wachstum',         1.0),
  ('diagnose-wachstum',  'wurzeln',          0.9),
  ('diagnose-klima',     'klima',            1.0),
  ('diagnose-klima',     'temperatur',       0.7),
  ('diagnose-klima',     'luftfeuchtigkeit', 0.7),
  ('diagnose-schaedlinge', 'schaedlinge',    1.0)
) as m(tool_slug, tag_slug, weight)
join public.knowledge_tools tl on tl.slug = m.tool_slug
join public.knowledge_tags  tg on tg.slug = m.tag_slug
on conflict (tool_id, tag_id) do update set weight = excluded.weight;
