-- ────────────────────────────────────────────────────────────────────────────
-- Migration: Pro self-serve trial + redeemable Pro codes
-- ────────────────────────────────────────────────────────────────────────────
-- Paid Pro (Stripe live mode) is deferred (see TODO.md "💳 Pro-Plan / Stripe").
-- Until then, entitlement is granted two non-Stripe ways:
--
--   1. A one-time 30-day self-serve trial (any logged-in user, no card).
--   2. Admin-generated codes redeemed for N days of Pro (targeted / longer
--      grants, e.g. testers, giveaways).
--
-- Both reuse the existing `subscriptions` row + `getUserPlan()` entitlement
-- check in apps/web/src/lib/serverAuth.ts. That check is being changed in the
-- same change-set to also require `current_period_end` to be in the future
-- for entitled statuses, so trials and code grants expire at read time with
-- NO cron — a Stripe `active` sub always carries a future period end, so paid
-- users are unaffected.
--
-- DATABASE.md §12 (Subscription Model) is updated to match.
-- ────────────────────────────────────────────────────────────────────────────

create extension if not exists pgcrypto;

-- ── subscriptions: distinguish grant source + block trial re-use ─────────────

alter table public.subscriptions
  add column if not exists source text not null default 'stripe'
    check (source in ('stripe', 'trial', 'code'));

comment on column public.subscriptions.source is
  'How this entitlement was granted: ''stripe'' (paid checkout), ''trial'' '
  '(one-time self-serve 30-day trial), ''code'' (redeemed a pro_codes entry).';

alter table public.subscriptions
  add column if not exists trial_redeemed_at timestamptz;

comment on column public.subscriptions.trial_redeemed_at is
  'Set the first time a user activates the self-serve trial. Its presence '
  '(not the row''s current status) is what blocks a second trial, so it '
  'survives the trial expiring or the user later paying/redeeming a code.';

-- ── pro_codes: admin-generated, redeemable for N days of Pro ─────────────────

create table if not exists public.pro_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,                         -- stored normalized (uppercase, no spaces)
  duration_days int not null check (duration_days between 1 and 3650),
  max_redemptions int not null default 1 check (max_redemptions >= 1),
  redemption_count int not null default 0 check (redemption_count >= 0),
  note text,                                         -- free-text admin memo ("Beta testers batch 1")
  expires_at timestamptz,                            -- code no longer redeemable after this; null = no window
  active boolean not null default true,              -- admin kill switch
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

comment on table public.pro_codes is
  'Admin-generated Pro access codes. Redeeming one (see pro_code_redemptions) '
  'extends the redeemer''s subscriptions.current_period_end by duration_days. '
  'Service-role only — the admin API (requireAdmin) is the sole writer/reader.';

-- ── pro_code_redemptions: one row per (code, user); the race guard ──────────

create table if not exists public.pro_code_redemptions (
  id uuid primary key default gen_random_uuid(),
  code_id uuid not null references public.pro_codes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  redeemed_at timestamptz not null default now(),
  unique (code_id, user_id)                          -- a user can't redeem the same code twice
);

comment on table public.pro_code_redemptions is
  'Ledger of code redemptions. The (code_id, user_id) unique constraint is '
  'also the concurrency guard: the redeem endpoint inserts here first and '
  'lets a duplicate-key error reject a double redemption.';

create index if not exists pro_code_redemptions_user_idx
  on public.pro_code_redemptions (user_id);

-- ── RLS ────────────────────────────────────────────────────────────────────

alter table public.pro_codes enable row level security;
alter table public.pro_code_redemptions enable row level security;

-- pro_codes: no client policy at all. All access is via the service-role
-- client behind requireAdmin(). (RLS enabled + zero policies = deny all for
-- anon/authenticated; service_role bypasses RLS.)

-- pro_code_redemptions: a user may read their own redemption history (used by
-- the pricing page to show "you already redeemed this code"). All writes go
-- through the service-role redeem endpoint.
drop policy if exists pro_code_redemptions_select_own on public.pro_code_redemptions;
create policy pro_code_redemptions_select_own
  on public.pro_code_redemptions
  for select
  to authenticated
  using (auth.uid() = user_id);

-- ── Grants: defense in depth, not just RLS (mirrors 202608190000) ───────────
--
-- 202607290000 blanket-grants `authenticated` ALL on every table incl. future
-- ones; 202608190000 established the pattern of revoking that back to exactly
-- what the RLS policies intend. Do the same here so a future stray policy
-- can't make these tables writable/readable at the grant level.

revoke all on public.pro_codes from anon, authenticated;
revoke all on public.pro_code_redemptions from anon, authenticated;

grant select on public.pro_code_redemptions to authenticated;

-- service_role keeps full access (untouched by the revokes above only if they
-- didn't name it — they don't).
grant all on public.pro_codes to service_role;
grant all on public.pro_code_redemptions to service_role;
