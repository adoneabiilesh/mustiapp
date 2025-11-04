# 🚀 Deploy Admin Dashboard to Vercel

## Repository Info

✅ **Same Repository**: `adoneabiilesh/mustiapp`
- **Mobile App**: Root directory (`/`)
- **Admin Dashboard**: Subdirectory (`/admin-dashboard`)

Both are in the **same GitHub repository**, but Vercel needs to know which part to deploy.

---

## Quick Deployment Steps

### Step 1: Go to Vercel
1. Visit: https://vercel.com
2. Sign in with GitHub (same account as your repo)

### Step 2: Import Project
1. Click **"Add New Project"** or **"Import Project"**
2. Find and select: **`adoneabiilesh/mustiapp`**
3. Click **"Import"**

### Step 3: Configure for Admin Dashboard

**CRITICAL SETTINGS:**

1. **Root Directory** ⚠️ **MOST IMPORTANT**:
   - Click "Edit" or "Configure Project"
   - Find **"Root Directory"** setting
   - Click "Edit"
   - Change from `/` to: `admin-dashboard`
   - Click "Continue" or "Save"

2. **Framework Preset**:
   - Should auto-detect as **Next.js**
   - If not, select **Next.js** manually

3. **Build Settings** (should auto-fill after setting root directory):
   - Build Command: `npm run build` (runs in admin-dashboard folder)
   - Output Directory: `.next`
   - Install Command: `npm install`

### Step 4: Environment Variables

Before deploying, add these environment variables:

1. Click **"Environment Variables"** section
2. Add each variable:

   **Required:**
   ```
   Name: NEXT_PUBLIC_SUPABASE_URL
   Value: your_supabase_url
   Environment: Production, Preview, Development (select all)
   ```

   ```
   Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
   Value: your_supabase_anon_key
   Environment: Production, Preview, Development (select all)
   ```

   **Optional:**
   ```
   Name: SUPABASE_SERVICE_ROLE_KEY
   Value: your_service_role_key
   Environment: Production, Preview, Development (select all)
   ```

3. Click **"Save"** after adding each variable

### Step 5: Deploy

1. Click **"Deploy"** button
2. Wait 2-3 minutes for build to complete
3. ✅ Your admin dashboard will be live!

---

## Your Dashboard URL

After successful deployment, you'll get:
- **Production URL**: `https://mustiapp-admin-dashboard.vercel.app`
- Or a URL like: `https://mustiapp-xxxxx.vercel.app`

You can also add a custom domain later.

---

## Verify It Works

1. Visit your Vercel URL
2. Test login with admin credentials
3. Check:
   - ✅ Products page loads
   - ✅ Orders page works
   - ✅ Can create/edit products
   - ✅ Analytics display

---

## Troubleshooting

### Build Fails?
- **Check**: Root Directory is set to `admin-dashboard`
- **Check**: Environment variables are added
- **Check**: Build logs in Vercel dashboard

### Can't Find Repository?
- Make sure you're signed in with the GitHub account that owns `adoneabiilesh/mustiapp`
- Check repository visibility (public or you have access)

### Wrong Directory Deployed?
- Make sure Root Directory is `admin-dashboard` (not `/`)
- Redeploy after fixing

---

## Summary

✅ **Repository**: Same repo (`adoneabiilesh/mustiapp`)
✅ **Root Directory**: Set to `admin-dashboard` in Vercel
✅ **Environment Variables**: Add Supabase keys
✅ **Deploy**: Click deploy and wait

That's it! Your admin dashboard will be live on Vercel! 🎉

