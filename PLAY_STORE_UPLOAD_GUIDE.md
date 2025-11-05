# 📱 Play Store Upload & Testing Guide

Complete guide for building and uploading your app to Google Play Store.

## 📋 Prerequisites

1. **Google Play Console Account**
   - Create account at [play.google.com/console](https://play.google.com/console)
   - Pay one-time $25 registration fee
   - Complete developer account setup

2. **EAS CLI Installed**
   ```bash
   npm install -g eas-cli
   ```

3. **Expo Account**
   - Sign up at [expo.dev](https://expo.dev)
   - Login: `eas login`

4. **Environment Variables**
   - Create `.env` file with all required variables (see `.env.example`)
   - Ensure all production URLs and keys are set

## 🚀 Step 1: Prepare Your App

### 1.1 Update app.json
- ✅ Version: `1.0.0` (update as needed)
- ✅ Android package: `com.mustiplace.app`
- ✅ Version code: `1` (increment for each release)
- ✅ All assets present (icon, splash, adaptive-icon)

### 1.2 Verify Assets
- ✅ `assets/icon.png` - 1024x1024px
- ✅ `assets/adaptive-icon.png` - 1024x1024px
- ✅ `assets/splash.png` - Proper splash screen
- ✅ All assets are branded (not placeholders)

### 1.3 Environment Variables
```bash
# Copy example file
cp .env.example .env

# Edit .env with your production values
# Required:
EXPO_PUBLIC_SUPABASE_URL=your_production_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key
```

## 🔨 Step 2: Build Production APK/AAB

### Option A: Build App Bundle (Recommended for Play Store)

```bash
# Build production AAB
npm run build:android:production

# Or manually:
eas build --platform android --profile production
```

This creates an `.aab` file (Android App Bundle) which is required for Play Store.

### Option B: Build APK (For Testing)

```bash
# Build preview APK for testing
npm run build:android:preview

# Or manually:
eas build --platform android --profile preview
```

This creates an `.apk` file you can install directly on devices for testing.

### Build Process

1. **EAS will ask for credentials:**
   - Choose "Let EAS handle credentials" (recommended)
   - Or provide your own keystore

2. **Wait for build to complete:**
   - Build takes 10-20 minutes
   - You'll get a download link when done

3. **Download the build:**
   - For Play Store: Download `.aab` file
   - For testing: Download `.apk` file

## 🧪 Step 3: Test Your Build

### 3.1 Install APK on Device

1. **Download the APK** from EAS build page
2. **Enable "Install from Unknown Sources"** on Android device:
   - Settings > Security > Unknown Sources
3. **Transfer APK to device** (USB, email, cloud)
4. **Install and test:**
   - Test all features
   - Check for crashes
   - Verify all functionality works

### 3.2 Internal Testing (Recommended)

1. **Upload to Play Console:**
   - Go to Play Console > Your App > Testing > Internal testing
   - Create new release
   - Upload the AAB file

2. **Add Testers:**
   - Add email addresses of testers
   - They'll receive an email to join testing

3. **Test thoroughly:**
   - Have testers try all features
   - Report any bugs
   - Fix issues before public release

## 📤 Step 4: Upload to Play Store

### 4.1 Create App Listing

1. **Go to Play Console:**
   - [play.google.com/console](https://play.google.com/console)
   - Click "Create app"

2. **App Details:**
   - **App name:** Musti Place
   - **Default language:** English
   - **App or game:** App
   - **Free or paid:** Free (or Paid)
   - **Declarations:** Complete all required

### 4.2 Complete Store Listing

**Required Information:**
- ✅ App name
- ✅ Short description (80 chars max)
- ✅ Full description (4000 chars max)
- ✅ App icon (512x512px)
- ✅ Feature graphic (1024x500px)
- ✅ Screenshots (at least 2, max 8)
  - Phone: 16:9 or 9:16 ratio
  - Tablet: 16:9 or 9:16 ratio
- ✅ Category: Food & Drink
- ✅ Contact email
- ✅ Privacy Policy URL

**Optional but Recommended:**
- Promo video
- App promo text
- Screenshots for different devices

### 4.3 Content Rating

1. **Complete questionnaire:**
   - Answer questions about app content
   - Get rating (usually "Everyone")

2. **Privacy Policy:**
   - Must have a privacy policy URL
   - Should cover data collection, usage, etc.

### 4.4 App Access

**Declare if app:**
- Contains ads
- Uses in-app purchases
- Requires special permissions
- Targets children

### 4.5 Upload Release

1. **Go to Production:**
   - Play Console > Your App > Production

2. **Create new release:**
   - Click "Create new release"
   - Upload your `.aab` file
   - Add release notes

3. **Review:**
   - Review all information
   - Check for warnings/errors

4. **Submit for review:**
   - Click "Start rollout to Production"
   - Review can take 1-7 days

## ✅ Step 5: Post-Upload Checklist

- [ ] App listing is complete
- [ ] Screenshots are uploaded
- [ ] Privacy policy is accessible
- [ ] Content rating is complete
- [ ] App is submitted for review
- [ ] Test accounts are set up (if needed)
- [ ] Support email is monitored

## 🔄 Step 6: Update App Versions

When updating the app:

1. **Update version in app.json:**
   ```json
   {
     "version": "1.0.1",  // Update version
     "android": {
       "versionCode": 2  // Increment by 1
     }
   }
   ```

2. **Build new version:**
   ```bash
   npm run build:android:production
   ```

3. **Upload to Play Console:**
   - Create new release
   - Upload new AAB
   - Add release notes

## 🐛 Common Issues & Solutions

### Issue: Build fails with credential errors
**Solution:** Let EAS handle credentials automatically

### Issue: App crashes on launch
**Solution:** 
- Check environment variables
- Test with preview build first
- Check Sentry for crash reports

### Issue: App rejected by Play Store
**Solution:**
- Check rejection reason in Play Console
- Fix privacy policy issues
- Update content rating if needed
- Resubmit after fixes

### Issue: App not appearing in Play Store
**Solution:**
- Wait 24-48 hours after approval
- Check if app is published (not just submitted)
- Verify app is available in your country

## 📊 Monitoring After Launch

1. **Play Console Analytics:**
   - Monitor installs, ratings, crashes
   - Check user feedback

2. **Sentry Error Tracking:**
   - Monitor crashes and errors
   - Fix critical issues quickly

3. **User Reviews:**
   - Respond to user reviews
   - Address common complaints

## 🎯 Quick Commands Reference

```bash
# Build for production
npm run build:android:production

# Build for testing
npm run build:android:preview

# Submit to Play Store (after manual upload)
npm run submit:android

# Validate environment
npm run validate:env

# Check setup
npm run setup:check
```

## 📝 Important Notes

1. **Version Code:**
   - Must increment for each release
   - Cannot decrease
   - Start at 1, increment by 1 each time

2. **Version Name:**
   - User-visible version (e.g., "1.0.0")
   - Can be any string format
   - Update in app.json

3. **Build Time:**
   - First build: 15-20 minutes
   - Subsequent builds: 10-15 minutes
   - Depends on EAS server load

4. **Review Time:**
   - Usually 1-3 days
   - Can take up to 7 days
   - Check Play Console for status

5. **Testing:**
   - Always test APK before uploading AAB
   - Use internal testing for beta
   - Test on multiple devices

---

**Need Help?**
- EAS Documentation: [docs.expo.dev/build/introduction](https://docs.expo.dev/build/introduction)
- Play Console Help: [support.google.com/googleplay](https://support.google.com/googleplay)

Good luck with your Play Store launch! 🚀

