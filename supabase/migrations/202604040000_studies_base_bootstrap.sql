-- ────────────────────────────────────────────────────────────────────────────
-- Migration: studies base table bootstrap
-- ────────────────────────────────────────────────────────────────────────────
-- public.studies was never CREATE TABLE'd in migration history — only ALTERed
-- by later migrations (202604050002, 202604100006). It exists in production
-- (created outside the migration path), so this is a no-op there. On a fresh
-- environment (local `supabase start`/`db reset`, CI) it previously failed at
-- 202604050001's `alter table public.studies enable row level security`
-- because the table did not exist yet. This file is dated before that
-- migration so it runs first.
--
-- Columns are reconstructed from the only source of truth available for the
-- base shape: the insert row built in apps/web/src/lib/engine/storage.ts
-- (StudyInsertRow — title, description, source, tags) plus id/created_at,
-- which later migrations and the study_feedback FK assume exist.
-- ────────────────────────────────────────────────────────────────────────────

create table if not exists public.studies (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  source      text,
  tags        text[] not null default '{}',
  created_at  timestamptz not null default now()
);
