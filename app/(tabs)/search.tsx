import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Platform,
  Image,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing, BorderRadius, Shadows } from '@/lib/designSystem';
import { Icons } from '@/lib/icons';
import { getMenuItems, getCategories, supabase } from '@/lib/database';
import { useCartStore } from '@/store/cart.store';
import * as Haptics from 'expo-haptics';
import { useToast } from '@/hooks/useToast';

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const { toast, showSuccess, hideToast } = useToast();

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      console.log('📥 Fetching categories...');
      const data = await getCategories();
      console.log('✅ Categories loaded:', data.length, 'categories');
      data.forEach((c, i) => {
        console.log(`  ${i}: ${c.name} (sort_order: ${c.sort_order})`);
      });
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryPress = async (category: any) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setSelectedCategory(category);
    setLoadingProducts(true);

    try {
      // Fetch products for this category with restaurant info
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          *,
          restaurants (
            id,
            name,
            address,
            logo_url
          )
        `)
        .contains('categories', [category.name])
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const normalizedData = (data || []).map((item: any) => ({
        ...item,
        $id: item.id,
        restaurant_name: item.restaurants?.name,
        restaurant_logo: item.restaurants?.logo_url,
      }));

      setProducts(normalizedData);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleBackToCategories = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedCategory(null);
    setProducts([]);
    setSearchQuery('');
  };

  const handleProductPress = (productId: string) => {
    router.push(`/item-detail?id=${productId}`);
  };

  const handleAddToCart = (product: any) => {
    const { addItem } = useCartStore.getState();
    
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

    // Show success notification
    showSuccess(`${product.name} added to cart! 🛒`, 2500);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.trim().length < 2) {
      // Reload all products for the category
      if (selectedCategory) {
        await handleCategoryPress(selectedCategory);
      }
      return;
    }

    // Filter products by search query
    const searchLower = query.toLowerCase().trim();
    
    try {
      // Search within the selected category
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          *,
          restaurants (
            id,
            name,
            address,
            logo_url
          )
        `)
        .contains('categories', [selectedCategory.name])
        .eq('is_available', true)
        .or(`name.ilike.%${searchLower}%,description.ilike.%${searchLower}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const normalizedData = (data || []).map((item: any) => ({
        ...item,
        $id: item.id,
        restaurant_name: item.restaurants?.name,
        restaurant_logo: item.restaurants?.logo_url,
      }));

      setProducts(normalizedData);
    } catch (error) {
      console.error('Error searching products:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {selectedCategory && (
          <TouchableOpacity 
            onPress={handleBackToCategories}
            style={styles.backButton}
          >
            <Icons.ChevronLeft size={24} color={Colors.text.primary} />
          </TouchableOpacity>
        )}
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>
            {selectedCategory ? selectedCategory.name : 'Menu'}
          </Text>
          {selectedCategory && (
            <Text style={styles.headerSubtitle}>
              {products.length} item{products.length !== 1 ? 's' : ''} available
            </Text>
          )}
        </View>
        {!selectedCategory && (
          <TouchableOpacity 
            onPress={loadCategories}
            style={styles.refreshButton}
          >
            <Icons.RefreshCw size={20} color={Colors.text.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Search Input - Only show when category is selected */}
      {selectedCategory && (
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icons.Search size={20} color={Colors.neutral[500]} />
          <TextInput
            style={styles.searchInput}
              placeholder="Search in this category..."
            placeholderTextColor={Colors.neutral[400]}
            value={searchQuery}
            onChangeText={handleSearch}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                  handleCategoryPress(selectedCategory);
              }}
              style={styles.clearButton}
            >
              <Icons.X size={18} color={Colors.neutral[500]} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      )}

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {!selectedCategory ? (
          // Categories Grid
          <>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary[500]} />
                <Text style={styles.loadingText}>Loading categories...</Text>
              </View>
            ) : (
              <View style={styles.categoriesGrid}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={styles.categoryCard}
                    onPress={() => handleCategoryPress(category)}
                    activeOpacity={0.7}
                  >
                    <Image
                      source={{ uri: category.image_url || 'https://via.placeholder.com/200' }}
                      style={styles.categoryImage}
                    />
                    <View style={styles.categoryOverlay}>
                      <Text style={styles.categoryName}>{category.name}</Text>
                      {category.description && (
                        <Text style={styles.categoryDescription} numberOfLines={2}>
                          {category.description}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
                      </View>
            )}
          </>
        ) : (
          // Products List
          <>
            {loadingProducts ? (
          <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary[500]} />
                <Text style={styles.loadingText}>Loading products...</Text>
                      </View>
            ) : products.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
                  <Icons.ShoppingBag size={48} color={Colors.neutral[300]} />
                </View>
                <Text style={styles.emptyTitle}>No items available</Text>
                <Text style={styles.emptySubtitle}>
                  Check back later for new items
                </Text>
              </View>
            ) : (
              <View style={styles.productsContainer}>
                {products.map((product) => (
                  <TouchableOpacity
                    key={product.id}
                    style={styles.productCard}
                    onPress={() => handleProductPress(product.id)}
                    activeOpacity={0.9}
                  >
                    <Image
                      source={{ uri: product.image_url || 'https://via.placeholder.com/100' }}
                      style={styles.productImage}
                    />
                    <View style={styles.productInfo}>
                      <Text style={styles.productName} numberOfLines={1}>
                        {product.name}
                      </Text>
                      <Text style={styles.productDescription} numberOfLines={2}>
                        {product.description}
                      </Text>
                      {product.restaurant_name && (
                        <View style={styles.restaurantBadge}>
                          <Icons.MapPin size={12} color={Colors.neutral[600]} />
                          <Text style={styles.restaurantName} numberOfLines={1}>
                            {product.restaurant_name}
                          </Text>
                        </View>
                      )}
                      <Text style={styles.productPrice}>
                        ৳ {product.price.toFixed(0)}
                      </Text>
                    </View>
            <TouchableOpacity
                      style={styles.addButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.addButtonText}>ADD +</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
          </View>
            )}
          </>
        )}

        {/* Bottom Spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Toast Notification */}
      {toast && (
        <ToastNotification
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onHide={hideToast}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.background.primary,
  },
  backButton: {
    marginRight: Spacing.sm,
    padding: 4,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Georgia',
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  refreshButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    ...Shadows.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
    marginLeft: Spacing.sm,
  },
  clearButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  categoriesGrid: {
    padding: Spacing.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  categoryCard: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.background.card,
    ...Shadows.md,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: Spacing.md,
  },
  categoryName: {
    fontSize: 18,
    fontFamily: 'Georgia',
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  productsContainer: {
    padding: Spacing.md,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    ...Shadows.sm,
    alignItems: 'center',
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.neutral[100],
  },
  productInfo: {
    flex: 1,
    marginLeft: Spacing.md,
    marginRight: Spacing.sm,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  restaurantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  restaurantName: {
    fontSize: 12,
    color: Colors.neutral[600],
    flex: 1,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  addButton: {
    backgroundColor: Colors.primary[500],
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: BorderRadius['2xl'],
    minWidth: 80,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  loadingContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: Spacing.md,
  },
  emptyContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    marginTop: Spacing.xxl,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Georgia',
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 80 : 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
    pointerEvents: 'box-none',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.lg,
    minWidth: 200,
    maxWidth: '90%',
    gap: Spacing.sm,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
});

// Toast Notification Component
const ToastNotification: React.FC<{
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onHide: () => void;
}> = ({ visible, message, type = 'success', onHide }) => {
  const slideAnim = React.useRef(new Animated.Value(-100)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return Colors.success[500];
      case 'error':
        return Colors.error[500];
      case 'warning':
        return Colors.warning[500];
      default:
        return Colors.primary[500];
    }
  };

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={[styles.toast, { backgroundColor: getBackgroundColor() }]}>
        <Icons.Check size={20} color="#FFFFFF" />
        <Text style={styles.toastText}>{message}</Text>
      </View>
    </Animated.View>
  );
};

export default SearchScreen;
