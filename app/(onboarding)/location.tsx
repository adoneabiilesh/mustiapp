import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Icons } from '@/lib/icons';
import { Colors, Spacing, BorderRadius, Shadows } from '@/lib/designSystem';

export default function LocationScreen() {
  const [address, setAddress] = useState('');
  const [searching, setSearching] = useState(false);

  const recentAddresses = [
    { id: '1', name: 'Home', address: '123 Main St, City' },
    { id: '2', name: 'Work', address: '456 Office Ave, City' },
  ];

  const handleContinue = async () => {
    // Save address to store and mark onboarding as complete
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    await AsyncStorage.setItem('deliveryAddress', address);
    router.replace('/(tabs)');
  };

  const handleUseCurrentLocation = async () => {
    // Get current location
    setAddress('Current Location');
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    await AsyncStorage.setItem('deliveryAddress', 'Current Location');
    setTimeout(() => {
      router.replace('/(tabs)');
    }, 500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Where do you want{'\n'}your food?</Text>
          <Text style={styles.subtitle}>We'll show you restaurants nearby</Text>
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Icons.MapPin size={20} color={Colors.neutral[500]} />
            <TextInput
              style={styles.searchInput}
              placeholder="Enter delivery address"
              placeholderTextColor={Colors.neutral[400]}
              value={address}
              onChangeText={setAddress}
              autoFocus
            />
            {address.length > 0 && (
              <TouchableOpacity onPress={() => setAddress('')}>
                <Icons.X size={20} color={Colors.neutral[500]} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Current Location Button */}
        <TouchableOpacity
            style={styles.currentLocationButton}
            onPress={handleUseCurrentLocation}
            activeOpacity={0.7}
          >
            <View style={styles.currentLocationIcon}>
              <Icons.Navigation size={20} color={Colors.primary[500]} />
            </View>
            <View style={styles.currentLocationText}>
              <Text style={styles.currentLocationTitle}>Use current location</Text>
              <Text style={styles.currentLocationSubtitle}>Enable location services</Text>
            </View>
            <Icons.ChevronRight size={20} color={Colors.neutral[400]} />
          </TouchableOpacity>

        {/* Recent Addresses */}
        {recentAddresses.length > 0 && (
          <View style={styles.recentContainer}>
            <Text style={styles.sectionTitle}>Recent addresses</Text>
            {recentAddresses.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.addressItem}
                onPress={() => {
                  setAddress(item.address);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.addressIcon}>
                  <Icons.MapPin size={16} color={Colors.neutral[600]} />
                </View>
                <View style={styles.addressInfo}>
                  <Text style={styles.addressName}>{item.name}</Text>
                  <Text style={styles.addressText}>{item.address}</Text>
                </View>
                <Icons.ChevronRight size={16} color={Colors.neutral[400]} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Continue Button */}
        {address.length > 0 && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
              activeOpacity={0.8}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
              <Icons.ArrowRight size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    fontFamily: 'Georgia',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  searchContainer: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.card,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.card,
    marginHorizontal: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
    ...Shadows.sm,
  },
  currentLocationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  currentLocationText: {
    flex: 1,
  },
  currentLocationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  currentLocationSubtitle: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  recentContainer: {
    paddingHorizontal: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.card,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  addressIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  addressInfo: {
    flex: 1,
  },
  addressName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  addressText: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  buttonContainer: {
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
    marginBottom: Spacing.xxl,
  },
  continueButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary[500],
    paddingVertical: 16,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    ...Shadows.md,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

