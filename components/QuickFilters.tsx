import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Shadows } from '@/lib/designSystem';
import * as Haptics from 'expo-haptics';

interface Filter {
  id: string;
  label: string;
  emoji?: string;
}

const FILTERS: Filter[] = [
  { id: 'popular', label: 'Popular', emoji: '🔥' },
  { id: 'new', label: 'New', emoji: '✨' },
  { id: 'under5', label: 'Under $5', emoji: '💰' },
  { id: 'vegetarian', label: 'Vegetarian', emoji: '🥗' },
  { id: 'lowcal', label: 'Low Cal', emoji: '🏃' },
];

interface QuickFiltersProps {
  onFilterChange?: (filterId: string) => void;
}

const QuickFilters: React.FC<QuickFiltersProps> = ({ onFilterChange }) => {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const handleFilterPress = (filterId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Toggle filter
    const newFilter = activeFilter === filterId ? null : filterId;
    setActiveFilter(newFilter);
    onFilterChange?.(newFilter || 'all');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {FILTERS.map((filter) => {
          const isActive = activeFilter === filter.id;

          return (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterChip,
                isActive && styles.filterChipActive,
              ]}
              onPress={() => handleFilterPress(filter.id)}
              activeOpacity={0.7}
            >
              {filter.emoji && (
                <Text style={styles.filterEmoji}>{filter.emoji}</Text>
              )}
              <Text
                style={[
                  styles.filterText,
                  isActive && styles.filterTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: 10,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: BorderRadius['2xl'],
    backgroundColor: Colors.background.card,
    borderWidth: 1.5,
    borderColor: Colors.neutral[200],
    ...Shadows.sm,
  },
  filterChipActive: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  filterEmoji: {
    fontSize: 16,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
});

export default QuickFilters;




