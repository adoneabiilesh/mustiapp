import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/lib/designSystem';
import { AnimationHelper, AnimationStyles } from '@/lib/animations';
import { Icons } from '@/lib/icons';

const { width } = Dimensions.get('window');

// Professional Toast Notification
export const Toast: React.FC<{
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onHide: () => void;
  position?: 'top' | 'bottom';
}> = ({
  visible,
  message,
  type = 'info',
  duration = 3000,
  onHide,
  position = 'top',
}) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Auto hide
      const timer = setTimeout(() => {
        hideToast();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [visible]);
  
  const hideToast = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: position === 'top' ? -100 : 100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };
  
  const getToastStyle = () => {
    const baseStyle = {
      backgroundColor: '#FFFFFF',
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      marginHorizontal: Spacing.md,
      marginTop: position === 'top' ? StatusBar.currentHeight || 0 : 0,
      marginBottom: position === 'bottom' ? Spacing.md : 0,
      ...Shadows.lg,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      borderLeftWidth: 4,
    };
    
    switch (type) {
      case 'success':
        return { ...baseStyle, borderLeftColor: Colors.success[500] };
      case 'error':
        return { ...baseStyle, borderLeftColor: Colors.error[500] };
      case 'warning':
        return { ...baseStyle, borderLeftColor: Colors.warning[500] };
      default:
        return { ...baseStyle, borderLeftColor: Colors.primary[500] };
    }
  };
  
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <Icons.Check size={20} color={Colors.success[500]} />;
      case 'error':
        return <Icons.Close size={20} color={Colors.error[500]} />;
      case 'warning':
        return <Icons.Warning size={20} color={Colors.warning[500]} />;
      default:
        return <Icons.Info size={20} color={Colors.primary[500]} />;
    }
  };
  
  if (!visible) return null;
  
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: position === 'top' ? 0 : undefined,
          bottom: position === 'bottom' ? 0 : undefined,
          left: 0,
          right: 0,
          zIndex: 1000,
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={getToastStyle()}>
        {getIcon()}
        <Text
          style={[
            Typography.body2,
            { color: Colors.neutral[700], flex: 1, marginLeft: Spacing.sm },
          ]}
        >
          {message}
        </Text>
        <TouchableOpacity onPress={hideToast} style={{ marginLeft: Spacing.sm }}>
          <Icons.Close size={16} color={Colors.neutral[400]} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

// Professional Alert Dialog
export const AlertDialog: React.FC<{
  visible: boolean;
  title: string;
  message: string;
  buttons: Array<{
    text: string;
    onPress: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>;
  onDismiss: () => void;
}> = ({ visible, title, message, buttons, onDismiss }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);
  
  if (!visible) return null;
  
  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        opacity: fadeAnim,
      }}
    >
      <Animated.View
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: BorderRadius.lg,
          padding: Spacing.xl,
          margin: Spacing.lg,
          minWidth: width * 0.8,
          maxWidth: width * 0.9,
          transform: [{ scale: scaleAnim }],
        }}
      >
        <Text style={[Typography.h3, { color: Colors.neutral[900], marginBottom: Spacing.md }]}>
          {title}
        </Text>
        <Text style={[Typography.body1, { color: Colors.neutral[600], marginBottom: Spacing.xl }]}>
          {message}
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.sm }}>
          {buttons.map((button, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                button.onPress();
                onDismiss();
              }}
              style={{
                paddingHorizontal: Spacing.lg,
                paddingVertical: Spacing.sm,
                borderRadius: BorderRadius.md,
                backgroundColor: button.style === 'destructive' 
                  ? Colors.error[500] 
                  : button.style === 'cancel' 
                    ? Colors.neutral[200] 
                    : Colors.primary[500],
              }}
            >
              <Text
                style={[
                  Typography.button,
                  {
                    color: button.style === 'cancel' 
                      ? Colors.neutral[700] 
                      : '#FFFFFF',
                  },
                ]}
              >
                {button.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </Animated.View>
  );
};

// Professional Banner Notification
export const Banner: React.FC<{
  visible: boolean;
  title: string;
  message?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  action?: {
    text: string;
    onPress: () => void;
  };
  onDismiss: () => void;
}> = ({ visible, title, message, type = 'info', action, onDismiss }) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  
  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);
  
  const getBannerStyle = () => {
    const baseStyle = {
      padding: Spacing.md,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      borderLeftWidth: 4,
    };
    
    switch (type) {
      case 'success':
        return { ...baseStyle, backgroundColor: Colors.success[50], borderLeftColor: Colors.success[500] };
      case 'error':
        return { ...baseStyle, backgroundColor: Colors.error[50], borderLeftColor: Colors.error[500] };
      case 'warning':
        return { ...baseStyle, backgroundColor: Colors.warning[50], borderLeftColor: Colors.warning[500] };
      default:
        return { ...baseStyle, backgroundColor: Colors.primary[50], borderLeftColor: Colors.primary[500] };
    }
  };
  
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <Icons.Check size={20} color={Colors.success[600]} />;
      case 'error':
        return <Icons.Close size={20} color={Colors.error[600]} />;
      case 'warning':
        return <Icons.Warning size={20} color={Colors.warning[600]} />;
      default:
        return <Icons.Info size={20} color={Colors.primary[600]} />;
    }
  };
  
  if (!visible) return null;
  
  return (
    <Animated.View
      style={{
        transform: [{ translateY: slideAnim }],
        marginTop: StatusBar.currentHeight || 0,
      }}
    >
      <View style={getBannerStyle()}>
        {getIcon()}
        <View style={{ flex: 1, marginLeft: Spacing.sm }}>
          <Text style={[Typography.label, { color: Colors.neutral[900] }]}>
            {title}
          </Text>
          {message && (
            <Text style={[Typography.caption, { color: Colors.neutral[600], marginTop: 2 }]}>
              {message}
            </Text>
          )}
        </View>
        {action && (
          <TouchableOpacity onPress={action.onPress} style={{ marginLeft: Spacing.sm }}>
            <Text style={[Typography.label, { color: Colors.primary[600] }]}>
              {action.text}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={onDismiss} style={{ marginLeft: Spacing.sm }}>
          <Icons.Close size={16} color={Colors.neutral[400]} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

// Professional Notification Manager
export class NotificationManager {
  private static instance: NotificationManager;
  private toasts: Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    duration: number;
  }> = [];
  
  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }
  
  showToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration: number = 3000) {
    const id = Date.now().toString();
    this.toasts.push({ id, message, type, duration });
    // In a real app, this would trigger a state update in a context provider
    console.log('Toast:', { id, message, type, duration });
  }
  
  showSuccess(message: string, duration?: number) {
    this.showToast(message, 'success', duration);
  }
  
  showError(message: string, duration?: number) {
    this.showToast(message, 'error', duration);
  }
  
  showWarning(message: string, duration?: number) {
    this.showToast(message, 'warning', duration);
  }
  
  showInfo(message: string, duration?: number) {
    this.showToast(message, 'info', duration);
  }
}

export default {
  Toast,
  AlertDialog,
  Banner,
  NotificationManager,
};
