# 🔐 EAS Secrets Setup Guide

Your app is crashing because environment variables are missing in the production build. Follow these steps to fix it.

## 🚨 Quick Fix

### Step 1: Set EAS Secrets

Run these commands in your terminal:

```bash
# 1. Login to EAS (if not already)
eas login

# 2. Set Supabase URL
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://your-project.supabase.co"

# 3. Set Supabase Anon Key
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your-anon-key-here"

# 4. Set Stripe Publishable Key
eas secret:create --scope project --name EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY --value "pk_live_your-key-here"

# 5. (Optional) Set Sentry DSN
eas secret:create --scope project --name EXPO_PUBLIC_SENTRY_DSN --value "your-sentry-dsn-here"
```

### Step 2: Verify Secrets

```bash
# List all secrets
eas secret:list
```

### Step 3: Rebuild Your App

```bash
# Rebuild with secrets
eas build --platform android --profile preview
```

## 📝 Where to Find Your Values

### Supabase
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings > API
4. Copy:
   - **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
   - **anon public** key → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### Stripe
1. Go to https://dashboard.stripe.com
2. Go to Developers > API keys
3. Copy:
   - **Publishable key** (for production, use live key) → `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### Sentry (Optional)
1. Go to https://sentry.io
2. Create a project or select existing
3. Copy the DSN → `EXPO_PUBLIC_SENTRY_DSN`

## ✅ After Setting Secrets

1. **Rebuild your app:**
   ```bash
   eas build --platform android --profile preview
   ```

2. **Download the new APK** from EAS dashboard

3. **Install and test** - the app should now work!

## 🔍 Troubleshooting

### Check if secrets are set:
```bash
eas secret:list
```

### Update a secret:
```bash
eas secret:update --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "new-value"
```

### Delete a secret:
```bash
eas secret:delete --scope project --name EXPO_PUBLIC_SUPABASE_URL
```

## 📚 More Info

- [EAS Secrets Documentation](https://docs.expo.dev/build-reference/variables/)
- [Environment Variables Guide](https://docs.expo.dev/guides/environment-variables/)

