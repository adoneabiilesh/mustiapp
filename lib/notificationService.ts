/**
 * Notification Service
 * Handles push notifications for orders, promotions, etc.
 */

import * as Notifications from 'expo-notifications';
import { supabase } from './supabase';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Notification permissions not granted');
      return false;
    }

    // Get push token
    const token = await getPushToken();
    if (token) {
      await savePushToken(token);
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

/**
 * Get push notification token
 */
export const getPushToken = async (): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      // Web doesn't support push notifications in the same way
      return null;
    }

    const { data } = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    });

    return data;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
};

/**
 * Save push token to database
 */
export const savePushToken = async (token: string): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Update or insert notification preferences with push token
    const { error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: user.id,
        push_token: token,
        device_type: Platform.OS,
        push_enabled: true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (error) {
      console.error('Error saving push token:', error);
    }
  } catch (error) {
    console.error('Error in savePushToken:', error);
  }
};

/**
 * Schedule local notification
 */
export const scheduleLocalNotification = async (
  title: string,
  body: string,
  data?: any,
  trigger?: Notifications.NotificationTriggerInput
): Promise<string | null> => {
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: trigger || null, // null = immediate
    });

    return id;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
};

/**
 * Send order status notification
 */
export const sendOrderStatusNotification = async (
  orderId: string,
  status: string,
  message?: string
): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const statusMessages: Record<string, string> = {
      confirmed: 'Your order has been confirmed!',
      preparing: 'Your order is being prepared',
      ready: 'Your order is ready for pickup',
      out_for_delivery: 'Your order is on the way!',
      delivered: 'Your order has been delivered',
      cancelled: 'Your order has been cancelled',
    };

    const title = 'Order Update';
    const body = message || statusMessages[status] || `Order status: ${status}`;

    await scheduleLocalNotification(title, body, {
      type: 'order_update',
      order_id: orderId,
      status,
    });

    // Also save to database for history
    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'order_update',
      title,
      message: body,
      data: {
        order_id: orderId,
        status,
      },
    });
  } catch (error) {
    console.error('Error sending order notification:', error);
  }
};

/**
 * Setup notification listeners
 */
export const setupNotificationListeners = () => {
  // Handle notifications received while app is foregrounded
  Notifications.addNotificationReceivedListener((notification) => {
    console.log('Notification received:', notification);
    // Handle notification display
  });

  // Handle notification taps
  Notifications.addNotificationResponseReceivedListener((response) => {
    console.log('Notification tapped:', response);
    const data = response.notification.request.content.data;
    
    // Navigate based on notification type
    if (data?.type === 'order_update' && data?.order_id) {
      // Navigate to order details
      // router.push(`/order-details?id=${data.order_id}`);
    }
  });
};

/**
 * Cancel scheduled notification
 */
export const cancelNotification = async (notificationId: string): Promise<void> => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Error cancelling notification:', error);
  }
};

/**
 * Cancel all notifications
 */
export const cancelAllNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error cancelling all notifications:', error);
  }
};

/**
 * Get notification preferences
 */
export const getNotificationPreferences = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      // Create default preferences if doesn't exist
      const { data: newData } = await supabase
        .from('notification_preferences')
        .insert({
          user_id: user.id,
        })
        .select()
        .single();

      return newData;
    }

    return data;
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    return null;
  }
};

/**
 * Update notification preferences
 */
export const updateNotificationPreferences = async (preferences: {
  order_updates?: boolean;
  promotions?: boolean;
  delivery_alerts?: boolean;
  loyalty_updates?: boolean;
  referral_updates?: boolean;
  push_enabled?: boolean;
  email_enabled?: boolean;
  sms_enabled?: boolean;
}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: user.id,
        ...preferences,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error updating notification preferences:', error);
    throw new Error(error.message || 'Failed to update preferences');
  }
};

