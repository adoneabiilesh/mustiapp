<div align="center">
  <br />
  <h1>🍔 Musti Place - Food Delivery Platform</h1>
  
  <div>
    <img src="https://img.shields.io/badge/-React_Native-black?style=for-the-badge&logoColor=white&logo=react&color=61DAFB" alt="React Native" />
    <img src="https://img.shields.io/badge/-Expo-black?style=for-the-badge&logoColor=white&logo=expo&color=000020" alt="Expo" />
    <img src="https://img.shields.io/badge/-Supabase-black?style=for-the-badge&logoColor=white&logo=supabase&color=3ECF8E" alt="Supabase" />
    <img src="https://img.shields.io/badge/-Tailwind-black?style=for-the-badge&logoColor=white&logo=tailwindcss&color=06B6D4" alt="Tailwind" />
    <img src="https://img.shields.io/badge/-TypeScript-black?style=for-the-badge&logoColor=white&logo=typescript&color=3178C6" alt="TypeScript" />
  </div>

  <p align="center">
    <strong>A modern food delivery mobile app + admin dashboard</strong><br />
    Built with React Native, Supabase, and TypeScript
  </p>
</div>

---

## 📋 Table of Contents

1. [Introduction](#introduction)
2. [Tech Stack](#tech-stack)
3. [Features](#features)
4. [Quick Start](#quick-start)
5. [Project Structure](#project-structure)
6. [Documentation](#documentation)

---

## 🤖 Introduction

**Musti Place** is a complete food delivery platform with:
- **Mobile App** (React Native) - For customers to browse menu, order food, track delivery
- **Admin Dashboard** (Next.js) - For restaurant owners to manage orders, menu, analytics
- **Shared Database** (Supabase PostgreSQL) - Real-time sync between mobile & admin

Perfect architecture for a production food delivery business!

---

## ⚙️ Tech Stack

### Mobile App
- **[React Native 0.79.5](https://reactnative.dev/)** - Cross-platform mobile framework
- **[Expo 53](https://expo.dev/)** - Development platform with file-based routing
- **[NativeWind 4](https://www.nativewind.dev/)** - Tailwind CSS for React Native
- **[TypeScript 5.8](https://www.typescriptlang.org/)** - Type-safe development

### Backend & Database
- **[Supabase](https://supabase.com/)** - PostgreSQL database + Auth + Real-time + Storage
- **PostgreSQL** - Powerful relational database with JSON support
- **Row Level Security** - Database-level permissions and access control

### State & Tools
- **[Zustand 5](https://github.com/pmndrs/zustand)** - Lightweight state management
- **[Sentry](https://sentry.io/)** - Error tracking and monitoring
- **[Expo Router 5](https://docs.expo.dev/router/)** - File-based routing

---

## 🔋 Features

### ✅ Mobile App Features

**Authentication:**
- Email/Password signup & login
- Persistent sessions with AsyncStorage
- Secure password handling

**Browse & Search:**
- View menu items with images
- Filter by categories (Burgers, Pizzas, etc.)
- Search by name
- Real-time menu updates

**Shopping Cart:**
- Add/remove items
- Adjust quantities
- Handle customizations (toppings, sizes, etc.)
- Calculate totals with delivery fees

**Orders:**
- Place orders with delivery address
- View order history
- Track order status (draft → confirmed → preparing → delivery → delivered)
- Real-time order updates

**Profile:**
- View user information
- Edit profile details
- Sign out

### ✅ Admin Dashboard Features

**Dashboard Overview:**
- Total orders, pending, preparing, out for delivery stats
- Revenue tracking
- Real-time order updates
- Today's performance metrics

**Order Management:**
- View all orders with customer details
- Update order status with one click
- Filter by status
- Real-time notifications of new orders

**Shared Database:**
- Mobile app and admin dashboard use same PostgreSQL database
- Changes sync instantly via Supabase real-time
- Row Level Security ensures proper access control

---

## 🤸 Quick Start

### Prerequisites

- **Node.js 18+** and npm
- **Expo Go** app on your phone
- **Supabase account** (free tier available)

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Create .env file
cp .env.example .env
# Then add your Supabase URL and anon key

# 3. Set up Supabase
# - Create project at supabase.com
# - Run SQL from scripts/create-supabase-schema.sql
# - Add sample data: npm run supabase:seed

# 4. Start the app
npx expo start
```

### Detailed Setup

For complete setup instructions, see **[SETUP_GUIDE.md](SETUP_GUIDE.md)**

---

## 📱 Project Structure

```
mustiapp/
├── app/                      # Expo Router pages
│   ├── (auth)/              # Authentication screens
│   │   ├── sign-in.tsx
│   │   └── sign-up.tsx
│   ├── (tabs)/              # Main app tabs
│   │   ├── index.tsx        # Home/Browse
│   │   ├── search.tsx       # Search & filters
│   │   ├── cart.tsx         # Shopping cart
│   │   ├── orders.tsx       # Order history
│   │   ├── profile.tsx      # User profile
│   │   └── dashboard.tsx    # Admin dashboard
│   └── _layout.tsx          # Root layout
├── components/              # Reusable components
│   ├── CartButton.tsx
│   ├── CustomButton.tsx
│   ├── CustomInput.tsx
│   ├── MenuCard.tsx
│   └── ...
├── lib/                     # Core libraries
│   ├── supabase.ts         # Supabase client & functions
│   └── useAppwrite.ts      # Generic data fetching hook
├── store/                   # Zustand state management
│   ├── auth.store.ts       # Authentication state
│   └── cart.store.ts       # Shopping cart state
├── scripts/                 # Database & seed scripts
│   ├── create-supabase-schema.sql  # Database schema
│   └── seed-supabase.js            # Seed sample data
├── constants/              # App constants & assets
├── assets/                 # Images, icons, fonts
└── type.d.ts              # TypeScript types
```

---

## 📚 Documentation

Comprehensive guides for setup and development:

| Document | Purpose |
|----------|---------|
| **[SETUP_GUIDE.md](SETUP_GUIDE.md)** | Complete setup instructions for Supabase & mobile app |
| **[CONFIGURATION_CHECKLIST.md](CONFIGURATION_CHECKLIST.md)** | Step-by-step checklist to track your progress |
| **[QUICK_START.md](QUICK_START.md)** | Fast 3-step getting started guide |
| **[TEST_REPORT.md](TEST_REPORT.md)** | Technical details of what was fixed |

---

## 🔑 Key Features for Production

### Why Supabase?

**Perfect for Food Delivery Platform:**
- ✅ **PostgreSQL** - Real SQL database, complex queries, joins, aggregations
- ✅ **Real-time** - Orders sync instantly between customer app & admin dashboard
- ✅ **Row Level Security** - Customers see only their orders, admins see all
- ✅ **Auth Built-in** - Email/password, OAuth, magic links ready
- ✅ **Storage** - Upload menu images, user avatars
- ✅ **Functions** - Write business logic in PostgreSQL or Edge Functions
- ✅ **Admin API** - Build powerful admin dashboards with ease

### Architecture Benefits

```
┌─────────────────────────────────────────────────┐
│            Supabase PostgreSQL                   │
│     (Single Source of Truth)                     │
│  - users, menu_items, orders, order_items       │
│  - Real-time subscriptions                       │
│  - Row Level Security                            │
└──────────────┬────────────────┬─────────────────┘
               │                │
        ┌──────▼─────┐   ┌──────▼──────┐
        │ Mobile App │   │   Admin     │
        │  (Expo)    │   │ Dashboard   │
        │            │   │  (Next.js)  │
        └────────────┘   └─────────────┘
         Customers         Restaurant Staff
```

**Benefits:**
- Changes in admin dashboard appear instantly in mobile app
- Complex reporting queries for analytics
- Flexible permissions via Row Level Security
- Easy to add features (reviews, ratings, loyalty points, etc.)

---

## 🚀 What's Included

### ✅ Ready to Use
- Full authentication flow
- Menu browsing with categories
- Shopping cart with customizations
- Order placement & tracking
- Real-time order updates
- Admin dashboard for order management
- TypeScript throughout
- Error tracking with Sentry
- Beautiful UI with NativeWind

### 🔜 Easy to Add
- Payment integration (Stripe)
- Push notifications (Expo Notifications)
- Google Maps for delivery tracking
- User reviews & ratings
- Loyalty program
- Promotional codes
- Multi-restaurant support
- Analytics dashboard

---

## 📝 Environment Variables

Create a `.env` file:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Sentry (Optional)
SENTRY_DSN=your-sentry-dsn
```

Get these from:
1. **Supabase** → [supabase.com/dashboard](https://supabase.com/dashboard) → Project Settings → API
2. **Sentry** → [sentry.io](https://sentry.io/) → Project Settings

---

## 🧪 Testing

```bash
# Run TypeScript check
npx tsc --noEmit

# Seed database with sample data
npm run supabase:seed

# Test Supabase connection
npm run supabase:test
```

---

## 🎯 Deployment

### Mobile App (Expo)

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

### Admin Dashboard

Deploy to Vercel, Netlify, or any Node.js hosting.

---

## 🤝 Contributing

This is a template/starter project. Feel free to:
- Fork and customize for your business
- Add features and improvements
- Use for learning React Native + Supabase

---

## 📄 License

MIT License - Use freely for personal or commercial projects

---

## 💡 Support

- **Issues:** Open a GitHub issue
- **Questions:** Check the documentation files
- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)
- **Expo Docs:** [docs.expo.dev](https://docs.expo.dev)

---

<div align="center">
  <p><strong>Built with ❤️ using React Native & Supabase</strong></p>
  <p>Ready for production • Fully documented • TypeScript</p>
</div>
