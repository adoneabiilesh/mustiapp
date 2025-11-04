import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  TextInput,
  Modal,
} from 'react-native';
import { router, Stack } from 'expo-router';
import useAuthStore from '@/store/auth.store';
import { 
  getUserAddresses, 
  createAddress, 
  updateAddress, 
  deleteAddress, 
  setDefaultAddress,
  UserAddress 
} from '@/lib/database';
import { Colors, Spacing, BorderRadius, Shadows } from '@/lib/designSystem';
import { Icons } from '@/lib/icons';
import * as Haptics from 'expo-haptics';

const AddressManagementScreen = () => {
  const { user } = useAuthStore();
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    label: 'Home',
    street_address: '',
    apartment: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Italy',
    delivery_instructions: '',
    contact_name: '',
    contact_phone: '',
    is_default: false,
  });

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await getUserAddresses(user.id);
      setAddresses(data);
    } catch (error) {
      console.error('Error loading addresses:', error);
      Alert.alert('Error', 'Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setFormData({
      label: 'Home',
      street_address: '',
      apartment: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'Italy',
      delivery_instructions: '',
      contact_name: '',
      contact_phone: '',
      is_default: addresses.length === 0, // First address is default
    });
    setShowAddDialog(true);
  };

  const handleEditAddress = (address: UserAddress) => {
    setEditingAddress(address);
    setFormData({
      label: address.label,
      street_address: address.street_address,
      apartment: address.apartment || '',
      city: address.city,
      state: address.state || '',
      postal_code: address.postal_code || '',
      country: address.country,
      delivery_instructions: address.delivery_instructions || '',
      contact_name: address.contact_name || '',
      contact_phone: address.contact_phone || '',
      is_default: address.is_default,
    });
    setShowAddDialog(true);
  };

  const handleSaveAddress = async () => {
    if (!user) return;

    // Validate required fields
    if (!formData.street_address || !formData.city) {
      Alert.alert('Missing Fields', 'Street address and city are required');
      return;
    }

    try {
      if (editingAddress) {
        // Update existing
        await updateAddress(editingAddress.id, formData);
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        Alert.alert('Success', 'Address updated successfully');
      } else {
        // Create new
        await createAddress({
          user_id: user.id,
          ...formData,
        });
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        Alert.alert('Success', 'Address added successfully');
      }
      
      setShowAddDialog(false);
      loadAddresses();
    } catch (error) {
      console.error('Error saving address:', error);
      Alert.alert('Error', 'Failed to save address');
    }
  };

  const handleDeleteAddress = (addressId: string) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAddress(addressId);
              if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
              loadAddresses();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete address');
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (addressId: string) => {
    if (!user) return;
    
    try {
      await setDefaultAddress(user.id, addressId);
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      loadAddresses();
    } catch (error) {
      Alert.alert('Error', 'Failed to set default address');
    }
  };

  const renderAddressForm = () => (
    <Modal
      visible={showAddDialog}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowAddDialog(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowAddDialog(false)}>
            <Icons.X size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>
            {editingAddress ? 'Edit Address' : 'Add Address'}
          </Text>
          <TouchableOpacity onPress={handleSaveAddress}>
            <Text style={styles.saveButton}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          {/* Address Label */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Label</Text>
            <View style={styles.labelButtons}>
              {['Home', 'Work', 'Other'].map((label) => (
                <TouchableOpacity
                  key={label}
                  style={[
                    styles.labelButton,
                    formData.label === label && styles.labelButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, label })}
                >
                  <Text
                    style={[
                      styles.labelButtonText,
                      formData.label === label && styles.labelButtonTextActive,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Street Address */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Street Address *</Text>
            <TextInput
              style={styles.input}
              value={formData.street_address}
              onChangeText={(text) => setFormData({ ...formData, street_address: text })}
              placeholder="123 Main Street"
              placeholderTextColor={Colors.neutral[400]}
            />
          </View>

          {/* Apartment/Suite */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Apartment, Suite, etc.</Text>
            <TextInput
              style={styles.input}
              value={formData.apartment}
              onChangeText={(text) => setFormData({ ...formData, apartment: text })}
              placeholder="Apt 4B"
              placeholderTextColor={Colors.neutral[400]}
            />
          </View>

          {/* City */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>City *</Text>
            <TextInput
              style={styles.input}
              value={formData.city}
              onChangeText={(text) => setFormData({ ...formData, city: text })}
              placeholder="New York"
              placeholderTextColor={Colors.neutral[400]}
            />
          </View>

          {/* State & Postal Code */}
          <View style={styles.formRow}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>State</Text>
              <TextInput
                style={styles.input}
                value={formData.state}
                onChangeText={(text) => setFormData({ ...formData, state: text })}
                placeholder="NY"
                placeholderTextColor={Colors.neutral[400]}
              />
            </View>
            <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Postal Code</Text>
              <TextInput
                style={styles.input}
                value={formData.postal_code}
                onChangeText={(text) => setFormData({ ...formData, postal_code: text })}
                placeholder="10001"
                placeholderTextColor={Colors.neutral[400]}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Contact Name */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Contact Name</Text>
            <TextInput
              style={styles.input}
              value={formData.contact_name}
              onChangeText={(text) => setFormData({ ...formData, contact_name: text })}
              placeholder="John Doe"
              placeholderTextColor={Colors.neutral[400]}
            />
          </View>

          {/* Contact Phone */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Contact Phone</Text>
            <TextInput
              style={styles.input}
              value={formData.contact_phone}
              onChangeText={(text) => setFormData({ ...formData, contact_phone: text })}
              placeholder="+1 (555) 123-4567"
              placeholderTextColor={Colors.neutral[400]}
              keyboardType="phone-pad"
            />
          </View>

          {/* Delivery Instructions */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Delivery Instructions</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.delivery_instructions}
              onChangeText={(text) => setFormData({ ...formData, delivery_instructions: text })}
              placeholder="Leave at door, Ring bell twice, etc."
              placeholderTextColor={Colors.neutral[400]}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Set as Default */}
          <TouchableOpacity
            style={styles.defaultToggle}
            onPress={() => setFormData({ ...formData, is_default: !formData.is_default })}
          >
            <View style={styles.defaultToggleContent}>
              <Icons.MapPin size={20} color={Colors.primary[500]} />
              <Text style={styles.defaultToggleText}>Set as default address</Text>
            </View>
            <View style={[
              styles.checkbox,
              formData.is_default && styles.checkboxActive,
            ]}>
              {formData.is_default && (
                <Icons.Check size={16} color="#FFFFFF" />
              )}
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );

  if (!user) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Addresses', headerShown: true }} />
        <Text style={styles.emptyText}>Please sign in to manage addresses</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Delivery Addresses',
          headerShown: true,
          headerStyle: {
            backgroundColor: Colors.background.primary,
          },
          headerTintColor: Colors.text.primary,
        }} 
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {addresses.length === 0 ? (
            <View style={styles.emptyState}>
              <Icons.MapPin size={64} color={Colors.neutral[300]} />
              <Text style={styles.emptyTitle}>No addresses yet</Text>
              <Text style={styles.emptyText}>Add your delivery address to get started</Text>
            </View>
          ) : (
            <View style={styles.addressList}>
              {addresses.map((address) => (
                <View key={address.id} style={styles.addressCard}>
                  <View style={styles.addressHeader}>
                    <View style={styles.addressLabelContainer}>
                      <Icons.MapPin size={20} color={Colors.primary[500]} />
                      <Text style={styles.addressLabel}>{address.label}</Text>
                      {address.is_default && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultBadgeText}>Default</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.addressActions}>
                      <TouchableOpacity
                        onPress={() => handleEditAddress(address)}
                        style={styles.actionButton}
                      >
                        <Icons.Edit2 size={18} color={Colors.neutral[600]} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteAddress(address.id)}
                        style={styles.actionButton}
                      >
                        <Icons.Trash2 size={18} color={Colors.error[500]} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text style={styles.addressText}>
                    {address.street_address}
                    {address.apartment && `, ${address.apartment}`}
                  </Text>
                  <Text style={styles.addressSubtext}>
                    {address.city}{address.state && `, ${address.state}`}
                    {address.postal_code && ` ${address.postal_code}`}
                  </Text>

                  {address.delivery_instructions && (
                    <Text style={styles.instructionsText}>
                      📝 {address.delivery_instructions}
                    </Text>
                  )}

                  {!address.is_default && (
                    <TouchableOpacity
                      onPress={() => handleSetDefault(address.id)}
                      style={styles.setDefaultButton}
                    >
                      <Text style={styles.setDefaultButtonText}>Set as Default</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.addButton} onPress={handleAddAddress}>
            <Icons.Plus size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add New Address</Text>
          </TouchableOpacity>

          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {renderAddressForm()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  addressList: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  addressCard: {
    backgroundColor: Colors.background.card,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.md,
    marginBottom: Spacing.md,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  addressLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  defaultBadge: {
    backgroundColor: Colors.primary[100],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  defaultBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary[700],
  },
  addressActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    padding: Spacing.sm,
  },
  addressText: {
    fontSize: 14,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  addressSubtext: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  instructionsText: {
    fontSize: 13,
    color: Colors.neutral[600],
    fontStyle: 'italic',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
  setDefaultButton: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary[500],
    borderRadius: BorderRadius.md,
  },
  setDefaultButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary[500],
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary[500],
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    ...Shadows.md,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    fontFamily: 'Georgia',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary[500],
  },
  modalContent: {
    flex: 1,
    padding: Spacing.lg,
  },
  formGroup: {
    marginBottom: Spacing.lg,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.background.card,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    fontSize: 15,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  labelButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  labelButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.neutral[300],
    alignItems: 'center',
  },
  labelButtonActive: {
    borderColor: Colors.primary[500],
    backgroundColor: Colors.primary[50],
  },
  labelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral[600],
  },
  labelButtonTextActive: {
    color: Colors.primary[500],
  },
  defaultToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background.card,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    marginBottom: Spacing.lg,
  },
  defaultToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  defaultToggleText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.neutral[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
});

export default AddressManagementScreen;




