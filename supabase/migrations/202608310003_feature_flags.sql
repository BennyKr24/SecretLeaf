-- Feature flags — runtime on/off switches without a deploy
-- (docs/ADMIN_PANEL_OVERHAUL_PLAN.md §5). Read server-side via
-- lib/featureFlags.ts (30s cache); toggled from the Steuerung page.
-- Absence of a row = the code default in FEATURE_FLAG_DEFAULTS.
--
-- Service-role only.

create table if not exists public.feature_flags (
  key text primary key,
  enabled boolean not null default false,
  description text,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

comment on table public.feature_flags is
  'Runtime feature switches. Missing key falls back to the code default.';

drop trigger if exists trg_feature_flags_updated_at on public.feature_flags;
create trigger trg_feature_flags_updated_at
before update on public.feature_flags
for each row execute function public.tg_set_updated_at();

alter table public.feature_flags enable row level security;
revoke all on public.feature_flags from anon, authenticated;

insert into public.feature_flags (key, enabled, description) values
  ('ai_assistant',      true,  'Admin-KI-Assistent (billed Claude calls) freigeschaltet'),
  ('newsletter',        true,  'Newsletter-Anmeldung (Loops) aktiv'),
  ('translate_button',  true,  'Übersetzen-Button auf Inhalten sichtbar'),
  ('fertilizer_catalog', false, 'Dünger-Katalog öffentlich (aktuell offline, neu zu quellen)'),
  ('maintenance_mode',  false, 'Wartungsmodus — App für Nicht-Admins gesperrt (noch nicht verdrahtet)')
on conflict (key) do nothing;
