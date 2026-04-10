-- ────────────────────────────────────────────────────────────────────────────
-- Migration: Admin Role
-- ────────────────────────────────────────────────────────────────────────────
-- Extends user_roles to support ADMIN role for the control panel.
-- ────────────────────────────────────────────────────────────────────────────

-- Relax the CHECK constraint to include ADMIN
ALTER TABLE public.user_roles
  DROP CONSTRAINT IF EXISTS user_roles_role_check;

ALTER TABLE public.user_roles
  ADD CONSTRAINT user_roles_role_check
  CHECK (role IN ('CONSUMER', 'PROVIDER', 'ADMIN'));
