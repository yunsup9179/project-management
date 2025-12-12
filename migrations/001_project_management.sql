-- ============================================
-- MIGRATION 001: Project Management Features
-- Run this in Supabase SQL Editor when ready
-- ============================================

-- 1. Add progress fields to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS progress_status TEXT DEFAULT 'Pending';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS progress_percent INTEGER DEFAULT 0;

-- 2. Budget Items table (line items + Change Orders)
CREATE TABLE IF NOT EXISTS budget_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  item_type TEXT NOT NULL DEFAULT 'original',  -- 'original' | 'change_order'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- 3. Project Notes table
CREATE TABLE IF NOT EXISTS project_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  note_tag TEXT DEFAULT 'general',  -- 'update' | 'issue' | 'milestone' | 'general'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  author_id UUID REFERENCES profiles(id)
);

-- 4. Project Permits table
CREATE TABLE IF NOT EXISTS project_permits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  permit_type TEXT NOT NULL,  -- 'Electrical' | 'Building' | 'Planning' | 'Fire' | 'Other'
  status TEXT DEFAULT 'Pending',  -- 'Pending' | 'In Review' | 'Approved' | 'Corrections Required'
  submitted_date DATE,
  approved_date DATE,
  permit_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Project Utilities table
CREATE TABLE IF NOT EXISTS project_utilities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  utility_name TEXT NOT NULL,  -- Free text: 'SCE', 'PG&E', 'LADWP', etc.
  application_submitted_date DATE,
  application_status TEXT DEFAULT 'Pending',  -- 'Pending' | 'In Review' | 'Approved' | 'Denied'
  design_review_status TEXT,
  meter_set_date DATE,
  service_activation_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_permits ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_utilities ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES: Budget Items (Admin/Staff only - Client CANNOT see)
-- ============================================
CREATE POLICY "Admin full access to budget_items"
ON budget_items FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Staff can view budget_items"
ON budget_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'staff')
);

-- ============================================
-- RLS POLICIES: Project Notes (All can view, Admin/Staff can edit)
-- ============================================
CREATE POLICY "Admin full access to project_notes"
ON project_notes FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Staff can manage project_notes"
ON project_notes FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'staff')
);

CREATE POLICY "Client can view project_notes"
ON project_notes FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM project_access pa
    WHERE pa.project_id = project_notes.project_id
    AND pa.user_id = auth.uid()
  )
);

-- ============================================
-- RLS POLICIES: Project Permits (Admin full, Staff/Client read-only)
-- ============================================
CREATE POLICY "Admin full access to project_permits"
ON project_permits FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Staff can view project_permits"
ON project_permits FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'staff')
);

CREATE POLICY "Client can view project_permits"
ON project_permits FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM project_access pa
    WHERE pa.project_id = project_permits.project_id
    AND pa.user_id = auth.uid()
  )
);

-- ============================================
-- RLS POLICIES: Project Utilities (Same as Permits)
-- ============================================
CREATE POLICY "Admin full access to project_utilities"
ON project_utilities FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Staff can view project_utilities"
ON project_utilities FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'staff')
);

CREATE POLICY "Client can view project_utilities"
ON project_utilities FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM project_access pa
    WHERE pa.project_id = project_utilities.project_id
    AND pa.user_id = auth.uid()
  )
);

-- ============================================
-- INDEXES for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_budget_items_project_id ON budget_items(project_id);
CREATE INDEX IF NOT EXISTS idx_project_notes_project_id ON project_notes(project_id);
CREATE INDEX IF NOT EXISTS idx_project_permits_project_id ON project_permits(project_id);
CREATE INDEX IF NOT EXISTS idx_project_utilities_project_id ON project_utilities(project_id);
