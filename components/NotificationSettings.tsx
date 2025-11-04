import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useTheme } from '../lib/theme';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../lib/designSystem';
import { Icons, IconSizes, IconColors } from '../lib/iconSystem';
import { 
  getNotificationSettings, 
  updateNotificationSettings,
  NotificationSettings 
} from '../lib/notifications';

interface NotificationSettingsProps {
  userId: string;
  onClose?: () => void;
}

const NotificationSettingsComponent: React.FC<NotificationSettingsProps> = ({ 
  userId, 
  onClose 
}) => {
  const { colors } = useTheme();
  const [settings, setSettings] = useState<NotificationSettings>({
    orderUpdates: true,
    promotions: true,
    reminders: true,
    general: true,
    sound: true,
    vibration: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [userId]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const userSettings = await getNotificationSettings(userId);
      setSettings(userSettings);
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = async (key: keyof NotificationSettings, value: boolean) => {
    try {
      setSaving(true);
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      
      const success = await updateNotificationSettings(userId, newSettings);
      if (!success) {
        // Revert on failure
        setSettings(settings);
        Alert.alert('Error', 'Failed to update notification settings');
      }
    } catch (error) {
      console.error('Error updating notification settings:', error);
      Alert.alert('Error', 'Failed to update notification settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      // Import the notification function
      const { sendLocalNotification } = await import('../../lib/notifications');
      
      await sendLocalNotification({
        type: 'general',
        title: 'Test Notification',
        body: 'This is a test notification to verify your settings are working correctly.',
        data: { test: true }
      });
      
      Alert.alert('Success', 'Test notification sent!');
    } catch (error) {
      console.error('Error sending test notification:', error);
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Notification Settings</Text>
          {onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icons.X size={IconSizes.lg} color={IconColors.gray600} />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading settings...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Notification Settings</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icons.X size={IconSizes.lg} color={IconColors.gray600} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Updates */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <View style={styles.sectionHeader}>
            <Icons.Bell size={IconSizes.lg} color={IconColors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Order Updates</Text>
          </View>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Get notified about your order status changes
          </Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Order Status Updates</Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Receive notifications when your order status changes
              </Text>
            </View>
            <Switch
              value={settings.orderUpdates}
              onValueChange={(value) => handleSettingChange('orderUpdates', value)}
              trackColor={{ false: colors.border, true: Colors.primary + '40' }}
              thumbColor={settings.orderUpdates ? Colors.primary : colors.textSecondary}
              disabled={saving}
            />
          </View>
        </View>

        {/* Promotions */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <View style={styles.sectionHeader}>
            <Icons.Star size={IconSizes.lg} color={IconColors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Promotions</Text>
          </View>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Get notified about special offers and promotions
          </Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Promotional Offers</Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Receive notifications about special deals and discounts
              </Text>
            </View>
            <Switch
              value={settings.promotions}
              onValueChange={(value) => handleSettingChange('promotions', value)}
              trackColor={{ false: colors.border, true: Colors.primary + '40' }}
              thumbColor={settings.promotions ? Colors.primary : colors.textSecondary}
              disabled={saving}
            />
          </View>
        </View>

        {/* Reminders */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <View style={styles.sectionHeader}>
            <Icons.Clock size={IconSizes.lg} color={IconColors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Reminders</Text>
          </View>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Get reminded about your orders and app features
          </Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Order Reminders</Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Receive reminders about your pending orders
              </Text>
            </View>
            <Switch
              value={settings.reminders}
              onValueChange={(value) => handleSettingChange('reminders', value)}
              trackColor={{ false: colors.border, true: Colors.primary + '40' }}
              thumbColor={settings.reminders ? Colors.primary : colors.textSecondary}
              disabled={saving}
            />
          </View>
        </View>

        {/* General */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <View style={styles.sectionHeader}>
            <Icons.Info size={IconSizes.lg} color={IconColors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>General</Text>
          </View>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            General app notifications and updates
          </Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>General Notifications</Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Receive general app notifications and updates
              </Text>
            </View>
            <Switch
              value={settings.general}
              onValueChange={(value) => handleSettingChange('general', value)}
              trackColor={{ false: colors.border, true: Colors.primary + '40' }}
              thumbColor={settings.general ? Colors.primary : colors.textSecondary}
              disabled={saving}
            />
          </View>
        </View>

        {/* Sound & Vibration */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <View style={styles.sectionHeader}>
            <Icons.Settings size={IconSizes.lg} color={IconColors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Sound & Vibration</Text>
          </View>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Control how notifications are delivered
          </Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Sound</Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Play sound when notifications arrive
              </Text>
            </View>
            <Switch
              value={settings.sound}
              onValueChange={(value) => handleSettingChange('sound', value)}
              trackColor={{ false: colors.border, true: Colors.primary + '40' }}
              thumbColor={settings.sound ? Colors.primary : colors.textSecondary}
              disabled={saving}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Vibration</Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Vibrate when notifications arrive
              </Text>
            </View>
            <Switch
              value={settings.vibration}
              onValueChange={(value) => handleSettingChange('vibration', value)}
              trackColor={{ false: colors.border, true: Colors.primary + '40' }}
              thumbColor={settings.vibration ? Colors.primary : colors.textSecondary}
              disabled={saving}
            />
          </View>
        </View>

        {/* Test Notification */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <TouchableOpacity 
            style={[styles.testButton, { backgroundColor: Colors.primary }]}
            onPress={handleTestNotification}
            disabled={saving}
          >
            <Icons.Bell size={IconSizes.md} color={Colors.white} />
            <Text style={styles.testButtonText}>Send Test Notification</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    ...Typography.h2,
    fontWeight: '600',
  },
  closeButton: {
    padding: Spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  loadingText: {
    ...Typography.body,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  section: {
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.h3,
    fontWeight: '600',
    marginLeft: Spacing.sm,
  },
  sectionDescription: {
    ...Typography.body,
    marginBottom: Spacing.lg,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  settingLabel: {
    ...Typography.body,
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  settingDescription: {
    ...Typography.caption,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  testButtonText: {
    ...Typography.button,
    color: Colors.white,
    marginLeft: Spacing.sm,
  },
});

export default NotificationSettingsComponent;
