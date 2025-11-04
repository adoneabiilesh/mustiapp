import { supabase } from './supabase';

// ============================================================================
// ORDER TRACKING TYPES
// ============================================================================

export interface OrderStatus {
  id: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
  estimatedTime?: number; // minutes
  driverLocation?: { lat: number; lng: number };
  updates: OrderUpdate[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderUpdate {
  id: string;
  orderId: string;
  status: string;
  message: string;
  timestamp: string;
  isCustomerVisible: boolean;
}

export interface OrderTrackingData {
  orderId: string;
  status: string;
  estimatedDeliveryTime?: string;
  driverLocation?: { lat: number; lng: number };
  updates: OrderUpdate[];
  restaurantInfo: {
    name: string;
    address: string;
    phone: string;
  };
}

// ============================================================================
// ORDER TRACKING FUNCTIONS
// ============================================================================

/**
 * Get order tracking information
 */
export const getOrderTracking = async (orderId: string): Promise<OrderTrackingData | null> => {
  try {
    console.log('🔍 Fetching order tracking for:', orderId);
    
    // Get order with all related data
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          quantity,
          unit_price,
          customizations,
          menu_items (
            id,
            name,
            image_url
          )
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError) {
      console.error('❌ Error fetching order:', orderError);
      throw orderError;
    }

    if (!order) {
      console.log('❌ Order not found');
      return null;
    }

    // Get order updates
    const { data: updates, error: updatesError } = await supabase
      .from('order_updates')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    if (updatesError) {
      console.error('❌ Error fetching order updates:', updatesError);
    }

    // Get restaurant info (assuming single restaurant for now)
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('name, address, phone')
      .eq('id', order.restaurant_id || 'default')
      .single();

    if (restaurantError) {
      console.log('⚠️ Restaurant info not found, using defaults');
    }

    const trackingData: OrderTrackingData = {
      orderId: order.id,
      status: order.status || 'pending',
      estimatedDeliveryTime: order.estimated_delivery_time,
      driverLocation: order.driver_location,
      updates: updates || [],
      restaurantInfo: restaurant || {
        name: 'MustiApp Restaurant',
        address: '123 Main St, City',
        phone: '+1-555-0123'
      }
    };

    console.log('✅ Order tracking data:', trackingData);
    return trackingData;
  } catch (error: any) {
    console.error('❌ Failed to get order tracking:', error);
    return null;
  }
};

/**
 * Update order status
 */
export const updateOrderStatus = async (
  orderId: string, 
  status: string, 
  message?: string,
  estimatedTime?: number
): Promise<boolean> => {
  try {
    console.log('🔄 Updating order status:', { orderId, status, message, estimatedTime });
    
    // Update order status
    const { error: orderError } = await supabase
      .from('orders')
      .update({
        status,
        estimated_delivery_time: estimatedTime ? new Date(Date.now() + estimatedTime * 60000).toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (orderError) {
      console.error('❌ Error updating order:', orderError);
      throw orderError;
    }

    // Create order update record
    if (message) {
      const { error: updateError } = await supabase
        .from('order_updates')
        .insert({
          order_id: orderId,
          status,
          message,
          is_customer_visible: true,
          created_at: new Date().toISOString()
        });

      if (updateError) {
        console.error('❌ Error creating order update:', updateError);
      }
    }

    console.log('✅ Order status updated successfully');
    return true;
  } catch (error: any) {
    console.error('❌ Failed to update order status:', error);
    return false;
  }
};

/**
 * Subscribe to real-time order updates
 */
export const subscribeToOrderUpdates = (
  orderId: string, 
  onUpdate: (update: OrderUpdate) => void,
  onStatusChange: (status: string) => void
) => {
  console.log('🔗 Setting up real-time subscription for order:', orderId);
  
  const channel = supabase
    .channel(`order_${orderId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'order_updates',
        filter: `order_id=eq.${orderId}`,
      },
      (payload) => {
        console.log('📡 Order update received:', payload);
        if (payload.new) {
          onUpdate(payload.new as OrderUpdate);
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`,
      },
      (payload) => {
        console.log('📡 Order status change received:', payload);
        if (payload.new && payload.new.status) {
          onStatusChange(payload.new.status);
        }
      }
    )
    .subscribe((status) => {
      console.log('📡 Order subscription status:', status);
    });

  // Return unsubscribe function
  return () => {
    console.log('🔌 Unsubscribing from order updates');
    supabase.removeChannel(channel);
  };
};

/**
 * Get order status timeline
 */
export const getOrderTimeline = async (orderId: string): Promise<OrderUpdate[]> => {
  try {
    const { data, error } = await supabase
      .from('order_updates')
      .select('*')
      .eq('order_id', orderId)
      .eq('is_customer_visible', true)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Error fetching order timeline:', error);
      return [];
    }

    return data || [];
  } catch (error: any) {
    console.error('❌ Failed to get order timeline:', error);
    return [];
  }
};

/**
 * Get estimated delivery time
 */
export const getEstimatedDeliveryTime = (status: string, createdAt: string): number => {
  const orderTime = new Date(createdAt).getTime();
  const now = Date.now();
  const elapsedMinutes = Math.floor((now - orderTime) / 60000);

  // Estimated times based on status
  const statusTimes: { [key: string]: number } = {
    'pending': 30,
    'confirmed': 25,
    'preparing': 20,
    'ready': 15,
    'out_for_delivery': 10,
    'delivered': 0
  };

  const estimatedTotal = statusTimes[status] || 30;
  const remaining = Math.max(0, estimatedTotal - elapsedMinutes);
  
  return remaining;
};

/**
 * Format order status for display
 */
export const formatOrderStatus = (status: string): { 
  label: string; 
  color: string; 
  icon: string;
  description: string;
} => {
  const statusMap: { [key: string]: any } = {
    'pending': {
      label: 'Order Received',
      color: '#F59E0B',
      icon: 'clock',
      description: 'We\'ve received your order and are preparing it'
    },
    'confirmed': {
      label: 'Order Confirmed',
      color: '#3B82F6',
      icon: 'check-circle',
      description: 'Your order has been confirmed'
    },
    'preparing': {
      label: 'Preparing',
      color: '#8B5CF6',
      icon: 'chef-hat',
      description: 'Your order is being prepared'
    },
    'ready': {
      label: 'Ready for Pickup',
      color: '#10B981',
      icon: 'package',
      description: 'Your order is ready for pickup'
    },
    'out_for_delivery': {
      label: 'Out for Delivery',
      color: '#F59E0B',
      icon: 'truck',
      description: 'Your order is on its way'
    },
    'delivered': {
      label: 'Delivered',
      color: '#10B981',
      icon: 'check-circle',
      description: 'Your order has been delivered'
    },
    'cancelled': {
      label: 'Cancelled',
      color: '#EF4444',
      icon: 'x-circle',
      description: 'Your order has been cancelled'
    }
  };

  return statusMap[status] || statusMap['pending'];
};
