import { Animated, Easing, Platform } from 'react-native';

// Helper to determine if native driver should be used
const shouldUseNativeDriver = () => Platform.OS !== 'web';

// Professional Animation Presets
export const AnimationPresets = {
  // Fade Animations
  fadeIn: {
    toValue: 1,
    duration: 300,
    easing: Easing.out(Easing.quad),
    useNativeDriver: shouldUseNativeDriver(),
  },
  
  fadeOut: {
    toValue: 0,
    duration: 200,
    easing: Easing.in(Easing.quad),
    useNativeDriver: shouldUseNativeDriver(),
  },
  
  // Scale Animations
  scaleIn: {
    toValue: 1,
    duration: 300,
    easing: Easing.out(Easing.back(1.2)),
    useNativeDriver: shouldUseNativeDriver(),
  },
  
  scaleOut: {
    toValue: 0,
    duration: 200,
    easing: Easing.in(Easing.back(1.2)),
    useNativeDriver: shouldUseNativeDriver(),
  },
  
  // Slide Animations
  slideInFromRight: {
    toValue: 0,
    duration: 300,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: shouldUseNativeDriver(),
  },
  
  slideInFromLeft: {
    toValue: 0,
    duration: 300,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: shouldUseNativeDriver(),
  },
  
  slideInFromBottom: {
    toValue: 0,
    duration: 300,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: shouldUseNativeDriver(),
  },
  
  slideInFromTop: {
    toValue: 0,
    duration: 300,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: shouldUseNativeDriver(),
  },
  
  // Bounce Animations
  bounceIn: {
    toValue: 1,
    duration: 400,
    easing: Easing.out(Easing.bounce),
    useNativeDriver: shouldUseNativeDriver(),
  },
  
  bounceOut: {
    toValue: 0,
    duration: 300,
    easing: Easing.in(Easing.bounce),
    useNativeDriver: shouldUseNativeDriver(),
  },
  
  // Spring Animations
  springIn: {
    toValue: 1,
    duration: 300,
    easing: Easing.out(Easing.elastic(1)),
    useNativeDriver: shouldUseNativeDriver(),
  },
  
  springOut: {
    toValue: 0,
    duration: 200,
    easing: Easing.in(Easing.elastic(1)),
    useNativeDriver: shouldUseNativeDriver(),
  },
};

// Professional Animation Helpers
export class AnimationHelper {
  // Create fade in animation
  static fadeIn(animatedValue: Animated.Value, duration: number = 300) {
    return Animated.timing(animatedValue, {
      toValue: 1,
      duration,
      easing: Easing.out(Easing.quad),
      useNativeDriver: shouldUseNativeDriver(),
    });
  }
  
  // Create fade out animation
  static fadeOut(animatedValue: Animated.Value, duration: number = 200) {
    return Animated.timing(animatedValue, {
      toValue: 0,
      duration,
      easing: Easing.in(Easing.quad),
      useNativeDriver: shouldUseNativeDriver(),
    });
  }
  
  // Create scale animation
  static scale(animatedValue: Animated.Value, toValue: number, duration: number = 300) {
    return Animated.timing(animatedValue, {
      toValue,
      duration,
      easing: Easing.out(Easing.back(1.2)),
      useNativeDriver: shouldUseNativeDriver(),
    });
  }
  
  // Create slide animation
  static slide(animatedValue: Animated.Value, toValue: number, duration: number = 300) {
    return Animated.timing(animatedValue, {
      toValue,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: shouldUseNativeDriver(),
    });
  }
  
  // Create bounce animation
  static bounce(animatedValue: Animated.Value, toValue: number, duration: number = 400) {
    return Animated.timing(animatedValue, {
      toValue,
      duration,
      easing: Easing.out(Easing.bounce),
      useNativeDriver: shouldUseNativeDriver(),
    });
  }
  
  // Create spring animation
  static spring(animatedValue: Animated.Value, toValue: number, duration: number = 300) {
    return Animated.timing(animatedValue, {
      toValue,
      duration,
      easing: Easing.out(Easing.elastic(1)),
      useNativeDriver: shouldUseNativeDriver(),
    });
  }
  
  // Create pulse animation
  static pulse(animatedValue: Animated.Value) {
    return Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: shouldUseNativeDriver(),
        }),
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: shouldUseNativeDriver(),
        }),
      ])
    );
  }
  
  // Create shake animation
  static shake(animatedValue: Animated.Value) {
    return Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 10,
        duration: 50,
        easing: Easing.linear,
        useNativeDriver: shouldUseNativeDriver(),
      }),
      Animated.timing(animatedValue, {
        toValue: -10,
        duration: 50,
        easing: Easing.linear,
        useNativeDriver: shouldUseNativeDriver(),
      }),
      Animated.timing(animatedValue, {
        toValue: 10,
        duration: 50,
        easing: Easing.linear,
        useNativeDriver: shouldUseNativeDriver(),
      }),
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 50,
        easing: Easing.linear,
        useNativeDriver: shouldUseNativeDriver(),
      }),
    ]);
  }
  
  // Create loading animation
  static loading(animatedValue: Animated.Value) {
    return Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: shouldUseNativeDriver(),
      })
    );
  }
  
  // Create stagger animation
  static stagger(animations: Animated.CompositeAnimation[], delay: number = 100) {
    return Animated.stagger(delay, animations);
  }
  
  // Create parallel animation
  static parallel(animations: Animated.CompositeAnimation[]) {
    return Animated.parallel(animations);
  }
  
  // Create sequence animation
  static sequence(animations: Animated.CompositeAnimation[]) {
    return Animated.sequence(animations);
  }
}

// Professional Animation Hooks
export const useAnimation = () => {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(0);
  const rotateAnim = new Animated.Value(0);
  
  const fadeIn = () => AnimationHelper.fadeIn(fadeAnim);
  const fadeOut = () => AnimationHelper.fadeOut(fadeAnim);
  const scaleIn = () => AnimationHelper.scale(scaleAnim, 1);
  const scaleOut = () => AnimationHelper.scale(scaleAnim, 0);
  const slideIn = () => AnimationHelper.slide(slideAnim, 1);
  const slideOut = () => AnimationHelper.slide(slideAnim, 0);
  
  return {
    fadeAnim,
    scaleAnim,
    slideAnim,
    rotateAnim,
    fadeIn,
    fadeOut,
    scaleIn,
    scaleOut,
    slideIn,
    slideOut,
  };
};

// Professional Animation Styles
export const AnimationStyles = {
  // Fade styles
  fadeIn: (animatedValue: Animated.Value) => ({
    opacity: animatedValue,
  }),
  
  fadeOut: (animatedValue: Animated.Value) => ({
    opacity: animatedValue,
  }),
  
  // Scale styles
  scaleIn: (animatedValue: Animated.Value) => ({
    transform: [{ scale: animatedValue }],
  }),
  
  scaleOut: (animatedValue: Animated.Value) => ({
    transform: [{ scale: animatedValue }],
  }),
  
  // Slide styles
  slideFromRight: (animatedValue: Animated.Value) => ({
    transform: [{ translateX: animatedValue }],
  }),
  
  slideFromLeft: (animatedValue: Animated.Value) => ({
    transform: [{ translateX: animatedValue }],
  }),
  
  slideFromBottom: (animatedValue: Animated.Value) => ({
    transform: [{ translateY: animatedValue }],
  }),
  
  slideFromTop: (animatedValue: Animated.Value) => ({
    transform: [{ translateY: animatedValue }],
  }),
  
  // Rotate styles
  rotate: (animatedValue: Animated.Value) => ({
    transform: [{ rotate: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    })}],
  }),
  
  // Combined styles
  fadeAndScale: (fadeValue: Animated.Value, scaleValue: Animated.Value) => ({
    opacity: fadeValue,
    transform: [{ scale: scaleValue }],
  }),
  
  slideAndFade: (slideValue: Animated.Value, fadeValue: Animated.Value) => ({
    opacity: fadeValue,
    transform: [{ translateY: slideValue }],
  }),
};

// ====== MICRO-ANIMATIONS FOR TOP-TIER UX ======

// Spring Physics Configurations
// Using friction/tension only (React Native Animated.spring compatible)
export const SpringConfigs = {
  gentle: {
    friction: 26,
    tension: 170,
  },
  bouncy: {
    friction: 10,
    tension: 300,
  },
  snappy: {
    friction: 30,
    tension: 500,
  },
  wobbly: {
    friction: 12,
    tension: 180,
  },
};

// Micro-Animation Presets for Top-Tier UX
export const MicroAnimations = {
  // Button Press - Scales down slightly on press
  buttonPress: (animatedValue: Animated.Value) => {
    return Animated.spring(animatedValue, {
      toValue: 0.95,
      ...SpringConfigs.snappy,
      useNativeDriver: shouldUseNativeDriver(),
    });
  },

  buttonRelease: (animatedValue: Animated.Value) => {
    return Animated.spring(animatedValue, {
      toValue: 1,
      ...SpringConfigs.bouncy,
      useNativeDriver: shouldUseNativeDriver(),
    });
  },

  // Card Hover/Focus - Subtle lift effect
  cardLift: (animatedValue: Animated.Value) => {
    return Animated.spring(animatedValue, {
      toValue: 1,
      ...SpringConfigs.gentle,
      useNativeDriver: shouldUseNativeDriver(),
    });
  },

  cardRest: (animatedValue: Animated.Value) => {
    return Animated.spring(animatedValue, {
      toValue: 0,
      ...SpringConfigs.gentle,
      useNativeDriver: shouldUseNativeDriver(),
    });
  },

  // List Item Entrance - Stagger effect
  listItemEntrance: (animatedValue: Animated.Value, delay: number = 0) => {
    return Animated.timing(animatedValue, {
      toValue: 1,
      duration: 400,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: shouldUseNativeDriver(),
    });
  },

  // Success Bounce - For confirmations
  successBounce: (animatedValue: Animated.Value) => {
    return Animated.sequence([
      Animated.spring(animatedValue, {
        toValue: 1.2,
        ...SpringConfigs.bouncy,
        useNativeDriver: shouldUseNativeDriver(),
      }),
      Animated.spring(animatedValue, {
        toValue: 1,
        ...SpringConfigs.gentle,
        useNativeDriver: shouldUseNativeDriver(),
      }),
    ]);
  },

  // Error Shake - For validation errors
  errorShake: (animatedValue: Animated.Value) => {
    return Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: -8,
        duration: 50,
        easing: Easing.linear,
        useNativeDriver: shouldUseNativeDriver(),
      }),
      Animated.timing(animatedValue, {
        toValue: 8,
        duration: 50,
        easing: Easing.linear,
        useNativeDriver: shouldUseNativeDriver(),
      }),
      Animated.timing(animatedValue, {
        toValue: -8,
        duration: 50,
        easing: Easing.linear,
        useNativeDriver: shouldUseNativeDriver(),
      }),
      Animated.timing(animatedValue, {
        toValue: 8,
        duration: 50,
        easing: Easing.linear,
        useNativeDriver: shouldUseNativeDriver(),
      }),
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 50,
        easing: Easing.linear,
        useNativeDriver: shouldUseNativeDriver(),
      }),
    ]);
  },

  // Smooth Height Expand - For dropdowns
  expandHeight: (animatedValue: Animated.Value, toValue: number) => {
    return Animated.spring(animatedValue, {
      toValue,
      ...SpringConfigs.gentle,
      useNativeDriver: false, // Height animations can't use native driver
    });
  },

  // Fade and Slide Up - For modals
  modalSlideUp: (animatedValue: Animated.Value) => {
    return Animated.spring(animatedValue, {
      toValue: 0,
      ...SpringConfigs.gentle,
      useNativeDriver: shouldUseNativeDriver(),
    });
  },

  modalSlideDown: (animatedValue: Animated.Value) => {
    return Animated.spring(animatedValue, {
      toValue: 500,
      ...SpringConfigs.snappy,
      useNativeDriver: shouldUseNativeDriver(),
    });
  },

  // Rotate Icon - For dropdowns, chevrons
  rotateIcon: (animatedValue: Animated.Value, toValue: number) => {
    return Animated.spring(animatedValue, {
      toValue,
      ...SpringConfigs.snappy,
      useNativeDriver: shouldUseNativeDriver(),
    });
  },

  // Shimmer Loading
  shimmer: (animatedValue: Animated.Value) => {
    return Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1200,
          easing: Easing.linear,
          useNativeDriver: shouldUseNativeDriver(),
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 0,
          easing: Easing.linear,
          useNativeDriver: shouldUseNativeDriver(),
        }),
      ])
    );
  },

  // Progress Bar Fill
  progressFill: (animatedValue: Animated.Value, toValue: number) => {
    return Animated.timing(animatedValue, {
      toValue,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // Width animations can't use native driver
    });
  },

  // Tab Switch - Smooth indicator movement
  tabIndicator: (animatedValue: Animated.Value, toValue: number) => {
    return Animated.spring(animatedValue, {
      toValue,
      ...SpringConfigs.snappy,
      useNativeDriver: shouldUseNativeDriver(),
    });
  },

  // Notification Badge Pulse
  badgePulse: (animatedValue: Animated.Value) => {
    return Animated.loop(
      Animated.sequence([
        Animated.spring(animatedValue, {
          toValue: 1.15,
          ...SpringConfigs.wobbly,
          useNativeDriver: shouldUseNativeDriver(),
        }),
        Animated.spring(animatedValue, {
          toValue: 1,
          ...SpringConfigs.gentle,
          useNativeDriver: shouldUseNativeDriver(),
        }),
        Animated.delay(1500),
      ])
    );
  },
};

// Gesture-based Animations
export const GestureAnimations = {
  // Swipe to dismiss
  swipeToDismiss: (animatedValue: Animated.Value, velocity: number) => {
    return Animated.decay(animatedValue, {
      velocity,
      deceleration: 0.997,
      useNativeDriver: shouldUseNativeDriver(),
    });
  },

  // Snap back to position
  snapBack: (animatedValue: Animated.Value) => {
    return Animated.spring(animatedValue, {
      toValue: 0,
      ...SpringConfigs.bouncy,
      useNativeDriver: shouldUseNativeDriver(),
    });
  },

  // Pull to refresh
  pullToRefresh: (animatedValue: Animated.Value, threshold: number) => {
    return Animated.spring(animatedValue, {
      toValue: threshold,
      ...SpringConfigs.gentle,
      useNativeDriver: shouldUseNativeDriver(),
    });
  },
};

// Page Transition Animations
export const PageTransitions = {
  slideLeft: (animatedValue: Animated.Value) => {
    return Animated.spring(animatedValue, {
      toValue: 0,
      ...SpringConfigs.snappy,
      useNativeDriver: shouldUseNativeDriver(),
    });
  },

  slideRight: (animatedValue: Animated.Value) => {
    return Animated.spring(animatedValue, {
      toValue: 0,
      ...SpringConfigs.snappy,
      useNativeDriver: shouldUseNativeDriver(),
    });
  },

  fadeInUp: (fadeValue: Animated.Value, slideValue: Animated.Value) => {
    return Animated.parallel([
      Animated.timing(fadeValue, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: shouldUseNativeDriver(),
      }),
      Animated.spring(slideValue, {
        toValue: 0,
        ...SpringConfigs.gentle,
        useNativeDriver: shouldUseNativeDriver(),
      }),
    ]);
  },

  scaleFromCenter: (animatedValue: Animated.Value) => {
    return Animated.spring(animatedValue, {
      toValue: 1,
      ...SpringConfigs.bouncy,
      useNativeDriver: shouldUseNativeDriver(),
    });
  },
};

// Interpolation Helpers
export const AnimationInterpolations = {
  scale: (animatedValue: Animated.Value, inputRange: number[] = [0, 1], outputRange: number[] = [0.8, 1]) => {
    return animatedValue.interpolate({
      inputRange,
      outputRange,
      extrapolate: 'clamp',
    });
  },

  translateY: (animatedValue: Animated.Value, inputRange: number[] = [0, 1], outputRange: number[] = [50, 0]) => {
    return animatedValue.interpolate({
      inputRange,
      outputRange,
      extrapolate: 'clamp',
    });
  },

  rotate: (animatedValue: Animated.Value, inputRange: number[] = [0, 1], outputRange: string[] = ['0deg', '180deg']) => {
    return animatedValue.interpolate({
      inputRange,
      outputRange,
      extrapolate: 'clamp',
    });
  },

  opacity: (animatedValue: Animated.Value, inputRange: number[] = [0, 1], outputRange: number[] = [0, 1]) => {
    return animatedValue.interpolate({
      inputRange,
      outputRange,
      extrapolate: 'clamp',
    });
  },
};

export default {
  AnimationPresets,
  AnimationHelper,
  useAnimation,
  AnimationStyles,
  MicroAnimations,
  GestureAnimations,
  PageTransitions,
  AnimationInterpolations,
  SpringConfigs,
};
