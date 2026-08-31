-- Cost entries — monthly infrastructure/service costs, either entered by
-- hand or synced automatically (docs/ADMIN_PANEL_OVERHAUL_PLAN.md §3.3).
-- One row per (service, month, source). `auto` rows are written by the
-- planned cost-sync cron; `manual` rows come from the Finanzen page form.
--
-- Service-role only.

create table if not exists public.cost_entries (
  id uuid primary key default gen_random_uuid(),
  service text not null,
  period_month date not null,
  amount_cents integer not null,
  source text not null default 'manual' check (source in ('manual', 'auto')),
  note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (service, period_month, source)
);

comment on table public.cost_entries is
  'Monthly cost per service. period_month is the first day of the month it applies to.';

create index if not exists cost_entries_period_idx on public.cost_entries (period_month desc);

drop trigger if exists trg_cost_entries_updated_at on public.cost_entries;
create trigger trg_cost_entries_updated_at
before update on public.cost_entries
for each row execute function public.tg_set_updated_at();

alter table public.cost_entries enable row level security;
revoke all on public.cost_entries from anon, authenticated;
