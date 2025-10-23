import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  Alert,
  TextInput,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { images } from '@/constants';
import useAuthStore from '../../store/auth.store';
import { getUserPreferences, updateUserPreferences } from '../../lib/userPreferences';
import UnifiedButton from '../../components/UnifiedButton';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../lib/designSystem';
import { Icons } from '../../lib/icons';
import cn from 'clsx';

const Profile = () => {
  const { user, logout } = useAuthStore();
  const [userPreferences, setUserPreferences] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Edit Profile State
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');

  // Profile Photo State
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);

  // Notification Settings State
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotionalOffers: true,
    newMenuItems: true,
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
  });

  useEffect(() => {
    loadUserData();
  }, [user?.$id]);

  const loadUserData = async () => {
      if (user?.$id) {
        try {
        const preferences = await getUserPreferences(user.$id);
        setUserPreferences(preferences);
        setEditName(user?.name || '');
        setEditEmail(user?.email || '');
        setEditPhone((user as any)?.phone || '');
        setEditAddress((user as any)?.address || '');
        
        } catch (error) {
        console.error('Error loading user data:', error);
      }
    }
    setLoading(false);
  };

  const handleSaveProfile = async () => {
    if (!user?.$id) return;

    try {
      const { error } = await updateUserPreferences(user.$id, {
        name: editName,
      });

      if (error) throw error;

      Alert.alert('Success', 'Profile updated successfully!');
      setShowEditProfile(false);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    }
  };

  const handleSaveNotifications = async () => {
    if (!user?.$id) return;

    try {
      const { error } = await updateUserPreferences(user.$id, {
        notification_preferences: {
          order_updates: notifications.orderUpdates,
          promotional_offers: notifications.promotionalOffers,
          new_menu_items: notifications.newMenuItems,
          push_notifications: notifications.pushNotifications,
          email_notifications: notifications.emailNotifications,
          sms_notifications: notifications.smsNotifications,
        },
      });

      if (error) throw error;

      Alert.alert('Success', 'Notification preferences saved!');
      setShowNotifications(false);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save preferences');
    }
  };

  // Profile Photo Functions
  const handlePhotoOptions = () => {
    setShowPhotoOptions(true);
  };

  const handleTakePhoto = () => {
    setShowPhotoOptions(false);
    // TODO: Implement camera functionality
    console.log('Take photo');
  };

  const handleChooseFromLibrary = () => {
    setShowPhotoOptions(false);
    // TODO: Implement photo library functionality
    console.log('Choose from library');
  };

  const handleRemovePhoto = () => {
    Alert.alert(
      'Remove Profile Photo',
      'Are you sure you want to remove your profile photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            setProfilePhoto(null);
          }
        }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. Are you sure you want to delete your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
          Alert.alert('Account Deletion', 'Please contact support to delete your account.');
        }}
      ]
    );
  };

  if (loading) {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-gray-600">Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (showEditProfile) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        {/* Header */}
        <View className="px-5 pt-4 pb-6 border-b border-gray-200">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => setShowEditProfile(false)}
              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-4"
            >
              <Image source={images.arrowBack} className="w-5 h-5" tintColor="#333" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-900">Edit Profile</Text>
          </View>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="p-5">
            {/* Profile Picture */}
            <View className="items-center mb-8">
              <View className="relative">
                <Image 
                  source={images.avatar}
                  className="w-24 h-24 rounded-full"
                />
                <TouchableOpacity className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 rounded-full items-center justify-center">
                  <Image source={images.pencil} className="w-4 h-4" tintColor="white" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity className="mt-4">
                <Text className="text-blue-600 font-medium">Change Photo</Text>
              </TouchableOpacity>
            </View>

            {/* Form Fields */}
            <View className="space-y-6">
              <View>
                <Text className="text-sm font-semibold text-gray-700 mb-2">Full Name</Text>
                <TextInput
                  value={editName}
                  onChangeText={setEditName}
                  className="border border-gray-300 rounded-lg p-4 text-base"
                  placeholder="Enter your full name"
                />
              </View>

              <View>
                <Text className="text-sm font-semibold text-gray-700 mb-2">Email</Text>
                <TextInput
                  value={editEmail}
                  onChangeText={setEditEmail}
                  className="border border-gray-300 rounded-lg p-4 text-base"
                  placeholder="Enter your email"
                  keyboardType="email-address"
                />
              </View>

              <View>
                <Text className="text-sm font-semibold text-gray-700 mb-2">Phone Number</Text>
                <View className="flex-row items-center">
                  <TextInput
                    value={editPhone}
                    onChangeText={setEditPhone}
                    className="flex-1 border border-gray-300 rounded-lg p-4 text-base"
                    placeholder="Enter your phone number"
                    keyboardType="phone-pad"
                  />
                  <View className="ml-3 bg-green-100 px-3 py-2 rounded-full">
                    <Text className="text-green-600 text-sm font-semibold">Verified</Text>
                  </View>
                </View>
              </View>

              <View>
                <Text className="text-sm font-semibold text-gray-700 mb-2">Address</Text>
                <TextInput
                  value={editAddress}
                  onChangeText={setEditAddress}
                  className="border border-gray-300 rounded-lg p-4 text-base"
                  placeholder="Enter your address"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Save Button */}
        <View className="p-5 bg-white border-t border-gray-200">
        <TouchableOpacity
          onPress={handleSaveProfile}
          className="bg-blue-500 py-4 rounded-xl"
        >
          <View className="items-center">
            <Text className="text-white text-lg font-bold">Save Changes</Text>
          </View>
        </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }



  if (showNotifications) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        {/* Header */}
        <View className="px-5 pt-4 pb-6 border-b border-gray-200">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => setShowNotifications(false)}
              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-4"
            >
              <Image source={images.arrowBack} className="w-5 h-5" tintColor="#333" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-900">Notification Preferences</Text>
          </View>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="p-5">
            <View className="space-y-6">
              <View className="flex-row items-center justify-between py-4">
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-gray-900">Order Updates</Text>
                  <Text className="text-sm text-gray-600">Get notified about your order status</Text>
                </View>
                <Switch
                  value={notifications.orderUpdates}
                  onValueChange={(value) => setNotifications(prev => ({ ...prev, orderUpdates: value }))}
                />
              </View>

              <View className="flex-row items-center justify-between py-4">
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-gray-900">Promotional Offers</Text>
                  <Text className="text-sm text-gray-600">Receive special deals and discounts</Text>
                </View>
                <Switch
                  value={notifications.promotionalOffers}
                  onValueChange={(value) => setNotifications(prev => ({ ...prev, promotionalOffers: value }))}
                />
              </View>

              <View className="flex-row items-center justify-between py-4">
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-gray-900">New Menu Items</Text>
                  <Text className="text-sm text-gray-600">Be the first to know about new dishes</Text>
                </View>
                <Switch
                  value={notifications.newMenuItems}
                  onValueChange={(value) => setNotifications(prev => ({ ...prev, newMenuItems: value }))}
          />
        </View>

              <View className="flex-row items-center justify-between py-4">
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-gray-900">Push Notifications</Text>
                  <Text className="text-sm text-gray-600">Receive notifications on your device</Text>
                </View>
                <Switch
                  value={notifications.pushNotifications}
                  onValueChange={(value) => setNotifications(prev => ({ ...prev, pushNotifications: value }))}
          />
        </View>

              <View className="flex-row items-center justify-between py-4">
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-gray-900">Email Notifications</Text>
                  <Text className="text-sm text-gray-600">Get updates via email</Text>
                </View>
                <Switch
                  value={notifications.emailNotifications}
                  onValueChange={(value) => setNotifications(prev => ({ ...prev, emailNotifications: value }))}
          />
        </View>

              <View className="flex-row items-center justify-between py-4">
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-gray-900">SMS Notifications</Text>
                  <Text className="text-sm text-gray-600">Receive text message updates</Text>
                </View>
                <Switch
                  value={notifications.smsNotifications}
                  onValueChange={(value) => setNotifications(prev => ({ ...prev, smsNotifications: value }))}
                />
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Save Button */}
        <View className="p-5 bg-white border-t border-gray-200">
          <TouchableOpacity
          onPress={handleSaveNotifications}
          className="bg-blue-500 py-4 rounded-xl"
        >
          <View className="items-center">
            <Text className="text-white text-lg font-bold">Save Preferences</Text>
          </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }


  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-5 pt-4 pb-6 bg-white border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-gray-900">Profile</Text>
            <Text className="text-gray-600 mt-1">
              Manage your account settings
          </Text>
          </View>
        </View>
            </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: BorderRadius.xl, padding: Spacing.xl, marginBottom: Spacing.lg, ...Shadows.sm, borderWidth: 1, borderColor: Colors.neutral[100] }}>
          <View style={{ alignItems: 'center', marginBottom: Spacing.xl }}>
            <View style={{ position: 'relative' }}>
              {profilePhoto ? (
              <Image
                  source={{ uri: profilePhoto }}
                  style={{ width: 80, height: 80, borderRadius: 40 }}
                />
              ) : (
                <View style={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: 40, 
                  backgroundColor: Colors.primary[100], 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <Text style={{ fontSize: 32, color: Colors.primary[500] }}>
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </Text>
                </View>
              )}
              <TouchableOpacity 
                onPress={handlePhotoOptions}
                style={{ 
                  position: 'absolute', 
                  bottom: 0, 
                  right: 0, 
                  width: 28, 
                  height: 28, 
                  backgroundColor: Colors.primary[500], 
                  borderRadius: 14, 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: '#FFFFFF'
                }}
              >
                <Icons.Camera size={14} color="#FFFFFF" />
            </TouchableOpacity>
            </View>
            <Text style={[Typography.h3, { color: Colors.neutral[900], marginTop: Spacing.md, marginBottom: Spacing.xs }]}>
              {user?.name || 'User'}
            </Text>
            <Text style={[Typography.body1, { color: Colors.neutral[600], marginBottom: Spacing.xs }]}>
              {user?.email || 'user@example.com'}
            </Text>
            <Text style={[Typography.body2, { color: Colors.neutral[500] }]}>
              {(user as any)?.phone || '+39 123 456 7890'}
            </Text>
          </View>

            <TouchableOpacity
            onPress={() => setShowEditProfile(true)}
            style={{ 
              backgroundColor: Colors.primary[500], 
              paddingVertical: Spacing.md, 
              borderRadius: BorderRadius.lg,
              alignItems: 'center'
            }}
          >
            <Text style={[Typography.button, { color: '#FFFFFF' }]}>Edit Profile</Text>
            </TouchableOpacity>
          </View>

        {/* Menu Options */}
        <View style={{ marginBottom: Spacing.lg }}>
          <TouchableOpacity
            onPress={() => setShowNotifications(true)}
            style={{ 
              backgroundColor: '#FFFFFF', 
              borderRadius: BorderRadius.xl, 
              padding: Spacing.xl, 
              ...Shadows.sm, 
              borderWidth: 1, 
              borderColor: Colors.neutral[100],
              marginBottom: Spacing.md
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: BorderRadius.lg, 
                  backgroundColor: Colors.primary[100], 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  marginRight: Spacing.md 
                }}>
                  <Icons.Notification size={24} color={Colors.primary[500]} />
                </View>
                <View>
                  <Text style={[Typography.h4, { color: Colors.neutral[900], marginBottom: Spacing.xs }]}>
                    Notifications
                  </Text>
                  <Text style={[Typography.body2, { color: Colors.neutral[600] }]}>
                    Customize your notification preferences
                  </Text>
                </View>
              </View>
              <Icons.ChevronRight size={20} color={Colors.neutral[400]} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/about')}
            style={{ 
              backgroundColor: '#FFFFFF', 
              borderRadius: BorderRadius.xl, 
              padding: Spacing.xl, 
              ...Shadows.sm, 
              borderWidth: 1, 
              borderColor: Colors.neutral[100],
              marginBottom: Spacing.md
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: BorderRadius.lg, 
                  backgroundColor: Colors.neutral[100], 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  marginRight: Spacing.md 
                }}>
                  <Icons.Settings size={24} color={Colors.neutral[600]} />
                </View>
                <View>
                  <Text style={[Typography.h4, { color: Colors.neutral[900], marginBottom: Spacing.xs }]}>
                    About Us
                  </Text>
                  <Text style={[Typography.body2, { color: Colors.neutral[600] }]}>
                    Learn more about our restaurant
                  </Text>
                </View>
              </View>
              <Icons.ChevronRight size={20} color={Colors.neutral[400]} />
            </View>
          </TouchableOpacity>
            </View>

        {/* Additional Options */}
        <View style={{ marginBottom: Spacing.lg }}>
          <TouchableOpacity
            onPress={handleDeleteAccount}
            style={{ 
              backgroundColor: '#FFFFFF', 
              borderRadius: BorderRadius.xl, 
              padding: Spacing.xl, 
              ...Shadows.sm, 
              borderWidth: 1, 
              borderColor: '#FECACA',
              marginBottom: Spacing.md
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: BorderRadius.lg, 
                  backgroundColor: '#FEE2E2', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  marginRight: Spacing.md 
                }}>
                  <Icons.Trash size={24} color="#EF4444" />
                </View>
                <View>
                  <Text style={[Typography.h4, { color: '#DC2626', marginBottom: Spacing.xs }]}>
                    Delete Account
                  </Text>
                  <Text style={[Typography.body2, { color: '#EF4444' }]}>
                    Permanently delete your account
                  </Text>
                </View>
              </View>
              <Icons.ChevronRight size={20} color="#F87171" />
            </View>
          </TouchableOpacity>
            </View>

        {/* Logout Button */}
        <View style={{ padding: Spacing.lg, paddingBottom: Spacing['2xl'] }}>
          <TouchableOpacity
            onPress={handleLogout}
            style={{ 
              backgroundColor: '#EF4444', 
              paddingVertical: Spacing.md, 
              borderRadius: BorderRadius.lg,
              alignItems: 'center'
            }}
          >
            <Text style={[Typography.button, { color: '#FFFFFF' }]}>Logout</Text>
          </TouchableOpacity>
            </View>
          </ScrollView>

        {/* Photo Options Modal */}
        {showPhotoOptions && (
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <View style={{
              backgroundColor: '#FFFFFF',
              borderRadius: BorderRadius.xl,
              padding: Spacing.xl,
              margin: Spacing.lg,
              width: '80%',
              maxWidth: 300
            }}>
              <Text style={[Typography.h4, { color: Colors.neutral[900], marginBottom: Spacing.lg, textAlign: 'center' }]}>
                Profile Photo
              </Text>
              
              <TouchableOpacity
                onPress={handleTakePhoto}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: Spacing.md,
                  paddingHorizontal: Spacing.lg,
                  borderRadius: BorderRadius.lg,
                  backgroundColor: Colors.primary[50],
                  marginBottom: Spacing.md
                }}
              >
                <Icons.Camera size={24} color={Colors.primary[500]} style={{ marginRight: Spacing.md }} />
                <Text style={[Typography.body1, { color: Colors.primary[600] }]}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleChooseFromLibrary}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: Spacing.md,
                  paddingHorizontal: Spacing.lg,
                  borderRadius: BorderRadius.lg,
                  backgroundColor: Colors.neutral[50],
                  marginBottom: Spacing.md
                }}
              >
                <Icons.Image size={24} color={Colors.neutral[600]} style={{ marginRight: Spacing.md }} />
                <Text style={[Typography.body1, { color: Colors.neutral[700] }]}>Choose from Library</Text>
              </TouchableOpacity>

              {profilePhoto && (
                <TouchableOpacity
                  onPress={handleRemovePhoto}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: Spacing.md,
                    paddingHorizontal: Spacing.lg,
                    borderRadius: BorderRadius.lg,
                    backgroundColor: '#FEE2E2',
                    marginBottom: Spacing.md
                  }}
                >
                  <Icons.Trash size={24} color="#EF4444" style={{ marginRight: Spacing.md }} />
                  <Text style={[Typography.body1, { color: '#DC2626' }]}>Remove Photo</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => setShowPhotoOptions(false)}
                style={{
                  paddingVertical: Spacing.md,
                  paddingHorizontal: Spacing.lg,
                  borderRadius: BorderRadius.lg,
                  backgroundColor: Colors.neutral[100],
                  alignItems: 'center'
                }}
              >
                <Text style={[Typography.body1, { color: Colors.neutral[600] }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
    </SafeAreaView>
  );
};

export default Profile;