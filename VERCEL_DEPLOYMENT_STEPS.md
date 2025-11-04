# 🚀 Vercel Deployment Steps for Admin Dashboard

## Quick Deployment (After Git Push is Fixed)

### Step 1: Fix Git Push Issue

GitHub detected a secret in `.env` file. You have two options:

**Option A: Allow Secret (If test key)**
- Visit: https://github.com/adoneabiilesh/mustiapp/security/secret-scanning/unblock-secret/352070mevuilL3c4XdDTZWkJvEt
- Click "Allow secret"
- Push again: `git push origin main`

**Option B: Remove from History**
- See `GIT_SECRET_FIX.md` for detailed instructions

---

### Step 2: Deploy to Vercel

#### Method 1: Via Vercel Dashboard (Recommended)

1. **Go to Vercel**: https://vercel.com
2. **Sign in** with GitHub account
3. **Import Project**:
   - Click "Add New Project"
   - Select repository: `adoneabiilesh/mustiapp`
   - **IMPORTANT**: Set **Root Directory** to `admin-dashboard`
   - Framework: **Next.js** (auto-detected)
4. **Environment Variables**:
   Add these in Vercel dashboard (Settings → Environment Variables):
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key (optional)
   ```
5. **Deploy**: Click "Deploy"
6. **Wait**: Build will complete in ~2-3 minutes
7. **Access**: Your dashboard at `https://your-project.vercel.app`

#### Method 2: Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to admin dashboard
cd admin-dashboard

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

---

## Build Configuration

- **Root Directory**: `admin-dashboard`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Framework**: Next.js

---

## Environment Variables

### Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Optional:
- `SUPABASE_SERVICE_ROLE_KEY` (for admin operations)
- `OPENAI_API_KEY` (for AI product generation)

---

## After Deployment

1. **Test the dashboard**: Visit your Vercel URL
2. **Login**: Use admin credentials
3. **Verify features**:
   - Products management
   - Orders management
   - Analytics
   - Settings

---

## Troubleshooting

### Build Fails
- Check environment variables are set
- Verify Supabase connection
- Check build logs in Vercel dashboard

### Authentication Issues
- Verify Supabase keys are correct
- Check RLS policies allow admin access

### Images Not Loading
- Verify Supabase storage bucket is configured
- Check image URLs in Supabase dashboard

---

## Support

- Vercel Docs: https://vercel.com/docs
- Vercel Support: https://vercel.com/support

---

**Note**: Complete the git push first (fix the secret issue), then deploy to Vercel.

