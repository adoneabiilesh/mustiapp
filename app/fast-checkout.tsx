/**
 * FAST CHECKOUT - One-Tap Payment
 * Complete order in under 3 seconds! ⚡
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Animated,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/lib/designSystem';
import { Icons } from '@/lib/icons';
import { useCartStore } from '@/store/cart.store';
import useAuthStore from '@/store/auth.store';
import { useSmartCache, useOptimisticUpdate } from '@/lib/performance';
import * as Haptics from 'expo-haptics';

interface SavedPaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'google_pay' | 'apple_pay';
  last4?: string;
  brand?: string;
  email?: string;
  isDefault: boolean;
}

interface SavedAddress {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  isDefault: boolean;
}

const FastCheckoutScreen = () => {
  const { items, total, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [selectedAddress, setSelectedAddress] = useState<SavedAddress | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<SavedPaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const scaleAnim = new Animated.Value(1);

  // Load saved addresses and payment methods from cache
  const { data: savedAddresses } = useSmartCache<SavedAddress[]>(
    `addresses_${user?.id}`,
    async () => {
      // Fetch saved addresses from database
      // In production: Replace with actual API call
      // const { data } = await supabase.from('user_addresses').select('*').eq('user_id', user?.id);
      
      return [
        {
          id: '1',
          label: 'Home',
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zip: '10001',
          isDefault: true,
        },
      ];
    }
  );

  const { data: savedPayments } = useSmartCache<SavedPaymentMethod[]>(
    `payments_${user?.id}`,
    async () => {
      // Fetch saved payment methods from database
      // In production: Replace with actual API call
      // const { data } = await supabase.from('payment_methods').select('*').eq('user_id', user?.id);
      
      return [
        {
          id: '1',
          type: 'card',
          last4: '4242',
          brand: 'Visa',
          isDefault: true,
        },
      ];
    }
  );

  // Auto-select default address and payment
  useEffect(() => {
    if (savedAddresses) {
      const defaultAddr = savedAddresses.find(a => a.isDefault) || savedAddresses[0];
      setSelectedAddress(defaultAddr);
    }
  }, [savedAddresses]);

  useEffect(() => {
    if (savedPayments) {
      const defaultPay = savedPayments.find(p => p.isDefault) || savedPayments[0];
      setSelectedPayment(defaultPay);
    }
  }, [savedPayments]);

  const handleOneTapCheckout = async () => {
    if (!selectedAddress || !selectedPayment) {
      Alert.alert('Missing Information', 'Please select address and payment method');
      return;
    }

    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Animate button
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setIsProcessing(true);

    try {
      // Simulate payment processing (replace with actual payment API)
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Process order
      const orderData = {
        items,
        total,
        address: selectedAddress,
        payment: selectedPayment,
        userId: user?.id,
        createdAt: new Date().toISOString(),
      };

      console.log('Order placed:', orderData);

      // Success haptic
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      setOrderPlaced(true);
      clearCart();

      // Navigate to success screen
      setTimeout(() => {
        router.replace('/order-success');
      }, 1000);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to process order. Please try again.');
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background[50] }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl }}>
          <Icons.ShoppingBag size={64} color={Colors.neutral[300]} />
          <Text style={[Typography.h3, { marginTop: Spacing.lg, textAlign: 'center' }]}>
            Your cart is empty
          </Text>
          <TouchableOpacity
            style={{
              marginTop: Spacing.lg,
              backgroundColor: Colors.primary[500],
              paddingHorizontal: Spacing.xl,
              paddingVertical: Spacing.md,
              borderRadius: BorderRadius.lg,
            }}
            onPress={() => router.back()}
          >
            <Text style={[Typography.buttonLarge, { color: 'white' }]}>
              Start Shopping
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background[50] }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: Colors.neutral[200],
        ...Shadows.sm,
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: Spacing.md }}>
          <Icons.ArrowLeft size={24} color={Colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={Typography.h2}>Fast Checkout ⚡</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: Spacing.lg }}>
        {/* Order Summary */}
        <View style={{
          backgroundColor: 'white',
          borderRadius: BorderRadius.lg,
          padding: Spacing.lg,
          marginBottom: Spacing.lg,
          ...Shadows.sm,
        }}>
          <Text style={[Typography.h3, { marginBottom: Spacing.md }]}>
            Order Summary
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={Typography.body}>{items.length} items</Text>
            <Text style={[Typography.h3, { color: Colors.primary[500] }]}>
              €{total.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Delivery Address */}
        <View style={{
          backgroundColor: 'white',
          borderRadius: BorderRadius.lg,
          padding: Spacing.lg,
          marginBottom: Spacing.lg,
          ...Shadows.sm,
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md }}>
            <Text style={Typography.h3}>Delivery Address</Text>
            <TouchableOpacity onPress={() => {/* Navigate to address selector */}}>
              <Text style={[Typography.link, { color: Colors.primary[500] }]}>Change</Text>
            </TouchableOpacity>
          </View>
          
          {selectedAddress ? (
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <Icons.MapPin size={20} color={Colors.primary[500]} style={{ marginRight: Spacing.sm }} />
              <View style={{ flex: 1 }}>
                <Text style={Typography.semibold}>{selectedAddress.label}</Text>
                <Text style={Typography.bodySmall}>
                  {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state} {selectedAddress.zip}
                </Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={{
                padding: Spacing.md,
                borderWidth: 1,
                borderColor: Colors.primary[500],
                borderRadius: BorderRadius.md,
                borderStyle: 'dashed',
              }}
              onPress={() => {/* Navigate to add address */}}
            >
              <Text style={[Typography.semibold, { color: Colors.primary[500], textAlign: 'center' }]}>
                + Add Delivery Address
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Payment Method */}
        <View style={{
          backgroundColor: 'white',
          borderRadius: BorderRadius.lg,
          padding: Spacing.lg,
          marginBottom: Spacing.lg,
          ...Shadows.sm,
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md }}>
            <Text style={Typography.h3}>Payment Method</Text>
            <TouchableOpacity onPress={() => {/* Navigate to payment selector */}}>
              <Text style={[Typography.link, { color: Colors.primary[500] }]}>Change</Text>
            </TouchableOpacity>
          </View>
          
          {selectedPayment ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icons.CreditCard size={20} color={Colors.primary[500]} style={{ marginRight: Spacing.sm }} />
              <View style={{ flex: 1 }}>
                <Text style={Typography.semibold}>
                  {selectedPayment.brand} •••• {selectedPayment.last4}
                </Text>
                <Text style={Typography.bodySmall}>Default payment</Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={{
                padding: Spacing.md,
                borderWidth: 1,
                borderColor: Colors.primary[500],
                borderRadius: BorderRadius.md,
                borderStyle: 'dashed',
              }}
              onPress={() => {/* Navigate to add payment */}}
            >
              <Text style={[Typography.semibold, { color: Colors.primary[500], textAlign: 'center' }]}>
                + Add Payment Method
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Success Message */}
        {orderPlaced && (
          <View style={{
            backgroundColor: Colors.success[50],
            borderRadius: BorderRadius.lg,
            padding: Spacing.lg,
            marginBottom: Spacing.lg,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <Icons.CheckCircle size={24} color={Colors.success[500]} />
            <Text style={[Typography.semibold, { color: Colors.success[700], marginLeft: Spacing.sm }]}>
              Order placed successfully! ✨
            </Text>
          </View>
        )}
      </ScrollView>

      {/* One-Tap Checkout Button */}
      <View style={{
        padding: Spacing.lg,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: Colors.neutral[200],
        ...Shadows.lg,
      }}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            style={{
              backgroundColor: isProcessing || orderPlaced ? Colors.neutral[400] : Colors.primary[500],
              paddingVertical: Spacing.lg,
              borderRadius: BorderRadius.lg,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              ...Shadows.md,
            }}
            onPress={handleOneTapCheckout}
            disabled={isProcessing || orderPlaced || !selectedAddress || !selectedPayment}
          >
            {isProcessing ? (
              <>
                <ActivityIndicator color="white" />
                <Text style={[Typography.buttonLarge, { color: 'white', marginLeft: Spacing.sm }]}>
                  Processing...
                </Text>
              </>
            ) : orderPlaced ? (
              <>
                <Icons.CheckCircle size={24} color="white" />
                <Text style={[Typography.buttonLarge, { color: 'white', marginLeft: Spacing.sm }]}>
                  Order Placed!
                </Text>
              </>
            ) : (
              <>
                <Icons.Zap size={24} color="white" />
                <Text style={[Typography.buttonLarge, { color: 'white', marginLeft: Spacing.sm }]}>
                  Place Order - €{total.toFixed(2)}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>

        <Text style={[Typography.caption, { textAlign: 'center', marginTop: Spacing.sm, color: Colors.neutral[500] }]}>
          By placing order, you agree to our Terms & Conditions
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default FastCheckoutScreen;

