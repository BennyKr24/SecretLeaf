-- ────────────────────────────────────────────────────────────────────────────
-- Migration: Grant standard Supabase role privileges on the public schema
-- ────────────────────────────────────────────────────────────────────────────
-- Every table migration in this project relies on RLS policies as the actual
-- access gate, but none of them GRANT table-level privileges to anon/
-- authenticated/service_role — that grant is expected to come from Supabase's
-- own project bootstrap. Discovered locally: a fresh `supabase start`/`db
-- reset` does NOT apply it, so anon/authenticated have no SELECT/INSERT/
-- UPDATE/DELETE on ANY public table (grows, log_entries, diagnoses, ...) —
-- only RLS-irrelevant privileges (DELETE/REFERENCES/TRIGGER/MAINTAIN) survive.
-- Every write from the browser client silently 403s with "permission denied
-- for table X" (Postgres 42501), which looks like an RLS failure but isn't.
--
-- This makes the standard Supabase grant explicit and idempotent so local
-- dev, CI, and any future fresh environment behave the same regardless of
-- what the platform bootstrap does or doesn't do.
-- ────────────────────────────────────────────────────────────────────────────

grant usage on schema public to anon, authenticated, service_role;

grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant all on all routines in schema public to anon, authenticated, service_role;

alter default privileges in schema public
  grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on routines to anon, authenticated, service_role;
