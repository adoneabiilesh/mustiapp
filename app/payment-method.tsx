import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { images } from '@/constants';
import { addPaymentMethod } from '../lib/userPreferences';
import useAuthStore from '../store/auth.store';
import { cn } from '@/lib/utils';

const PaymentMethod = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [saveCard, setSaveCard] = useState(true);

  const formatCardNumber = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    // Add spaces every 4 digits
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted;
  };

  const handleCardNumberChange = (text: string) => {
    const formatted = formatCardNumber(text);
    setCardNumber(formatted);
  };

  const getCardBrand = (number: string) => {
    const cleaned = number.replace(/\s/g, '');
    if (cleaned.startsWith('4')) return 'Visa';
    if (cleaned.startsWith('5') || cleaned.startsWith('2')) return 'Mastercard';
    if (cleaned.startsWith('3')) return 'American Express';
    return 'Card';
  };

  const validateCard = () => {
    const cleanedNumber = cardNumber.replace(/\s/g, '');
    const month = parseInt(expiryMonth);
    const year = parseInt(expiryYear);
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;

    if (cleanedNumber.length < 13 || cleanedNumber.length > 19) {
      Alert.alert('Error', 'Please enter a valid card number');
      return false;
    }

    if (!cardholderName.trim()) {
      Alert.alert('Error', 'Please enter cardholder name');
      return false;
    }

    if (!expiryMonth || !expiryYear) {
      Alert.alert('Error', 'Please enter expiry date');
      return false;
    }

    if (month < 1 || month > 12) {
      Alert.alert('Error', 'Please enter a valid month');
      return false;
    }

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      Alert.alert('Error', 'Card has expired');
      return false;
    }

    if (cvv.length < 3 || cvv.length > 4) {
      Alert.alert('Error', 'Please enter a valid CVV');
      return false;
    }

    return true;
  };

  const handleAddCard = async () => {
    if (!user?.$id) {
      Alert.alert('Error', 'Please sign in to add payment method');
      return;
    }

    if (!validateCard()) return;

    setLoading(true);

    try {
      const cardData = {
        type: 'card' as const,
        card_details: {
          brand: getCardBrand(cardNumber),
          last4: cardNumber.replace(/\s/g, '').slice(-4),
          exp_month: parseInt(expiryMonth),
          exp_year: parseInt(expiryYear),
        },
        is_default: true,
      };

      const { error } = await addPaymentMethod(user.$id, cardData);
      
      if (error) throw error;

      Alert.alert(
        'Success', 
        'Payment method added successfully!',
        [
          { text: 'OK', onPress: () => router.back() }
        ]
      );
    } catch (error: any) {
      console.error('Error adding payment method:', error);
      Alert.alert('Error', error.message || 'Failed to add payment method');
    } finally {
      setLoading(false);
    }
  };

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
          <Text className="text-xl font-bold text-gray-900">Add Payment Method</Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-5">
          {/* Card Number */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">Card Information</Text>
            
            <View className="space-y-4">
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">Card Number *</Text>
                <View className="relative">
                  <TextInput
                    value={cardNumber}
                    onChangeText={handleCardNumberChange}
                    placeholder="1234 5678 9012 3456"
                    className="border border-gray-300 rounded-lg p-3 text-base pl-12"
                    keyboardType="numeric"
                    maxLength={19}
                  />
                  <View className="absolute left-3 top-3">
                    <Image source={images.dollar} className="w-5 h-5" tintColor="#6B7280" />
                  </View>
                  {cardNumber.length > 0 && (
                    <View className="absolute right-3 top-3">
                      <Text className="text-sm text-gray-500">
                        {getCardBrand(cardNumber)}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">Cardholder Name *</Text>
                <TextInput
                  value={cardholderName}
                  onChangeText={setCardholderName}
                  placeholder="Enter name as it appears on card"
                  className="border border-gray-300 rounded-lg p-3 text-base"
                  autoCapitalize="words"
                />
              </View>
              
              <View className="flex-row space-x-3">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-2">Expiry Date *</Text>
                  <View className="flex-row space-x-2">
                    <TextInput
                      value={expiryMonth}
                      onChangeText={setExpiryMonth}
                      placeholder="MM"
                      className="flex-1 border border-gray-300 rounded-lg p-3 text-base text-center"
                      keyboardType="numeric"
                      maxLength={2}
                    />
                    <Text className="text-2xl text-gray-400 self-center">/</Text>
                    <TextInput
                      value={expiryYear}
                      onChangeText={setExpiryYear}
                      placeholder="YY"
                      className="flex-1 border border-gray-300 rounded-lg p-3 text-base text-center"
                      keyboardType="numeric"
                      maxLength={2}
                    />
                  </View>
                </View>
                
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-2">CVV *</Text>
                  <TextInput
                    value={cvv}
                    onChangeText={setCvv}
                    placeholder="123"
                    className="border border-gray-300 rounded-lg p-3 text-base text-center"
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Save Card Option */}
          <View className="mb-6">
            <TouchableOpacity
              onPress={() => setSaveCard(!saveCard)}
              className="flex-row items-center"
            >
              <View className={cn(
                'w-5 h-5 rounded border-2 mr-3 items-center justify-center',
                saveCard ? 'border-red-500 bg-red-500' : 'border-gray-300'
              )}>
                {saveCard && (
                  <Text className="text-white text-xs">✓</Text>
                )}
              </View>
              <Text className="text-gray-700 flex-1">
                Save card for future use
              </Text>
            </TouchableOpacity>
          </View>

          {/* Security Badges */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-3">Security</Text>
            <View className="flex-row items-center space-x-4">
              <View className="flex-row items-center">
                <Image source={images.check} className="w-5 h-5 mr-2" tintColor="#10B981" />
                <Text className="text-sm text-gray-600">SSL Encrypted</Text>
              </View>
              <View className="flex-row items-center">
                <Image source={images.check} className="w-5 h-5 mr-2" tintColor="#10B981" />
                <Text className="text-sm text-gray-600">PCI Compliant</Text>
              </View>
            </View>
          </View>

          {/* Payment Methods Info */}
          <View className="bg-red-50 p-4 rounded-lg mb-6">
            <Text className="text-red-800 text-sm">
              💳 We accept Visa, Mastercard, American Express, and other major credit cards.
              Your payment information is secure and encrypted.
            </Text>
          </View>

          {/* Supported Cards */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-3">Supported Cards</Text>
            <View className="flex-row items-center space-x-4">
              <View className="bg-gray-100 px-3 py-2 rounded">
                <Text className="text-sm font-medium">Visa</Text>
              </View>
              <View className="bg-gray-100 px-3 py-2 rounded">
                <Text className="text-sm font-medium">Mastercard</Text>
              </View>
              <View className="bg-gray-100 px-3 py-2 rounded">
                <Text className="text-sm font-medium">Amex</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Add Card Button */}
      <View className="p-5 bg-white border-t border-gray-200">
        <TouchableOpacity
          onPress={handleAddCard}
          disabled={loading}
          className={cn(
            'py-4 rounded-xl items-center',
            loading ? 'bg-gray-400' : 'bg-red-500'
          )}
        >
          <Text className="text-white text-lg font-bold">
            {loading ? 'Adding...' : 'Add Card'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PaymentMethod;
