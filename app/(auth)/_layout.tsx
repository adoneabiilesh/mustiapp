import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';
import { Colors } from '@/lib/designSystem';

export default function AuthLayout() {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background.primary} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: Colors.background.primary,
          },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="sign-up" />
        <Stack.Screen name="phone-signin" />
      </Stack>
    </>
  );
}
