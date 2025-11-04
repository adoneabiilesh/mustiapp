import {View, Text, TouchableOpacity, ActivityIndicator} from 'react-native'
import React from 'react'
import {CustomButtonProps} from "@/type";
import { cn } from "@/lib/utils";

const CustomButton = ({
    onPress,
    title="Click Me",
    style,
    textStyle,
    leftIcon,
    isLoading = false,
    disabled = false
}: CustomButtonProps) => {
    const handlePress = () => {
        console.log('🔘 Button pressed:', title);
        if (onPress && !disabled && !isLoading) {
            onPress();
        }
    };

    return (
        <TouchableOpacity 
            className={cn(
                'custom-btn', 
                (disabled || isLoading) && 'opacity-50',
                style
            )} 
            onPress={handlePress}
            disabled={disabled || isLoading}
            activeOpacity={0.7}
            style={{ 
                ...(disabled || isLoading ? { opacity: 0.5 } : {}),
            }}
        >
            {leftIcon}

            <View className="flex-center flex-row gap-2">
                {isLoading ? (
                    <ActivityIndicator size="small" color="white" />
                ): (
                    <Text className={cn('text-white paragraph-bold', textStyle)}>
                        {title}
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    )
}

export default CustomButton
