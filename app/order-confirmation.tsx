import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Animated,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { images } from '@/constants';
import { createOrder } from '../lib/supabase';
import useAuthStore from '../store/auth.store';
import { useCartStore } from '../store/cart.store';
import { useAddressStore } from '../store/address.store';
import { AddressCard } from '../components/AddressCard';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../lib/designSystem';
import { Icons } from '../lib/icons';

const OrderConfirmation = () => {
  const { orderId } = useLocalSearchParams();
  const { user } = useAuthStore();
  const { clearCart } = useCartStore();
  const { defaultAddress } = useAddressStore();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [checkmarkScale] = useState(new Animated.Value(0));

  useEffect(() => {
    if (orderId) {
      loadOrderDetails();
    }
    animateCheckmark();
  }, [orderId]);

  const animateCheckmark = () => {
    Animated.sequence([
      Animated.timing(checkmarkScale, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(checkmarkScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      // In a real app, you would fetch order details from the backend
      // For now, we'll simulate the order data
      const mockOrder = {
        id: orderId,
        status: 'confirmed',
        total: 25.99,
        estimatedDelivery: '30-45 minutes',
        items: [
          { name: 'Classic Cheeseburger', quantity: 1, price: 12.99 },
          { name: 'French Fries', quantity: 1, price: 4.99 },
          { name: 'Coca Cola', quantity: 1, price: 2.99 },
        ],
        deliveryAddress: {
          street: '123 Main St',
          city: 'Rome',
          zip: '00100',
        },
        paymentMethod: 'Credit Card',
        orderTime: new Date().toLocaleString(),
      };
      setOrder(mockOrder);
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEstimatedDeliveryTime = () => {
    const now = new Date();
    const deliveryTime = new Date(now.getTime() + 45 * 60000); // 45 minutes from now
    return deliveryTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-gray-600">Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Success Animation */}
        <View className="items-center py-12">
          <Animated.View
            style={{
              transform: [{ scale: checkmarkScale }],
            }}
            className="w-24 h-24 bg-green-500 rounded-full items-center justify-center mb-6"
          >
            <Image source={images.check} className="w-12 h-12" tintColor="white" />
          </Animated.View>
          
          <Text className="text-3xl font-bold text-gray-900 mb-2">
            Order Placed Successfully!
          </Text>
          <Text className="text-gray-600 text-center mb-6">
            Your order has been confirmed and is being prepared
          </Text>
          
          <View className="bg-green-50 px-6 py-4 rounded-xl mb-6">
            <Text className="text-green-800 font-semibold text-center">
              Order #{order?.id?.slice(-6) || '123456'}
            </Text>
          </View>
        </View>

        {/* Estimated Delivery */}
        <View className="px-5 mb-6">
          <View className="bg-blue-50 rounded-xl p-6">
            <View className="flex-row items-center mb-3">
              <Image source={images.clock} className="w-6 h-6 mr-3" tintColor="#3B82F6" />
              <Text className="text-lg font-semibold text-blue-900">Estimated Delivery</Text>
            </View>
            <Text className="text-2xl font-bold text-blue-900 mb-2">
              {getEstimatedDeliveryTime()}
            </Text>
            <Text className="text-blue-700">
              Your order will arrive in approximately 30-45 minutes
            </Text>
          </View>
        </View>

        {/* Delivery Address */}
        {defaultAddress && (
          <View style={{ paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md }}>
            <View style={{
              backgroundColor: '#FFFFFF',
              borderRadius: BorderRadius.lg,
              padding: Spacing.lg,
              ...Shadows.sm,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md }}>
                <Icons.Location size={20} color={Colors.primary[500]} />
                <Text style={[Typography.h6, { color: Colors.neutral[900], marginLeft: Spacing.sm }]}>
                  Delivery Address
                </Text>
              </View>
              <AddressCard
                address={defaultAddress}
                variant="minimal"
                showActions={false}
              />
            </View>
          </View>
        )}

        {/* Order Summary */}
        <View className="px-5 mb-6">
          <TouchableOpacity
            onPress={() => setShowDetails(!showDetails)}
            className="bg-white border border-gray-200 rounded-xl p-6"
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-gray-900">Order Summary</Text>
              <Image 
                source={images.arrowDown} 
                className="w-5 h-5" 
                tintColor="#6B7280"
                style={{ transform: [{ rotate: showDetails ? '180deg' : '0deg' }] }}
              />
            </View>
            
            {showDetails && (
              <View className="mt-4 space-y-3">
                {order?.items?.map((item: any, index: number) => (
                  <View key={index} className="flex-row justify-between">
                    <Text className="text-gray-700">
                      {item.quantity}x {item.name}
                    </Text>
                    <Text className="text-gray-900 font-medium">
                      €{(item.price * item.quantity).toFixed(2)}
                    </Text>
                  </View>
                ))}
                
                <View className="border-t border-gray-200 pt-3">
                  <View className="flex-row justify-between">
                    <Text className="text-lg font-bold text-gray-900">Total</Text>
                    <Text className="text-lg font-bold text-gray-900">
                      €{order?.total?.toFixed(2) || '25.99'}
                    </Text>
                  </View>
                </View>
                
                <View className="mt-4 space-y-2">
                  <View className="flex-row justify-between">
                    <Text className="text-gray-600">Delivery Address</Text>
                    <Text className="text-gray-900 text-right">
                      {order?.deliveryAddress?.street}
                      {'\n'}{order?.deliveryAddress?.city}, {order?.deliveryAddress?.zip}
                    </Text>
                  </View>
                  
                  <View className="flex-row justify-between">
                    <Text className="text-gray-600">Payment Method</Text>
                    <Text className="text-gray-900">{order?.paymentMethod}</Text>
                  </View>
                  
                  <View className="flex-row justify-between">
                    <Text className="text-gray-600">Order Time</Text>
                    <Text className="text-gray-900">{order?.orderTime}</Text>
                  </View>
                </View>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View className="px-5 mb-8">
          <TouchableOpacity
            onPress={() => router.push(`/order-tracking?orderId=${orderId}`)}
            className="bg-green-500 py-4 rounded-xl items-center mb-4"
          >
            <Text className="text-white text-lg font-bold">Track Order</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/index')}
            className="bg-gray-100 py-4 rounded-xl items-center"
          >
            <Text className="text-gray-700 text-lg font-medium">Back to Home</Text>
          </TouchableOpacity>
        </View>

        {/* Help Section */}
        <View className="px-5 mb-8">
          <View className="bg-gray-50 rounded-xl p-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3">Need Help?</Text>
            <Text className="text-gray-600 mb-4">
              If you have any questions about your order, our support team is here to help.
            </Text>
            
            <View className="space-y-3">
              <TouchableOpacity className="flex-row items-center">
                <Image source={images.phone} className="w-5 h-5 mr-3" tintColor="#6B7280" />
                <Text className="text-blue-600 font-medium">Call Support</Text>
              </TouchableOpacity>
              
              <TouchableOpacity className="flex-row items-center">
                <Image source={images.envelope} className="w-5 h-5 mr-3" tintColor="#6B7280" />
                <Text className="text-blue-600 font-medium">Email Support</Text>
              </TouchableOpacity>
              
              <TouchableOpacity className="flex-row items-center">
                <Image source={images.envelope} className="w-5 h-5 mr-3" tintColor="#6B7280" />
                <Text className="text-blue-600 font-medium">Live Chat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OrderConfirmation;
