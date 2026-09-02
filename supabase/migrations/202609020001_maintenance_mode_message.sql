-- maintenance_mode's `description` doubled as an internal admin note until
-- now ("noch nicht verdrahtet" — not yet wired). Now that proxy.ts reads it
-- as the visitor-facing banner text (docs/ADMIN_PANEL_OVERHAUL_PLAN.md §5
-- Wartungsmodus), replace the stale placeholder with real copy. Only touches
-- rows still holding the original seed text, so an admin who has already
-- customized the message via the Steuerung page keeps their own wording.

update public.feature_flags
set description = 'Wir sind gerade mit Wartungsarbeiten beschäftigt und bald wieder da.'
where key = 'maintenance_mode'
  and description = 'Wartungsmodus — App für Nicht-Admins gesperrt (noch nicht verdrahtet)';
