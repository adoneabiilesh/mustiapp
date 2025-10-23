import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  Animated,
  Dimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/lib/designSystem';
import { Icons } from '@/lib/icons';
import { getImageSource } from '@/lib/imageUtils';
import { MenuItemCard, MenuCategory, MenuSearch, MenuFilter } from '@/components/MenuComponents';
import { LoadingComponents } from '@/components/LoadingComponents';

const { width, height } = Dimensions.get('window');

const RestaurantDetail = () => {
  const { restaurantId } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['all']));
  
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // Mock restaurant data
  const restaurant = {
    id: restaurantId || '1',
    name: 'Musti Place Restaurant',
    rating: 4.5,
    reviewCount: 120,
    deliveryTime: '25-35 min',
    deliveryFee: 2.99,
    minimumOrder: 15.00,
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
    isOpen: true,
    distance: '0.8 km',
    description: 'Authentic Italian cuisine with fresh ingredients and traditional recipes passed down through generations.',
    categories: ['Italian', 'Pizza', 'Pasta'],
    address: '123 Main Street, Rome, Italy',
    phone: '+39 06 1234 5678',
    hours: {
      monday: '11:00 AM - 10:00 PM',
      tuesday: '11:00 AM - 10:00 PM',
      wednesday: '11:00 AM - 10:00 PM',
      thursday: '11:00 AM - 10:00 PM',
      friday: '11:00 AM - 11:00 PM',
      saturday: '11:00 AM - 11:00 PM',
      sunday: '12:00 PM - 9:00 PM',
    },
  };
  
  // Mock menu data
  const menuCategories = [
    {
      id: 'appetizers',
      name: 'Appetizers',
      description: 'Start your meal with our delicious appetizers',
      itemCount: 8,
    },
    {
      id: 'pizza',
      name: 'Pizza',
      description: 'Authentic Italian pizzas made with fresh ingredients',
      itemCount: 12,
    },
    {
      id: 'pasta',
      name: 'Pasta',
      description: 'Traditional Italian pasta dishes',
      itemCount: 10,
    },
    {
      id: 'desserts',
      name: 'Desserts',
      description: 'Sweet endings to your meal',
      itemCount: 6,
    },
  ];
  
  const menuItems = [
    {
      id: '1',
      name: 'Margherita Pizza',
      description: 'Classic pizza with tomato sauce, mozzarella, and fresh basil',
      price: 12.99,
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b',
      rating: 4.8,
      reviewCount: 45,
      isPopular: true,
      isVegetarian: true,
      preparationTime: '15-20 min',
      calories: 320,
      category: 'pizza',
    },
    {
      id: '2',
      name: 'Spaghetti Carbonara',
      description: 'Traditional Roman pasta with eggs, cheese, and pancetta',
      price: 14.99,
      image: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5',
      rating: 4.6,
      reviewCount: 32,
      isPopular: false,
      isVegetarian: false,
      preparationTime: '12-15 min',
      calories: 450,
      category: 'pasta',
    },
    // Add more menu items...
  ];
  
  const filters = [
    { id: 'all', label: 'All', active: selectedCategory === 'all' },
    { id: 'vegetarian', label: 'Vegetarian', active: selectedCategory === 'vegetarian' },
    { id: 'vegan', label: 'Vegan', active: selectedCategory === 'vegan' },
    { id: 'gluten-free', label: 'Gluten Free', active: selectedCategory === 'gluten-free' },
    { id: 'spicy', label: 'Spicy', active: selectedCategory === 'spicy' },
  ];
  
  const handleCategoryToggle = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };
  
  const handleFilterPress = (filterId: string) => {
    setSelectedCategory(filterId);
  };
  
  const handleMenuItemPress = (itemId: string) => {
    router.push(`/item-detail?id=${itemId}`);
  };
  
  const handleAddToCart = (itemId: string) => {
    // Add to cart logic
    console.log('Added to cart:', itemId);
  };
  
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, -50],
    extrapolate: 'clamp',
  });
  
  if (loading) {
    return <LoadingComponents.FullScreenLoader text="Loading restaurant..." />;
  }
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.neutral[50] }}>
      {/* Header */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          backgroundColor: '#FFFFFF',
          opacity: headerOpacity,
          transform: [{ translateY: headerTranslateY }],
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: Spacing.md,
            paddingVertical: Spacing.sm,
            borderBottomWidth: 1,
            borderBottomColor: Colors.neutral[200],
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: BorderRadius.full,
              backgroundColor: Colors.neutral[100],
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icons.ArrowBack size={20} color={Colors.neutral[600]} />
          </TouchableOpacity>
          
          <Text style={[Typography.h5, { color: Colors.neutral[900] }]}>
            {restaurant.name}
          </Text>
          
          <TouchableOpacity
            style={{
              width: 40,
              height: 40,
              borderRadius: BorderRadius.full,
              backgroundColor: Colors.neutral[100],
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icons.Star size={20} color={Colors.neutral[600]} />
          </TouchableOpacity>
        </View>
      </Animated.View>
      
      <ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Restaurant Hero */}
        <View style={{ position: 'relative' }}>
          <Image
            source={getImageSource(restaurant.image, restaurant.name)}
            style={{
              width: '100%',
              height: 250,
            }}
            resizeMode="cover"
          />
          
          {/* Overlay */}
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              padding: Spacing.lg,
            }}
          >
            <Text style={[Typography.h2, { color: '#FFFFFF', marginBottom: Spacing.sm }]}>
              {restaurant.name}
            </Text>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm }}>
              <Icons.Star size={16} color="#FFD700" />
              <Text style={[Typography.body1, { color: '#FFFFFF', marginLeft: Spacing.xs }]}>
                {restaurant.rating} ({restaurant.reviewCount} reviews)
              </Text>
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icons.Clock size={16} color="#FFFFFF" />
              <Text style={[Typography.body2, { color: '#FFFFFF', marginLeft: Spacing.xs }]}>
                {restaurant.deliveryTime} • {restaurant.deliveryFee === 0 ? 'Free delivery' : `€${restaurant.deliveryFee} delivery`}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Restaurant Info */}
        <View style={{ backgroundColor: '#FFFFFF', padding: Spacing.lg }}>
          <Text style={[Typography.body1, { color: Colors.neutral[700], marginBottom: Spacing.md }]}>
            {restaurant.description}
          </Text>
          
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: Spacing.md }}>
            {restaurant.categories.map((category, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: Colors.primary[100],
                  borderRadius: BorderRadius.sm,
                  paddingHorizontal: Spacing.sm,
                  paddingVertical: Spacing.xs,
                  marginRight: Spacing.sm,
                  marginBottom: Spacing.sm,
                }}
              >
                <Text style={[Typography.caption, { color: Colors.primary[700] }]}>
                  {category}
                </Text>
              </View>
            ))}
          </View>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text style={[Typography.label, { color: Colors.neutral[600], marginBottom: Spacing.xs }]}>
                Address
              </Text>
              <Text style={[Typography.body2, { color: Colors.neutral[700] }]}>
                {restaurant.address}
              </Text>
            </View>
            
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text style={[Typography.label, { color: Colors.neutral[600], marginBottom: Spacing.xs }]}>
                Phone
              </Text>
              <Text style={[Typography.body2, { color: Colors.neutral[700] }]}>
                {restaurant.phone}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Menu Search */}
        <MenuSearch
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search menu items..."
        />
        
        {/* Menu Filters */}
        <MenuFilter filters={filters} onFilterPress={handleFilterPress} />
        
        {/* Menu Categories */}
        <View style={{ padding: Spacing.md }}>
          {menuCategories.map((category) => (
            <MenuCategory
              key={category.id}
              category={category}
              isExpanded={expandedCategories.has(category.id)}
              onToggle={() => handleCategoryToggle(category.id)}
            >
              {menuItems
                .filter(item => item.category === category.id)
                .map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    onPress={() => handleMenuItemPress(item.id)}
                    onAddToCart={() => handleAddToCart(item.id)}
                  />
                ))}
            </MenuCategory>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RestaurantDetail;
