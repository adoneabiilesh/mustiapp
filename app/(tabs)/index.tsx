import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/lib/designSystem';
import { Icons } from '@/lib/icons';
import { getImageSource } from '@/lib/imageUtils';
import { checkAndPopulateData } from '@/lib/sampleData';
import { getMenu, getCategories, getPromotions } from '@/lib/supabase';
import { useCartStore } from '@/store/cart.store';
import { MenuCategory } from '@/components/MenuComponents';
import ProductGrid from '@/components/ProductGrid';
import { useFavoritesStore } from '@/store/favorites.store';
import { PromotionBanner } from '@/components/PromotionComponents';
import { FullScreenLoader } from '@/components/LoadingComponents';
import { RESTAURANT_CONFIG } from '@/lib/restaurantConfig';
import { UnifiedButton } from '@/components/UnifiedButton';

const { width } = Dimensions.get('window');

const MenuScreen = () => {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPromotions, setShowPromotions] = useState(true);
  
  // Favorites store
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  
  // Debug favorites store
  useEffect(() => {
    console.log('🔍 Favorites store initialized');
    try {
      const testResult = isFavorite('test-id');
      console.log('✅ isFavorite function works:', testResult);
    } catch (error) {
      console.error('❌ isFavorite function error:', error);
    }
  }, []);

  // Load promotions from database
  const loadPromotions = async () => {
    try {
      console.log('🔄 Loading promotions...');
      const promoData = await getPromotions();
      console.log('✅ Promotions loaded:', promoData);
      console.log('📊 Promotions count:', promoData?.length || 0);
      setPromotions(promoData);
    } catch (error) {
      console.log('❌ Error loading promotions:', error);
      // Fallback to empty array if promotions fail to load
      setPromotions([]);
    }
  };

  const loadMenuItems = useCallback(async () => {
    try {
      setLoading(true);
      // Get all menu items first, then filter on client side
      const items = await getMenu({ 
        category: '', // Get all items
        limit: 100
      });
      console.log('✅ Menu items loaded:', items?.length || 0);
      console.log('📊 Sample menu item categories:', items?.[0]?.categories);
      console.log('📊 Sample menu item dietary:', {
        vegetarian: items?.[0]?.is_vegetarian,
        vegan: items?.[0]?.is_vegan,
        gluten_free: items?.[0]?.is_gluten_free,
        spicy: items?.[0]?.is_spicy
      });
      setMenuItems(items || []);
    } catch (error) {
      console.log('Error loading menu:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCategories = async () => {
    try {
      const cats = await getCategories();
      console.log('📂 Categories loaded:', cats);
      setCategories([{ $id: 'all', name: 'All' }, ...cats]);
    } catch (error) {
      console.log('Error loading categories:', error);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      await checkAndPopulateData();
      await loadCategories();
      await loadMenuItems();
      await loadPromotions();
    };
    
    initializeData();
  }, []);


  const handlePromotionPress = (promotionId: string) => {
    console.log('Promotion pressed:', promotionId);
  };

  // Product handlers
  const handleProductPress = (productId: string) => {
    router.push(`/item-detail?id=${productId}`);
  };

  const handleFavoriteToggle = (productId: string, newState: boolean) => {
    try {
      toggleFavorite(productId);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Don't crash the app, just log the error
    }
  };

  const handleAddToCart = (productId: string) => {
    const { addItem } = useCartStore.getState();
    const product = menuItems.find(item => item.$id === productId);
    if (product) {
      addItem({
        id: product.$id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        customizations: []
      });
    }
  };


  if (loading) {
    return <FullScreenLoader text="Loading our delicious menu..." />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.neutral[50] }}>
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {/* Brand Header */}
        <View style={{ 
          backgroundColor: Colors.primary[500], 
          paddingHorizontal: Spacing.lg, 
          paddingVertical: Spacing.xl,
          borderBottomLeftRadius: BorderRadius['2xl'],
          borderBottomRightRadius: BorderRadius['2xl'],
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.lg }}>
            <View style={{ flex: 1 }}>
              <Text style={[Typography.h1, { color: '#FFFFFF', marginBottom: Spacing.xs }]}>
                {RESTAURANT_CONFIG.name}
              </Text>
              <Text style={[Typography.body1, { color: 'rgba(255, 255, 255, 0.9)' }]}>
                {RESTAURANT_CONFIG.tagline}
              </Text>
            </View>
            
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)/profile')}
              style={{
                width: 48,
                height: 48,
                borderRadius: BorderRadius.full,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icons.Profile size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Restaurant Info */}
          <View style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.1)', 
            borderRadius: BorderRadius.lg, 
            padding: Spacing.md,
            marginBottom: Spacing.lg,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icons.Clock size={16} color="#FFFFFF" />
                <Text style={[Typography.body2, { color: '#FFFFFF', marginLeft: Spacing.xs }]}>
                  {RESTAURANT_CONFIG.hours.monday}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icons.Truck size={16} color="#FFFFFF" />
                <Text style={[Typography.body2, { color: '#FFFFFF', marginLeft: Spacing.xs }]}>
                  {RESTAURANT_CONFIG.delivery.time}
                </Text>
              </View>
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={[Typography.caption, { color: 'rgba(255, 255, 255, 0.8)' }]}>
                {RESTAURANT_CONFIG.address}
              </Text>
              <Text style={[Typography.caption, { color: 'rgba(255, 255, 255, 0.8)' }]}>
                {RESTAURANT_CONFIG.phone}
              </Text>
            </View>
          </View>

          {/* Search Bar */}
          <TouchableOpacity 
            onPress={() => router.push('/(tabs)/search')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: BorderRadius.lg,
              paddingHorizontal: Spacing.md,
              paddingVertical: Spacing.sm,
            }}
          >
            <Icons.Search size={20} color="rgba(255, 255, 255, 0.8)" />
            <Text style={[Typography.body1, { color: 'rgba(255, 255, 255, 0.8)', marginLeft: Spacing.sm }]}>
              Search our menu...
            </Text>
          </TouchableOpacity>
        </View>

        {/* Promotions Section */}
        {showPromotions && (
          <View style={{ marginBottom: Spacing.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, marginBottom: Spacing.md }}>
              <Text style={[Typography.h4, { color: Colors.neutral[900] }]}>
                Special Offers
              </Text>
              <TouchableOpacity onPress={() => setShowPromotions(false)}>
                <Text style={[Typography.label, { color: Colors.primary[500] }]}>
                  Hide
                </Text>
              </TouchableOpacity>
            </View>
            
            {promotions.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: Spacing.md }}>
                {promotions.map((promotion) => (
                  <View key={promotion.id} style={{ width: width * 0.8, marginRight: Spacing.md }}>
                    <PromotionBanner
                      promotion={{
                        id: promotion.id,
                        title: promotion.title,
                        description: promotion.description,
                        discount: promotion.discount,
                        discountType: promotion.discount_type,
                        image: promotion.image_url || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1',
                        validUntil: new Date(promotion.valid_until).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        }),
                        terms: promotion.terms,
                      }}
                      onPress={() => handlePromotionPress(promotion.id)}
                    />
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View style={{ paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md }}>
                <Text style={[Typography.body2, { color: Colors.neutral[600], textAlign: 'center' }]}>
                  No active promotions at the moment. Check back soon!
                </Text>
              </View>
            )}
          </View>
        )}


        {/* Menu Categories Filter */}
        <View style={{ backgroundColor: '#FFFFFF', paddingVertical: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.neutral[200] }}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: Spacing.lg }}
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.$id}
                onPress={() => setSelectedFilter(cat.name)}
                style={{
                  backgroundColor: selectedFilter === cat.name ? Colors.primary[500] : Colors.neutral[100],
                  borderRadius: BorderRadius.full,
                  paddingHorizontal: Spacing.lg,
                  paddingVertical: Spacing.sm,
                  marginRight: Spacing.sm,
                }}
              >
                <Text style={[Typography.label, { color: selectedFilter === cat.name ? '#FFFFFF' : Colors.neutral[700] }]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Menu Items - New Grid Layout */}
        <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
          <View style={{ paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md }}>
              <View>
                <Text style={[Typography.h4, { color: Colors.neutral[900] }]}>
                  {selectedFilter === 'All' ? 'Our Menu' : selectedFilter}
                </Text>
                <Text style={[Typography.caption, { color: Colors.neutral[600] }]}>
                  {(() => {
                    try {
                      return menuItems.filter(item => {
                        if (selectedFilter === 'All') return true;
                        if (item.categories?.includes(selectedFilter)) return true;
                        if (selectedFilter === 'Vegetarian' && item.is_vegetarian) return true;
                        if (selectedFilter === 'Vegan' && item.is_vegan) return true;
                        if (selectedFilter === 'Gluten-Free' && item.is_gluten_free) return true;
                        if (selectedFilter === 'Spicy' && item.is_spicy) return true;
                        return false;
                      }).length;
                    } catch (error) {
                      console.warn('Error filtering items for count:', error);
                      return 0;
                    }
                  })()} items
                </Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/(tabs)/search')}>
                <Text style={[Typography.label, { color: Colors.primary[500] }]}>
                  View All
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <ProductGrid
            products={menuItems
              .filter(item => {
                if (selectedFilter === 'All') return true;
                // Check both categories array and boolean properties
                if (item.categories?.includes(selectedFilter)) return true;
                if (selectedFilter === 'Vegetarian' && item.is_vegetarian) return true;
                if (selectedFilter === 'Vegan' && item.is_vegan) return true;
                if (selectedFilter === 'Gluten-Free' && item.is_gluten_free) return true;
                if (selectedFilter === 'Spicy' && item.is_spicy) return true;
                return false;
              })
              .slice(0, 20) // Limit to 20 items for performance
              .map(item => {
                let favoriteStatus = false;
                try {
                  favoriteStatus = isFavorite(item.$id);
                } catch (error) {
                  console.warn('Error checking favorite status for item:', item.$id, error);
                }
                
                return {
                  id: item.$id,
                  name: item.name,
                  description: item.description,
                  price: item.price,
                  imageUrl: item.image_url,
                  isFavorite: favoriteStatus,
                  hasCustomizations: false, // You can determine this based on your data
                };
              })
            }
            onProductPress={handleProductPress}
            onFavoriteToggle={handleFavoriteToggle}
            onAddToCart={handleAddToCart}
            loading={loading}
          />
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default MenuScreen;