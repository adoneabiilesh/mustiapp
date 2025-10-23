import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/lib/designSystem';
import { Icons } from '@/lib/icons';
import { getImageSource } from '@/lib/imageUtils';

// Professional Menu Item Card
export const MenuItemCard: React.FC<{
  item: {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    rating?: number;
    reviewCount?: number;
    isPopular?: boolean;
    isVegetarian?: boolean;
    isVegan?: boolean;
    isGlutenFree?: boolean;
    isSpicy?: boolean;
    preparationTime?: string;
    calories?: number;
  };
  onPress: () => void;
  onAddToCart: () => void;
  quantity?: number;
}> = ({ item, onPress, onAddToCart, quantity = 0 }) => {
  const [isPressed, setIsPressed] = useState(false);
  
  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.md,
        ...Shadows.sm,
        transform: [{ scale: isPressed ? 0.98 : 1 }],
      }}
    >
      <View style={{ flexDirection: 'row', padding: Spacing.md }}>
        {/* Menu Item Image */}
        <View style={{ position: 'relative' }}>
          <Image
            source={getImageSource(item.image, item.name)}
            style={{
              width: 80,
              height: 80,
              borderRadius: BorderRadius.md,
            }}
            resizeMode="cover"
          />
          
          {/* Popular Badge */}
          {item.isPopular && (
            <View
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                backgroundColor: Colors.warning[500],
                borderRadius: BorderRadius.full,
                paddingHorizontal: Spacing.xs,
                paddingVertical: 2,
              }}
            >
              <Text style={[Typography.small, { color: '#FFFFFF' }]}>
                Popular
              </Text>
            </View>
          )}
        </View>
        
        {/* Menu Item Info */}
        <View style={{ flex: 1, marginLeft: Spacing.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={[Typography.h6, { color: Colors.neutral[900], marginBottom: Spacing.xs }]}>
                {item.name}
              </Text>
              
              <Text style={[Typography.caption, { color: Colors.neutral[600], marginBottom: Spacing.sm }]}>
                {item.description}
              </Text>
              
              {/* Dietary Info */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: Spacing.sm }}>
                {item.isVegetarian && (
                  <View style={[styles.dietaryBadge, { backgroundColor: Colors.success[100] }]}>
                    <Text style={[Typography.small, { color: Colors.success[700] }]}>V</Text>
                  </View>
                )}
                {item.isVegan && (
                  <View style={[styles.dietaryBadge, { backgroundColor: Colors.success[100] }]}>
                    <Text style={[Typography.small, { color: Colors.success[700] }]}>VG</Text>
                  </View>
                )}
                {item.isGlutenFree && (
                  <View style={[styles.dietaryBadge, { backgroundColor: Colors.primary[100] }]}>
                    <Text style={[Typography.small, { color: Colors.primary[700] }]}>GF</Text>
                  </View>
                )}
                {item.isSpicy && (
                  <View style={[styles.dietaryBadge, { backgroundColor: Colors.error[100] }]}>
                    <Text style={[Typography.small, { color: Colors.error[700] }]}>🌶️</Text>
                  </View>
                )}
              </View>
              
              {/* Rating and Reviews */}
              {item.rating && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm }}>
                  <Icons.Star size={12} color="#FFD700" />
                  <Text style={[Typography.caption, { color: Colors.neutral[700], marginLeft: 2 }]}>
                    {item.rating.toFixed(1)}
                  </Text>
                  {item.reviewCount && (
                    <Text style={[Typography.caption, { color: Colors.neutral[500], marginLeft: 4 }]}>
                      ({item.reviewCount})
                    </Text>
                  )}
                </View>
              )}
              
              {/* Additional Info */}
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {item.preparationTime && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: Spacing.md }}>
                    <Icons.Clock size={12} color={Colors.neutral[500]} />
                    <Text style={[Typography.caption, { color: Colors.neutral[500], marginLeft: 2 }]}>
                      {item.preparationTime}
                    </Text>
                  </View>
                )}
                {item.calories && (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icons.Flame size={12} color={Colors.neutral[500]} />
                    <Text style={[Typography.caption, { color: Colors.neutral[500], marginLeft: 2 }]}>
                      {item.calories} cal
                    </Text>
                  </View>
                )}
              </View>
            </View>
            
            {/* Price and Add Button */}
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[Typography.h5, { color: Colors.neutral[900], marginBottom: Spacing.sm }]}>
                €{item.price.toFixed(2)}
              </Text>
              
              {quantity > 0 ? (
                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => {/* Decrease quantity */}}
                  >
                    <Icons.Minus size={16} color={Colors.neutral[600]} />
                  </TouchableOpacity>
                  <Text style={[Typography.label, { color: Colors.neutral[900], marginHorizontal: Spacing.sm }]}>
                    {quantity}
                  </Text>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => {/* Increase quantity */}}
                  >
                    <Icons.Plus size={16} color={Colors.neutral[600]} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={onAddToCart}
                  style={styles.addButton}
                >
                  <Text style={[Typography.label, { color: '#FFFFFF' }]}>
                    Add
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Professional Menu Category
export const MenuCategory: React.FC<{
  category: {
    id: string;
    name: string;
    description?: string;
    itemCount: number;
  };
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ category, children, isExpanded, onToggle }) => {
  return (
    <View style={{ marginBottom: Spacing.lg }}>
      <TouchableOpacity
        onPress={onToggle}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: BorderRadius.lg,
          padding: Spacing.md,
          marginBottom: Spacing.sm,
          ...Shadows.sm,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={[Typography.h5, { color: Colors.neutral[900], marginBottom: Spacing.xs }]}>
              {category.name}
            </Text>
            {category.description && (
              <Text style={[Typography.body2, { color: Colors.neutral[600] }]}>
                {category.description}
              </Text>
            )}
            <Text style={[Typography.caption, { color: Colors.neutral[500], marginTop: Spacing.xs }]}>
              {category.itemCount} items
            </Text>
          </View>
          <Icons.ChevronDown
            size={20}
            color={Colors.neutral[500]}
            style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }}
          />
        </View>
      </TouchableOpacity>
      
      {isExpanded && children}
    </View>
  );
};

// Professional Menu Search
export const MenuSearch: React.FC<{
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
}> = ({ value, onChangeText, placeholder = 'Search menu items...', onFilterPress }) => (
  <View
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      borderRadius: BorderRadius.lg,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      marginHorizontal: Spacing.md,
      marginVertical: Spacing.sm,
      ...Shadows.sm,
    }}
  >
    <Icons.Search size={20} color={Colors.neutral[500]} />
    <TextInput
      style={[
        Typography.body1,
        {
          flex: 1,
          marginLeft: Spacing.sm,
          color: Colors.neutral[900],
        },
      ]}
      placeholder={placeholder}
      placeholderTextColor={Colors.neutral[500]}
      value={value}
      onChangeText={onChangeText}
    />
    {onFilterPress && (
      <TouchableOpacity onPress={onFilterPress} style={{ marginLeft: Spacing.sm }}>
        <Icons.Filter size={20} color={Colors.neutral[500]} />
      </TouchableOpacity>
    )}
  </View>
);

// Professional Menu Filter
export const MenuFilter: React.FC<{
  filters: Array<{
    id: string;
    label: string;
    icon?: string;
    active: boolean;
  }>;
  onFilterPress: (filterId: string) => void;
}> = ({ filters, onFilterPress }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={{ paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm }}
  >
    {filters.map((filter) => (
      <TouchableOpacity
        key={filter.id}
        onPress={() => onFilterPress(filter.id)}
        style={{
          backgroundColor: filter.active ? Colors.primary[500] : Colors.neutral[100],
          borderRadius: BorderRadius.full,
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.sm,
          marginRight: Spacing.sm,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        {filter.icon && (
          <Icons.Star size={16} color={filter.active ? '#FFFFFF' : Colors.neutral[600]} />
        )}
        <Text
          style={[
            Typography.label,
            {
              color: filter.active ? '#FFFFFF' : Colors.neutral[600],
              marginLeft: filter.icon ? Spacing.xs : 0,
            },
          ]}
        >
          {filter.label}
        </Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
);

// Styles
const styles = {
  dietaryBadge: {
    width: 20,
    height: 20,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[100],
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  quantityButton: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    backgroundColor: Colors.primary[500],
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
};

export default {
  MenuItemCard,
  MenuCategory,
  MenuSearch,
  MenuFilter,
};
