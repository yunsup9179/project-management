-- ============================================
-- FINAL FIX: Remove ALL RLS policies and recreate properly
-- Using SECURITY DEFINER function to avoid recursion
-- ============================================

-- Step 1: Drop ALL existing policies on profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Step 2: Drop ALL existing policies on projects
DROP POLICY IF EXISTS "Admins full access to projects" ON projects;
DROP POLICY IF EXISTS "Staff can view all projects" ON projects;
DROP POLICY IF EXISTS "Clients can view their projects" ON projects;
DROP POLICY IF EXISTS "Staff can create projects" ON projects;
DROP POLICY IF EXISTS "Staff can update own projects" ON projects;
DROP POLICY IF EXISTS "Staff can delete own projects" ON projects;

-- Step 3: Create a helper function that bypasses RLS
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS user_role
LANGUAGE plpgsql
SECURITY DEFINER  -- This runs with elevated privileges, bypassing RLS
SET search_path = public
AS $$
DECLARE
  user_role_result user_role;
BEGIN
  SELECT role INTO user_role_result FROM profiles WHERE id = user_id;
  RETURN user_role_result;
END;
$$;

-- Step 4: Recreate profiles policies using the helper function
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can update all profiles"
ON profiles FOR UPDATE
USING (get_user_role(auth.uid()) = 'admin');

-- Step 5: Recreate projects policies using the helper function
CREATE POLICY "Admins full access to projects"
ON projects FOR ALL
USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Staff can view all projects"
ON projects FOR SELECT
USING (get_user_role(auth.uid()) IN ('admin', 'staff'));

CREATE POLICY "Staff can create projects"
ON projects FOR INSERT
WITH CHECK (
  get_user_role(auth.uid()) IN ('admin', 'staff')
  AND owner_id = auth.uid()
);

CREATE POLICY "Staff can update own projects"
ON projects FOR UPDATE
USING (
  owner_id = auth.uid()
  AND get_user_role(auth.uid()) IN ('admin', 'staff')
);

CREATE POLICY "Staff can delete own projects"
ON projects FOR DELETE
USING (
  owner_id = auth.uid()
  AND get_user_role(auth.uid()) IN ('admin', 'staff')
);

CREATE POLICY "Clients can view their projects"
ON projects FOR SELECT
USING (
  get_user_role(auth.uid()) = 'client'
  AND id IN (
    SELECT project_id FROM project_access
    WHERE user_id = auth.uid()
  )
);

-- Step 6: Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_user_role(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_role(UUID) TO anon;
