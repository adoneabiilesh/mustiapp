# 🚀 PRE-RELEASE CHECKLIST FOR PLAY STORE

## 📋 COMPREHENSIVE CHECKLIST BEFORE BUILDING APK

---

## 🔴 CRITICAL - MISSING ROUTES

### 1. **Missing Route: special-offer-details**
- **Status**: ❌ Route referenced but doesn't exist
- **Location**: `components/SpecialOffersSection.tsx:38`
- **Fix Required**: Create `app/special-offer-details.tsx` or redirect to existing route
- **Impact**: App will crash when user taps on special offer

**Action**: 
```typescript
// Option 1: Create new route
// Create: app/special-offer-details.tsx

// Option 2: Redirect to existing route
// Change: router.push(`/special-offer-details?id=${offerId}`)
// To: router.push(`/promotion-detail?id=${offerId}`)
```

---

## 🟠 HIGH PRIORITY - STATIC/HARDCODED CONTENT

### 2. **Restaurant Information (Hardcoded)**
- **Location**: Multiple files
- **Items to Change**:
  - Restaurant Name: "Musti Place" → Your actual name
  - Phone: "+39 06 1234 5678" → Your real phone
  - Email: "info@mustiplace.com" → Your real email
  - Address: "123 Main Street, Rome, Italy" → Your real address
  - Social Media URLs: All placeholder URLs → Real URLs

**Files to Update**:
- `lib/restaurantConfig.ts`
- `app.json` (name, bundle identifier)
- Any hardcoded restaurant data

### 3. **Legal/Support Email Addresses**
- **Current**: legal@mustiapp.com, info@mustiplace.com
- **Action**: Replace with real email addresses
- **Files**: 
  - `TERMS_OF_SERVICE.md`
  - `PRIVACY_POLICY.md`
  - Any contact forms

### 4. **App Metadata in app.json**
- **Current Values**:
  ```json
  "name": "Musti Place"
  "bundleIdentifier": "com.mustiplace.app"
  "package": "com.mustiplace.app"
  ```
- **Action**: Update to your actual app name and bundle ID
- **Note**: Bundle ID must be unique - check Play Store availability

### 5. **App Icons & Splash Screen**
- **Required Assets**:
  - ✅ `assets/icon.png` (1024x1024px)
  - ✅ `assets/adaptive-icon.png` (Android)
  - ✅ `assets/splash.png` (Splash screen)
  - ✅ `assets/favicon.png` (Web)
- **Action**: Verify all icons are your branded icons, not placeholders

---

## 🟡 MEDIUM PRIORITY - ENVIRONMENT VARIABLES

### 6. **Missing Environment Variables**
- **Required Variables**:
  ```bash
  EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
  EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
  EXPO_PUBLIC_SENTRY_DSN=your_sentry_dsn (optional but recommended)
  EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
  ```
- **Action**: 
  1. Create `.env` file (if not exists)
  2. Add all required variables
  3. Add `.env` to `.gitignore`
  4. Create `.env.example` with placeholder values
  5. Document in README

### 7. **Environment Variable Validation**
- **Status**: ❌ No validation for missing env vars
- **Action**: Add validation in `app/_layout.tsx` or startup script
- **Impact**: App might crash silently if env vars are missing

**Recommended Fix**:
```typescript
// Add to app/_layout.tsx or startup
if (!process.env.EXPO_PUBLIC_SUPABASE_URL) {
  console.error('❌ EXPO_PUBLIC_SUPABASE_URL is missing!');
  // Show error screen or alert
}
```

---

## 🟢 MEDIUM PRIORITY - ERROR HANDLING

### 8. **Network Error Handling**
- **Status**: ⚠️ Basic error handling exists, but could be improved
- **Action**: Add network error detection and user-friendly messages
- **Files to Check**:
  - `lib/database.ts` - All API calls
  - `app/(tabs)/index.tsx` - Data loading

### 9. **Offline Support**
- **Status**: ⚠️ Offline service exists but needs testing
- **Action**: Test app behavior when offline
- **Files**: `lib/offlineService.ts`

### 10. **Error Messages for Users**
- **Status**: ⚠️ Some errors only console.log
- **Action**: Ensure all errors show user-friendly messages
- **Priority**: Payment errors, order errors, auth errors

---

## 🔵 LOW PRIORITY - LEGAL & POLICIES

### 11. **Privacy Policy & Terms Links**
- **Status**: ✅ Documents exist but need to be linked in app
- **Action**: Add links to Privacy Policy and Terms in:
  - Settings screen
  - Onboarding flow
  - App footer (if exists)
  - Account deletion screen

**Files to Update**:
- `app/settings.tsx` - Add Privacy Policy and Terms links
- `app/(onboarding)/welcome.tsx` - Add links to legal docs

### 12. **Legal Contact Information**
- **Status**: ⚠️ Placeholder emails in legal documents
- **Action**: Update `TERMS_OF_SERVICE.md` and `PRIVACY_POLICY.md` with:
  - Real business address
  - Real contact email
  - Real phone number
  - Business registration number (if applicable)

---

## 🟣 CONFIGURATION - PRODUCTION SETUP

### 13. **Supabase Production Configuration**
- **Checklist**:
  - [ ] Production database URL configured
  - [ ] RLS policies tested and working
  - [ ] Storage buckets configured
  - [ ] API keys rotated (use production keys, not dev)
  - [ ] Database backups enabled
  - [ ] Rate limiting configured

### 14. **Stripe Production Configuration**
- **Checklist**:
  - [ ] Production Stripe keys configured
  - [ ] Webhook endpoints set up
  - [ ] Payment methods tested
  - [ ] Refund flow tested
  - [ ] PCI compliance verified

### 15. **Sentry Error Tracking**
- **Status**: ⚠️ Configured but needs DSN
- **Action**: 
  - [ ] Create Sentry account (or use alternative)
  - [ ] Add `EXPO_PUBLIC_SENTRY_DSN` to `.env`
  - [ ] Test error reporting
  - [ ] Set up alerts for critical errors

### 16. **Push Notifications**
- **Status**: ⚠️ Installed but not fully implemented
- **Action**:
  - [ ] Configure FCM (Firebase Cloud Messaging) for Android
  - [ ] Configure APNs for iOS
  - [ ] Test notification delivery
  - [ ] Set up notification categories

---

## 🟤 TESTING - MUST TEST BEFORE RELEASE

### 17. **Critical User Flows**
- [ ] **Sign Up**: User can create account
- [ ] **Sign In**: User can sign in
- [ ] **Browse Menu**: Products load correctly
- [ ] **Add to Cart**: Items add to cart
- [ ] **Checkout**: Checkout flow works
- [ ] **Payment**: Payment processing works
- [ ] **Order Placement**: Orders are created
- [ ] **Order Tracking**: Orders can be tracked
- [ ] **Profile**: User can update profile
- [ ] **Settings**: Settings save correctly

### 18. **Error Scenarios**
- [ ] **No Internet**: App handles offline gracefully
- [ ] **API Errors**: User sees friendly error messages
- [ ] **Payment Failures**: User sees clear error message
- [ ] **Empty States**: All empty states display correctly
- [ ] **Invalid Data**: App handles invalid inputs

### 19. **Platform-Specific Testing**
- [ ] **Android**: Test on multiple Android versions
- [ ] **iOS**: Test on multiple iOS versions (if applicable)
- [ ] **Permissions**: Location, camera, notifications permissions
- [ ] **Deep Links**: Test app links/universal links
- [ ] **Background**: App behavior in background

---

## 🟡 PLAY STORE REQUIREMENTS

### 20. **App Store Listing Requirements**
- **App Name**: Must be unique, max 50 characters
- **Short Description**: Max 80 characters
- **Full Description**: Max 4000 characters
- **Screenshots**: 
  - Phone: At least 2 screenshots
  - Tablet: At least 2 screenshots (if supported)
- **Feature Graphic**: 1024x500px
- **App Icon**: 512x512px (high-res icon)

### 21. **Content Rating**
- **Action**: Complete content rating questionnaire
- **Categories**: Food & Drink, Shopping
- **Age Rating**: Likely 3+ or Everyone

### 22. **Privacy Policy URL**
- **Status**: ✅ Document exists
- **Action**: 
  - Host Privacy Policy online (GitHub Pages, your website, etc.)
  - Add URL to Play Store listing
  - Ensure URL is accessible without login

### 23. **Data Safety Section**
- **Required Information**:
  - Types of data collected
  - How data is used
  - Data sharing practices
  - Data security measures
  - User rights

### 24. **App Permissions**
- **Required Permissions**:
  - [ ] Location (for delivery)
  - [ ] Camera (for profile photos)
  - [ ] Notifications (for order updates)
  - [ ] Storage (for caching)
- **Action**: Justify each permission in Play Store listing

---

## 🔴 CRITICAL CODE FIXES

### 25. **Remove Console.logs in Production**
- **Status**: ⚠️ Many console.log statements throughout code
- **Action**: 
  - Remove or wrap in `if (__DEV__)` checks
  - Use proper logging service for production

### 26. **Remove Debug Code**
- **Action**: Search for:
  - `console.log`
  - `console.error` (keep critical ones, remove debug ones)
  - `alert()` calls
  - `debugger` statements
  - Test data

### 27. **Remove Test/Development Routes**
- **Action**: Ensure no test routes are accessible in production
- **Check**: `app/_layout.tsx` for any dev-only routes

---

## 🟢 OPTIMIZATION - PERFORMANCE

### 28. **Image Optimization**
- **Status**: ⚠️ Some images may be too large
- **Action**:
  - Optimize all images
  - Use WebP format where possible
  - Implement lazy loading
  - Add image caching

### 29. **Code Splitting**
- **Action**: Ensure large components are lazy-loaded
- **Check**: Admin dashboard routes (shouldn't be in mobile app bundle)

### 30. **Bundle Size**
- **Action**: 
  - Check bundle size (should be < 50MB for initial download)
  - Remove unused dependencies
  - Use tree-shaking

---

## 📝 DOCUMENTATION

### 31. **README.md Updates**
- **Action**: Update README with:
  - Installation instructions
  - Environment variable setup
  - Build instructions
  - Known issues
  - Contact information

### 32. **CHANGELOG.md**
- **Action**: Create changelog documenting:
  - Version history
  - Features added
  - Bug fixes
  - Breaking changes

---

## 🔐 SECURITY

### 33. **API Keys Security**
- **Action**: 
  - [ ] Never commit `.env` file
  - [ ] Use environment variables only
  - [ ] Rotate all API keys before release
  - [ ] Use production keys (not dev/test keys)

### 34. **Data Encryption**
- **Status**: ✅ Supabase handles encryption
- **Action**: Verify sensitive data is encrypted at rest

### 35. **Authentication Security**
- **Action**: 
  - [ ] Test password requirements
  - [ ] Test account lockout after failed attempts
  - [ ] Verify session management
  - [ ] Test token refresh

---

## 📱 APP CONFIGURATION

### 36. **Version Number**
- **Current**: `1.0.0` in `app.json` and `package.json`
- **Action**: Set appropriate version for initial release
- **Note**: Increment for each Play Store submission

### 37. **Build Number**
- **Action**: Set build number for Android
- **Location**: `app.json` → `android.versionCode`

### 38. **Orientation**
- **Current**: `"orientation": "portrait"`
- **Action**: Verify this is correct for your app

### 39. **Permissions in AndroidManifest**
- **Action**: Verify all required permissions are declared
- **Check**: Location, Camera, Notifications, Internet

---

## 🎨 BRANDING

### 40. **App Colors**
- **Current**: Primary color `#FF6B6B` (hardcoded in multiple places)
- **Action**: 
  - Ensure colors match your brand
  - Update in `lib/designSystem.ts`
  - Update in `app.json` (splash screen background)

### 41. **App Name Consistency**
- **Action**: Ensure app name is consistent everywhere:
  - `app.json` → name
  - App title bars
  - Play Store listing
  - All user-facing text

---

## 🚨 KNOWN ISSUES TO FIX

### 42. **Special Offers Route**
- **Issue**: `special-offer-details` route doesn't exist
- **Fix**: Create route or redirect to `promotion-detail`

### 43. **Category Filtering**
- **Issue**: Category filtering might not work correctly
- **Action**: Test category filtering thoroughly

### 44. **Restaurant Selection**
- **Issue**: Restaurant selection might not persist correctly
- **Action**: Test restaurant switching flow

---

## ✅ FINAL CHECKLIST

Before building APK:
- [ ] All missing routes created
- [ ] All hardcoded content replaced with real data
- [ ] All environment variables configured
- [ ] All legal documents updated and linked
- [ ] All error handling tested
- [ ] All critical flows tested
- [ ] App icons and splash screens are branded
- [ ] Bundle size is acceptable
- [ ] No console.logs in production code
- [ ] Privacy Policy hosted online
- [ ] Terms of Service hosted online
- [ ] App permissions justified
- [ ] Content rating completed
- [ ] All API keys are production keys
- [ ] All test data removed

---

## 📞 SUPPORT CONTACT

Before release, ensure:
- [ ] Support email is real and monitored
- [ ] Support phone number is real
- [ ] Business address is real
- [ ] Response time SLA is defined

---

## 🎯 PRIORITY ORDER

1. **CRITICAL** (Must fix before release):
   - Missing routes
   - Environment variables
   - App crash on startup

2. **HIGH** (Should fix before release):
   - Hardcoded content
   - Error handling
   - Legal documents

3. **MEDIUM** (Nice to have):
   - Performance optimization
   - Analytics setup
   - Advanced features

4. **LOW** (Can be post-release):
   - Minor UI improvements
   - Additional features
   - Analytics enhancements

---

## 📋 QUICK FIX SUMMARY

### Immediate Actions (15 minutes):
1. Create `app/special-offer-details.tsx` or fix route reference
2. Create `.env` file with all required variables
3. Update app name in `app.json`
4. Update bundle identifier in `app.json`

### Before First Build (1 hour):
1. Replace all hardcoded restaurant information
2. Update all email addresses
3. Add Privacy Policy and Terms links to app
4. Remove console.logs or wrap in `__DEV__` checks
5. Test all critical user flows

### Before Play Store Submission (2-4 hours):
1. Test on multiple devices
2. Complete Play Store listing
3. Host Privacy Policy and Terms online
4. Take screenshots
5. Write app description
6. Complete content rating

---

**Last Updated**: January 2025
**Status**: Pre-Release Checklist

