// Stripe payment integration for React Native
// This file handles payment processing for orders

import { supabase } from '@/lib/supabase';

const STRIPE_API_URL = 'https://api.stripe.com/v1';
const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!;

// Note: For production, create a backend API endpoint to handle Stripe operations
// Never expose your Stripe secret key in the mobile app!

interface CreatePaymentIntentParams {
  amount: number; // in cents
  currency: string;
  orderId: string;
}

interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

/**
 * Create a payment intent (should be called from a secure backend)
 * This is a placeholder - implement this in your backend/serverless function
 */
export async function createPaymentIntent(
  params: CreatePaymentIntentParams
): Promise<PaymentIntentResponse> {
  try {
    // In production, call your backend API:
    // const response = await fetch(`${YOUR_API_URL}/create-payment-intent`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(params),
    // });

    // For now, using Supabase Edge Functions (example)
    const { data, error } = await supabase.functions.invoke('create-payment-intent', {
      body: {
        amount: params.amount,
        currency: params.currency,
        orderId: params.orderId,
      },
    });

    if (error) throw error;

    return {
      clientSecret: data.clientSecret,
      paymentIntentId: data.paymentIntentId,
    };
  } catch (error: any) {
    console.error('Payment intent creation failed:', error);
    throw new Error(error.message || 'Failed to create payment intent');
  }
}

/**
 * Confirm a payment (should be done via Stripe SDK in mobile app)
 */
export async function confirmPayment(clientSecret: string): Promise<boolean> {
  try {
    // This would use @stripe/stripe-react-native in the mobile app
    // Example:
    // const { paymentIntent, error } = await confirmPayment(clientSecret, {
    //   paymentMethodType: 'Card',
    // });
    
    // For demo purposes:
    console.log('Payment confirmation triggered for:', clientSecret);
    return true;
  } catch (error: any) {
    console.error('Payment confirmation failed:', error);
    throw new Error(error.message || 'Failed to confirm payment');
  }
}

/**
 * Update order with payment info after successful payment
 */
export async function updateOrderPayment(
  orderId: string,
  paymentIntentId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('orders')
      .update({
        payment_intent_id: paymentIntentId,
        status: 'paid',
      })
      .eq('id', orderId);

    if (error) throw error;
  } catch (error: any) {
    console.error('Failed to update order payment:', error);
    throw new Error(error.message || 'Failed to update order payment');
  }
}

/**
 * Calculate Stripe fee (2.9% + 30¢ for US/Canada)
 */
export function calculateStripeFee(amount: number): number {
  return Math.round(amount * 0.029 + 30);
}

/**
 * Convert euros to cents
 */
export function eurosToCents(euros: number): number {
  return Math.round(euros * 100);
}

/**
 * Convert cents to euros
 */
export function centsToEuros(cents: number): number {
  return cents / 100;
}

// Export Stripe publishable key for client-side usage
export { STRIPE_PUBLISHABLE_KEY };



