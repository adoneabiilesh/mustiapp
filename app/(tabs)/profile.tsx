import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import useAuthStore from '../../store/auth.store';
import { Colors, Spacing, BorderRadius, Shadows } from '../../lib/designSystem';
import { Icons } from '../../lib/icons';
import * as Haptics from 'expo-haptics';

const Profile = () => {
  const { user, logout, isAuthenticated } = useAuthStore();

  const handleMenuPress = (route: string, haptic: boolean = true) => {
    if (haptic && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(route as any);
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            logout();
            router.replace('/(auth)/sign-in');
          },
        },
      ]
    );
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Icons.User size={64} color={Colors.neutral[300]} />
        </View>
          <Text style={styles.emptyTitle}>Sign in to continue</Text>
          <Text style={styles.emptySubtitle}>
            Access your profile, orders, and preferences
          </Text>
          <TouchableOpacity
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }
              router.push('/(auth)/sign-in');
            }}
            style={styles.signInButton}
            activeOpacity={0.8}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

    return (
    <SafeAreaView style={styles.container}>
        {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email || ''}</Text>
          </View>
          <TouchableOpacity
            onPress={() => handleMenuPress('/edit-profile')}
            style={styles.editButton}
          >
            <Icons.Edit size={18} color={Colors.neutral[700]} />
          </TouchableOpacity>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <View style={styles.menuCard}>
            <TouchableOpacity
              onPress={() => handleMenuPress('/(tabs)/orders')}
              style={styles.menuItem}
            >
              <View style={styles.menuIconContainer}>
                <Icons.Clock size={22} color='#FF9F66' />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>My Orders</Text>
                <Text style={styles.menuDescription}>View order history</Text>
              </View>
              <Icons.ChevronRight size={20} color={Colors.neutral[400]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <View style={styles.menuCard}>
            <TouchableOpacity 
              onPress={() => handleMenuPress('/notifications')}
              style={styles.menuItem}
            >
              <View style={styles.menuIconContainer}>
                <Icons.Bell size={22} color='#FF9F66' />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>Notifications</Text>
                <Text style={styles.menuDescription}>Push, email & SMS</Text>
              </View>
              <Icons.ChevronRight size={20} color={Colors.neutral[400]} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              onPress={() => handleMenuPress('/enhanced-loyalty')}
              style={styles.menuItem}
            >
              <View style={styles.menuIconContainer}>
                <Icons.Award size={22} color='#FF9F66' />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>Loyalty Program</Text>
                <Text style={styles.menuDescription}>Points & rewards</Text>
              </View>
              <Icons.ChevronRight size={20} color={Colors.neutral[400]} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              onPress={() => handleMenuPress('/payment-methods')}
              style={styles.menuItem}
            >
              <View style={styles.menuIconContainer}>
                <Icons.CreditCard size={22} color='#FF9F66' />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>Payment Methods</Text>
                <Text style={styles.menuDescription}>Manage saved cards</Text>
              </View>
              <Icons.ChevronRight size={20} color={Colors.neutral[400]} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              onPress={() => handleMenuPress('/settings')}
              style={styles.menuItem}
            >
              <View style={styles.menuIconContainer}>
                <Icons.Settings size={22} color='#FF9F66' />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>Settings</Text>
                <Text style={styles.menuDescription}>App preferences</Text>
              </View>
              <Icons.ChevronRight size={20} color={Colors.neutral[400]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>

          <View style={styles.menuCard}>
            <TouchableOpacity
              onPress={() => handleMenuPress('/help')}
              style={styles.menuItem}
            >
              <View style={styles.menuIconContainer}>
                <Icons.AlertCircle size={22} color='#FF9F66' />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>Help Center</Text>
                <Text style={styles.menuDescription}>FAQ & support</Text>
              </View>
              <Icons.ChevronRight size={20} color={Colors.neutral[400]} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              onPress={() => handleMenuPress('/about')}
              style={styles.menuItem}
            >
              <View style={styles.menuIconContainer}>
                <Icons.Info size={22} color='#FF9F66' />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>About</Text>
                <Text style={styles.menuDescription}>App info & version</Text>
              </View>
              <Icons.ChevronRight size={20} color={Colors.neutral[400]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          style={styles.logoutButton}
        >
          <Icons.LogOut size={20} color='#F44336' />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* Bottom Spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: '#FAF9F6',
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontWeight: '400',
    color: Colors.neutral[900],
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontWeight: '400',
    color: Colors.neutral[900],
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.neutral[600],
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  signInButton: {
    backgroundColor: '#FF9F66',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadows.sm,
  },
  avatarContainer: {
    marginRight: Spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FF9F66',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontWeight: '600',
    color: Colors.neutral[900],
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.neutral[600],
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontWeight: '400',
    color: Colors.neutral[900],
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: Spacing.lg,
    borderRadius: 16,
    ...Shadows.sm,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FF9F6615',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral[900],
    marginBottom: 2,
  },
  menuDescription: {
    fontSize: 13,
    color: Colors.neutral[600],
  },
  divider: {
    height: 1,
    backgroundColor: Colors.neutral[200],
    marginLeft: Spacing.lg + 44 + Spacing.md,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F4433620',
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F44336',
  },
});

export default Profile;
