import React from 'react';
import { Text, TextProps, StyleSheet, Platform } from 'react-native';
import { Colors } from '../lib/designSystem';

// Unified Typography System
export const UnifiedTypography = {
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
  
  // Small text
  small: {
    fontFamily: Platform.OS === 'ios' ? 'Quicksand-Regular' : 'Quicksand-Regular',
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '400' as const,
  },
  
  // Button text
  button: {
    fontFamily: Platform.OS === 'ios' ? 'Quicksand-SemiBold' : 'Quicksand-SemiBold',
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '600' as const,
  },
  
  // Price text
  price: {
    fontFamily: Platform.OS === 'ios' ? 'Quicksand-Bold' : 'Quicksand-Bold',
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700' as const,
  },
  
  priceLarge: {
    fontFamily: Platform.OS === 'ios' ? 'Quicksand-Bold' : 'Quicksand-Bold',
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '700' as const,
  },
};

export type UnifiedTextVariant = keyof typeof UnifiedTypography;

interface UnifiedTextProps extends TextProps {
  variant?: UnifiedTextVariant;
  color?: string;
  align?: 'left' | 'center' | 'right';
  children: React.ReactNode;
}

export const UnifiedText: React.FC<UnifiedTextProps> = ({
  variant = 'body1',
  color = Colors.neutral[900],
  align = 'left',
  style,
  children,
  ...props
}) => {
  const typographyStyle = UnifiedTypography[variant];
  
  const combinedStyle = [
    typographyStyle,
    {
      color,
      textAlign: align,
    },
    style,
  ];

  return (
    <Text style={combinedStyle} {...props}>
      {children}
    </Text>
  );
};

// Convenience components for common use cases
export const DisplayText: React.FC<Omit<UnifiedTextProps, 'variant'>> = (props) => (
  <UnifiedText variant="display" {...props} />
);

export const Heading1: React.FC<Omit<UnifiedTextProps, 'variant'>> = (props) => (
  <UnifiedText variant="h1" {...props} />
);

export const Heading2: React.FC<Omit<UnifiedTextProps, 'variant'>> = (props) => (
  <UnifiedText variant="h2" {...props} />
);

export const Heading3: React.FC<Omit<UnifiedTextProps, 'variant'>> = (props) => (
  <UnifiedText variant="h3" {...props} />
);

export const Heading4: React.FC<Omit<UnifiedTextProps, 'variant'>> = (props) => (
  <UnifiedText variant="h4" {...props} />
);

export const Heading5: React.FC<Omit<UnifiedTextProps, 'variant'>> = (props) => (
  <UnifiedText variant="h5" {...props} />
);

export const Heading6: React.FC<Omit<UnifiedTextProps, 'variant'>> = (props) => (
  <UnifiedText variant="h6" {...props} />
);

export const BodyText: React.FC<Omit<UnifiedTextProps, 'variant'>> = (props) => (
  <UnifiedText variant="body1" {...props} />
);

export const BodyText2: React.FC<Omit<UnifiedTextProps, 'variant'>> = (props) => (
  <UnifiedText variant="body2" {...props} />
);

export const LabelText: React.FC<Omit<UnifiedTextProps, 'variant'>> = (props) => (
  <UnifiedText variant="label" {...props} />
);

export const CaptionText: React.FC<Omit<UnifiedTextProps, 'variant'>> = (props) => (
  <UnifiedText variant="caption" {...props} />
);

export const SmallText: React.FC<Omit<UnifiedTextProps, 'variant'>> = (props) => (
  <UnifiedText variant="small" {...props} />
);

export const ButtonText: React.FC<Omit<UnifiedTextProps, 'variant'>> = (props) => (
  <UnifiedText variant="button" {...props} />
);

export const PriceText: React.FC<Omit<UnifiedTextProps, 'variant'>> = (props) => (
  <UnifiedText variant="price" {...props} />
);

export const PriceLargeText: React.FC<Omit<UnifiedTextProps, 'variant'>> = (props) => (
  <UnifiedText variant="priceLarge" {...props} />
);

export default UnifiedText;
