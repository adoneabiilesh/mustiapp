import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Platform,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { useCartStore } from '@/store/cart.store';
import useAuthStore from '@/store/auth.store';
import useRestaurantStore from '@/store/restaurant.store';
import { Colors, Spacing, BorderRadius, Shadows } from '@/lib/designSystem';
import { Icons } from '@/lib/icons';
import * as Haptics from 'expo-haptics';
import { getImageSource } from '@/lib/imageUtils';
import {
  getRestaurantSettings,
  getUserAddresses,
  getDefaultAddress,
  getUserPaymentMethods,
  getDefaultPaymentMethod,
  createPaymentMethod,
  createOrder,
} from '@/lib/database';

// Import Stripe helpers (Metro will use .native or .web based on platform)
import { useStripe, createPaymentIntent } from '@/lib/stripe';
import StripeCardInput from '@/components/StripeCardInput';

const CheckoutScreen = () => {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { selectedRestaurant } = useRestaurantStore();
  const { confirmPayment } = useStripe();

  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showAddressSelector, setShowAddressSelector] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  
  // Card form states
  const [showAddCard, setShowAddCard] = useState(false);
  const [saveCardInfo, setSaveCardInfo] = useState(true);

  const subtotal = getTotalPrice();
  const deliveryFee = settings?.delivery_fee || 2.99;
  const taxRate = settings?.tax_rate || 0.10;
  const tax = subtotal * taxRate;
  const total = subtotal + deliveryFee + tax;

  // Load restaurant settings, addresses, and payment methods on mount
  useEffect(() => {
    const loadData = async () => {
      if (selectedRestaurant) {
        // Load pricing settings
        const restaurantSettings = await getRestaurantSettings(selectedRestaurant.id);
        setSettings(restaurantSettings);
        if (__DEV__) {
          console.log('💰 Loaded pricing settings:', restaurantSettings);
        }
        
        // Load user addresses
        if (user) {
          const userAddresses = await getUserAddresses(user.id);
          setAddresses(userAddresses);
          
          // Get default address
          const defaultAddr = await getDefaultAddress(user.id);
          if (defaultAddr) {
            setSelectedAddress(defaultAddr);
          } else if (userAddresses.length > 0) {
            setSelectedAddress(userAddresses[0]);
          }

          // Load user payment methods
          const userPaymentMethods = await getUserPaymentMethods(user.id);
          setPaymentMethods(userPaymentMethods);
          if (__DEV__) {
            console.log('💳 Loaded payment methods:', userPaymentMethods);
          }
          
          // Get default payment method
          const defaultPayment = await getDefaultPaymentMethod(user.id);
          if (defaultPayment) {
            setSelectedPayment(defaultPayment);
          } else if (userPaymentMethods.length > 0) {
            setSelectedPayment(userPaymentMethods[0]);
          } else {
            // Default to cash on delivery if no payment methods
            setSelectedPayment({ type: 'cash', is_default: false });
          }
        }
      }
    };
    loadData();
  }, [selectedRestaurant, user]);

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted.slice(0, 19); // Max 16 digits + 3 spaces
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const processStripePayment = async (paymentMethodId: string) => {
    try {
      if (__DEV__) {
        console.log('💳 Processing Stripe payment...');
      }
      
      // Create payment intent on server
      const paymentIntentData = await createPaymentIntent(total);
      
      if (!paymentIntentData || !paymentIntentData.clientSecret) {
        throw new Error('Failed to create payment intent');
      }

      if (__DEV__) {
        console.log('✅ Payment intent created');
      }

      // Confirm payment (handles 3D Secure if needed)
      const { paymentIntent, error } = await confirmPayment(paymentIntentData.clientSecret, {
        paymentMethodType: 'Card',
      });

      if (error) {
        if (__DEV__) {
          console.error('Payment confirmation error:', error);
        }
        throw new Error(error.message);
      }

      if (paymentIntent?.status === 'Succeeded') {
        if (__DEV__) {
          console.log('✅ Payment succeeded!');
        }
        return paymentIntent.id;
      } else {
        throw new Error('Payment not completed');
      }
    } catch (error: any) {
      if (__DEV__) {
        console.error('❌ Stripe payment error:', error);
      }
      throw error;
    }
  };

  const handleStripePaymentMethodCreated = async (
    stripePaymentMethodId: string,
    cardDetails: {
      brand: string;
      last4: string;
      exp_month: number;
      exp_year: number;
    }
  ) => {
    if (!user) return;

    try {
      if (__DEV__) {
        console.log('💳 Stripe payment method created:', stripePaymentMethodId);
      }

      if (saveCardInfo) {
        // Save to database
        const newCard = await createPaymentMethod({
          user_id: user.id,
          stripe_payment_method_id: stripePaymentMethodId,
          type: 'card',
          last4: cardDetails.last4,
          brand: cardDetails.brand,
          exp_month: cardDetails.exp_month,
          exp_year: cardDetails.exp_year,
          is_default: paymentMethods.length === 0,
        });

        if (newCard) {
          setPaymentMethods([...paymentMethods, newCard]);
          setSelectedPayment(newCard);
          Alert.alert('✅ Success', 'Payment method added successfully');
        }
      } else {
        // Use for this order only
        const tempCard = {
          stripe_payment_method_id: stripePaymentMethodId,
          type: 'card',
          last4: cardDetails.last4,
          brand: cardDetails.brand,
          is_default: false,
        };
        setSelectedPayment(tempCard);
      }

      setShowAddCard(false);
    } catch (error) {
      if (__DEV__) {
        console.error('Error saving payment method:', error);
      }
      Alert.alert('Error', 'Failed to save payment method');
    }
  };

  const handleStripeError = (error: string) => {
    Alert.alert('Payment Error', error);
  };

  const handlePlaceOrder = async () => {
    // Validation checks with user-friendly messages
    if (!user) {
      Alert.alert(
        '🔐 Sign In Required', 
        'Please sign in to your account to place an order.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/(auth)/sign-in') }
        ]
      );
      return;
    }

    if (items.length === 0) {
      Alert.alert(
        '🛒 Cart is Empty', 
        'Please add some items to your cart before checkout.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
      return;
    }

    if (!selectedRestaurant) {
      Alert.alert(
        '🏪 Restaurant Required', 
        'Please select a restaurant first.',
        [
          { text: 'OK', onPress: () => router.push('/restaurant-discovery') }
        ]
      );
      return;
    }

    if (!selectedAddress) {
      Alert.alert(
        '📍 Delivery Address Required', 
        'Please add a delivery address to continue.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add Address', onPress: () => router.push('/address-management') }
        ]
      );
      return;
    }

    // Check minimum order
    if (settings?.minimum_order && subtotal < settings.minimum_order) {
      Alert.alert(
        '💰 Minimum Order Not Met',
        `Minimum order for ${selectedRestaurant.name} is $${settings.minimum_order.toFixed(2)}. Your subtotal is $${subtotal.toFixed(2)}.`,
        [{ text: 'OK' }]
      );
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setIsProcessing(true);

    try {
      // Validate address
      if (!selectedAddress) {
        Alert.alert('Missing Address', 'Please add a delivery address');
        return;
      }

      // Validate payment method
      if (!selectedPayment) {
        Alert.alert('Missing Payment', 'Please select a payment method');
        return;
      }

      let paymentIntentId: string | undefined;

      // Process payment for card payments (not cash)
      if (selectedPayment.type === 'card' && selectedPayment.stripe_payment_method_id) {
        try {
          if (__DEV__) {
            console.log('💳 Processing card payment...');
          }
          paymentIntentId = await processStripePayment(selectedPayment.stripe_payment_method_id);
          if (__DEV__) {
            console.log('✅ Payment processed:', paymentIntentId);
          }
        } catch (paymentError: any) {
          if (__DEV__) {
            console.error('❌ Payment failed:', paymentError);
          }
          Alert.alert(
            'Payment Failed',
            paymentError.message || 'Failed to process payment. Please try again.',
            [{ text: 'OK' }]
          );
          return;
        }
      }

      // Create order in database
      if (__DEV__) {
        console.log('📦 Creating order with data:', {
          customer_id: user.id,
          customer_name: user.name || user.email || 'Guest',
          restaurant_id: selectedRestaurant?.id,
          items_count: items.length,
          total,
        });
      }

      const order = await createOrder({
        customer_id: user.id,
        customer_name: user.name || user.email || 'Guest',
        phone_number: selectedAddress.contact_phone || user.phone || '',
        restaurant_id: selectedRestaurant?.id,
        delivery_address: {
          id: selectedAddress.id,
          label: selectedAddress.label,
          street_address: selectedAddress.street_address,
          apartment: selectedAddress.apartment,
          city: selectedAddress.city,
          state: selectedAddress.state,
          postal_code: selectedAddress.postal_code,
          country: selectedAddress.country,
          instructions: deliveryInstructions || selectedAddress.delivery_instructions,
        },
        special_instructions: deliveryInstructions || selectedAddress.delivery_instructions,
        stripe_payment_intent_id: paymentIntentId,
        items: items.map(item => ({
          menu_item_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
          customizations: item.customizations || [],
        })),
      });

      if (!order) {
        throw new Error('Failed to create order');
      }

      if (__DEV__) {
        console.log('✅ Order created successfully:', order);
      }

      // Clear cart
      clearCart();

      // Navigate to order confirmation page
      router.replace(`/order-confirmation?orderId=${order.id}`);

    } catch (error) {
      if (__DEV__) {
        console.error('❌ Error placing order:', error);
      }
      Alert.alert(
        'Order Failed',
        'Failed to place order. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
        {/* Header */}
      <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
          style={styles.backButton}
        >
          <Icons.ChevronLeft size={24} color={Colors.neutral[900]} />
          </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 40 }} />
        </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Restaurant Info */}
        {selectedRestaurant && (
          <View style={styles.restaurantCard}>
            <View style={styles.restaurantIcon}>
              <Icons.Utensils size={20} color='#FF9F66' />
            </View>
            <View style={styles.restaurantInfo}>
              <Text style={styles.restaurantLabel}>Ordering from</Text>
              <Text style={styles.restaurantName}>{selectedRestaurant.name}</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/restaurant-discovery')}
              style={styles.changeButton}
            >
              <Text style={styles.changeButtonText}>Change</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Cart Items */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Order Items</Text>
            <Text style={styles.itemsCount}>{items.length} {items.length === 1 ? 'item' : 'items'}</Text>
          </View>
          <View style={styles.itemsCard}>
            {items.map((item) => (
              <View key={item.id} style={styles.orderItem}>
                <View style={styles.orderItemImageContainer}>
                  <Image
                    source={getImageSource(item.image_url, item.name)}
                    style={styles.orderItemImage}
                    resizeMode="cover"
                  />
                </View>
                <View style={styles.orderItemInfo}>
                  <Text style={styles.orderItemName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {item.customizations && item.customizations.length > 0 && (
                    <Text style={styles.orderItemCustomizations} numberOfLines={2}>
                      {item.customizations.map((c: any) => c.name).join(', ')}
                    </Text>
                  )}
                  <View style={styles.orderItemPriceRow}>
                    <Text style={styles.orderItemQuantity}>Qty: {item.quantity}</Text>
                    <Text style={styles.orderItemPrice}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Add More Items Button */}
          <TouchableOpacity
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              router.push('/(tabs)');
            }}
            style={styles.addMoreButton}
          >
            <Icons.Plus size={20} color={Colors.primary[500]} />
            <Text style={styles.addMoreText}>Add more items</Text>
          </TouchableOpacity>
        </View>

          {/* Delivery Address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
            {addresses.length > 0 && (
              <TouchableOpacity 
                onPress={() => setShowAddressSelector(!showAddressSelector)}
                style={styles.changeAddressButton}
              >
                <Text style={styles.changeAddressText}>
                  {showAddressSelector ? 'Done' : 'Change'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {!selectedAddress ? (
            <TouchableOpacity 
              style={[styles.addressCard, styles.addressCardEmpty]}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                router.push('/address-management');
              }}
              activeOpacity={0.7}
            >
              <View style={styles.emptyAddressContent}>
                <View style={styles.emptyAddressIcon}>
                  <Icons.MapPin size={28} color={Colors.primary[500]} />
                </View>
                <View>
                  <Text style={styles.emptyAddressTitle}>Add Delivery Address</Text>
                  <Text style={styles.emptyAddressText}>Required to place your order</Text>
                </View>
              </View>
              <Icons.Plus size={24} color={Colors.primary[500]} />
            </TouchableOpacity>
          ) : (
            <>
              {/* Selected Address */}
              <TouchableOpacity 
                style={styles.addressCard}
                onPress={() => setShowAddressSelector(!showAddressSelector)}
                activeOpacity={0.7}
              >
            <View style={styles.addressIconContainer}>
              <Icons.MapPin size={22} color='#FF9F66' />
            </View>
            <View style={styles.addressInfo}>
                  <Text style={styles.addressLabel}>{selectedAddress.label}</Text>
                  <Text style={styles.addressText}>
                    {selectedAddress.street_address}
                    {selectedAddress.apartment ? `, ${selectedAddress.apartment}` : ''}
                  </Text>
                  <Text style={styles.addressSubtext}>
                    {selectedAddress.city}{selectedAddress.postal_code ? `, ${selectedAddress.postal_code}` : ''}
                  </Text>
                </View>
                <Icons.ChevronDown size={20} color={Colors.neutral[400]} />
              </TouchableOpacity>

              {/* Address Selector */}
              {showAddressSelector && (
                <View style={styles.addressList}>
                  {addresses.map((address) => (
                    <TouchableOpacity
                      key={address.id}
                      style={[
                        styles.addressOption,
                        selectedAddress?.id === address.id && styles.addressOptionSelected,
                      ]}
                      onPress={() => {
                        setSelectedAddress(address);
                        setShowAddressSelector(false);
                        if (Platform.OS !== 'web') {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }
                      }}
                    >
                      <View style={styles.addressOptionContent}>
                        <View style={styles.addressOptionHeader}>
                          <Text style={styles.addressOptionLabel}>{address.label}</Text>
                          {address.is_default && (
                            <View style={styles.defaultBadge}>
                              <Text style={styles.defaultBadgeText}>Default</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.addressOptionText}>
                          {address.street_address}
                          {address.apartment ? `, ${address.apartment}` : ''}
                        </Text>
                        <Text style={styles.addressOptionSubtext}>
                          {address.city}{address.postal_code ? `, ${address.postal_code}` : ''}
                        </Text>
            </View>
                      {selectedAddress?.id === address.id && (
                        <Icons.Check size={20} color={Colors.primary[500]} />
                      )}
                    </TouchableOpacity>
                  ))}
                  
                  {/* Add New Address Button */}
                  <TouchableOpacity
                    style={styles.addNewAddressButton}
                    onPress={() => {
                      if (Platform.OS !== 'web') {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                      router.push('/address-management');
                    }}
                  >
                    <Icons.Plus size={20} color={Colors.primary[500]} />
                    <Text style={styles.addNewAddressText}>Add New Address</Text>
          </TouchableOpacity>
                </View>
              )}
            </>
          )}
            </View>

            {/* Delivery Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Instructions</Text>
              <TextInput
            style={styles.instructionsInput}
            placeholder="e.g., Ring doorbell, Leave at door"
            placeholderTextColor={Colors.neutral[400]}
                value={deliveryInstructions}
                onChangeText={setDeliveryInstructions}
                multiline
              />
            </View>

            {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          
          {/* Display saved payment methods */}
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              onPress={() => setSelectedPayment(method)}
              style={[
                styles.paymentOption,
                selectedPayment?.id === method.id && styles.paymentOptionSelected,
              ]}
            >
              <View style={styles.paymentIconContainer}>
                <Icons.CreditCard size={22} color='#FF9F66' />
              </View>
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentLabel}>
                  {method.brand || 'Card'} {method.is_default && '(Default)'}
                </Text>
                <Text style={styles.paymentSubtext}>•••• {method.last4}</Text>
              </View>
              <View
                style={[
                  styles.radioButton,
                  selectedPayment?.id === method.id && styles.radioButtonSelected,
                ]}
              >
                {selectedPayment?.id === method.id && <View style={styles.radioButtonInner} />}
              </View>
            </TouchableOpacity>
          ))}

          {/* Cash on Delivery Option */}
          <TouchableOpacity
            onPress={() => setSelectedPayment({ type: 'cash', is_default: false })}
            style={[
              styles.paymentOption,
              selectedPayment?.type === 'cash' && styles.paymentOptionSelected,
            ]}
          >
            <View style={styles.paymentIconContainer}>
              <Icons.DollarSign size={22} color='#FF9F66' />
            </View>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentLabel}>Cash on Delivery</Text>
              <Text style={styles.paymentSubtext}>Pay with cash</Text>
            </View>
            <View
              style={[
                styles.radioButton,
                selectedPayment?.type === 'cash' && styles.radioButtonSelected,
              ]}
            >
              {selectedPayment?.type === 'cash' && <View style={styles.radioButtonInner} />}
            </View>
          </TouchableOpacity>

          {/* Stripe Card Input (Secure & PCI Compliant) */}
          {showAddCard && (
            <StripeCardInput
              onPaymentMethodCreated={handleStripePaymentMethodCreated}
              onError={handleStripeError}
              saveCard={saveCardInfo}
              setSaveCard={setSaveCardInfo}
            />
          )}

          {/* Add Card Button */}
          {!showAddCard && (
            <TouchableOpacity
              onPress={() => setShowAddCard(true)}
              style={styles.addCardButton}
            >
              <Icons.Plus size={20} color={Colors.primary[500]} />
              <Text style={styles.addCardButtonText}>Add New Card</Text>
            </TouchableOpacity>
          )}
        </View>

            {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})
              </Text>
              <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
              </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>${deliveryFee.toFixed(2)}</Text>
              </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax (10%)</Text>
              <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
              </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 120 }} />
        </ScrollView>

      {/* Place Order Button */}
      <View style={styles.bottomContainer}>
        <View style={styles.totalContainer}>
          <Text style={styles.bottomLabel}>Total</Text>
          <Text style={styles.bottomTotal}>${total.toFixed(2)}</Text>
        </View>
          <TouchableOpacity
            onPress={handlePlaceOrder}
            disabled={isProcessing}
          style={[
            styles.placeOrderButton,
            isProcessing && styles.placeOrderButtonDisabled,
          ]}
        >
          <Text style={styles.placeOrderButtonText}>
            {isProcessing ? 'Processing...' : 'Place Order'}
            </Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: '#FAF9F6',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontWeight: '600',
    color: Colors.neutral[900],
  },
  scrollView: {
    flex: 1,
  },
  restaurantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9F6615',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF9F6630',
  },
  restaurantIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantLabel: {
    fontSize: 12,
    color: Colors.neutral[600],
    marginBottom: 2,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral[900],
  },
  changeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  changeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9F66',
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontWeight: '400',
    color: Colors.neutral[900],
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: Spacing.lg,
    padding: Spacing.md,
    borderRadius: 12,
    ...Shadows.sm,
  },
  addressIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FF9F6615',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  addressInfo: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral[900],
    marginBottom: 4,
  },
  addressText: {
    fontSize: 13,
    color: Colors.neutral[700],
  },
  addressSubtext: {
    fontSize: 12,
    color: Colors.neutral[500],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  changeAddressButton: {
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  changeAddressText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary[500],
  },
  addressCardEmpty: {
    borderWidth: 2,
    borderColor: Colors.primary[200],
    borderStyle: 'dashed',
    backgroundColor: Colors.primary[50],
  },
  emptyAddressContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  emptyAddressIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyAddressTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  emptyAddressText: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  addressList: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginHorizontal: Spacing.lg,
  },
  addressOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background.card,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  addressOptionSelected: {
    borderColor: Colors.primary[500],
    backgroundColor: Colors.primary[50],
  },
  addressOptionContent: {
    flex: 1,
  },
  addressOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  addressOptionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  addressOptionText: {
    fontSize: 13,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  addressOptionSubtext: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  defaultBadge: {
    backgroundColor: Colors.primary[100],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.primary[700],
  },
  addNewAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.background.card,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.primary[300],
    borderStyle: 'dashed',
  },
  addNewAddressText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary[500],
  },
  instructionsInput: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: Spacing.lg,
    padding: Spacing.md,
    borderRadius: 12,
    fontSize: 14,
    color: Colors.neutral[900],
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: Spacing.lg,
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    ...Shadows.sm,
  },
  paymentOptionSelected: {
    borderColor: '#FF9F66',
  },
  paymentIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FF9F6615',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral[900],
    marginBottom: 4,
  },
  paymentSubtext: {
    fontSize: 13,
    color: Colors.neutral[600],
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.neutral[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#FF9F66',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF9F66',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: 12,
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
  bottomContainer: {
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
  bottomLabel: {
    fontSize: 12,
    color: Colors.neutral[600],
    marginBottom: 2,
  },
  bottomTotal: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.neutral[900],
  },
  placeOrderButton: {
    flex: 1,
    backgroundColor: '#FF9F66',
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeOrderButtonDisabled: {
    opacity: 0.6,
  },
  placeOrderButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  noPaymentMethods: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    backgroundColor: Colors.neutral[100],
    borderRadius: BorderRadius.md,
  },
  addCardForm: {
    backgroundColor: Colors.neutral[50],
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  addCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.background.card,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text.primary,
  },
  inputRow: {
    flexDirection: 'row',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.neutral[300],
    backgroundColor: Colors.background.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  checkboxLabel: {
    fontSize: 14,
    color: Colors.text.primary,
    flex: 1,
  },
  formButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    backgroundColor: Colors.background.card,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary[500],
    alignItems: 'center',
    ...Shadows.sm,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  addCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.primary[500],
    borderStyle: 'dashed',
    backgroundColor: Colors.primary[50],
    marginTop: Spacing.md,
  },
  addCardButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary[500],
    marginLeft: Spacing.xs,
  },
  itemsCount: {
    fontSize: 14,
    color: Colors.neutral[600],
    fontWeight: '500',
  },
  itemsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: Spacing.lg,
    borderRadius: 12,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  orderItem: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  orderItemImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: Spacing.md,
    backgroundColor: Colors.neutral[100],
  },
  orderItemImage: {
    width: '100%',
    height: '100%',
  },
  orderItemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  orderItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.neutral[900],
    marginBottom: 4,
  },
  orderItemCustomizations: {
    fontSize: 12,
    color: Colors.neutral[600],
    marginBottom: 6,
  },
  orderItemPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderItemQuantity: {
    fontSize: 13,
    color: Colors.neutral[600],
  },
  orderItemPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.neutral[900],
  },
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary[50],
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.primary[300],
    borderStyle: 'dashed',
  },
  addMoreText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary[500],
    marginLeft: Spacing.xs,
  },
});

export default CheckoutScreen;
