-- Admin assistant chat history — server-side persistence for the Claude
-- notes/drafts assistant (see docs/ADMIN_STUDIES_ASSISTANT_MIGRATION_PLAN.md §2).
--
-- Previously the history lived only in the browser's localStorage, which
-- contradicted the page's own "sichtbar auf allen Geräten" copy. One row per
-- prompt/reply pair, scoped to the admin who sent it.
--
-- Reads and writes go through the service-role server client from
-- /api/admin/assistant, so there are no policies for `authenticated` — same
-- pattern as admin_audit_log.

create table if not exists public.admin_assistant_messages (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references auth.users(id) on delete cascade,
  prompt text not null,
  reply text not null,
  created_at timestamptz not null default now()
);

comment on table public.admin_assistant_messages is
  'Per-admin history of the admin-panel Claude assistant (prompt + reply pairs).';

create index if not exists admin_assistant_messages_actor_created_idx
  on public.admin_assistant_messages (actor_id, created_at);

alter table public.admin_assistant_messages enable row level security;

-- No policies for `authenticated`: access is service-role only.
revoke all on public.admin_assistant_messages from anon, authenticated;
