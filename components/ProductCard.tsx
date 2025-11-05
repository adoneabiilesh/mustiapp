import React, { useState, useCallback, memo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  Image,
  Dimensions,
  Platform,
  AccessibilityInfo,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Icons } from '@/lib/icons';
import { getImageSource } from '@/lib/imageUtils';
import { MicroAnimations } from '@/lib/animations';

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
  const [justAddedToCart, setJustAddedToCart] = useState(false);
  
  // Animations
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const favoriteScaleAnim = useRef(new Animated.Value(1)).current;
  const cartButtonScaleAnim = useRef(new Animated.Value(1)).current;
  const [imageError, setImageError] = useState(false);

  // Handle card press with animation
  const handleCardPress = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress(id);
  }, [id, onPress]);

  // Handle favorite toggle with animation
  const handleFavoriteToggle = useCallback((event: any) => {
    event.stopPropagation(); // Prevent card press
    
    // Animate the favorite button
    MicroAnimations.successBounce(favoriteScaleAnim).start();
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    onFavoriteToggle(id, !isFavorite);
  }, [id, isFavorite, onFavoriteToggle]);

  // Handle add to cart
  const handleAddToCart = useCallback((event: any) => {
    event.stopPropagation(); // Prevent card press
    
    // Animate the cart button
    MicroAnimations.successBounce(cartButtonScaleAnim).start();
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    // Show success state briefly
    setJustAddedToCart(true);
    setTimeout(() => setJustAddedToCart(false), 1500);
    
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

  const handlePressIn = useCallback(() => {
    setIsPressed(true);
    MicroAnimations.buttonPress(scaleAnim).start();
  }, []);
  
  const handlePressOut = useCallback(() => {
    setIsPressed(false);
    MicroAnimations.buttonRelease(scaleAnim).start();
  }, []);

  const CardWrapper = Platform.OS === 'web' ? View : Pressable;
  const cardWrapperProps = Platform.OS === 'web' 
    ? {
        onStartShouldSetResponder: () => true,
        onResponderRelease: handleCardPress,
        style: {
          width: CARD_WIDTH,
          backgroundColor: '#FFFFFF',
          borderRadius: 20,
          marginBottom: 16,
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
          cursor: 'pointer',
        },
      }
    : {
        testID,
        onPress: handleCardPress,
        onPressIn: handlePressIn,
        onPressOut: handlePressOut,
        style: ({ pressed }: { pressed: boolean }) => ({
          width: CARD_WIDTH,
          backgroundColor: '#FFFFFF',
          borderRadius: 20,
          marginBottom: 16,
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
          elevation: 4,
          opacity: pressed ? 0.9 : 1,
        }),
        accessibilityLabel: cardAccessibilityLabel,
        accessibilityHint: "Double tap to view details",
        accessibilityRole: 'button' as const,
      };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <CardWrapper {...cardWrapperProps as any}>
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
        <Animated.View
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            transform: [{ scale: favoriteScaleAnim }],
          }}
        >
          <Pressable
            accessibilityLabel={favoriteAccessibilityLabel}
            accessibilityRole={Platform.OS === 'web' ? 'button' : 'button'}
            onPress={handleFavoriteToggle}
            style={({ pressed }) => ({
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
              elevation: 2,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Icons.Heart 
              size={16} 
              color={isFavorite ? '#FF4B5C' : '#8E8E93'} 
            />
          </Pressable>
        </Animated.View>
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
          <Animated.View style={{ transform: [{ scale: cartButtonScaleAnim }] }}>
            <Pressable
              accessibilityLabel={addButtonAccessibilityLabel}
              accessibilityRole="button"
              onPress={handleAddToCart}
              style={({ pressed }) => ({
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: justAddedToCart ? '#10B981' : '#CDFF00',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                elevation: 2,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              {justAddedToCart ? (
                <Icons.Check size={16} color="#FFFFFF" />
              ) : (
                <Icons.Plus size={16} color="#000000" />
              )}
            </Pressable>
          </Animated.View>
        </View>
      </View>
    </CardWrapper>
    </Animated.View>
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

