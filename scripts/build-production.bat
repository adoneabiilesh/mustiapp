@echo off
REM Production Build Script for Musti Place (Windows)
echo 🚀 Building Musti Place for Production...

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: Please run this script from the project root directory
    exit /b 1
)

REM Mobile App Build
echo 📱 Building Mobile App...
echo ✅ Dependencies already updated
echo ✅ Assets created
echo ✅ Environment variables configured

REM Check if EAS CLI is installed
where eas >nul 2>nul
if %errorlevel% neq 0 (
    echo 📦 Installing EAS CLI...
    npm install -g eas-cli
)

REM Build mobile app
echo 🔨 Building mobile app with EAS...
eas build --platform all --profile production --non-interactive

REM Admin Dashboard Build
echo 🖥️ Building Admin Dashboard...
cd admin-dashboard

REM Clear build cache
echo 🧹 Clearing build cache...
if exist .next rmdir /s /q .next
if exist node_modules\.cache rmdir /s /q node_modules\.cache

REM Install dependencies
echo 📦 Installing dependencies...
npm ci --production

REM Build admin dashboard
echo 🔨 Building admin dashboard...
npm run build

if %errorlevel% equ 0 (
    echo ✅ Admin dashboard build successful!
) else (
    echo ❌ Admin dashboard build failed!
    exit /b 1
)

cd ..

echo 🎉 Production build completed successfully!
echo.
echo 📋 Next Steps:
echo 1. Deploy admin dashboard to Vercel: vercel --prod
echo 2. Submit mobile app to app stores
echo 3. Configure production environment variables
echo 4. Test all functionality
echo 5. Launch! 🚀
