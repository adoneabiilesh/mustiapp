import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { OrderStatusIcons, IconSizes, IconColors, IconHelpers } from '../lib/iconSystem';

interface StatusIconProps {
  status: string;
  size?: keyof typeof IconSizes;
  showLabel?: boolean;
  style?: any;
}

export const StatusIcon: React.FC<StatusIconProps> = ({
  status,
  size = 'md',
  showLabel = false,
  style,
}) => {
  const IconComponent = IconHelpers.getStatusIcon(status);
  
  const getStatusColor = (status: string) => {
    const statusColors = {
      pending: IconColors.warning,
      confirmed: IconColors.info,
      preparing: IconColors.primary,
      outForDelivery: IconColors.info,
      delivered: IconColors.success,
      cancelled: IconColors.error,
    };
    return statusColors[status as keyof typeof statusColors] || IconColors.gray500;
  };
  
  const getStatusLabel = (status: string) => {
    const statusLabels = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      preparing: 'Preparing',
      outForDelivery: 'Out for Delivery',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };
    return statusLabels[status as keyof typeof statusLabels] || status;
  };
  
  const statusColor = getStatusColor(status);
  
  return (
    <View style={[styles.container, style]}>
      <View style={[styles.iconContainer, { backgroundColor: statusColor + '20' }]}>
        <IconComponent 
          size={IconSizes[size]} 
          color={statusColor} 
        />
      </View>
      {showLabel && (
        <Text style={[styles.label, { color: statusColor }]}>
          {getStatusLabel(status)}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default StatusIcon;
