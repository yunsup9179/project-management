# Supabase Setup Guide

## 1. Create Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up for a free account
3. Create a new project

## 2. Create Database Table

In your Supabase dashboard, go to **SQL Editor** and run this query:

```sql
-- Create projects table
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  client TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  custom_fields JSONB DEFAULT '[]'::jsonb,
  phases JSONB DEFAULT '[]'::jsonb,
  tasks JSONB DEFAULT '[]'::jsonb
);

-- Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for demo purposes)
-- In production, you should restrict this based on user authentication
CREATE POLICY "Enable all access for everyone"
ON projects
FOR ALL
USING (true)
WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

## 3. Get API Credentials

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy your **Project URL**
3. Copy your **anon/public** key

## 4. Configure Your App

1. Create a `.env` file in the project root:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

2. Restart your dev server:

```bash
npm run dev
```

## 5. Test

Your app should now be able to:
- Save projects to Supabase
- Load all projects
- Edit existing projects
- Delete projects

## Security Note

The current setup allows anyone to access the database. For production use:

1. Enable Supabase Authentication
2. Update RLS policies to check `auth.uid()`
3. Add user-based access control

Example production policy:
```sql
CREATE POLICY "Users can only access their own projects"
ON projects
FOR ALL
USING (auth.uid() = user_id);
```
