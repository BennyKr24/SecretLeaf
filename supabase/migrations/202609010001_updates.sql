-- Updates / Neuigkeiten — the user-facing changelog, moved out of
-- src/data/updates.json into a table so it can be edited from the admin
-- Neuigkeiten page without a git commit (decision §6.2). lib/updates.ts
-- reads from here (with the JSON as a build-time fallback), and the /status
-- page's "Neuigkeiten" block reads the published rows.
--
-- Public read is allowed (this is public content); writes are service-role
-- only via the admin route.

create table if not exists public.updates (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  version text,
  date date not null,
  title text not null,
  summary text not null,
  category text not null,
  featured boolean not null default false,
  published boolean not null default true,
  cta jsonb,
  sections jsonb not null default '{}'::jsonb,
  stats jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.updates is
  'User-facing changelog entries. Edited from /dashboard/admin/changelog; rendered on /updates and /status.';

create index if not exists updates_published_date_idx
  on public.updates (published, date desc);

drop trigger if exists trg_updates_updated_at on public.updates;
create trigger trg_updates_updated_at
before update on public.updates
for each row execute function public.tg_set_updated_at();

alter table public.updates enable row level security;

-- Public content: anyone may read a published row.
drop policy if exists updates_select_published on public.updates;
create policy updates_select_published
on public.updates
for select
to anon, authenticated
using (published = true);
