#!/bin/bash

# Deploy Supabase Edge Functions for MustiApp
# Make sure you have Supabase CLI installed: npm i -g supabase

echo "🚀 Deploying Supabase Edge Functions..."

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Install it with: npm i -g supabase"
    exit 1
fi

# Link to your Supabase project (if not already linked)
echo "📡 Linking to Supabase project..."
# supabase link --project-ref your-project-ref

# Deploy create-payment-intent function
echo "📦 Deploying create-payment-intent function..."
supabase functions deploy create-payment-intent \
  --project-ref your-project-ref

# Deploy stripe-webhook function
echo "📦 Deploying stripe-webhook function..."
supabase functions deploy stripe-webhook \
  --project-ref your-project-ref

# Set secrets
echo "🔐 Setting function secrets..."
supabase secrets set STRIPE_SECRET_KEY=your-stripe-secret-key
supabase secrets set STRIPE_WEBHOOK_SECRET=your-webhook-secret

echo "✅ Edge functions deployed successfully!"
echo ""
echo "Next steps:"
echo "1. Update Stripe webhook URL in Stripe dashboard:"
echo "   https://your-project-ref.supabase.co/functions/v1/stripe-webhook"
echo "2. Test payment flow in your mobile app"
echo "3. Monitor function logs: supabase functions logs create-payment-intent"



