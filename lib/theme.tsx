import React, { createContext, useContext, useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import { Typography } from './typography';
import { Colors, Spacing, BorderRadius, Shadows } from './designSystem';

interface ThemeContextType {
  fontsLoaded: boolean;
  typography: typeof Typography;
  colors: typeof Colors;
  spacing: typeof Spacing;
  borderRadius: typeof BorderRadius;
  shadows: typeof Shadows;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [fontsLoaded] = useFonts({
    'Quicksand-Regular': require('../assets/fonts/Quicksand-Regular.ttf'),
    'Quicksand-Medium': require('../assets/fonts/Quicksand-Medium.ttf'),
    'Quicksand-SemiBold': require('../assets/fonts/Quicksand-SemiBold.ttf'),
    'Quicksand-Bold': require('../assets/fonts/Quicksand-Bold.ttf'),
    'Quicksand-Light': require('../assets/fonts/Quicksand-Light.ttf'),
  });

  const theme = {
    fontsLoaded,
    typography: Typography,
    colors: Colors,
    spacing: Spacing,
    borderRadius: BorderRadius,
    shadows: Shadows,
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

// Professional Component Styles
export const ComponentStyles = {
  // Button Styles
  button: {
    primary: {
      backgroundColor: Colors.primary[500],
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      borderRadius: BorderRadius.lg,
      ...Shadows.md,
    },
    secondary: {
      backgroundColor: Colors.neutral[100],
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: Colors.neutral[300],
    },
    success: {
      backgroundColor: Colors.success[500],
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      borderRadius: BorderRadius.lg,
      ...Shadows.md,
    },
    danger: {
      backgroundColor: Colors.error[500],
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      borderRadius: BorderRadius.lg,
      ...Shadows.md,
    },
  },

  // Card Styles
  card: {
    default: {
      backgroundColor: 'white',
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      ...Shadows.sm,
    },
    elevated: {
      backgroundColor: 'white',
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      ...Shadows.lg,
    },
    outlined: {
      backgroundColor: 'white',
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      borderWidth: 1,
      borderColor: Colors.neutral[200],
    },
  },

  // Input Styles
  input: {
    default: {
      backgroundColor: 'white',
      borderWidth: 1,
      borderColor: Colors.neutral[300],
      borderRadius: BorderRadius.md,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      ...Typography.body1,
    },
    focused: {
      backgroundColor: 'white',
      borderWidth: 2,
      borderColor: Colors.primary[500],
      borderRadius: BorderRadius.md,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      ...Typography.body1,
    },
    error: {
      backgroundColor: 'white',
      borderWidth: 1,
      borderColor: Colors.error[500],
      borderRadius: BorderRadius.md,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      ...Typography.body1,
    },
  },

  // Header Styles
  header: {
    default: {
      backgroundColor: 'white',
      paddingVertical: Spacing.lg,
      paddingHorizontal: Spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: Colors.neutral[200],
      ...Shadows.sm,
    },
    transparent: {
      backgroundColor: 'transparent',
      paddingVertical: Spacing.lg,
      paddingHorizontal: Spacing.lg,
    },
  },

  // Tab Styles
  tab: {
    active: {
      backgroundColor: Colors.primary[50],
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.md,
      borderRadius: BorderRadius.md,
    },
    inactive: {
      backgroundColor: 'transparent',
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.md,
      borderRadius: BorderRadius.md,
    },
  },
};
