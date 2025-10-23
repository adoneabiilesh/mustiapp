// Professional color palette for food app
export const Colors = {
  // Primary brand colors
  primary: {
    50: '#FEF7ED',
    100: '#FED7AA',
    200: '#FDB46B',
    300: '#FD8C2C',
    400: '#FD6B0A',
    500: '#E65100', // Main orange
    600: '#CC4700',
    700: '#B33D00',
    800: '#993300',
    900: '#802900',
  },
  
  // Secondary colors
  secondary: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
  
  // Success colors
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
  
  // Warning colors
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
  
  // Error colors
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
  
  // Neutral colors
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
  
  // Food-specific colors
  food: {
    red: '#DC2626',      // Tomato, meat
    green: '#16A34A',    // Vegetables, herbs
    yellow: '#F59E0B',   // Cheese, bread
    brown: '#92400E',   // Coffee, chocolate
    pink: '#EC4899',    // Strawberry, salmon
    purple: '#7C3AED',  // Grapes, eggplant
  },
};

// Semantic color mapping
export const SemanticColors = {
  background: Colors.neutral[50],
  surface: Colors.neutral[100],
  text: Colors.neutral[900],
  textSecondary: Colors.neutral[600],
  border: Colors.neutral[200],
  primary: Colors.primary[500],
  success: Colors.success[500],
  warning: Colors.warning[500],
  error: Colors.error[500],
};

// Gradient definitions
export const Gradients = {
  primary: ['#E65100', '#FF6B35'],
  secondary: ['#64748B', '#475569'],
  success: ['#22C55E', '#16A34A'],
  warning: ['#F59E0B', '#D97706'],
  error: ['#EF4444', '#DC2626'],
  food: ['#FF6B35', '#F7931E'],
};
