import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Platform, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, BorderRadius, Shadows } from '@/lib/designSystem';
import { logo } from '@/constants';
import { Icons } from '@/lib/icons';
import { signInWithGoogle, signInWithApple } from '@/lib/supabase';
import useAuthStore from '@/store/auth.store';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

// Initialize WebBrowser for OAuth
WebBrowser.maybeCompleteAuthSession();

export default function WelcomeScreen() {
  const [loading, setLoading] = useState<'google' | 'apple' | 'phone' | null>(null);

  const handleGoogleSignIn = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    setLoading('google');
    
    try {
      const { url } = await signInWithGoogle();
      
      if (!url) {
        throw new Error('No auth URL returned');
      }

      // Open the OAuth URL in a browser
      const result = await WebBrowser.openAuthSessionAsync(
        url,
        Linking.createURL('/(tabs)')
      );

      if (result.type === 'success') {
        // Wait a bit for Supabase to process the session
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get the authenticated user
        const user = await getCurrentUser();
        
        if (user) {
          // Update auth store
          useAuthStore.getState().setUser(user);
          useAuthStore.getState().setIsAuthenticated(true);
          
          // Mark onboarding as seen
          await AsyncStorage.setItem('hasSeenOnboarding', 'true');
          router.replace('/(tabs)');
        } else {
          throw new Error('Authentication failed. Please try again.');
        }
      } else if (result.type === 'cancel') {
        // User cancelled - don't show error
        setLoading(null);
        return;
      }
    } catch (error: any) {
      console.error('Google sign in error:', error);
      Alert.alert(
        'Sign In Failed',
        error.message || 'Failed to sign in with Google. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(null);
    }
  };

  const handleAppleSignIn = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    setLoading('apple');
    
    try {
      const { url } = await signInWithApple();
      
      if (!url) {
        throw new Error('No auth URL returned');
      }

      // Open the OAuth URL in a browser
      const result = await WebBrowser.openAuthSessionAsync(
        url,
        Linking.createURL('/(tabs)')
      );

      if (result.type === 'success') {
        // Wait a bit for Supabase to process the session
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get the authenticated user
        const user = await getCurrentUser();
        
        if (user) {
          // Update auth store
          useAuthStore.getState().setUser(user);
          useAuthStore.getState().setIsAuthenticated(true);
          
          // Mark onboarding as seen
          await AsyncStorage.setItem('hasSeenOnboarding', 'true');
          router.replace('/(tabs)');
        } else {
          throw new Error('Authentication failed. Please try again.');
        }
      } else if (result.type === 'cancel') {
        // User cancelled - don't show error
        setLoading(null);
        return;
      }
    } catch (error: any) {
      console.error('Apple sign in error:', error);
      Alert.alert(
        'Sign In Failed',
        error.message || 'Failed to sign in with Apple. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(null);
    }
  };

  const handlePhoneSignIn = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    router.push('/(auth)/phone-signin');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Brand Logo */}
        <View style={styles.logoContainer}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
        </View>

        {/* Welcome Message */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>Welcome to Musti</Text>
          <Text style={styles.subtitle}>
            Your favorite food, delivered fast
          </Text>
        </View>

        <View style={styles.spacer} />

        {/* CTA Buttons */}
        <View style={styles.buttonContainer}>
          {/* Google Button */}
          <TouchableOpacity
            style={[styles.button, styles.googleButton]}
            onPress={handleGoogleSignIn}
            disabled={loading !== null}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              {loading === 'google' ? (
                <ActivityIndicator color={Colors.primary[500]} />
              ) : (
                <>
                  <View style={styles.iconContainer}>
                    <Text style={styles.googleIcon}>G</Text>
                  </View>
                  <Text style={styles.googleButtonText}>Continue with Google</Text>
                </>
              )}
            </View>
          </TouchableOpacity>

          {/* Apple Button */}
          <TouchableOpacity
            style={[styles.button, styles.appleButton]}
            onPress={handleAppleSignIn}
            disabled={loading !== null}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              {loading === 'apple' ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <View style={styles.iconContainer}>
                    <Icons.Apple size={24} color="#FFFFFF" />
                  </View>
                  <Text style={styles.appleButtonText}>Continue with Apple</Text>
                </>
              )}
            </View>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Phone Button */}
          <TouchableOpacity
            style={[styles.button, styles.phoneButton]}
            onPress={handlePhoneSignIn}
            disabled={loading !== null}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              {loading === 'phone' ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <View style={styles.iconContainer}>
                    <Icons.Phone size={24} color="#FFFFFF" />
                  </View>
                  <Text style={styles.phoneButtonText}>Continue with Phone</Text>
                </>
              )}
            </View>
          </TouchableOpacity>

          {/* Sign In Link */}
          <TouchableOpacity
            style={styles.signInContainer}
            onPress={() => router.replace('/(auth)/sign-in')}
            activeOpacity={0.7}
          >
            <Text style={styles.signInText}>
              Already have an account? <Text style={styles.signInLink}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our{' '}
            <Text style={styles.footerLink}>Terms of Service</Text>
            {' & '}
            <Text style={styles.footerLink}>Privacy Policy</Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  logo: {
    width: 80,
    height: 80,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text.primary,
    textAlign: 'center',
    fontFamily: 'Georgia',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  spacer: {
    flex: 1,
  },
  buttonContainer: {
    gap: 16,
    marginBottom: Spacing.lg,
  },
  button: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: Spacing.lg,
  },
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: Spacing.lg,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.neutral[300],
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4285F4',
  },
  appleButton: {
    backgroundColor: '#000000',
  },
  appleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  phoneButton: {
    backgroundColor: Colors.primary[500],
  },
  phoneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xs,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.neutral[300],
  },
  dividerText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginHorizontal: Spacing.md,
  },
  signInContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  signInText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  signInLink: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary[500],
  },
  footer: {
    alignItems: 'center',
    paddingBottom: Spacing.md,
  },
  footerText: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    fontWeight: '600',
    color: Colors.primary[500],
  },
});
