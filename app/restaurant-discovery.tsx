/**
 * RESTAURANT DISCOVERY SCREEN
 * Beautiful multi-restaurant selection with location-based filtering
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/lib/designSystem';
import { Icons } from '@/lib/icons';
import useRestaurantStore, { Restaurant } from '@/store/restaurant.store';
import { useSmartCache } from '@/lib/performance';
import { supabase } from '@/lib/supabase';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const RestaurantDiscoveryScreen = () => {
  const {
    selectedRestaurant,
    setSelectedRestaurant,
    restaurants,
    setRestaurants,
    nearbyRestaurants,
    setNearbyRestaurants,
    favoriteRestaurants,
    addFavoriteRestaurant,
    removeFavoriteRestaurant,
    userLocation,
    setUserLocation,
    getDistanceToRestaurant,
  } = useRestaurantStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'nearby' | 'favorites' | 'open'>('all');
  const [locationPermission, setLocationPermission] = useState<boolean>(false);

  // Fetch restaurants
  const { data: allRestaurants, isLoading, refetch } = useSmartCache<Restaurant[]>(
    'all_restaurants',
    async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('rating', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    { ttl: 600000 } // 10 minutes
  );

  // Update store when data loads
  useEffect(() => {
    if (allRestaurants) {
      setRestaurants(allRestaurants);
    }
  }, [allRestaurants]);

  // Request location permission
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationPermission(true);
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    })();
  }, []);

  // Filter nearby restaurants
  useEffect(() => {
    if (userLocation && allRestaurants) {
      const nearby = allRestaurants.filter(restaurant => {
        const distance = getDistanceToRestaurant(restaurant);
        return distance !== null && distance <= restaurant.delivery_radius;
      });
      setNearbyRestaurants(nearby);
    }
  }, [userLocation, allRestaurants]);

  // Filter restaurants based on selection
  const filteredRestaurants = React.useMemo(() => {
    let filtered = restaurants;

    // Apply filter
    if (selectedFilter === 'nearby') {
      filtered = nearbyRestaurants;
    } else if (selectedFilter === 'favorites') {
      filtered = restaurants.filter(r => favoriteRestaurants.includes(r.id));
    } else if (selectedFilter === 'open') {
      const now = new Date();
      const currentHour = now.getHours();
      // Simplified: assume restaurants open 8am-10pm
      filtered = restaurants.filter(() => currentHour >= 8 && currentHour <= 22);
    }

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.cuisine_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [restaurants, nearbyRestaurants, selectedFilter, searchQuery, favoriteRestaurants]);

  const handleRestaurantSelect = (restaurant: Restaurant) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setSelectedRestaurant(restaurant);
    router.back();
  };

  const handleFavoriteToggle = (restaurantId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (favoriteRestaurants.includes(restaurantId)) {
      removeFavoriteRestaurant(restaurantId);
    } else {
      addFavoriteRestaurant(restaurantId);
    }
  };

  const renderRestaurantCard = (restaurant: Restaurant) => {
    const distance = getDistanceToRestaurant(restaurant);
    const isFavorite = favoriteRestaurants.includes(restaurant.id);

    return (
      <TouchableOpacity
        key={restaurant.id}
        onPress={() => handleRestaurantSelect(restaurant)}
        activeOpacity={0.9}
        style={{
          backgroundColor: 'white',
          borderRadius: BorderRadius.xl,
          marginBottom: Spacing.lg,
          overflow: 'hidden',
          ...Shadows.lg,
        }}
      >
        {/* Cover Image */}
        <View style={{ position: 'relative' }}>
          <Image
            source={{ uri: restaurant.cover_image_url || restaurant.logo_url }}
            style={{ width: '100%', height: 180 }}
            resizeMode="cover"
          />
          
          {/* Featured Badge */}
          {restaurant.is_featured && (
            <View style={{
              position: 'absolute',
              top: Spacing.md,
              left: Spacing.md,
              backgroundColor: Colors.warning[500],
              paddingHorizontal: Spacing.md,
              paddingVertical: Spacing.xs,
              borderRadius: BorderRadius.full,
            }}>
              <Text style={[Typography.caption, { color: 'white', fontWeight: '600' }]}>
                ⭐ Featured
              </Text>
            </View>
          )}

          {/* Favorite Button */}
          <TouchableOpacity
            onPress={() => handleFavoriteToggle(restaurant.id)}
            style={{
              position: 'absolute',
              top: Spacing.md,
              right: Spacing.md,
              width: 40,
              height: 40,
              borderRadius: BorderRadius.full,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              justifyContent: 'center',
              alignItems: 'center',
              ...Shadows.md,
            }}
          >
            <Icons.Heart
              size={20}
              color={isFavorite ? Colors.error[500] : Colors.neutral[400]}
              fill={isFavorite ? Colors.error[500] : 'none'}
            />
          </TouchableOpacity>

          {/* Logo Overlay */}
          <View style={{
            position: 'absolute',
            bottom: -30,
            left: Spacing.lg,
            width: 60,
            height: 60,
            borderRadius: BorderRadius.full,
            backgroundColor: 'white',
            ...Shadows.lg,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Image
              source={{ uri: restaurant.logo_url }}
              style={{ width: 50, height: 50, borderRadius: BorderRadius.full }}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Content */}
        <View style={{ padding: Spacing.lg, paddingTop: Spacing.xl + Spacing.md }}>
          {/* Name & Rating */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.xs }}>
            <Text style={[Typography.h3, { flex: 1, paddingRight: Spacing.md }]}>
              {restaurant.name}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icons.Star size={16} color={Colors.warning[500]} fill={Colors.warning[500]} />
              <Text style={[Typography.semibold, { marginLeft: 4 }]}>
                {restaurant.rating.toFixed(1)}
              </Text>
              <Text style={[Typography.caption, { color: Colors.neutral[500], marginLeft: 4 }]}>
                ({restaurant.total_reviews})
              </Text>
            </View>
          </View>

          {/* Cuisine Type */}
          <Text style={[Typography.body, { color: Colors.neutral[600], marginBottom: Spacing.sm }]}>
            {restaurant.cuisine_type}
          </Text>

          {/* Info Row */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md }}>
            {distance !== null && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icons.MapPin size={14} color={Colors.primary[500]} />
                <Text style={[Typography.caption, { marginLeft: 4, color: Colors.neutral[600] }]}>
                  {distance} km
                </Text>
              </View>
            )}
            
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icons.Clock size={14} color={Colors.primary[500]} />
              <Text style={[Typography.caption, { marginLeft: 4, color: Colors.neutral[600] }]}>
                {restaurant.preparation_time} min
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icons.DollarSign size={14} color={Colors.primary[500]} />
              <Text style={[Typography.caption, { marginLeft: 4, color: Colors.neutral[600] }]}>
                €{restaurant.delivery_fee.toFixed(2)} delivery
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icons.ShoppingBag size={14} color={Colors.primary[500]} />
              <Text style={[Typography.caption, { marginLeft: 4, color: Colors.neutral[600] }]}>
                Min €{restaurant.minimum_order.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background[50] }}>
      {/* Header */}
      <View style={{
        backgroundColor: 'white',
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.md,
        ...Shadows.sm,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: Spacing.md }}>
            <Icons.ArrowLeft size={24} color={Colors.neutral[900]} />
          </TouchableOpacity>
          <Text style={Typography.h2}>Choose Restaurant</Text>
        </View>

        {/* Search Bar */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: Colors.background[50],
          borderRadius: BorderRadius.full,
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.sm,
          marginBottom: Spacing.md,
        }}>
          <Icons.Search size={20} color={Colors.neutral[400]} />
          <TextInput
            placeholder="Search restaurants, cuisines..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[
              Typography.body,
              {
                flex: 1,
                marginLeft: Spacing.sm,
                paddingVertical: Spacing.xs,
                color: Colors.neutral[900],
              },
            ]}
            placeholderTextColor={Colors.neutral[400]}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icons.X size={20} color={Colors.neutral[400]} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.sm }}>
          {[
            { key: 'all', label: 'All', icon: Icons.Grid },
            { key: 'nearby', label: 'Nearby', icon: Icons.MapPin },
            { key: 'favorites', label: 'Favorites', icon: Icons.Heart },
            { key: 'open', label: 'Open Now', icon: Icons.Clock },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              onPress={() => {
                setSelectedFilter(filter.key as any);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: Spacing.md,
                paddingVertical: Spacing.sm,
                borderRadius: BorderRadius.full,
                backgroundColor: selectedFilter === filter.key ? Colors.primary[500] : Colors.background[50],
                marginRight: Spacing.sm,
              }}
            >
              <filter.icon
                size={16}
                color={selectedFilter === filter.key ? 'white' : Colors.neutral[600]}
              />
              <Text
                style={[
                  Typography.semibold,
                  {
                    marginLeft: Spacing.xs,
                    color: selectedFilter === filter.key ? 'white' : Colors.neutral[600],
                  },
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Restaurant List */}
      <ScrollView
        contentContainerStyle={{ padding: Spacing.lg }}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: Spacing.xl * 2 }}>
            <ActivityIndicator size="large" color={Colors.primary[500]} />
            <Text style={[Typography.body, { marginTop: Spacing.md, color: Colors.neutral[600] }]}>
              Loading restaurants...
            </Text>
          </View>
        ) : filteredRestaurants.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: Spacing.xl * 2 }}>
            <Icons.Search size={64} color={Colors.neutral[300]} />
            <Text style={[Typography.h3, { marginTop: Spacing.lg, textAlign: 'center' }]}>
              No restaurants found
            </Text>
            <Text style={[Typography.body, { marginTop: Spacing.sm, textAlign: 'center', color: Colors.neutral[600] }]}>
              Try adjusting your filters or search
            </Text>
          </View>
        ) : (
          filteredRestaurants.map(renderRestaurantCard)
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default RestaurantDiscoveryScreen;


