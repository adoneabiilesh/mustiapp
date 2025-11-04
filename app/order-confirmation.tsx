import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { getOrderDetails } from '@/lib/database';
import { Colors, Spacing, BorderRadius, Shadows } from '@/lib/designSystem';
import { Icons } from '@/lib/icons';
import * as Haptics from 'expo-haptics';

const OrderConfirmation = () => {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [checkmarkScale] = useState(new Animated.Value(0));
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState<string>('');
  const [deliveryTimeRange, setDeliveryTimeRange] = useState<string>('');

  useEffect(() => {
    if (orderId) {
      loadOrderDetails();
      animateCheckmark();
    }
  }, [orderId]);

  const animateCheckmark = () => {
    Animated.sequence([
      Animated.spring(checkmarkScale, {
        toValue: 1.2,
        tension: 50,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(checkmarkScale, {
        toValue: 1,
        tension: 50,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      const orderData = await getOrderDetails(orderId!);
      console.log('📦 Order details loaded:', orderData);
      setOrder(orderData);
      
      // Calculate real delivery time based on restaurant settings
      if (orderData) {
        await calculateDeliveryTime(orderData);
      }
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDeliveryTime = async (orderData: any) => {
    try {
      // Get restaurant settings for preparation time
      const { getRestaurantSettings } = await import('@/lib/database');
      const settings = await getRestaurantSettings(orderData.restaurant_id);
      
      // Calculate delivery time components
      const preparationTime = settings?.preparation_time || 30; // From restaurant settings
      const deliveryTime = 15; // Base delivery time (could calculate based on distance)
      const totalMinutes = preparationTime + deliveryTime;
      
      // Get order creation time
      const orderTime = new Date(orderData.created_at);
      const estimatedTime = new Date(orderTime.getTime() + totalMinutes * 60000);
      
      // Calculate time range (±5 minutes for min, ±10 for max)
      const minTime = new Date(orderTime.getTime() + (totalMinutes - 5) * 60000);
      const maxTime = new Date(orderTime.getTime() + (totalMinutes + 10) * 60000);
      
      // Format times
      const timeOptions: Intl.DateTimeFormatOptions = { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      };
      
      const formattedEstimate = estimatedTime.toLocaleTimeString('en-US', timeOptions);
      const formattedRange = `${minTime.toLocaleTimeString('en-US', timeOptions)} - ${maxTime.toLocaleTimeString('en-US', timeOptions)}`;
      
      setEstimatedDeliveryTime(formattedEstimate);
      setDeliveryTimeRange(formattedRange);
      
      console.log('⏰ Real-time delivery estimate:', {
        preparationTime: `${preparationTime} mins`,
        deliveryTime: `${deliveryTime} mins`,
        total: `${totalMinutes} mins`,
        estimatedAt: formattedEstimate,
        range: formattedRange,
      });
    } catch (error) {
      console.error('Error calculating delivery time:', error);
      // Fallback to default estimate
      const now = new Date();
      const defaultTime = new Date(now.getTime() + 45 * 60000);
      setEstimatedDeliveryTime(defaultTime.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }));
      setDeliveryTimeRange('40-55 mins');
    }
  };

  const getEstimatedDeliveryTime = () => {
    // Return calculated time or fallback
    return estimatedDeliveryTime || 'Calculating...';
  };

  const getDeliveryTimeRange = () => {
    return deliveryTimeRange || 'TBD';
  };

  const calculateTotal = () => {
    if (!order?.order_items) return 0;
    return order.order_items.reduce((sum: number, item: any) => {
      return sum + (item.unit_price * item.quantity);
    }, 0);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icons.AlertCircle size={64} color={Colors.error[500]} />
          <Text style={styles.errorTitle}>Order not found</Text>
          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.homeButtonText}>Go to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Success Animation */}
        <View style={styles.successContainer}>
          <Animated.View
            style={[
              styles.checkmarkContainer,
              { transform: [{ scale: checkmarkScale }] },
            ]}
          >
            <Icons.CheckCircle size={80} color={Colors.success[500]} />
          </Animated.View>

          <Text style={styles.successTitle}>Order Placed!</Text>
          <Text style={styles.successSubtitle}>
            Your order has been confirmed and is being prepared
          </Text>

          <View style={styles.orderNumberBadge}>
            <Text style={styles.orderNumberText}>
              Order #{order.id?.slice(-6) || '------'}
            </Text>
          </View>
        </View>

        {/* Estimated Delivery */}
        <View style={styles.deliveryCard}>
          <View style={styles.deliveryHeader}>
            <Icons.Clock size={24} color={Colors.primary[500]} />
            <Text style={styles.deliveryTitle}>Estimated Delivery</Text>
          </View>
          <Text style={styles.deliveryTime}>{getEstimatedDeliveryTime()}</Text>
          <Text style={styles.deliveryRange}>{getDeliveryTimeRange()}</Text>
          <Text style={styles.deliverySubtext}>
            We'll notify you when it's on the way
          </Text>
        </View>

        {/* Restaurant Info */}
        {order.restaurants && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Restaurant</Text>
            <View style={styles.restaurantCard}>
              <View style={styles.restaurantIconContainer}>
                <Icons.Utensils size={22} color={Colors.primary[500]} />
              </View>
              <View style={styles.restaurantInfo}>
                <Text style={styles.restaurantName}>{order.restaurants.name}</Text>
                <Text style={styles.restaurantAddress}>{order.restaurants.address}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Order Summary */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.summaryHeader}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              setShowDetails(!showDetails);
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.sectionTitle}>Order Summary</Text>
            <Icons.ChevronDown
              size={20}
              color={Colors.text.secondary}
              style={{
                transform: [{ rotate: showDetails ? '180deg' : '0deg' }],
              }}
            />
          </TouchableOpacity>

          {showDetails && (
            <View style={styles.orderItemsContainer}>
              {order.order_items?.map((item: any, index: number) => (
                <View key={index} style={styles.orderItem}>
                  <Text style={styles.orderItemQuantity}>{item.quantity}x</Text>
                  <Text style={styles.orderItemName}>
                    {item.menu_items?.name || 'Item'}
                  </Text>
                  <Text style={styles.orderItemPrice}>
                    ${(item.unit_price * item.quantity).toFixed(2)}
                  </Text>
                </View>
              ))}

              <View style={styles.divider} />

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalPrice}>${calculateTotal().toFixed(2)}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.trackButton}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }
              router.push(`/order-tracking?orderId=${orderId}`);
            }}
            activeOpacity={0.8}
          >
            <Icons.MapPin size={20} color="#FFFFFF" />
            <Text style={styles.trackButtonText}>Track Order</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              router.replace('/(tabs)');
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.homeButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>

        {/* Help Section */}
        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>Need Help?</Text>
          <Text style={styles.helpText}>
            If you have any questions about your order, our support team is here to help.
          </Text>

          <View style={styles.helpActions}>
            <TouchableOpacity style={styles.helpAction}>
              <Icons.Phone size={20} color={Colors.text.secondary} />
              <Text style={styles.helpActionText}>Call Support</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.helpAction}>
              <Icons.Mail size={20} color={Colors.text.secondary} />
              <Text style={styles.helpActionText}>Email Support</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.lg,
    fontSize: 16,
    color: Colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  errorTitle: {
    marginTop: Spacing.lg,
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
  },
  checkmarkContainer: {
    marginBottom: Spacing.lg,
  },
  successTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    fontFamily: 'Georgia',
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 24,
  },
  orderNumberBadge: {
    backgroundColor: Colors.success[50],
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    borderColor: Colors.success[200],
  },
  orderNumberText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.success[700],
  },
  deliveryCard: {
    backgroundColor: Colors.primary[50],
    marginHorizontal: Spacing.xl,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  deliveryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  deliveryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  deliveryTime: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.primary[500],
    fontFamily: 'Georgia',
    marginBottom: Spacing.xs,
  },
  deliveryRange: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  deliverySubtext: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  section: {
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
    fontFamily: 'Georgia',
  },
  restaurantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.card,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  restaurantIconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  restaurantAddress: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  orderItemsContainer: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  orderItemQuantity: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
    width: 40,
  },
  orderItemName: {
    flex: 1,
    fontSize: 15,
    color: Colors.text.primary,
  },
  orderItemPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.neutral[200],
    marginVertical: Spacing.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    fontFamily: 'Georgia',
  },
  totalPrice: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.primary[500],
    fontFamily: 'Georgia',
  },
  actionsContainer: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  trackButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary[500],
    paddingVertical: 16,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    ...Shadows.md,
  },
  trackButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  homeButton: {
    backgroundColor: Colors.background.card,
    paddingVertical: 16,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.neutral[300],
  },
  homeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  helpSection: {
    backgroundColor: Colors.background.card,
    marginHorizontal: Spacing.xl,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    fontFamily: 'Georgia',
  },
  helpText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  helpActions: {
    gap: Spacing.md,
  },
  helpAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  helpActionText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary[500],
  },
});

export default OrderConfirmation;
