import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { getMenu } from '@/lib/supabase';
import { MenuItem } from '@/type';
import { Icons } from '@/lib/icons';
import { useTheme } from '@/lib/theme';
import { ProfessionalText, ProfessionalCard } from '@/components';
import MenuCard from '@/components/MenuCard';
import CartButton from '@/components/CartButton';

const CategoryScreen = () => {
  const { categoryName } = useLocalSearchParams<{ categoryName: string }>();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { colors, spacing } = useTheme();

  const loadCategoryItems = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Loading items for category:', categoryName);
      const menuItems = await getMenu({ 
        category: categoryName || '', 
        limit: 50 
      });
      console.log('Loaded category items:', menuItems);
      setItems(menuItems || []);
    } catch (error) {
      console.log('Error loading category items:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [categoryName]);

  useEffect(() => {
    loadCategoryItems();
  }, [loadCategoryItems]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-5 pt-4 pb-6 bg-white border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-4"
          >
            <Icons.ArrowBack size={20} color={colors.neutral[600]} />
          </TouchableOpacity>
          <View className="flex-1">
            <ProfessionalText variant="h3" color={colors.neutral[900]}>
              {categoryName || 'Category'}
            </ProfessionalText>
            <ProfessionalText variant="body2" color={colors.neutral[600]}>
              {items.length} items available
            </ProfessionalText>
          </View>
        </View>
      </View>

      {/* Content */}
      <View className="flex-1 px-5 pt-4">
        {loading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ProfessionalText variant="body1" color={colors.neutral[600]}>
              Loading items...
            </ProfessionalText>
          </View>
        ) : (
          <FlatList
            data={items}
            renderItem={({ item }) => (
              <TouchableOpacity 
                onPress={() => router.push(`/item-detail?id=${item.$id}`)}
                className="mb-4"
              >
                <MenuCard item={item} />
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.$id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            ListEmptyComponent={() => (
              <View className="flex-1 items-center justify-center py-20">
                <Icons.Food size={48} color={colors.neutral[300]} />
                <ProfessionalText variant="h4" color={colors.neutral[900]} style={{ marginTop: 16, marginBottom: 8 }}>
                  No items found
                </ProfessionalText>
                <ProfessionalText variant="body2" color={colors.neutral[600]} style={{ textAlign: 'center' }}>
                  This category doesn't have any items yet
                </ProfessionalText>
              </View>
            )}
          />
        )}
      </View>

      <CartButton />
    </SafeAreaView>
  );
};

export default CategoryScreen;
