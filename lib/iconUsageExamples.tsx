// Professional Icon System Usage Examples
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icons, IconSizes, IconColors, IconHelpers } from './iconSystem';
import { IconButton, CategoryIcon, StatusIcon } from '../components';

// Example: Using Icons directly
export const DirectIconUsage = () => (
  <View style={styles.container}>
    <Icons.Star size={IconSizes.lg} color={IconColors.primary} />
    <Icons.Heart size={IconSizes.md} color={IconColors.error} />
    <Icons.ShoppingCart size={IconSizes.xl} color={IconColors.secondary} />
  </View>
);

// Example: Using IconButton component
export const IconButtonUsage = () => (
  <View style={styles.container}>
    <IconButton
      icon="Heart"
      onPress={() => console.log('Heart pressed')}
      size="lg"
      color="primary"
      text="Add to Favorites"
    />
    
    <IconButton
      icon="ShoppingCart"
      onPress={() => console.log('Cart pressed')}
      size="md"
      color="secondary"
      variant="outline"
    />
    
    <IconButton
      icon="Settings"
      onPress={() => console.log('Settings pressed')}
      size="sm"
      color="gray600"
      variant="ghost"
    />
  </View>
);

// Example: Using CategoryIcon component
export const CategoryIconUsage = () => (
  <View style={styles.container}>
    <CategoryIcon category="pizza" size="lg" showLabel />
    <CategoryIcon category="burger" size="md" showLabel />
    <CategoryIcon category="salad" size="lg" showLabel />
  </View>
);

// Example: Using StatusIcon component
export const StatusIconUsage = () => (
  <View style={styles.container}>
    <StatusIcon status="pending" size="md" showLabel />
    <StatusIcon status="preparing" size="lg" showLabel />
    <StatusIcon status="delivered" size="md" showLabel />
  </View>
);

// Example: Using IconHelpers
export const IconHelpersUsage = () => {
  const categoryIcon = IconHelpers.getCategoryIcon('pizza');
  const statusIcon = IconHelpers.getStatusIcon('delivered');
  const categoryColor = IconHelpers.getCategoryColor('pizza');
  
  return (
    <View style={styles.container}>
      <categoryIcon size={IconSizes.lg} color={categoryColor} />
      <statusIcon size={IconSizes.md} color={IconColors.success} />
    </View>
  );
};

// Example: Food Category Grid
export const FoodCategoryGrid = () => {
  const categories = ['pizza', 'burger', 'salad', 'dessert', 'coffee', 'healthy'];
  
  return (
    <View style={styles.grid}>
      {categories.map((category) => (
        <CategoryIcon
          key={category}
          category={category}
          size="lg"
          showLabel
        />
      ))}
    </View>
  );
};

// Example: Order Status Timeline
export const OrderStatusTimeline = () => {
  const statuses = ['pending', 'confirmed', 'preparing', 'outForDelivery', 'delivered'];
  
  return (
    <View style={styles.timeline}>
      {statuses.map((status) => (
        <StatusIcon
          key={status}
          status={status}
          size="md"
          showLabel
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 16,
  },
  timeline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
});

export default {
  DirectIconUsage,
  IconButtonUsage,
  CategoryIconUsage,
  StatusIconUsage,
  IconHelpersUsage,
  FoodCategoryGrid,
  OrderStatusTimeline,
};
