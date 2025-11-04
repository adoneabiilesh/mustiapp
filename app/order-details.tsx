import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { images } from '@/constants';
import { useCartStore } from '../store/cart.store';
import { getImageSource } from '../lib/imageUtils';
import { supabase } from '../lib/supabase';
import { cn } from '@/lib/utils';

const OrderDetails = () => {
  const { orderId } = useLocalSearchParams();
  const { addItem } = useCartStore();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrderDetails();
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      console.log('Loading order details for ID:', orderId);
      
      // Fetch order with items from database
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            menu_items (
              name,
              description,
              image_url,
              price
            )
          )
        `)
        .eq('id', orderId)
        .single();

      if (orderError) {
        console.error('Order fetch error:', orderError);
        throw orderError;
      }

      console.log('Order data fetched:', orderData);
      console.log('Delivery address type:', typeof orderData.delivery_address);
      console.log('Delivery address value:', orderData.delivery_address);
      setOrder(orderData);
    } catch (error) {
      console.error('Error loading order details:', error);
      Alert.alert('Error', 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'out_for_delivery': return 'text-red-600 bg-red-100';
      case 'preparing': return 'text-orange-600 bg-orange-100';
      case 'confirmed': return 'text-purple-600 bg-purple-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered': return 'Delivered';
      case 'out_for_delivery': return 'Out for Delivery';
      case 'preparing': return 'Preparing';
      case 'confirmed': return 'Confirmed';
      case 'pending': return 'Pending';
      case 'cancelled': return 'Cancelled';
      default: return 'Unknown';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleReorder = () => {
    if (order?.order_items) {
      order.order_items.forEach((item: any) => {
        addItem({
          id: item.menu_item_id,
          name: item.menu_items?.name || 'Unknown Item',
          price: item.unit_price,
          quantity: item.quantity,
          customizations: item.customizations || [],
        });
      });
      router.push('/(tabs)/cart');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={{ marginTop: 10, fontSize: 16, color: '#666666' }}>
            Loading order details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, color: '#666666', textAlign: 'center' }}>
            Order not found
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              marginTop: 20,
              backgroundColor: '#007AFF',
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 16 }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#f0f0f0',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginLeft: 15 }}>
          Order Details
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ padding: 20 }}>
          {/* Order Status */}
          <View style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            padding: 20,
            marginBottom: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#333333' }}>
                Order Status
              </Text>
              <View style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
                backgroundColor: getStatusColor(order.status).includes('green') ? '#E8F5E8' : 
                               getStatusColor(order.status).includes('red') ? '#FEF2F2' :
                               getStatusColor(order.status).includes('orange') ? '#FFF3E0' :
                               getStatusColor(order.status).includes('purple') ? '#F3E5F5' :
                               getStatusColor(order.status).includes('yellow') ? '#FFFDE7' :
                               getStatusColor(order.status).includes('red') ? '#FFEBEE' : '#F5F5F5',
              }}>
                <Text style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: getStatusColor(order.status).includes('green') ? '#2E7D32' :
                         getStatusColor(order.status).includes('red') ? '#E53E3E' :
                         getStatusColor(order.status).includes('orange') ? '#F57C00' :
                         getStatusColor(order.status).includes('purple') ? '#7B1FA2' :
                         getStatusColor(order.status).includes('yellow') ? '#F9A825' :
                         getStatusColor(order.status).includes('red') ? '#D32F2F' : '#666666',
                }}>
                  {getStatusText(order.status)}
                </Text>
              </View>
            </View>
            <Text style={{ fontSize: 14, color: '#666666' }}>
              Order #{order.id.slice(-6)}
            </Text>
            <Text style={{ fontSize: 14, color: '#666666', marginTop: 5 }}>
              {formatDate(order.created_at)}
            </Text>
          </View>

          {/* Order Items */}
          <View style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            padding: 20,
            marginBottom: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#333333', marginBottom: 15 }}>
              Order Items
            </Text>
            {order.order_items?.map((item: any, index: number) => (
              <View key={index} style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 15,
                borderBottomWidth: index < order.order_items.length - 1 ? 1 : 0,
                borderBottomColor: '#F0F0F0',
              }}>
                <Image
                  source={getImageSource(item.menu_items?.image_url)}
                  style={{ width: 60, height: 60, borderRadius: 8, marginRight: 15 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#333333' }}>
                    {item.menu_items?.name || 'Unknown Item'}
                  </Text>
                  <Text style={{ fontSize: 14, color: '#666666', marginTop: 2 }}>
                    Quantity: {item.quantity}
                  </Text>
                  {item.customizations && item.customizations.length > 0 && (
                    <View style={{ marginTop: 5 }}>
                      {item.customizations.map((custom: any, customIndex: number) => (
                        <Text key={customIndex} style={{ fontSize: 12, color: '#888888' }}>
                          {custom.name}: {custom.value}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#333333' }}>
                  €{(item.unit_price * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>

          {/* Delivery Information */}
          <View style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            padding: 20,
            marginBottom: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#333333', marginBottom: 15 }}>
              Delivery Information
            </Text>
            <View style={{ marginBottom: 10 }}>
              <Text style={{ fontSize: 14, color: '#666666', marginBottom: 5 }}>
                Delivery Address
              </Text>
              <Text style={{ fontSize: 14, color: '#333333', lineHeight: 20 }}>
                {order.delivery_address || 'Address not available'}
              </Text>
            </View>
            {order.special_instructions && (
              <View>
                <Text style={{ fontSize: 14, color: '#666666', marginBottom: 5 }}>
                  Special Instructions
                </Text>
                <Text style={{ fontSize: 14, color: '#333333', lineHeight: 20 }}>
                  {order.special_instructions}
                </Text>
              </View>
            )}
          </View>

          {/* Order Summary */}
          <View style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            padding: 20,
            marginBottom: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#333333', marginBottom: 15 }}>
              Order Summary
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text style={{ fontSize: 14, color: '#666666' }}>Subtotal</Text>
              <Text style={{ fontSize: 14, color: '#333333' }}>€{order.total.toFixed(2)}</Text>
            </View>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              borderTopWidth: 1,
              borderTopColor: '#E0E0E0',
              paddingTop: 10,
              marginTop: 10,
            }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#333333' }}>Total</Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#333333' }}>€{order.total.toFixed(2)}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={{ flexDirection: 'row', gap: 15 }}>
            <TouchableOpacity
              onPress={handleReorder}
              style={{
                flex: 1,
                backgroundColor: '#007AFF',
                paddingVertical: 15,
                borderRadius: 12,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
                Reorder
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/home')}
              style={{
                flex: 1,
                backgroundColor: '#FFFFFF',
                paddingVertical: 15,
                borderRadius: 12,
                alignItems: 'center',
                borderWidth: 2,
                borderColor: '#007AFF',
              }}
            >
              <Text style={{ color: '#007AFF', fontSize: 16, fontWeight: '600' }}>
                Continue Shopping
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OrderDetails;