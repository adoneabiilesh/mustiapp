import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StyleSheet,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useCartStore } from '@/store/cart.store';
import useAuthStore from '@/store/auth.store';
import { getImageSource } from '@/lib/imageUtils';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/lib/designSystem';
import { Icons } from '@/lib/icons';
import * as Haptics from 'expo-haptics';
import { AnimatedListItem } from '@/components/AnimatedComponents';

const CartScreen = () => {
  const { items, increaseQty, decreaseQty, removeItem, clearCart, getTotalItems, getTotalPrice } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();
  const deliveryFee = 2.99;
  const tax = totalPrice * 0.1;
  const finalTotal = totalPrice + tax + deliveryFee - discount;

  const handleCheckout = () => {
    if (!isAuthenticated) {
      router.push('/(auth)/sign-in');
      return;
    }

    if (items.length === 0) return;

    router.push('/checkout');
  };

  const handleIncreaseQty = (itemId: string, customizations: any[]) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    increaseQty(itemId, customizations);
  };

  const handleDecreaseQty = (itemId: string, customizations: any[]) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    decreaseQty(itemId, customizations);
  };

  const handleRemoveItem = (itemId: string, customizations: any[]) => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    removeItem(itemId, customizations);
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Cart</Text>
        </View>

        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Icons.ShoppingCart size={64} color={Colors.neutral[300]} />
          </View>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>
            Add items from the menu to get started
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/index')}
            style={styles.browseButton}
          >
            <Text style={styles.browseButtonText}>Browse Menu</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Cart</Text>
        <Text style={styles.headerSubtitle}>
          {totalItems} item{totalItems !== 1 ? 's' : ''}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Cart Items */}
        <View style={styles.itemsSection}>
          {items.map((item, index) => (
            <AnimatedListItem
              key={(item as any).cartId || item.id}
              index={index}
              staggerDelay={50}
            >
              <View style={styles.cartItem}>
                {/* Item Image */}
                <View style={styles.itemImageContainer}>
                  <Image
                    source={getImageSource(item.image_url, item.name)}
                    style={styles.itemImage}
                    resizeMode="cover"
                  />
                </View>

                {/* Item Info */}
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.name}
                  </Text>

                  {item.customizations && item.customizations.length > 0 && (
                    <Text style={styles.customizations} numberOfLines={2}>
                      {item.customizations.map((c: any) => c.name).join(', ')}
                    </Text>
                  )}

                  <Text style={styles.itemPrice}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </Text>
                </View>

                {/* Quantity Controls */}
                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    onPress={() => handleDecreaseQty(item.id, item.customizations)}
                    style={styles.quantityButton}
                  >
                    {item.quantity === 1 ? (
                      <Icons.Trash size={16} color={Colors.neutral[600]} />
                    ) : (
                      <Icons.Minus size={16} color={Colors.neutral[900]} />
                    )}
                  </TouchableOpacity>

                  <Text style={styles.quantityText}>{item.quantity}</Text>

                  <TouchableOpacity
                    onPress={() => handleIncreaseQty(item.id, item.customizations)}
                    style={styles.quantityButton}
                  >
                    <Icons.Plus size={16} color={Colors.neutral[900]} />
                  </TouchableOpacity>
                </View>
              </View>
            </AnimatedListItem>
          ))}
        </View>

        {/* Add More Items */}
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/index')}
          style={styles.addMoreButton}
        >
          <Icons.Plus size={20} color={Colors.primary[600]} />
          <Text style={styles.addMoreText}>Add more items</Text>
        </TouchableOpacity>

        {/* Coupon Code */}
        <View style={styles.couponSection}>
          <Text style={styles.sectionTitle}>Coupon Code</Text>
          <View style={styles.couponInputContainer}>
            <TextInput
              style={styles.couponInput}
              placeholder="Enter coupon code"
              placeholderTextColor={Colors.neutral[400]}
              value={couponCode}
              onChangeText={setCouponCode}
            />
            <TouchableOpacity style={styles.applyButton}>
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Order Summary</Text>

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${totalPrice.toFixed(2)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>${deliveryFee.toFixed(2)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax (10%)</Text>
              <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
            </View>

            {discount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: Colors.success[600] }]}>
                  Discount
                </Text>
                <Text style={[styles.summaryValue, { color: Colors.success[600] }]}>
                  -${discount.toFixed(2)}
                </Text>
              </View>
            )}

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${finalTotal.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Checkout Button */}
      <View style={styles.checkoutContainer}>
        <View style={styles.totalContainer}>
          <Text style={styles.checkoutLabel}>Total</Text>
          <Text style={styles.checkoutTotal}>${finalTotal.toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          onPress={handleCheckout}
          style={styles.checkoutButton}
        >
          <Text style={styles.checkoutButtonText}>Checkout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: '#FAF9F6',
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontWeight: '400',
    color: Colors.neutral[900],
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.neutral[600],
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontWeight: '400',
    color: Colors.neutral[900],
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.neutral[600],
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  browseButton: {
    backgroundColor: '#FF9F66',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  browseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  itemsSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  itemImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.neutral[100],
    marginRight: Spacing.md,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral[900],
    marginBottom: 4,
  },
  customizations: {
    fontSize: 12,
    color: Colors.neutral[600],
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF9F66',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[100],
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignSelf: 'center',
    gap: 12,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral[900],
    minWidth: 24,
    textAlign: 'center',
  },
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary[200],
    borderStyle: 'dashed',
    gap: 8,
    marginBottom: Spacing.lg,
  },
  addMoreText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.primary[600],
  },
  couponSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontWeight: '400',
    color: Colors.neutral[900],
    marginBottom: Spacing.md,
  },
  couponInputContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  couponInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: Colors.neutral[900],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  applyButton: {
    backgroundColor: '#FF9F66',
    borderRadius: 12,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  summarySection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.neutral[600],
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.neutral[900],
  },
  divider: {
    height: 1,
    backgroundColor: Colors.neutral[200],
    marginVertical: Spacing.md,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.neutral[900],
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF9F66',
  },
  checkoutContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 32 : Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadows.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
  totalContainer: {
    marginRight: Spacing.md,
  },
  checkoutLabel: {
    fontSize: 12,
    color: Colors.neutral[600],
    marginBottom: 2,
  },
  checkoutTotal: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.neutral[900],
  },
  checkoutButton: {
    flex: 1,
    backgroundColor: '#FF9F66',
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default CartScreen;
