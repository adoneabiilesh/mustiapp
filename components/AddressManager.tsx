import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '../constants';
import { getUserPreferences, updateDefaultAddress } from '../lib/userPreferences';

interface AddressManagerProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
  onAddressUpdated: (address: any) => void;
}

const AddressManager: React.FC<AddressManagerProps> = ({
  visible,
  onClose,
  userId,
  onAddressUpdated
}) => {
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('Italy');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && userId) {
      loadCurrentAddress();
    }
  }, [visible, userId]);

  const loadCurrentAddress = async () => {
    try {
      const preferences = await getUserPreferences(userId);
      if (preferences?.default_address) {
        setStreet(preferences.default_address.street || '');
        setCity(preferences.default_address.city || '');
        setState(preferences.default_address.state || '');
        setZip(preferences.default_address.zip || '');
        setCountry(preferences.default_address.country || 'Italy');
      }
    } catch (error) {
      console.error('Error loading address:', error);
    }
  };

  const handleSaveAddress = async () => {
    if (!street.trim() || !city.trim() || !zip.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const addressData = {
        street: street.trim(),
        city: city.trim(),
        state: state.trim(),
        zip: zip.trim(),
        country: country.trim(),
      };

      const { error } = await updateDefaultAddress(userId, addressData);
      
      if (error) throw error;

      Alert.alert('Success', 'Address updated successfully!');
      onAddressUpdated(addressData);
      onClose();
    } catch (error: any) {
      console.error('Error saving address:', error);
      Alert.alert('Error', error.message || 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
          <TouchableOpacity onPress={onClose} className="p-2">
            <Text className="text-lg text-gray-600">Cancel</Text>
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900">Manage Address</Text>
          <TouchableOpacity
            onPress={handleSaveAddress}
            disabled={loading}
            className="p-2"
          >
            <Text className="text-lg text-green-500 font-semibold">
              {loading ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-1 p-4">
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">Street Address *</Text>
            <TextInput
              value={street}
              onChangeText={setStreet}
              placeholder="Enter street address"
              className="border border-gray-300 rounded-xl px-4 py-3 text-base"
              autoCapitalize="words"
            />
          </View>

          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">City *</Text>
            <TextInput
              value={city}
              onChangeText={setCity}
              placeholder="Enter city"
              className="border border-gray-300 rounded-xl px-4 py-3 text-base"
              autoCapitalize="words"
            />
          </View>

          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">State/Province</Text>
            <TextInput
              value={state}
              onChangeText={setState}
              placeholder="Enter state or province"
              className="border border-gray-300 rounded-xl px-4 py-3 text-base"
              autoCapitalize="words"
            />
          </View>

          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">ZIP/Postal Code *</Text>
            <TextInput
              value={zip}
              onChangeText={setZip}
              placeholder="Enter ZIP code"
              className="border border-gray-300 rounded-xl px-4 py-3 text-base"
              keyboardType="numeric"
            />
          </View>

          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">Country</Text>
            <TextInput
              value={country}
              onChangeText={setCountry}
              placeholder="Enter country"
              className="border border-gray-300 rounded-xl px-4 py-3 text-base"
              autoCapitalize="words"
            />
          </View>

          <View className="bg-red-50 p-4 rounded-xl">
            <Text className="text-sm text-red-800">
              💡 Tip: This address will be used as your default delivery address for all orders.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default AddressManager;
