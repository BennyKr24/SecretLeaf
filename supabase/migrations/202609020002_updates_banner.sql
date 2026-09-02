-- Site-Banner — shares its data model with the Neuigkeiten editor, as
-- planned (docs/ADMIN_PANEL_OVERHAUL_PLAN.md §5 "Site-Banner": globaler
-- Hinweis-Banner mit Zeitfenster, ohne Deploy).
--
-- An `updates` row with `banner = true` is also shown as a site-wide banner
-- (title + summary) while `now()` falls inside [banner_starts_at,
-- banner_ends_at] — either bound may be null for an open-ended window.

alter table public.updates
  add column if not exists banner boolean not null default false;
alter table public.updates
  add column if not exists banner_starts_at timestamptz;
alter table public.updates
  add column if not exists banner_ends_at timestamptz;

comment on column public.updates.banner is
  'true = this entry also renders as the site-wide banner (subject to the time window below), not just the changelog.';
comment on column public.updates.banner_starts_at is
  'Banner hidden before this time. Null = show immediately (once published).';
comment on column public.updates.banner_ends_at is
  'Banner hidden after this time. Null = no end, stays until unset.';

create index if not exists updates_active_banner_idx
  on public.updates (date desc) where banner and published;
