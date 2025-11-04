import React from 'react';
import { StripeProvider as StripeProviderComponent, useStripe as useStripeNative } from '@stripe/stripe-react-native';

// Stripe publishable key (from environment variables)
const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

/**
 * Stripe Provider Component (Native - iOS/Android)
 */
export const StripeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!STRIPE_PUBLISHABLE_KEY) {
    console.warn('⚠️ EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set. Stripe payments will not work.');
  }

  return (
    <StripeProviderComponent
      publishableKey={STRIPE_PUBLISHABLE_KEY}
      merchantIdentifier="merchant.com.mustiapp" // For Apple Pay
      urlScheme="mustiapp" // For redirects
    >
      {children}
    </StripeProviderComponent>
  );
};

/**
 * useStripe hook (Native)
 */
export const useStripe = useStripeNative;

/**
 * Create a payment intent on the server
 */
export const createPaymentIntent = async (amount: number) => {
  try {
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    
    if (!supabaseUrl) {
      throw new Error('Supabase URL not configured');
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Payment intent creation failed: ${errorData}`);
    }

    const data = await response.json();
    return {
      id: data.id,
      clientSecret: data.client_secret,
      amount: data.amount,
      currency: data.currency,
      status: data.status,
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

// Test card numbers for development
export const STRIPE_TEST_CARDS = {
  SUCCESS: '4242424242424242',
  DECLINED: '4000000000000002',
  REQUIRES_3DS: '4000002500003155',
  INSUFFICIENT_FUNDS: '4000000000009995',
};




