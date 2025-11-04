# 🔐 Stripe Payment Integration Guide

## Overview
Your app now has **secure, PCI-compliant payment processing** through Stripe. Card details are never stored on your servers - they're tokenized by Stripe before being transmitted.

---

## 🚀 Setup Steps

### 1. Get Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Create an account or log in
3. Navigate to **Developers → API keys**
4. Copy your keys:
   - **Publishable key** (starts with `pk_`)
   - **Secret key** (starts with `sk_`)

**⚠️ IMPORTANT:** Use **test keys** (starts with `pk_test_` and `sk_test_`) during development.

---

### 2. Add Environment Variables

#### Mobile App (`.env`)
```env
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
```

#### Supabase Edge Function
1. Go to Supabase Dashboard → **Project Settings → Edge Functions**
2. Add secret:
   - Name: `STRIPE_SECRET_KEY`
   - Value: `sk_test_your_secret_key_here`

---

### 3. Run Database Migration

Run this SQL in your Supabase SQL Editor:

```bash
# Run the migration
supabase db push add-stripe-to-orders.sql
```

Or copy the contents of `add-stripe-to-orders.sql` and run it manually in the SQL Editor.

---

### 4. Deploy Supabase Edge Function

The payment intent creation function is already in `supabase/functions/create-payment-intent/`.

Deploy it:

```bash
supabase functions deploy create-payment-intent
```

---

## 🔒 Security Features

### ✅ What's Secure:
1. **PCI-DSS Compliant**: Stripe handles all card data
2. **Tokenization**: Card details are converted to tokens (e.g., `pm_1234567890`)
3. **3D Secure**: Automatic fraud prevention for high-value transactions
4. **No Card Storage**: Your database only stores:
   - Last 4 digits
   - Card brand (Visa, Mastercard, etc.)
   - Expiry date
   - Stripe token reference

### ⚠️ What You Still Need:
1. **SSL/TLS**: Ensure your app uses HTTPS in production
2. **Webhook Verification**: Verify Stripe webhook signatures (recommended for production)
3. **Fraud Detection**: Enable Stripe Radar in your dashboard

---

## 💳 Test Cards

Use these in development mode:

| Card Number         | Scenario                  |
|---------------------|---------------------------|
| 4242 4242 4242 4242 | ✅ Payment succeeds        |
| 4000 0000 0000 0002 | ❌ Payment declined        |
| 4000 0025 0000 3155 | 🔐 Requires 3D Secure     |
| 4000 0000 0000 9995 | 💸 Insufficient funds     |

- **Any future expiry date** (e.g., 12/25)
- **Any 3-digit CVV** (e.g., 123)

---

## 🎯 How It Works

### Payment Flow:

1. **User enters card details** → Stripe CardField (secure, pre-built UI)
2. **User clicks "Place Order"** → App sends card data to Stripe
3. **Stripe tokenizes card** → Returns `paymentMethod.id` (e.g., `pm_123456`)
4. **App calls Supabase function** → Creates payment intent with amount
5. **Supabase function calls Stripe** → Processes payment
6. **3D Secure (if needed)** → User authenticates via bank
7. **Payment succeeds** → Order is created in database
8. **User sees confirmation** → Navigation to order tracking

```
┌─────────────┐       ┌───────────┐       ┌──────────────┐       ┌──────────┐
│  Mobile App │──────▶│  Stripe   │──────▶│  Supabase    │──────▶│ Database │
│             │◀──────│  (Token)  │◀──────│  (Function)  │◀──────│          │
└─────────────┘       └───────────┘       └──────────────┘       └──────────┘
```

---

## 📱 User Experience

### Adding a Card:
1. User clicks "Add New Card" in checkout
2. Stripe CardField appears (secure input)
3. User enters card details
4. User checks "Save payment info" (optional)
5. User clicks "Save Card" or "Use Card"
6. Card is tokenized and saved to database

### Paying with Saved Card:
1. User selects saved card
2. User clicks "Place Order"
3. Payment is processed in the background
4. User sees order confirmation

### Cash on Delivery:
- Still available as an option
- No payment processing needed
- Order is created immediately

---

## 🔧 Troubleshooting

### "Invalid API Key"
- Check your `.env` file has the correct `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- Restart your dev server after adding env vars

### "Payment intent creation failed"
- Ensure Supabase edge function is deployed
- Check `STRIPE_SECRET_KEY` is set in Supabase dashboard
- Verify function URL is correct in `lib/stripe.tsx`

### "Could not find the 'stripe_payment_intent_id' column"
- Run the `add-stripe-to-orders.sql` migration

### Test card not working
- Ensure you're using **test keys** (pk_test_, sk_test_)
- Check Stripe dashboard logs for errors

---

## 🚀 Going to Production

### Before Launch:

1. **Switch to Live Keys:**
   - Replace `pk_test_` with `pk_live_`
   - Replace `sk_test_` with `sk_live_`

2. **Activate Stripe Account:**
   - Complete business verification in Stripe Dashboard
   - Add bank account for payouts

3. **Enable Stripe Radar:**
   - Fraud protection (included in Stripe fees)

4. **Set up Webhooks (Recommended):**
   - Listen for `payment_intent.succeeded` events
   - Update order status automatically

5. **Test in Production Mode:**
   - Make a small real transaction ($0.50)
   - Verify payment appears in Stripe Dashboard
   - Verify order is created correctly

6. **Review Stripe Pricing:**
   - 2.9% + $0.30 per successful card charge (US)
   - Check pricing for your country

---

## 📊 Monitoring

### Stripe Dashboard:
- View all payments
- Track disputes/chargebacks
- Monitor fraud attempts
- Download reports

### Your Database:
- Orders table has `stripe_payment_intent_id`
- Link orders to Stripe payments
- Reconcile transactions

---

## 💰 Pricing

Stripe charges:
- **2.9% + $0.30** per successful card charge (US)
- **No monthly fees**
- **No setup fees**
- **Automatic 3D Secure** (included)

Check your country's pricing: https://stripe.com/pricing

---

## 📚 Resources

- [Stripe React Native Docs](https://stripe.com/docs/payments/accept-a-payment?platform=react-native)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [PCI Compliance](https://stripe.com/docs/security/guide)
- [Stripe Dashboard](https://dashboard.stripe.com/)

---

## ✅ You're All Set!

Your payment system is now:
- ✅ **Secure** (PCI-DSS compliant)
- ✅ **Production-ready** (just switch to live keys)
- ✅ **User-friendly** (saved cards, one-click checkout)
- ✅ **Fraud-protected** (3D Secure, Stripe Radar)

**Test it with the test card:** `4242 4242 4242 4242`




