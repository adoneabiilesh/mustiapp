import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { images } from '@/constants';
import OrderTrackingMap from '../components/OrderTrackingMap';
import { useAddressStore } from '../store/address.store';
import { AddressCard } from '../components/AddressCard';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../lib/designSystem';
import { Icons } from '../lib/icons';
import cn from 'clsx';

const OrderTracking = () => {
  const { orderId } = useLocalSearchParams();
  const { defaultAddress } = useAddressStore();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [deliveryPerson, setDeliveryPerson] = useState<any>(null);
  const [showMap, setShowMap] = useState(false);

  const orderSteps = [
    { id: 'placed', title: 'Order Placed', time: '2:30 PM', completed: true },
    { id: 'confirmed', title: 'Order Confirmed', time: '2:32 PM', completed: true },
    { id: 'preparing', title: 'Preparing Food', time: '2:35 PM', completed: true },
    { id: 'out_for_delivery', title: 'Out for Delivery', time: '3:15 PM', completed: true },
    { id: 'delivered', title: 'Delivered', time: '3:45 PM', completed: false },
  ];

  const currentStep = orderSteps.findIndex(step => !step.completed);
  const estimatedDelivery = '3:45 PM';

  useEffect(() => {
    loadOrderData();
  }, [orderId]);

  const loadOrderData = async () => {
    try {
      setLoading(true);
      // Simulate loading order data
      const mockOrder = {
        id: orderId,
        status: 'out_for_delivery',
        total: 25.99,
        estimatedDelivery: '3:45 PM',
        restaurantLocation: {
          latitude: 41.9028,
          longitude: 12.4964,
          name: 'Musti Place Restaurant'
        },
        deliveryPersonLocation: {
          latitude: 41.9038,
          longitude: 12.4974,
          name: 'Marco Rossi'
        },
        customerLocation: {
          latitude: 41.9048,
          longitude: 12.4984
        },
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
        orderTime: '2:30 PM',
      };

      const mockDeliveryPerson = {
        name: 'Marco Rossi',
        rating: 4.8,
        phone: '+39 123 456 7890',
        photo: 'https://ui-avatars.com/api/?name=Marco+Rossi&background=random',
        vehicle: 'Scooter',
        eta: '15 minutes',
      };

      setOrder(mockOrder);
      setDeliveryPerson(mockDeliveryPerson);
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCallDelivery = () => {
    Alert.alert(
      'Call Delivery Person',
      `Call ${deliveryPerson?.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => {
          // In a real app, this would initiate a phone call
          Alert.alert('Calling...', `Calling ${deliveryPerson?.phone}`);
        }}
      ]
    );
  };

  const handleMessageDelivery = () => {
    Alert.alert(
      'Message Delivery Person',
      'Send a message to your delivery person?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send Message', onPress: () => {
          // In a real app, this would open a messaging interface
          Alert.alert('Message', 'Opening messaging interface...');
        }}
      ]
    );
  };

  const handleCancelOrder = () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes, Cancel', style: 'destructive', onPress: () => {
          Alert.alert('Order Cancelled', 'Your order has been cancelled and you will receive a full refund.');
        }}
      ]
    );
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
      {/* Header */}
      <View className="px-5 pt-4 pb-6 border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-4"
          >
            <Image source={images.arrowBack} className="w-5 h-5" tintColor="#333" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-900">Track Order</Text>
            <Text className="text-gray-600">Order #{order?.id?.slice(-6) || '123456'}</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Estimated Delivery Time */}
        <View className="px-5 py-6 bg-blue-50">
          <View className="flex-row items-center justify-center mb-3">
            <Image source={images.clock} className="w-6 h-6 mr-2" tintColor="#3B82F6" />
            <Text className="text-lg font-semibold text-blue-900">Estimated Delivery</Text>
          </View>
          <Text className="text-3xl font-bold text-blue-900 text-center mb-2">
            {estimatedDelivery}
          </Text>
          <Text className="text-blue-700 text-center">
            Your order is on its way!
          </Text>
        </View>

        {/* Progress Tracker */}
        <View className="px-5 py-6">
          <Text className="text-lg font-semibold text-gray-900 mb-6">Order Progress</Text>
          
          <View className="space-y-4">
            {orderSteps.map((step, index) => (
              <View key={step.id} className="flex-row items-center">
                <View className="w-8 h-8 rounded-full items-center justify-center mr-4">
                  {step.completed ? (
                    <View className="w-8 h-8 bg-green-500 rounded-full items-center justify-center">
                      <Image source={images.check} className="w-4 h-4" tintColor="white" />
                    </View>
                  ) : index === currentStep ? (
                    <View className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center">
                      <View className="w-3 h-3 bg-white rounded-full" />
                    </View>
                  ) : (
                    <View className="w-8 h-8 border-2 border-gray-300 rounded-full" />
                  )}
                </View>
                
                <View className="flex-1">
                  <Text className={cn(
                    'font-medium',
                    step.completed ? 'text-green-600' : 
                    index === currentStep ? 'text-blue-600' : 'text-gray-500'
                  )}>
                    {step.title}
                  </Text>
                  <Text className="text-sm text-gray-500">{step.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Delivery Person Details */}
        {deliveryPerson && (
          <View className="px-5 py-6 bg-white border-t border-gray-200">
            <Text className="text-lg font-semibold text-gray-900 mb-4">Delivery Person</Text>
            
            <View className="bg-gray-50 rounded-xl p-4">
              <View className="flex-row items-center mb-4">
                <Image 
                  source={{ uri: deliveryPerson.photo }} 
                  className="w-12 h-12 rounded-full mr-4"
                />
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-gray-900">
                    {deliveryPerson.name}
                  </Text>
                  <View className="flex-row items-center">
                    <Image source={images.star} className="w-4 h-4 mr-1" tintColor="#FFD700" />
                    <Text className="text-gray-600">{deliveryPerson.rating} ★</Text>
                  </View>
                </View>
              </View>
              
              <View className="flex-row items-center justify-between">
                <TouchableOpacity
                  onPress={handleCallDelivery}
                  className="flex-1 bg-green-500 py-3 rounded-lg items-center mr-2"
                >
                  <Image source={images.phone} className="w-5 h-5 mb-1" tintColor="white" />
                  <Text className="text-white font-medium">Call</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={handleMessageDelivery}
                  className="flex-1 bg-blue-500 py-3 rounded-lg items-center ml-2"
                >
                  <Image source={images.envelope} className="w-5 h-5 mb-1" tintColor="white" />
                  <Text className="text-white font-medium">Message</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Map View */}
        <View className="px-5 py-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-gray-900">Live Tracking</Text>
            <TouchableOpacity
              onPress={() => setShowMap(!showMap)}
              className="bg-blue-500 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-medium">
                {showMap ? 'Hide Map' : 'Show Map'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {showMap ? (
            <View className="h-80 rounded-xl overflow-hidden">
              <OrderTrackingMap
                orderId={order?.id || ''}
                restaurantLocation={order?.restaurantLocation || {
                  latitude: 41.9028,
                  longitude: 12.4964,
                  name: 'Restaurant'
                }}
                deliveryPersonLocation={order?.deliveryPersonLocation}
                customerLocation={order?.customerLocation}
                orderStatus={order?.status || 'preparing'}
              />
            </View>
          ) : (
            <View className="bg-gray-100 rounded-xl h-48 items-center justify-center">
              <Image source={images.location} className="w-12 h-12 mb-3" tintColor="#6B7280" />
              <Text className="text-gray-600 font-medium">Map View</Text>
              <Text className="text-gray-500 text-sm">Real-time delivery tracking</Text>
            </View>
          )}
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

        {/* Order Details */}
        <View className="px-5 py-6">
          <TouchableOpacity
            onPress={() => setShowDetails(!showDetails)}
            className="bg-white border border-gray-200 rounded-xl p-6"
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-gray-900">Order Details</Text>
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
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View className="px-5 py-6">
          <View className="flex-row space-x-3">
            <TouchableOpacity className="flex-1 bg-gray-100 py-3 rounded-lg items-center">
              <Text className="text-gray-700 font-medium">Need Help?</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleCancelOrder}
              className="flex-1 bg-red-100 py-3 rounded-lg items-center"
            >
              <Text className="text-red-600 font-medium">Cancel Order</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OrderTracking;
