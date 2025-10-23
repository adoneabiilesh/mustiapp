import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/lib/designSystem';
import { Icons } from '@/lib/icons';
import { RESTAURANT_CONFIG } from '@/lib/restaurantConfig';

const AboutScreen = () => {
  const handlePhoneCall = () => {
    Linking.openURL(`tel:${RESTAURANT_CONFIG.phone}`);
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${RESTAURANT_CONFIG.email}`);
  };

  const handleWebsite = () => {
    Linking.openURL(`https://${RESTAURANT_CONFIG.website}`);
  };

  const handleSocialMedia = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.neutral[50] }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ 
          backgroundColor: RESTAURANT_CONFIG.primaryColor, 
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
            <Image
              source={{ uri: RESTAURANT_CONFIG.images.logo }}
              style={{
                width: 120,
                height: 120,
                borderRadius: BorderRadius.full,
                marginBottom: Spacing.md,
              }}
            />
            <Text style={[Typography.h2, { color: '#FFFFFF', textAlign: 'center', marginBottom: Spacing.sm }]}>
              {RESTAURANT_CONFIG.name}
            </Text>
            <Text style={[Typography.body1, { color: 'rgba(255, 255, 255, 0.9)', textAlign: 'center' }]}>
              {RESTAURANT_CONFIG.tagline}
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
              {RESTAURANT_CONFIG.description}
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
                    {RESTAURANT_CONFIG.phone}
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
                    {RESTAURANT_CONFIG.email}
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
                    {RESTAURANT_CONFIG.address}
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
              {Object.entries(RESTAURANT_CONFIG.hours).map(([day, hours]) => (
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
              ))}
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
                {Object.entries(RESTAURANT_CONFIG.features).map(([feature, available]) => (
                  available && (
                    <View key={feature} style={{
                      backgroundColor: RESTAURANT_CONFIG.primaryColor + '10',
                      borderRadius: BorderRadius.md,
                      paddingHorizontal: Spacing.sm,
                      paddingVertical: Spacing.xs,
                    }}>
                      <Text style={[Typography.caption, { color: RESTAURANT_CONFIG.primaryColor }]}>
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
              {Object.entries(RESTAURANT_CONFIG.socialMedia).map(([platform, url]) => (
                <TouchableOpacity
                  key={platform}
                  onPress={() => handleSocialMedia(url)}
                  style={{
                    flex: 1,
                    backgroundColor: '#FFFFFF',
                    borderRadius: BorderRadius.lg,
                    padding: Spacing.md,
                    alignItems: 'center',
                    ...Shadows.sm,
                  }}
                >
                  <Text style={[Typography.label, { color: RESTAURANT_CONFIG.primaryColor }]}>
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
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
                  {RESTAURANT_CONFIG.ratings.average}
                </Text>
                <View style={{ marginLeft: Spacing.sm }}>
                  <View style={{ flexDirection: 'row' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Icons.Star
                        key={star}
                        size={16}
                        color={star <= RESTAURANT_CONFIG.ratings.average ? '#FFD700' : Colors.neutral[300]}
                      />
                    ))}
                  </View>
                  <Text style={[Typography.caption, { color: Colors.neutral[600] }]}>
                    {RESTAURANT_CONFIG.ratings.totalReviews} reviews
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
