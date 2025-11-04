import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useStripe, usePaymentSheet } from '@stripe/stripe-react-native';
import { createPaymentIntent, confirmPayment, handlePaymentError } from '../lib/payments';
import { Icons } from '../lib/icons';

interface PaymentSheetProps {
  amount: number;
  currency?: string;
  onSuccess: (paymentIntentId: string) => void;
  onCancel: () => void;
  customerEmail?: string;
}

export const PaymentSheet: React.FC<PaymentSheetProps> = ({
  amount,
  currency = 'eur',
  onSuccess,
  onCancel,
  customerEmail,
}) => {
  const { initPaymentSheet, presentPaymentSheet } = usePaymentSheet();
  const [loading, setLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

  useEffect(() => {
    initializePaymentSheet();
  }, [amount]);

  const initializePaymentSheet = async () => {
    try {
      setLoading(true);
      
      // Create payment intent
      const paymentIntent = await createPaymentIntent(amount, currency);
      
      const { error } = await initPaymentSheet({
        merchantDisplayName: 'MustiApp',
        paymentIntentClientSecret: paymentIntent.client_secret,
        customerId: customerEmail,
        customerEphemeralKeySecret: '', // You'll need to implement this
        allowsDelayedPaymentMethods: true,
        defaultBillingDetails: {
          email: customerEmail,
        },
      });

      if (error) {
        console.error('Payment sheet initialization failed:', error);
        Alert.alert('Error', 'Failed to initialize payment. Please try again.');
        return;
      }
    } catch (error) {
      console.error('Payment initialization error:', error);
      Alert.alert('Error', 'Failed to initialize payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      setLoading(true);
      
      const { error } = await presentPaymentSheet();

      if (error) {
        if (error.code === 'Canceled') {
          onCancel();
          return;
        }
        handlePaymentError(error);
        return;
      }

      // Payment succeeded
      onSuccess('payment_intent_id'); // You'll get this from the payment intent
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  return (
    <View className="bg-white rounded-t-3xl p-6 max-h-[80%]">
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-2xl font-bold text-gray-900">Payment</Text>
        <TouchableOpacity onPress={onCancel} className="p-2">
          <Icons name="x" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <View className="bg-gray-50 rounded-xl p-4 mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-2">Order Summary</Text>
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-600">Total Amount</Text>
            <Text className="text-xl font-bold text-gray-900">{formatAmount(amount)}</Text>
          </View>
        </View>

        {/* Payment Methods */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</Text>
          
          {/* Card Payment */}
          <TouchableOpacity
            className="flex-row items-center p-4 border border-gray-200 rounded-xl mb-3"
            onPress={handlePayment}
            disabled={loading}
          >
            <View className="w-12 h-8 bg-red-600 rounded-lg items-center justify-center mr-4">
              <Icons name="credit-card" size={20} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 font-medium">Credit/Debit Card</Text>
              <Text className="text-gray-500 text-sm">Visa, Mastercard, American Express</Text>
            </View>
            <Icons name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Apple Pay */}
          <TouchableOpacity
            className="flex-row items-center p-4 border border-gray-200 rounded-xl mb-3"
            onPress={handlePayment}
            disabled={loading}
          >
            <View className="w-12 h-8 bg-black rounded-lg items-center justify-center mr-4">
              <Icons name="smartphone" size={20} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 font-medium">Apple Pay</Text>
              <Text className="text-gray-500 text-sm">Pay with Touch ID or Face ID</Text>
            </View>
            <Icons name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Google Pay */}
          <TouchableOpacity
            className="flex-row items-center p-4 border border-gray-200 rounded-xl"
            onPress={handlePayment}
            disabled={loading}
          >
            <View className="w-12 h-8 bg-green-600 rounded-lg items-center justify-center mr-4">
              <Icons name="smartphone" size={20} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 font-medium">Google Pay</Text>
              <Text className="text-gray-500 text-sm">Quick and secure payment</Text>
            </View>
            <Icons name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Security Notice */}
        <View className="bg-red-50 rounded-xl p-4 mb-6">
          <View className="flex-row items-center mb-2">
            <Icons name="shield-check" size={20} color="#E53E3E" />
            <Text className="text-red-900 font-medium ml-2">Secure Payment</Text>
          </View>
          <Text className="text-red-800 text-sm">
            Your payment information is encrypted and secure. We never store your card details.
          </Text>
        </View>
      </ScrollView>

      {/* Payment Button */}
      <TouchableOpacity
        className={`py-4 rounded-xl ${loading ? 'bg-gray-300' : 'bg-green-600'}`}
        onPress={handlePayment}
        disabled={loading}
      >
        <View className="flex-row items-center justify-center">
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <Icons name="credit-card" size={20} color="white" />
              <Text className="text-white font-semibold text-lg ml-2">
                Pay {formatAmount(amount)}
              </Text>
            </>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};
