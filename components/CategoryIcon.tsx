import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FoodCategoryIcons, IconSizes, IconColors, IconHelpers } from '../lib/iconSystem';

interface CategoryIconProps {
  category: string;
  size?: keyof typeof IconSizes;
  showLabel?: boolean;
  style?: any;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  category,
  size = 'lg',
  showLabel = false,
  style,
}) => {
  const IconComponent = IconHelpers.getCategoryIcon(category);
  const categoryColor = IconHelpers.getCategoryColor(category);
  
  return (
    <View style={[styles.container, style]}>
      <View style={[styles.iconContainer, { backgroundColor: categoryColor + '20' }]}>
        <IconComponent 
          size={IconSizes[size]} 
          color={categoryColor} 
        />
      </View>
      {showLabel && (
        <Text style={[styles.label, { color: categoryColor }]}>
          {category.charAt(0).toUpperCase() + category.slice(1)}
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
    width: 48,
    height: 48,
    borderRadius: 24,
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

export default CategoryIcon;
