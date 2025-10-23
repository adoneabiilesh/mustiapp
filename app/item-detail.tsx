import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  SafeAreaView,
  Dimensions,
  FlatList,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { images } from '@/constants';
import { useCartStore } from '../store/cart.store';
import { getMenu, getAddons } from '../lib/supabase';
import { getImageSource } from '../lib/imageUtils';
import { Icons } from '@/lib/icons';
import { useTheme } from '@/lib/theme';
import { ProfessionalText } from '@/components/ProfessionalText';
import { ProfessionalButton } from '@/components/ProfessionalButton';
import { ProfessionalCard } from '@/components/ProfessionalCard';
import cn from 'clsx';

const { width } = Dimensions.get('window');

interface Customization {
  id: string;
  name: string;
  price: number;
  type: 'size' | 'addon' | 'spice';
}

const ItemDetail = () => {
  const { id } = useLocalSearchParams();
  const { addItem } = useCartStore();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('Medium');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [spiceLevel, setSpiceLevel] = useState('Medium');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [availableAddons, setAvailableAddons] = useState<any[]>([]);
  const [availableSizes, setAvailableSizes] = useState<any[]>([]);
  const [availableSpiceLevels, setAvailableSpiceLevels] = useState<any[]>([]);

  // Default fallback addons (will be replaced by database data)
  const defaultSizes = [
    { id: 'small', name: 'Small', price: 0 },
    { id: 'medium', name: 'Medium', price: 2 },
    { id: 'large', name: 'Large', price: 4 },
  ];

  const defaultAddons = [
    { id: 'extra_cheese', name: 'Extra Cheese', price: 1.5 },
    { id: 'bacon', name: 'Bacon', price: 2.0 },
    { id: 'avocado', name: 'Avocado', price: 1.8 },
    { id: 'jalapenos', name: 'Jalapeños', price: 0.8 },
    { id: 'onions', name: 'Extra Onions', price: 0.5 },
    { id: 'mushrooms', name: 'Mushrooms', price: 1.2 },
  ];

  const defaultSpiceLevels = [
    { id: 'mild', name: 'Mild', icon: '🌶️' },
    { id: 'medium', name: 'Medium', icon: '🌶️🌶️' },
    { id: 'hot', name: 'Hot', icon: '🌶️🌶️🌶️' },
  ];

  useEffect(() => {
    loadItem();
  }, [id]);

  const loadItem = async () => {
    try {
      setLoading(true);
      console.log('Loading item with ID:', id);
      
      // Get all menu items and find the specific one
      const items = await getMenu({ limit: 100 });
      console.log('Total items loaded:', items?.length || 0);
      console.log('Looking for item with ID:', id);
      
      const foundItem = items.find(i => i.$id === id);
      console.log('Found item:', foundItem);
      
      if (!foundItem) {
        console.log('Available item IDs:', items?.map(i => i.$id) || []);
        setItem(null);
        return;
      }
      
      setItem(foundItem);
      
      // Load addons from database
      await loadAddons(foundItem);
      
    } catch (error) {
      console.error('Error loading item:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAddons = async (product: any) => {
    try {
      console.log('Loading addons for product:', product.name);
      
      // Get all addons from database
      const allAddons = await getAddons();
      console.log('All addons from database:', allAddons);
      
      if (!allAddons || allAddons.length === 0) {
        console.log('No addons found in database, using defaults');
        setAvailableAddons(defaultAddons);
        setAvailableSizes(defaultSizes);
        setAvailableSpiceLevels(defaultSpiceLevels);
        return;
      }
      
      // Filter addons based on product's available_addons field
      const productAvailableAddons = product.available_addons || [];
      console.log('Product available addons:', productAvailableAddons);
      
      if (productAvailableAddons.length === 0) {
        console.log('No addons assigned to this product, using defaults');
        setAvailableAddons(defaultAddons);
        setAvailableSizes(defaultSizes);
        setAvailableSpiceLevels(defaultSpiceLevels);
        return;
      }
      
      // Filter addons by type and available addons
      const sizes = allAddons.filter(addon => 
        addon.type === 'size' && productAvailableAddons.includes(addon.id)
      );
      const addons = allAddons.filter(addon => 
        addon.type === 'addon' && productAvailableAddons.includes(addon.id)
      );
      const spiceLevels = allAddons.filter(addon => 
        addon.type === 'spice' && productAvailableAddons.includes(addon.id)
      );
      
      console.log('Filtered sizes:', sizes);
      console.log('Filtered addons:', addons);
      console.log('Filtered spice levels:', spiceLevels);
      
      // Set the filtered addons
      setAvailableSizes(sizes.length > 0 ? sizes : defaultSizes);
      setAvailableAddons(addons.length > 0 ? addons : defaultAddons);
      setAvailableSpiceLevels(spiceLevels.length > 0 ? spiceLevels : defaultSpiceLevels);
      
      console.log('✅ Addons loaded successfully:');
      console.log('- Sizes:', sizes.length > 0 ? sizes : 'using defaults');
      console.log('- Addons:', addons.length > 0 ? addons : 'using defaults');
      console.log('- Spice Levels:', spiceLevels.length > 0 ? spiceLevels : 'using defaults');
      
    } catch (error) {
      console.error('Error loading addons:', error);
      // Fallback to defaults
      setAvailableAddons(defaultAddons);
      setAvailableSizes(defaultSizes);
      setAvailableSpiceLevels(defaultSpiceLevels);
    }
  };

  const toggleAddon = (addonId: string) => {
    setSelectedAddons(prev => 
      prev.includes(addonId) 
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    );
  };

  const calculateTotalPrice = () => {
    if (!item) return 0;
    
    const basePrice = item.price;
    const sizePrice = sizes.find(s => s.id === selectedSize)?.price || 0;
    const addonPrice = selectedAddons.reduce((total, addonId) => {
      const addon = addons.find(a => a.id === addonId);
      return total + (addon?.price || 0);
    }, 0);
    
    return (basePrice + sizePrice + addonPrice) * quantity;
  };

  const handleAddToCart = () => {
    if (!item) return;

    const customizations = [
      { id: 'size', name: 'Size', value: selectedSize, price: sizes.find(s => s.id === selectedSize)?.price || 0 },
      ...selectedAddons.map(addonId => {
        const addon = addons.find(a => a.id === addonId);
        return { id: addonId, name: addon?.name || '', value: 'Yes', price: addon?.price || 0 };
      }),
      { id: 'spice', name: 'Spice Level', value: spiceLevel, price: 0 },
    ];

    addItem({
      id: item.$id,
      name: item.name,
      price: calculateTotalPrice() / quantity,
      image_url: item.image_url,
      customizations,
      specialInstructions,
    });

    Alert.alert('Added to Cart', `${item.name} has been added to your cart!`, [
      { text: 'Continue Shopping', onPress: () => router.back() },
      { text: 'View Cart', onPress: () => router.push('/(tabs)/cart') },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-gray-600">Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!item) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center px-5">
          <Text className="text-lg text-gray-600 mb-4">Item not found</Text>
          <TouchableOpacity
            className="bg-blue-500 px-6 py-3 rounded-lg"
            onPress={() => router.back()}
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { colors, spacing } = useTheme();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-5 pt-4 pb-6 bg-white border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
          >
            <Icons.ArrowBack size={20} color={colors.neutral[600]} />
          </TouchableOpacity>
          <ProfessionalText variant="h4" color={colors.neutral[900]}>
            Item Details
          </ProfessionalText>
          <TouchableOpacity
            onPress={() => setIsFavorite(!isFavorite)}
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
          >
            <Icons.Star 
              size={20} 
              color={isFavorite ? colors.error[500] : colors.neutral[400]} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Food Image */}
        <View className="relative bg-white">
          <Image
            source={getImageSource(item.image_url, item.name)}
            className="w-full h-80"
            resizeMode="cover"
          />
          <View className="absolute bottom-4 right-4 bg-black bg-opacity-70 rounded-full px-3 py-1">
            <ProfessionalText variant="caption" color="white">
              {currentImageIndex + 1} / 1
            </ProfessionalText>
          </View>
        </View>

        {/* Item Info */}
        <View className="p-5 bg-white">
          <View className="mb-4">
            <ProfessionalText variant="h2" color={colors.neutral[900]} style={{ marginBottom: 12 }}>
              {item.name}
            </ProfessionalText>
            
            <View className="flex-row items-center mb-4">
              <View className="flex-row items-center mr-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Icons.Star
                    key={star}
                    size={16}
                    color={star <= (item.rating || 4.5) ? colors.warning[500] : colors.neutral[300]}
                    style={{ marginRight: 2 }}
                  />
                ))}
                <ProfessionalText variant="body2" color={colors.neutral[600]} style={{ marginLeft: 8 }}>
                  {item.rating || 4.5} ★ {Math.floor(Math.random() * 200) + 50} reviews
                </ProfessionalText>
              </View>
            </View>
            
            <ProfessionalText variant="priceLarge" color={colors.success[600]}>
              €{item.price.toFixed(2)}
            </ProfessionalText>
          </View>

          <ProfessionalCard variant="outlined" padding="medium">
            <ProfessionalText variant="body1" color={colors.neutral[700]}>
              {item.description || 'Delicious food item with premium ingredients and amazing taste. Made with fresh, high-quality ingredients and prepared to perfection.'}
            </ProfessionalText>
          </ProfessionalCard>

          {/* Size Selection */}
          {availableSizes.length > 0 && (
            <View className="mt-6">
              <ProfessionalText variant="h5" color={colors.neutral[900]} style={{ marginBottom: 16 }}>
                Size Selection
              </ProfessionalText>
              <View className="flex-row space-x-3">
                {availableSizes.map((size) => (
                <TouchableOpacity
                  key={size.id}
                  onPress={() => setSelectedSize(size.id)}
                  className={cn(
                    'flex-1 p-4 rounded-xl border-2',
                    selectedSize === size.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white'
                  )}
                >
                  <ProfessionalText 
                    variant="body1" 
                    color={selectedSize === size.id ? colors.primary[600] : colors.neutral[700]}
                    align="center"
                    style={{ fontWeight: '600', marginBottom: 4 }}
                  >
                    {size.name}
                  </ProfessionalText>
                  <ProfessionalText 
                    variant="caption" 
                    color={colors.neutral[500]} 
                    align="center"
                  >
                    {size.price > 0 ? `+€${size.price.toFixed(2)}` : 'Included'}
                  </ProfessionalText>
                </TouchableOpacity>
              ))}
              </View>
            </View>
          )}

          {/* Add-ons */}
          {availableAddons.length > 0 && (
            <View className="mt-6">
              <ProfessionalText variant="h5" color={colors.neutral[900]} style={{ marginBottom: 16 }}>
                Add-ons & Toppings
              </ProfessionalText>
              <View className="space-y-3">
                {availableAddons.map((addon) => (
                <TouchableOpacity
                  key={addon.id}
                  onPress={() => toggleAddon(addon.id)}
                  className="flex-row items-center justify-between p-4 rounded-xl border border-gray-200 bg-white"
                >
                  <View className="flex-row items-center">
                    <View className={cn(
                      'w-6 h-6 rounded border-2 mr-4 items-center justify-center',
                      selectedAddons.includes(addon.id)
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    )}>
                      {selectedAddons.includes(addon.id) && (
                        <Icons.Check size={14} color="white" />
                      )}
                    </View>
                    <ProfessionalText variant="body1" color={colors.neutral[900]} style={{ fontWeight: '500' }}>
                      {addon.name}
                    </ProfessionalText>
                  </View>
                  <ProfessionalText variant="body2" color={colors.neutral[600]}>
                    +€{addon.price.toFixed(2)}
                  </ProfessionalText>
                </TouchableOpacity>
              ))}
              </View>
            </View>
          )}

          {/* Spice Level */}
          {availableSpiceLevels.length > 0 && (
            <View className="mt-6">
              <ProfessionalText variant="h5" color={colors.neutral[900]} style={{ marginBottom: 16 }}>
                Spice Level
              </ProfessionalText>
              <View className="flex-row space-x-3">
                {availableSpiceLevels.map((level) => (
                <TouchableOpacity
                  key={level.id}
                  onPress={() => setSpiceLevel(level.id)}
                  className={cn(
                    'flex-1 p-4 rounded-xl border-2',
                    spiceLevel === level.id
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 bg-white'
                  )}
                >
                  <ProfessionalText 
                    variant="h4" 
                    color={colors.neutral[900]} 
                    align="center"
                    style={{ marginBottom: 8 }}
                  >
                    {level.icon || '🌶️'}
                  </ProfessionalText>
                  <ProfessionalText 
                    variant="body1" 
                    color={spiceLevel === level.id ? colors.error[600] : colors.neutral[700]}
                    align="center"
                    style={{ fontWeight: '600' }}
                  >
                    {level.name}
                  </ProfessionalText>
                </TouchableOpacity>
              ))}
              </View>
            </View>
          )}

          {/* Special Instructions */}
          <View className="mt-6">
            <ProfessionalText variant="h5" color={colors.neutral[900]} style={{ marginBottom: 16 }}>
              Special Instructions
            </ProfessionalText>
            <ProfessionalCard variant="outlined" padding="none">
              <TextInput
                value={specialInstructions}
                onChangeText={setSpecialInstructions}
                placeholder="Any special requests? (e.g., no onions, extra sauce)"
                placeholderTextColor={colors.neutral[500]}
                className="p-4 text-base"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                style={{ color: colors.neutral[900] }}
              />
            </ProfessionalCard>
          </View>

          {/* Quantity Selector */}
          <View className="mt-6 mb-8">
            <ProfessionalText variant="h5" color={colors.neutral[900]} style={{ marginBottom: 16 }}>
              Quantity
            </ProfessionalText>
            <View className="flex-row items-center justify-between bg-white rounded-xl p-4 border border-gray-200">
              <View className="flex-row items-center">
                <TouchableOpacity
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center"
                >
                  <Icons.Minus size={20} color={colors.neutral[600]} />
                </TouchableOpacity>
                <ProfessionalText variant="h4" color={colors.neutral[900]} style={{ marginHorizontal: 24 }}>
                  {quantity}
                </ProfessionalText>
                <TouchableOpacity
                  onPress={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center"
                >
                  <Icons.Plus size={20} color={colors.neutral[600]} />
                </TouchableOpacity>
              </View>
              <ProfessionalText variant="h5" color={colors.neutral[900]}>
                Total: €{calculateTotalPrice().toFixed(2)}
              </ProfessionalText>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Add to Cart Button */}
      <View className="p-5 bg-white border-t border-gray-200">
        <ProfessionalButton
          title={`Add to Cart • €${calculateTotalPrice().toFixed(2)}`}
          onPress={handleAddToCart}
          variant="success"
          size="large"
          fullWidth
          icon={<Icons.Cart size={20} color="white" />}
        />
      </View>
    </SafeAreaView>
  );
};

export default ItemDetail;
