import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../lib/designSystem';
import { Icons } from '../lib/icons';
import { Address } from '../store/address.store';

interface AddressCardProps {
  address: Address;
  onEdit?: () => void;
  onDelete?: () => void;
  onSelect?: () => void;
  showActions?: boolean;
  isSelected?: boolean;
  variant?: 'default' | 'compact' | 'minimal';
}

export const AddressCard: React.FC<AddressCardProps> = ({
  address,
  onEdit,
  onDelete,
  onSelect,
  showActions = true,
  isSelected = false,
  variant = 'default',
}) => {
  const getAddressTypeIcon = (type?: string) => {
    switch (type) {
      case 'home':
        return <Icons.Home size={16} color={Colors.primary[500]} />;
      case 'work':
        return <Icons.Briefcase size={16} color={Colors.primary[500]} />;
      default:
        return <Icons.Location size={16} color={Colors.primary[500]} />;
    }
  };

  const getAddressTypeLabel = (type?: string) => {
    switch (type) {
      case 'home':
        return 'Home';
      case 'work':
        return 'Work';
      default:
        return 'Other';
    }
  };

  const getFullAddress = () => {
    const parts = [
      address.street,
      address.apartment && `Apt ${address.apartment}`,
      address.city,
      address.state,
      address.zip,
      address.country,
    ].filter(Boolean);
    
    return parts.join(', ');
  };

  if (variant === 'minimal') {
    return (
      <View style={[
        styles.minimalContainer,
        isSelected && styles.selectedContainer
      ]}>
        <View style={styles.minimalContent}>
          {getAddressTypeIcon(address.type)}
          <Text style={[Typography.body2, { color: Colors.neutral[700], marginLeft: Spacing.sm }]}>
            {getFullAddress()}
          </Text>
        </View>
        {isSelected && (
          <Icons.Check size={16} color={Colors.primary[500]} />
        )}
      </View>
    );
  }

  if (variant === 'compact') {
    return (
      <TouchableOpacity
        style={[
          styles.compactContainer,
          isSelected && styles.selectedContainer
        ]}
        onPress={onSelect}
        activeOpacity={0.7}
      >
        <View style={styles.compactContent}>
          <View style={styles.compactHeader}>
            {getAddressTypeIcon(address.type)}
            <Text style={[Typography.label, { color: Colors.primary[600], marginLeft: Spacing.xs }]}>
              {getAddressTypeLabel(address.type)}
            </Text>
            {address.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={[Typography.caption, { color: '#FFFFFF' }]}>
                  Default
                </Text>
              </View>
            )}
          </View>
          <Text style={[Typography.body2, { color: Colors.neutral[700], marginTop: Spacing.xs }]}>
            {getFullAddress()}
          </Text>
          {address.landmark && (
            <Text style={[Typography.caption, { color: Colors.neutral[500], marginTop: Spacing.xs }]}>
              Near: {address.landmark}
            </Text>
          )}
        </View>
        {isSelected && (
          <Icons.Check size={20} color={Colors.primary[500]} />
        )}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[
      styles.defaultContainer,
      isSelected && styles.selectedContainer
    ]}>
      <View style={styles.defaultContent}>
        <View style={styles.defaultHeader}>
          <View style={styles.typeContainer}>
            {getAddressTypeIcon(address.type)}
            <Text style={[Typography.label, { color: Colors.primary[600], marginLeft: Spacing.xs }]}>
              {getAddressTypeLabel(address.type)}
            </Text>
            {address.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={[Typography.caption, { color: '#FFFFFF' }]}>
                  Default
                </Text>
              </View>
            )}
          </View>
          
          {showActions && (
            <View style={styles.actionsContainer}>
              {onEdit && (
                <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
                  <Icons.Edit size={16} color={Colors.neutral[600]} />
                </TouchableOpacity>
              )}
              {onDelete && (
                <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
                  <Icons.Trash size={16} color={Colors.error[500]} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        <View style={styles.addressDetails}>
          <Text style={[Typography.body1, { color: Colors.neutral[900], marginBottom: Spacing.xs }]}>
            {address.fullName || 'No name provided'}
          </Text>
          <Text style={[Typography.body2, { color: Colors.neutral[700], marginBottom: Spacing.xs }]}>
            {getFullAddress()}
          </Text>
          {address.phoneNumber && (
            <Text style={[Typography.body2, { color: Colors.neutral[600], marginBottom: Spacing.xs }]}>
              📞 {address.phoneNumber}
            </Text>
          )}
          {address.landmark && (
            <Text style={[Typography.caption, { color: Colors.neutral[500] }]}>
              Near: {address.landmark}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Minimal variant
  minimalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  minimalContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  // Compact variant
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  compactContent: {
    flex: 1,
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },

  // Default variant
  defaultContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  defaultContent: {
    padding: Spacing.lg,
  },
  defaultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  defaultBadge: {
    backgroundColor: Colors.primary[500],
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  addressDetails: {
    // No additional styles needed
  },

  // Common styles
  selectedContainer: {
    borderColor: Colors.primary[500],
    backgroundColor: Colors.primary[50],
  },
});

export default AddressCard;
