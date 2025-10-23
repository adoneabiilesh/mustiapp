import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Animated,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

export default function OrderSuccessScreen() {
  const params = useLocalSearchParams();
  const [scaleAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));

  const orderNumber = params.orderNumber as string;
  const total = params.total as string;
  const deliveryAddress = params.deliveryAddress as string;
  const customerName = params.customerName as string;

  useEffect(() => {
    // Success animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const estimatedDeliveryTime = new Date();
  estimatedDeliveryTime.setMinutes(estimatedDeliveryTime.getMinutes() + 30);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
          {/* Success Animation */}
          <Animated.View
            style={{
              alignItems: 'center',
              marginBottom: 30,
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            }}
          >
            <View style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: '#4CAF50',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
              shadowColor: '#4CAF50',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}>
              <Text style={{ fontSize: 60, color: '#FFFFFF' }}>✓</Text>
            </View>
            
            <Text style={{
              fontSize: 28,
              fontWeight: 'bold',
              color: '#2E7D32',
              textAlign: 'center',
              marginBottom: 10,
            }}>
              Order Placed Successfully!
            </Text>
            
            <Text style={{
              fontSize: 16,
              color: '#666666',
              textAlign: 'center',
              marginBottom: 20,
            }}>
              Your order has been confirmed and is being prepared
            </Text>
          </Animated.View>

          {/* Order Details */}
          <Animated.View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              padding: 20,
              marginBottom: 20,
              opacity: fadeAnim,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: '#333333',
              marginBottom: 15,
            }}>
              Order Details
            </Text>
            
            <View style={{ marginBottom: 15 }}>
              <Text style={{ fontSize: 14, color: '#666666', marginBottom: 5 }}>
                Order Number
              </Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#333333' }}>
                #{orderNumber}
              </Text>
            </View>
            
            <View style={{ marginBottom: 15 }}>
              <Text style={{ fontSize: 14, color: '#666666', marginBottom: 5 }}>
                Estimated Delivery
              </Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#333333' }}>
                {estimatedDeliveryTime.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
            </View>
            
            <View style={{ marginBottom: 15 }}>
              <Text style={{ fontSize: 14, color: '#666666', marginBottom: 5 }}>
                Total Amount
              </Text>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#2E7D32' }}>
                €{total}
              </Text>
            </View>
            
            <View>
              <Text style={{ fontSize: 14, color: '#666666', marginBottom: 5 }}>
                Delivery Address
              </Text>
              <Text style={{ fontSize: 14, color: '#333333', lineHeight: 20 }}>
                {deliveryAddress}
              </Text>
            </View>
          </Animated.View>

          {/* Action Buttons */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              gap: 15,
            }}
          >
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/orders')}
              style={{
                backgroundColor: '#007AFF',
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: 'center',
                shadowColor: '#007AFF',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Text style={{
                color: '#FFFFFF',
                fontSize: 16,
                fontWeight: '600',
              }}>
                Track Order
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/home')}
              style={{
                backgroundColor: '#FFFFFF',
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: 'center',
                borderWidth: 2,
                borderColor: '#007AFF',
              }}
            >
              <Text style={{
                color: '#007AFF',
                fontSize: 16,
                fontWeight: '600',
              }}>
                Back to Home
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
