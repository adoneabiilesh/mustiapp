import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StripeProvider } from '@/lib/stripe';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import * as Sentry from '@sentry/react-native';
import React, { useEffect } from 'react';
import { View, Text } from 'react-native';

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

// Check for missing environment variables
const checkEnvironmentVariables = () => {
  const missing: string[] = [];
  
  if (!process.env.EXPO_PUBLIC_SUPABASE_URL) {
    missing.push('EXPO_PUBLIC_SUPABASE_URL');
  }
  
  if (!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
    missing.push('EXPO_PUBLIC_SUPABASE_ANON_KEY');
  }
  
  if (!process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    missing.push('EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY');
  }
  
  return missing;
};

export default function RootLayout() {
  // Check for missing environment variables immediately
  const missingEnvVars = checkEnvironmentVariables();
  
  useEffect(() => {
    // If env vars are missing, don't initialize services
    if (missingEnvVars.length > 0) {
      return;
    }
    
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
  
  // Show error screen if environment variables are missing
  if (missingEnvVars.length > 0) {
    return (
      <ErrorBoundary>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#FF6B6B' }}>
            Configuration Error
          </Text>
          <Text style={{ fontSize: 16, marginBottom: 10, textAlign: 'center', color: '#333' }}>
            Missing required environment variables:
          </Text>
          {missingEnvVars.map((varName) => (
            <Text key={varName} style={{ fontSize: 14, color: '#666', marginBottom: 5 }}>
              • {varName}
            </Text>
          ))}
          <Text style={{ fontSize: 14, marginTop: 20, textAlign: 'center', color: '#666' }}>
            Please configure EAS secrets and rebuild the app.
          </Text>
          <Text style={{ fontSize: 12, marginTop: 10, textAlign: 'center', color: '#999' }}>
            See EAS_SECRETS_SETUP.md for instructions.
          </Text>
        </View>
      </ErrorBoundary>
    );
  }

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
