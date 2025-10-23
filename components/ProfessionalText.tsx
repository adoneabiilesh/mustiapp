import React from 'react';
import { Text, TextStyle } from 'react-native';
import { useTheme } from '@/lib/theme';

interface ProfessionalTextProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2' | 'body3' | 'label' | 'caption' | 'overline' | 'button' | 'buttonSmall' | 'price' | 'priceLarge';
  color?: string;
  align?: 'left' | 'center' | 'right';
  style?: TextStyle;
}

export const ProfessionalText: React.FC<ProfessionalTextProps> = ({
  children,
  variant = 'body1',
  color,
  align = 'left',
  style,
}) => {
  const { typography, colors } = useTheme();

  const getTextStyle = () => {
    const baseStyle = typography[variant];
    return {
      ...baseStyle,
      color: color || colors.neutral[900],
      textAlign: align,
    };
  };

  return (
    <Text style={[getTextStyle(), style]}>
      {children}
    </Text>
  );
};
