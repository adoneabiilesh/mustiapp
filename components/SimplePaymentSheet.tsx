import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  TextInput,
} from 'react-native';
import { Icons } from '../lib/icons';

interface SimplePaymentSheetProps {
  amount: number;
  currency?: string;
  onSuccess: (paymentData: any) => void;
  onCancel: () => void;
  customerEmail?: string;
}

export const SimplePaymentSheet: React.FC<SimplePaymentSheetProps> = ({
  amount,
  currency = 'eur',
  onSuccess,
  onCancel,
  customerEmail,
}) => {
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  const handlePayment = async () => {
    if (!cardNumber.trim() || !expiryDate.trim() || !cvc.trim() || !cardholderName.trim()) {
      Alert.alert('Error', 'Please fill in all payment details');
      return;
    }

    try {
      setLoading(true);
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, we'll simulate a successful payment
      const paymentData = {
        paymentIntentId: `pi_${Date.now()}`,
        amount: amount,
        currency: currency,
        status: 'succeeded',
        cardLast4: cardNumber.slice(-4),
      };
      
      onSuccess(paymentData);
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    // Add spaces every 4 digits
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted;
  };

  const formatExpiryDate = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    // Add slash after 2 digits
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  return (
    <View style={{
      backgroundColor: '#FFFFFF',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
      maxHeight: '80%',
    }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
      }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827' }}>Payment</Text>
        <TouchableOpacity onPress={onCancel} style={{ padding: 8 }}>
          <Icons.Close size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <View style={{
          backgroundColor: '#F9FAFB',
          borderRadius: 12,
          padding: 16,
          marginBottom: 24,
        }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 8 }}>Order Summary</Text>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <Text style={{ color: '#6B7280' }}>Total Amount</Text>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827' }}>{formatAmount(amount)}</Text>
          </View>
        </View>

        {/* Card Details Form */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 16 }}>Card Details</Text>
          
          {/* Card Number */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>Card Number</Text>
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
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChangeText={(text) => setCardNumber(formatCardNumber(text))}
              keyboardType="numeric"
              maxLength={19}
            />
          </View>

          {/* Cardholder Name */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>Cardholder Name</Text>
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
              placeholder="John Doe"
              value={cardholderName}
              onChangeText={setCardholderName}
            />
          </View>

          {/* Expiry and CVC */}
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>Expiry Date</Text>
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
                placeholder="MM/YY"
                value={expiryDate}
                onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                keyboardType="numeric"
                maxLength={5}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>CVC</Text>
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
                placeholder="123"
                value={cvc}
                onChangeText={setCvc}
                keyboardType="numeric"
                maxLength={4}
              />
            </View>
          </View>
        </View>

        {/* Security Notice */}
        <View style={{
          backgroundColor: '#EFF6FF',
          borderRadius: 12,
          padding: 16,
          marginBottom: 24,
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
          }}>
            <Icons.Security size={20} color="#3B82F6" />
            <Text style={{ color: '#1E3A8A', fontWeight: '500', marginLeft: 8 }}>Secure Payment</Text>
          </View>
          <Text style={{ color: '#1E40AF', fontSize: 14 }}>
            Your payment information is encrypted and secure. This is a demo payment system.
          </Text>
        </View>
      </ScrollView>

      {/* Payment Button */}
      <TouchableOpacity
        style={{
          paddingVertical: 16,
          borderRadius: 12,
          backgroundColor: loading ? '#D1D5DB' : '#059669',
        }}
        onPress={handlePayment}
        disabled={loading}
      >
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <Icons.CreditCard size={20} color="white" />
              <Text style={{
                color: 'white',
                fontWeight: '600',
                fontSize: 18,
                marginLeft: 8,
              }}>
                Pay {formatAmount(amount)}
              </Text>
            </>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};
