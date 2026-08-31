-- AI usage ledger — one row per billed Claude API call, with a computed
-- cost estimate. Feeds the Finanzen module's automatic-cost tracking
-- (docs/ADMIN_PANEL_OVERHAUL_PLAN.md §3.3). Written fire-and-forget by
-- lib/admin/aiUsage.ts from every askClaude() call; a failed insert must
-- never fail the underlying request.
--
-- Service-role only: reads and writes go through the server client, so no
-- policies for anon/authenticated.

create table if not exists public.ai_usage (
  id uuid primary key default gen_random_uuid(),
  model text not null,
  feature text not null,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  cache_read_tokens integer not null default 0,
  cache_write_tokens integer not null default 0,
  cost_cents numeric(12, 4) not null default 0,
  actor_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

comment on table public.ai_usage is
  'One row per Claude API call. cost_cents is an estimate from lib/admin/pricing.ts, not a billed amount.';

create index if not exists ai_usage_created_at_idx on public.ai_usage (created_at desc);
create index if not exists ai_usage_feature_idx on public.ai_usage (feature, created_at desc);

alter table public.ai_usage enable row level security;
revoke all on public.ai_usage from anon, authenticated;
