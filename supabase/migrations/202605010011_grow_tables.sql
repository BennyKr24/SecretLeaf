-- ────────────────────────────────────────────────────────────────────────────
-- Migration: Grow tables (grows, plants, log_entries) + RLS
-- ────────────────────────────────────────────────────────────────────────────

-- ── grows ─────────────────────────────────────────────────────────────────────

create table if not exists public.grows (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  name            text not null,
  umgebung        text not null default 'indoor',
  medium          text not null default 'erde',
  licht_typ       text not null default 'led',
  licht_leistung  int,
  erfahrung       text not null default 'einsteiger',
  pflanzen_anzahl int not null default 1,
  flaeche         numeric,
  start_date      date not null,
  current_phase_id text not null default 'keimung',
  status          text not null default 'aktiv',
  notes           text,
  plan            jsonb not null default '{}',
  harvest         jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.grows enable row level security;

create policy grows_owner on public.grows
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop trigger if exists trg_grows_updated_at on public.grows;
create trigger trg_grows_updated_at
  before update on public.grows
  for each row execute function public.tg_set_updated_at();

-- ── plants ────────────────────────────────────────────────────────────────────

create table if not exists public.plants (
  id         uuid primary key default gen_random_uuid(),
  grow_id    uuid not null references public.grows(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  notes      text,
  created_at timestamptz not null default now()
);

alter table public.plants enable row level security;

create policy plants_owner on public.plants
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── log_entries ───────────────────────────────────────────────────────────────

create table if not exists public.log_entries (
  id          uuid primary key default gen_random_uuid(),
  grow_id     uuid not null references public.grows(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  plant_id    uuid references public.plants(id) on delete set null,
  entry_type  text not null,
  data        jsonb not null,
  notes       text,
  logged_at   timestamptz not null default now(),
  created_at  timestamptz not null default now()
);

create index if not exists log_entries_grow_id_logged_at
  on public.log_entries(grow_id, logged_at desc);

alter table public.log_entries enable row level security;

create policy log_entries_owner on public.log_entries
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
