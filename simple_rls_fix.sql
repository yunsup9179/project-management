-- ============================================
-- SIMPLE FIX: Remove ALL policies and start fresh
-- Using the simplest possible approach
-- ============================================

-- Step 1: Drop ALL policies on profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Step 2: Drop ALL policies on projects
DROP POLICY IF EXISTS "Admins full access to projects" ON projects;
DROP POLICY IF EXISTS "Staff can view all projects" ON projects;
DROP POLICY IF EXISTS "Clients can view their projects" ON projects;
DROP POLICY IF EXISTS "Staff can create projects" ON projects;
DROP POLICY IF EXISTS "Staff can update own projects" ON projects;
DROP POLICY IF EXISTS "Staff can delete own projects" ON projects;

-- Step 3: Drop ALL policies on project_access
DROP POLICY IF EXISTS "Admins can manage project access" ON project_access;
DROP POLICY IF EXISTS "Users can view own access" ON project_access;

-- Step 4: Create helper function
CREATE OR REPLACE FUNCTION public.auth_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid()),
    'staff'::user_role
  );
$$;

-- Step 5: Grant permissions
GRANT EXECUTE ON FUNCTION public.auth_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.auth_role() TO anon;

-- Step 6: Create simple profiles policies
CREATE POLICY "Allow users to view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Allow users to update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Allow admins to view all profiles"
  ON profiles FOR SELECT
  USING (public.auth_role() = 'admin');

CREATE POLICY "Allow admins to update all profiles"
  ON profiles FOR UPDATE
  USING (public.auth_role() = 'admin');

-- Step 7: Create simple projects policies
CREATE POLICY "Allow all authenticated users to view projects"
  ON projects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow all authenticated users to create projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Allow users to update own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Allow users to delete own projects"
  ON projects FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Allow admins full access"
  ON projects FOR ALL
  TO authenticated
  USING (public.auth_role() = 'admin');
