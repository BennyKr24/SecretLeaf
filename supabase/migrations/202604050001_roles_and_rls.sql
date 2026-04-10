-- P0.1 + P0.2: Server-authoritative roles + RLS baseline

create extension if not exists pgcrypto;

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'CONSUMER' check (role in ('CONSUMER', 'PROVIDER')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_user_roles_updated_at on public.user_roles;
create trigger trg_user_roles_updated_at
before update on public.user_roles
for each row execute function public.tg_set_updated_at();

alter table public.user_roles enable row level security;
alter table public.studies enable row level security;

-- users can read their own role mapping only
create policy user_roles_select_own
on public.user_roles
for select
to authenticated
using (auth.uid() = user_id);

-- users can create their own row as CONSUMER exactly once
create policy user_roles_insert_own_consumer
on public.user_roles
for insert
to authenticated
with check (
  auth.uid() = user_id
  and role = 'CONSUMER'
);

-- studies: any authenticated user can read + insert
create policy studies_select_authenticated
on public.studies
for select
to authenticated
using (true);

create policy studies_insert_authenticated
on public.studies
for insert
to authenticated
with check (true);

-- studies update restricted to provider role
create policy studies_update_provider_only
on public.studies
for update
to authenticated
using (
  exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role = 'PROVIDER'
  )
)
with check (
  exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role = 'PROVIDER'
  )
);
