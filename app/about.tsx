import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/lib/designSystem';
import { Icons } from '@/lib/icons';
import { getRestaurantConfig, getRestaurantSettingsWithFallback, getDefaultRestaurantSettings } from '@/lib/restaurantService';
import { RESTAURANT_CONFIG } from '@/lib/restaurantConfig';
import useRestaurantStore from '@/store/restaurant.store';

const AboutScreen = () => {
  const [restaurantConfig, setRestaurantConfig] = useState<any>(null);
  const [restaurantSettings, setRestaurantSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { selectedRestaurant } = useRestaurantStore();

  useEffect(() => {
    loadRestaurantData();
  }, [selectedRestaurant]);

  const loadRestaurantData = async () => {
    try {
      setLoading(true);
      const config = await getRestaurantConfig(selectedRestaurant?.id);
      const settings = await getRestaurantSettingsWithFallback(selectedRestaurant?.id);
      
      setRestaurantConfig(config);
      setRestaurantSettings(settings);
    } catch (error) {
      console.error('Error loading restaurant data:', error);
      // Fallback to default
      setRestaurantSettings(getDefaultRestaurantSettings());
      setRestaurantConfig({
        name: RESTAURANT_CONFIG.name,
        description: RESTAURANT_CONFIG.description,
        phone: RESTAURANT_CONFIG.phone,
        email: RESTAURANT_CONFIG.email,
        address: RESTAURANT_CONFIG.address,
      });
    } finally {
      setLoading(false);
    }
  };

  const config = restaurantConfig || {
    name: RESTAURANT_CONFIG.name,
    description: RESTAURANT_CONFIG.description,
    phone: RESTAURANT_CONFIG.phone,
    email: RESTAURANT_CONFIG.email,
    address: RESTAURANT_CONFIG.address,
  };

  const settings = restaurantSettings || getDefaultRestaurantSettings();
  const primaryColor = settings.primary_color || RESTAURANT_CONFIG.primaryColor;
  const tagline = settings.tagline || RESTAURANT_CONFIG.tagline;

  const handlePhoneCall = () => {
    if (config.phone) {
      Linking.openURL(`tel:${config.phone}`);
    }
  };

  const handleEmail = () => {
    if (config.email) {
      Linking.openURL(`mailto:${config.email}`);
    }
  };

  const handleWebsite = () => {
    if (config.website) {
      Linking.openURL(`https://${config.website}`);
    }
  };

  const handleSocialMedia = (url: string) => {
    if (url && !url.includes('placeholder')) {
      Linking.openURL(url.startsWith('http') ? url : `https://${url}`);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.neutral[50], justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={primaryColor} />
        <Text style={{ marginTop: Spacing.md, color: Colors.neutral[600] }}>Loading restaurant info...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.neutral[50] }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ 
          backgroundColor: primaryColor, 
          paddingHorizontal: Spacing.lg, 
          paddingVertical: Spacing.xl,
          borderBottomLeftRadius: BorderRadius['2xl'],
          borderBottomRightRadius: BorderRadius['2xl'],
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.lg }}>
            <TouchableOpacity onPress={() => router.back()}>
              <Icons.ArrowBack size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={[Typography.h3, { color: '#FFFFFF' }]}>
              About Us
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={{ alignItems: 'center' }}>
            {config.logo_url && (
              <Image
                source={{ uri: config.logo_url }}
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: BorderRadius.full,
                  marginBottom: Spacing.md,
                }}
              />
            )}
            <Text style={[Typography.h2, { color: '#FFFFFF', textAlign: 'center', marginBottom: Spacing.sm }]}>
              {config.name}
            </Text>
            <Text style={[Typography.body1, { color: 'rgba(255, 255, 255, 0.9)', textAlign: 'center' }]}>
              {tagline}
            </Text>
          </View>
        </View>

        {/* Restaurant Info */}
        <View style={{ padding: Spacing.lg }}>
          {/* Description */}
          <View style={{ marginBottom: Spacing.xl }}>
            <Text style={[Typography.h5, { color: Colors.neutral[900], marginBottom: Spacing.md }]}>
              Our Story
            </Text>
            <Text style={[Typography.body1, { color: Colors.neutral[700], lineHeight: 24 }]}>
              {config.description || 'Welcome to our restaurant!'}
            </Text>
          </View>

          {/* Contact Information */}
          <View style={{ marginBottom: Spacing.xl }}>
            <Text style={[Typography.h5, { color: Colors.neutral[900], marginBottom: Spacing.md }]}>
              Contact Information
            </Text>
            
            <View style={{ gap: Spacing.md }}>
              <TouchableOpacity
                onPress={handlePhoneCall}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#FFFFFF',
                  borderRadius: BorderRadius.lg,
                  padding: Spacing.md,
                  ...Shadows.sm,
                }}
              >
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: BorderRadius.full,
                  backgroundColor: RESTAURANT_CONFIG.primaryColor + '20',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: Spacing.md,
                }}>
                  <Icons.Phone size={20} color={RESTAURANT_CONFIG.primaryColor} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[Typography.label, { color: Colors.neutral[900] }]}>
                    Phone
                  </Text>
                  <Text style={[Typography.body2, { color: Colors.neutral[600] }]}>
                    {config.phone || 'Not available'}
                  </Text>
                </View>
                <Icons.ChevronRight size={20} color={Colors.neutral[400]} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleEmail}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#FFFFFF',
                  borderRadius: BorderRadius.lg,
                  padding: Spacing.md,
                  ...Shadows.sm,
                }}
              >
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: BorderRadius.full,
                  backgroundColor: RESTAURANT_CONFIG.primaryColor + '20',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: Spacing.md,
                }}>
                  <Icons.Mail size={20} color={RESTAURANT_CONFIG.primaryColor} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[Typography.label, { color: Colors.neutral[900] }]}>
                    Email
                  </Text>
                  <Text style={[Typography.body2, { color: Colors.neutral[600] }]}>
                    {config.email || 'Not available'}
                  </Text>
                </View>
                <Icons.ChevronRight size={20} color={Colors.neutral[400]} />
              </TouchableOpacity>

              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#FFFFFF',
                borderRadius: BorderRadius.lg,
                padding: Spacing.md,
                ...Shadows.sm,
              }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: BorderRadius.full,
                  backgroundColor: RESTAURANT_CONFIG.primaryColor + '20',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: Spacing.md,
                }}>
                  <Icons.Location size={20} color={RESTAURANT_CONFIG.primaryColor} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[Typography.label, { color: Colors.neutral[900] }]}>
                    Address
                  </Text>
                  <Text style={[Typography.body2, { color: Colors.neutral[600] }]}>
                    {typeof config.address === 'string' ? config.address : 
                     config.address?.street ? `${config.address.street}, ${config.address.city}` : 
                     'Address not available'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Operating Hours */}
          <View style={{ marginBottom: Spacing.xl }}>
            <Text style={[Typography.h5, { color: Colors.neutral[900], marginBottom: Spacing.md }]}>
              Operating Hours
            </Text>
            
            <View style={{
              backgroundColor: '#FFFFFF',
              borderRadius: BorderRadius.lg,
              padding: Spacing.md,
              ...Shadows.sm,
            }}>
              {config.hours && config.hours.length > 0 ? (
                config.hours.map((hour: any, index: number) => {
                  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                  const dayName = days[hour.day_of_week];
                  const hoursText = hour.is_closed ? 'Closed' : 
                    hour.open_time && hour.close_time ? 
                    `${hour.open_time} - ${hour.close_time}` : 'Hours not set';
                  
                  return (
                    <View key={index} style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingVertical: Spacing.sm,
                      borderBottomWidth: index < config.hours.length - 1 ? 1 : 0,
                      borderBottomColor: Colors.neutral[100],
                    }}>
                      <Text style={[Typography.body2, { color: Colors.neutral[700] }]}>
                        {dayName}
                      </Text>
                      <Text style={[Typography.body2, { color: Colors.neutral[600] }]}>
                        {hoursText}
                      </Text>
                    </View>
                  );
                })
              ) : (
                Object.entries(RESTAURANT_CONFIG.hours).map(([day, hours]) => (
                <View key={day} style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: Spacing.sm,
                  borderBottomWidth: 1,
                  borderBottomColor: Colors.neutral[100],
                }}>
                  <Text style={[Typography.body2, { color: Colors.neutral[700], textTransform: 'capitalize' }]}>
                    {day}
                  </Text>
                  <Text style={[Typography.body2, { color: Colors.neutral[600] }]}>
                    {hours}
                  </Text>
                </View>
                ))
              )}
            </View>
          </View>

          {/* Features */}
          <View style={{ marginBottom: Spacing.xl }}>
            <Text style={[Typography.h5, { color: Colors.neutral[900], marginBottom: Spacing.md }]}>
              What We Offer
            </Text>
            
            <View style={{
              backgroundColor: '#FFFFFF',
              borderRadius: BorderRadius.lg,
              padding: Spacing.md,
              ...Shadows.sm,
            }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }}>
                {settings.features && Object.entries(settings.features).map(([feature, available]: [string, any]) => (
                  available && (
                    <View key={feature} style={{
                      backgroundColor: primaryColor + '10',
                      borderRadius: BorderRadius.md,
                      paddingHorizontal: Spacing.sm,
                      paddingVertical: Spacing.xs,
                    }}>
                      <Text style={[Typography.caption, { color: primaryColor }]}>
                        {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </Text>
                    </View>
                  )
                ))}
              </View>
            </View>
          </View>

          {/* Social Media */}
          <View style={{ marginBottom: Spacing.xl }}>
            <Text style={[Typography.h5, { color: Colors.neutral[900], marginBottom: Spacing.md }]}>
              Follow Us
            </Text>
            
            <View style={{ flexDirection: 'row', gap: Spacing.md }}>
              {settings.facebook_url && (
                <TouchableOpacity
                  onPress={() => handleSocialMedia(settings.facebook_url)}
                  style={{
                    flex: 1,
                    backgroundColor: '#FFFFFF',
                    borderRadius: BorderRadius.lg,
                    padding: Spacing.md,
                    alignItems: 'center',
                    ...Shadows.sm,
                  }}
                >
                  <Text style={[Typography.label, { color: primaryColor }]}>Facebook</Text>
                </TouchableOpacity>
              )}
              {settings.instagram_url && (
                <TouchableOpacity
                  onPress={() => handleSocialMedia(settings.instagram_url)}
                  style={{
                    flex: 1,
                    backgroundColor: '#FFFFFF',
                    borderRadius: BorderRadius.lg,
                    padding: Spacing.md,
                    alignItems: 'center',
                    ...Shadows.sm,
                  }}
                >
                  <Text style={[Typography.label, { color: primaryColor }]}>Instagram</Text>
                </TouchableOpacity>
              )}
              {settings.twitter_url && (
                <TouchableOpacity
                  onPress={() => handleSocialMedia(settings.twitter_url)}
                  style={{
                    flex: 1,
                    backgroundColor: '#FFFFFF',
                    borderRadius: BorderRadius.lg,
                    padding: Spacing.md,
                    alignItems: 'center',
                    ...Shadows.sm,
                  }}
                >
                  <Text style={[Typography.label, { color: primaryColor }]}>Twitter</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Ratings */}
          <View style={{ marginBottom: Spacing.xl }}>
            <Text style={[Typography.h5, { color: Colors.neutral[900], marginBottom: Spacing.md }]}>
              Customer Reviews
            </Text>
            
            <View style={{
              backgroundColor: '#FFFFFF',
              borderRadius: BorderRadius.lg,
              padding: Spacing.lg,
              alignItems: 'center',
              ...Shadows.sm,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm }}>
                <Text style={[Typography.h2, { color: Colors.neutral[900] }]}>
                  {config.rating?.toFixed(1) || '0.0'}
                </Text>
                <View style={{ marginLeft: Spacing.sm }}>
                  <View style={{ flexDirection: 'row' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Icons.Star
                        key={star}
                        size={16}
                        color={star <= (config.rating || 0) ? '#FFD700' : Colors.neutral[300]}
                      />
                    ))}
                  </View>
                  <Text style={[Typography.caption, { color: Colors.neutral[600] }]}>
                    {config.total_reviews || 0} reviews
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AboutScreen;
