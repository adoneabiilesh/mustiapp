import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Platform,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/lib/designSystem';
import { Icons } from '@/lib/icons';
import { 
  getMenuItems, 
  getFeaturedProducts,
  getSpecialOffers,
} from '@/lib/database';
import { useCartStore } from '@/store/cart.store';
import { useFavoritesStore } from '@/store/favorites.store';
import ProductGrid from '@/components/ProductGrid';
import RestaurantSlider from '@/components/RestaurantSlider';
import FeaturedProductsSection from '@/components/FeaturedProductsSection';
import BannerCarousel from '@/components/BannerCarousel';
import QuickFilters from '@/components/QuickFilters';
import TodaysSpecials from '@/components/TodaysSpecials';
import useRestaurantStore from '@/store/restaurant.store';
import * as Haptics from 'expo-haptics';

const MenuScreen = () => {
  const [combos, setCombos] = useState<any[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const { selectedRestaurant } = useRestaurantStore();
  const { getTotalItems } = useCartStore();

  useEffect(() => {
    loadData();
  }, [selectedRestaurant]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadCombos(),
        loadFeaturedProducts(),
      ]);
    } catch (error) {
      if (__DEV__) {
        console.error('Error loading data:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadCombos = async () => {
    try {
      // Load combos (special offers) from all restaurants
      const offers = await getSpecialOffers({
        // Don't filter by restaurant_id to show combos from all restaurants
        limit: 50, // Increased limit to show more combos
      });
      
      // Convert special offers to a format compatible with ProductGrid
      const comboItems = (offers || []).map(offer => ({
        id: offer.id,
        $id: offer.id,
        name: offer.title,
        description: offer.description || '',
        price: offer.offer_price,
        original_price: offer.original_price,
        image_url: offer.image_url,
        imageUrl: offer.image_url || '',
        discount_percentage: offer.discount_percentage,
        is_combo: true,
        special_offer: offer,
      }));
      
      if (__DEV__) {
        console.log('🍱 Loaded combos:', comboItems?.length || 0);
      }
      setCombos(comboItems);
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Error loading combos:', error);
      }
      setCombos([]);
    }
  };

  const loadFeaturedProducts = async () => {
    try {
      // Always load featured products from ALL restaurants (don't filter by restaurant_id)
      const products = await getFeaturedProducts({
        // Don't pass restaurant_id to show products from all restaurants
        limit: 50, // Increased limit to show more featured products
      });
      if (__DEV__) {
        console.log('⭐ Loaded featured products:', products?.length || 0);
        console.log('🏪 Sample products:', products.slice(0, 3).map(p => ({
          name: p.name,
          restaurant: p.restaurant?.name || 'No restaurant',
        })));
      }
      setFeaturedProducts(products || []);
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Error loading featured products:', error);
      }
      setFeaturedProducts([]);
    }
  };


  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const handleProductPress = (productId: string) => {
    router.push(`/item-detail?id=${productId}`);
  };

  const handleFavoriteToggle = (productId: string, newState: boolean) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    toggleFavorite(productId);
  };

  const handleAddToCart = (productId: string, allItems: any[] = []) => {
    const { addItem } = useCartStore.getState();
    // Search in all arrays
    const allProducts = [...combos, ...featuredProducts, ...allItems];
    const product = allProducts.find(item => item.$id === productId || item.id === productId);
    if (product) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      // If it's a combo, navigate to combo details instead of adding directly
      if (product.is_combo) {
        router.push(`/special-offer-details?id=${product.id}`);
        return;
      }
      addItem({
        id: product.$id || product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        customizations: []
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.locationContainer}>
            <Icons.MapPin size={16} color={Colors.primary[500]} />
            <View style={styles.locationText}>
              <Text style={styles.locationLabel}>Deliver to</Text>
              <Text style={styles.locationValue}>Current Location</Text>
            </View>
            <Icons.ChevronDown size={16} color={Colors.neutral[600]} />
          </View>
          
          <View style={styles.headerButtons}>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/cart')}
              style={styles.iconButton}
            >
              {getTotalItems() > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{getTotalItems()}</Text>
                </View>
              )}
              <Icons.ShoppingCart size={22} color={Colors.neutral[900]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => router.push('/(tabs)/search')}
          activeOpacity={0.7}
        >
          <Icons.Search size={20} color={Colors.neutral[500]} />
          <Text style={styles.searchPlaceholder}>Search for dishes...</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary[500]}
          />
        }
      >
        {/* Restaurant Slider */}
        <RestaurantSlider onRestaurantSelect={(restaurant) => {
          if (__DEV__) {
            console.log('Selected restaurant:', restaurant.name);
          }
        }} />

        {/* Banner Carousel */}
        <BannerCarousel />

        {/* Quick Filters */}
        <QuickFilters onFilterChange={(filterId) => {
          if (__DEV__) {
            console.log('Filter changed:', filterId);
          }
          // You can add filter logic here later
        }} />

        {/* Today's Specials */}
        <TodaysSpecials restaurantId={selectedRestaurant?.id} />

        {/* FEATURED PRODUCTS SECTION */}
        <View style={styles.sectionHeaderWithPadding}>
          <Text style={styles.sectionTitle}>⭐ Featured Items</Text>
          {featuredProducts.length > 0 && (
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          )}
        </View>
        {featuredProducts.length > 0 ? (
          <FeaturedProductsSection
            products={featuredProducts}
            onProductPress={handleProductPress}
            onAddToCart={(id) => handleAddToCart(id, featuredProducts)}
          />
        ) : (
          <View style={styles.emptySectionContainer}>
            <Text style={styles.emptySectionText}>No featured products available</Text>
            <Text style={styles.emptySectionSubtext}>Mark products as featured in the admin dashboard to see them here</Text>
          </View>
        )}

        {/* COMBOS SECTION */}
        <View style={styles.sectionHeaderWithPadding}>
          <Text style={styles.sectionTitle}>🍱 Combos</Text>
          {combos.length > 0 && (
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          )}
        </View>
        {combos.length > 0 ? (
          <ProductGrid
            products={combos.map(combo => ({
              id: combo.id,
              name: combo.name,
              description: combo.description,
              price: combo.price,
              imageUrl: combo.image_url || combo.imageUrl || '',
              isFavorite: isFavorite(combo.id),
              hasCustomizations: false,
            }))}
            onProductPress={(id) => router.push(`/special-offer-details?id=${id}`)}
            onFavoriteToggle={handleFavoriteToggle}
            onAddToCart={(id) => handleAddToCart(id, combos)}
          />
        ) : (
          <View style={styles.emptySectionContainer}>
            <Text style={styles.emptySectionText}>No combos available</Text>
            <Text style={styles.emptySectionSubtext}>Create combos in the admin dashboard to see them here</Text>
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    backgroundColor: Colors.background.primary,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  locationText: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 11,
    color: Colors.text.secondary,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  locationValue: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.card,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  searchPlaceholder: {
    fontSize: 15,
    color: Colors.text.secondary,
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.card,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    zIndex: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  sectionHeaderWithPadding: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    fontFamily: 'Georgia',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary[500],
  },
  menuSection: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  itemCount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  loadingContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  emptyContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
    marginTop: Spacing.md,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  emptySectionContainer: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  emptySectionText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  emptySectionSubtext: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
});

export default MenuScreen;
