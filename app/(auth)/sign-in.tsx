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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router, Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signIn, resetPassword } from '@/lib/supabase';
import useAuthStore from '@/store/auth.store';
import { Colors, Spacing, BorderRadius, Shadows } from '@/lib/designSystem';
import { Icons } from '@/lib/icons';

export default function SignIn() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSignIn = async () => {
    setError('');
    const { email, password } = form;

    // Validation
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      const user = await signIn({ email, password });
      
      if (!user) {
        throw new Error('No user data returned');
      }

      // Update auth store
      useAuthStore.getState().setUser(user);
      useAuthStore.getState().setIsAuthenticated(true);
      
      // Mark onboarding as seen
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');

      // Navigate to tabs
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Sign in error:', error);
      setError(error.message || 'Failed to sign in. Please check your credentials.');
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
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue your food journey</Text>
          </View>

          {/* Error Message */}
          {error ? (
            <View style={styles.errorContainer}>
              <Icons.AlertCircle size={20} color={Colors.error[500]} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Form */}
          <View style={styles.form}>
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputContainer}>
                <Icons.Mail size={20} color={Colors.text.secondary} />
                <TextInput
                  style={styles.input}
                  placeholder="your.email@example.com"
                  placeholderTextColor={Colors.text.secondary}
                  value={form.email}
                  onChangeText={(text) => {
                    setError('');
                    setForm((prev) => ({ ...prev, email: text.toLowerCase().trim() }));
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isSubmitting}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <Icons.Lock size={20} color={Colors.text.secondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor={Colors.text.secondary}
                  value={form.password}
                  onChangeText={(text) => {
                    setError('');
                    setForm((prev) => ({ ...prev, password: text }));
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!isSubmitting}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Icons.Eye size={20} color={Colors.text.secondary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity 
              style={styles.forgotPassword} 
              onPress={() => setShowForgotPassword(true)}
              disabled={isSubmitting}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <TouchableOpacity
              style={[styles.signInButton, isSubmitting && styles.signInButtonDisabled]}
              onPress={handleSignIn}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.signInButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Guest Continue */}
            <TouchableOpacity
              style={styles.guestButton}
              onPress={async () => {
                await AsyncStorage.setItem('hasSeenOnboarding', 'true');
                router.replace('/(tabs)');
              }}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              <Text style={styles.guestButtonText}>Continue as Guest</Text>
            </TouchableOpacity>
          </View>

          {/* Sign Up Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Link href="/(auth)/sign-up" asChild>
              <TouchableOpacity disabled={isSubmitting}>
                <Text style={styles.footerLink}>Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>

        {/* Forgot Password Modal */}
        {showForgotPassword && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {!resetSuccess ? (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Reset Password</Text>
                    <TouchableOpacity
                      onPress={() => {
                        setShowForgotPassword(false);
                        setForgotPasswordEmail('');
                        setError('');
                        setResetSuccess(false);
                      }}
                    >
                      <Icons.X size={24} color={Colors.text.secondary} />
                    </TouchableOpacity>
                  </View>
                  
                  <Text style={styles.modalDescription}>
                    Enter your email address and we'll send you a link to reset your password.
                  </Text>

                  {error ? (
                    <View style={styles.errorContainer}>
                      <Icons.AlertCircle size={20} color={Colors.error[500]} />
                      <Text style={styles.errorText}>{error}</Text>
                    </View>
                  ) : null}

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email Address</Text>
                    <View style={styles.inputContainer}>
                      <Icons.Mail size={20} color={Colors.text.secondary} />
                      <TextInput
                        style={styles.input}
                        placeholder="your.email@example.com"
                        placeholderTextColor={Colors.text.secondary}
                        value={forgotPasswordEmail}
                        onChangeText={(text) => {
                          setError('');
                          setForgotPasswordEmail(text.toLowerCase().trim());
                        }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!isSendingReset}
                      />
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.modalButton, isSendingReset && styles.modalButtonDisabled]}
                    onPress={async () => {
                      setError('');
                      
                      if (!forgotPasswordEmail || !forgotPasswordEmail.includes('@')) {
                        setError('Please enter a valid email address');
                        return;
                      }

                      setIsSendingReset(true);
                      try {
                        await resetPassword(forgotPasswordEmail);
                        setResetSuccess(true);
                      } catch (error: any) {
                        console.error('Password reset error:', error);
                        setError(error.message || 'Failed to send reset email. Please try again.');
                      } finally {
                        setIsSendingReset(false);
                      }
                    }}
                    disabled={isSendingReset}
                  >
                    {isSendingReset ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.modalButtonText}>Send Reset Link</Text>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View style={styles.successContainer}>
                    <Icons.CheckCircle size={48} color={Colors.success[500]} />
                    <Text style={styles.successTitle}>Check Your Email</Text>
                    <Text style={styles.successDescription}>
                      We've sent a password reset link to{'\n'}
                      <Text style={styles.successEmail}>{forgotPasswordEmail}</Text>
                    </Text>
                    <Text style={styles.successNote}>
                      Click the link in the email to reset your password. The link will expire in 1 hour.
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => {
                      setShowForgotPassword(false);
                      setForgotPasswordEmail('');
                      setResetSuccess(false);
                    }}
                  >
                    <Text style={styles.modalButtonText}>Got it</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        )}
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -Spacing.sm,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary[500],
  },
  signInButton: {
    backgroundColor: Colors.primary[500],
    borderRadius: BorderRadius.md,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
    ...Shadows.md,
  },
  signInButtonDisabled: {
    opacity: 0.7,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.neutral[300],
  },
  dividerText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginHorizontal: Spacing.md,
  },
  guestButton: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.md,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.neutral[300],
  },
  guestButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  footerText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary[500],
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 400,
    ...Shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  modalDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  modalButton: {
    backgroundColor: Colors.primary[500],
    borderRadius: BorderRadius.md,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
    ...Shadows.md,
  },
  modalButtonDisabled: {
    opacity: 0.7,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  successDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  successEmail: {
    fontWeight: '600',
    color: Colors.text.primary,
  },
  successNote: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: Spacing.md,
    lineHeight: 18,
  },
});
