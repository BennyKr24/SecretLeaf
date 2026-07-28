-- ────────────────────────────────────────────────────────────────────────────
-- Migration: Diagnosis → Recommendation → Action → Outcome chain
-- ────────────────────────────────────────────────────────────────────────────
-- Structures what was previously a free-text note in log_entries.data into a
-- linked chain, so recommendation efficacy becomes queryable over time instead
-- of living only as unstructured jsonb text.
--
-- Adds:
--   1. diagnoses               — the situation + decision (rule tree today, ai_vision later)
--   2. recommendations         — the action the system proposed
--   3. recommendation_events   — the action the user actually took
--   4. plant_health_snapshots  — automatic health-score time series (outcome signal input)
--   5. diagnosis_outcomes      — measured outcome, one row per measurement point
--   6. log_entries.diagnosis_id — backlink from the log note to its diagnosis
-- ────────────────────────────────────────────────────────────────────────────

-- ── 1. diagnoses ──────────────────────────────────────────────────────────────

create table if not exists public.diagnoses (
  id           uuid primary key default gen_random_uuid(),
  grow_id      uuid not null references public.grows(id) on delete cascade,
  plant_id     uuid references public.plants(id) on delete set null,
  user_id      uuid not null references auth.users(id) on delete cascade,
  log_entry_id uuid references public.log_entries(id) on delete set null,
  source       text not null default 'rule_tree' check (source in ('rule_tree', 'ai_vision')),
  category     text not null,
  result_key   text not null,
  confidence   text not null check (confidence in ('high', 'medium', 'low')),
  title        text not null,
  cause        text,
  reasoning    text,
  -- Set by the outcome job once this diagnosis reaches a terminal outcome
  -- measurement (see diagnosis_outcomes below). NULL = still open. Used to
  -- compute diagnosis_outcomes.concurrent_open_diagnoses for other diagnoses
  -- on the same grow.
  resolved_at  timestamptz,
  diagnosed_at timestamptz not null default now(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists diagnoses_grow_id on public.diagnoses(grow_id);
create index if not exists diagnoses_grow_open on public.diagnoses(grow_id, resolved_at);
create index if not exists diagnoses_result_key on public.diagnoses(result_key);

drop trigger if exists trg_diagnoses_updated_at on public.diagnoses;
create trigger trg_diagnoses_updated_at
  before update on public.diagnoses
  for each row execute function public.tg_set_updated_at();

alter table public.diagnoses enable row level security;

create policy diagnoses_owner on public.diagnoses
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── 2. recommendations ───────────────────────────────────────────────────────

create table if not exists public.recommendations (
  id            uuid primary key default gen_random_uuid(),
  diagnosis_id  uuid references public.diagnoses(id) on delete set null,
  grow_id       uuid not null references public.grows(id) on delete cascade,
  plant_id      uuid references public.plants(id) on delete set null,
  user_id       uuid not null references auth.users(id) on delete cascade,
  source        text not null check (source in ('diagnosis', 'phase_insight')),
  steps         jsonb not null default '[]',
  tool_links    jsonb not null default '[]',
  priority      smallint not null default 0,
  -- Denormalized cache — see trg_recommendation_events_apply below for the
  -- single write path for 'applied'/'dismissed'. Application code must never
  -- set those two values directly; only insert into recommendation_events.
  -- 'expired' is the one exception: the recommendation-expiry automation job
  -- may set it directly on stale 'pending' rows.
  status        text not null default 'pending'
                  check (status in ('pending', 'applied', 'dismissed', 'expired')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists recommendations_diagnosis_id on public.recommendations(diagnosis_id);
create index if not exists recommendations_grow_status on public.recommendations(grow_id, status);

drop trigger if exists trg_recommendations_updated_at on public.recommendations;
create trigger trg_recommendations_updated_at
  before update on public.recommendations
  for each row execute function public.tg_set_updated_at();

alter table public.recommendations enable row level security;

create policy recommendations_owner on public.recommendations
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── 3. recommendation_events ─────────────────────────────────────────────────
-- Append-only log of what the user actually did with a recommendation. This
-- is the single source of truth for "was it followed" — recommendations.status
-- is a read-optimized cache derived from this table by trigger, never the
-- other way around.

create table if not exists public.recommendation_events (
  id                uuid primary key default gen_random_uuid(),
  recommendation_id uuid not null references public.recommendations(id) on delete cascade,
  user_id           uuid not null references auth.users(id) on delete cascade,
  event_type        text not null check (event_type in ('applied', 'dismissed', 'snoozed')),
  log_entry_id      uuid references public.log_entries(id) on delete set null,
  occurred_at       timestamptz not null default now()
);

create index if not exists recommendation_events_recommendation_id
  on public.recommendation_events(recommendation_id);

alter table public.recommendation_events enable row level security;

create policy recommendation_events_owner on public.recommendation_events
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Keeps recommendations.status in sync. 'snoozed' intentionally does not
-- change status — it stays 'pending' until applied, dismissed, or expired.
create or replace function public.tg_apply_recommendation_event()
returns trigger
language plpgsql
as $$
begin
  if new.event_type in ('applied', 'dismissed') then
    update public.recommendations
       set status = new.event_type
     where id = new.recommendation_id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_recommendation_events_apply on public.recommendation_events;
create trigger trg_recommendation_events_apply
  after insert on public.recommendation_events
  for each row execute function public.tg_apply_recommendation_event();

-- ── 4. plant_health_snapshots ────────────────────────────────────────────────
-- Persists the health score computed client-side today (lib/grow/intelligence.ts)
-- so outcome deltas don't depend on user-provided check-ins. Written by a new
-- 'health-snapshot' automation job (same automation_job_runs telemetry pattern
-- as engine-health), not by the client directly.

create table if not exists public.plant_health_snapshots (
  id             uuid primary key default gen_random_uuid(),
  grow_id        uuid not null references public.grows(id) on delete cascade,
  plant_id       uuid references public.plants(id) on delete set null,
  user_id        uuid not null references auth.users(id) on delete cascade,
  computed_at    timestamptz not null default now(),
  health_score   smallint not null,
  score_breakdown jsonb not null default '{}',
  trigger_source text not null check (trigger_source in ('daily_cron', 'on_log_entry')),
  created_at     timestamptz not null default now()
);

create index if not exists plant_health_snapshots_grow_computed_at
  on public.plant_health_snapshots(grow_id, computed_at desc);

alter table public.plant_health_snapshots enable row level security;

create policy plant_health_snapshots_owner_select on public.plant_health_snapshots
  for select
  using (auth.uid() = user_id);

create policy plant_health_snapshots_service_write on public.plant_health_snapshots
  for all
  to service_role
  using (true)
  with check (true);

-- ── 5. diagnosis_outcomes ────────────────────────────────────────────────────
-- One row per measurement point (not one row per diagnosis) so the outcome is
-- a time series — e.g. a 3-day and a 7-day auto reading, plus an optional
-- user check-in — rather than a single status that hides how it evolved.
--
-- health_score_before is the most recent plant_health_snapshots reading at or
-- before diagnosed_at. Given grow cycles run for weeks, up to ~24h of staleness
-- from the daily cron is acceptable and not corrected for here.

create table if not exists public.diagnosis_outcomes (
  id                        uuid primary key default gen_random_uuid(),
  diagnosis_id              uuid not null references public.diagnoses(id) on delete cascade,
  recommendation_id         uuid references public.recommendations(id) on delete set null,
  user_id                   uuid not null references auth.users(id) on delete cascade,
  method                    text not null check (method in ('auto_health_score', 'user_checkin')),
  outcome_status            text not null
                              check (outcome_status in ('improved', 'worsened', 'unchanged', 'unknown')),
  health_score_before       smallint,
  health_score_after        smallint,
  score_delta               smallint,
  -- Count of other diagnoses on the same grow that were still open
  -- (diagnoses.resolved_at is null) at measured_at. Nonzero means this score
  -- delta cannot be cleanly attributed to this diagnosis/recommendation alone
  -- — filter on = 0 when selecting clean training data for the recommendation
  -- engine. Computed by the job that writes this row, not enforced by the DB.
  concurrent_open_diagnoses smallint not null default 0,
  user_note                 text,
  measured_at               timestamptz not null default now(),
  created_at                timestamptz not null default now()
);

create index if not exists diagnosis_outcomes_diagnosis_id on public.diagnosis_outcomes(diagnosis_id);

alter table public.diagnosis_outcomes enable row level security;

create policy diagnosis_outcomes_owner_select on public.diagnosis_outcomes
  for select
  using (auth.uid() = user_id);

create policy diagnosis_outcomes_owner_insert on public.diagnosis_outcomes
  for insert
  with check (auth.uid() = user_id and method = 'user_checkin');

create policy diagnosis_outcomes_service_write on public.diagnosis_outcomes
  for all
  to service_role
  using (true)
  with check (true);

-- ── 6. log_entries backlink ──────────────────────────────────────────────────

alter table public.log_entries
  add column if not exists diagnosis_id uuid references public.diagnoses(id) on delete set null;

create index if not exists log_entries_diagnosis_id on public.log_entries(diagnosis_id);
