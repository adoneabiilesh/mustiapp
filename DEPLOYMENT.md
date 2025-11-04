# Admin Dashboard Deployment Guide

Quick guide to deploy the MustiApp Admin Dashboard to production.

## 🚀 Deploy to Vercel (5 minutes)

### Step 1: Push to GitHub

```bash
# From project root
git add admin-dashboard/
git commit -m "Add admin dashboard"
git push origin main
```

### Step 2: Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `admin-dashboard`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### Step 3: Add Environment Variables

In Vercel dashboard, go to **Settings** → **Environment Variables**:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
ADMIN_EMAIL=admin@mustiapp.com
```

⚠️ **Use LIVE keys for production!**

### Step 4: Deploy

Click "Deploy" and wait ~2 minutes.

Your dashboard will be live at: `https://your-app.vercel.app`

## 🔧 Post-Deployment Setup

### 1. Configure Custom Domain (Optional)

1. Go to Vercel → Settings → Domains
2. Add your domain: `admin.mustiapp.com`
3. Update DNS records as instructed
4. SSL automatically configured

### 2. Update Stripe Webhook URL

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Update endpoint URL:
   ```
   https://your-project-ref.supabase.co/functions/v1/stripe-webhook
   ```
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`

### 3. Deploy Supabase Edge Functions

```bash
cd mustiapp

# Install Supabase CLI (if not installed)
npm i -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Deploy functions
cd scripts/supabase-edge-functions
supabase functions deploy create-payment-intent
supabase functions deploy stripe-webhook

# Set secrets
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase secrets set SUPABASE_URL=https://your-project.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

### 4. Test the Deployment

**Check Admin Dashboard:**
- Visit your URL
- Products page loads
- Orders page shows data
- Maps display correctly

**Check Payments:**
- Make a test purchase (small amount)
- Verify order creates
- Check payment processes
- Confirm webhook updates order status

**Check Real-time:**
- Open dashboard
- Create order from mobile app
- Verify it appears immediately
- Update order status
- Check mobile app reflects change

## 🔐 Security Checklist

### Before Going Live:

- [ ] Service role key only in environment variables (never in code)
- [ ] Stripe in live mode (not test mode)
- [ ] HTTPS enforced (Vercel does this automatically)
- [ ] RLS policies reviewed and tested
- [ ] Admin authentication implemented
- [ ] CORS configured correctly in Supabase
- [ ] No sensitive data in logs
- [ ] Error messages don't expose system details
- [ ] Webhook signature verification enabled
- [ ] API rate limiting configured

### Add Admin Authentication

Create `admin-dashboard/middleware.ts`:

```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Redirect to login if not authenticated
  if (!session && req.nextUrl.pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Check if user is admin
  const adminEmail = process.env.ADMIN_EMAIL;
  if (session && session.user.email !== adminEmail) {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/((?!login|_next/static|_next/image|favicon.ico).*)'],
};
```

## 📊 Monitoring

### Add Vercel Analytics

```bash
cd admin-dashboard
npm install @vercel/analytics
```

```tsx
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Monitor Edge Functions

```bash
# View logs
supabase functions logs create-payment-intent --project-ref your-ref

# Follow logs in real-time
supabase functions logs create-payment-intent --project-ref your-ref --follow
```

### Set Up Alerts

**In Supabase Dashboard:**
1. Go to Settings → Alerts
2. Configure alerts for:
   - High error rate
   - Database connection issues
   - High CPU/memory usage

**In Vercel:**
1. Settings → Notifications
2. Enable:
   - Deployment failures
   - Domain configuration issues

## 🐛 Troubleshooting

### Maps Not Loading

**Symptom:** White box instead of map

**Solution:**
1. Check browser console for errors
2. Verify leaflet CSS imported in `globals.css`
3. Ensure dynamic import with `ssr: false`:
   ```tsx
   const Map = dynamic(() => import('./Map'), { ssr: false });
   ```

### Environment Variables Not Working

**Symptom:** "Environment variable not defined"

**Solution:**
1. Verify variables in Vercel dashboard
2. Redeploy after adding variables
3. Check variable names match exactly (case-sensitive)
4. Prefix client variables with `NEXT_PUBLIC_`

### Real-time Not Updating

**Symptom:** Changes don't appear live

**Solution:**
1. Check Supabase Realtime is enabled (Project Settings → API)
2. Verify RLS policies allow SELECT
3. Check browser network tab for WebSocket connection
4. Try reconnecting: close/reopen dashboard

### Payment Errors

**Symptom:** Payment fails or webhook not received

**Solution:**
1. Check Stripe is in correct mode (live/test)
2. Verify webhook URL in Stripe dashboard
3. Check webhook signing secret in Supabase secrets
4. Test webhook with Stripe CLI:
   ```bash
   stripe listen --forward-to https://your-ref.supabase.co/functions/v1/stripe-webhook
   ```

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Update dashboard"
git push origin main
# ✅ Automatically deployed!
```

**Preview Deployments:**
- Every PR gets a preview URL
- Test changes before merging
- Share with team for review

## 📈 Performance Optimization

### Enable Caching

```typescript
// app/products/page.tsx
export const revalidate = 60; // Revalidate every 60 seconds
```

### Optimize Images

```tsx
import Image from 'next/image';

<Image
  src={product.image_url}
  alt={product.name}
  width={300}
  height={300}
  priority={index < 4} // Prioritize visible images
/>
```

### Reduce Bundle Size

```bash
# Analyze bundle
npm run build
# Check .next/analyze

# Remove unused dependencies
npm prune
```

## 💰 Cost Estimation

**Vercel (Admin Dashboard):**
- Hobby: FREE (sufficient for most)
- Pro: $20/month (if you need more)

**Supabase (Backend):**
- Free tier: Up to 500MB database, 2GB bandwidth
- Pro: $25/month (2GB database, 8GB bandwidth)

**Stripe (Payments):**
- No monthly fee
- 1.5% + €0.25 per transaction (Europe)
- Only pay for successful payments

**Total:** $0-45/month depending on scale

## ✅ Launch Checklist

Before announcing to public:

- [ ] Admin dashboard deployed
- [ ] Custom domain configured (if using)
- [ ] SSL certificate active
- [ ] Admin authentication working
- [ ] All environment variables set correctly
- [ ] Stripe in live mode
- [ ] Webhooks configured and tested
- [ ] Payment flow tested end-to-end
- [ ] Real-time updates working
- [ ] Maps displaying correctly
- [ ] Error tracking enabled
- [ ] Analytics configured
- [ ] Mobile app updated with live keys
- [ ] Database backups enabled
- [ ] Load testing completed
- [ ] Team trained on admin dashboard

## 📚 Resources

- [Vercel Docs](https://vercel.com/docs)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)
- [Stripe Go-Live Checklist](https://stripe.com/docs/development/checklist)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

## 💬 Support

**Issues?**
- Check logs in Vercel dashboard
- Review Supabase function logs
- Test webhooks with Stripe CLI
- Check this troubleshooting guide

**Still stuck?**
- Open GitHub issue
- Contact Vercel support
- Ask in Supabase Discord

---

**Your admin dashboard is now live! 🎉**



