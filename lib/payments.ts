import { StripeProvider, useStripe } from '@stripe/stripe-react-native';
import { Alert } from 'react-native';

// Stripe configuration
export const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

// Payment methods interface
export interface PaymentMethod {
  id: string;
  type: 'card' | 'apple_pay' | 'google_pay';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

// Payment intent interface
export interface PaymentIntent {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'canceled';
}

// Create payment intent
export const createPaymentIntent = async (amount: number, currency: string = 'eur'): Promise<PaymentIntent> => {
  try {
    const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create payment intent');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Payment intent creation failed:', error);
    throw error;
  }
};

// Confirm payment
export const confirmPayment = async (paymentIntentId: string, paymentMethodId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/confirm-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        paymentIntentId,
        paymentMethodId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to confirm payment');
    }

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Payment confirmation failed:', error);
    throw error;
  }
};

// Get saved payment methods
export const getPaymentMethods = async (customerId: string): Promise<PaymentMethod[]> => {
  try {
    const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/get-payment-methods`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ customerId }),
    });

    if (!response.ok) {
      throw new Error('Failed to get payment methods');
    }

    const data = await response.json();
    return data.paymentMethods || [];
  } catch (error) {
    console.error('Failed to get payment methods:', error);
    return [];
  }
};

// Save payment method
export const savePaymentMethod = async (customerId: string, paymentMethodId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/save-payment-method`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        customerId,
        paymentMethodId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save payment method');
    }

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Failed to save payment method:', error);
    return false;
  }
};

// Delete payment method
export const deletePaymentMethod = async (paymentMethodId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/delete-payment-method`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ paymentMethodId }),
    });

    if (!response.ok) {
      throw new Error('Failed to delete payment method');
    }

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Failed to delete payment method:', error);
    return false;
  }
};

// Payment error handler
export const handlePaymentError = (error: any) => {
  console.error('Payment error:', error);
  
  let message = 'Payment failed. Please try again.';
  
  if (error.code) {
    switch (error.code) {
      case 'card_declined':
        message = 'Your card was declined. Please try a different payment method.';
        break;
      case 'expired_card':
        message = 'Your card has expired. Please use a different card.';
        break;
      case 'incorrect_cvc':
        message = 'Your card\'s security code is incorrect. Please try again.';
        break;
      case 'processing_error':
        message = 'An error occurred while processing your card. Please try again.';
        break;
      case 'authentication_required':
        message = 'Your card requires authentication. Please complete the verification.';
        break;
      default:
        message = `Payment failed: ${error.message}`;
    }
  }
  
  Alert.alert('Payment Error', message);
};
