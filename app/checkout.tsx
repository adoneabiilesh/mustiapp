import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { useCartStore } from '../store/cart.store';
import useAuthStore from '../store/auth.store';
import { createOrder } from '../lib/supabase';
import { SimplePaymentSheet } from '../components/SimplePaymentSheet';
import { useNotifications } from '../hooks/useNotifications';
import { Icons } from '../lib/icons';

const Checkout = () => {
  const { items, getTotalItems, getTotalPrice, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { sendOrderNotification } = useNotifications();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);
  
  // Simple address field
  const [customerName, setCustomerName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash' | 'wallet'>('card');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();
  const deliveryFee = 5.00;
  const tax = totalPrice * 0.10;
  const finalTotal = totalPrice + deliveryFee + tax;

  useEffect(() => {
    if (user?.$id) {
      setPhoneNumber((user as any)?.phone || '');
    }
  }, [user?.$id]);

  const handlePlaceOrder = async () => {
    if (!user?.$id) {
      Alert.alert('Error', 'Please sign in to place an order');
      return;
    }

    if (!customerName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!deliveryAddress.trim()) {
      Alert.alert('Error', 'Please enter your delivery address');
      return;
    }

    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    if (!acceptTerms) {
      Alert.alert('Error', 'Please accept the terms and conditions');
      return;
    }

    // Show payment sheet for card payments
    if (paymentMethod === 'card') {
      setShowPaymentSheet(true);
      return;
    }

    // For cash payments, proceed directly
    await processOrder();
  };

  const processOrder = async (paymentIntentId?: string) => {
    setIsProcessing(true);

    try {
      const orderData = {
        customer_id: user.$id,
        customer_name: customerName,
        delivery_address: deliveryAddress,
        phone_number: phoneNumber,
        items: items.map(item => ({
          menu_item_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
          customizations: item.customizations || []
        })),
        total: finalTotal,
        status: paymentMethod === 'cash' ? 'pending' : 'confirmed',
        special_instructions: deliveryInstructions,
        payment_intent_id: paymentIntentId,
      };

      console.log('Creating order with data:', orderData);
      const order = await createOrder(orderData);
      console.log('✅ Order created:', order.id);

      // Send notification
      await sendOrderNotification(order.id, 'order_confirmed', order.id.slice(-6));

      // Clear cart after successful order
      clearCart();

      // Navigate to order success screen
      router.push({
        pathname: '/order-success',
        params: {
          orderId: order.id,
          orderNumber: order.id.slice(-6),
          total: finalTotal.toFixed(2),
          deliveryAddress: deliveryAddress,
          customerName: customerName,
        }
      });

    } catch (error) {
      console.error('❌ Order creation failed:', error);
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = (paymentIntentId: string) => {
    setShowPaymentSheet(false);
    processOrder(paymentIntentId);
  };

  const handlePaymentCancel = () => {
    setShowPaymentSheet(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={{ flex: 1 }}>
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
            Checkout
          </Text>
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ padding: 20 }}>
          {/* Customer Name */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 10 }}>
              Your Name *
            </Text>
            <TextInput
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 8,
                paddingHorizontal: 15,
                paddingVertical: 12,
                borderWidth: 1,
                borderColor: '#E0E0E0',
                fontSize: 16,
              }}
              placeholder="Enter your full name"
              value={customerName}
              onChangeText={setCustomerName}
            />
          </View>

          {/* Delivery Address */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 10 }}>
              Delivery Address *
            </Text>
              <TextInput
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 8,
                  paddingHorizontal: 15,
                  paddingVertical: 12,
                  borderWidth: 1,
                  borderColor: '#E0E0E0',
                  fontSize: 16,
                  minHeight: 100,
                  textAlignVertical: 'top',
                }}
                placeholder="Enter your complete delivery address"
                value={deliveryAddress}
                onChangeText={setDeliveryAddress}
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Phone Number */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 10 }}>
                Phone Number *
              </Text>
              <TextInput
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 8,
                  paddingHorizontal: 15,
                  paddingVertical: 12,
                  borderWidth: 1,
                  borderColor: '#E0E0E0',
                  fontSize: 16,
                }}
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />
            </View>

            {/* Delivery Instructions */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 10 }}>
                Delivery Instructions (Optional)
              </Text>
              <TextInput
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 8,
                  paddingHorizontal: 15,
                  paddingVertical: 12,
                  borderWidth: 1,
                  borderColor: '#E0E0E0',
                  fontSize: 16,
                  minHeight: 80,
                  textAlignVertical: 'top',
                }}
                placeholder="Any special instructions for delivery?"
                value={deliveryInstructions}
                onChangeText={setDeliveryInstructions}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Payment Method */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 10 }}>
                Payment Method
              </Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {[
                  { key: 'card', label: 'Card', icon: '💳' },
                  { key: 'cash', label: 'Cash', icon: '💵' },
                  { key: 'wallet', label: 'Wallet', icon: '📱' },
                ].map((method) => (
                  <TouchableOpacity
                    key={method.key}
                    onPress={() => setPaymentMethod(method.key as any)}
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 15,
                      backgroundColor: paymentMethod === method.key ? '#007AFF' : '#FFFFFF',
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: paymentMethod === method.key ? '#007AFF' : '#E0E0E0',
                    }}
                  >
                    <Text style={{ marginRight: 5 }}>{method.icon}</Text>
                    <Text style={{
                      color: paymentMethod === method.key ? '#FFFFFF' : '#666666',
                      fontWeight: '500',
                    }}>
                      {method.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Terms and Conditions */}
            <View style={{ marginBottom: 20 }}>
              <TouchableOpacity
                onPress={() => setAcceptTerms(!acceptTerms)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 15,
                  backgroundColor: '#FFFFFF',
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: acceptTerms ? '#007AFF' : '#E0E0E0',
                }}
              >
                <View style={{
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  borderWidth: 2,
                  borderColor: acceptTerms ? '#007AFF' : '#E0E0E0',
                  backgroundColor: acceptTerms ? '#007AFF' : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 10,
                }}>
                  {acceptTerms && <Text style={{ color: '#FFFFFF', fontSize: 12 }}>✓</Text>}
                </View>
                <Text style={{ flex: 1, fontSize: 14, color: '#666666' }}>
                  I accept the terms and conditions
                </Text>
              </TouchableOpacity>
            </View>

            {/* Order Summary */}
            <View style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 8,
              padding: 15,
              marginBottom: 20,
            }}>
              <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 10 }}>
                Order Summary
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                <Text>Items ({totalItems})</Text>
                <Text>€{totalPrice.toFixed(2)}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                <Text>Delivery Fee</Text>
                <Text>€{deliveryFee.toFixed(2)}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                <Text>Tax</Text>
                <Text>€{tax.toFixed(2)}</Text>
              </View>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                borderTopWidth: 1,
                borderTopColor: '#E0E0E0',
                paddingTop: 10,
              }}>
                <Text style={{ fontSize: 16, fontWeight: '600' }}>Total</Text>
                <Text style={{ fontSize: 16, fontWeight: '600' }}>€{finalTotal.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={{
          padding: 20,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
        }}>
          <TouchableOpacity
            onPress={handlePlaceOrder}
            disabled={isProcessing}
            style={{
              backgroundColor: isProcessing ? '#CCCCCC' : '#007AFF',
              paddingVertical: 15,
              borderRadius: 8,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
              {isProcessing ? 'Processing...' : `Place Order - €${finalTotal.toFixed(2)}`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Payment Sheet Modal */}
      <Modal
        visible={showPaymentSheet}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handlePaymentCancel}
      >
        <SimplePaymentSheet
          amount={finalTotal}
          currency="eur"
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
          customerEmail={user?.email}
        />
      </Modal>
    </SafeAreaView>
  );
};

export default Checkout;