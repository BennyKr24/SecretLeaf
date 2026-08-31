-- Decision log — the "worauf bin ich blockiert / was wurde wann entschieden"
-- tracker for a solo-run company (docs/ADMIN_PANEL_OVERHAUL_PLAN.md §5).
-- Lightweight: a title, a status, free-text context + decision.
--
-- Service-role only.

create table if not exists public.decision_log (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  status text not null default 'open' check (status in ('open', 'decided', 'dropped')),
  context text,
  decision text,
  decided_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists decision_log_status_idx on public.decision_log (status, created_at desc);

drop trigger if exists trg_decision_log_updated_at on public.decision_log;
create trigger trg_decision_log_updated_at
before update on public.decision_log
for each row execute function public.tg_set_updated_at();

alter table public.decision_log enable row level security;
revoke all on public.decision_log from anon, authenticated;
