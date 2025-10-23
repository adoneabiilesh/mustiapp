// Supabase Edge Function for creating Stripe refunds
// Deploy this to Supabase: supabase functions deploy create-refund

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@13.7.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { paymentIntentId, amount, reason = 'requested_by_customer' } = await req.json();

    // Validate input
    if (!paymentIntentId) {
      throw new Error('Payment Intent ID is required');
    }

    console.log('Creating refund for payment intent:', paymentIntentId);

    // Create refund
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount, // Optional - omit for full refund
      reason,
    });

    console.log('Refund created:', refund.id);

    return new Response(
      JSON.stringify({
        refundId: refund.id,
        status: refund.status,
        amount: refund.amount,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Refund creation failed:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to create refund',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});


