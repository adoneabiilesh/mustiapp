import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing, BorderRadius, Shadows } from '@/lib/designSystem';
import { Icons } from '@/lib/icons';
import * as Haptics from 'expo-haptics';

interface SpecialOffer {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  original_price: number;
  offer_price: number;
  discount_percentage?: number;
  valid_until: string;
  terms?: string;
}

interface SpecialOffersSectionProps {
  offers: SpecialOffer[];
  onOfferPress?: (offerId: string) => void;
}

const SpecialOffersSection: React.FC<SpecialOffersSectionProps> = ({
  offers,
  onOfferPress,
}) => {
  if (!offers || offers.length === 0) return null;

  const handleOfferPress = (offerId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (onOfferPress) {
      onOfferPress(offerId);
    } else {
      router.push(`/special-offer-details?id=${offerId}`);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Ends today!';
    if (diffDays === 1) return 'Ends tomorrow';
    if (diffDays <= 7) return `${diffDays} days left`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.sectionTitle}>Special Offers</Text>
          <Text style={styles.sectionSubtitle}>Limited time combo deals</Text>
        </View>
        <TouchableOpacity style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View All</Text>
          <Icons.ChevronRight size={16} color={Colors.primary[500]} />
        </TouchableOpacity>
      </View>

      {/* Offers Horizontal Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={340}
        decelerationRate="fast"
      >
        {offers.map((offer, index) => (
          <TouchableOpacity
            key={offer.id}
            style={[styles.offerCard, index === 0 && styles.firstCard]}
            onPress={() => handleOfferPress(offer.id)}
            activeOpacity={0.9}
          >
            {/* Offer Image */}
            <View style={styles.imageContainer}>
              {offer.image_url ? (
                <Image
                  source={{ uri: offer.image_url }}
                  style={styles.offerImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.offerImage, styles.placeholderImage]}>
                  <Icons.Package size={48} color={Colors.neutral[400]} />
                </View>
              )}

              {/* Discount Badge */}
              {offer.discount_percentage && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>
                    {Math.round(offer.discount_percentage)}% OFF
                  </Text>
                </View>
              )}

              {/* Time Badge */}
              <View style={styles.timeBadge}>
                <Icons.Clock size={12} color="#FFFFFF" />
                <Text style={styles.timeText}>{formatDate(offer.valid_until)}</Text>
              </View>
            </View>

            {/* Offer Info */}
            <View style={styles.offerInfo}>
              <Text style={styles.offerTitle} numberOfLines={1}>
                {offer.title}
              </Text>
              
              <Text style={styles.offerDescription} numberOfLines={2}>
                {offer.description}
              </Text>

              {/* Pricing */}
              <View style={styles.pricingContainer}>
                <View style={styles.priceRow}>
                  <Text style={styles.originalPrice}>
                    €{offer.original_price.toFixed(2)}
                  </Text>
                  <Text style={styles.offerPrice}>
                    €{offer.offer_price.toFixed(2)}
                  </Text>
                </View>
                
                <View style={styles.savingsTag}>
                  <Text style={styles.savingsText}>
                    Save €{(offer.original_price - offer.offer_price).toFixed(2)}
                  </Text>
                </View>
              </View>

              {/* CTA Button */}
              <View style={styles.ctaButton}>
                <Text style={styles.ctaText}>View Combo</Text>
                <Icons.ArrowRight size={16} color="#FFFFFF" />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Promotional Banner (optional) */}
      <TouchableOpacity style={styles.promoBanner} activeOpacity={0.8}>
        <View style={styles.promoContent}>
          <View style={styles.promoIconContainer}>
            <Icons.Award size={24} color={Colors.primary[500]} />
          </View>
          <View style={styles.promoTextContainer}>
            <Text style={styles.promoTitle}>More Deals Available!</Text>
            <Text style={styles.promoSubtitle}>Check out all our special offers</Text>
          </View>
          <Icons.ChevronRight size={20} color={Colors.neutral[400]} />
        </View>
      </TouchableOpacity>
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
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FFF5F0',
    borderRadius: BorderRadius.lg,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary[500],
    marginRight: 4,
  },
  scrollContent: {
    paddingLeft: Spacing.lg,
    paddingRight: Spacing.md,
  },
  offerCard: {
    width: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius['3xl'],
    marginRight: Spacing.md,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  firstCard: {
    marginLeft: 0,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
  },
  offerImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    backgroundColor: Colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.xl,
    ...Shadows.md,
  },
  discountText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  timeBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.lg,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  offerInfo: {
    padding: Spacing.lg,
  },
  offerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.neutral[900],
    marginBottom: Spacing.xs,
  },
  offerDescription: {
    fontSize: 14,
    color: Colors.neutral[600],
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  pricingContainer: {
    marginBottom: Spacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  originalPrice: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.neutral[500],
    textDecorationLine: 'line-through',
    marginRight: 12,
  },
  offerPrice: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.primary[500],
  },
  savingsTag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
    alignSelf: 'flex-start',
  },
  savingsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
  },
  ctaButton: {
    backgroundColor: Colors.primary[500],
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 8,
  },
  promoBanner: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius['2xl'],
    ...Shadows.sm,
    overflow: 'hidden',
  },
  promoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  promoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  promoTextContainer: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral[900],
    marginBottom: 2,
  },
  promoSubtitle: {
    fontSize: 13,
    color: Colors.neutral[600],
  },
});

export default SpecialOffersSection;




