import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StripeProvider } from '@/lib/stripe';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import * as Sentry from '@sentry/react-native';
import { useEffect } from 'react';

// Initialize Sentry with error alerting
if (!__DEV__) {
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    enableInExpoDevelopment: false,
    debug: false,
    tracesSampleRate: 1.0,
    beforeSend(event, hint) {
      // Only send critical errors in production
      if (event.level === 'error' || event.level === 'fatal') {
        return event;
      }
      return null;
    },
  });
}

export default function RootLayout() {
  useEffect(() => {
    // Initialize offline support
    const initializeServices = async () => {
      try {
        const { initializeOfflineSupport } = await import('@/lib/offlineService');
        const unsubscribeOffline = initializeOfflineSupport();

        // Setup notification listeners
        const { setupNotificationListeners, requestNotificationPermissions } = await import('@/lib/notificationService');
        setupNotificationListeners();
        
        // Request notification permissions (non-blocking)
        requestNotificationPermissions().catch(err => {
          if (__DEV__) {
          console.log('Notification permission request failed:', err);
          }
        });

        return () => {
          if (unsubscribeOffline) {
            unsubscribeOffline();
          }
        };
      } catch (error) {
        if (__DEV__) {
        console.error('Error initializing services:', error);
        }
        // In production, log to error tracking service
        if (!__DEV__ && typeof Sentry !== 'undefined') {
          Sentry.captureException(error);
        }
      }
    };

    initializeServices();
  }, []);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StripeProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="index" options={{ animation: 'none' }} />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="reset-password" />
          <Stack.Screen name="(tabs)" />
            <Stack.Screen name="restaurant-detail" />
            <Stack.Screen name="item-detail" />
            <Stack.Screen name="special-offer-details" />
            <Stack.Screen name="promotion-detail" />
            <Stack.Screen name="address-management" />
            <Stack.Screen name="payment-methods" />
            <Stack.Screen name="checkout" />
            <Stack.Screen name="order-confirmation" />
            <Stack.Screen name="order-tracking" />
            <Stack.Screen name="restaurant-discovery" />
            <Stack.Screen name="settings" />
          </Stack>
        </StripeProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
