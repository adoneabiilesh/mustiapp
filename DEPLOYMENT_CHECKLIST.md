# 🚀 Production Deployment Checklist

> **Complete checklist before deploying to production**

---

## ✅ PRE-DEPLOYMENT (Critical)

### **1. Testing** ✅
- [ ] Run full test suite: `npm run test:ci`
- [ ] Achieve 80%+ code coverage
- [ ] Test all critical flows:
  - [ ] Authentication (sign in, sign up, logout)
  - [ ] Order placement
  - [ ] Payment processing
  - [ ] Real-time tracking
  - [ ] Admin dashboard operations
- [ ] Run E2E tests
- [ ] Load testing (simulate 100+ concurrent users)

### **2. Security Audit** ✅
- [ ] Run security audit: `npm run security:audit`
- [ ] Review all RLS policies in Supabase
- [ ] Verify no API keys in code
- [ ] Check environment variables are set correctly
- [ ] Test SQL injection prevention
- [ ] Test XSS prevention
- [ ] Verify authentication is secure
- [ ] Review rate limiting is working

### **3. Payment Verification** ✅
- [ ] Test Stripe webhooks with Stripe CLI
- [ ] Verify webhook signature validation
- [ ] Test payment success flow
- [ ] Test payment failure flow
- [ ] Test refund processing
- [ ] Set up production webhook URL in Stripe
- [ ] Configure webhook alerts

### **4. Environment Variables** ✅
```bash
# Mobile App (.env or EAS secrets)
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=
EXPO_PUBLIC_SENTRY_DSN=

# Admin Dashboard (Vercel/Netlify)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Supabase Edge Functions
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
SUPABASE_SERVICE_ROLE_KEY=
```

### **5. Error Monitoring** ✅
- [ ] Sentry DSN configured
- [ ] Error alerts configured:
  - [ ] Critical errors → Immediate notification
  - [ ] Payment failures → Alert within 1 minute
  - [ ] API errors > 5% → Alert team
- [ ] Error dashboard set up
- [ ] Slack/Email notifications working

### **6. CI/CD Pipeline** ✅
- [ ] GitHub Actions workflows working
- [ ] Tests run on every PR
- [ ] Automatic builds configured
- [ ] Staging deployment working
- [ ] Production deployment requires approval
- [ ] Rollback procedure documented

---

## 📋 DATABASE (Critical)

### **7. Database Setup** ✅
- [ ] Run all migrations in production
- [ ] Verify RLS policies are enabled
- [ ] Create database backups
- [ ] Set up automated backup schedule
- [ ] Test database restore procedure
- [ ] Verify indexes are created
- [ ] Check query performance

### **8. Supabase Configuration** ✅
- [ ] Production Supabase project created
- [ ] Environment variables set
- [ ] Edge Functions deployed
- [ ] Storage buckets configured
- [ ] Realtime subscriptions tested
- [ ] Database connection pooling configured

---

## 🔒 SECURITY (Critical)

### **9. Security Headers** ✅
- [ ] XSS Protection headers
- [ ] Content Security Policy
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] API rate limiting active
- [ ] Input validation on all endpoints

### **10. Authentication** ✅
- [ ] Supabase Auth configured
- [ ] OAuth providers set up (Google, Apple)
- [ ] Phone authentication working
- [ ] Session management secure
- [ ] Password reset flow tested
- [ ] Account lockout after failed attempts

---

## 📱 MOBILE APP (Critical)

### **11. App Configuration** ✅
- [ ] `app.json` updated with production config
- [ ] Bundle identifier set (iOS: `com.mustiplace.app`)
- [ ] Package name set (Android: `com.mustiplace.app`)
- [ ] App icons generated
- [ ] Splash screen configured
- [ ] EAS build profiles configured

### **12. App Store Preparation** ✅
- [ ] App Store Connect account set up
- [ ] Google Play Console account set up
- [ ] App descriptions written
- [ ] Screenshots prepared
- [ ] Privacy policy URL ready
- [ ] Terms of service URL ready
- [ ] App Store compliance checked

---

## 🖥️ ADMIN DASHBOARD (Critical)

### **13. Dashboard Deployment** ✅
- [ ] Build succeeds: `npm run admin:build`
- [ ] Environment variables configured
- [ ] Deployed to hosting (Vercel/Netlify)
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] All pages working correctly

---

## 📊 MONITORING & ANALYTICS

### **14. Monitoring Setup** ✅
- [ ] Sentry configured for errors
- [ ] Performance monitoring active
- [ ] Uptime monitoring (UptimeRobot/Pingdom)
- [ ] Database monitoring
- [ ] API response time tracking
- [ ] User analytics configured

### **15. Alerts Configured** ✅
- [ ] Critical errors → Slack/Email
- [ ] Payment failures → Immediate alert
- [ ] High error rate → Team notification
- [ ] API downtime → Alert
- [ ] Database issues → Alert

---

## 📄 LEGAL & COMPLIANCE

### **16. Legal Documents** ✅
- [ ] Privacy Policy published and accessible
- [ ] Terms of Service published
- [ ] Refund Policy clearly stated
- [ ] GDPR compliance verified (if serving EU)
- [ ] Cookie consent implemented (if needed)
- [ ] Data export functionality (GDPR)

---

## 🧪 TESTING (Pre-Launch)

### **17. Pre-Launch Testing** ✅
- [ ] Test on real iOS device
- [ ] Test on real Android device
- [ ] Test on different screen sizes
- [ ] Test with slow internet connection
- [ ] Test offline scenarios
- [ ] Test payment with real card (test mode)
- [ ] Load test with 100+ concurrent users
- [ ] Security penetration test

---

## 📝 DOCUMENTATION

### **18. Documentation** ✅
- [ ] Deployment guide created
- [ ] Troubleshooting guide
- [ ] API documentation
- [ ] Database schema documented
- [ ] Environment variables documented
- [ ] Runbook for common issues

---

## 🚀 DEPLOYMENT STEPS

### **Step 1: Deploy to Staging**
```bash
# 1. Merge to develop branch
git checkout develop
git merge feature/production-ready

# 2. CI/CD will automatically deploy to staging
# 3. Test staging environment thoroughly
```

### **Step 2: Production Deployment**
```bash
# 1. Create release branch
git checkout main
git merge develop

# 2. Tag release
git tag -a v1.0.0 -m "Production release"
git push origin v1.0.0

# 3. CI/CD will deploy to production (with approval)
```

### **Step 3: Post-Deployment**
- [ ] Monitor error logs for 24 hours
- [ ] Monitor performance metrics
- [ ] Verify all features working
- [ ] Test payment processing
- [ ] Check real-time updates

---

## ✅ FINAL VERIFICATION

### **Before Going Live:**
- [ ] All critical tests passing
- [ ] Security audit passed
- [ ] Payment webhooks verified
- [ ] Error monitoring active
- [ ] Backups configured
- [ ] Rollback plan ready
- [ ] Support channels ready
- [ ] Legal docs published

---

## 🆘 ROLLBACK PROCEDURE

If critical issues found after deployment:

1. **Immediate Rollback:**
   ```bash
   # Revert to previous version
   git revert HEAD
   git push origin main
   ```

2. **Disable Features:**
   - Disable new orders if payment broken
   - Show maintenance message
   - Notify users

3. **Investigate:**
   - Check error logs
   - Review Sentry alerts
   - Fix issues in staging

4. **Re-deploy:**
   - Fix issues
   - Test in staging
   - Deploy fixed version

---

## 📞 SUPPORT SETUP

Before launch:
- [ ] Support email configured
- [ ] Support phone number (if needed)
- [ ] FAQ/Help center ready
- [ ] Support ticket system (if using)

---

## 🎉 READY FOR LAUNCH

Once all items checked:
1. Announce launch date
2. Monitor closely for first 24 hours
3. Be ready to fix issues quickly
4. Gather user feedback
5. Iterate and improve

---

**Status:** Update this checklist as you complete each item!




