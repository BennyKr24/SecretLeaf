-- ────────────────────────────────────────────────────────────────────────────
-- Verification: diagnosis → recommendation → recommendation_events trigger
-- ────────────────────────────────────────────────────────────────────────────
-- Run this AFTER applying 202607280016_diagnosis_outcome_chain.sql, against a
-- local (`supabase start`) or staging instance — never against prod as a
-- first run. Everything happens inside BEGIN/ROLLBACK, so no rows are left
-- behind and it is safe to re-run.
--
-- Usage:
--   psql "$DATABASE_URL" -f scripts/verify-diagnosis-outcome-chain.sql
-- or paste the whole file into the Supabase SQL editor and run it once.
--
-- What it checks:
--   1. A fresh recommendation starts 'pending'.
--   2. Inserting a recommendation_events row with event_type='applied' flips
--      recommendations.status to 'applied' via trg_recommendation_events_apply
--      — without the test ever updating recommendations.status directly.
--   3. event_type='snoozed' does NOT change status (stays 'applied' from the
--      previous step, proving snoozed is a no-op on the cache).
--   4. The full FK chain (grow → diagnosis → recommendation → event) inserts
--      without constraint errors.
-- ────────────────────────────────────────────────────────────────────────────

begin;

do $$
declare
  v_user_id           uuid;
  v_grow_id           uuid;
  v_diagnosis_id      uuid;
  v_recommendation_id uuid;
  v_status_after_apply  text;
  v_status_after_snooze text;
begin
  -- Reuse an existing auth.users row if one exists, otherwise create a
  -- throwaway one. (Rolled back at the end either way.)
  select id into v_user_id from auth.users limit 1;
  if v_user_id is null then
    insert into auth.users (id) values (gen_random_uuid()) returning id into v_user_id;
  end if;

  insert into public.grows (user_id, name, start_date)
  values (v_user_id, 'verify-chain-test-grow', current_date)
  returning id into v_grow_id;

  insert into public.diagnoses (
    grow_id, user_id, category, result_key, confidence, title
  ) values (
    v_grow_id, v_user_id, 'deficiency', 'magnesium_mangel', 'high', 'Test diagnosis'
  )
  returning id into v_diagnosis_id;

  insert into public.recommendations (
    diagnosis_id, grow_id, user_id, source, steps
  ) values (
    v_diagnosis_id, v_grow_id, v_user_id, 'diagnosis', '["Test step"]'::jsonb
  )
  returning id into v_recommendation_id;

  -- ── Check 1: starts pending ──────────────────────────────────────────────
  select status into v_status_after_apply
    from public.recommendations where id = v_recommendation_id;
  if v_status_after_apply <> 'pending' then
    raise exception 'FAIL: expected initial status=pending, got %', v_status_after_apply;
  end if;

  -- ── Check 2: 'applied' event flips status via trigger ────────────────────
  insert into public.recommendation_events (recommendation_id, user_id, event_type)
  values (v_recommendation_id, v_user_id, 'applied');

  select status into v_status_after_apply
    from public.recommendations where id = v_recommendation_id;
  if v_status_after_apply <> 'applied' then
    raise exception 'FAIL: expected status=applied after event, got %', v_status_after_apply;
  end if;

  -- ── Check 3: 'snoozed' event does NOT change status ──────────────────────
  insert into public.recommendation_events (recommendation_id, user_id, event_type)
  values (v_recommendation_id, v_user_id, 'snoozed');

  select status into v_status_after_snooze
    from public.recommendations where id = v_recommendation_id;
  if v_status_after_snooze <> 'applied' then
    raise exception 'FAIL: snoozed event changed status to % (should stay applied)', v_status_after_snooze;
  end if;

  raise notice 'PASS: diagnosis -> recommendation -> recommendation_events chain and status trigger behave as designed';
end $$;

rollback;
