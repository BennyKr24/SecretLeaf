-- Persistent error memory for automation jobs.
-- Stores repeated per-item failures and a next retry timestamp
-- so cron jobs can skip known failing items temporarily.

create table if not exists public.automation_error_memory (
  id uuid primary key default gen_random_uuid(),
  job_name text not null,
  fingerprint text not null,
  fail_count integer not null default 1,
  last_error text,
  metadata jsonb not null default '{}'::jsonb,
  first_failed_at timestamptz not null default now(),
  last_failed_at timestamptz not null default now(),
  next_retry_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (job_name, fingerprint)
);

create index if not exists automation_error_memory_job_retry_idx
  on public.automation_error_memory (job_name, next_retry_at asc);

create index if not exists automation_error_memory_job_fail_count_idx
  on public.automation_error_memory (job_name, fail_count desc);

alter table public.automation_error_memory enable row level security;

drop policy if exists automation_error_memory_service_role_all on public.automation_error_memory;
create policy automation_error_memory_service_role_all
on public.automation_error_memory
for all
to service_role
using (true)
with check (true);

drop policy if exists automation_error_memory_select_authenticated on public.automation_error_memory;
create policy automation_error_memory_select_authenticated
on public.automation_error_memory
for select
to authenticated
using (true);