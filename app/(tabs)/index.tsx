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
import SpecialOffersSection from '@/components/SpecialOffersSection';
import BannerCarousel from '@/components/BannerCarousel';
import QuickFilters from '@/components/QuickFilters';
import TodaysSpecials from '@/components/TodaysSpecials';
import useRestaurantStore from '@/store/restaurant.store';
import * as Haptics from 'expo-haptics';

const MenuScreen = () => {
  const [burgers, setBurgers] = useState<any[]>([]);
  const [pizza, setPizza] = useState<any[]>([]);
  const [wraps, setWraps] = useState<any[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [specialOffers, setSpecialOffers] = useState<any[]>([]);
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
        loadBurgers(),
        loadPizza(),
        loadWraps(),
        loadFeaturedProducts(),
        loadSpecialOffers(),
      ]);
    } catch (error) {
      if (__DEV__) {
        console.error('Error loading data:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadBurgers = async () => {
    try {
      // Load burgers from all restaurants
      const items = await getMenuItems({
        is_available: true,
        limit: 20,
      });
      // Filter by category name containing "burger" or "burgers"
      const burgerItems = (items || []).filter(item => {
        const category = item.category?.toLowerCase() || '';
        const categories = item.categories?.map((c: any) => c.name?.toLowerCase() || '') || [];
        const name = item.name?.toLowerCase() || '';
        return category.includes('burger') || 
               categories.some((c: string) => c.includes('burger')) ||
               name.includes('burger');
      });
      if (__DEV__) {
        console.log('🍔 Loaded burgers:', burgerItems?.length || 0);
      }
      setBurgers(burgerItems);
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Error loading burgers:', error);
      }
      setBurgers([]);
    }
  };

  const loadPizza = async () => {
    try {
      // Load pizza from all restaurants
      const items = await getMenuItems({
        is_available: true,
        limit: 20,
      });
      // Filter by category name containing "pizza"
      const pizzaItems = (items || []).filter(item => {
        const category = item.category?.toLowerCase() || '';
        const categories = item.categories?.map((c: any) => c.name?.toLowerCase() || '') || [];
        const name = item.name?.toLowerCase() || '';
        return category.includes('pizza') || 
               categories.some((c: string) => c.includes('pizza')) ||
               name.includes('pizza');
      });
      if (__DEV__) {
        console.log('🍕 Loaded pizza:', pizzaItems?.length || 0);
      }
      setPizza(pizzaItems);
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Error loading pizza:', error);
      }
      setPizza([]);
    }
  };

  const loadWraps = async () => {
    try {
      // Load wraps from all restaurants
      const items = await getMenuItems({
        is_available: true,
        limit: 20,
      });
      // Filter by category name containing "wrap" or "wraps"
      const wrapItems = (items || []).filter(item => {
        const category = item.category?.toLowerCase() || '';
        const categories = item.categories?.map((c: any) => c.name?.toLowerCase() || '') || [];
        const name = item.name?.toLowerCase() || '';
        return category.includes('wrap') || 
               categories.some((c: string) => c.includes('wrap')) ||
               name.includes('wrap');
      });
      if (__DEV__) {
        console.log('🌯 Loaded wraps:', wrapItems?.length || 0);
      }
      setWraps(wrapItems);
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Error loading wraps:', error);
      }
      setWraps([]);
    }
  };

  const loadFeaturedProducts = async () => {
    try {
      // Load featured products from all restaurants if no restaurant is selected
      // or filter by restaurant if one is selected
      const products = await getFeaturedProducts({
        restaurant_id: selectedRestaurant?.id, // undefined means show all
        limit: 10,
      });
      if (__DEV__) {
        console.log('⭐ Loaded featured products:', products?.length || 0);
      }
      setFeaturedProducts(products || []);
    } catch (error) {
      if (__DEV__) {
        console.error('Error loading featured products:', error);
      }
      setFeaturedProducts([]);
    }
  };

  const loadSpecialOffers = async () => {
    try {
      // Load offers from all restaurants if no restaurant is selected
      // or filter by restaurant if one is selected
      const offers = await getSpecialOffers({
        restaurant_id: selectedRestaurant?.id,
        is_featured: undefined, // Show all active offers (featured first due to ordering)
        limit: 10,
      });
      if (__DEV__) {
        console.log('🎁 Loaded special offers:', offers?.length || 0);
      }
      setSpecialOffers(offers || []);
    } catch (error) {
      if (__DEV__) {
        console.error('Error loading special offers:', error);
      }
      setSpecialOffers([]);
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
    // Search in all category arrays
    const allProducts = [...burgers, ...pizza, ...wraps, ...featuredProducts, ...allItems];
    const product = allProducts.find(item => item.$id === productId || item.id === productId);
    if (product) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
        {/* SPECIAL OFFERS SECTION */}
        {specialOffers.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Special Offers</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            <SpecialOffersSection offers={specialOffers} />
          </>
        )}


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
          <Text style={styles.sectionTitle}>Featured Items</Text>
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
            <Text style={styles.emptySectionSubtext}>Mark products as featured in the admin dashboard</Text>
          </View>
        )}

        {/* BURGERS SECTION */}
        <View style={styles.sectionHeaderWithPadding}>
          <Text style={styles.sectionTitle}>🍔 Burgers</Text>
          {burgers.length > 0 && (
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          )}
        </View>
        {burgers.length > 0 ? (
          <ProductGrid
            products={burgers}
            onProductPress={handleProductPress}
            onFavoriteToggle={handleFavoriteToggle}
            onAddToCart={(id) => handleAddToCart(id, burgers)}
          />
        ) : (
          <View style={styles.emptySectionContainer}>
            <Text style={styles.emptySectionText}>No burgers available</Text>
          </View>
        )}

        {/* PIZZA SECTION */}
        <View style={styles.sectionHeaderWithPadding}>
          <Text style={styles.sectionTitle}>🍕 Pizza</Text>
          {pizza.length > 0 && (
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          )}
        </View>
        {pizza.length > 0 ? (
          <ProductGrid
            products={pizza}
            onProductPress={handleProductPress}
            onFavoriteToggle={handleFavoriteToggle}
            onAddToCart={(id) => handleAddToCart(id, pizza)}
          />
        ) : (
          <View style={styles.emptySectionContainer}>
            <Text style={styles.emptySectionText}>No pizza available</Text>
          </View>
        )}

        {/* WRAPS SECTION */}
        <View style={styles.sectionHeaderWithPadding}>
          <Text style={styles.sectionTitle}>🌯 Wraps</Text>
          {wraps.length > 0 && (
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          )}
        </View>
        {wraps.length > 0 ? (
          <ProductGrid
            products={wraps}
            onProductPress={handleProductPress}
            onFavoriteToggle={handleFavoriteToggle}
            onAddToCart={(id) => handleAddToCart(id, wraps)}
          />
        ) : (
          <View style={styles.emptySectionContainer}>
            <Text style={styles.emptySectionText}>No wraps available</Text>
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
