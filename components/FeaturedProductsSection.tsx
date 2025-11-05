import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing, BorderRadius, Shadows } from '@/lib/designSystem';
import { Icons } from '@/lib/icons';
import * as Haptics from 'expo-haptics';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  restaurant_id?: string;
  restaurant?: {
    id: string;
    name: string;
  };
  restaurants?: {
    id: string;
    name: string;
  };
}

interface FeaturedProductsSectionProps {
  products: Product[];
  onProductPress?: (productId: string) => void;
  onAddToCart?: (productId: string) => void;
}

const FeaturedProductsSection: React.FC<FeaturedProductsSectionProps> = ({
  products,
  onProductPress,
  onAddToCart,
}) => {
  if (!products || products.length === 0) return null;

  const handleProductPress = (productId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (onProductPress) {
      onProductPress(productId);
    } else {
      router.push(`/item-detail?id=${productId}`);
    }
  };

  const handleAddToCart = (productId: string, e: any) => {
    e.stopPropagation();
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    onAddToCart?.(productId);
  };

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.sectionTitle}>Featured Products</Text>
          <Text style={styles.sectionSubtitle}>Chef's special recommendations</Text>
        </View>
        <TouchableOpacity 
          onPress={() => router.push('/(tabs)/search')}
          style={styles.seeAllButton}
        >
          <Text style={styles.seeAllText}>See All</Text>
          <Icons.ChevronRight size={16} color={Colors.primary[500]} />
        </TouchableOpacity>
      </View>

      {/* Products Horizontal Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={280}
        decelerationRate="fast"
      >
        {products.map((product, index) => (
          <TouchableOpacity
            key={product.id}
            style={[styles.productCard, index === 0 && styles.firstCard]}
            onPress={() => handleProductPress(product.id)}
            activeOpacity={0.9}
          >
            {/* Product Image */}
            <View style={styles.imageContainer}>
              {product.image_url ? (
                <Image
                  source={{ uri: product.image_url }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.productImage, styles.placeholderImage]}>
                  <Icons.Utensils size={32} color={Colors.neutral[400]} />
                </View>
              )}
              
              {/* Featured Badge */}
              <View style={styles.featuredBadge}>
                <Icons.Star size={12} color="#FFFFFF" fill="#FFFFFF" />
                <Text style={styles.featuredText}>Featured</Text>
              </View>
            </View>

            {/* Product Info */}
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={1}>
                {product.name}
              </Text>
              
              {product.description && (
                <Text style={styles.productDescription} numberOfLines={2}>
                  {product.description}
                </Text>
              )}

              {/* Restaurant Name - Always show if available */}
              {(product.restaurant?.name || product.restaurants?.name || product.restaurant_id) && (
                <View style={styles.restaurantTag}>
                  <Icons.MapPin size={12} color={Colors.neutral[600]} />
                  <Text style={styles.restaurantName} numberOfLines={1}>
                    {product.restaurant?.name || product.restaurants?.name || 'Available'}
                  </Text>
                </View>
              )}

              {/* Price and Add Button */}
              <View style={styles.footer}>
                <View style={styles.priceContainer}>
                  <Text style={styles.priceLabel}>Price</Text>
                  <Text style={styles.price}>€{product.price.toFixed(2)}</Text>
                </View>
                
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={(e) => handleAddToCart(product.id, e)}
                  activeOpacity={0.8}
                >
                  <Icons.Plus size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
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
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FFF5F0',
    borderRadius: BorderRadius.lg,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary[500],
    marginRight: 4,
  },
  scrollContent: {
    paddingLeft: Spacing.lg,
    paddingRight: Spacing.md,
  },
  productCard: {
    width: 260,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius['2xl'],
    marginRight: Spacing.md,
    overflow: 'hidden',
    ...Shadows.md,
  },
  firstCard: {
    marginLeft: 0,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 160,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    backgroundColor: Colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: Colors.primary[500],
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  featuredText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  productInfo: {
    padding: Spacing.md,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.neutral[900],
    marginBottom: 6,
  },
  productDescription: {
    fontSize: 13,
    color: Colors.neutral[600],
    marginBottom: Spacing.sm,
    lineHeight: 18,
  },
  restaurantTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
    alignSelf: 'flex-start',
    marginBottom: Spacing.sm,
  },
  restaurantName: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.neutral[700],
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 11,
    color: Colors.neutral[500],
    marginBottom: 2,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.neutral[900],
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
});

export default FeaturedProductsSection;




