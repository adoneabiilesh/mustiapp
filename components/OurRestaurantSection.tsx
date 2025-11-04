import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '@/lib/designSystem';
import { Icons } from '@/lib/icons';
import * as Haptics from 'expo-haptics';

interface OurRestaurantSectionProps {
  restaurant: {
    id: string;
    name: string;
    description?: string;
    image_url?: string;
    address?: any;
    phone?: string;
    rating?: number;
    total_reviews?: number;
  } | null;
}

const OurRestaurantSection: React.FC<OurRestaurantSectionProps> = ({ restaurant }) => {
  if (!restaurant) return null;

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push(`/restaurant-details?id=${restaurant.id}`);
  };

  const address = typeof restaurant.address === 'string' 
    ? restaurant.address 
    : restaurant.address?.street || 'Location not available';

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Our Restaurant</Text>
        <Text style={styles.sectionSubtitle}>Where delicious happens</Text>
      </View>

      {/* Restaurant Card */}
      <TouchableOpacity 
        style={styles.card} 
        onPress={handlePress}
        activeOpacity={0.9}
      >
        {/* Restaurant Image */}
        {restaurant.image_url ? (
          <Image
            source={{ uri: restaurant.image_url }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.image, styles.placeholderImage]}>
            <Icons.Utensils size={48} color={Colors.neutral[400]} />
          </View>
        )}

        {/* Restaurant Info Overlay */}
        <View style={styles.overlay}>
          <View style={styles.infoContainer}>
            <Text style={styles.restaurantName}>{restaurant.name}</Text>
            
            {restaurant.description && (
              <Text style={styles.description} numberOfLines={2}>
                {restaurant.description}
              </Text>
            )}

            <View style={styles.detailsRow}>
              {/* Rating */}
              {restaurant.rating && (
                <View style={styles.ratingContainer}>
                  <Icons.Star size={16} color="#FFB800" fill="#FFB800" />
                  <Text style={styles.ratingText}>
                    {restaurant.rating.toFixed(1)}
                  </Text>
                  {restaurant.total_reviews && (
                    <Text style={styles.reviewsText}>
                      ({restaurant.total_reviews})
                    </Text>
                  )}
                </View>
              )}

              {/* Location */}
              <View style={styles.locationContainer}>
                <Icons.MapPin size={14} color={Colors.neutral[600]} />
                <Text style={styles.addressText} numberOfLines={1}>
                  {address}
                </Text>
              </View>
            </View>

            {/* View Details Button */}
            <View style={styles.buttonContainer}>
              <View style={styles.viewButton}>
                <Text style={styles.buttonText}>View Menu & Details</Text>
                <Icons.ChevronRight size={18} color="#FFFFFF" />
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 28,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontWeight: '400',
    color: Colors.neutral[900],
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.neutral[600],
    fontWeight: '400',
  },
  card: {
    borderRadius: BorderRadius['3xl'],
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    ...Shadows.lg,
    height: 320,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    backgroundColor: Colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(10px)',
  },
  infoContainer: {
    padding: Spacing.lg,
  },
  restaurantName: {
    fontSize: 24,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  detailsRow: {
    marginBottom: Spacing.md,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  reviewsText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  addressText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 6,
    flex: 1,
  },
  buttonContainer: {
    marginTop: Spacing.sm,
  },
  viewButton: {
    backgroundColor: Colors.primary[500],
    paddingVertical: 12,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 6,
  },
});

export default OurRestaurantSection;




