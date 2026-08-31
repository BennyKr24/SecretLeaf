-- Admin audit log — cross-cutting record of every write action performed
-- through the admin panel (see docs/ADMIN_PANEL_OVERHAUL_PLAN.md §2.4).
--
-- Answers: who (actor_id/email), what resource (resource + resource_id),
-- which action, and the field-level before/after. Bulk actions link child
-- rows to a parent row via parent_id.
--
-- Immutable by policy: INSERT only, no UPDATE/DELETE for anyone (service
-- role included at the policy level; a superuser migration can still purge).
-- All reads are admin-only and go through the service-role server client,
-- so there is no SELECT policy for `authenticated`.

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  actor_email text,
  resource text not null,
  resource_id text,
  action text not null,
  before jsonb,
  after jsonb,
  parent_id uuid references public.admin_audit_log(id) on delete set null,
  created_at timestamptz not null default now()
);

comment on table public.admin_audit_log is
  'Append-only audit trail of admin-panel write actions. INSERT only; never updated or deleted at runtime.';

create index if not exists admin_audit_log_created_at_idx
  on public.admin_audit_log (created_at desc);
create index if not exists admin_audit_log_resource_idx
  on public.admin_audit_log (resource, created_at desc);
create index if not exists admin_audit_log_actor_idx
  on public.admin_audit_log (actor_id, created_at desc);
create index if not exists admin_audit_log_parent_idx
  on public.admin_audit_log (parent_id);

alter table public.admin_audit_log enable row level security;

-- No policies for `authenticated` at all: reads and writes both happen via
-- the service-role server client, which bypasses RLS. These explicit
-- deny-by-omission + revoke lines make the intent unmistakable and stop a
-- future default-grant migration from silently opening the table.
revoke all on public.admin_audit_log from anon, authenticated;
