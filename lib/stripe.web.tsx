import React from 'react';

/**
 * Stripe Provider Component (Web - Mock)
 * Stripe payments are not available on web, use mobile app
 */
export const StripeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.warn('⚠️ Stripe is not available on web. Card payments will not work on web platform.');
  return <>{children}</>;
};

/**
 * useStripe hook (Web - Mock)
 * Returns mock functions for web compatibility
 */
export const useStripe = () => {
  return {
    confirmPayment: async () => ({ 
      error: { message: 'Stripe is not available on web. Please use the mobile app for card payments.' } 
    }),
    createPaymentMethod: async () => ({ 
      error: { message: 'Stripe is not available on web. Please use the mobile app for card payments.' } 
    }),
  };
};

/**
 * Create a payment intent on the server (Web - Not supported)
 */
export const createPaymentIntent = async (amount: number) => {
  throw new Error('Payment processing is not available on web. Please use the mobile app (iOS/Android) for card payments.');
};

// Test card numbers (for documentation purposes)
export const STRIPE_TEST_CARDS = {
  SUCCESS: '4242424242424242',
  DECLINED: '4000000000000002',
  REQUIRES_3DS: '4000002500003155',
  INSUFFICIENT_FUNDS: '4000000000009995',
};




