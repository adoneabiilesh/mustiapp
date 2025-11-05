import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  StyleSheet,
  TextInput,
  Platform,
  Animated,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useCartStore } from '../store/cart.store';
import { getMenuItemById, getAddonsForMenuItem } from '../lib/database';
import { getImageSource } from '../lib/imageUtils';
import { Icons } from '../lib/icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/lib/designSystem';
import ProductRecommendations from '../components/ProductRecommendations';
// import ReviewsSection from '../components/ReviewsSection'; // Temporarily disabled due to theme provider issue
import { getSmartRecommendations, ProductRecommendation } from '../lib/recommendations';
import * as Haptics from 'expo-haptics';
import { useToast } from '@/hooks/useToast';

const { width, height } = Dimensions.get('window');

const ItemDetail = () => {
  const { id } = useLocalSearchParams();
  const { addItem } = useCartStore();
  
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [availableAddons, setAvailableAddons] = useState<any[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [spiceLevel, setSpiceLevel] = useState<string | null>(null);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const { toast, showSuccess, hideToast } = useToast();

  // Dynamic sizes and spice levels from database
  const sizes = availableAddons.filter(addon => addon.type === 'size');
  const spiceLevels = availableAddons.filter(addon => addon.type === 'spice');
  const extraAddons = availableAddons.filter(addon => addon.type === 'addon' || addon.type === 'extra');

  useEffect(() => {
    loadItem();
  }, [id]);

  const loadItem = async () => {
    try {
      setLoading(true);
      const foundItem = await getMenuItemById(id as string);
      if (!foundItem) {
        if (__DEV__) {
          console.log('Item not found');
        }
        return;
      }
      
      setItem(foundItem);
      await loadAddons(foundItem);
      await loadRecommendations(foundItem);
    } catch (error) {
      if (__DEV__) {
        console.error('Error loading item:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadAddons = async (product: any) => {
    try {
      // Only load addons that are assigned to this specific product
      const addons = await getAddonsForMenuItem(product);
      setAvailableAddons(addons || []);
      
      // Reset selections when addons change
      setSelectedAddons([]);
      setSelectedSize(null);
      setSpiceLevel(null);
      
      // Only auto-select if addons exist and are required
      const sizeAddons = (addons || []).filter((a: any) => a.type === 'size');
      if (sizeAddons.length > 0) {
        // Find required size first, or medium, or first available
        const requiredSize = sizeAddons.find((s: any) => s.is_required);
        const mediumSize = sizeAddons.find((s: any) => s.name.toLowerCase().includes('medium'));
        const defaultSize = requiredSize || mediumSize || sizeAddons[0];
        
        // Only auto-select if there's a required size, otherwise let user choose
        if (defaultSize && defaultSize.is_required) {
          setSelectedSize(defaultSize.id);
        }
      }
      
      // Only auto-select spice if required
      const spiceAddons = (addons || []).filter((a: any) => a.type === 'spice');
      if (spiceAddons.length > 0) {
        const requiredSpice = spiceAddons.find((s: any) => s.is_required);
        if (requiredSpice) {
          setSpiceLevel(requiredSpice.id);
        }
      }
    } catch (error) {
      console.error('Error loading addons:', error);
      setAvailableAddons([]);
    }
  };

  const loadRecommendations = async (product: any) => {
    try {
      const hour = new Date().getHours();
      const context = {
        currentProduct: product,
        timeOfDay: hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening' as 'morning' | 'afternoon' | 'evening',
      };
      
      const smartRecommendations = await getSmartRecommendations(product, context);
      setRecommendations(smartRecommendations || []);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  const toggleFavorite = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setIsFavorite(!isFavorite);
  };

  const toggleAddon = (addonId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (selectedAddons.includes(addonId)) {
      setSelectedAddons(selectedAddons.filter(id => id !== addonId));
    } else {
      setSelectedAddons([...selectedAddons, addonId]);
    }
  };

  const increaseQuantity = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setQuantity(quantity + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = () => {
    if (!item) return;

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    const customizations: any[] = [];
    
    // Add size (from database)
    if (selectedSize) {
      const sizeAddon = availableAddons.find(a => a.id === selectedSize);
      if (sizeAddon) {
        customizations.push({ id: sizeAddon.id, name: `Size: ${sizeAddon.name}`, price: sizeAddon.price || 0 });
      }
    }
    
    // Add spice level (from database)
    if (spiceLevel) {
      const spiceAddon = availableAddons.find(a => a.id === spiceLevel);
      if (spiceAddon) {
        customizations.push({ id: spiceAddon.id, name: `Spice: ${spiceAddon.name}`, price: spiceAddon.price || 0 });
      }
    }
    
    // Add selected addons
    selectedAddons.forEach(addonId => {
      const addon = availableAddons.find(a => a.id === addonId);
      if (addon) {
        customizations.push({ id: addon.id, name: addon.name, price: addon.price });
      }
    });
    
    // Add special instructions
    if (specialInstructions.trim()) {
      customizations.push({ name: `Note: ${specialInstructions}`, price: 0 });
    }

    for (let i = 0; i < quantity; i++) {
      addItem({
        id: item.$id,
        name: item.name,
        price: item.price,
        image_url: item.image_url,
        customizations,
      });
    }

    router.back();
  };

  const calculateTotal = () => {
    if (!item) return 0;
    
    let basePrice = item.price;
    
    // Add size price if selected
    if (selectedSize) {
      const sizeAddon = availableAddons.find(a => a.id === selectedSize);
      if (sizeAddon) {
        basePrice += sizeAddon.price || 0;
      }
    }
    
    // Add spice level price if selected
    if (spiceLevel) {
      const spiceAddon = availableAddons.find(a => a.id === spiceLevel);
      if (spiceAddon) {
        basePrice += spiceAddon.price || 0;
      }
    }
    
    // Add selected addons
    const addonTotal = selectedAddons.reduce((sum, addonId) => {
      const addon = availableAddons.find(a => a.id === addonId);
      return sum + (addon?.price || 0);
    }, 0);
    
    return (basePrice + addonTotal) * quantity;
  };

  const handleRecommendationPress = (productId: string) => {
    router.push(`/item-detail?id=${productId}`);
  };

  const handleRecommendationAddToCart = (productId: string) => {
    const product = recommendations.find(r => r.id === productId);
    if (product) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        customizations: [],
      });
      
      // Show success notification
      showSuccess(`${product.name} added to cart! 🛒`, 2500);
    }
  };

  if (loading || !item) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerButton}
          activeOpacity={0.7}
        >
          <Icons.ChevronLeft size={24} color={Colors.neutral[900]} />
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={toggleFavorite}
          style={styles.headerButton}
          activeOpacity={0.7}
        >
          <Icons.Heart
            size={24}
            color={isFavorite ? '#FF6B6B' : Colors.neutral[900]}
          />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image
            source={getImageSource(item.image_url, item.name)}
            style={styles.productImage}
            resizeMode="cover"
          />
          
          {/* Calorie Badge */}
          {item.calories && (
            <View style={styles.calorieBadge}>
              <Text style={styles.calorieText}>{item.calories} kcal</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.contentContainer}>
          {/* Title */}
          <Text style={styles.productTitle}>
            {item.name}
            {item.weight && <Text style={styles.productWeight}>, {item.weight}</Text>}
          </Text>

          {/* Description/Ingredients */}
          {item.description && (
            <Text style={styles.ingredients}>
              {item.description}
            </Text>
          )}

          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                onPress={decreaseQuantity}
                style={[styles.quantityButton, quantity === 1 && styles.quantityButtonDisabled]}
                disabled={quantity === 1}
              >
                <Icons.Minus size={20} color={quantity === 1 ? Colors.neutral[300] : Colors.neutral[900]} />
              </TouchableOpacity>
              
              <Text style={styles.quantityText}>{quantity}</Text>
              
              <TouchableOpacity
                onPress={increaseQuantity}
                style={styles.quantityButton}
              >
                <Icons.Plus size={20} color={Colors.neutral[900]} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Size Selection */}
          {sizes.length > 0 && (
            <View style={styles.optionSection}>
              <Text style={styles.sectionTitle}>Size</Text>
              <View style={styles.optionButtons}>
                {sizes.map((size) => (
                  <TouchableOpacity
                    key={size.id}
                    onPress={() => {
                      if (Platform.OS !== 'web') {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                      setSelectedSize(size.id);
                    }}
                    style={[
                      styles.optionButton,
                      selectedSize === size.id && styles.optionButtonSelected,
                    ]}
                  >
                    <Text style={[
                      styles.optionButtonText,
                      selectedSize === size.id && styles.optionButtonTextSelected,
                    ]}>
                      {size.name}
                    </Text>
                    {size.price > 0 && (
                      <Text style={[
                        styles.optionPriceText,
                        selectedSize === size.id && styles.optionButtonTextSelected,
                      ]}>
                        +${size.price.toFixed(2)}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Spice Level */}
          {spiceLevels.length > 0 && (
            <View style={styles.optionSection}>
              <Text style={styles.sectionTitle}>Spice Level</Text>
              <View style={styles.optionButtons}>
                {spiceLevels.map((level) => (
                  <TouchableOpacity
                    key={level.id}
                    onPress={() => {
                      if (Platform.OS !== 'web') {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                      setSpiceLevel(level.id);
                    }}
                    style={[
                      styles.optionButton,
                      spiceLevel === level.id && styles.optionButtonSelected,
                    ]}
                  >
                    <Text style={[
                      styles.optionButtonText,
                      spiceLevel === level.id && styles.optionButtonTextSelected,
                    ]}>
                      {level.name}
                    </Text>
                    {level.price > 0 && (
                      <Text style={[
                        styles.optionPriceText,
                        spiceLevel === level.id && styles.optionButtonTextSelected,
                      ]}>
                        +${level.price.toFixed(2)}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Add to Order Section */}
          {extraAddons.length > 0 && (
            <View style={styles.addonsSection}>
              <Text style={styles.sectionTitle}>Add to order</Text>
              
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.addonsScroll}
                contentContainerStyle={styles.addonsContent}
              >
                {extraAddons.map((addon) => {
                  const isSelected = selectedAddons.includes(addon.id);
                  
                  return (
                    <View key={addon.id} style={styles.addonCard}>
                      {/* Addon Image */}
                      <View style={styles.addonImageContainer}>
                        <Image
                          source={getImageSource(addon.image_url, addon.name)}
                          style={styles.addonImage}
                          resizeMode="cover"
                        />
                        
                        {/* Add Button */}
                        <TouchableOpacity
                          onPress={() => toggleAddon(addon.id)}
                          style={[
                            styles.addonButton,
                            isSelected && styles.addonButtonSelected
                          ]}
                        >
                          {isSelected ? (
                            <Icons.Check size={16} color="#FFFFFF" />
                          ) : (
                            <Icons.Plus size={16} color="#FFFFFF" />
                          )}
                        </TouchableOpacity>
                      </View>
                      
                      {/* Addon Info */}
                      <Text style={styles.addonName} numberOfLines={2}>
                        {addon.name}
                      </Text>
                      <Text style={styles.addonPrice}>
                        ${addon.price.toFixed(2)}
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Special Instructions */}
          <View style={styles.instructionsSection}>
            <Text style={styles.sectionTitle}>Special Instructions</Text>
            <TextInput
              style={styles.instructionsInput}
              placeholder="Add a note (e.g., no sugar, extra ice)"
              placeholderTextColor={Colors.neutral[400]}
              value={specialInstructions}
              onChangeText={setSpecialInstructions}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <View style={styles.recommendationsSection}>
              <ProductRecommendations
                recommendations={recommendations}
                onProductPress={handleRecommendationPress}
                onAddToCart={handleRecommendationAddToCart}
                title="You might also like"
                maxItems={6}
              />
            </View>
          )}

          {/* Reviews - Temporarily disabled */}
          {/* <View style={styles.reviewsSection}>
            <ReviewsSection productId={id as string} productName={item.name} />
          </View> */}

          {/* Bottom Spacing */}
          <View style={{ height: 120 }} />
        </View>
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

      {/* Sticky Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Total</Text>
          <Text style={styles.totalPrice}>
            ${calculateTotal().toFixed(2)}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleAddToCart}
          style={styles.addToCartButton}
          activeOpacity={0.8}
        >
          <Text style={styles.addToCartText}>Add to cart</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.neutral[600],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FAF9F6',
    zIndex: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    ...Shadows.sm,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: height * 0.35,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5F5',
  },
  calorieBadge: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    ...Shadows.sm,
  },
  calorieText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.neutral[900],
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  productTitle: {
    fontSize: 32,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontWeight: '400',
    color: Colors.neutral[900],
    marginBottom: 12,
    lineHeight: 40,
  },
  productWeight: {
    fontSize: 32,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontWeight: '300',
    color: Colors.neutral[500],
  },
  ingredients: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.neutral[600],
    marginBottom: 24,
  },
  quantitySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontWeight: '400',
    color: Colors.neutral[900],
    marginBottom: 12,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    alignSelf: 'flex-start',
    ...Shadows.sm,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    backgroundColor: Colors.neutral[50],
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.neutral[900],
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: 'center',
  },
  optionSection: {
    marginBottom: 24,
  },
  optionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  optionButtonSelected: {
    backgroundColor: '#FF9F66',
    borderColor: '#FF9F66',
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.neutral[700],
  },
  optionButtonTextSelected: {
    color: '#FFFFFF',
  },
  optionPriceText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  addonsSection: {
    marginTop: 8,
    marginBottom: 24,
  },
  addonsScroll: {
    marginHorizontal: -24,
  },
  addonsContent: {
    paddingHorizontal: 24,
    gap: 12,
  },
  addonCard: {
    width: 120,
    marginRight: 12,
  },
  addonImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    overflow: 'hidden',
    position: 'relative',
    ...Shadows.sm,
  },
  addonImage: {
    width: '100%',
    height: '100%',
  },
  addonButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF9F66',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  addonButtonSelected: {
    backgroundColor: '#4CAF50',
  },
  addonName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.neutral[900],
    marginBottom: 4,
  },
  addonPrice: {
    fontSize: 13,
    color: Colors.neutral[600],
  },
  instructionsSection: {
    marginBottom: 32,
  },
  instructionsInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: Colors.neutral[900],
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  recommendationsSection: {
    marginBottom: 24,
    marginHorizontal: -24,
  },
  reviewsSection: {
    marginBottom: 24,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
  priceContainer: {
    marginRight: 16,
  },
  priceLabel: {
    fontSize: 12,
    color: Colors.neutral[600],
    marginBottom: 2,
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.neutral[900],
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: '#FF9F66',
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
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
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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

export default ItemDetail;
