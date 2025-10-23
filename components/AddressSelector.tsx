import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../lib/designSystem';
import { Icons } from '../lib/icons';
import { useAddressStore } from '../store/address.store';
import useAuthStore from '../store/auth.store';
import AddressCard from './AddressCard';
import UnifiedButton from './UnifiedButton';

interface AddressSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (address: any) => void;
  selectedAddressId?: string;
  title?: string;
  showAddButton?: boolean;
}

export const AddressSelector: React.FC<AddressSelectorProps> = ({
  visible,
  onClose,
  onSelect,
  selectedAddressId,
  title = 'Select Address',
  showAddButton = true,
}) => {
  const { user } = useAuthStore();
  const { addresses, defaultAddress, loading, error, loadAddresses } = useAddressStore();
  const [selectedId, setSelectedId] = useState<string | null>(selectedAddressId || null);

  useEffect(() => {
    if (visible && user?.$id) {
      console.log('AddressSelector: Loading addresses for user:', user.$id);
      loadAddresses(user.$id);
    }
  }, [visible, user?.$id, loadAddresses]);

  useEffect(() => {
    if (defaultAddress && !selectedId) {
      setSelectedId(defaultAddress.id || 'default');
    }
  }, [defaultAddress, selectedId]);

  // Debug logging
  useEffect(() => {
    console.log('AddressSelector: addresses:', addresses);
    console.log('AddressSelector: defaultAddress:', defaultAddress);
    console.log('AddressSelector: loading:', loading);
    console.log('AddressSelector: error:', error);
  }, [addresses, defaultAddress, loading, error]);

  const handleSelect = () => {
    if (!selectedId) {
      Alert.alert('Error', 'Please select an address');
      return;
    }

    const selectedAddress = addresses.find(addr => addr.id === selectedId) || defaultAddress;
    if (selectedAddress) {
      onSelect(selectedAddress);
      onClose();
    }
  };

  const handleAddAddress = () => {
    onClose();
    router.push('/add-address');
  };

  const handleEditAddress = (addressId: string) => {
    onClose();
    router.push(`/edit-address?id=${addressId}`);
  };

  if (!visible) return null;

  return (
    <View style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: Colors.neutral[50],
      zIndex: 1000,
    }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.neutral[50] }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.md,
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: Colors.neutral[200],
        }}>
          <TouchableOpacity onPress={onClose}>
            <Icons.ArrowBack size={24} color={Colors.neutral[700]} />
          </TouchableOpacity>
          <Text style={[Typography.h4, { color: Colors.neutral[900] }]}>
            {title}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Content */}
        <View style={{ flex: 1 }}>
          {loading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={[Typography.body1, { color: Colors.neutral[600] }]}>
                Loading addresses...
              </Text>
            </View>
          ) : error ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.lg }}>
              <Icons.AlertCircle size={48} color={Colors.error[500]} />
              <Text style={[Typography.h5, { color: Colors.error[600], marginTop: Spacing.md, marginBottom: Spacing.sm }]}>
                Error Loading Addresses
              </Text>
              <Text style={[Typography.body2, { color: Colors.neutral[600], textAlign: 'center', marginBottom: Spacing.lg }]}>
                {error}
              </Text>
              <UnifiedButton
                title="Try Again"
                onPress={() => user?.$id && loadAddresses(user.$id)}
                variant="primary"
                size="medium"
              />
            </View>
          ) : addresses.length === 0 && !defaultAddress ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.lg }}>
              <Icons.Location size={48} color={Colors.neutral[400]} />
              <Text style={[Typography.h5, { color: Colors.neutral[600], marginTop: Spacing.md, marginBottom: Spacing.sm }]}>
                No Addresses Found
              </Text>
              <Text style={[Typography.body2, { color: Colors.neutral[500], textAlign: 'center', marginBottom: Spacing.lg }]}>
                Add your first address to get started
              </Text>
              <UnifiedButton
                title="Add Address"
                onPress={handleAddAddress}
                variant="primary"
                size="large"
                fullWidth
              />
            </View>
          ) : (
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
              <View style={{ padding: Spacing.lg }}>
                {/* Default Address */}
                {defaultAddress && (
                  <View style={{ marginBottom: Spacing.lg }}>
                    <Text style={[Typography.label, { color: Colors.neutral[600], marginBottom: Spacing.sm }]}>
                      Default Address
                    </Text>
                    <AddressCard
                      address={defaultAddress}
                      isSelected={selectedId === defaultAddress.id}
                      onSelect={() => setSelectedId(defaultAddress.id || 'default')}
                      onEdit={() => handleEditAddress(defaultAddress.id || 'default')}
                      variant="compact"
                    />
                  </View>
                )}

                {/* Other Addresses */}
                {addresses.filter(addr => addr.id !== defaultAddress?.id).length > 0 && (
                  <View>
                    <Text style={[Typography.label, { color: Colors.neutral[600], marginBottom: Spacing.sm }]}>
                      Other Addresses
                    </Text>
                    {addresses
                      .filter(addr => addr.id !== defaultAddress?.id)
                      .map((address) => (
                        <AddressCard
                          key={address.id}
                          address={address}
                          isSelected={selectedId === address.id}
                          onSelect={() => setSelectedId(address.id || '')}
                          onEdit={() => handleEditAddress(address.id || '')}
                          variant="compact"
                        />
                      ))}
                  </View>
                )}

                {/* Add New Address Button */}
                {showAddButton && (
                  <TouchableOpacity
                    onPress={handleAddAddress}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: Spacing.lg,
                      backgroundColor: '#FFFFFF',
                      borderRadius: BorderRadius.lg,
                      borderWidth: 2,
                      borderColor: Colors.primary[500],
                      borderStyle: 'dashed',
                      marginTop: Spacing.lg,
                    }}
                  >
                    <Icons.Plus size={20} color={Colors.primary[500]} />
                    <Text style={[Typography.button, { color: Colors.primary[500], marginLeft: Spacing.sm }]}>
                      Add New Address
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          )}
        </View>

        {/* Footer */}
        {addresses.length > 0 || defaultAddress ? (
          <View style={{
            padding: Spacing.lg,
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: Colors.neutral[200],
            ...Shadows.lg,
          }}>
            <UnifiedButton
              title="Select Address"
              onPress={handleSelect}
              variant="primary"
              size="large"
              fullWidth
              disabled={!selectedId}
            />
          </View>
        ) : null}
      </SafeAreaView>
    </View>
  );
};

export default AddressSelector;
