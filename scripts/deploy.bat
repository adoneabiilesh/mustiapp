@echo off
REM 🚀 MustiApp Admin Dashboard Deployment Script for Windows
REM This script helps you deploy your admin dashboard to GitHub and Vercel

echo 🚀 Starting MustiApp Admin Dashboard Deployment...

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Git is not installed. Please install Git first.
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo [SUCCESS] Prerequisites check passed

REM Step 1: Initialize Git (if not already done)
if not exist ".git" (
    echo [INFO] Initializing Git repository...
    git init
    echo [SUCCESS] Git repository initialized
) else (
    echo [INFO] Git repository already exists
)

REM Step 2: Add all files to git
echo [INFO] Adding files to Git...
git add .

REM Step 3: Commit changes
echo [INFO] Committing changes...
git commit -m "Initial commit: Admin dashboard with addon management

Features:
- Product management with addon assignment
- Order management
- Customer management
- Promotion system
- Real-time database sync
- Modern responsive UI"

echo [SUCCESS] Changes committed to Git

REM Step 4: GitHub setup instructions
echo.
echo [INFO] 📋 GitHub Setup Instructions:
echo 1. Go to https://github.com/new
echo 2. Repository name: mustiapp-admin-dashboard
echo 3. Description: Admin Dashboard for MustiApp Food Delivery
echo 4. Set to Public (for free Vercel deployment)
echo 5. Don't initialize with README
echo 6. Click 'Create repository'
echo.
pause

REM Get repository URL
set /p REPO_URL="Enter your GitHub repository URL (e.g., https://github.com/username/mustiapp-admin-dashboard.git): "

if "%REPO_URL%"=="" (
    echo [ERROR] Repository URL is required
    pause
    exit /b 1
)

REM Step 5: Add remote origin
echo [INFO] Adding remote origin...
git remote add origin %REPO_URL%

REM Step 6: Push to GitHub
echo [INFO] Pushing to GitHub...
git branch -M main
git push -u origin main

echo [SUCCESS] Code pushed to GitHub successfully!

REM Step 7: Vercel setup instructions
echo.
echo [INFO] 🌐 Vercel Deployment Instructions:
echo 1. Go to https://vercel.com
echo 2. Sign up/Login with GitHub
echo 3. Click 'New Project'
echo 4. Import your 'mustiapp-admin-dashboard' repository
echo 5. Click 'Import'
echo.
echo [WARNING] IMPORTANT: Configure these environment variables in Vercel:
echo.
echo NEXT_PUBLIC_SUPABASE_URL=https://imoettikktqagjpwibtt.supabase.co
echo NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
echo SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
echo.
pause

REM Step 8: Final instructions
echo.
echo [SUCCESS] 🎉 Deployment Setup Complete!
echo.
echo [INFO] Next Steps:
echo 1. ✅ GitHub repository created and code pushed
echo 2. ✅ Vercel project imported
echo 3. ⏳ Configure environment variables in Vercel
echo 4. ⏳ Deploy your project
echo 5. ⏳ Test your admin dashboard
echo.
echo [INFO] Your admin dashboard will be available at:
echo https://your-project-name.vercel.app
echo.
echo [INFO] For detailed instructions, see DEPLOYMENT_GUIDE.md
echo.
echo [SUCCESS] Happy coding! 🚀
pause
