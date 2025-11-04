/**
 * SKELETON LOADERS
 * Beautiful loading states for instant perceived performance ⚡
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, ViewStyle } from 'react-native';
import { Colors, Spacing, BorderRadius } from '@/lib/designSystem';

// Base Skeleton Component with shimmer animation
export const Skeleton = ({
  width,
  height,
  borderRadius = BorderRadius.md,
  style,
}: {
  width?: number | string;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width: width || '100%',
          height,
          backgroundColor: Colors.neutral[200],
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

// Product Card Skeleton
export const ProductCardSkeleton = () => (
  <View style={{
    width: 160,
    backgroundColor: 'white',
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    marginRight: Spacing.md,
  }}>
    <Skeleton height={120} borderRadius={BorderRadius.md} style={{ marginBottom: Spacing.sm }} />
    <Skeleton height={16} width="80%" style={{ marginBottom: Spacing.xs }} />
    <Skeleton height={12} width="60%" style={{ marginBottom: Spacing.sm }} />
    <Skeleton height={20} width="50%" />
  </View>
);

// List Item Skeleton
export const ListItemSkeleton = () => (
  <View style={{
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.lg,
  }}>
    <Skeleton height={60} width={60} borderRadius={BorderRadius.md} style={{ marginRight: Spacing.md }} />
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <Skeleton height={16} width="70%" style={{ marginBottom: Spacing.xs }} />
      <Skeleton height={12} width="50%" style={{ marginBottom: Spacing.xs }} />
      <Skeleton height={20} width="40%" />
    </View>
  </View>
);

// Order Card Skeleton
export const OrderCardSkeleton = () => (
  <View style={{
    backgroundColor: 'white',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md }}>
      <Skeleton height={16} width="40%" />
      <Skeleton height={24} width={80} borderRadius={BorderRadius.full} />
    </View>
    <Skeleton height={12} width="60%" style={{ marginBottom: Spacing.xs }} />
    <Skeleton height={12} width="50%" style={{ marginBottom: Spacing.md }} />
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Skeleton height={14} width="30%" />
      <Skeleton height={20} width="25%" />
    </View>
  </View>
);

// Profile Section Skeleton
export const ProfileSectionSkeleton = () => (
  <View style={{ backgroundColor: 'white', padding: Spacing.lg, borderRadius: BorderRadius.lg }}>
    <Skeleton height={16} width="40%" style={{ marginBottom: Spacing.md }} />
    {[1, 2, 3].map((i) => (
      <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md }}>
        <Skeleton height={40} width={40} borderRadius={BorderRadius.full} style={{ marginRight: Spacing.md }} />
        <View style={{ flex: 1 }}>
          <Skeleton height={14} width="70%" style={{ marginBottom: Spacing.xs }} />
          <Skeleton height={10} width="50%" />
        </View>
        <Skeleton height={20} width={20} borderRadius={BorderRadius.sm} />
      </View>
    ))}
  </View>
);

// Category Skeleton
export const CategorySkeleton = () => (
  <View style={{
    alignItems: 'center',
    marginRight: Spacing.md,
  }}>
    <Skeleton height={60} width={60} borderRadius={BorderRadius.full} style={{ marginBottom: Spacing.xs }} />
    <Skeleton height={12} width={60} />
  </View>
);

// Full Page Skeleton
export const MenuPageSkeleton = () => (
  <View style={{ flex: 1, backgroundColor: Colors.background[50] }}>
    {/* Header Skeleton */}
    <View style={{ backgroundColor: 'white', padding: Spacing.lg }}>
      <Skeleton height={40} width="60%" style={{ marginBottom: Spacing.md }} />
      <Skeleton height={40} borderRadius={BorderRadius.full} />
    </View>

    {/* Categories Skeleton */}
    <View style={{ paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg }}>
      <View style={{ flexDirection: 'row' }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <CategorySkeleton key={i} />
        ))}
      </View>
    </View>

    {/* Products Grid Skeleton */}
    <View style={{ paddingHorizontal: Spacing.lg }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={{ width: '48%', marginBottom: Spacing.md }}>
            <ProductCardSkeleton />
          </View>
        ))}
      </View>
    </View>
  </View>
);

// Cart Page Skeleton
export const CartPageSkeleton = () => (
  <View style={{ flex: 1, backgroundColor: Colors.background[50], padding: Spacing.lg }}>
    <Skeleton height={32} width="50%" style={{ marginBottom: Spacing.lg }} />
    {[1, 2, 3].map((i) => (
      <ListItemSkeleton key={i} />
    ))}
    <View style={{ marginTop: 'auto', backgroundColor: 'white', padding: Spacing.lg, borderRadius: BorderRadius.lg }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md }}>
        <Skeleton height={16} width="40%" />
        <Skeleton height={20} width="30%" />
      </View>
      <Skeleton height={50} borderRadius={BorderRadius.lg} />
    </View>
  </View>
);

// Orders Page Skeleton
export const OrdersPageSkeleton = () => (
  <View style={{ flex: 1, backgroundColor: Colors.background[50], padding: Spacing.lg }}>
    <Skeleton height={32} width="40%" style={{ marginBottom: Spacing.lg }} />
    {[1, 2, 3, 4].map((i) => (
      <OrderCardSkeleton key={i} />
    ))}
  </View>
);

// Profile Header Skeleton
export const ProfileHeaderSkeleton = () => (
  <View style={{ backgroundColor: 'white', padding: Spacing.xl, alignItems: 'center' }}>
    <Skeleton height={100} width={100} borderRadius={BorderRadius.full} style={{ marginBottom: Spacing.md }} />
    <Skeleton height={24} width="60%" style={{ marginBottom: Spacing.xs }} />
    <Skeleton height={14} width="40%" />
  </View>
);

// Review Skeleton
export const ReviewSkeleton = () => (
  <View style={{
    backgroundColor: 'white',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm }}>
      <Skeleton height={40} width={40} borderRadius={BorderRadius.full} style={{ marginRight: Spacing.md }} />
      <View style={{ flex: 1 }}>
        <Skeleton height={14} width="40%" style={{ marginBottom: Spacing.xs }} />
        <Skeleton height={12} width={80} />
      </View>
    </View>
    <Skeleton height={12} width="100%" style={{ marginBottom: Spacing.xs }} />
    <Skeleton height={12} width="90%" style={{ marginBottom: Spacing.xs }} />
    <Skeleton height={12} width="70%" />
  </View>
);

// Promotion Banner Skeleton
export const PromotionBannerSkeleton = () => (
  <Skeleton 
    height={150} 
    borderRadius={BorderRadius.xl} 
    style={{ marginHorizontal: Spacing.lg, marginVertical: Spacing.md }} 
  />
);

// Grid of Skeletons (flexible)
export const SkeletonGrid = ({
  count = 4,
  columns = 2,
  itemHeight = 200,
}: {
  count?: number;
  columns?: number;
  itemHeight?: number;
}) => (
  <View style={{
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: Spacing.lg,
  }}>
    {Array.from({ length: count }).map((_, i) => (
      <View
        key={i}
        style={{
          width: `${100 / columns - 2}%`,
          marginBottom: Spacing.md,
        }}
      >
        <Skeleton height={itemHeight} borderRadius={BorderRadius.lg} />
      </View>
    ))}
  </View>
);

export default {
  Skeleton,
  ProductCardSkeleton,
  ListItemSkeleton,
  OrderCardSkeleton,
  ProfileSectionSkeleton,
  CategorySkeleton,
  MenuPageSkeleton,
  CartPageSkeleton,
  OrdersPageSkeleton,
  ProfileHeaderSkeleton,
  ReviewSkeleton,
  PromotionBannerSkeleton,
  SkeletonGrid,
};


