import React from 'react';
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

// Professional Restaurant Card
export const RestaurantCard: React.FC<{
  restaurant: {
    id: string;
    name: string;
    rating: number;
    reviewCount: number;
    deliveryTime: string;
    deliveryFee: number;
    image: string;
    categories: string[];
    isOpen: boolean;
    distance?: string;
  };
  onPress: () => void;
}> = ({ restaurant, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      backgroundColor: '#FFFFFF',
      borderRadius: BorderRadius.lg,
      marginBottom: Spacing.md,
      ...Shadows.sm,
    }}
  >
    {/* Restaurant Image */}
    <View style={{ position: 'relative' }}>
      <Image
        source={getImageSource(restaurant.image, restaurant.name)}
        style={{
          width: '100%',
          height: 200,
          borderTopLeftRadius: BorderRadius.lg,
          borderTopRightRadius: BorderRadius.lg,
        }}
        resizeMode="cover"
      />
      
      {/* Rating Badge */}
      <View
        style={{
          position: 'absolute',
          top: Spacing.sm,
          right: Spacing.sm,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          borderRadius: BorderRadius.md,
          paddingHorizontal: Spacing.sm,
          paddingVertical: 4,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <Icons.Star size={12} color="#FFD700" />
        <Text style={[Typography.caption, { color: '#FFFFFF', marginLeft: 2 }]}>
          {restaurant.rating.toFixed(1)}
        </Text>
      </View>
      
      {/* Open/Closed Badge */}
      <View
        style={{
          position: 'absolute',
          top: Spacing.sm,
          left: Spacing.sm,
          backgroundColor: restaurant.isOpen ? Colors.success[500] : Colors.error[500],
          borderRadius: BorderRadius.md,
          paddingHorizontal: Spacing.sm,
          paddingVertical: 4,
        }}
      >
        <Text style={[Typography.caption, { color: '#FFFFFF' }]}>
          {restaurant.isOpen ? 'Open' : 'Closed'}
        </Text>
      </View>
    </View>
    
    {/* Restaurant Info */}
    <View style={{ padding: Spacing.md }}>
      <Text style={[Typography.h5, { color: Colors.neutral[900], marginBottom: Spacing.xs }]}>
        {restaurant.name}
      </Text>
      
      {/* Categories */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: Spacing.sm }}>
        {restaurant.categories.slice(0, 3).map((category, index) => (
          <View
            key={index}
            style={{
              backgroundColor: Colors.neutral[100],
              borderRadius: BorderRadius.sm,
              paddingHorizontal: Spacing.sm,
              paddingVertical: 2,
              marginRight: Spacing.xs,
              marginBottom: Spacing.xs,
            }}
          >
            <Text style={[Typography.caption, { color: Colors.neutral[600] }]}>
              {category}
            </Text>
          </View>
        ))}
      </View>
      
      {/* Rating and Reviews */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: Spacing.md }}>
          <Icons.Star size={14} color="#FFD700" />
          <Text style={[Typography.body2, { color: Colors.neutral[700], marginLeft: 2 }]}>
            {restaurant.rating.toFixed(1)}
          </Text>
          <Text style={[Typography.caption, { color: Colors.neutral[500], marginLeft: 4 }]}>
            ({restaurant.reviewCount})
          </Text>
        </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Icons.Clock size={14} color={Colors.neutral[500]} />
          <Text style={[Typography.caption, { color: Colors.neutral[500], marginLeft: 2 }]}>
            {restaurant.deliveryTime}
          </Text>
        </View>
      </View>
      
      {/* Delivery Info */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Icons.Truck size={14} color={Colors.neutral[500]} />
          <Text style={[Typography.caption, { color: Colors.neutral[500], marginLeft: 2 }]}>
            {restaurant.deliveryFee === 0 ? 'Free delivery' : `€${restaurant.deliveryFee.toFixed(2)} delivery`}
          </Text>
        </View>
        
        {restaurant.distance && (
          <Text style={[Typography.caption, { color: Colors.neutral[500] }]}>
            {restaurant.distance}
          </Text>
        )}
      </View>
    </View>
  </TouchableOpacity>
);

// Professional Restaurant List
export const RestaurantList: React.FC<{
  restaurants: Array<{
    id: string;
    name: string;
    rating: number;
    reviewCount: number;
    deliveryTime: string;
    deliveryFee: number;
    image: string;
    categories: string[];
    isOpen: boolean;
    distance?: string;
  }>;
  onRestaurantPress: (restaurantId: string) => void;
  loading?: boolean;
}> = ({ restaurants, onRestaurantPress, loading = false }) => {
  if (loading) {
    return (
      <View>
        {Array.from({ length: 3 }).map((_, index) => (
          <View
            key={index}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: BorderRadius.lg,
              marginBottom: Spacing.md,
              padding: Spacing.md,
              ...Shadows.sm,
            }}
          >
            <View style={{ height: 200, backgroundColor: Colors.neutral[200], borderRadius: BorderRadius.md, marginBottom: Spacing.md }} />
            <View style={{ height: 16, backgroundColor: Colors.neutral[200], borderRadius: BorderRadius.sm, marginBottom: Spacing.sm }} />
            <View style={{ height: 14, backgroundColor: Colors.neutral[200], borderRadius: BorderRadius.sm, width: '60%' }} />
          </View>
        ))}
      </View>
    );
  }
  
  return (
    <View>
      {restaurants.map((restaurant) => (
        <RestaurantCard
          key={restaurant.id}
          restaurant={restaurant}
          onPress={() => onRestaurantPress(restaurant.id)}
        />
      ))}
    </View>
  );
};

// Professional Restaurant Filter
export const RestaurantFilter: React.FC<{
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

// Professional Restaurant Search Bar
export const RestaurantSearchBar: React.FC<{
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
}> = ({ value, onChangeText, placeholder = 'Search restaurants...', onFilterPress }) => (
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

// Professional Restaurant Categories
export const RestaurantCategories: React.FC<{
  categories: Array<{
    id: string;
    name: string;
    icon: string;
    count: number;
    active: boolean;
  }>;
  onCategoryPress: (categoryId: string) => void;
}> = ({ categories, onCategoryPress }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={{ paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm }}
  >
    {categories.map((category) => (
      <TouchableOpacity
        key={category.id}
        onPress={() => onCategoryPress(category.id)}
        style={{
          alignItems: 'center',
          marginRight: Spacing.lg,
          minWidth: 80,
        }}
      >
        <View
          style={{
            width: 60,
            height: 60,
            borderRadius: BorderRadius.full,
            backgroundColor: category.active ? Colors.primary[100] : Colors.neutral[100],
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: Spacing.sm,
          }}
        >
          <Icons.Star size={24} color={category.active ? Colors.primary[500] : Colors.neutral[500]} />
        </View>
        <Text
          style={[
            Typography.caption,
            {
              color: category.active ? Colors.primary[600] : Colors.neutral[600],
              textAlign: 'center',
            },
          ]}
        >
          {category.name}
        </Text>
        <Text
          style={[
            Typography.small,
            {
              color: Colors.neutral[400],
              textAlign: 'center',
              marginTop: 2,
            },
          ]}
        >
          {category.count}
        </Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
);

// Export individual components
export {
  RestaurantCard,
  RestaurantList,
  RestaurantFilter,
  RestaurantSearchBar,
  RestaurantCategories,
};

export default {
  RestaurantCard,
  RestaurantList,
  RestaurantFilter,
  RestaurantSearchBar,
  RestaurantCategories,
};
