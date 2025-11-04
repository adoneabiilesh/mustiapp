import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import useAuthStore from '@/store/auth.store';
import { Colors, Spacing, BorderRadius, Shadows } from '@/lib/designSystem';
import { Icons } from '@/lib/icons';
import {
  getUserPaymentMethods,
  deletePaymentMethod,
  setDefaultPaymentMethod,
  PaymentMethod,
} from '@/lib/database';
import * as Haptics from 'expo-haptics';

const PaymentMethodsScreen = () => {
  const { user } = useAuthStore();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPaymentMethods();
    }
  }, [user]);

  const loadPaymentMethods = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const methods = await getUserPaymentMethods(user.id);
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Error loading payment methods:', error);
      Alert.alert('Error', 'Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (methodId: string) => {
    if (!user) return;

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      const success = await setDefaultPaymentMethod(user.id, methodId);
      if (success) {
        // Update local state
        setPaymentMethods(methods =>
          methods.map(m => ({
            ...m,
            is_default: m.id === methodId,
          }))
        );
        Alert.alert('✅ Success', 'Default payment method updated');
      }
    } catch (error) {
      console.error('Error setting default:', error);
      Alert.alert('Error', 'Failed to update default payment method');
    }
  };

  const handleDelete = (method: PaymentMethod) => {
    Alert.alert(
      'Delete Card',
      `Are you sure you want to remove •••• ${method.last4}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }

            try {
              const success = await deletePaymentMethod(method.id);
              if (success) {
                setPaymentMethods(methods => methods.filter(m => m.id !== method.id));
                Alert.alert('✅ Removed', 'Payment method deleted');
              }
            } catch (error) {
              console.error('Error deleting payment method:', error);
              Alert.alert('Error', 'Failed to delete payment method');
            }
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Please sign in to manage payment methods</Text>
          <TouchableOpacity
            onPress={() => router.push('/(auth)/sign-in')}
            style={styles.signInButton}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Icons.ChevronLeft size={24} color={Colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary[500]} />
          </View>
        ) : paymentMethods.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Icons.CreditCard size={64} color={Colors.neutral[300]} />
            </View>
            <Text style={styles.emptyTitle}>No Payment Methods</Text>
            <Text style={styles.emptyDescription}>
              Add a payment method during checkout to save it for future orders
            </Text>
          </View>
        ) : (
          <View style={styles.content}>
            {paymentMethods.map((method) => (
              <View key={method.id} style={styles.cardContainer}>
                <View style={styles.cardContent}>
                  <View style={styles.cardIconContainer}>
                    <Icons.CreditCard size={28} color={Colors.primary[500]} />
                  </View>

                  <View style={styles.cardInfo}>
                    <View style={styles.cardTopRow}>
                      <Text style={styles.cardBrand}>
                        {method.brand || 'Card'}
                      </Text>
                      {method.is_default && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultBadgeText}>Default</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.cardNumber}>•••• •••• •••• {method.last4}</Text>
                    {method.exp_month && method.exp_year && (
                      <Text style={styles.cardExpiry}>
                        Expires {String(method.exp_month).padStart(2, '0')}/{String(method.exp_year).slice(-2)}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.cardActions}>
                  {!method.is_default && (
                    <TouchableOpacity
                      onPress={() => handleSetDefault(method.id)}
                      style={styles.actionButton}
                    >
                      <Text style={styles.actionButtonText}>Set as Default</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    onPress={() => handleDelete(method)}
                    style={styles.deleteButton}
                  >
                    <Icons.Trash2 size={18} color="#F44336" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Icons.Info size={20} color={Colors.primary[500]} />
          <Text style={styles.infoText}>
            Add new payment methods during checkout and choose to save them for faster future purchases
          </Text>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: '#FAF9F6',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontWeight: '600',
    color: Colors.neutral[900],
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: Spacing.xl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontWeight: '600',
    color: Colors.neutral[900],
    marginBottom: Spacing.xs,
  },
  emptyDescription: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: Spacing.lg,
  },
  signInButton: {
    backgroundColor: Colors.primary[500],
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    ...Shadows.sm,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    padding: Spacing.lg,
  },
  cardContainer: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  cardContent: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  cardIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardBrand: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginRight: Spacing.xs,
  },
  defaultBadge: {
    backgroundColor: Colors.success[500],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  defaultBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardNumber: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  cardExpiry: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary[50],
    marginRight: Spacing.sm,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary[500],
    textAlign: 'center',
  },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: Colors.primary[50],
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.primary,
    marginLeft: Spacing.sm,
    lineHeight: 20,
  },
});

export default PaymentMethodsScreen;




