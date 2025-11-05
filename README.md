# Musti Place - Food Delivery App

A comprehensive food delivery application built with React Native, Expo, and Supabase.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- Supabase account
- Stripe account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mustiapp
   ```

2. **Install dependencies**
```bash
npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```
   
   Then fill in your actual values:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   EXPO_PUBLIC_SENTRY_DSN=your_sentry_dsn (optional)
   EXPO_PUBLIC_APP_NAME=Your App Name
   EXPO_PUBLIC_SUPPORT_EMAIL=support@yourapp.com
   EXPO_PUBLIC_PRIVACY_POLICY_URL=https://your-website.com/privacy-policy
   EXPO_PUBLIC_TERMS_OF_SERVICE_URL=https://your-website.com/terms-of-service
   ```

4. **Set up Supabase Database**
   
   - Run all migrations in `supabase/migrations/` in order
   - Configure Row Level Security (RLS) policies
   - Set up storage buckets for images
   - Configure API keys

5. **Start the development server**
   ```bash
   npm start
   ```

## 📱 Building for Production

### Android APK

```bash
# Build APK
eas build --platform android --profile production

# Or build locally
npx expo run:android --variant release
```

### iOS App

```bash
# Build iOS app
eas build --platform ios --profile production

# Or build locally
npx expo run:ios --configuration Release
```

## 🔧 Configuration

### App Configuration

Update `app.json` with your app details:
- `name`: Your app name
- `slug`: Your app slug
- `bundleIdentifier` (iOS): Your unique bundle ID
- `package` (Android): Your unique package name
- `version`: Current version number

### Environment Variables

Required environment variables:
- `EXPO_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key

Optional environment variables:
- `EXPO_PUBLIC_SENTRY_DSN`: Sentry DSN for error tracking
- `EXPO_PUBLIC_PRIVACY_POLICY_URL`: URL to your Privacy Policy
- `EXPO_PUBLIC_TERMS_OF_SERVICE_URL`: URL to your Terms of Service

## 📁 Project Structure

```
mustiapp/
├── app/                    # App screens and routes
│   ├── (tabs)/            # Tab navigation screens
│   ├── (auth)/            # Authentication screens
│   └── (onboarding)/      # Onboarding screens
├── components/            # Reusable components
├── lib/                   # Utilities and helpers
│   ├── database.ts       # Database functions
│   ├── supabase.ts       # Supabase client
│   └── stripe.ts         # Stripe integration
├── store/                 # State management (Zustand)
├── supabase/
│   └── migrations/       # Database migrations
├── assets/               # Images, fonts, etc.
└── admin-dashboard/      # Admin panel (Next.js)
```

## 🗄️ Database Setup

### Running Migrations

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run migrations in order from `supabase/migrations/`

### Key Tables

- `restaurants` - Restaurant information
- `menu_items` - Menu items/products
- `categories` - Product categories
- `orders` - Customer orders
- `order_items` - Items in each order
- `special_offers` - Special offers and combos
- `loyalty_points` - Loyalty program points
- `rewards` - Available rewards
- `user_profiles` - User profiles

## 🔐 Security

- Never commit `.env` file
- Use production API keys only in production
- Rotate keys regularly
- Enable RLS policies in Supabase
- Use HTTPS for all API calls

## 📦 Dependencies

Key dependencies:
- `expo` - Expo framework
- `expo-router` - File-based routing
- `@supabase/supabase-js` - Supabase client
- `@stripe/stripe-react-native` - Stripe payments
- `zustand` - State management
- `react-native` - React Native core

## 🚀 Deployment

### EAS Build

1. Install EAS CLI: `npm install -g eas-cli`
2. Login: `eas login`
3. Configure: `eas build:configure`
4. Build: `eas build --platform android` or `eas build --platform ios`

### Play Store / App Store

1. Build production APK/IPA
2. Upload to Play Store Console / App Store Connect
3. Fill in store listing information
4. Submit for review

## 📝 Pre-Release Checklist

Before building for production:

- [ ] All environment variables configured
- [ ] Hardcoded content replaced
- [ ] Console.logs wrapped in `__DEV__` checks
- [ ] Privacy Policy and Terms URLs set
- [ ] App icons and splash screens updated
- [ ] Bundle ID/Package name is unique
- [ ] All routes tested
- [ ] Error handling tested
- [ ] Network errors handled gracefully
- [ ] Legal documents hosted online

See `PRE_RELEASE_CHECKLIST.md` for complete checklist.

## 🐛 Troubleshooting

### Build Errors

- Clear cache: `npx expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check environment variables are set

### Database Errors

- Verify Supabase connection
- Check RLS policies
- Ensure migrations are run

### Payment Errors

- Verify Stripe keys
- Check webhook configuration
- Test with Stripe test cards

## 📄 License

[Your License Here]

## 📞 Support

For support, email support@yourapp.com or open an issue in the repository.

## 🙏 Acknowledgments

Built with Expo, React Native, and Supabase.
