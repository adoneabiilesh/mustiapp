/**
 * RESTAURANT SLIDER COMPONENT
 * Beautiful horizontal slider showing all available restaurants
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/lib/designSystem';
import { Icons } from '@/lib/icons';
import { getRestaurants } from '@/lib/database';
import useRestaurantStore, { Restaurant } from '@/store/restaurant.store';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;

interface RestaurantSliderProps {
  onRestaurantSelect?: (restaurant: Restaurant) => void;
}

export const RestaurantSlider: React.FC<RestaurantSliderProps> = ({
  onRestaurantSelect,
}) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedRestaurant, setSelectedRestaurant } = useRestaurantStore();

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const data = await getRestaurants({ is_active: true });
      setRestaurants(data || []);
      
      // Auto-select first restaurant if none selected
      if (!selectedRestaurant && data && data.length > 0) {
        setSelectedRestaurant(data[0]);
      }
    } catch (error) {
      console.error('Error loading restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestaurantPress = (restaurant: Restaurant) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    setSelectedRestaurant(restaurant);
    onRestaurantSelect?.(restaurant);
  };

  const handleRestaurantCardPress = (restaurant: Restaurant) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    // Navigate to restaurant details page with all products
    router.push(`/restaurant-detail?id=${restaurant.id}`);
  };

  const isRestaurantOpen = (restaurant: Restaurant) => {
    // Simple check - can be enhanced with actual operating hours
    return restaurant.is_active;
  };

  const getOpeningHours = (restaurant: Restaurant) => {
    // Placeholder - replace with actual hours from database
    return '8:00 AM - 10:00 PM';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading restaurants...</Text>
      </View>
    );
  }

  if (restaurants.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icons.MapPin size={48} color={Colors.neutral[300]} />
        <Text style={styles.emptyText}>No restaurants available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.sectionTitle}>Our Restaurants</Text>
        <Text style={styles.sectionSubtitle}>
          {restaurants.length} location{restaurants.length !== 1 ? 's' : ''} available
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={CARD_WIDTH + 16}
        decelerationRate="fast"
      >
        {restaurants.map((restaurant, index) => {
          const isSelected = selectedRestaurant?.id === restaurant.id;
          const isOpen = isRestaurantOpen(restaurant);

          return (
            <TouchableOpacity
              key={restaurant.id}
              onPress={() => handleRestaurantCardPress(restaurant)}
              activeOpacity={0.9}
              style={[
                styles.restaurantCard,
                isSelected && styles.restaurantCardSelected,
                index === 0 && styles.firstCard,
                index === restaurants.length - 1 && styles.lastCard,
              ]}
            >
              {/* Restaurant Image */}
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: restaurant.cover_image_url || restaurant.logo_url }}
                  style={styles.restaurantImage}
                  resizeMode="cover"
                />
                
                {/* Overlay Gradient */}
                <View style={styles.imageOverlay} />
                
                {/* Status Badge */}
                <View style={[
                  styles.statusBadge,
                  isOpen ? styles.statusBadgeOpen : styles.statusBadgeClosed
                ]}>
                  <View style={[
                    styles.statusDot,
                    isOpen ? styles.statusDotOpen : styles.statusDotClosed
                  ]} />
                  <Text style={styles.statusText}>
                    {isOpen ? 'Open' : 'Closed'}
                  </Text>
                </View>

                {/* Logo */}
                <View style={styles.logoContainer}>
                  <Image
                    source={{ uri: restaurant.logo_url }}
                    style={styles.logo}
                    resizeMode="cover"
                  />
                </View>
              </View>

              {/* Restaurant Info */}
              <View style={styles.infoContainer}>
                <Text style={styles.restaurantName} numberOfLines={1}>
                  {restaurant.name}
                </Text>
                
                <Text style={styles.cuisineType} numberOfLines={1}>
                  {restaurant.cuisine_type}
                </Text>

                {/* Details Row */}
                <View style={styles.detailsRow}>
                  {/* Rating */}
                  <View style={styles.detail}>
                    <Icons.Star size={14} color="#FFB800" />
                    <Text style={styles.detailText}>
                      {restaurant.rating.toFixed(1)}
                    </Text>
                  </View>

                  {/* Prep Time */}
                  <View style={styles.detail}>
                    <Icons.Clock size={14} color={Colors.neutral[600]} />
                    <Text style={styles.detailText}>
                      {restaurant.preparation_time} min
                    </Text>
                  </View>

                  {/* Delivery Fee */}
                  <View style={styles.detail}>
                    <Icons.Truck size={14} color={Colors.neutral[600]} />
                    <Text style={styles.detailText}>
                      ${restaurant.delivery_fee.toFixed(2)}
                    </Text>
                  </View>
                </View>

                {/* Operating Hours */}
                <View style={styles.hoursContainer}>
                  <Icons.Clock size={12} color={Colors.neutral[500]} />
                  <Text style={styles.hoursText}>
                    {getOpeningHours(restaurant)}
                  </Text>
                </View>

                {/* View Menu Button */}
                <TouchableOpacity 
                  style={styles.viewMenuButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleRestaurantCardPress(restaurant);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.viewMenuText}>View Menu & Details</Text>
                  <Icons.ChevronRight size={16} color="#FFFFFF" />
                </TouchableOpacity>

                {/* Selected Indicator */}
                {isSelected && (
                  <View style={styles.selectedIndicator}>
                    <Icons.Check size={16} color="#FFFFFF" />
                    <Text style={styles.selectedText}>Current</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  loadingContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: Colors.neutral[600],
  },
  emptyContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.neutral[600],
    marginTop: Spacing.md,
  },
  headerContainer: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 28,
    fontFamily: 'Georgia',
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  restaurantCard: {
    width: CARD_WIDTH,
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.lg,
    marginRight: Spacing.lg,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  restaurantCardSelected: {
    borderWidth: 3,
    borderColor: Colors.primary[500],
  },
  firstCard: {
    marginLeft: 0,
  },
  lastCard: {
    marginRight: Spacing.xl,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  restaurantImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  statusBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusBadgeOpen: {
    backgroundColor: 'rgba(76, 175, 80, 0.95)',
  },
  statusBadgeClosed: {
    backgroundColor: 'rgba(244, 67, 54, 0.95)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusDotOpen: {
    backgroundColor: '#FFFFFF',
  },
  statusDotClosed: {
    backgroundColor: '#FFFFFF',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  logoContainer: {
    position: 'absolute',
    bottom: -30,
    left: 20,
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    ...Shadows.lg,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    padding: Spacing.xl,
    paddingTop: 44,
  },
  restaurantName: {
    fontSize: 22,
    fontFamily: 'Georgia',
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  cuisineType: {
    fontSize: 15,
    color: Colors.text.secondary,
    marginBottom: Spacing.lg,
    lineHeight: 22,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.md,
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 13,
    color: Colors.neutral[700],
    fontWeight: '500',
  },
  hoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
    marginTop: Spacing.sm,
  },
  hoursText: {
    fontSize: 12,
    color: Colors.neutral[600],
  },
  viewMenuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary[500],
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.xl,
    marginTop: Spacing.sm,
    gap: 6,
    ...Shadows.sm,
  },
  viewMenuText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 4,
  },
  selectedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default RestaurantSlider;


