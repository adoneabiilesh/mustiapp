# 🚀 Vercel Deployment Guide for Admin Dashboard

## Quick Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com
   - Sign in with your GitHub account

2. **Import Project**
   - Click "Add New Project"
   - Select your repository: `adoneabiilesh/mustiapp`
   - Choose "Root Directory": `admin-dashboard`
   - Framework Preset: **Next.js**

3. **Configure Environment Variables**
   Add these in Vercel dashboard:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key (optional, for admin operations)
   ```

4. **Configure Build Settings**
   - Root Directory: `admin-dashboard`
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your dashboard will be live at: `https://your-project.vercel.app`

---

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Navigate to Admin Dashboard**
   ```bash
   cd admin-dashboard
   ```

4. **Deploy**
   ```bash
   vercel
   ```
   - Follow the prompts
   - Choose "Use existing project" or create new
   - Set root directory if needed

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

---

## Environment Variables Setup

### Required Variables in Vercel:

1. **NEXT_PUBLIC_SUPABASE_URL**
   - Your Supabase project URL
   - Example: `https://xxxxx.supabase.co`

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Your Supabase anonymous key
   - Found in Supabase Dashboard → Settings → API

3. **SUPABASE_SERVICE_ROLE_KEY** (Optional)
   - For admin operations that bypass RLS
   - Keep this secret!

### How to Add in Vercel:

1. Go to your project in Vercel Dashboard
2. Click "Settings" → "Environment Variables"
3. Add each variable:
   - Key: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: Your actual URL
   - Environment: Production, Preview, Development (select all)
4. Click "Save"

---

## Build Configuration

The admin dashboard is configured for Vercel with:

- **Framework**: Next.js
- **Root Directory**: `admin-dashboard`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Node Version**: 18.x (auto-detected)

---

## Custom Domain Setup

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Vercel will automatically configure SSL

---

## Troubleshooting

### Build Fails

**Error**: "Module not found"
- **Fix**: Ensure `package.json` has all dependencies
- Run `npm install` locally to verify

**Error**: "Environment variable missing"
- **Fix**: Add all required env vars in Vercel dashboard
- Redeploy after adding variables

**Error**: "Build timeout"
- **Fix**: Check Vercel plan limits
- Optimize build (remove unused dependencies)

### Runtime Errors

**Error**: "Supabase connection failed"
- **Fix**: Verify env vars are set correctly
- Check Supabase project is active
- Verify RLS policies allow access

**Error**: "Authentication failed"
- **Fix**: Verify Supabase keys are correct
- Check middleware configuration

---

## Post-Deployment Checklist

- [ ] Dashboard loads without errors
- [ ] Login works
- [ ] Can view products
- [ ] Can create/edit products
- [ ] Images upload correctly
- [ ] Orders display correctly
- [ ] Analytics load
- [ ] All admin features work

---

## Monitoring

- **Vercel Dashboard**: View deployments, logs, analytics
- **Vercel Analytics**: Performance metrics
- **Error Tracking**: Check Vercel logs for errors

---

## Continuous Deployment

Vercel automatically deploys when you push to:
- `main` branch → Production
- Other branches → Preview deployments

To disable auto-deploy:
- Settings → Git → Unlink repository

---

## Support

- Vercel Docs: https://vercel.com/docs
- Vercel Support: https://vercel.com/support

---

**Last Updated**: January 2025

