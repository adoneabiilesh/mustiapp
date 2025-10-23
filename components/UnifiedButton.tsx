import React from 'react';
import { TouchableOpacity, Text, View, ActivityIndicator } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../lib/designSystem';

interface UnifiedButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: any;
}

export const UnifiedButton: React.FC<UnifiedButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  style,
}) => {
  const getButtonStyle = () => {
    const baseStyle = {
      borderRadius: BorderRadius.lg,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      flexDirection: 'row' as const,
      ...Shadows.sm,
    };

    // Size styles
    const sizeStyles = {
      small: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        minHeight: 36,
      },
      medium: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        minHeight: 44,
      },
      large: {
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.lg,
        minHeight: 52,
      },
    };

    // Variant styles
    const variantStyles = {
      primary: {
        backgroundColor: Colors.primary[500],
        borderWidth: 0,
      },
      secondary: {
        backgroundColor: Colors.secondary[500],
        borderWidth: 0,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: Colors.primary[500],
      },
      ghost: {
        backgroundColor: 'transparent',
        borderWidth: 0,
      },
    };

    const disabledStyle = disabled ? {
      backgroundColor: Colors.neutral[200],
      borderColor: Colors.neutral[300],
    } : {};

    const fullWidthStyle = fullWidth ? {
      width: '100%',
    } : {};

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...disabledStyle,
      ...fullWidthStyle,
      ...style,
    };
  };

  const getTextStyle = () => {
    const baseTextStyle = {
      fontWeight: '600' as const,
      textAlign: 'center' as const,
    };

    // Size text styles
    const sizeTextStyles = {
      small: {
        ...Typography.label,
      },
      medium: {
        ...Typography.button,
      },
      large: {
        ...Typography.h6,
      },
    };

    // Variant text styles
    const variantTextStyles = {
      primary: {
        color: '#FFFFFF',
      },
      secondary: {
        color: '#FFFFFF',
      },
      outline: {
        color: Colors.primary[500],
      },
      ghost: {
        color: Colors.primary[500],
      },
    };

    const disabledTextStyle = disabled ? {
      color: Colors.neutral[500],
    } : {};

    return {
      ...baseTextStyle,
      ...sizeTextStyles[size],
      ...variantTextStyles[variant],
      ...disabledTextStyle,
    };
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' || variant === 'ghost' ? Colors.primary[500] : '#FFFFFF'} 
        />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {icon && (
            <View style={{ marginRight: Spacing.sm }}>
              {icon}
            </View>
          )}
          <Text style={getTextStyle()}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default UnifiedButton;
