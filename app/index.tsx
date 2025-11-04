import { useEffect } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
      
      if (!hasSeenOnboarding) {
        router.replace('/(onboarding)/welcome');
        return;
      }

      // For now, just go to tabs - auth will be handled by protected routes
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error checking onboarding:', error);
      router.replace('/(onboarding)/welcome');
    }
  };

  return null;
}

