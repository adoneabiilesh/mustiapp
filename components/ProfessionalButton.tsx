import React from 'react';
import { TouchableOpacity, Text, View, ActivityIndicator } from 'react-native';
import { useTheme } from '@/lib/theme';
import { ComponentStyles } from '@/lib/theme';

interface ProfessionalButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: any;
}

export const ProfessionalButton: React.FC<ProfessionalButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  style,
}) => {
  const { typography, colors } = useTheme();

  const getButtonStyle = () => {
    const baseStyle = ComponentStyles.button[variant];
    const sizeStyle = {
      small: { paddingVertical: 8, paddingHorizontal: 16 },
      medium: { paddingVertical: 12, paddingHorizontal: 24 },
      large: { paddingVertical: 16, paddingHorizontal: 32 },
    };
    
    return {
      ...baseStyle,
      ...sizeStyle[size],
      opacity: disabled ? 0.6 : 1,
      width: fullWidth ? '100%' : 'auto',
    };
  };

  const getTextStyle = () => {
    const sizeStyle = {
      small: typography.buttonSmall,
      medium: typography.button,
      large: typography.button,
    };
    
    return {
      ...sizeStyle[size],
      color: variant === 'secondary' ? colors.neutral[700] : 'white',
      textAlign: 'center' as const,
    };
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        {loading ? (
          <ActivityIndicator 
            size="small" 
            color={variant === 'secondary' ? colors.neutral[700] : 'white'} 
          />
        ) : (
          <>
            {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
            <Text style={getTextStyle()}>{title}</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};
