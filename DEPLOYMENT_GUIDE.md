# 🚀 Deployment Guide - Admin Dashboard

## Overview
This guide will help you deploy your admin dashboard to GitHub and Vercel for production use.

## 📋 Prerequisites
- GitHub account
- Vercel account (free tier available)
- Node.js installed locally
- Git installed

## 🔧 Step 1: GitHub Setup

### 1.1 Create GitHub Repository
1. Go to [GitHub.com](https://github.com)
2. Click "New repository"
3. Name: `mustiapp-admin-dashboard`
4. Description: `Admin Dashboard for MustiApp Food Delivery`
5. Set to **Public** (for free Vercel deployment)
6. **Don't** initialize with README (we already have files)
7. Click "Create repository"

### 1.2 Push Code to GitHub
```bash
# Navigate to admin-dashboard directory
cd admin-dashboard

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit: Admin dashboard with addon management"

# Add remote origin (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/mustiapp-admin-dashboard.git

# Push to GitHub
git push -u origin main
```

## 🌐 Step 2: Vercel Deployment

### 2.1 Connect to Vercel
1. Go to [Vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Import your `mustiapp-admin-dashboard` repository
5. Click "Import"

### 2.2 Configure Environment Variables
In Vercel dashboard, go to your project → Settings → Environment Variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://imoettikktqagjpwibtt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Optional: Analytics
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

### 2.3 Deploy
1. Click "Deploy" in Vercel
2. Wait for deployment to complete
3. Your admin dashboard will be live at: `https://your-project.vercel.app`

## 🔐 Step 3: Environment Variables Setup

### 3.1 Get Your Supabase Keys
1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy the following:
   - **Project URL**: `https://imoettikktqagjpwibtt.supabase.co`
   - **Anon Key**: `eyJ...` (public key)
   - **Service Role Key**: `eyJ...` (secret key)

### 3.2 Add to Vercel
1. In Vercel dashboard → Project Settings → Environment Variables
2. Add each variable:
   - `NEXT_PUBLIC_SUPABASE_URL` = your project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key
   - `SUPABASE_SERVICE_ROLE_KEY` = your service role key

## 🎯 Step 4: Domain Configuration (Optional)

### 4.1 Custom Domain
1. In Vercel → Project Settings → Domains
2. Add your custom domain (e.g., `admin.mustiapp.com`)
3. Update DNS records as instructed
4. SSL certificate will be automatically provisioned

### 4.2 Supabase RLS Configuration
Update your Supabase RLS policies to allow your Vercel domain:
```sql
-- Allow your Vercel domain
UPDATE auth.users 
SET email = 'admin@yourdomain.com' 
WHERE email = 'your-admin-email@example.com';
```

## 📱 Step 5: Mobile App Integration

### 5.1 Update Mobile App
Update your mobile app's Supabase configuration to use the same database:
```typescript
// In your mobile app's lib/supabase.ts
const supabaseUrl = 'https://imoettikktqagjpwibtt.supabase.co';
const supabaseAnonKey = 'your_supabase_anon_key';
```

### 5.2 Test Integration
1. Create addons in admin dashboard
2. Assign to products
3. Check mobile app for changes

## 🔄 Step 6: Continuous Deployment

### 6.1 Automatic Deployments
- Every push to `main` branch = automatic deployment
- Preview deployments for pull requests
- Rollback to previous versions if needed

### 6.2 Development Workflow
```bash
# Make changes locally
git add .
git commit -m "Add new feature"
git push origin main

# Vercel automatically deploys
# Check deployment status in Vercel dashboard
```

## 🛠️ Troubleshooting

### Common Issues:

1. **Build Fails**
   - Check environment variables are set
   - Verify all dependencies are in package.json
   - Check build logs in Vercel dashboard

2. **Database Connection Issues**
   - Verify Supabase keys are correct
   - Check RLS policies allow your domain
   - Test connection in Supabase dashboard

3. **Image Loading Issues**
   - Verify next.config.js has correct hostnames
   - Check Supabase storage permissions
   - Test image URLs directly

### Performance Optimization:
- Enable Vercel Analytics
- Use Next.js Image optimization
- Implement caching strategies
- Monitor Core Web Vitals

## 📊 Monitoring & Analytics

### 6.1 Vercel Analytics
1. Enable in Vercel dashboard
2. Monitor performance metrics
3. Track user behavior

### 6.2 Error Monitoring
Consider adding:
- Sentry for error tracking
- LogRocket for session replay
- Google Analytics for user insights

## 🎉 Success Checklist

- [ ] GitHub repository created and code pushed
- [ ] Vercel project deployed successfully
- [ ] Environment variables configured
- [ ] Database connection working
- [ ] Admin dashboard accessible
- [ ] Mobile app integration tested
- [ ] Custom domain configured (optional)
- [ ] Analytics enabled (optional)

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test database connection
4. Review Next.js documentation
5. Check Supabase status page

Your admin dashboard should now be live and accessible worldwide! 🌍
