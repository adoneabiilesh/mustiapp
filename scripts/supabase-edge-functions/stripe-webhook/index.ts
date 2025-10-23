// Supabase Edge Function for handling Stripe webhooks
// Deploy this to Supabase: supabase functions deploy stripe-webhook

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@13.7.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';

serve(async (req) => {
  try {
    const signature = req.headers.get('stripe-signature');
    
    if (!signature) {
      throw new Error('No signature provided');
    }

    // Get the raw body for signature verification
    const body = await req.text();

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    console.log('Webhook event received:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata.orderId;

        if (orderId) {
          // Update order status to paid
          const { error } = await supabase
            .from('orders')
            .update({
              status: 'paid',
              payment_intent_id: paymentIntent.id,
            })
            .eq('id', orderId);

          if (error) {
            console.error('Failed to update order:', error);
          } else {
            console.log('Order marked as paid:', orderId);
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata.orderId;

        console.log('Payment failed for order:', orderId);
        
        // Optionally update order status or notify customer
        break;
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata.orderId;

        if (orderId) {
          // Update order status to cancelled
          const { error } = await supabase
            .from('orders')
            .update({
              status: 'cancelled',
            })
            .eq('id', orderId);

          if (error) {
            console.error('Failed to cancel order:', error);
          } else {
            console.log('Order cancelled:', orderId);
          }
        }
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Webhook error:', error);

    return new Response(
      JSON.stringify({
        error: error.message || 'Webhook processing failed',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});



