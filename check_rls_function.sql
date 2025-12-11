-- Check if auth_role function exists and works correctly
-- Run this in Supabase SQL Editor

-- 1. Check if function exists
SELECT routine_name, routine_definition
FROM information_schema.routines
WHERE routine_name = 'auth_role'
AND routine_schema = 'public';

-- 2. Test the function with your current user
SELECT
  auth.uid() as user_id,
  auth.email() as user_email,
  public.auth_role() as calculated_role,
  p.role as actual_role
FROM profiles p
WHERE p.id = auth.uid();

-- 3. If the function doesn't exist, create it:
CREATE OR REPLACE FUNCTION public.auth_role()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid()),
    'client'
  )::text;
$$;

-- 4. Grant execute permission
GRANT EXECUTE ON FUNCTION public.auth_role() TO authenticated;
