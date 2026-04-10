-- P0 hardening: idempotent policies + explicit delete guard

alter table public.user_roles enable row level security;
alter table public.studies enable row level security;

-- Ensure policy changes are repeatable across environments.
drop policy if exists user_roles_select_own on public.user_roles;
drop policy if exists user_roles_insert_own_consumer on public.user_roles;
drop policy if exists studies_select_authenticated on public.studies;
drop policy if exists studies_insert_authenticated on public.studies;
drop policy if exists studies_update_provider_only on public.studies;
drop policy if exists studies_delete_provider_only on public.studies;

create policy user_roles_select_own
on public.user_roles
for select
to authenticated
using (auth.uid() = user_id);

create policy user_roles_insert_own_consumer
on public.user_roles
for insert
to authenticated
with check (
  auth.uid() = user_id
  and role = 'CONSUMER'
);

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

create policy studies_delete_provider_only
on public.studies
for delete
to authenticated
using (
  exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role = 'PROVIDER'
  )
);
