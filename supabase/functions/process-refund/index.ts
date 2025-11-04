import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.13.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;

interface RefundRequest {
  order_id: string;
  amount?: number; // Optional for partial refunds
  reason: string;
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { order_id, amount, reason }: RefundRequest = await req.json();

    if (!order_id || !reason) {
      return new Response('Missing required fields', { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, payments(*)')
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      return new Response('Order not found', { status: 404 });
    }

    if (!order.payment_intent_id) {
      return new Response('No payment found for this order', { status: 400 });
    }

    // Check if order is already refunded
    if (order.payment_status === 'refunded') {
      return new Response('Order already refunded', { status: 400 });
    }

    // Process refund with Stripe
    const refundAmount = amount ? Math.round(amount * 100) : undefined; // Convert to cents or full amount
    
    const refund = await stripe.refunds.create({
      payment_intent: order.payment_intent_id,
      amount: refundAmount,
      reason: 'requested_by_customer',
      metadata: {
        order_id: order.id,
        custom_reason: reason,
      },
    });

    // Update order status
    await supabase
      .from('orders')
      .update({ 
        status: 'refunded',
        payment_status: 'refunded',
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id);

    // Record refund in database
    const { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', order.id)
      .single();

    if (payment) {
      await supabase
        .from('refunds')
        .insert({
          payment_id: payment.id,
          amount: refund.amount / 100,
          reason: reason,
          status: 'succeeded',
        });
    }

    // Send notification to customer
    await supabase.functions.invoke('send-notification', {
      body: {
        user_id: order.customer_id,
        title: 'Refund Processed',
        body: `Your refund of €${(refund.amount / 100).toFixed(2)} has been processed successfully.`,
        data: { 
          order_id: order.id, 
          refund_id: refund.id,
          type: 'refund_processed' 
        },
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        refund_id: refund.id,
        amount: refund.amount / 100,
        status: refund.status,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (err: any) {
    console.error('Refund error:', err.message);
    return new Response(
      JSON.stringify({ error: err.message }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});



