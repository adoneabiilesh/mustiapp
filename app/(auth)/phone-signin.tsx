import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signInWithPhone, verifyOTP } from '@/lib/supabase';
import useAuthStore from '@/store/auth.store';
import { Colors, Spacing, BorderRadius, Shadows } from '@/lib/designSystem';
import { Icons } from '@/lib/icons';

export default function PhoneSignIn() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatPhoneNumber = (text: string) => {
    // Remove non-numeric characters
    const cleaned = text.replace(/\D/g, '');
    
    // Format as +1 (XXX) XXX-XXXX
    if (cleaned.length <= 1) {
      return `+${cleaned}`;
    } else if (cleaned.length <= 4) {
      return `+${cleaned.slice(0, 1)} (${cleaned.slice(1)}`;
    } else if (cleaned.length <= 7) {
      return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4)}`;
    } else {
      return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 11)}`;
    }
  };

  const handleSendOTP = async () => {
    setError('');
    
    // Clean phone number for validation
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    if (cleaned.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setIsSubmitting(true);

    try {
      // Format phone number for Supabase (+1XXXXXXXXXX)
      const formattedPhone = `+${cleaned}`;
      await signInWithPhone(formattedPhone);
      
      Alert.alert(
        'OTP Sent',
        'Please check your phone for the verification code',
        [{ text: 'OK' }]
      );
      
      setStep('otp');
    } catch (error: any) {
      console.error('Send OTP error:', error);
      setError(error.message || 'Failed to send OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOTP = async () => {
    setError('');
    
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setIsSubmitting(true);

    try {
      const cleaned = phoneNumber.replace(/\D/g, '');
      const formattedPhone = `+${cleaned}`;
      
      const user = await verifyOTP(formattedPhone, otp);
      
      if (!user) {
        throw new Error('Failed to verify OTP');
      }

      // Update auth store
      useAuthStore.getState().setUser(user);
      useAuthStore.getState().setIsAuthenticated(true);
      
      // Mark onboarding as seen
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');

      // Navigate to tabs
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      setError(error.message || 'Invalid verification code');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setOtp('');
    setIsSubmitting(true);

    try {
      const cleaned = phoneNumber.replace(/\D/g, '');
      const formattedPhone = `+${cleaned}`;
      await signInWithPhone(formattedPhone);
      
      Alert.alert('OTP Resent', 'A new code has been sent to your phone');
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      setError(error.message || 'Failed to resend OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => step === 'otp' ? setStep('phone') : router.back()}
            style={styles.backButton}
          >
            <Icons.ArrowLeft size={24} color={Colors.text.primary} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {step === 'phone' ? 'Enter your phone' : 'Enter verification code'}
            </Text>
            <Text style={styles.subtitle}>
              {step === 'phone' 
                ? "We'll send you a verification code"
                : `We sent a code to ${phoneNumber}`}
            </Text>
          </View>

          {/* Error Message */}
          {error ? (
            <View style={styles.errorContainer}>
              <Icons.AlertCircle size={20} color={Colors.error[500]} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Phone Input Step */}
          {step === 'phone' && (
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <View style={styles.inputContainer}>
                  <Icons.Phone size={20} color={Colors.text.secondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="+1 (555) 555-5555"
                    placeholderTextColor={Colors.text.secondary}
                    value={phoneNumber}
                    onChangeText={(text) => {
                      setError('');
                      setPhoneNumber(formatPhoneNumber(text));
                    }}
                    keyboardType="phone-pad"
                    autoFocus
                    editable={!isSubmitting}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                onPress={handleSendOTP}
                disabled={isSubmitting}
                activeOpacity={0.8}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Send Code</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* OTP Input Step */}
          {step === 'otp' && (
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Verification Code</Text>
                <View style={styles.inputContainer}>
                  <Icons.Lock size={20} color={Colors.text.secondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="000000"
                    placeholderTextColor={Colors.text.secondary}
                    value={otp}
                    onChangeText={(text) => {
                      setError('');
                      setOtp(text.replace(/\D/g, '').slice(0, 6));
                    }}
                    keyboardType="number-pad"
                    maxLength={6}
                    autoFocus
                    editable={!isSubmitting}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                onPress={handleVerifyOTP}
                disabled={isSubmitting}
                activeOpacity={0.8}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Verify & Continue</Text>
                )}
              </TouchableOpacity>

              {/* Resend OTP */}
              <TouchableOpacity
                onPress={handleResendOTP}
                disabled={isSubmitting}
                style={styles.resendButton}
              >
                <Text style={styles.resendText}>Didn't receive code? Resend</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    ...Shadows.sm,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    fontFamily: 'Georgia',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    lineHeight: 24,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.error[50],
    borderWidth: 1,
    borderColor: Colors.error[200],
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: Colors.error[700],
    fontWeight: '500',
  },
  form: {
    gap: Spacing.lg,
  },
  inputGroup: {
    gap: Spacing.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === 'ios' ? Spacing.md : 4,
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
    paddingVertical: 8,
  },
  submitButton: {
    backgroundColor: Colors.primary[500],
    borderRadius: BorderRadius.md,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
    ...Shadows.md,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  resendButton: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  resendText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary[500],
  },
});

