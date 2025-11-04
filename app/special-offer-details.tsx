import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/lib/designSystem';
import { Icons } from '@/lib/icons';
import { getSpecialOfferById } from '@/lib/database';
import { useCartStore } from '@/store/cart.store';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const SpecialOfferDetails = () => {
  const { id } = useLocalSearchParams();
  const [offer, setOffer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCartStore();

  useEffect(() => {
    loadOffer();
  }, [id]);

  const loadOffer = async () => {
    try {
      setLoading(true);
      const data = await getSpecialOfferById(id as string);
      if (!data) {
        if (__DEV__) {
          console.log('Special offer not found');
        }
        return;
      }
      setOffer(data);
    } catch (error) {
      if (__DEV__) {
        console.error('Error loading special offer:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!offer) return;

    // Add all items in the special offer to cart
    if (offer.special_offer_items && offer.special_offer_items.length > 0) {
      offer.special_offer_items.forEach((item: any) => {
        for (let i = 0; i < item.quantity; i++) {
          addItem({
            id: item.menu_items?.id || item.menu_item_id,
            name: item.menu_items?.name || 'Item',
            price: item.menu_items?.price || 0,
            image_url: item.menu_items?.image_url,
            customizations: [],
          });
        }
      });
    }

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    router.push('/(tabs)/cart');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
          <Text style={styles.loadingText}>Loading offer...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!offer) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icons.Package size={48} color={Colors.neutral[300]} />
          <Text style={styles.errorText}>Offer not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
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
          style={styles.backButtonHeader}
        >
          <Icons.ArrowBack size={24} color={Colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Special Offer</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Offer Image */}
        {offer.image_url && (
          <Image
            source={{ uri: offer.image_url }}
            style={styles.offerImage}
            resizeMode="cover"
          />
        )}

        {/* Offer Content */}
        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.title}>{offer.title}</Text>

          {/* Description */}
          {offer.description && (
            <Text style={styles.description}>{offer.description}</Text>
          )}

          {/* Pricing */}
          <View style={styles.pricingContainer}>
            <View style={styles.priceRow}>
              <Text style={styles.originalPrice}>
                €{offer.original_price?.toFixed(2)}
              </Text>
              <Text style={styles.offerPrice}>
                €{offer.offer_price?.toFixed(2)}
              </Text>
            </View>
            {offer.discount_percentage && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>
                  {Math.round(offer.discount_percentage)}% OFF
                </Text>
              </View>
            )}
          </View>

          {/* Items Included */}
          {offer.special_offer_items && offer.special_offer_items.length > 0 && (
            <View style={styles.itemsSection}>
              <Text style={styles.sectionTitle}>What's Included:</Text>
              {offer.special_offer_items.map((item: any, index: number) => (
                <View key={index} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    {item.menu_items?.image_url && (
                      <Image
                        source={{ uri: item.menu_items.image_url }}
                        style={styles.itemImage}
                        resizeMode="cover"
                      />
                    )}
                    <View style={styles.itemDetails}>
                      <Text style={styles.itemName}>
                        {item.menu_items?.name || 'Item'}
                      </Text>
                      {item.menu_items?.description && (
                        <Text style={styles.itemDescription}>
                          {item.menu_items.description}
                        </Text>
                      )}
                    </View>
                  </View>
                  <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Validity */}
          {offer.valid_until && (
            <View style={styles.validitySection}>
              <Icons.Clock size={20} color={Colors.neutral[600]} />
              <Text style={styles.validityText}>
                Valid until {formatDate(offer.valid_until)}
              </Text>
            </View>
          )}

          {/* Terms */}
          {offer.terms && (
            <View style={styles.termsSection}>
              <Text style={styles.termsTitle}>Terms & Conditions</Text>
              <Text style={styles.termsText}>{offer.terms}</Text>
            </View>
          )}

          {/* CTA Button */}
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={handleAddToCart}
            activeOpacity={0.8}
          >
            <Text style={styles.addToCartText}>Add to Cart</Text>
            <Icons.ShoppingCart size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  backButtonHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.neutral[900],
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: 16,
    color: Colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorText: {
    marginTop: Spacing.md,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  backButton: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.primary[500],
    borderRadius: BorderRadius.lg,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  offerImage: {
    width: '100%',
    height: 250,
    backgroundColor: Colors.neutral[100],
  },
  content: {
    padding: Spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: 16,
    color: Colors.text.secondary,
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
  pricingContainer: {
    marginBottom: Spacing.xl,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  originalPrice: {
    fontSize: 20,
    fontWeight: '500',
    color: Colors.neutral[500],
    textDecorationLine: 'line-through',
    marginRight: Spacing.md,
  },
  offerPrice: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.primary[500],
  },
  discountBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FF3B30',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  itemsSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.neutral[100],
    marginRight: Spacing.md,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  itemDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  itemQuantity: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary[500],
  },
  validitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  validityText: {
    marginLeft: Spacing.sm,
    fontSize: 14,
    color: Colors.text.secondary,
  },
  termsSection: {
    marginBottom: Spacing.xl,
  },
  termsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  termsText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary[500],
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.xl,
    ...Shadows.md,
    gap: Spacing.sm,
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default SpecialOfferDetails;

