#!/bin/bash

# 🚀 MustiApp Admin Dashboard Deployment Script
# This script helps you deploy your admin dashboard to GitHub and Vercel

echo "🚀 Starting MustiApp Admin Dashboard Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if git is installed
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install Git first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_status "✅ Prerequisites check passed"

# Step 1: Initialize Git (if not already done)
if [ ! -d ".git" ]; then
    print_status "Initializing Git repository..."
    git init
    print_success "Git repository initialized"
else
    print_status "Git repository already exists"
fi

# Step 2: Add all files to git
print_status "Adding files to Git..."
git add .

# Step 3: Commit changes
print_status "Committing changes..."
git commit -m "Initial commit: Admin dashboard with addon management

Features:
- Product management with addon assignment
- Order management
- Customer management
- Promotion system
- Real-time database sync
- Modern responsive UI"

print_success "Changes committed to Git"

# Step 4: GitHub setup
echo ""
print_status "📋 GitHub Setup Instructions:"
echo "1. Go to https://github.com/new"
echo "2. Repository name: mustiapp-admin-dashboard"
echo "3. Description: Admin Dashboard for MustiApp Food Delivery"
echo "4. Set to Public (for free Vercel deployment)"
echo "5. Don't initialize with README"
echo "6. Click 'Create repository'"
echo ""
read -p "Press Enter after creating the GitHub repository..."

# Get repository URL
read -p "Enter your GitHub repository URL (e.g., https://github.com/username/mustiapp-admin-dashboard.git): " REPO_URL

if [ -z "$REPO_URL" ]; then
    print_error "Repository URL is required"
    exit 1
fi

# Step 5: Add remote origin
print_status "Adding remote origin..."
git remote add origin $REPO_URL

# Step 6: Push to GitHub
print_status "Pushing to GitHub..."
git branch -M main
git push -u origin main

print_success "Code pushed to GitHub successfully!"

# Step 7: Vercel setup instructions
echo ""
print_status "🌐 Vercel Deployment Instructions:"
echo "1. Go to https://vercel.com"
echo "2. Sign up/Login with GitHub"
echo "3. Click 'New Project'"
echo "4. Import your 'mustiapp-admin-dashboard' repository"
echo "5. Click 'Import'"
echo ""
print_warning "IMPORTANT: Configure these environment variables in Vercel:"
echo ""
echo "NEXT_PUBLIC_SUPABASE_URL=https://imoettikktqagjpwibtt.supabase.co"
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key"
echo "SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key"
echo ""
read -p "Press Enter after setting up Vercel..."

# Step 8: Final instructions
echo ""
print_success "🎉 Deployment Setup Complete!"
echo ""
print_status "Next Steps:"
echo "1. ✅ GitHub repository created and code pushed"
echo "2. ✅ Vercel project imported"
echo "3. ⏳ Configure environment variables in Vercel"
echo "4. ⏳ Deploy your project"
echo "5. ⏳ Test your admin dashboard"
echo ""
print_status "Your admin dashboard will be available at:"
echo "https://your-project-name.vercel.app"
echo ""
print_status "For detailed instructions, see DEPLOYMENT_GUIDE.md"
echo ""
print_success "Happy coding! 🚀"
