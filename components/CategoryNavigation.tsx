import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { Colors, Spacing, BorderRadius } from '@/lib/designSystem';
import * as Haptics from 'expo-haptics';

interface Category {
  id: string;
  name: string;
  emoji?: string;
}

interface CategoryNavigationProps {
  onCategoryChange?: (categoryId: string) => void;
  restaurantId?: string;
  sticky?: boolean;
}

const CategoryNavigation: React.FC<CategoryNavigationProps> = ({
  onCategoryChange,
  restaurantId,
  sticky = false,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    loadCategories();
  }, [restaurantId]);

  const loadCategories = async () => {
    try {
      const { getCategories } = await import('@/lib/database');
      const data = await getCategories({ is_active: true });
      
      // Add "All" category at the beginning
      const allCategories: Category[] = [
        { id: 'all', name: 'All', emoji: '🍽️' },
        ...data.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          emoji: cat.emoji,
        })),
      ];
      
      setCategories(allCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleCategoryPress = (categoryId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setActiveCategory(categoryId);
    onCategoryChange?.(categoryId);
  };

  return (
    <View style={[styles.container, sticky && styles.containerSticky]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => {
          const isActive = activeCategory === category.id;

          return (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryTab}
              onPress={() => handleCategoryPress(category.id)}
              activeOpacity={0.7}
            >
              {category.emoji && (
                <Text style={styles.categoryEmoji}>{category.emoji}</Text>
              )}
              <Text
                style={[
                  styles.categoryText,
                  isActive && styles.categoryTextActive,
                ]}
              >
                {category.name}
              </Text>
              
              {/* Underline Indicator */}
              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
    paddingVertical: Spacing.sm,
  },
  containerSticky: {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.sm,
    paddingHorizontal: 4,
    position: 'relative',
  },
  categoryEmoji: {
    fontSize: 18,
  },
  categoryText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  categoryTextActive: {
    color: Colors.primary[500],
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: Colors.primary[500],
    borderRadius: 2,
  },
});

export default CategoryNavigation;




