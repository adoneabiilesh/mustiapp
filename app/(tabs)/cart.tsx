import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Alert,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { useCartStore } from '@/store/cart.store';
import { images } from '@/constants';
import useAuthStore from '@/store/auth.store';
import { getUserPreferences, updateDefaultAddress } from '@/lib/userPreferences';
import { router } from 'expo-router';
import { getImageSource } from '@/lib/imageUtils';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/lib/designSystem';
import { Icons } from '@/lib/icons';
import { RESTAURANT_CONFIG } from '@/lib/restaurantConfig';
import { UnifiedButton } from '@/components/UnifiedButton';

const CartScreen = () => {
  const { items, increaseQty, decreaseQty, removeItem, clearCart, getTotalItems, getTotalPrice } = useCartStore();
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();
  const { user } = useAuthStore();
  const [userPreferences, setUserPreferences] = useState<any>(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [deliveryFee, setDeliveryFee] = useState(RESTAURANT_CONFIG.delivery.fee);
  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    loadUserData();
  }, [user?.$id]);

  const loadUserData = async () => {
    if (user?.$id) {
      try {
        const preferences = await getUserPreferences(user.$id);
        setUserPreferences(preferences);
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    }
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      Alert.alert('Error', 'Please enter a coupon code');
      return;
    }

    // Mock coupon validation
    const validCoupons: { [key: string]: { discount: number; type: string } } = {
      'WELCOME20': { discount: 20, type: 'percentage' },
      'SAVE10': { discount: 10, type: 'percentage' },
      'FREEDELIVERY': { discount: deliveryFee, type: 'fixed' },
    };

    const coupon = validCoupons[couponCode.toUpperCase()];
    if (coupon) {
      setAppliedCoupon({ code: couponCode.toUpperCase(), ...coupon });
      if (coupon.type === 'percentage') {
        setDiscount((totalPrice * coupon.discount) / 100);
      } else {
        setDiscount(coupon.discount);
      }
      Alert.alert('Success', 'Coupon applied successfully!');
    } else {
      Alert.alert('Error', 'Invalid coupon code');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscount(0);
    setCouponCode('');
  };

  const handleOrderNow = () => {
    if (!user?.$id) {
      Alert.alert('Error', 'Please sign in to place an order');
      return;
    }

    if (totalItems === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }

    // Navigate to checkout screen
    router.push('/checkout');
  };

  const calculateTax = () => {
    const subtotal = totalPrice - discount;
    return subtotal * 0.1; // 10% tax
  };

  const calculateTotal = () => {
    const subtotal = totalPrice - discount;
    const taxAmount = calculateTax();
    const finalDeliveryFee = discount >= deliveryFee ? 0 : deliveryFee;
    return subtotal + taxAmount + finalDeliveryFee;
  };

  const CartItemCard = ({ item }: { item: any }) => {
    return (
      <View style={{
        backgroundColor: '#FFFFFF',
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        ...Shadows.sm,
        borderWidth: 1,
        borderColor: Colors.neutral[100],
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          {/* Image */}
          <View style={{ width: 80, height: 80, borderRadius: BorderRadius.md, overflow: 'hidden', marginRight: Spacing.md }}>
            <Image
              source={getImageSource(item.image_url, item.name)}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          </View>

          {/* Content */}
          <View style={{ flex: 1 }}>
            <Text style={[Typography.h6, { color: Colors.neutral[900], marginBottom: Spacing.xs }]}>
              {item.name}
            </Text>
            
            {item.customizations && item.customizations.length > 0 && (
              <Text style={[Typography.caption, { color: Colors.neutral[600], marginBottom: Spacing.xs }]}>
                {item.customizations.map((custom: any, index: number) => custom.name).join(', ')}
              </Text>
            )}

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.sm }}>
              <Text style={[Typography.h6, { color: RESTAURANT_CONFIG.primaryColor }]}>
                €{(item.price * item.quantity).toFixed(2)}
              </Text>

              {/* Quantity Controls */}
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity
                  onPress={() => decreaseQty(item.id, item.customizations)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: BorderRadius.sm,
                    backgroundColor: Colors.neutral[100],
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icons.Minus size={16} color={Colors.neutral[600]} />
                </TouchableOpacity>

                <Text style={[Typography.body1, { color: Colors.neutral[900], marginHorizontal: Spacing.md }]}>
                  {item.quantity}
                </Text>

                <TouchableOpacity
                  onPress={() => increaseQty(item.id, item.customizations)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: BorderRadius.sm,
                    backgroundColor: RESTAURANT_CONFIG.primaryColor,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icons.Plus size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Remove Button */}
          <TouchableOpacity
            onPress={() => removeItem(item.id, item.customizations)}
            style={{
              width: 32,
              height: 32,
              borderRadius: BorderRadius.sm,
              backgroundColor: Colors.error[50],
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: Spacing.sm,
            }}
          >
            <Icons.Trash size={16} color={Colors.error[500]} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (totalItems === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.neutral[50] }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: Spacing.lg }}>
          <Image source={images.emptyState} style={{ width: 200, height: 200, marginBottom: Spacing.lg }} />
          <Text style={[Typography.h4, { color: Colors.neutral[900], marginBottom: Spacing.sm, textAlign: 'center' }]}>
            Your cart is empty
          </Text>
          <Text style={[Typography.body1, { color: Colors.neutral[600], textAlign: 'center', marginBottom: Spacing.xl }]}>
            Add some delicious items from our menu to get started
          </Text>
          <UnifiedButton
            title="Browse Menu"
            onPress={() => router.push('/(tabs)/index')}
            variant="primary"
            size="large"
            fullWidth
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.neutral[50] }}>
      {/* Header */}
      <View style={{
        backgroundColor: '#FFFFFF',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.neutral[200],
      }}>
        <Text style={[Typography.h3, { color: Colors.neutral[900] }]}>
          Your Cart ({totalItems} items)
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ padding: Spacing.lg }}>
          {/* Cart Items */}
          {items.map((item) => (
            <CartItemCard key={(item as any).cartId || item.id} item={item} />
          ))}

          {/* Add More Items */}
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/index')}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: BorderRadius.lg,
              padding: Spacing.md,
              marginBottom: Spacing.lg,
              borderWidth: 2,
              borderColor: RESTAURANT_CONFIG.primaryColor,
              borderStyle: 'dashed',
              alignItems: 'center',
            }}
          >
            <Icons.Plus size={24} color={RESTAURANT_CONFIG.primaryColor} />
            <Text style={[Typography.button, { color: RESTAURANT_CONFIG.primaryColor, marginTop: Spacing.sm }]}>
              Add more items
            </Text>
          </TouchableOpacity>

          {/* Coupon Section */}
          <View style={{
            backgroundColor: '#FFFFFF',
            borderRadius: BorderRadius.lg,
            padding: Spacing.md,
            marginBottom: Spacing.lg,
            ...Shadows.sm,
          }}>
            <Text style={[Typography.h6, { color: Colors.neutral[900], marginBottom: Spacing.sm }]}>
              Promo Code
            </Text>
            
            {appliedCoupon ? (
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: Colors.success[50],
                borderRadius: BorderRadius.md,
                padding: Spacing.sm,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icons.Check size={16} color={Colors.success[600]} />
                  <Text style={[Typography.body2, { color: Colors.success[700], marginLeft: Spacing.xs }]}>
                    {appliedCoupon.code} applied
                  </Text>
                </View>
                <TouchableOpacity onPress={handleRemoveCoupon}>
                  <Text style={[Typography.label, { color: Colors.error[600] }]}>
                    Remove
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TextInput
                  style={[
                    Typography.body1,
                    {
                      flex: 1,
                      backgroundColor: Colors.neutral[50],
                      borderRadius: BorderRadius.md,
                      paddingHorizontal: Spacing.md,
                      paddingVertical: Spacing.sm,
                      marginRight: Spacing.sm,
                    }
                  ]}
                  placeholder="Enter promo code"
                  value={couponCode}
                  onChangeText={setCouponCode}
                />
                <UnifiedButton
                  title="Apply"
                  onPress={handleApplyCoupon}
                  variant="primary"
                  size="small"
                />
              </View>
            )}
          </View>

          {/* Order Summary */}
          <View style={{
            backgroundColor: '#FFFFFF',
            borderRadius: BorderRadius.lg,
            padding: Spacing.lg,
            ...Shadows.sm,
          }}>
            <Text style={[Typography.h5, { color: Colors.neutral[900], marginBottom: Spacing.md }]}>
              Order Summary
            </Text>

            <View style={{ marginBottom: Spacing.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm }}>
                <Text style={[Typography.body2, { color: Colors.neutral[600] }]}>
                  Subtotal
                </Text>
                <Text style={[Typography.body2, { color: Colors.neutral[900] }]}>
                  €{totalPrice.toFixed(2)}
                </Text>
              </View>

              {discount > 0 && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm }}>
                  <Text style={[Typography.body2, { color: Colors.success[600] }]}>
                    Discount
                  </Text>
                  <Text style={[Typography.body2, { color: Colors.success[600] }]}>
                    -€{discount.toFixed(2)}
                  </Text>
                </View>
              )}

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm }}>
                <Text style={[Typography.body2, { color: Colors.neutral[600] }]}>
                  Tax
                </Text>
                <Text style={[Typography.body2, { color: Colors.neutral[900] }]}>
                  €{calculateTax().toFixed(2)}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md }}>
                <Text style={[Typography.body2, { color: Colors.neutral[600] }]}>
                  Delivery Fee
                </Text>
                <Text style={[Typography.body2, { color: Colors.neutral[900] }]}>
                  €{(discount >= deliveryFee ? 0 : deliveryFee).toFixed(2)}
                </Text>
              </View>

              <View style={{ height: 1, backgroundColor: Colors.neutral[200], marginBottom: Spacing.md }} />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={[Typography.h5, { color: Colors.neutral[900] }]}>
                  Total
                </Text>
                <Text style={[Typography.h5, { color: RESTAURANT_CONFIG.primaryColor }]}>
                  €{calculateTotal().toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={{
        backgroundColor: '#FFFFFF',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.neutral[200],
        ...Shadows.lg,
      }}>
        <UnifiedButton
          title={`Proceed to Checkout (€${calculateTotal().toFixed(2)})`}
          onPress={handleOrderNow}
          variant="primary"
          size="large"
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
};

export default CartScreen;