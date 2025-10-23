import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/lib/designSystem';
import { AnimationHelper, AnimationStyles } from '@/lib/animations';

const { width, height } = Dimensions.get('window');

// Professional Loading Spinner
export const LoadingSpinner: React.FC<{
  size?: 'small' | 'medium' | 'large';
  color?: string;
  text?: string;
}> = ({ size = 'medium', color = Colors.primary[500], text }) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const spin = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    spin.start();
    
    return () => spin.stop();
  }, [spinValue]);
  
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  
  const sizeMap = {
    small: 20,
    medium: 30,
    large: 40,
  };
  
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={{
          width: sizeMap[size],
          height: sizeMap[size],
          borderWidth: 3,
          borderColor: Colors.neutral[200],
          borderTopColor: color,
          borderRadius: BorderRadius.full,
          transform: [{ rotate: spin }],
        }}
      />
      {text && (
        <Text
          style={[
            Typography.body2,
            { color: Colors.neutral[600], marginTop: Spacing.md },
          ]}
        >
          {text}
        </Text>
      )}
    </View>
  );
};

// Professional Skeleton Loader
export const SkeletonLoader: React.FC<{
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}> = ({ width: skeletonWidth = '100%', height = 20, borderRadius = 4, style }) => {
  const shimmerValue = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerValue, {
          toValue: 1,
          duration: 1000,
          easing: require('react-native').Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerValue, {
          toValue: 0,
          duration: 1000,
          easing: require('react-native').Easing.ease,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();
    
    return () => shimmer.stop();
  }, [shimmerValue]);
  
  const opacity = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });
  
  return (
    <Animated.View
      style={[
        {
          width: skeletonWidth,
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

// Professional Card Skeleton
export const CardSkeleton: React.FC = () => (
  <View
    style={{
      backgroundColor: '#FFFFFF',
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      marginBottom: Spacing.md,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    }}
  >
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md }}>
      <SkeletonLoader width={60} height={60} borderRadius={BorderRadius.full} />
      <View style={{ flex: 1, marginLeft: Spacing.md }}>
        <SkeletonLoader width="80%" height={16} style={{ marginBottom: Spacing.sm }} />
        <SkeletonLoader width="60%" height={14} />
      </View>
    </View>
    <SkeletonLoader width="100%" height={12} style={{ marginBottom: Spacing.sm }} />
    <SkeletonLoader width="70%" height={12} />
  </View>
);

// Professional List Skeleton
export const ListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <View>
    {Array.from({ length: count }).map((_, index) => (
      <CardSkeleton key={index} />
    ))}
  </View>
);

// Professional Food Card Skeleton
export const FoodCardSkeleton: React.FC = () => (
  <View
    style={{
      backgroundColor: '#FFFFFF',
      borderRadius: BorderRadius.lg,
      marginBottom: Spacing.md,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    }}
  >
    <SkeletonLoader width="100%" height={200} borderRadius={BorderRadius.lg} />
    <View style={{ padding: Spacing.md }}>
      <SkeletonLoader width="80%" height={18} style={{ marginBottom: Spacing.sm }} />
      <SkeletonLoader width="60%" height={14} style={{ marginBottom: Spacing.sm }} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <SkeletonLoader width={60} height={16} />
        <SkeletonLoader width={40} height={40} borderRadius={BorderRadius.full} />
      </View>
    </View>
  </View>
);

// Professional Full Screen Loader
export const FullScreenLoader: React.FC<{
  text?: string;
  backgroundColor?: string;
}> = ({ text = 'Loading...', backgroundColor = Colors.neutral[50] }) => {
  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
    >
      <View style={{ alignItems: 'center' }}>
        <LoadingSpinner size={48} color={Colors.primary[500]} />
        <Text
          style={[
            Typography.h5,
            {
              color: Colors.neutral[700],
              marginTop: Spacing.lg,
              textAlign: 'center',
            },
          ]}
        >
          {text}
        </Text>
      </View>
    </View>
  );
};

// Professional Overlay Loader
export const OverlayLoader: React.FC<{
  visible: boolean;
  text?: string;
}> = ({ visible, text = 'Loading...' }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim]);
  
  if (!visible) return null;
  
  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        opacity: fadeAnim,
      }}
    >
      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: BorderRadius.lg,
          padding: Spacing.xl,
          alignItems: 'center',
          minWidth: 120,
        }}
      >
        <LoadingSpinner size="medium" text={text} />
      </View>
    </Animated.View>
  );
};

// Professional Progress Bar
export const ProgressBar: React.FC<{
  progress: number; // 0-100
  height?: number;
  backgroundColor?: string;
  progressColor?: string;
  borderRadius?: number;
}> = ({
  progress,
  height = 4,
  backgroundColor = Colors.neutral[200],
  progressColor = Colors.primary[500],
  borderRadius = BorderRadius.sm,
}) => (
  <View
    style={{
      width: '100%',
      height,
      backgroundColor,
      borderRadius,
      overflow: 'hidden',
    }}
  >
    <Animated.View
      style={{
        width: `${Math.min(100, Math.max(0, progress))}%`,
        height: '100%',
        backgroundColor: progressColor,
        borderRadius,
      }}
    />
  </View>
);

// Professional Loading States
export const LoadingStates = {
  // Empty state
  EmptyState: ({ title, description, actionText, onAction }: {
    title: string;
    description: string;
    actionText?: string;
    onAction?: () => void;
  }) => (
    <View style={{ alignItems: 'center', justifyContent: 'center', padding: Spacing.xl }}>
      <Text style={[Typography.h3, { color: Colors.neutral[600], marginBottom: Spacing.sm }]}>
        {title}
      </Text>
      <Text style={[Typography.body2, { color: Colors.neutral[500], textAlign: 'center', marginBottom: Spacing.lg }]}>
        {description}
      </Text>
      {actionText && onAction && (
        <View
          style={{
            backgroundColor: Colors.primary[500],
            paddingHorizontal: Spacing.lg,
            paddingVertical: Spacing.md,
            borderRadius: BorderRadius.md,
          }}
        >
          <Text style={[Typography.button, { color: '#FFFFFF' }]}>
            {actionText}
          </Text>
        </View>
      )}
    </View>
  ),
  
  // Error state
  ErrorState: ({ title, description, onRetry }: {
    title: string;
    description: string;
    onRetry?: () => void;
  }) => (
    <View style={{ alignItems: 'center', justifyContent: 'center', padding: Spacing.xl }}>
      <Text style={[Typography.h3, { color: Colors.error[600], marginBottom: Spacing.sm }]}>
        {title}
      </Text>
      <Text style={[Typography.body2, { color: Colors.neutral[500], textAlign: 'center', marginBottom: Spacing.lg }]}>
        {description}
      </Text>
      {onRetry && (
        <View
          style={{
            backgroundColor: Colors.error[500],
            paddingHorizontal: Spacing.lg,
            paddingVertical: Spacing.md,
            borderRadius: BorderRadius.md,
          }}
        >
          <Text style={[Typography.button, { color: '#FFFFFF' }]}>
            Try Again
          </Text>
        </View>
      )}
    </View>
  ),
};

// Export individual components
export {
  LoadingSpinner,
  SkeletonLoader,
  CardSkeleton,
  ListSkeleton,
  FoodCardSkeleton,
  FullScreenLoader,
  OverlayLoader,
  ProgressBar,
  LoadingStates,
};

export default {
  LoadingSpinner,
  SkeletonLoader,
  CardSkeleton,
  ListSkeleton,
  FoodCardSkeleton,
  FullScreenLoader,
  OverlayLoader,
  ProgressBar,
  LoadingStates,
};
