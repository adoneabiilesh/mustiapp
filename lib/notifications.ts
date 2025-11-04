import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export interface NotificationData {
  type: 'order_update' | 'promotion' | 'reminder' | 'general';
  orderId?: string;
  title: string;
  body: string;
  data?: any;
}

export interface NotificationSettings {
  orderUpdates: boolean;
  promotions: boolean;
  reminders: boolean;
  general: boolean;
  sound: boolean;
  vibration: boolean;
}

// ============================================================================
// NOTIFICATION CONFIGURATION
// ============================================================================

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// ============================================================================
// NOTIFICATION FUNCTIONS
// ============================================================================

/**
 * Request notification permissions
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    if (!Device.isDevice) {
      console.log('⚠️ Must use physical device for push notifications');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('❌ Failed to get push token for push notification!');
      return false;
    }

    console.log('✅ Notification permissions granted');
    return true;
  } catch (error) {
    console.error('❌ Error requesting notification permissions:', error);
    return false;
  }
};

/**
 * Get push notification token
 */
export const getPushToken = async (): Promise<string | null> => {
  try {
    if (!Device.isDevice) {
      console.log('⚠️ Must use physical device for push notifications');
      return null;
    }

    const token = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    });

    console.log('📱 Push token:', token.data);
    return token.data;
  } catch (error) {
    console.error('❌ Error getting push token:', error);
    return null;
  }
};

/**
 * Register device for push notifications
 */
export const registerForPushNotifications = async (userId: string): Promise<string | null> => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    const token = await getPushToken();
    if (!token) {
      return null;
    }

    // Save token to database
    const { error } = await supabase
      .from('user_tokens')
      .upsert({
        user_id: userId,
        token,
        platform: Platform.OS,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('❌ Error saving push token:', error);
      return null;
    }

    console.log('✅ Device registered for push notifications');
    return token;
  } catch (error) {
    console.error('❌ Error registering for push notifications:', error);
    return null;
  }
};

/**
 * Send local notification
 */
export const sendLocalNotification = async (notification: NotificationData): Promise<void> => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        sound: true,
      },
      trigger: null, // Show immediately
    });

    console.log('📱 Local notification sent:', notification.title);
  } catch (error) {
    console.error('❌ Error sending local notification:', error);
  }
};

/**
 * Send push notification to user
 */
export const sendPushNotification = async (
  userId: string,
  notification: NotificationData
): Promise<boolean> => {
  try {
    // Get user's push token
    const { data: tokenData, error: tokenError } = await supabase
      .from('user_tokens')
      .select('token')
      .eq('user_id', userId)
      .single();

    if (tokenError || !tokenData) {
      console.log('⚠️ No push token found for user:', userId);
      return false;
    }

    // Send notification via Expo Push API
    const message = {
      to: tokenData.token,
      title: notification.title,
      body: notification.body,
      data: notification.data || {},
      sound: 'default',
    };

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (response.ok) {
      console.log('✅ Push notification sent successfully');
      return true;
    } else {
      console.error('❌ Failed to send push notification:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Error sending push notification:', error);
    return false;
  }
};

/**
 * Send order update notification
 */
export const sendOrderUpdateNotification = async (
  userId: string,
  orderId: string,
  status: string,
  message: string
): Promise<void> => {
  try {
    const statusMessages: { [key: string]: { title: string; body: string } } = {
      'pending': {
        title: 'Order Received',
        body: 'We\'ve received your order and are preparing it'
      },
      'confirmed': {
        title: 'Order Confirmed',
        body: 'Your order has been confirmed and is being prepared'
      },
      'preparing': {
        title: 'Order Being Prepared',
        body: 'Your order is being prepared with care'
      },
      'ready': {
        title: 'Order Ready',
        body: 'Your order is ready for pickup'
      },
      'out_for_delivery': {
        title: 'Out for Delivery',
        body: 'Your order is on its way to you'
      },
      'delivered': {
        title: 'Order Delivered',
        body: 'Your order has been delivered. Enjoy your meal!'
      },
      'cancelled': {
        title: 'Order Cancelled',
        body: 'Your order has been cancelled'
      }
    };

    const notification = statusMessages[status] || {
      title: 'Order Update',
      body: message
    };

    // Send push notification
    await sendPushNotification(userId, {
      type: 'order_update',
      orderId,
      title: notification.title,
      body: notification.body,
      data: { orderId, status }
    });

    // Also send local notification for immediate feedback
    await sendLocalNotification({
      type: 'order_update',
      orderId,
      title: notification.title,
      body: notification.body,
      data: { orderId, status }
    });

    console.log('📱 Order update notification sent:', status);
  } catch (error) {
    console.error('❌ Error sending order update notification:', error);
  }
};

/**
 * Send promotional notification
 */
export const sendPromotionalNotification = async (
  userId: string,
  title: string,
  body: string,
  data?: any
): Promise<void> => {
  try {
    await sendPushNotification(userId, {
      type: 'promotion',
      title,
      body,
      data
    });

    console.log('📱 Promotional notification sent');
  } catch (error) {
    console.error('❌ Error sending promotional notification:', error);
  }
};

/**
 * Send reminder notification
 */
export const sendReminderNotification = async (
  userId: string,
  title: string,
  body: string,
  data?: any
): Promise<void> => {
  try {
    await sendPushNotification(userId, {
      type: 'reminder',
      title,
      body,
      data
    });

    console.log('📱 Reminder notification sent');
  } catch (error) {
    console.error('❌ Error sending reminder notification:', error);
  }
};

/**
 * Get user notification settings
 */
export const getNotificationSettings = async (userId: string): Promise<NotificationSettings> => {
  try {
    const { data, error } = await supabase
      .from('user_notification_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      // Return default settings
      return {
        orderUpdates: true,
        promotions: true,
        reminders: true,
        general: true,
        sound: true,
        vibration: true,
      };
    }

    return data.settings as NotificationSettings;
  } catch (error) {
    console.error('❌ Error getting notification settings:', error);
    return {
      orderUpdates: true,
      promotions: true,
      reminders: true,
      general: true,
      sound: true,
      vibration: true,
    };
  }
};

/**
 * Update user notification settings
 */
export const updateNotificationSettings = async (
  userId: string,
  settings: NotificationSettings
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_notification_settings')
      .upsert({
        user_id: userId,
        settings,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('❌ Error updating notification settings:', error);
      return false;
    }

    console.log('✅ Notification settings updated');
    return true;
  } catch (error) {
    console.error('❌ Error updating notification settings:', error);
    return false;
  }
};

/**
 * Schedule reminder notification
 */
export const scheduleReminderNotification = async (
  title: string,
  body: string,
  triggerDate: Date,
  data?: any
): Promise<string | null> => {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: true,
      },
      trigger: {
        date: triggerDate,
      },
    });

    console.log('📱 Reminder notification scheduled:', notificationId);
    return notificationId;
  } catch (error) {
    console.error('❌ Error scheduling reminder notification:', error);
    return null;
  }
};

/**
 * Cancel scheduled notification
 */
export const cancelScheduledNotification = async (notificationId: string): Promise<void> => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log('📱 Scheduled notification cancelled:', notificationId);
  } catch (error) {
    console.error('❌ Error cancelling scheduled notification:', error);
  }
};

/**
 * Get all scheduled notifications
 */
export const getScheduledNotifications = async (): Promise<Notifications.NotificationRequest[]> => {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    return notifications;
  } catch (error) {
    console.error('❌ Error getting scheduled notifications:', error);
    return [];
  }
};

/**
 * Clear all notifications
 */
export const clearAllNotifications = async (): Promise<void> => {
  try {
    await Notifications.dismissAllNotificationsAsync();
    console.log('📱 All notifications cleared');
  } catch (error) {
    console.error('❌ Error clearing notifications:', error);
  }
};