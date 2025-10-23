import { useEffect, useState, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { 
  registerForPushNotifications, 
  sendLocalNotification, 
  getOrderNotification,
  subscribeToOrderNotifications,
  NotificationData 
} from '../lib/notifications';
import useAuthStore from '../store/auth.store';

export const useNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  const { user } = useAuthStore();

  useEffect(() => {
    // Only register for push notifications on mobile platforms
    if (Platform.OS !== 'web') {
      // Register for push notifications
      registerForPushNotifications().then(token => {
        setExpoPushToken(token);
        
        // Save token to user profile if user is logged in
        if (token && user?.$id) {
          savePushTokenToProfile(token);
        }
      });

      // Listen for notifications
      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        setNotification(notification);
      });

      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('Notification response:', response);
        // Handle notification tap
        handleNotificationResponse(response);
      });
    }

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [user]);

  // Save push token to user profile
  const savePushTokenToProfile = async (token: string) => {
    try {
      // You'll need to implement this in your Supabase functions
      const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/save-push-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          userId: user?.$id,
          pushToken: token,
        }),
      });

      if (!response.ok) {
        console.error('Failed to save push token');
      }
    } catch (error) {
      console.error('Error saving push token:', error);
    }
  };

  // Handle notification response (when user taps notification)
  const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
    const data = response.notification.request.content.data;
    
    if (data?.type === 'order_confirmed' || data?.type === 'order_preparing' || 
        data?.type === 'order_out_for_delivery' || data?.type === 'order_delivered') {
      // Navigate to order details
      // You'll need to implement navigation here
      console.log('Navigate to order details:', data.orderId);
    } else if (data?.type === 'promotion') {
      // Navigate to promotions or home
      console.log('Navigate to promotions');
    }
  };

  // Send order notification
  const sendOrderNotification = async (orderId: string, status: string, orderNumber?: string) => {
    const notification = getOrderNotification(status as any, orderId, orderNumber);
    await sendLocalNotification(notification);
  };

  // Send promotion notification
  const sendPromotionNotification = async (title: string, description: string, discount?: string) => {
    const notification = getPromotionNotification(title, description, discount);
    await sendLocalNotification(notification);
  };

  // Subscribe to order notifications
  const subscribeToOrder = (orderId: string, callback: (notification: any) => void) => {
    return subscribeToOrderNotifications(orderId, callback);
  };

  return {
    expoPushToken,
    notification,
    sendOrderNotification,
    sendPromotionNotification,
    subscribeToOrder,
  };
};
