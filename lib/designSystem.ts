import { Platform } from 'react-native';

// Design System - Musti App Brand Colors
export const Colors = {
  // Primary Brand Color - Peach/Coral Orange
  primary: {
    50: '#FFF5F0',
    100: '#FFE8DB',
    200: '#FFCFB3',
    300: '#FFB68A',
    400: '#FF9F66', // Main brand color
    500: '#FF9F66',
    600: '#FF8C42',
    700: '#E85D00',
    800: '#B84800',
    900: '#8A3600',
  },
  
  // Background Colors
  background: {
    primary: '#F5EDE4',  // Warm beige/cream
    card: '#FFFFFF',     // White cards
    secondary: '#FAF7F3', // Lighter variation
  },
  
  // Text Colors
  text: {
    primary: '#2D1B12',   // Dark brown
    secondary: '#8B7966', // Medium brown
    tertiary: '#A89585',  // Light brown
    inverse: '#FFFFFF',   // White text
  },
  
  // Success Colors
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#7EC46E',
    500: '#7EC46E', // Main success color
    600: '#6AAA5B',
    700: '#558F49',
    800: '#3F7335',
    900: '#2A5622',
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
  
  // Neutral/Brown tones
  neutral: {
    50: '#FAF7F3',
    100: '#F5EDE4',
    200: '#E8DDD0',
    300: '#D4C4B5',
    400: '#B8A89A',
    500: '#8B7966',
    600: '#6B5E52',
    700: '#4A3F35',
    800: '#2D1B12',
    900: '#1A0F08',
  },
};

// Typography System
export const Typography = {
  // Display/Headings - Playfair Display (serif)
  display: {
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      web: 'Playfair Display, Georgia, serif',
    }),
    fontSize: 48,
    lineHeight: 56,
    fontWeight: '700' as const,
  },
  
  h1: {
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      web: 'Playfair Display, Georgia, serif',
    }),
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '700' as const,
  },
  
  h2: {
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      web: 'Playfair Display, Georgia, serif',
    }),
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700' as const,
  },
  
  h3: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
      web: 'SF Pro Display, -apple-system, system-ui, sans-serif',
    }),
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600' as const,
  },
  
  h4: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
      web: 'SF Pro Display, -apple-system, system-ui, sans-serif',
    }),
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600' as const,
  },
  
  // Body - SF Pro Display
  body: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
      web: 'SF Pro Display, -apple-system, system-ui, sans-serif',
    }),
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  
  bodyBold: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
      web: 'SF Pro Display, -apple-system, system-ui, sans-serif',
    }),
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600' as const,
  },
  
  // Labels & Captions
  label: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
      web: 'SF Pro Display, -apple-system, system-ui, sans-serif',
    }),
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500' as const,
  },
  
  caption: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
      web: 'SF Pro Display, -apple-system, system-ui, sans-serif',
    }),
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
  },
  
  small: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
      web: 'SF Pro Display, -apple-system, system-ui, sans-serif',
    }),
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '400' as const,
  },
};

// Spacing System
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  '2xl': 48,
  '3xl': 64,
  '4xl': 80,
};

// Border Radius - As per spec
export const BorderRadius = {
  none: 0,
  sm: 8,
  md: 12,   // Buttons
  lg: 16,   // Cards
  xl: 20,
  '2xl': 24, // Pills
  '3xl': 32,
  full: 9999,
};

// Shadows
export const Shadows = {
  sm: {
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

export default {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
};
