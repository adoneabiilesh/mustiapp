import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing, BorderRadius, Shadows } from '@/lib/designSystem';
import { Icons } from '@/lib/icons';
import { useCartStore } from '@/store/cart.store';
import * as Haptics from 'expo-haptics';

interface SpecialProduct {
  id: string;
  name: string;
  price: number;
  image_url: string;
  description?: string;
}

interface TodaysSpecialsProps {
  restaurantId?: string;
}

const TodaysSpecials: React.FC<TodaysSpecialsProps> = ({ restaurantId }) => {
  const [specials, setSpecials] = useState<SpecialProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCartStore();

  useEffect(() => {
    loadSpecials();
  }, [restaurantId]);

  const loadSpecials = async () => {
    try {
      setLoading(true);
      const { getMenuItems } = await import('@/lib/database');
      
      const filters: any = {
        is_available: true,
        is_featured: true,
        limit: 4,
      };
      
      if (restaurantId) {
        filters.restaurant_id = restaurantId;
      }

      const items = await getMenuItems(filters);
      setSpecials(items || []);
    } catch (error) {
      console.error('Error loading specials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: SpecialProduct) => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image_url,
      customizations: [],
    });
  };

  const handleProductPress = (productId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push(`/item-detail?id=${productId}`);
  };

  if (specials.length === 0) return null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerEmoji}>🔥</Text>
          <Text style={styles.headerTitle}>Today's Specials</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/(tabs)/')}>
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
      </View>

      {/* Products Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {specials.map((product) => (
          <TouchableOpacity
            key={product.id}
            style={styles.productCard}
            onPress={() => handleProductPress(product.id)}
            activeOpacity={0.9}
          >
            {/* Product Image */}
            <Image
              source={{ uri: product.image_url }}
              style={styles.productImage}
              resizeMode="cover"
            />

            {/* Special Badge */}
            <View style={styles.specialBadge}>
              <Text style={styles.specialBadgeText}>SPECIAL</Text>
            </View>

            {/* Product Info */}
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={1}>
                {product.name}
              </Text>
              
              <View style={styles.productFooter}>
                <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
                
                {/* Add Button */}
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleAddToCart(product);
                  }}
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
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerEmoji: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text.primary,
    fontFamily: 'Georgia',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary[500],
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  productCard: {
    width: 160,
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.md,
  },
  productImage: {
    width: '100%',
    height: 120,
    backgroundColor: Colors.neutral[100],
  },
  specialBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.error[500],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  specialBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  productInfo: {
    padding: Spacing.md,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary[500],
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
});

export default TodaysSpecials;




