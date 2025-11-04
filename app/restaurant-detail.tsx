import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  Animated,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/lib/designSystem';
import { Icons } from '@/lib/icons';
import { getMenuItems, getCategories } from '@/lib/database';
import { supabase } from '@/lib/supabase';
import { useCartStore } from '@/store/cart.store';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

const RestaurantDetail = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const { addItem } = useCartStore();

  useEffect(() => {
    if (id) {
      loadRestaurantData();
    }
  }, [id]);

  const loadRestaurantData = async () => {
    try {
      setLoading(true);
      
      // Fetch restaurant details
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', id)
        .single();

      if (restaurantError) throw restaurantError;
      setRestaurant(restaurantData);

      // Fetch menu items for this restaurant
      const items = await getMenuItems({
        restaurant_id: id,
        is_available: true,
        limit: 100,
      });
      setMenuItems(items || []);

      // Fetch categories
      const cats = await getCategories();
      setCategories([{ id: 'all', name: 'All', icon: 'Grid' }, ...cats]);
      
    } catch (error) {
      console.error('Error loading restaurant data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item: any) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image_url,
      quantity: 1,
      restaurant_id: id,
    });
  };

  const handleMenuItemPress = (itemId: string) => {
    router.push(`/item-detail?id=${itemId}`);
  };

  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
      item.category?.toLowerCase() === selectedCategory.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });

  // Group items by category
  const itemsByCategory = filteredMenuItems.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
        <Text style={styles.loadingText}>Loading restaurant...</Text>
      </SafeAreaView>
    );
  }

  if (!restaurant) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Icons.AlertCircle size={48} color={Colors.error[500]} />
        <Text style={styles.errorText}>Restaurant not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Sticky Header */}
      <Animated.View style={[styles.stickyHeader, { opacity: headerOpacity }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
            <Icons.ArrowLeft size={20} color={Colors.text.primary} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle} numberOfLines={1}>
            {restaurant.name}
          </Text>
          
          <View style={styles.headerButton} />
        </View>
      </Animated.View>

      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Restaurant Hero */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: restaurant.cover_image_url || restaurant.logo_url }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          
          {/* Back Button */}
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={styles.backButtonOverlay}
          >
            <Icons.ArrowLeft size={20} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Gradient Overlay */}
          <View style={styles.heroGradient} />
          
          {/* Restaurant Logo */}
          <View style={styles.logoWrapper}>
            <Image
              source={{ uri: restaurant.logo_url }}
              style={styles.logo}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Restaurant Info */}
        <View style={styles.infoSection}>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>
          <Text style={styles.cuisineType}>{restaurant.cuisine_type}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Icons.Star size={16} color="#FFB800" />
              <Text style={styles.statText}>{restaurant.rating?.toFixed(1) || '4.5'}</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Icons.Clock size={16} color={Colors.text.secondary} />
              <Text style={styles.statText}>{restaurant.preparation_time || '25-35'} min</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Icons.Truck size={16} color={Colors.text.secondary} />
              <Text style={styles.statText}>${restaurant.delivery_fee?.toFixed(2) || '2.99'}</Text>
            </View>
          </View>

          {restaurant.description && (
            <Text style={styles.description}>{restaurant.description}</Text>
          )}
        </View>

        {/* Category Pills */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => setSelectedCategory(category.id)}
              style={[
                styles.categoryPill,
                selectedCategory === category.id && styles.categoryPillActive,
              ]}
            >
              <Text style={[
                styles.categoryPillText,
                selectedCategory === category.id && styles.categoryPillTextActive,
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Menu Items by Category */}
        <View style={styles.menuSection}>
          {Object.entries(itemsByCategory).map(([categoryName, items]) => (
            <View key={categoryName} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>{categoryName}</Text>
              
              {(items as any[]).map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => handleMenuItemPress(item.id)}
                  style={styles.menuItem}
                  activeOpacity={0.7}
                >
                  <Image
                    source={{ uri: item.image_url }}
                    style={styles.menuItemImage}
                    resizeMode="cover"
                  />
                  
                  <View style={styles.menuItemInfo}>
                    <Text style={styles.menuItemName} numberOfLines={2}>
                      {item.name}
                    </Text>
                    {item.description && (
                      <Text style={styles.menuItemDescription} numberOfLines={2}>
                        {item.description}
                      </Text>
                    )}
                    <Text style={styles.menuItemPrice}>${item.price.toFixed(2)}</Text>
                  </View>

                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      handleAddToCart(item);
                    }}
                    style={styles.addButton}
                  >
                    <Icons.Plus size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          ))}

          {filteredMenuItems.length === 0 && (
            <View style={styles.emptyState}>
              <Icons.Search size={48} color={Colors.neutral[300]} />
              <Text style={styles.emptyStateText}>No menu items found</Text>
            </View>
          )}
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
  },
  loadingText: {
    marginTop: Spacing.lg,
    fontSize: 16,
    color: Colors.text.secondary,
  },
  errorText: {
    marginTop: Spacing.lg,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  backButton: {
    marginTop: Spacing.xl,
    backgroundColor: Colors.primary[500],
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: BorderRadius.md,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: Colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
    ...Shadows.sm,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
    marginHorizontal: Spacing.md,
  },
  heroContainer: {
    position: 'relative',
    height: 280,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  backButtonOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  logoWrapper: {
    position: 'absolute',
    bottom: -40,
    left: Spacing.xl,
    width: 80,
    height: 80,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.background.card,
    ...Shadows.lg,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: Colors.background.card,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  infoSection: {
    backgroundColor: Colors.background.card,
    paddingHorizontal: Spacing.xl,
    paddingTop: 52,
    paddingBottom: Spacing.xl,
  },
  restaurantName: {
    fontSize: 28,
    fontFamily: 'Georgia',
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  cuisineType: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.neutral[200],
    marginBottom: Spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    justifyContent: 'center',
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: Colors.neutral[300],
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.text.secondary,
  },
  categoriesContainer: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  categoryPill: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius['2xl'],
    backgroundColor: Colors.background.card,
    marginRight: Spacing.sm,
    borderWidth: 2,
    borderColor: Colors.neutral[200],
  },
  categoryPillActive: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  categoryPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
  },
  menuSection: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  categorySection: {
    marginBottom: Spacing.xl,
  },
  categoryTitle: {
    fontSize: 22,
    fontFamily: 'Georgia',
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  menuItemImage: {
    width: 100,
    height: 100,
  },
  menuItemInfo: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'center',
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  menuItemDescription: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
    lineHeight: 18,
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary[500],
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginRight: Spacing.md,
    ...Shadows.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyStateText: {
    marginTop: Spacing.md,
    fontSize: 16,
    color: Colors.text.secondary,
  },
});

export default RestaurantDetail;
