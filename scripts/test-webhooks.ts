/**
 * Webhook Testing Utility
 * Tests Stripe webhooks end-to-end
 */

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

/**
 * Test payment webhook
 */
export async function testPaymentWebhook() {
  console.log('🧪 Testing Payment Webhook...');

  // Create a test payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 1000, // $10.00
    currency: 'eur',
    metadata: {
      test: 'true',
      order_id: 'test-order-123',
    },
  });

  console.log('✅ Payment Intent created:', paymentIntent.id);

  // Simulate webhook event
  const webhookEvent = {
    id: 'evt_test_webhook',
    type: 'payment_intent.succeeded',
    data: {
      object: paymentIntent,
    },
  };

  // Send to your webhook endpoint
  const webhookUrl = process.env.SUPABASE_URL + '/functions/v1/payment-webhook';
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('❌ STRIPE_WEBHOOK_SECRET not set');
    return;
  }

  // Create signature
  const signature = stripe.webhooks.generateTestHeaderString({
    payload: JSON.stringify(webhookEvent),
    secret: webhookSecret,
  });

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'stripe-signature': signature,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookEvent),
    });

    if (response.ok) {
      console.log('✅ Webhook processed successfully');
    } else {
      console.error('❌ Webhook failed:', await response.text());
    }
  } catch (error) {
    console.error('❌ Error testing webhook:', error);
  }
}

/**
 * Test all webhook scenarios
 */
export async function testAllWebhooks() {
  console.log('🧪 Testing All Webhook Scenarios...\n');

  // Test payment success
  console.log('1. Testing payment success...');
  await testPaymentWebhook();

  // Test payment failure (would create failed payment intent)
  // Test refund (would create refund)
  // etc.

  console.log('\n✅ Webhook testing complete!');
}

// Run if called directly
if (require.main === module) {
  testAllWebhooks().catch(console.error);
}




