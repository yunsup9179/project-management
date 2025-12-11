-- ============================================
-- Update permissions to match requirements:
-- - Admin: Full access to all projects
-- - Staff: Read-only access to all projects
-- - Client: Read-only access to assigned projects
-- ============================================

-- Drop current project policies
DROP POLICY IF EXISTS "Allow all authenticated users to view projects" ON projects;
DROP POLICY IF EXISTS "Allow all authenticated users to create projects" ON projects;
DROP POLICY IF EXISTS "Allow users to update own projects" ON projects;
DROP POLICY IF EXISTS "Allow users to delete own projects" ON projects;
DROP POLICY IF EXISTS "Allow admins full access" ON projects;

-- Admin: Full access to everything
CREATE POLICY "Admin full access to projects"
  ON projects FOR ALL
  TO authenticated
  USING (public.auth_role() = 'admin')
  WITH CHECK (public.auth_role() = 'admin');

-- Staff: Read-only access to all projects
CREATE POLICY "Staff can view all projects"
  ON projects FOR SELECT
  TO authenticated
  USING (public.auth_role() = 'staff');

-- Client: Read-only access to assigned projects only
CREATE POLICY "Client can view assigned projects"
  ON projects FOR SELECT
  TO authenticated
  USING (
    public.auth_role() = 'client'
    AND id IN (
      SELECT project_id FROM project_access
      WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- Grant access for project_access table
-- ============================================

-- Drop existing policies on project_access
DROP POLICY IF EXISTS "Admins can manage project access" ON project_access;
DROP POLICY IF EXISTS "Users can view own access" ON project_access;

-- Admin can manage all project access
CREATE POLICY "Admin can manage project access"
  ON project_access FOR ALL
  TO authenticated
  USING (public.auth_role() = 'admin')
  WITH CHECK (public.auth_role() = 'admin');

-- Users can view their own access
CREATE POLICY "Users can view own access"
  ON project_access FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
