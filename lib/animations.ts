import { Animated, Easing } from 'react-native';

// Professional Animation Presets
export const AnimationPresets = {
  // Fade Animations
  fadeIn: {
    toValue: 1,
    duration: 300,
    easing: Easing.out(Easing.quad),
  },
  
  fadeOut: {
    toValue: 0,
    duration: 200,
    easing: Easing.in(Easing.quad),
  },
  
  // Scale Animations
  scaleIn: {
    toValue: 1,
    duration: 300,
    easing: Easing.out(Easing.back(1.2)),
  },
  
  scaleOut: {
    toValue: 0,
    duration: 200,
    easing: Easing.in(Easing.back(1.2)),
  },
  
  // Slide Animations
  slideInFromRight: {
    toValue: 0,
    duration: 300,
    easing: Easing.out(Easing.cubic),
  },
  
  slideInFromLeft: {
    toValue: 0,
    duration: 300,
    easing: Easing.out(Easing.cubic),
  },
  
  slideInFromBottom: {
    toValue: 0,
    duration: 300,
    easing: Easing.out(Easing.cubic),
  },
  
  slideInFromTop: {
    toValue: 0,
    duration: 300,
    easing: Easing.out(Easing.cubic),
  },
  
  // Bounce Animations
  bounceIn: {
    toValue: 1,
    duration: 400,
    easing: Easing.out(Easing.bounce),
  },
  
  bounceOut: {
    toValue: 0,
    duration: 300,
    easing: Easing.in(Easing.bounce),
  },
  
  // Spring Animations
  springIn: {
    toValue: 1,
    duration: 300,
    easing: Easing.out(Easing.elastic(1)),
  },
  
  springOut: {
    toValue: 0,
    duration: 200,
    easing: Easing.in(Easing.elastic(1)),
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
      useNativeDriver: true,
    });
  }
  
  // Create fade out animation
  static fadeOut(animatedValue: Animated.Value, duration: number = 200) {
    return Animated.timing(animatedValue, {
      toValue: 0,
      duration,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    });
  }
  
  // Create scale animation
  static scale(animatedValue: Animated.Value, toValue: number, duration: number = 300) {
    return Animated.timing(animatedValue, {
      toValue,
      duration,
      easing: Easing.out(Easing.back(1.2)),
      useNativeDriver: true,
    });
  }
  
  // Create slide animation
  static slide(animatedValue: Animated.Value, toValue: number, duration: number = 300) {
    return Animated.timing(animatedValue, {
      toValue,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
  }
  
  // Create bounce animation
  static bounce(animatedValue: Animated.Value, toValue: number, duration: number = 400) {
    return Animated.timing(animatedValue, {
      toValue,
      duration,
      easing: Easing.out(Easing.bounce),
      useNativeDriver: true,
    });
  }
  
  // Create spring animation
  static spring(animatedValue: Animated.Value, toValue: number, duration: number = 300) {
    return Animated.timing(animatedValue, {
      toValue,
      duration,
      easing: Easing.out(Easing.elastic(1)),
      useNativeDriver: true,
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
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
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
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: -10,
        duration: 50,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 10,
        duration: 50,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 50,
        easing: Easing.linear,
        useNativeDriver: true,
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
        useNativeDriver: true,
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

export default {
  AnimationPresets,
  AnimationHelper,
  useAnimation,
  AnimationStyles,
};
