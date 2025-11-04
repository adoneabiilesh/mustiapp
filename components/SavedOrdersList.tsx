import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../lib/theme';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../lib/designSystem';
import { Icons, IconSizes, IconColors } from '../lib/iconSystem';
import { 
  getSavedOrders, 
  deleteSavedOrder, 
  reorderFromSaved,
  SavedOrder 
} from '../lib/favorites';
import { useCartStore } from '../store/cart.store';

interface SavedOrdersListProps {
  userId: string;
  onClose?: () => void;
}

const SavedOrdersList: React.FC<SavedOrdersListProps> = ({ userId, onClose }) => {
  const { colors } = useTheme();
  const { addItem } = useCartStore();
  const [savedOrders, setSavedOrders] = useState<SavedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [reordering, setReordering] = useState<string | null>(null);

  useEffect(() => {
    loadSavedOrders();
  }, [userId]);

  const loadSavedOrders = async () => {
    try {
      setLoading(true);
      const orders = await getSavedOrders(userId);
      setSavedOrders(orders);
    } catch (error) {
      console.error('Error loading saved orders:', error);
      Alert.alert('Error', 'Failed to load saved orders');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSavedOrder = async (savedOrderId: string) => {
    Alert.alert(
      'Delete Saved Order',
      'Are you sure you want to delete this saved order?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(savedOrderId);
              const success = await deleteSavedOrder(userId, savedOrderId);
              
              if (success) {
                setSavedOrders(prev => prev.filter(order => order.id !== savedOrderId));
                Alert.alert('Success', 'Saved order deleted');
              } else {
                Alert.alert('Error', 'Failed to delete saved order');
              }
            } catch (error) {
              console.error('Error deleting saved order:', error);
              Alert.alert('Error', 'Failed to delete saved order');
            } finally {
              setDeleting(null);
            }
          }
        }
      ]
    );
  };

  const handleReorder = async (savedOrder: SavedOrder) => {
    try {
      setReordering(savedOrder.id);
      
      // Add all items from saved order to cart
      for (const item of savedOrder.items) {
        const cartItem = {
          id: item.menuItem.id,
          name: item.menuItem.name,
          price: item.menuItem.price,
          image_url: item.menuItem.image_url,
          customizations: item.customizations,
          quantity: item.quantity,
        };
        addItem(cartItem);
      }

      Alert.alert('Success', 'All items from saved order added to cart');
    } catch (error) {
      console.error('Error reordering:', error);
      Alert.alert('Error', 'Failed to reorder items');
    } finally {
      setReordering(null);
    }
  };

  const getItemCount = (order: SavedOrder): number => {
    return order.items.reduce((total, item) => total + item.quantity, 0);
  };

  const renderSavedOrder = ({ item }: { item: SavedOrder }) => (
    <View style={[styles.savedOrderItem, { backgroundColor: colors.surface }]}>
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={[styles.orderName, { color: colors.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.orderDetails, { color: colors.textSecondary }]}>
            {getItemCount(item)} items • €{item.total.toFixed(2)}
          </Text>
          <Text style={[styles.lastUsed, { color: colors.textSecondary }]}>
            Last used: {new Date(item.lastUsed).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.orderActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: Colors.primary }]}
            onPress={() => handleReorder(item)}
            disabled={reordering === item.id}
          >
            {reordering === item.id ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Icons.ShoppingCart size={IconSizes.sm} color={Colors.white} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: IconColors.error }]}
            onPress={() => handleDeleteSavedOrder(item.id)}
            disabled={deleting === item.id}
          >
            {deleting === item.id ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Icons.Trash size={IconSizes.sm} color={Colors.white} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Order Items Preview */}
      <View style={styles.itemsPreview}>
        {item.items.slice(0, 3).map((orderItem, index) => (
          <View key={index} style={styles.previewItem}>
            <Text style={[styles.previewItemName, { color: colors.text }]} numberOfLines={1}>
              {orderItem.quantity}x {orderItem.menuItem.name}
            </Text>
            <Text style={[styles.previewItemPrice, { color: colors.textSecondary }]}>
              €{(orderItem.menuItem.price * orderItem.quantity).toFixed(2)}
            </Text>
          </View>
        ))}
        
        {item.items.length > 3 && (
          <Text style={[styles.moreItems, { color: colors.textSecondary }]}>
            +{item.items.length - 3} more items
          </Text>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Saved Orders</Text>
          {onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icons.X size={IconSizes.lg} color={IconColors.gray600} />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading saved orders...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Saved Orders</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icons.X size={IconSizes.lg} color={IconColors.gray600} />
          </TouchableOpacity>
        )}
      </View>

      {savedOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icons.Package size={IconSizes.xxl} color={IconColors.gray400} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Saved Orders</Text>
          <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
            Save your favorite orders for quick reordering
          </Text>
        </View>
      ) : (
        <FlatList
          data={savedOrders}
          renderItem={renderSavedOrder}
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
  savedOrderItem: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  orderInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  orderName: {
    ...Typography.h4,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  orderDetails: {
    ...Typography.body,
    marginBottom: Spacing.xs,
  },
  lastUsed: {
    ...Typography.caption,
  },
  orderActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemsPreview: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md,
  },
  previewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  previewItemName: {
    ...Typography.caption,
    flex: 1,
    marginRight: Spacing.sm,
  },
  previewItemPrice: {
    ...Typography.caption,
    fontWeight: '500',
  },
  moreItems: {
    ...Typography.caption,
    fontStyle: 'italic',
    marginTop: Spacing.xs,
  },
});

export default SavedOrdersList;
