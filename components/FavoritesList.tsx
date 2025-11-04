import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../lib/theme';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../lib/designSystem';
import { Icons, IconSizes, IconColors } from '../lib/iconSystem';
import { 
  getFavoriteItems, 
  removeFromFavorites, 
  updateFavoriteItem,
  FavoriteItem 
} from '../lib/favorites';
import { useCartStore } from '../store/cart.store';

interface FavoritesListProps {
  userId: string;
  onClose?: () => void;
}

const FavoritesList: React.FC<FavoritesListProps> = ({ userId, onClose }) => {
  const { colors } = useTheme();
  const { addItem } = useCartStore();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    loadFavorites();
  }, [userId]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const favoriteItems = await getFavoriteItems(userId);
      setFavorites(favoriteItems);
    } catch (error) {
      console.error('Error loading favorites:', error);
      Alert.alert('Error', 'Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (favoriteId: string) => {
    try {
      setRemoving(favoriteId);
      const success = await removeFromFavorites(userId, favoriteId);
      
      if (success) {
        setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
        Alert.alert('Success', 'Item removed from favorites');
      } else {
        Alert.alert('Error', 'Failed to remove item from favorites');
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      Alert.alert('Error', 'Failed to remove item from favorites');
    } finally {
      setRemoving(null);
    }
  };

  const handleAddToCart = async (favorite: FavoriteItem) => {
    try {
      const cartItem = {
        id: favorite.menuItem.id,
        name: favorite.menuItem.name,
        price: favorite.menuItem.price,
        image_url: favorite.menuItem.image_url,
        customizations: favorite.customizations,
        quantity: 1,
      };

      addItem(cartItem);
      Alert.alert('Success', 'Item added to cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart');
    }
  };

  const handleQuickReorder = async (favorite: FavoriteItem) => {
    try {
      const cartItem = {
        id: favorite.menuItem.id,
        name: favorite.menuItem.name,
        price: favorite.menuItem.price,
        image_url: favorite.menuItem.image_url,
        customizations: favorite.customizations,
        quantity: 1,
      };

      addItem(cartItem);
      Alert.alert('Success', 'Item added to cart with your saved customizations');
    } catch (error) {
      console.error('Error with quick reorder:', error);
      Alert.alert('Error', 'Failed to reorder item');
    }
  };

  const renderFavoriteItem = ({ item }: { item: FavoriteItem }) => (
    <View style={[styles.favoriteItem, { backgroundColor: colors.surface }]}>
      <Image 
        source={{ uri: item.menuItem.image_url || 'https://via.placeholder.com/100x100' }}
        style={styles.itemImage}
        resizeMode="cover"
      />
      
      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={2}>
          {item.menuItem.name}
        </Text>
        
        <Text style={[styles.itemPrice, { color: colors.text }]}>
          €{item.menuItem.price.toFixed(2)}
        </Text>

        {item.customizations.length > 0 && (
          <View style={styles.customizations}>
            <Text style={[styles.customizationsLabel, { color: colors.textSecondary }]}>
              Customizations:
            </Text>
            {item.customizations.map((customization, index) => (
              <Text key={index} style={[styles.customizationItem, { color: colors.textSecondary }]}>
                • {customization.name}: {customization.value}
              </Text>
            ))}
          </View>
        )}

        {item.notes && (
          <Text style={[styles.notes, { color: colors.textSecondary }]} numberOfLines={2}>
            Note: {item.notes}
          </Text>
        )}

        <Text style={[styles.lastOrdered, { color: colors.textSecondary }]}>
          Last ordered: {new Date(item.lastOrdered).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.itemActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: Colors.primary }]}
          onPress={() => handleQuickReorder(item)}
        >
          <Icons.ShoppingCart size={IconSizes.sm} color={Colors.white} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: Colors.secondary }]}
          onPress={() => handleAddToCart(item)}
        >
          <Icons.Plus size={IconSizes.sm} color={Colors.white} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: IconColors.error }]}
          onPress={() => handleRemoveFavorite(item.id)}
          disabled={removing === item.id}
        >
          {removing === item.id ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <Icons.Trash size={IconSizes.sm} color={Colors.white} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>My Favorites</Text>
          {onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icons.X size={IconSizes.lg} color={IconColors.gray600} />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading favorites...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>My Favorites</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icons.X size={IconSizes.lg} color={IconColors.gray600} />
          </TouchableOpacity>
        )}
      </View>

      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icons.Heart size={IconSizes.xxl} color={IconColors.gray400} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Favorites Yet</Text>
          <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
            Start adding items to your favorites by tapping the heart icon on any menu item
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderFavoriteItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    ...Typography.h2,
    fontWeight: '600',
  },
  closeButton: {
    padding: Spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  loadingText: {
    ...Typography.body,
    marginTop: Spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  emptyTitle: {
    ...Typography.h3,
    fontWeight: '600',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyDescription: {
    ...Typography.body,
    textAlign: 'center',
    lineHeight: 24,
  },
  listContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  favoriteItem: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.md,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    ...Typography.h4,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  itemPrice: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  customizations: {
    marginBottom: Spacing.sm,
  },
  customizationsLabel: {
    ...Typography.caption,
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  customizationItem: {
    ...Typography.caption,
    marginBottom: Spacing.xs,
  },
  notes: {
    ...Typography.caption,
    fontStyle: 'italic',
    marginBottom: Spacing.sm,
  },
  lastOrdered: {
    ...Typography.caption,
  },
  itemActions: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
});

export default FavoritesList;
