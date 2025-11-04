/**
 * Order Service
 * Handles order operations including cancellation
 */

import { supabase } from './supabase';

export interface CancelOrderParams {
  orderId: string;
  reason: string;
  reasonType: 'customer_request' | 'restaurant_closed' | 'item_unavailable' | 'payment_failed' | 'delivery_failed' | 'duplicate_order' | 'other';
}

/**
 * Cancel an order
 */
export const cancelOrder = async (params: CancelOrderParams) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Check if order can be cancelled
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', params.orderId)
      .eq('customer_id', user.id)
      .single();

    if (orderError || !order) {
      throw new Error('Order not found');
    }

    // Check if order is already cancelled or delivered
    if (order.status === 'cancelled') {
      throw new Error('Order is already cancelled');
    }

    if (order.status === 'delivered') {
      throw new Error('Cannot cancel delivered order');
    }

    // Update order status
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        cancellation_reason: params.reason,
        cancellation_reason_type: params.reasonType,
        cancelled_at: new Date().toISOString(),
        cancelled_by: user.id,
      })
      .eq('id', params.orderId);

    if (updateError) {
      throw updateError;
    }

    // If payment was made, initiate refund
    if (order.payment_intent_id && order.status !== 'pending') {
      // Trigger refund process (async via edge function)
      await supabase.functions.invoke('process-refund', {
        body: {
          order_id: params.orderId,
          amount: order.total,
          reason: params.reason,
        },
      });
    }

    return { success: true, message: 'Order cancelled successfully' };
  } catch (error: any) {
    console.error('Error cancelling order:', error);
    throw new Error(error.message || 'Failed to cancel order');
  }
};

/**
 * Check if order can be cancelled
 */
export const canCancelOrder = async (orderId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: order } = await supabase
      .from('orders')
      .select('status, created_at')
      .eq('id', orderId)
      .eq('customer_id', user.id)
      .single();

    if (!order) return false;

    // Can cancel if: pending, confirmed, or preparing (within 5 minutes of creation)
    const nonCancellableStatuses = ['delivered', 'cancelled'];
    if (nonCancellableStatuses.includes(order.status)) return false;

    // Check time limit (5 minutes)
    const orderDate = new Date(order.created_at);
    const now = new Date();
    const minutesSinceOrder = (now.getTime() - orderDate.getTime()) / 1000 / 60;

    if (minutesSinceOrder > 5 && order.status === 'preparing') {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking cancellation eligibility:', error);
    return false;
  }
};

