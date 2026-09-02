-- Stripe events — webhook idempotency + health (docs/ADMIN_PANEL_OVERHAUL_PLAN.md
-- §4.2 "Stripe-Health", table spec at §"Migrationen" `stripe_events`).
--
-- The webhook handler (api/billing/webhook) inserts a row with `processed =
-- false` before touching `subscriptions`, and flips it to `true` once the
-- event type's handling completes. The primary key on `id` (Stripe's own
-- event id, globally unique) is the dedup guard: a redelivered event that
-- already succeeded is skipped; one that previously errored is retried
-- (row already exists but `processed` is still false).

create table if not exists public.stripe_events (
  id text primary key,                    -- Stripe event id, e.g. "evt_..."
  type text not null,
  payload jsonb not null,
  received_at timestamptz not null default now(),
  processed boolean not null default false,
  error text
);

comment on table public.stripe_events is
  'One row per Stripe webhook event (by Stripe event id). Dedup guard for '
  'redelivery + the source for the admin Finanzen "Stripe-Health" panel.';

create index if not exists stripe_events_received_at_idx
  on public.stripe_events (received_at desc);
create index if not exists stripe_events_unprocessed_idx
  on public.stripe_events (received_at desc) where not processed;

alter table public.stripe_events enable row level security;

-- No policies for `authenticated` at all: the webhook handler and the admin
-- Finanzen API both use the service-role client, which bypasses RLS. RLS
-- enabled + zero policies denies anon/authenticated entirely (mirrors
-- admin_audit_log / pro_codes).

revoke all on public.stripe_events from anon, authenticated;
grant all on public.stripe_events to service_role;
