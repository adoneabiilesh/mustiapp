# 🚀 Quick Start: Play Store Upload

## Step 1: Setup Environment (5 minutes)

```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Login to Expo
eas login

# 3. Create .env file with production values
# Copy from .env.example and fill in your production credentials
```

## Step 2: Build Preview APK (For Testing)

```bash
# Build APK for testing
npm run build:android:preview

# Wait 10-15 minutes for build to complete
# Download APK from EAS dashboard
# Install on Android device and test thoroughly
```

## Step 3: Build Production AAB (For Play Store)

```bash
# Build AAB for Play Store
npm run build:android:production

# Wait 10-15 minutes for build to complete
# Download AAB file from EAS dashboard
```

## Step 4: Upload to Play Store

1. **Go to Google Play Console:**
   - [play.google.com/console](https://play.google.com/console)
   - Create app if not exists

2. **Complete App Listing:**
   - App name, description, screenshots
   - Privacy policy URL (required)
   - Content rating

3. **Upload Release:**
   - Go to Production > Create new release
   - Upload AAB file
   - Add release notes
   - Submit for review

## ✅ That's It!

Your app will be reviewed in 1-7 days. Check Play Console for status.

---

**Need more details?** See `PLAY_STORE_UPLOAD_GUIDE.md` for complete instructions.

