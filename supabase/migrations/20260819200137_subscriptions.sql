-- Subscriptions table (DATABASE.md §12: Subscription Model).
--
-- Plan values are lowercase ('free' | 'pro' | 'team') to match the existing
-- UserPlan TS type used throughout apps/web (SessionUser.plan, effectivePlan())
-- rather than the uppercase FREE/PRO/TEAM shown in DATABASE.md's prose spec —
-- this avoids a translation layer between DB and app. DATABASE.md updated to
-- match.
--
-- stripe_customer_id / stripe_subscription_id go beyond the doc's four
-- "Pflichtfelder" but are required to reconcile Stripe webhook events back
-- to the right row without a separate lookup table.

create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'pro', 'team')),
  status text not null default 'active' check (status in (
    'active', 'trialing', 'past_due', 'canceled', 'unpaid', 'incomplete', 'incomplete_expired'
  )),
  current_period_end timestamptz,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.subscriptions is
  'One row per user. Absence of a row (or plan=''free'') means free tier — rows are only created on first checkout.';

-- Reuses the existing shared trigger function from 202604050001_roles_and_rls.sql
drop trigger if exists trg_subscriptions_updated_at on public.subscriptions;
create trigger trg_subscriptions_updated_at
before update on public.subscriptions
for each row execute function public.tg_set_updated_at();

alter table public.subscriptions enable row level security;

-- Users can read their own subscription. All writes go through the
-- service-role client in the Stripe webhook handler, never client-side.
create policy subscriptions_select_own
on public.subscriptions
for select
to authenticated
using (auth.uid() = user_id);
