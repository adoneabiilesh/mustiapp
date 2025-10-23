import React, { useState, useCallback, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  AccessibilityInfo,
} from 'react-native';
import { Icons } from '@/lib/icons';
import { getImageSource } from '@/lib/imageUtils';

const { width: screenWidth } = Dimensions.get('window');

// Calculate card width for 2-column grid with margins and gap
const CARD_MARGIN = 16;
const CARD_GAP = 16;
const CARD_WIDTH = (screenWidth - (CARD_MARGIN * 2) - CARD_GAP) / 2;

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isFavorite?: boolean;
  hasCustomizations?: boolean;
  onPress: (productId: string) => void;
  onFavoriteToggle: (productId: string, newState: boolean) => void;
  onAddToCart: (productId: string) => void;
  testID?: string;
}

const ProductCard = memo<ProductCardProps>(({
  id,
  name,
  description,
  price,
  imageUrl,
  isFavorite = false,
  hasCustomizations = false,
  onPress,
  onFavoriteToggle,
  onAddToCart,
  testID,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Handle card press with animation
  const handleCardPress = useCallback(() => {
    if (Platform.OS === 'ios') {
      // Add haptic feedback for iOS
      const { HapticFeedback } = require('expo-haptics');
      HapticFeedback.impactAsync(HapticFeedback.ImpactFeedbackStyle.Light);
    }
    onPress(id);
  }, [id, onPress]);

  // Handle favorite toggle with animation
  const handleFavoriteToggle = useCallback((event: any) => {
    event.stopPropagation(); // Prevent card press
    
    if (Platform.OS === 'ios') {
      const { HapticFeedback } = require('expo-haptics');
      HapticFeedback.impactAsync(HapticFeedback.ImpactFeedbackStyle.Medium);
    }
    
    onFavoriteToggle(id, !isFavorite);
  }, [id, isFavorite, onFavoriteToggle]);

  // Handle add to cart
  const handleAddToCart = useCallback((event: any) => {
    event.stopPropagation(); // Prevent card press
    
    if (Platform.OS === 'ios') {
      const { HapticFeedback } = require('expo-haptics');
      HapticFeedback.impactAsync(HapticFeedback.ImpactFeedbackStyle.Medium);
    }
    
    if (hasCustomizations) {
      onPress(id); // Navigate to detail for customizations
    } else {
      onAddToCart(id);
    }
  }, [id, hasCustomizations, onPress, onAddToCart]);

  // Handle image load
  const handleImageLoad = useCallback(() => {
    setIsImageLoading(false);
  }, []);

  // Handle image error
  const handleImageError = useCallback(() => {
    setIsImageLoading(false);
    setImageError(true);
  }, []);

  // Format price
  const formatPrice = useCallback((price: number) => {
    return `€${price.toFixed(2)}`;
  }, []);

  // Accessibility labels
  const cardAccessibilityLabel = `${name} - ${formatPrice(price)}`;
  const favoriteAccessibilityLabel = isFavorite ? `Remove ${name} from favorites` : `Add ${name} to favorites`;
  const addButtonAccessibilityLabel = `Add ${name} to cart`;

  return (
    <TouchableOpacity
      testID={testID}
      accessibilityLabel={cardAccessibilityLabel}
      accessibilityHint="Double tap to view details"
      accessibilityRole="button"
      onPress={handleCardPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={{
        width: CARD_WIDTH,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4, // Android shadow
        transform: [{ scale: isPressed ? 0.96 : 1 }],
      }}
      activeOpacity={0.9}
    >
      {/* Image Section */}
      <View style={{ position: 'relative' }}>
        <Image
          source={getImageSource(imageError ? '' : imageUrl, name)}
          style={{
            width: '100%',
            height: 140,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            backgroundColor: '#F5F5F5',
          }}
          resizeMode="cover"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
        
        {/* Loading shimmer effect */}
        {isImageLoading && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: '#F5F5F5',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            }}
          />
        )}
        
        {/* Favorite Button Overlay */}
        <TouchableOpacity
          accessibilityLabel={favoriteAccessibilityLabel}
          accessibilityRole="button"
          onPress={handleFavoriteToggle}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}
          activeOpacity={0.7}
        >
          <Icons.Heart 
            size={16} 
            color={isFavorite ? '#FF4B5C' : '#8E8E93'} 
          />
        </TouchableOpacity>
      </View>

      {/* Content Section */}
      <View style={{ padding: 12 }}>
        {/* Title */}
        <Text
          style={{
            fontSize: 15,
            fontWeight: '600',
            color: '#1A1A1A',
            lineHeight: 20,
            marginBottom: 4,
          }}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {name}
        </Text>

        {/* Description */}
        <Text
          style={{
            fontSize: 12,
            fontWeight: '400',
            color: '#8E8E93',
            lineHeight: 16,
            marginBottom: 12,
          }}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {description}
        </Text>

        {/* Bottom Row */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/* Price */}
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              color: '#1A1A1A',
            }}
          >
            {formatPrice(price)}
          </Text>

          {/* Add Button */}
          <TouchableOpacity
            accessibilityLabel={addButtonAccessibilityLabel}
            accessibilityRole="button"
            onPress={handleAddToCart}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: '#CDFF00',
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}
            activeOpacity={0.8}
          >
            <Icons.Plus size={16} color="#000000" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  return (
    prevProps.id === nextProps.id &&
    prevProps.name === nextProps.name &&
    prevProps.description === nextProps.description &&
    prevProps.price === nextProps.price &&
    prevProps.imageUrl === nextProps.imageUrl &&
    prevProps.isFavorite === nextProps.isFavorite &&
    prevProps.hasCustomizations === nextProps.hasCustomizations
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
