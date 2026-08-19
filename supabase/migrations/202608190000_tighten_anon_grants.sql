-- ────────────────────────────────────────────────────────────────────────────
-- Migration: Tighten anon grants to least privilege
-- ────────────────────────────────────────────────────────────────────────────
-- 202607290000_grant_default_privileges.sql gave `anon` a blanket GRANT ALL
-- on every table (present and future, via ALTER DEFAULT PRIVILEGES) so that
-- RLS alone is the only thing stopping an anonymous request from writing to
-- e.g. grows/plants/diagnoses. RLS currently does its job correctly (verified
-- live: an anon POST to /rest/v1/grows returns 42501 "new row violates row
-- level security policy"), but relying solely on RLS is fragile — a single
-- future policy mistake (a stray `with check (true)`, or a policy edited
-- directly in the dashboard outside migration history) would then be enough
-- to make private tables world-writable, because the grant would already
-- allow it.
--
-- This migration removes anon's default/blanket privileges and grants back
-- only what's actually meant to be public, matching the RLS policies already
-- in place: the world-readable knowledge base (SELECT) and knowledge_events
-- analytics (INSERT-only, per its own RLS comment "anyone incl. anon may
-- append events"). Every owner-scoped or staff-only table gets zero anon
-- privileges at the grant level, not just at the RLS level.
--
-- `authenticated` and `service_role` are untouched — their access already
-- goes through the correct owner/staff RLS policies.
-- ────────────────────────────────────────────────────────────────────────────

-- ── Reset baseline: anon starts with nothing ─────────────────────────────────
--
-- Scoped to tables/sequences only (not routines) — this migration is about
-- the "anon can write rows" surface reported by the user. Function EXECUTE
-- grants for anon (e.g. the not-yet-deployed knowledge_* RPCs used by public
-- search) are a separate concern and are left untouched here to avoid
-- guessing at behavior this migration wasn't scoped to verify.

revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;

-- Stop auto-granting anon full access on tables created by future migrations.
alter default privileges in schema public
  revoke all on tables from anon;
alter default privileges in schema public
  revoke all on sequences from anon;

-- ── Grant back only what's genuinely public ──────────────────────────────────
--
-- Guarded with to_regclass so this migration is safe to run regardless of
-- whether the knowledge_os tables have been deployed to this environment yet
-- (as of writing, they exist in migration history but not in every deployed
-- database — see 202606020013_knowledge_os.sql and friends).

do $$
declare
  t text;
begin
  -- World-readable knowledge base (RLS: "published knowledge is
  -- world-readable (anon + authenticated)" / "Public-readable reference
  -- tables").
  foreach t in array array[
    'knowledge_categories', 'knowledge_articles', 'knowledge_faqs',
    'knowledge_tags', 'knowledge_article_tags', 'knowledge_sources',
    'knowledge_references', 'knowledge_relations', 'knowledge_contributors',
    'knowledge_media', 'knowledge_tool_links', 'knowledge_tools',
    'knowledge_tool_tags'
  ] loop
    if to_regclass('public.' || t) is not null then
      execute format('grant select on public.%I to anon', t);
    end if;
  end loop;

  -- Analytics: insert-only, no read (RLS: "anyone incl. anon may append
  -- events; only staff may read").
  if to_regclass('public.knowledge_events') is not null then
    execute 'grant insert on public.knowledge_events to anon';
  end if;
end $$;
