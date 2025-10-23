import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '@/lib/theme';
import { ComponentStyles } from '@/lib/theme';

interface ProfessionalCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

export const ProfessionalCard: React.FC<ProfessionalCardProps> = ({
  children,
  variant = 'default',
  padding = 'medium',
  style,
}) => {
  const { spacing } = useTheme();

  const getPaddingStyle = () => {
    const paddingMap = {
      none: 0,
      small: spacing.sm,
      medium: spacing.md,
      large: spacing.lg,
    };
    return { padding: paddingMap[padding] };
  };

  return (
    <View style={[ComponentStyles.card[variant], getPaddingStyle(), style]}>
      {children}
    </View>
  );
};
