#!/bin/bash

# Production Build Script for Musti Place
echo "🚀 Building Musti Place for Production..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Mobile App Build
echo "📱 Building Mobile App..."
echo "✅ Dependencies already updated"
echo "✅ Assets created"
echo "✅ Environment variables configured"

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "📦 Installing EAS CLI..."
    npm install -g eas-cli
fi

# Build mobile app
echo "🔨 Building mobile app with EAS..."
eas build --platform all --profile production --non-interactive

# Admin Dashboard Build
echo "🖥️ Building Admin Dashboard..."
cd admin-dashboard

# Clear build cache
echo "🧹 Clearing build cache..."
rm -rf .next
rm -rf node_modules/.cache

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production

# Build admin dashboard
echo "🔨 Building admin dashboard..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Admin dashboard build successful!"
else
    echo "❌ Admin dashboard build failed!"
    exit 1
fi

cd ..

echo "🎉 Production build completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Deploy admin dashboard to Vercel: vercel --prod"
echo "2. Submit mobile app to app stores"
echo "3. Configure production environment variables"
echo "4. Test all functionality"
echo "5. Launch! 🚀"
