-- ────────────────────────────────────────────────────────────────────────────
-- Migration: Knowledge OS — Phase 14 Critical Remediation
--
-- Closes the five Critical findings from docs/KNOWLEDGE_OS_RED_TEAM_AUDIT.md
-- without adding product features or changing the UI:
--
--   GR-1  Graph traversal N+1   → in-database recursive CTE RPC
--   SR-1  No ANN vector index   → HNSW index + match RPC + chunk provenance
--   DB-1  Unbounded event store  → time-partitioning + rollup + retention
--   AI-1  Retrieval not operable → hybrid (FTS+vector) retrieval RPC
--   (supporting: SR-2 ranking, DB-3 body-in-FTS, DB-4 per-language FTS)
--
-- Idempotent and re-runnable. Companion rollback:
--   202606020014_knowledge_os_remediation_rollback.sql
-- ────────────────────────────────────────────────────────────────────────────

-- ============================================================================
-- Part A — Search quality substrate (DB-3, DB-4, SR-2) [supports SR-1 / AI-1]
-- ============================================================================
-- The audit found FTS indexed only title+summary, hardcoded to 'german'. The
-- article body (jsonb blocks) was never searchable. We add an immutable text
-- extractor over the typed body and a language-aware tsvector that includes it.

-- Immutable plain-text extraction from the typed block body. Concatenates the
-- `content` and `checklist` string arrays and `heading` of every block.
create or replace function public.knowledge_body_text(body jsonb)
returns text
language sql
immutable
as $$
  select coalesce(string_agg(
    concat_ws(' ',
      block->>'heading',
      (select string_agg(v, ' ') from jsonb_array_elements_text(coalesce(block->'content', '[]'::jsonb)) v),
      (select string_agg(v, ' ') from jsonb_array_elements_text(coalesce(block->'checklist', '[]'::jsonb)) v)
    ), ' '), '')
  from jsonb_array_elements(case when jsonb_typeof(body) = 'array' then body else '[]'::jsonb end) block;
$$;

-- Map a language code to a supported Postgres text-search configuration.
-- Immutable: enables use inside generated columns. Unknown languages fall back
-- to 'simple' (no stemming, but still tokenized + correct).
create or replace function public.knowledge_regconfig(lang text)
returns regconfig
language sql
immutable
as $$
  select case lower(coalesce(lang, ''))
    when 'de' then 'german'::regconfig
    when 'en' then 'english'::regconfig
    when 'es' then 'spanish'::regconfig
    when 'fr' then 'french'::regconfig
    when 'it' then 'italian'::regconfig
    when 'nl' then 'dutch'::regconfig
    when 'pt' then 'portuguese'::regconfig
    else 'simple'::regconfig
  end;
$$;

-- Replace the title+summary-only tsvector with a language-aware, body-inclusive
-- document vector. Title=A, summary=B, body=C (ranking-friendly weights).
drop index if exists public.knowledge_articles_search_idx;
alter table public.knowledge_articles drop column if exists search_tsv;
alter table public.knowledge_articles
  add column search_tsv tsvector
  generated always as (
    setweight(to_tsvector(public.knowledge_regconfig(language), coalesce(title, '')),   'A') ||
    setweight(to_tsvector(public.knowledge_regconfig(language), coalesce(summary, '')), 'B') ||
    setweight(to_tsvector(public.knowledge_regconfig(language), public.knowledge_body_text(body)), 'C')
  ) stored;

create index if not exists knowledge_articles_search_idx
  on public.knowledge_articles using gin(search_tsv);

-- Trigram index for typo-tolerant title autosuggest (SR-4, cheap to add here).
create extension if not exists pg_trgm;
create index if not exists knowledge_articles_title_trgm_idx
  on public.knowledge_articles using gin(title gin_trgm_ops);

-- ============================================================================
-- Part B — GR-1: in-database graph traversal (recursive CTE RPC)
-- ============================================================================
-- Replaces the application-layer BFS (one HTTP round-trip per node AND per
-- neighbor) with a single set-returning function. Bounded by depth, nodes and
-- per-node fan-out (weight-ordered top-K, closing GR-3); cycle-safe via a path
-- array (closing dedup/cycle concerns in GR-2); only published targets returned.

-- Index supporting index-driven, weight-ordered per-node expansion (GR-3).
create index if not exists knowledge_relations_from_weight_idx
  on public.knowledge_relations (from_article, weight desc);

create or replace function public.knowledge_graph_expand(
  root_slug      text,
  max_depth      int default 2,
  max_nodes      int default 50,
  per_node_limit int default 25
)
returns table (
  from_article   uuid,
  to_article     uuid,
  relation_type  knowledge_relation_type,
  weight         numeric,
  depth          int,
  to_slug        text,
  to_title       text,
  to_summary     text,
  to_category_id uuid,
  to_difficulty  knowledge_difficulty,
  to_status      knowledge_status,
  to_read_minutes int,
  to_language    text,
  to_published_at timestamptz,
  to_updated_at  timestamptz
)
language sql
stable
as $$
  with recursive walk as (
    -- Seed: strongest K outgoing edges of the root (index-driven LATERAL top-K;
    -- no global sort, so cost is independent of total graph size).
    select
      e.from_article, e.to_article, e.relation_type, e.weight,
      1 as depth,
      array[r.id, e.to_article] as path
    from public.knowledge_articles r
    cross join lateral (
      select rel.from_article, rel.to_article, rel.relation_type, rel.weight
      from public.knowledge_relations rel
      where rel.from_article = r.id
      order by rel.weight desc
      limit greatest(per_node_limit, 1)
    ) e
    where r.slug = root_slug

    union all

    -- Expand: strongest K edges of each frontier node, skipping visited (cycle
    -- prevention via the path array).
    select
      e.from_article, e.to_article, e.relation_type, e.weight,
      w.depth + 1,
      w.path || e.to_article
    from walk w
    cross join lateral (
      select rel.from_article, rel.to_article, rel.relation_type, rel.weight
      from public.knowledge_relations rel
      where rel.from_article = w.to_article
        and rel.to_article <> all (w.path)
      order by rel.weight desc
      limit greatest(per_node_limit, 1)
    ) e
    where w.depth < greatest(least(max_depth, 6), 1)
  ),
  -- Keep the shallowest path to each neighbor, dedup edges.
  best as (
    select distinct on (w.to_article)
      w.from_article, w.to_article, w.relation_type, w.weight, w.depth
    from walk w
    order by w.to_article, w.depth asc, w.weight desc
  )
  select
    b.from_article, b.to_article, b.relation_type, b.weight, b.depth,
    a.slug, a.title, a.summary, a.category_id, a.difficulty, a.status,
    a.read_minutes, a.language, a.published_at, a.updated_at
  from best b
  join public.knowledge_articles a
    on a.id = b.to_article and a.status = 'published'
  order by b.depth asc, b.weight desc
  limit greatest(least(max_nodes, 500), 1);
$$;

-- ============================================================================
-- Part C — SR-1: vector ANN index + chunk provenance + match RPC
-- ============================================================================
-- knowledge_embeddings.embedding is vector(1536) when pgvector is present, or a
-- jsonb fallback otherwise. The HNSW index and match RPC are created only when
-- the real vector type exists.

-- Chunk provenance (AI-2 support): makes re-embedding & model migration safe.
alter table public.knowledge_embeddings add column if not exists model text;
alter table public.knowledge_embeddings add column if not exists model_version text;
alter table public.knowledge_embeddings add column if not exists token_count int;
alter table public.knowledge_embeddings add column if not exists language text;
alter table public.knowledge_embeddings add column if not exists source_block int;

do $$
declare
  is_vector boolean;
begin
  select atttypid = 'public.vector'::regtype
    into is_vector
  from pg_attribute
  where attrelid = 'public.knowledge_embeddings'::regclass
    and attname = 'embedding'
    and not attisdropped;

  if coalesce(is_vector, false) then
    -- HNSW: high-recall ANN, no training step, good for incremental inserts.
    execute $ddl$
      create index if not exists knowledge_embeddings_hnsw_idx
        on public.knowledge_embeddings
        using hnsw (embedding vector_cosine_ops)
        with (m = 16, ef_construction = 64)
    $ddl$;

    -- Pure vector match RPC (cosine). Returns chunk + similarity, joined to the
    -- owning published article.
    execute $ddl$
      create or replace function public.knowledge_match_embeddings(
        query_embedding vector,
        match_count int default 10,
        min_similarity float default 0.0
      )
      returns table (
        article_id uuid,
        chunk_index int,
        content text,
        similarity float,
        slug text,
        title text
      )
      language sql
      stable
      as $fn$
        select e.article_id, e.chunk_index, e.content,
               1 - (e.embedding <=> query_embedding) as similarity,
               a.slug, a.title
        from public.knowledge_embeddings e
        join public.knowledge_articles a
          on a.id = e.article_id and a.status = 'published'
        where 1 - (e.embedding <=> query_embedding) >= min_similarity
        order by e.embedding <=> query_embedding
        limit greatest(least(match_count, 100), 1);
      $fn$
    $ddl$;
  end if;
end $$;

-- ============================================================================
-- Part D — AI-1: hybrid retrieval (FTS ⊕ vector) via reciprocal rank fusion
-- ============================================================================
-- One RPC the AI assistant can call per turn. Ranks by FTS (ts_rank_cd over the
-- body-inclusive, language-aware tsvector) fused with vector cosine using RRF.
-- query_embedding is optional: when null, degrades to ranked FTS (always works).

do $$
declare
  is_vector boolean;
begin
  select atttypid = 'public.vector'::regtype into is_vector
  from pg_attribute
  where attrelid = 'public.knowledge_embeddings'::regclass
    and attname = 'embedding' and not attisdropped;

  if coalesce(is_vector, false) then
    execute 'drop function if exists public.knowledge_hybrid_search(text, vector, int, text, int)';
    execute 'drop function if exists public.knowledge_hybrid_search(text, int, text)';
    execute $ddl$
      create or replace function public.knowledge_hybrid_search(
        query_text text,
        query_embedding vector default null,
        match_count int default 10,
        lang text default 'de',
        rrf_k int default 60
      )
      returns table (
        article_id uuid,
        slug text,
        title text,
        summary text,
        category_id uuid,
        difficulty knowledge_difficulty,
        status knowledge_status,
        read_minutes int,
        quality_score numeric,
        language text,
        published_at timestamptz,
        updated_at timestamptz,
        score float,
        fts_rank float,
        vec_similarity float
      )
      language sql
      stable
      as $fn$
        with fts as (
          select a.id,
                 ts_rank_cd(a.search_tsv,
                            websearch_to_tsquery(public.knowledge_regconfig(lang), query_text)) as rank,
                 row_number() over (
                   order by ts_rank_cd(a.search_tsv,
                            websearch_to_tsquery(public.knowledge_regconfig(lang), query_text)) desc
                 ) as rn
          from public.knowledge_articles a
          where a.status = 'published'
            and (query_text is null or query_text = ''
                 or a.search_tsv @@ websearch_to_tsquery(public.knowledge_regconfig(lang), query_text))
          limit greatest(match_count * 5, 50)
        ),
        vec as (
          select nn.id,
                 max(nn.sim) as sim,
                 row_number() over (order by min(nn.dist) asc) as rn
          from (
            -- ANN-first: HNSW index returns nearest chunks, THEN aggregate.
            select e.article_id as id,
                   1 - (e.embedding <=> query_embedding) as sim,
                   e.embedding <=> query_embedding as dist
            from public.knowledge_embeddings e
            where query_embedding is not null
            order by e.embedding <=> query_embedding
            limit greatest(match_count * 10, 100)
          ) nn
          join public.knowledge_articles a
            on a.id = nn.id and a.status = 'published'
          group by nn.id
          limit greatest(match_count * 5, 50)
        ),
        fused as (
          select coalesce(f.id, v.id) as id,
                 coalesce(1.0 / (rrf_k + f.rn), 0) + coalesce(1.0 / (rrf_k + v.rn), 0) as score,
                 coalesce(f.rank, 0) as fts_rank,
                 coalesce(v.sim, 0)  as vec_similarity
          from fts f
          full outer join vec v on v.id = f.id
        )
        select fused.id, a.slug, a.title, a.summary, a.category_id, a.difficulty,
               a.status, a.read_minutes, a.quality_score, a.language,
               a.published_at, a.updated_at,
               fused.score, fused.fts_rank, fused.vec_similarity
        from fused
        join public.knowledge_articles a on a.id = fused.id
        order by fused.score desc
        limit greatest(least(match_count, 100), 1);
      $fn$
    $ddl$;
  else
    -- No pgvector: FTS-only ranked search (still closes SR-2 ranking).
    execute 'drop function if exists public.knowledge_hybrid_search(text, vector, int, text, int)';
    execute 'drop function if exists public.knowledge_hybrid_search(text, int, text)';
    execute $ddl$
      create or replace function public.knowledge_hybrid_search(
        query_text text,
        match_count int default 10,
        lang text default 'de'
      )
      returns table (
        article_id uuid, slug text, title text, summary text,
        category_id uuid, difficulty knowledge_difficulty, status knowledge_status,
        read_minutes int, quality_score numeric, language text,
        published_at timestamptz, updated_at timestamptz, score float
      )
      language sql
      stable
      as $fn$
        select a.id, a.slug, a.title, a.summary, a.category_id, a.difficulty,
               a.status, a.read_minutes, a.quality_score, a.language,
               a.published_at, a.updated_at,
               ts_rank_cd(a.search_tsv,
                          websearch_to_tsquery(public.knowledge_regconfig(lang), query_text))::float as score
        from public.knowledge_articles a
        where a.status = 'published'
          and a.search_tsv @@ websearch_to_tsquery(public.knowledge_regconfig(lang), query_text)
        order by score desc
        limit greatest(least(match_count, 100), 1);
      $fn$
    $ddl$;
  end if;
end $$;

-- ============================================================================
-- Part E — DB-1: partition knowledge_events + rollups + retention
-- ============================================================================
-- Converts the unbounded, triple-indexed event heap into a monthly
-- range-partitioned table. Retention becomes O(1) partition DROP; aggregation
-- reads pre-rolled metrics instead of scanning raw events.

-- Helper: ensure a monthly partition exists for a given timestamp.
create or replace function public.knowledge_events_ensure_partition(at_ts timestamptz)
returns void
language plpgsql
as $$
declare
  start_ts date := date_trunc('month', at_ts)::date;
  end_ts   date := (date_trunc('month', at_ts) + interval '1 month')::date;
  part     text := format('knowledge_events_%s', to_char(start_ts, 'YYYYMM'));
begin
  if to_regclass(format('public.%I', part)) is null then
    execute format(
      'create table public.%I partition of public.knowledge_events for values from (%L) to (%L)',
      part, start_ts, end_ts);
    execute format('create index if not exists %I on public.%I (article_id, created_at desc)',
      part || '_article_idx', part);
    execute format('create index if not exists %I on public.%I (event_type, created_at desc)',
      part || '_type_idx', part);
  end if;
end $$;

do $$
declare
  already_partitioned boolean;
  m date;
begin
  -- Skip if already converted (idempotency).
  select c.relkind = 'p' into already_partitioned
  from pg_class c where c.oid = 'public.knowledge_events'::regclass;

  if coalesce(already_partitioned, false) then
    return;
  end if;

  -- 1. Stand up the partitioned parent (same shape; PK must include part key).
  execute $ddl$
    create table public.knowledge_events_part (
      id          bigint generated always as identity,
      user_id     uuid references auth.users(id) on delete set null,
      session_id  text,
      article_id  uuid references public.knowledge_articles(id) on delete set null,
      event_type  text not null,
      value       numeric,
      query       text,
      target_slug text,
      meta        jsonb not null default '{}'::jsonb,
      created_at  timestamptz not null default now(),
      primary key (id, created_at)
    ) partition by range (created_at)
  $ddl$;

  -- 2. Create monthly partitions covering existing data ±, plus a default
  --    catch-all so inserts never fail on an unprovisioned month.
  execute 'create table public.knowledge_events_default partition of public.knowledge_events_part default';

  for m in
    select generate_series(
      coalesce((select date_trunc('month', min(created_at)) from public.knowledge_events), date_trunc('month', now())),
      date_trunc('month', now()) + interval '2 month',
      interval '1 month')::date
  loop
    perform 1;  -- placeholder; partitions created below against the parent
    execute format(
      'create table if not exists public.%I partition of public.knowledge_events_part for values from (%L) to (%L)',
      'knowledge_events_' || to_char(m, 'YYYYMM'),
      m,
      (m + interval '1 month')::date);
  end loop;

  -- 3. Copy existing rows.
  execute 'insert into public.knowledge_events_part
             (user_id, session_id, article_id, event_type, value, query, target_slug, meta, created_at)
           select user_id, session_id, article_id, event_type, value, query, target_slug, meta, created_at
           from public.knowledge_events';

  -- 4. Swap names.
  execute 'drop table public.knowledge_events';
  execute 'alter table public.knowledge_events_part rename to knowledge_events';

  -- 5. Per-partition indexes on the default partition.
  execute 'create index if not exists knowledge_events_default_article_idx on public.knowledge_events_default (article_id, created_at desc)';
  execute 'create index if not exists knowledge_events_default_type_idx on public.knowledge_events_default (event_type, created_at desc)';

  -- 6. Restore RLS (insert-for-all, staff read) on the new parent.
  execute 'alter table public.knowledge_events enable row level security';
  execute 'drop policy if exists knowledge_events_insert on public.knowledge_events';
  execute 'create policy knowledge_events_insert on public.knowledge_events for insert with check (true)';
  execute 'drop policy if exists knowledge_events_read on public.knowledge_events';
  execute 'create policy knowledge_events_read on public.knowledge_events for select using (public.is_knowledge_staff())';
end $$;

-- Retention: detach+drop partitions older than the keep window (O(1) vs DELETE).
create or replace function public.knowledge_events_drop_old(keep_months int default 6)
returns int
language plpgsql
as $$
declare
  cutoff date := (date_trunc('month', now()) - make_interval(months => keep_months))::date;
  r record;
  dropped int := 0;
begin
  for r in
    select inhrelid::regclass::text as part
    from pg_inherits
    where inhparent = 'public.knowledge_events'::regclass
  loop
    if r.part ~ '_[0-9]{6}$'
       and to_date(right(r.part, 6), 'YYYYMM') < cutoff then
      execute format('drop table %s', r.part);
      dropped := dropped + 1;
    end if;
  end loop;
  return dropped;
end $$;

-- Incremental rollup into knowledge_metrics (read this, never raw events).
create or replace function public.knowledge_refresh_metrics(since interval default '30 days')
returns void
language sql
as $$
  insert into public.knowledge_metrics as m
    (article_id, views, unique_views, avg_scroll_depth, completion_rate,
     tool_launches, graph_traversals, updated_at)
  select e.article_id,
         count(*) filter (where e.event_type = 'view'),
         count(distinct e.session_id) filter (where e.event_type = 'view'),
         coalesce(avg(e.value) filter (where e.event_type = 'scroll_depth'), 0),
         coalesce(
           100.0 * count(*) filter (where e.event_type = 'read_complete')
           / nullif(count(*) filter (where e.event_type = 'view'), 0), 0),
         count(*) filter (where e.event_type in ('calculator_launch', 'diagnostic_launch')),
         count(*) filter (where e.event_type = 'graph_traverse'),
         now()
  from public.knowledge_events e
  where e.article_id is not null
    and e.created_at >= now() - since
  group by e.article_id
  on conflict (article_id) do update set
    views            = excluded.views,
    unique_views     = excluded.unique_views,
    avg_scroll_depth = excluded.avg_scroll_depth,
    completion_rate  = excluded.completion_rate,
    tool_launches    = excluded.tool_launches,
    graph_traversals = excluded.graph_traversals,
    updated_at       = now();
$$;

-- Pre-aggregated "popular" surface for fast reads (refresh on a schedule).
create materialized view if not exists public.knowledge_popular as
  select e.article_id,
         count(*) filter (where e.event_type = 'view') as views_7d,
         max(e.created_at) as last_event_at
  from public.knowledge_events e
  where e.created_at >= now() - interval '7 days'
    and e.article_id is not null
  group by e.article_id
  with no data;

create unique index if not exists knowledge_popular_article_idx
  on public.knowledge_popular (article_id);

-- ============================================================================
-- Part F — Optional scheduling (pg_cron) — guarded; no-op if unavailable.
-- ============================================================================
do $$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_cron') then
    create extension if not exists pg_cron;
    -- Hourly metrics rollup; nightly retention + popular refresh + next-month part.
    perform cron.schedule('knowledge_metrics_rollup', '0 * * * *',
      $cron$ select public.knowledge_refresh_metrics(); $cron$);
    perform cron.schedule('knowledge_events_maintenance', '15 3 * * *',
      $cron$ select public.knowledge_events_ensure_partition(now() + interval '1 month');
             select public.knowledge_events_drop_old(6);
             refresh materialized view concurrently public.knowledge_popular; $cron$);
  end if;
exception when others then
  raise notice 'pg_cron scheduling skipped: %', sqlerrm;
end $$;
