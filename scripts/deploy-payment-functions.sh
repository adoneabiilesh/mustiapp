#!/bin/bash

# Deploy Payment Edge Functions to Supabase
echo "🚀 Deploying Payment Edge Functions to Supabase..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Check if user is logged in
if ! supabase status &> /dev/null; then
    echo "❌ Not logged in to Supabase. Please run: supabase login"
    exit 1
fi

# Deploy create-payment-intent function
echo "📦 Deploying create-payment-intent function..."
supabase functions deploy create-payment-intent --project-ref $SUPABASE_PROJECT_REF

# Deploy create-payment-method function
echo "📦 Deploying create-payment-method function..."
supabase functions deploy create-payment-method --project-ref $SUPABASE_PROJECT_REF

# Deploy confirm-payment-intent function
echo "📦 Deploying confirm-payment-intent function..."
supabase functions deploy confirm-payment-intent --project-ref $SUPABASE_PROJECT_REF

# Deploy stripe-webhook function (if exists)
if [ -f "scripts/supabase-edge-functions/stripe-webhook/index.ts" ]; then
    echo "📦 Deploying stripe-webhook function..."
    supabase functions deploy stripe-webhook --project-ref $SUPABASE_PROJECT_REF
fi

echo "✅ All payment functions deployed successfully!"
echo ""
echo "🔧 Next steps:"
echo "1. Set up your Stripe webhook endpoint in Stripe Dashboard"
echo "2. Add the webhook URL to your Stripe account"
echo "3. Test the payment functions"
echo ""
echo "📚 Documentation: https://supabase.com/docs/guides/functions"



