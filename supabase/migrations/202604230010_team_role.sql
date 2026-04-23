-- ────────────────────────────────────────────────────────────────────────────
-- Migration: Team Role + assign to gimber.l@web.de
-- ────────────────────────────────────────────────────────────────────────────
-- 1. Extend the CHECK constraint to include the TEAM role
-- 2. Upsert the user gimber.l@web.de with role = TEAM
-- ────────────────────────────────────────────────────────────────────────────

-- Step 1: Add TEAM to allowed roles
ALTER TABLE public.user_roles
  DROP CONSTRAINT IF EXISTS user_roles_role_check;

ALTER TABLE public.user_roles
  ADD CONSTRAINT user_roles_role_check
  CHECK (role IN ('CONSUMER', 'PROVIDER', 'ADMIN', 'TEAM'));

-- Step 2: Resolve the Supabase auth user id for gimber.l@web.de and upsert
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'gimber.l@web.de'
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email gimber.l@web.de not found in auth.users';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'TEAM')
  ON CONFLICT (user_id)
  DO UPDATE SET role = 'TEAM', updated_at = now();

  RAISE NOTICE 'Role TEAM assigned to user % (gimber.l@web.de)', v_user_id;
END;
$$;
