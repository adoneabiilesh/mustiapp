/**
 * SETTINGS SCREEN
 * Comprehensive app settings with beautiful UI
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/lib/designSystem';
import { Icons } from '@/lib/icons';
import useAuthStore from '@/store/auth.store';
import * as Haptics from 'expo-haptics';

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: any;
  type: 'navigation' | 'toggle' | 'action';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  destructive?: boolean;
}

const SettingsScreen = () => {
  const { user, signOut } = useAuthStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promotions, setPromotions] = useState(false);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/sign-in');
          },
        },
      ]
    );
  };

  const sections = [
    {
      title: 'Account',
      items: [
        {
          id: 'addresses',
          title: 'Delivery Addresses',
          subtitle: 'Manage your saved addresses',
          icon: Icons.MapPin,
          type: 'navigation',
          onPress: () => router.push('/address-management'),
        },
        {
          id: 'payment',
          title: 'Payment Methods',
          subtitle: 'Manage cards and payment options',
          icon: Icons.CreditCard,
          type: 'navigation',
          onPress: () => router.push('/payment-methods'),
        },
      ] as SettingItem[],
    },
    {
      title: 'Notifications',
      items: [
        {
          id: 'push',
          title: 'Push Notifications',
          subtitle: 'Get notified about orders and updates',
          icon: Icons.Bell,
          type: 'toggle',
          value: pushNotifications,
          onToggle: setPushNotifications,
        },
        {
          id: 'email',
          title: 'Email Notifications',
          subtitle: 'Receive updates via email',
          icon: Icons.Mail,
          type: 'toggle',
          value: emailNotifications,
          onToggle: setEmailNotifications,
        },
        {
          id: 'orders',
          title: 'Order Updates',
          subtitle: 'Get notified about order status',
          icon: Icons.Package,
          type: 'toggle',
          value: orderUpdates,
          onToggle: setOrderUpdates,
        },
        {
          id: 'promo',
          title: 'Promotional Offers',
          subtitle: 'Receive deals and special offers',
          icon: Icons.Tag,
          type: 'toggle',
          value: promotions,
          onToggle: setPromotions,
        },
      ] as SettingItem[],
    },
    {
      title: 'Legal',
      items: [
        {
          id: 'privacy',
          title: 'Privacy Policy',
          subtitle: 'How we handle your data',
          icon: Icons.Security,
          type: 'navigation',
          onPress: () => {
            // Open Privacy Policy URL or show in-app
            const privacyUrl = process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL || 'https://your-website.com/privacy-policy';
            if (Platform.OS === 'web') {
              window.open(privacyUrl, '_blank');
            } else {
              // For native, you can use Linking or WebView
              import('expo-web-browser').then(({ openBrowserAsync }) => {
                openBrowserAsync(privacyUrl);
              });
            }
          },
        },
        {
          id: 'terms',
          title: 'Terms of Service',
          subtitle: 'Terms and conditions',
          icon: Icons.FileText,
          type: 'navigation',
          onPress: () => {
            // Open Terms URL or show in-app
            const termsUrl = process.env.EXPO_PUBLIC_TERMS_OF_SERVICE_URL || 'https://your-website.com/terms-of-service';
            if (Platform.OS === 'web') {
              window.open(termsUrl, '_blank');
            } else {
              import('expo-web-browser').then(({ openBrowserAsync }) => {
                openBrowserAsync(termsUrl);
              });
            }
          },
        },
      ] as SettingItem[],
    },
    {
      title: 'Account Actions',
      items: [
        {
          id: 'signout',
          title: 'Sign Out',
          icon: Icons.LogOut,
          type: 'action',
          destructive: true,
          onPress: handleSignOut,
        },
      ] as SettingItem[],
    },
  ];

  const renderSettingItem = (item: SettingItem) => {
    const IconComponent = item.icon;
    
    // Safety check: ensure icon is defined and is a valid component
    if (!IconComponent || typeof IconComponent !== 'function') {
      if (__DEV__) {
        console.warn(`Icon not found or invalid for setting item: ${item.id}`, IconComponent);
      }
      // Use a default icon if available
      const DefaultIcon = Icons.Settings;
      if (!DefaultIcon) {
        return null;
      }
      const SafeIconComponent = DefaultIcon;
      
      return (
        <TouchableOpacity
          key={item.id}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: Spacing.md,
            paddingHorizontal: Spacing.lg,
            backgroundColor: 'white',
            borderBottomWidth: 1,
            borderBottomColor: Colors.neutral[100],
          }}
          onPress={() => {
            if (item.type === 'navigation' || item.type === 'action') {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              item.onPress?.();
            }
          }}
          disabled={item.type === 'toggle'}
        >
          <View style={{
            width: 40,
            height: 40,
            borderRadius: BorderRadius.full,
            backgroundColor: item.destructive ? Colors.error[50] : Colors.primary[50],
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: Spacing.md,
          }}>
            <SafeIconComponent
              size={20}
              color={item.destructive ? Colors.error[500] : Colors.primary[500]}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[
              Typography.bodyBold,
              { color: item.destructive ? Colors.error[500] : Colors.neutral[900] }
            ]}>
              {item.title}
            </Text>
            {item.subtitle && (
              <Text style={[Typography.caption, { color: Colors.neutral[500], marginTop: 2 }]}>
                {item.subtitle}
              </Text>
            )}
          </View>
          {item.type === 'toggle' && (
            <Switch
              value={item.value}
              onValueChange={(value) => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                item.onToggle?.(value);
              }}
              trackColor={{ false: Colors.neutral[300], true: Colors.primary[500] }}
              thumbColor="white"
            />
          )}
          {item.type === 'navigation' && (
            <Icons.ChevronRight size={20} color={Colors.neutral[400]} />
          )}
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        key={item.id}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: Spacing.md,
          paddingHorizontal: Spacing.lg,
          backgroundColor: 'white',
          borderBottomWidth: 1,
          borderBottomColor: Colors.neutral[100],
        }}
        onPress={() => {
          if (item.type === 'navigation' || item.type === 'action') {
            if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            item.onPress?.();
          }
        }}
        disabled={item.type === 'toggle'}
      >
        <View style={{
          width: 40,
          height: 40,
          borderRadius: BorderRadius.full,
          backgroundColor: item.destructive ? Colors.error[50] : Colors.primary[50],
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: Spacing.md,
        }}>
          <IconComponent
            size={20}
            color={item.destructive ? Colors.error[500] : Colors.primary[500]}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={[
            Typography.bodyBold,
            { color: item.destructive ? Colors.error[500] : Colors.neutral[900] }
          ]}>
            {item.title}
          </Text>
          {item.subtitle && (
            <Text style={[Typography.caption, { color: Colors.neutral[500], marginTop: 2 }]}>
              {item.subtitle}
            </Text>
          )}
        </View>

        {item.type === 'toggle' && (
          <Switch
            value={item.value}
            onValueChange={(value) => {
              if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              item.onToggle?.(value);
            }}
            trackColor={{ false: Colors.neutral[300], true: Colors.primary[500] }}
            thumbColor="white"
          />
        )}

        {item.type === 'navigation' && (
          <Icons.ChevronRight size={20} color={Colors.neutral[400]} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background.primary }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: Colors.neutral[200],
        ...Shadows.sm,
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: Spacing.md }}>
          <Icons.ArrowBack size={24} color={Colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={Typography.h2}>Settings</Text>
      </View>

      {/* User Info */}
      <View style={{
        backgroundColor: 'white',
        padding: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: Colors.neutral[200],
        marginBottom: Spacing.lg,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{
            width: 60,
            height: 60,
            borderRadius: BorderRadius.full,
            backgroundColor: Colors.primary[100],
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: Spacing.md,
          }}>
            <Text style={[Typography.h2, { color: Colors.primary[500] }]}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={Typography.h3}>{user?.name || 'User'}</Text>
            <Text style={[Typography.body, { color: Colors.neutral[600] }]}>
              {user?.email || 'user@example.com'}
            </Text>
          </View>
        </View>
      </View>

      {/* Settings Sections */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Spacing.xl }}
      >
        {sections.map((section, index) => (
          <View key={section.title} style={{ marginBottom: Spacing.lg }}>
            <Text style={[
              Typography.caption,
              {
                color: Colors.neutral[500],
                paddingHorizontal: Spacing.lg,
                paddingVertical: Spacing.sm,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }
            ]}>
              {section.title}
            </Text>
            <View style={{
              backgroundColor: 'white',
              borderRadius: BorderRadius.lg,
              overflow: 'hidden',
              ...Shadows.xs,
            }}>
              {section.items.map(renderSettingItem)}
            </View>
          </View>
        ))}

        {/* App Version */}
        <Text style={[
          Typography.caption,
          {
            textAlign: 'center',
            color: Colors.neutral[400],
            marginTop: Spacing.lg,
          }
        ]}>
          Version 1.0.0 • Made with ❤️
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;

