import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Animated,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing, BorderRadius, Shadows } from '@/lib/designSystem';
import * as Haptics from 'expo-haptics';
import { PromotionService, Promotion } from '@/lib/promotionService';

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width - (Spacing.lg * 2);
const BANNER_HEIGHT = 180;

interface Banner {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  ctaText: string;
  link?: string;
  discount?: number;
  discount_type?: string;
}

const BannerCarousel = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      setLoading(true);
      const promotions = await PromotionService.getActivePromotions();
      
      // Transform promotions to banner format
      const transformedBanners: Banner[] = promotions.map((promo) => ({
        id: promo.id,
        image: promo.image_url || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
        title: promo.title,
        subtitle: promo.description,
        ctaText: 'Order Now',
        discount: promo.discount,
        discount_type: promo.discount_type,
      }));

      setBanners(transformedBanners);
    } catch (error) {
      console.error('Error loading banners:', error);
      // Set empty array if error
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-rotate banners every 4 seconds
    if (banners.length === 0) return;

    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % banners.length;
      setActiveIndex(nextIndex);
      
      scrollViewRef.current?.scrollTo({
        x: nextIndex * (BANNER_WIDTH + Spacing.md),
        animated: true,
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [activeIndex, banners.length]);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / (BANNER_WIDTH + Spacing.md));
        setActiveIndex(index);
      },
    }
  );

  const handleBannerPress = (banner: Banner) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Navigate to menu or specific promotion
    router.push('/(tabs)/');
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
      </View>
    );
  }

  if (banners.length === 0) {
    return null; // Don't show anything if no banners
  }

  return (
    <View style={styles.container}>
      {/* Banner Slider */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        snapToInterval={BANNER_WIDTH + Spacing.md}
        decelerationRate="fast"
        contentContainerStyle={styles.scrollContent}
      >
        {banners.map((banner, index) => (
          <TouchableOpacity
            key={banner.id}
            style={styles.bannerCard}
            onPress={() => handleBannerPress(banner)}
            activeOpacity={0.9}
          >
            <Image
              source={{ uri: banner.image }}
              style={styles.bannerImage}
              resizeMode="cover"
            />
            
            {/* Gradient Overlay */}
            <View style={styles.bannerOverlay} />
            
            {/* Content */}
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>{banner.title}</Text>
              <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
              
              {/* CTA Button */}
              <TouchableOpacity
                style={styles.ctaButton}
                onPress={() => handleBannerPress(banner)}
              >
                <Text style={styles.ctaText}>{banner.ctaText}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Dots Indicator */}
      <View style={styles.dotsContainer}>
        {banners.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              activeIndex === index && styles.dotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  loadingContainer: {
    height: BANNER_HEIGHT + 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  bannerCard: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.md,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  bannerContent: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  bannerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: Spacing.xs,
    fontFamily: 'Georgia',
  },
  bannerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: Spacing.lg,
    opacity: 0.95,
  },
  ctaButton: {
    backgroundColor: Colors.primary[500],
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: BorderRadius.md,
    alignSelf: 'flex-start',
    ...Shadows.sm,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.neutral[300],
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.primary[500],
  },
});

export default BannerCarousel;

