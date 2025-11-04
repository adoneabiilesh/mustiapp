import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Icons, IconSizes, IconColors, IconHelpers } from '../lib/iconSystem';

interface IconButtonProps {
  icon: keyof typeof Icons;
  onPress: () => void;
  size?: keyof typeof IconSizes;
  color?: keyof typeof IconColors | string;
  backgroundColor?: string;
  disabled?: boolean;
  style?: any;
  text?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'solid';
  fullWidth?: boolean;
  loading?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  size = 'md',
  color = 'primary',
  backgroundColor,
  disabled = false,
  style,
  text,
  variant = 'default',
  fullWidth = false,
  loading = false,
}) => {
  const IconComponent = Icons[icon];
  
  const getButtonStyle = () => {
    const baseStyle = {
      borderRadius: 8,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      flexDirection: 'row' as const,
      paddingHorizontal: 12,
      paddingVertical: 8,
      minHeight: IconSizes[size] + 16,
    };

    const variantStyles = {
      default: {
        backgroundColor: 'transparent',
        borderWidth: 0,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: typeof color === 'string' ? color : IconColors[color as keyof typeof IconColors],
      },
      ghost: {
        backgroundColor: 'transparent',
        borderWidth: 0,
      },
      solid: {
        backgroundColor: typeof color === 'string' ? color : IconColors[color as keyof typeof IconColors],
        borderWidth: 0,
      },
    };

    const disabledStyle = disabled ? {
      opacity: 0.5,
    } : {};

    const fullWidthStyle = fullWidth ? {
      width: '100%',
    } : {};

    return {
      ...baseStyle,
      ...variantStyles[variant],
      ...disabledStyle,
      ...fullWidthStyle,
      ...(backgroundColor && { backgroundColor }),
      ...style,
    };
  };

  const getIconColor = () => {
    if (disabled) return IconColors.gray400;
    if (variant === 'solid') return IconColors.white;
    return typeof color === 'string' ? color : IconColors[color as keyof typeof IconColors];
  };

  const getTextColor = () => {
    if (disabled) return IconColors.gray400;
    if (variant === 'solid') return IconColors.white;
    return typeof color === 'string' ? color : IconColors[color as keyof typeof IconColors];
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {loading ? (
          <Text style={[styles.loadingText, { color: getTextColor() }]}>...</Text>
        ) : (
          <>
            <IconComponent 
              size={IconSizes[size]} 
              color={getIconColor()} 
            />
            {text && (
              <Text style={[styles.text, { color: getTextColor() }]}>
                {text}
              </Text>
            )}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default IconButton;
