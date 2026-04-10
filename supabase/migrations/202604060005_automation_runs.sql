-- Automation observability: persistent run history and health metrics

create table if not exists public.automation_job_runs (
  id uuid primary key default gen_random_uuid(),
  job_name text not null,
  started_at timestamptz not null,
  finished_at timestamptz not null,
  success boolean not null,
  fetched integer not null default 0,
  inserted integer not null default 0,
  updated integer not null default 0,
  skipped integer not null default 0,
  attempts integer not null default 1,
  source_generated_at timestamptz,
  error_details text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists automation_job_runs_job_name_finished_at_idx
  on public.automation_job_runs (job_name, finished_at desc);

create index if not exists automation_job_runs_success_finished_at_idx
  on public.automation_job_runs (success, finished_at desc);

alter table public.automation_job_runs enable row level security;

drop policy if exists automation_job_runs_select_authenticated on public.automation_job_runs;
create policy automation_job_runs_select_authenticated
on public.automation_job_runs
for select
to authenticated
using (true);
