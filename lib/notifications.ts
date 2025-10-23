import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform, Alert } from 'react-native';

// Notification configuration
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Notification types
export type NotificationType = 
  | 'order_confirmed'
  | 'order_preparing'
  | 'order_out_for_delivery'
  | 'order_delivered'
  | 'order_cancelled'
  | 'promotion'
  | 'delivery_update'
  | 'payment_success'
  | 'payment_failed';

// Notification data interface
export interface NotificationData {
  type: NotificationType;
  orderId?: string;
  title: string;
  body: string;
  data?: any;
}

// Register for push notifications
export const registerForPushNotifications = async (): Promise<string | null> => {
  let token: string | null = null;

  // Skip on web platform
  if (Platform.OS === 'web') {
    console.log('Push notifications not available on web platform');
    return null;
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }

    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
      if (!projectId) {
        throw new Error('Project ID not found');
      }

      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      console.log('Push notification token:', token);
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
};

// Send local notification
export const sendLocalNotification = async (notification: NotificationData) => {
  // Check if we're on web platform
  if (Platform.OS === 'web') {
    // For web, show an alert instead of notification
    Alert.alert(notification.title, notification.body);
    return;
  }

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.body,
        data: {
          type: notification.type,
          orderId: notification.orderId,
          ...notification.data,
        },
        sound: 'default',
      },
      trigger: null, // Show immediately
    });
  } catch (error) {
    console.log('Notification not available, showing alert instead:', error);
    // Fallback to alert if notifications fail
    Alert.alert(notification.title, notification.body);
  }
};

// Send push notification via Supabase
export const sendPushNotification = async (
  expoPushToken: string,
  notification: NotificationData
): Promise<boolean> => {
  try {
    const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/send-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        to: expoPushToken,
        title: notification.title,
        body: notification.body,
        data: {
          type: notification.type,
          orderId: notification.orderId,
          ...notification.data,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send notification');
    }

    return true;
  } catch (error) {
    console.error('Failed to send push notification:', error);
    return false;
  }
};

// Subscribe to order notifications
export const subscribeToOrderNotifications = (orderId: string, callback: (notification: any) => void) => {
  const subscription = Notifications.addNotificationReceivedListener(callback);
  return subscription;
};

// Order notification templates
export const getOrderNotification = (type: NotificationType, orderId: string, orderNumber?: string): NotificationData => {
  const orderNum = orderNumber || orderId.slice(-6);
  
  switch (type) {
    case 'order_confirmed':
      return {
        type,
        orderId,
        title: 'Order Confirmed! 🎉',
        body: `Your order #${orderNum} has been confirmed and is being prepared.`,
      };
    
    case 'order_preparing':
      return {
        type,
        orderId,
        title: 'Cooking in Progress! 👨‍🍳',
        body: `Your order #${orderNum} is being prepared by our chefs.`,
      };
    
    case 'order_out_for_delivery':
      return {
        type,
        orderId,
        title: 'Out for Delivery! 🚚',
        body: `Your order #${orderNum} is on its way to you.`,
      };
    
    case 'order_delivered':
      return {
        type,
        orderId,
        title: 'Order Delivered! ✅',
        body: `Your order #${orderNum} has been delivered. Enjoy your meal!`,
      };
    
    case 'order_cancelled':
      return {
        type,
        orderId,
        title: 'Order Cancelled',
        body: `Your order #${orderNum} has been cancelled.`,
      };
    
    case 'payment_success':
      return {
        type,
        orderId,
        title: 'Payment Successful! 💳',
        body: `Your payment for order #${orderNum} has been processed.`,
      };
    
    case 'payment_failed':
      return {
        type,
        orderId,
        title: 'Payment Failed',
        body: `Payment for order #${orderNum} failed. Please try again.`,
      };
    
    default:
      return {
        type,
        orderId,
        title: 'Order Update',
        body: `Update for your order #${orderNum}.`,
      };
  }
};

// Promotion notification template
export const getPromotionNotification = (title: string, description: string, discount?: string): NotificationData => {
  return {
    type: 'promotion',
    title: `🎉 ${title}`,
    body: discount ? `${description} Get ${discount} off your next order!` : description,
  };
};

// Delivery update notification
export const getDeliveryUpdateNotification = (orderId: string, status: string, eta?: string): NotificationData => {
  return {
    type: 'delivery_update',
    orderId,
    title: 'Delivery Update',
    body: eta ? `Your order is ${status}. ETA: ${eta}` : `Your order is ${status}.`,
  };
};

// Clear all notifications
export const clearAllNotifications = async () => {
  await Notifications.dismissAllNotificationsAsync();
};

// Get notification count
export const getNotificationCount = async (): Promise<number> => {
  const notifications = await Notifications.getAllScheduledNotificationsAsync();
  return notifications.length;
};

// Schedule notification for later
export const scheduleNotification = async (
  notification: NotificationData,
  trigger: Notifications.NotificationTriggerInput
) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: notification.title,
      body: notification.body,
      data: {
        type: notification.type,
        orderId: notification.orderId,
        ...notification.data,
      },
    },
    trigger,
  });
};