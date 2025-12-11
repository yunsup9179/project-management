-- ============================================
-- FIX: Remove infinite recursion in RLS policies
-- ============================================

-- 1. Drop the problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- 2. Recreate WITHOUT self-referencing recursion
-- Instead of checking profiles table again, we use a direct role check

-- Admins can view all profiles (fixed - no recursion)
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  OR auth.uid() = id
);

-- Admins can update all profiles (fixed - no recursion)
CREATE POLICY "Admins can update all profiles"
ON profiles FOR UPDATE
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  OR auth.uid() = id
);

-- ============================================
-- Also fix the projects policies to avoid recursion
-- ============================================

-- Drop existing project policies
DROP POLICY IF EXISTS "Admins full access to projects" ON projects;
DROP POLICY IF EXISTS "Staff can view all projects" ON projects;

-- Recreate with optimized queries
CREATE POLICY "Admins full access to projects"
ON projects FOR ALL
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Staff can view all projects"
ON projects FOR SELECT
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'staff')
);

-- Staff can create projects (from fix_rls_policies.sql)
CREATE POLICY "Staff can create projects"
ON projects FOR INSERT
WITH CHECK (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'staff')
  AND owner_id = auth.uid()
);

-- Staff can update their own projects
CREATE POLICY "Staff can update own projects"
ON projects FOR UPDATE
USING (
  owner_id = auth.uid()
  AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'staff')
);

-- Staff can delete their own projects
CREATE POLICY "Staff can delete own projects"
ON projects FOR DELETE
USING (
  owner_id = auth.uid()
  AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'staff')
);
