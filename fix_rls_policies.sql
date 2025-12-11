-- ============================================
-- FIX: Add INSERT/UPDATE policies for Staff
-- ============================================
-- This allows staff members to create and update their own projects

-- Staff can create projects (they become the owner)
CREATE POLICY "Staff can create projects"
ON projects FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'staff'
  )
);

-- Staff can update their own projects
CREATE POLICY "Staff can update own projects"
ON projects FOR UPDATE
USING (
  owner_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'staff'
  )
);

-- Staff can delete their own projects
CREATE POLICY "Staff can delete own projects"
ON projects FOR DELETE
USING (
  owner_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'staff'
  )
);

-- ============================================
-- ALTERNATIVE: Make your account admin
-- ============================================
-- Run this to make yourself admin (replace with your email):
-- UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
