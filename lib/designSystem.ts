import { Platform } from 'react-native';

// Professional Color Palette - Musti Place Brand Colors
export const Colors = {
  // Primary Brand Colors - Italian Red
  primary: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#E53E3E', // Main brand color
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },
  
  // Secondary Colors - Gold/Amber for Italian theme
  secondary: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B', // Gold accent
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  
  // Success Colors
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
  },
  
  // Warning Colors
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  
  // Error Colors
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },
  
  // Neutral Colors
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  
  // Food Delivery Specific Colors
  food: {
    pizza: '#FF6B6B',
    burger: '#FF8C42',
    pasta: '#FFD93D',
    sushi: '#6BCF7F',
    salad: '#4ECDC4',
    dessert: '#A8E6CF',
    coffee: '#8B4513',
    healthy: '#98D8C8',
  },
  
  // Status Colors
  status: {
    pending: '#F59E0B',
    confirmed: '#3B82F6',
    preparing: '#8B5CF6',
    outForDelivery: '#06B6D4',
    delivered: '#10B981',
    cancelled: '#EF4444',
  },
};

// Professional Typography System
export const Typography = {
  // Display Text
  display: {
    fontFamily: Platform.OS === 'ios' ? 'Quicksand-Bold' : 'Quicksand-Bold',
    fontSize: 48,
    lineHeight: 56,
    fontWeight: '700' as const,
  },
  
  // Headings
  h1: {
    fontFamily: Platform.OS === 'ios' ? 'Quicksand-Bold' : 'Quicksand-Bold',
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '700' as const,
  },
  
  h2: {
    fontFamily: Platform.OS === 'ios' ? 'Quicksand-Bold' : 'Quicksand-Bold',
    fontSize: 30,
    lineHeight: 38,
    fontWeight: '700' as const,
  },
  
  h3: {
    fontFamily: Platform.OS === 'ios' ? 'Quicksand-SemiBold' : 'Quicksand-SemiBold',
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600' as const,
  },
  
  h4: {
    fontFamily: Platform.OS === 'ios' ? 'Quicksand-SemiBold' : 'Quicksand-SemiBold',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600' as const,
  },
  
  h5: {
    fontFamily: Platform.OS === 'ios' ? 'Quicksand-Medium' : 'Quicksand-Medium',
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '500' as const,
  },
  
  h6: {
    fontFamily: Platform.OS === 'ios' ? 'Quicksand-Medium' : 'Quicksand-Medium',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500' as const,
  },
  
  // Body Text
  body1: {
    fontFamily: Platform.OS === 'ios' ? 'Quicksand-Regular' : 'Quicksand-Regular',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  
  body2: {
    fontFamily: Platform.OS === 'ios' ? 'Quicksand-Regular' : 'Quicksand-Regular',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
  },
  
  // Labels
  label: {
    fontFamily: Platform.OS === 'ios' ? 'Quicksand-Medium' : 'Quicksand-Medium',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500' as const,
  },
  
  // Captions
  caption: {
    fontFamily: Platform.OS === 'ios' ? 'Quicksand-Regular' : 'Quicksand-Regular',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
  },
  
  // Buttons
  button: {
    fontFamily: Platform.OS === 'ios' ? 'Quicksand-SemiBold' : 'Quicksand-SemiBold',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600' as const,
  },
  
  // Small Text
  small: {
    fontFamily: Platform.OS === 'ios' ? 'Quicksand-Regular' : 'Quicksand-Regular',
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '400' as const,
  },
};

// Professional Spacing System
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 80,
  '5xl': 96,
};

// Professional Border Radius
export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
};

// Professional Shadows
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Professional Component Variants
export const ComponentVariants = {
  // Button Variants
  button: {
    primary: {
      backgroundColor: Colors.primary[500],
      color: '#FFFFFF',
    },
    secondary: {
      backgroundColor: Colors.neutral[100],
      color: Colors.neutral[900],
    },
    success: {
      backgroundColor: Colors.success[500],
      color: '#FFFFFF',
    },
    warning: {
      backgroundColor: Colors.warning[500],
      color: '#FFFFFF',
    },
    error: {
      backgroundColor: Colors.error[500],
      color: '#FFFFFF',
    },
    outline: {
      backgroundColor: 'transparent',
      borderColor: Colors.primary[500],
      borderWidth: 1,
      color: Colors.primary[500],
    },
  },
  
  // Card Variants
  card: {
    default: {
      backgroundColor: '#FFFFFF',
      borderRadius: BorderRadius.lg,
      ...Shadows.sm,
    },
    elevated: {
      backgroundColor: '#FFFFFF',
      borderRadius: BorderRadius.lg,
      ...Shadows.md,
    },
    outlined: {
      backgroundColor: '#FFFFFF',
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: Colors.neutral[200],
    },
  },
  
  // Input Variants
  input: {
    default: {
      backgroundColor: '#FFFFFF',
      borderColor: Colors.neutral[300],
      borderWidth: 1,
      borderRadius: BorderRadius.md,
    },
    focused: {
      backgroundColor: '#FFFFFF',
      borderColor: Colors.primary[500],
      borderWidth: 2,
      borderRadius: BorderRadius.md,
    },
    error: {
      backgroundColor: '#FFFFFF',
      borderColor: Colors.error[500],
      borderWidth: 1,
      borderRadius: BorderRadius.md,
    },
    disabled: {
      backgroundColor: Colors.neutral[100],
      borderColor: Colors.neutral[200],
      borderWidth: 1,
      borderRadius: BorderRadius.md,
    },
  },
};

// Professional Animation Durations
export const AnimationDurations = {
  fast: 150,
  normal: 300,
  slow: 500,
  slower: 750,
};

// Professional Breakpoints
export const Breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

// Professional Z-Index Scale
export const ZIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
};

export default {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
  ComponentVariants,
  AnimationDurations,
  Breakpoints,
  ZIndex,
};
