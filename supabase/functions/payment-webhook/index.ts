/**
 * Stripe Payment Webhook Handler
 * Verifies webhook signatures and processes payment events
 * 
 * IMPORTANT: Test this with Stripe CLI before production!
 * Run: stripe listen --forward-to localhost:54321/functions/v1/payment-webhook
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-12-18.acacia',
  httpClient: Stripe.createFetchHttpClient(),
});

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';

interface WebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
}

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get signature from header
    const signature = req.headers.get('stripe-signature');
    
    if (!signature) {
      console.error('❌ No Stripe signature found');
      return new Response(
        JSON.stringify({ error: 'Missing signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get raw body
    const body = await req.text();

    // Verify webhook signature
    let event: WebhookEvent;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret) as WebhookEvent;
    } catch (err: any) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return new Response(
        JSON.stringify({ error: 'Invalid signature', details: err.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`✅ Webhook verified: ${event.type} (${event.id})`);

    // Process different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event);
        break;

      case 'charge.refunded':
        await handleRefund(event);
        break;

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true, event_type: event.type }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Webhook error:', error);
    
    // Alert on webhook errors
    // In production, send to alerting system
    
    return new Response(
      JSON.stringify({ error: 'Webhook processing failed', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(event: WebhookEvent) {
  const paymentIntent = event.data.object;
  const orderId = paymentIntent.metadata?.order_id;

  console.log(`✅ Payment succeeded for order: ${orderId}`);

  if (!orderId) {
    console.warn('⚠️ No order_id in payment metadata');
    return;
  }

  // Update order status in database
  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Update order status
  const { error } = await supabase
    .from('orders')
    .update({
      status: 'paid',
      stripe_payment_intent_id: paymentIntent.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId);

  if (error) {
    console.error('❌ Error updating order:', error);
    throw error;
  }

  console.log(`✅ Order ${orderId} marked as paid`);
  
  // Send notification to customer
  // Send notification to restaurant
  // Trigger order processing workflow
}

/**
 * Handle failed payment
 */
async function handlePaymentFailure(event: WebhookEvent) {
  const paymentIntent = event.data.object;
  const orderId = paymentIntent.metadata?.order_id;

  console.log(`❌ Payment failed for order: ${orderId}`);

  if (!orderId) return;

  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Update order status
  await supabase
    .from('orders')
    .update({
      status: 'payment_failed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId);

  // Send alert (critical - payment failed)
  // Send notification to customer
  // Send notification to admin
}

/**
 * Handle refund
 */
async function handleRefund(event: WebhookEvent) {
  const charge = event.data.object;
  const paymentIntentId = charge.payment_intent;

  console.log(`💰 Refund processed for payment: ${paymentIntentId}`);

  // Update order/refund records
  // Send notifications
}
