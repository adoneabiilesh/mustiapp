# ✅ Production Ready Checklist

Complete checklist to ensure your app is ready for Play Store upload and testing.

## 📋 Pre-Build Checklist

### 1. Environment Variables ✅
- [ ] Create `.env` file with production values
- [ ] Copy from `.env.example` template
- [ ] Set `EXPO_PUBLIC_SUPABASE_URL` (production URL)
- [ ] Set `EXPO_PUBLIC_SUPABASE_ANON_KEY` (production key)
- [ ] Set `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` (live key for production)
- [ ] Set `EXPO_PUBLIC_SENTRY_DSN` (optional but recommended)
- [ ] Set `EXPO_PUBLIC_ENV=production`
- [ ] Verify all variables are set: `npm run validate:env`

### 2. App Configuration ✅
- [ ] **app.json** updated:
  - Version: `1.0.0` (or current version)
  - Android package: `com.mustiplace.app`
  - Version code: `1` (increment for releases)
  - All permissions configured
- [ ] **eas.json** configured:
  - Production profile set to `app-bundle`
  - Credentials source set to `remote`

### 3. Assets Verification ✅
- [ ] `assets/icon.png` - 1024x1024px, branded icon
- [ ] `assets/adaptive-icon.png` - 1024x1024px, Android adaptive icon
- [ ] `assets/splash.png` - Splash screen image
- [ ] `assets/favicon.png` - Web favicon
- [ ] All assets are production-ready (not placeholders)

### 4. Code Quality ✅
- [ ] All `console.log()` wrapped in `__DEV__` checks
- [ ] All `console.error()` wrapped in `__DEV__` checks
- [ ] No hardcoded URLs or credentials
- [ ] Error handling implemented
- [ ] TypeScript types are correct

### 5. Testing ✅
- [ ] Test app locally with `npm start`
- [ ] Test all major features:
  - [ ] User authentication
  - [ ] Product browsing
  - [ ] Cart functionality
  - [ ] Checkout process
  - [ ] Payment processing
  - [ ] Order placement
  - [ ] Order tracking
- [ ] Test on Android device/emulator
- [ ] Test on different screen sizes

## 🔨 Build Process

### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
```

### Step 2: Login to Expo
```bash
eas login
```

### Step 3: Configure Project
```bash
eas build:configure
```

### Step 4: Build Preview APK (For Testing)
```bash
npm run build:android:preview
```
This creates an APK you can install directly on devices for testing.

### Step 5: Test Preview Build
- [ ] Download APK from EAS
- [ ] Install on Android device
- [ ] Test all features thoroughly
- [ ] Check for crashes
- [ ] Verify all functionality works
- [ ] Fix any issues found

### Step 6: Build Production AAB (For Play Store)
```bash
npm run build:android:production
```
This creates an AAB (Android App Bundle) required for Play Store.

## 📱 Play Store Preparation

### 1. Google Play Console Setup
- [ ] Create Google Play Console account ($25 one-time fee)
- [ ] Complete developer account verification
- [ ] Create new app in Play Console

### 2. App Listing
- [ ] App name: "Musti Place"
- [ ] Short description (80 chars max)
- [ ] Full description (4000 chars max)
- [ ] App icon (512x512px)
- [ ] Feature graphic (1024x500px)
- [ ] Screenshots (at least 2, max 8)
- [ ] Category: Food & Drink
- [ ] Contact email
- [ ] Privacy Policy URL (required)

### 3. Content Rating
- [ ] Complete content rating questionnaire
- [ ] Get rating certificate (usually "Everyone")

### 4. App Access
- [ ] Declare if app contains ads
- [ ] Declare if app uses in-app purchases
- [ ] Declare required permissions
- [ ] Declare if app targets children

### 5. Upload Release
- [ ] Go to Play Console > Production
- [ ] Create new release
- [ ] Upload AAB file (from EAS build)
- [ ] Add release notes
- [ ] Review and submit

## 🧪 Testing Checklist

### Internal Testing
- [ ] Upload to Internal Testing track
- [ ] Add testers
- [ ] Test on multiple devices
- [ ] Test all features
- [ ] Report and fix bugs

### Beta Testing (Optional)
- [ ] Upload to Closed Beta
- [ ] Invite beta testers
- [ ] Collect feedback
- [ ] Fix critical issues

### Production Testing
- [ ] After approval, test production version
- [ ] Monitor crash reports
- [ ] Monitor user reviews
- [ ] Respond to user feedback

## 📊 Post-Launch Monitoring

### Week 1
- [ ] Monitor Play Console Analytics
- [ ] Check crash reports daily
- [ ] Respond to user reviews
- [ ] Monitor Sentry for errors
- [ ] Track installs and ratings

### Ongoing
- [ ] Regular updates (monthly recommended)
- [ ] Fix bugs reported by users
- [ ] Add new features based on feedback
- [ ] Monitor performance metrics

## 🔄 Update Process

When updating the app:

1. **Update version in app.json:**
   ```json
   {
     "version": "1.0.1",  // New version
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
   - Submit for review

## 🚨 Common Issues & Solutions

### Build Fails
- **Issue:** Credential errors
- **Solution:** Let EAS handle credentials automatically

### App Crashes on Launch
- **Issue:** Missing environment variables
- **Solution:** Verify `.env` file has all required variables

### App Rejected by Play Store
- **Issue:** Privacy policy missing
- **Solution:** Add privacy policy URL to app listing

### Build Takes Too Long
- **Issue:** EAS servers busy
- **Solution:** Wait and retry, or use different build profile

## 📝 Quick Reference

### Build Commands
```bash
# Preview build (APK for testing)
npm run build:android:preview

# Production build (AAB for Play Store)
npm run build:android:production

# Validate environment
npm run validate:env

# Check setup
npm run setup:check
```

### Version Management
- **Version Name:** User-visible (e.g., "1.0.0")
- **Version Code:** Must increment for each release (1, 2, 3...)
- **Cannot decrease:** Version codes can only increase

### Build Time
- First build: 15-20 minutes
- Subsequent builds: 10-15 minutes
- Review time: 1-7 days

## ✅ Final Checklist Before Upload

- [ ] All environment variables set
- [ ] App tested on Android device
- [ ] All features working
- [ ] No console errors in production
- [ ] Privacy policy accessible
- [ ] App listing complete
- [ ] Screenshots uploaded
- [ ] Content rating complete
- [ ] AAB file built and ready
- [ ] Release notes prepared

---

**Ready to upload?** Follow the detailed guide in `PLAY_STORE_UPLOAD_GUIDE.md`

Good luck with your launch! 🚀

