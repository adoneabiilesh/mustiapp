import React, { useState } from 'react';
import { TextInput, View, Text, TextInputProps } from 'react-native';
import { useTheme } from '@/lib/theme';
import { ComponentStyles } from '@/lib/theme';
import { ProfessionalText } from './ProfessionalText';

interface ProfessionalInputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'focused' | 'error';
}

export const ProfessionalInput: React.FC<ProfessionalInputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  variant = 'default',
  style,
  ...props
}) => {
  const { colors, spacing } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const getInputStyle = () => {
    const baseStyle = ComponentStyles.input[variant];
    const focusStyle = isFocused ? ComponentStyles.input.focused : {};
    const errorStyle = error ? ComponentStyles.input.error : {};
    
    return {
      ...baseStyle,
      ...focusStyle,
      ...errorStyle,
      flexDirection: 'row',
      alignItems: 'center',
    };
  };

  const getContainerStyle = () => ({
    marginBottom: spacing.md,
  });

  return (
    <View style={getContainerStyle()}>
      {label && (
        <ProfessionalText variant="label" style={{ marginBottom: spacing.xs }}>
          {label}
        </ProfessionalText>
      )}
      
      <View style={getInputStyle()}>
        {leftIcon && (
          <View style={{ marginRight: spacing.sm }}>
            {leftIcon}
          </View>
        )}
        
        <TextInput
          style={{
            flex: 1,
            fontSize: 16,
            color: colors.neutral[900],
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor={colors.neutral[500]}
          {...props}
        />
        
        {rightIcon && (
          <View style={{ marginLeft: spacing.sm }}>
            {rightIcon}
          </View>
        )}
      </View>
      
      {error && (
        <ProfessionalText variant="caption" color={colors.error[500]} style={{ marginTop: spacing.xs }}>
          {error}
        </ProfessionalText>
      )}
      
      {helperText && !error && (
        <ProfessionalText variant="caption" color={colors.neutral[600]} style={{ marginTop: spacing.xs }}>
          {helperText}
        </ProfessionalText>
      )}
    </View>
  );
};
