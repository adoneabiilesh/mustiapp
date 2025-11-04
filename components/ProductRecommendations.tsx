import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../lib/designSystem';
import { Icons } from '../lib/icons';
import { ProductRecommendation } from '../lib/recommendations';

interface ProductRecommendationsProps {
  recommendations: ProductRecommendation[];
  onProductPress: (productId: string) => void;
  onAddToCart: (productId: string) => void;
  title?: string;
  maxItems?: number;
}

export const ProductRecommendations: React.FC<ProductRecommendationsProps> = ({
  recommendations,
  onProductPress,
  onAddToCart,
  title = "You might also like",
  maxItems = 6,
}) => {
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  const displayRecommendations = recommendations.slice(0, maxItems);

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'complementary':
        return <Icons.Heart size={16} color={Colors.primary[500]} />;
      case 'contradictory':
        return <Icons.Star size={16} color={Colors.secondary[500]} />;
      case 'trending':
        return <Icons.Flame size={16} color={Colors.warning[500]} />;
      case 'similar':
        return <Icons.Utensils size={16} color={Colors.neutral[600]} />;
      default:
        return <Icons.Heart size={16} color={Colors.primary[500]} />;
    }
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'complementary':
        return Colors.primary[100];
      case 'contradictory':
        return Colors.secondary[100];
      case 'trending':
        return Colors.warning[100];
      case 'similar':
        return Colors.neutral[100];
      default:
        return Colors.primary[100];
    }
  };

  const getRecommendationTextColor = (type: string) => {
    switch (type) {
      case 'complementary':
        return Colors.primary[700];
      case 'contradictory':
        return Colors.secondary[700];
      case 'trending':
        return Colors.warning[700];
      case 'similar':
        return Colors.neutral[700];
      default:
        return Colors.primary[700];
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[Typography.h4, styles.title]}>
        {title}
      </Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {displayRecommendations.map((recommendation) => (
          <TouchableOpacity
            key={recommendation.id}
            style={styles.recommendationCard}
            onPress={() => onProductPress(recommendation.id)}
          >
            {/* Product Image */}
            <View style={styles.imageContainer}>
              {recommendation.image_url ? (
                <Image
                  source={{ uri: recommendation.image_url }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.placeholderImage}>
                  <Icons.Utensils size={24} color={Colors.neutral[400]} />
                </View>
              )}
              
              {/* Recommendation Type Badge */}
              <View style={[
                styles.typeBadge,
                { backgroundColor: getRecommendationColor(recommendation.type) }
              ]}>
                {getRecommendationIcon(recommendation.type)}
              </View>
            </View>

            {/* Product Info */}
            <View style={styles.productInfo}>
              <Text style={[Typography.body2, styles.productName]} numberOfLines={2}>
                {recommendation.name}
              </Text>
              
              <Text style={[Typography.small, styles.reason]} numberOfLines={2}>
                {recommendation.reason}
              </Text>
              
              <View style={styles.priceContainer}>
                <Text style={[Typography.h6, styles.price]}>
                  €{recommendation.price.toFixed(2)}
                </Text>
                
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => onAddToCart(recommendation.id)}
                >
                  <Icons.Plus size={16} color="#FFFFFF" />
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
  title: {
    color: Colors.neutral[900],
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  recommendationCard: {
    width: 160,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 100,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: {
    padding: Spacing.md,
  },
  productName: {
    color: Colors.neutral[900],
    fontWeight: '600',
    marginBottom: 4,
  },
  reason: {
    color: Colors.neutral[600],
    marginBottom: Spacing.sm,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    color: Colors.primary[600],
    fontWeight: '700',
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ProductRecommendations;
