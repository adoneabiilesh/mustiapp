# 🚀 Quick Vercel Deployment Guide

## Repository Structure

✅ **Same Repository**: `adoneabiilesh/mustiapp`
- **Mobile App**: Root directory
- **Admin Dashboard**: `admin-dashboard/` subdirectory

## Deploy Admin Dashboard to Vercel

### Step 1: Go to Vercel Dashboard
1. Visit: https://vercel.com
2. Sign in with GitHub

### Step 2: Import Project
1. Click **"Add New Project"**
2. Select repository: **`adoneabiilesh/mustiapp`**
3. Click **"Import"**

### Step 3: Configure Project
**IMPORTANT SETTINGS:**

1. **Root Directory**: 
   - Click "Edit" next to Root Directory
   - Enter: `admin-dashboard`
   - Click "Continue"

2. **Framework Preset**: 
   - Should auto-detect as **Next.js**
   - If not, select **Next.js**

3. **Build Settings** (should auto-fill):
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

### Step 4: Add Environment Variables

Click **"Environment Variables"** and add:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Optional:**
```
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Step 5: Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build
3. Your dashboard will be live!

---

## Your Dashboard URL

After deployment, you'll get a URL like:
- `https://mustiapp-admin-dashboard.vercel.app`
- Or your custom domain if configured

---

## Verify Deployment

1. Visit your Vercel URL
2. Test login
3. Check all admin features work

---

## Troubleshooting

**Build Fails?**
- Check environment variables are set
- Verify Root Directory is `admin-dashboard`
- Check build logs in Vercel dashboard

**Can't find repository?**
- Make sure you're signed in with the GitHub account that has access
- Check repository is public or you have access

---

That's it! Your admin dashboard will be live on Vercel! 🎉

