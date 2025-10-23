# PowerShell script to deploy Supabase Edge Functions
# Run this script from the project root directory

Write-Host "🚀 Deploying Supabase Edge Functions..." -ForegroundColor Green

# Check if Supabase CLI is installed
try {
    $supabaseVersion = supabase --version
    Write-Host "✅ Supabase CLI found: $supabaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI is not installed. Please install it first:" -ForegroundColor Red
    Write-Host "npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

# Check if user is logged in
try {
    supabase status | Out-Null
    Write-Host "✅ Logged in to Supabase" -ForegroundColor Green
} catch {
    Write-Host "❌ Not logged in to Supabase. Please run: supabase login" -ForegroundColor Red
    exit 1
}

# Get project reference
$projectRef = Read-Host "Enter your Supabase project reference (e.g., abcdefghijklmnop)"

if ([string]::IsNullOrWhiteSpace($projectRef)) {
    Write-Host "❌ Project reference is required" -ForegroundColor Red
    exit 1
}

# Deploy create-payment-intent function
Write-Host "📦 Deploying create-payment-intent function..." -ForegroundColor Yellow
try {
    supabase functions deploy create-payment-intent --project-ref $projectRef
    Write-Host "✅ create-payment-intent deployed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to deploy create-payment-intent" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# Deploy create-payment-method function
Write-Host "📦 Deploying create-payment-method function..." -ForegroundColor Yellow
try {
    supabase functions deploy create-payment-method --project-ref $projectRef
    Write-Host "✅ create-payment-method deployed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to deploy create-payment-method" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# Deploy confirm-payment-intent function
Write-Host "📦 Deploying confirm-payment-intent function..." -ForegroundColor Yellow
try {
    supabase functions deploy confirm-payment-intent --project-ref $projectRef
    Write-Host "✅ confirm-payment-intent deployed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to deploy confirm-payment-intent" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# Deploy stripe-webhook function (if exists)
if (Test-Path "scripts/supabase-edge-functions/stripe-webhook/index.ts") {
    Write-Host "📦 Deploying stripe-webhook function..." -ForegroundColor Yellow
    try {
        supabase functions deploy stripe-webhook --project-ref $projectRef
        Write-Host "✅ stripe-webhook deployed successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to deploy stripe-webhook" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎉 Deployment completed!" -ForegroundColor Green
Write-Host ""
Write-Host "🔧 Next steps:" -ForegroundColor Cyan
Write-Host "1. Set up your Stripe webhook endpoint in Stripe Dashboard" -ForegroundColor White
Write-Host "2. Add the webhook URL to your Stripe account" -ForegroundColor White
Write-Host "3. Test the payment functions" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentation: https://supabase.com/docs/guides/functions" -ForegroundColor Blue



