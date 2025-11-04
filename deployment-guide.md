# App Deployment Guide

## 1. APP STORE PREPARATION

### iOS App Store (Apple)
1. **Apple Developer Account** ($99/year)
   - Register at developer.apple.com
   - Create App ID
   - Generate certificates and provisioning profiles

2. **App Store Connect**
   - Create app listing
   - Add screenshots, description, keywords
   - Set pricing and availability
   - Submit for review

### Google Play Store (Android)
1. **Google Play Console** ($25 one-time fee)
   - Create developer account
   - Create app listing
   - Upload APK/AAB
   - Set up store listing

## 2. BUILD CONFIGURATION

### Environment Variables
```bash
# Production environment
EXPO_PUBLIC_API_URL=https://your-api.com
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### App Configuration
```json
// app.json
{
  "expo": {
    "name": "MustiApp",
    "slug": "mustiapp",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "bundleIdentifier": "com.yourcompany.mustiapp",
      "buildNumber": "1"
    },
    "android": {
      "package": "com.yourcompany.mustiapp",
      "versionCode": 1
    }
  }
}
```

## 3. DEPLOYMENT OPTIONS

### Option A: Expo Application Services (EAS)
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

### Option B: Manual Build
```bash
# Generate native code
expo run:ios
expo run:android

# Build with Xcode/Android Studio
# Upload to respective stores
```

## 4. MONITORING & ANALYTICS

### Crash Reporting
- Sentry
- Bugsnag
- Firebase Crashlytics

### Analytics
- Google Analytics
- Mixpanel
- Amplitude

### Performance Monitoring
- Firebase Performance
- New Relic
- AppDynamics
```

## 5. LEGAL REQUIREMENTS

### Privacy Policy
- Data collection practices
- Third-party services
- User rights
- Contact information

### Terms of Service
- User responsibilities
- Service limitations
- Dispute resolution
- Payment terms

### GDPR Compliance (EU)
- Data processing consent
- Right to deletion
- Data portability
- Privacy by design
