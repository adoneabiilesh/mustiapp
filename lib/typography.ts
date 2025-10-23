// Professional typography system for food app
export const Typography = {
  // Font families
  fontFamily: {
    primary: 'System', // iOS: SF Pro, Android: Roboto
    secondary: 'System',
    mono: 'Courier New',
  },
  
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
  },
  
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // Font weights
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  
  // Text styles
  styles: {
    h1: {
      fontSize: 36,
      fontWeight: '700',
      lineHeight: 1.2,
    },
    h2: {
      fontSize: 30,
      fontWeight: '600',
      lineHeight: 1.3,
    },
    h3: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 1.4,
    },
    h4: {
      fontSize: 20,
      fontWeight: '500',
      lineHeight: 1.4,
    },
    h5: {
      fontSize: 18,
      fontWeight: '500',
      lineHeight: 1.5,
    },
    h6: {
      fontSize: 16,
      fontWeight: '500',
      lineHeight: 1.5,
    },
    body: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 1.5,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 1.5,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 1.4,
    },
    button: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 1.2,
    },
    price: {
      fontSize: 20,
      fontWeight: '700',
      lineHeight: 1.2,
    },
    priceLarge: {
      fontSize: 24,
      fontWeight: '700',
      lineHeight: 1.2,
    },
  },
};

// Spacing system
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 96,
};

// Border radius
export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

// Shadows
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