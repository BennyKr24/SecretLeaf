-- Admin users view + a `banned` flag on user_roles
-- (docs/ADMIN_PANEL_OVERHAUL_PLAN.md §4.4, decision §6.5).
--
-- The view joins auth.users with the app's role + subscription so the
-- Nutzer page can filter / sort / paginate / count *server-side* (fixes the
-- old bug where search only saw the current 25-row page). Read only via the
-- service-role server client — revoked from anon/authenticated.

alter table public.user_roles
  add column if not exists banned boolean not null default false;

comment on column public.user_roles.banned is
  'When true, getAuthenticatedUserWithRole() returns null — the user is locked out of every authenticated route.';

create or replace view public.admin_users_v as
select
  u.id,
  u.email,
  u.created_at,
  u.last_sign_in_at,
  (u.email_confirmed_at is not null) as email_confirmed,
  coalesce(u.raw_app_meta_data ->> 'provider', 'email') as provider,
  coalesce(r.role, 'CONSUMER') as role,
  coalesce(r.banned, false) as banned,
  coalesce(s.plan, 'free') as plan,
  s.status as sub_status,
  s.current_period_end,
  s.stripe_customer_id
from auth.users u
left join public.user_roles r on r.user_id = u.id
left join public.subscriptions s on s.user_id = u.id;

comment on view public.admin_users_v is
  'Admin-only: auth.users joined with role, ban flag and subscription. Service-role reads only.';

revoke all on public.admin_users_v from anon, authenticated;
