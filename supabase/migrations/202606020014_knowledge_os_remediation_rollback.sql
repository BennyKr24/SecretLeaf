-- ────────────────────────────────────────────────────────────────────────────
-- Rollback: Knowledge OS — Phase 14 Critical Remediation
--
-- Reverts 202606020014_knowledge_os_remediation.sql. Data-preserving where it
-- matters: knowledge_events rows are copied back into a plain (unpartitioned)
-- table. Run only if the remediation must be backed out.
-- ────────────────────────────────────────────────────────────────────────────

-- ── Part F: unschedule cron jobs (guarded) ────────────────────────────────────
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule('knowledge_metrics_rollup');
    perform cron.unschedule('knowledge_events_maintenance');
  end if;
exception when others then
  raise notice 'pg_cron unschedule skipped: %', sqlerrm;
end $$;

-- ── Part E: collapse partitioned events back to a plain table ──────────────────
do $$
declare
  is_partitioned boolean;
begin
  select c.relkind = 'p' into is_partitioned
  from pg_class c where c.oid = 'public.knowledge_events'::regclass;

  if coalesce(is_partitioned, false) then
    execute $ddl$
      create table public.knowledge_events_flat (
        id          bigint generated always as identity primary key,
        user_id     uuid references auth.users(id) on delete set null,
        session_id  text,
        article_id  uuid references public.knowledge_articles(id) on delete set null,
        event_type  text not null,
        value       numeric,
        query       text,
        target_slug text,
        meta        jsonb not null default '{}'::jsonb,
        created_at  timestamptz not null default now()
      )
    $ddl$;

    execute 'insert into public.knowledge_events_flat
               (user_id, session_id, article_id, event_type, value, query, target_slug, meta, created_at)
             select user_id, session_id, article_id, event_type, value, query, target_slug, meta, created_at
             from public.knowledge_events';

    execute 'drop table public.knowledge_events cascade';
    execute 'alter table public.knowledge_events_flat rename to knowledge_events';

    execute 'create index if not exists knowledge_events_article_idx on public.knowledge_events(article_id, created_at desc)';
    execute 'create index if not exists knowledge_events_type_idx on public.knowledge_events(event_type, created_at desc)';
    execute 'create index if not exists knowledge_events_user_idx on public.knowledge_events(user_id, created_at desc)';

    execute 'alter table public.knowledge_events enable row level security';
    execute 'drop policy if exists knowledge_events_insert on public.knowledge_events';
    execute 'create policy knowledge_events_insert on public.knowledge_events for insert with check (true)';
    execute 'drop policy if exists knowledge_events_read on public.knowledge_events';
    execute 'create policy knowledge_events_read on public.knowledge_events for select using (public.is_knowledge_staff())';
  end if;
end $$;

drop materialized view if exists public.knowledge_popular;
drop function if exists public.knowledge_refresh_metrics(interval);
drop function if exists public.knowledge_events_drop_old(int);
drop function if exists public.knowledge_events_ensure_partition(timestamptz);

-- ── Part D / C: retrieval RPCs + vector index + chunk provenance ───────────────
drop function if exists public.knowledge_hybrid_search(text, vector, int, text, int);
drop function if exists public.knowledge_hybrid_search(text, int, text);
drop function if exists public.knowledge_match_embeddings(vector, int, float);
drop index if exists public.knowledge_embeddings_hnsw_idx;

alter table public.knowledge_embeddings drop column if exists model;
alter table public.knowledge_embeddings drop column if exists model_version;
alter table public.knowledge_embeddings drop column if exists token_count;
alter table public.knowledge_embeddings drop column if exists language;
alter table public.knowledge_embeddings drop column if exists source_block;

-- ── Part B: graph traversal RPC ───────────────────────────────────────────────
drop function if exists public.knowledge_graph_expand(text, int, int, int);
drop index if exists public.knowledge_relations_from_weight_idx;

-- ── Part A: restore original title+summary-only German tsvector ────────────────
drop index if exists public.knowledge_articles_title_trgm_idx;
drop index if exists public.knowledge_articles_search_idx;
alter table public.knowledge_articles drop column if exists search_tsv;
alter table public.knowledge_articles
  add column search_tsv tsvector
  generated always as (
    setweight(to_tsvector('german', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('german', coalesce(summary, '')), 'B')
  ) stored;
create index if not exists knowledge_articles_search_idx
  on public.knowledge_articles using gin(search_tsv);

drop function if exists public.knowledge_regconfig(text);
drop function if exists public.knowledge_body_text(jsonb);
