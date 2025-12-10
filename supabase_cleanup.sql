-- ============================================
-- CLEANUP: Remove existing tables and types
-- ============================================
-- Run this FIRST if you get "already exists" errors

-- Drop existing tables (cascading will drop related objects)
DROP TABLE IF EXISTS project_access CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop existing triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop existing types
DROP TYPE IF EXISTS user_role CASCADE;

-- Now you can run supabase_migration.sql
