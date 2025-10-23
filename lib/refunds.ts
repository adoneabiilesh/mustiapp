// Refund management functions

import { supabase, supabaseAdmin } from './supabase';

export interface RefundParams {
  orderId: string;
  paymentIntentId: string;
  amount?: number; // Optional: for partial refunds
  reason?: string;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  message: string;
}

/**
 * Create a refund via Supabase Edge Function
 */
export async function createRefund(params: RefundParams): Promise<RefundResult> {
  try {
    const { data, error } = await supabase.functions.invoke('create-refund', {
      body: {
        paymentIntentId: params.paymentIntentId,
        amount: params.amount, // Optional - omit for full refund
        reason: params.reason || 'requested_by_customer',
      },
    });

    if (error) throw error;

    // Update order status
    await supabaseAdmin
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', params.orderId);

    return {
      success: true,
      refundId: data.refundId,
      message: 'Refund processed successfully',
    };
  } catch (error: any) {
    console.error('Refund error:', error);
    return {
      success: false,
      message: error.message || 'Failed to process refund',
    };
  }
}

/**
 * Get refund history for an order
 */
export async function getRefundHistory(orderId: string) {
  try {
    // In a full implementation, you'd have a refunds table
    // For now, we check if order is cancelled
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error) throw error;

    return {
      hasRefund: data.status === 'cancelled',
      order: data,
    };
  } catch (error: any) {
    console.error('Refund history error:', error);
    return null;
  }
}

/**
 * Check if order is refundable
 */
export function isOrderRefundable(order: any): boolean {
  // Can only refund paid orders that aren't already cancelled/delivered
  const refundableStatuses = ['paid', 'preparing', 'out_for_delivery'];
  return refundableStatuses.includes(order.status) && !!order.payment_intent_id;
}


