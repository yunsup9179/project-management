# Deployment Guide - Vercel

## 🚀 Quick Deploy to Vercel

### Prerequisites
1. GitHub account
2. Vercel account (free) - [Sign up here](https://vercel.com)
3. Supabase database already set up

---

## Step 1: Push to GitHub

### 1.1 Create GitHub Repository
1. Go to [github.com](https://github.com/new)
2. Create a new repository (e.g., "gantt-chart-tool")
3. **Do not** initialize with README (we already have files)

### 1.2 Push your code
```bash
git init
git add .
git commit -m "Initial commit - Gantt Chart Tool with Auth"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
git push -u origin main
```

---

## Step 2: Deploy to Vercel

### 2.1 Import Project
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Click **"Import Git Repository"**
4. Select your GitHub repository
5. Click **"Import"**

### 2.2 Configure Environment Variables
**IMPORTANT:** Before clicking "Deploy", add these environment variables:

Click **"Environment Variables"** and add:

```
VITE_SUPABASE_URL = https://joibjymfrvnhsvdonqhs.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvaWJqeW1mcnZuaHN2ZG9ucWhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzOTkzNDMsImV4cCI6MjA4MDk3NTM0M30.rgIeD8k2GU9qURnpDG-_-M-uLTgp3aJVukJ6-OOqeMM
```

### 2.3 Deploy
1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. You'll get a URL like: `https://your-project.vercel.app`

---

## Step 3: Set up Supabase Database

### 3.1 Run Migration SQL
1. Go to your Supabase dashboard
2. Open **SQL Editor**
3. Copy all contents from `supabase_migration.sql` file
4. Paste and click **"Run"**

### 3.2 Create First Admin User
1. Visit your Vercel app URL
2. Click **"Sign up"**
3. Enter your email and create an account
4. Check email for confirmation link
5. Go back to Supabase → **SQL Editor**
6. Run this to make yourself admin:

```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'your-email@company.com';
```

---

## Step 4: Test

1. Visit your Vercel URL
2. Sign in with your account
3. Create a test project
4. Add some tasks
5. Generate Gantt chart
6. Test print/PDF export

---

## Step 5: Share with Team

### Option A: Direct Link
Share the Vercel URL with your team:
```
https://your-project.vercel.app
```

### Option B: Custom Domain (Optional)
1. In Vercel dashboard, go to **Settings** → **Domains**
2. Add your custom domain (e.g., `gantt.yourcompany.com`)
3. Follow DNS setup instructions

### Option C: Add to Squarespace
1. In Squarespace, add a new page or button
2. Link to your Vercel URL
3. Team clicks link → Goes to Gantt app → Logs in

---

## 🔧 Manage Users

### Make someone Admin
```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'user@company.com';
```

### Make someone Staff (view only - Phase 2)
```sql
UPDATE profiles
SET role = 'staff'
WHERE email = 'user@company.com';
```

### View all users
```sql
SELECT id, email, full_name, role, created_at
FROM profiles
ORDER BY created_at DESC;
```

---

## 🎯 Next Steps (Phase 2)

After your team starts using it, we can add:
- Role-based permissions (Admin/Staff/Client)
- Client-specific project access
- User management UI for admins

---

## Troubleshooting

### Build fails on Vercel
- Check that all dependencies are in `package.json`
- Ensure environment variables are set correctly

### Can't log in
- Check Supabase SQL migration ran successfully
- Verify email confirmation was clicked

### Projects not saving
- Check Supabase environment variables in Vercel
- Check browser console for errors

---

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check browser console (F12)
3. Check Supabase logs in dashboard
