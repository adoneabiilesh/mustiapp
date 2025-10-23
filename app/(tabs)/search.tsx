import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/lib/designSystem';
import { Icons } from '@/lib/icons';
import { getMenu, getCategories } from '@/lib/supabase';
import { checkAndPopulateData } from '@/lib/sampleData';
import { MenuFilter } from '@/components/MenuComponents';
import ProductGrid from '@/components/ProductGrid';
import { useFavoritesStore } from '@/store/favorites.store';
import { FullScreenLoader } from '@/components/LoadingComponents';
import { RESTAURANT_CONFIG } from '@/lib/restaurantConfig';
import { useCartStore } from '@/store/cart.store';
import { UnifiedButton } from '@/components/UnifiedButton';

const SearchScreen = () => {
  const { category, query } = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState((query as string) || '');
  const [selectedCategory, setSelectedCategory] = useState((category as string) || 'All');
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const isMountedRef = useRef(true);
  
  // Favorites store
  const { isFavorite, toggleFavorite } = useFavoritesStore();

  const loadMenuItems = useCallback(async () => {
    try {
      if (!isMountedRef.current) return;
      setLoading(true);
      
      console.log('Loading menu items for category:', selectedCategory, 'query:', searchQuery);
      
      // Get all menu items first
      const allItems = await getMenu({ 
        category: '', // Get all items first
        query: searchQuery,
        limit: 100
      });
      
      console.log('All items loaded:', allItems?.length || 0);
      
      // Filter by category on the client side if needed
      let filteredItems = allItems || [];
      
      if (selectedCategory && selectedCategory !== 'All') {
        // Filter by category name or type
        filteredItems = allItems.filter(item => {
          // Check if item has the selected category in its categories array
          if (item.categories && Array.isArray(item.categories)) {
            return item.categories.includes(selectedCategory);
          }
          
          // Check item properties for dietary restrictions
          switch (selectedCategory) {
            case 'Vegetarian':
              return item.is_vegetarian === true;
            case 'Vegan':
              return item.is_vegan === true;
            case 'Gluten-Free':
              return item.is_gluten_free === true;
            case 'Spicy':
              return item.is_spicy === true;
            default:
              return item.categories && item.categories.includes(selectedCategory);
          }
        });
      }
      
      console.log('Filtered items:', filteredItems?.length || 0);
      console.log('Sample item categories:', filteredItems[0]?.categories);
      console.log('Sample item properties:', {
        is_vegetarian: filteredItems[0]?.is_vegetarian,
        is_vegan: filteredItems[0]?.is_vegan,
        is_gluten_free: filteredItems[0]?.is_gluten_free,
        is_spicy: filteredItems[0]?.is_spicy,
      });
      
      if (isMountedRef.current) {
        setMenuItems(filteredItems);
      }
    } catch (error) {
      console.error('Error loading menu items:', error);
      if (isMountedRef.current) {
        setMenuItems([]);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [selectedCategory, searchQuery]);

  const loadCategories = useCallback(async () => {
    try {
      if (!isMountedRef.current) return;
      console.log('Loading categories...');
      const cats = await getCategories();
      console.log('Loaded categories:', cats?.length || 0);
      
      if (isMountedRef.current) {
        setCategories(cats || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      if (isMountedRef.current) {
        setCategories([]);
      }
    }
  }, []);

  const initializeData = useCallback(async () => {
    try {
      if (!isMountedRef.current) return;
      console.log('Initializing data...');
      await checkAndPopulateData();
      await loadCategories();
      await loadMenuItems();
    } catch (error) {
      console.error('Error initializing data:', error);
    }
  }, [loadCategories, loadMenuItems]);

  useEffect(() => {
    initializeData();
    
    return () => {
      isMountedRef.current = false;
    };
  }, [initializeData]);

  useEffect(() => {
    loadMenuItems();
  }, [loadMenuItems]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const handleCategoryPress = (categoryName: string) => {
    setSelectedCategory(categoryName);
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


  const filters = [
    { id: 'All', label: 'All', active: selectedCategory === 'All' },
    { id: 'Vegetarian', label: 'Vegetarian', active: selectedCategory === 'Vegetarian' },
    { id: 'Vegan', label: 'Vegan', active: selectedCategory === 'Vegan' },
    { id: 'Gluten-Free', label: 'Gluten Free', active: selectedCategory === 'Gluten-Free' },
    { id: 'Spicy', label: 'Spicy', active: selectedCategory === 'Spicy' },
  ];

  if (loading) {
    return <FullScreenLoader text="Searching our menu..." />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.neutral[50] }}>
      {/* Header */}
      <View style={{ 
        backgroundColor: Colors.primary[500], 
        paddingHorizontal: Spacing.lg, 
        paddingVertical: Spacing.md,
        borderBottomLeftRadius: BorderRadius.lg,
        borderBottomRightRadius: BorderRadius.lg,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md }}>
          <Text style={[Typography.h3, { color: '#FFFFFF' }]}>
            Search Menu
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Icons.ArrowBack size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.2)', 
          borderRadius: BorderRadius.lg, 
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.sm,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icons.Search size={20} color="rgba(255, 255, 255, 0.8)" />
            <TextInput 
              style={[
                Typography.body1,
                { 
                  flex: 1, 
                  marginLeft: Spacing.sm, 
                  color: '#FFFFFF',
                }
              ]}
              placeholder="Search our delicious menu..."
              placeholderTextColor="rgba(255, 255, 255, 0.7)"
              value={searchQuery}
              onChangeText={handleSearch}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch('')}>
                <Icons.Close size={20} color="rgba(255, 255, 255, 0.8)" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Categories Filter */}
      <View style={{ backgroundColor: '#FFFFFF', paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.neutral[200] }}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: Spacing.lg }}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.$id}
              onPress={() => handleCategoryPress(cat.name)}
              style={{
                backgroundColor: selectedCategory === cat.name ? Colors.primary[500] : Colors.neutral[100],
                borderRadius: BorderRadius.full,
                paddingHorizontal: Spacing.lg,
                paddingVertical: Spacing.sm,
                marginRight: Spacing.sm,
              }}
            >
              <Text style={[Typography.label, { color: selectedCategory === cat.name ? '#FFFFFF' : Colors.neutral[700] }]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Menu Filters */}
      <View style={{ paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md }}>
        <MenuFilter filters={filters} onFilterPress={(filterId) => handleCategoryPress(filterId)} />
      </View>

      {/* Search Results */}
      <View style={{ flex: 1 }}>
        {searchQuery.length > 0 && (
          <View style={{ paddingHorizontal: Spacing.lg, marginBottom: Spacing.md }}>
            <Text style={[Typography.h5, { color: Colors.neutral[900] }]}>
              Search Results for "{searchQuery}"
            </Text>
            <Text style={[Typography.body2, { color: Colors.neutral[600] }]}>
              {menuItems.length} items found
            </Text>
          </View>
        )}

        {menuItems.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: Spacing['3xl'] }}>
            <Icons.Search size={48} color={Colors.neutral[400]} />
            <Text style={[Typography.h5, { color: Colors.neutral[600], marginTop: Spacing.md, marginBottom: Spacing.sm }]}>
              {searchQuery.length > 0 ? 'No items found' : 'No menu items available'}
            </Text>
            <Text style={[Typography.body2, { color: Colors.neutral[500], textAlign: 'center' }]}>
              {searchQuery.length > 0 
                ? 'Try searching with different keywords' 
                : 'Menu items will appear here'
              }
            </Text>
            {searchQuery.length > 0 && (
              <UnifiedButton
                title="Clear Search"
                onPress={() => handleSearch('')}
                variant="primary"
                size="medium"
                fullWidth
              />
            )}
          </View>
        ) : (
          <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
            <ProductGrid
              products={menuItems.map(item => ({
                id: item.$id,
                name: item.name,
                description: item.description,
                price: item.price,
                imageUrl: item.image_url,
                isFavorite: isFavorite(item.$id),
                hasCustomizations: false, // You can determine this based on your data
              }))}
              onProductPress={handleProductPress}
              onFavoriteToggle={handleFavoriteToggle}
              onAddToCart={handleAddToCart}
              loading={loading}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default SearchScreen;