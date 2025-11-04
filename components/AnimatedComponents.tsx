/**
 * ANIMATED COMPONENTS LIBRARY
 * Reusable animated components with micro-interactions
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Animated,
  TouchableOpacityProps,
  ViewProps,
  Pressable,
  PressableProps,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { MicroAnimations, SpringConfigs } from '@/lib/animations';

// ====== ANIMATED BUTTON ======
interface AnimatedButtonProps extends PressableProps {
  hapticFeedback?: boolean;
  scaleOnPress?: boolean;
  children: React.ReactNode;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  hapticFeedback = true,
  scaleOnPress = true,
  children,
  onPressIn,
  onPressOut,
  ...props
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = (e: any) => {
    if (scaleOnPress) {
      MicroAnimations.buttonPress(scaleAnim).start();
    }
    if (hapticFeedback && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    if (scaleOnPress) {
      MicroAnimations.buttonRelease(scaleAnim).start();
    }
    onPressOut?.(e);
  };

  return (
    <Pressable
      {...props}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
        }}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
};

// ====== ANIMATED CARD ======
interface AnimatedCardProps extends ViewProps {
  children: React.ReactNode;
  delay?: number;
  liftOnPress?: boolean;
  hapticFeedback?: boolean;
  onPress?: () => void;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  delay = 0,
  liftOnPress = false,
  hapticFeedback = true,
  onPress,
  style,
  ...props
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const liftAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        delay,
        ...SpringConfigs.gentle,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    if (liftOnPress) {
      MicroAnimations.cardLift(liftAnim).start();
    }
    if (hapticFeedback && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    if (liftOnPress) {
      MicroAnimations.cardRest(liftAnim).start();
    }
  };

  const cardContent = (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            {
              translateY: liftAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -4],
              }),
            },
          ],
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Animated.View>
  );

  if (onPress || liftOnPress) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{ cursor: 'pointer' }}
      >
        {cardContent}
      </Pressable>
    );
  }

  return cardContent;
};

// ====== ANIMATED LIST ITEM ======
interface AnimatedListItemProps extends ViewProps {
  children: React.ReactNode;
  index: number;
  staggerDelay?: number;
}

export const AnimatedListItem: React.FC<AnimatedListItemProps> = ({
  children,
  index,
  staggerDelay = 50,
  style,
  ...props
}) => {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    MicroAnimations.listItemEntrance(animValue, index * staggerDelay).start();
  }, []);

  return (
    <Animated.View
      style={[
        {
          opacity: animValue,
          transform: [
            {
              translateY: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Animated.View>
  );
};

// ====== ANIMATED MODAL ======
interface AnimatedModalProps extends ViewProps {
  children: React.ReactNode;
  visible: boolean;
  onClose?: () => void;
}

export const AnimatedModal: React.FC<AnimatedModalProps> = ({
  children,
  visible,
  onClose,
  style,
  ...props
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(500)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        MicroAnimations.modalSlideUp(slideAnim),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        MicroAnimations.modalSlideDown(slideAnim),
      ]).start();
    }
  }, [visible]);

  if (!visible && fadeAnim._value === 0) return null;

  return (
    <>
      {/* Backdrop */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          opacity: fadeAnim,
        }}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={onClose}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Modal Content */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            transform: [{ translateY: slideAnim }],
          },
          style,
        ]}
        {...props}
      >
        {children}
      </Animated.View>
    </>
  );
};

// ====== ANIMATED BADGE ======
interface AnimatedBadgeProps extends ViewProps {
  children: React.ReactNode;
  pulse?: boolean;
}

export const AnimatedBadge: React.FC<AnimatedBadgeProps> = ({
  children,
  pulse = false,
  style,
  ...props
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (pulse) {
      MicroAnimations.badgePulse(scaleAnim).start();
    }
  }, [pulse]);

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Animated.View>
  );
};

// ====== ANIMATED ICON ======
interface AnimatedIconProps {
  children: React.ReactNode;
  rotate?: boolean;
  rotated?: boolean;
  style?: any;
}

export const AnimatedIcon: React.FC<AnimatedIconProps> = ({
  children,
  rotate = false,
  rotated = false,
  style,
}) => {
  const rotateAnim = useRef(new Animated.Value(rotated ? 1 : 0)).current;

  useEffect(() => {
    if (rotate) {
      MicroAnimations.rotateIcon(rotateAnim, rotated ? 1 : 0).start();
    }
  }, [rotated, rotate]);

  return (
    <Animated.View
      style={[
        {
          transform: [
            {
              rotate: rotateAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '180deg'],
              }),
            },
          ],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};

// ====== ANIMATED SUCCESS INDICATOR ======
interface AnimatedSuccessProps extends ViewProps {
  children: React.ReactNode;
  trigger?: boolean;
}

export const AnimatedSuccess: React.FC<AnimatedSuccessProps> = ({
  children,
  trigger = false,
  style,
  ...props
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (trigger) {
      MicroAnimations.successBounce(scaleAnim).start();
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  }, [trigger]);

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Animated.View>
  );
};

// ====== ANIMATED ERROR INDICATOR ======
interface AnimatedErrorProps extends ViewProps {
  children: React.ReactNode;
  trigger?: boolean;
}

export const AnimatedError: React.FC<AnimatedErrorProps> = ({
  children,
  trigger = false,
  style,
  ...props
}) => {
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (trigger) {
      MicroAnimations.errorShake(shakeAnim).start();
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  }, [trigger]);

  return (
    <Animated.View
      style={[
        {
          transform: [{ translateX: shakeAnim }],
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Animated.View>
  );
};

// ====== ANIMATED SHIMMER (Loading) ======
interface AnimatedShimmerProps extends ViewProps {
  children?: React.ReactNode;
  width?: number | string;
  height?: number;
}

export const AnimatedShimmer: React.FC<AnimatedShimmerProps> = ({
  children,
  width = '100%',
  height = 20,
  style,
  ...props
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    MicroAnimations.shimmer(shimmerAnim).start();
  }, []);

  return (
    <View style={[{ width, height, overflow: 'hidden' }, style]} {...props}>
      <Animated.View
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#E1E8ED',
          opacity: shimmerAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 1],
          }),
        }}
      >
        {children}
      </Animated.View>
    </View>
  );
};

// ====== FADE IN VIEW ======
interface FadeInViewProps extends ViewProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
}

export const FadeInView: React.FC<FadeInViewProps> = ({
  children,
  duration = 400,
  delay = 0,
  style,
  ...props
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Animated.View>
  );
};

// ====== SLIDE IN VIEW ======
interface SlideInViewProps extends ViewProps {
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  duration?: number;
  delay?: number;
  distance?: number;
}

export const SlideInView: React.FC<SlideInViewProps> = ({
  children,
  direction = 'up',
  duration = 400,
  delay = 0,
  distance = 50,
  style,
  ...props
}) => {
  const slideAnim = useRef(new Animated.Value(distance)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      delay,
      ...SpringConfigs.gentle,
      useNativeDriver: true,
    }).start();
  }, []);

  const getTransform = () => {
    switch (direction) {
      case 'left':
        return [{ translateX: slideAnim.interpolate({
          inputRange: [0, distance],
          outputRange: [0, -distance],
        }) }];
      case 'right':
        return [{ translateX: slideAnim }];
      case 'down':
        return [{ translateY: slideAnim.interpolate({
          inputRange: [0, distance],
          outputRange: [0, -distance],
        }) }];
      case 'up':
      default:
        return [{ translateY: slideAnim }];
    }
  };

  return (
    <Animated.View
      style={[
        {
          transform: getTransform(),
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Animated.View>
  );
};

