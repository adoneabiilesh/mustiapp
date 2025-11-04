import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  Linking,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { getOrderDetails, subscribeToOrderStatus } from '@/lib/database';
import { Colors, Spacing, BorderRadius, Shadows } from '@/lib/designSystem';
import { Icons } from '@/lib/icons';
import * as Haptics from 'expo-haptics';

// Order status configuration
const ORDER_STATUSES = [
  {
    id: 'pending',
    title: 'Order Placed',
    icon: 'CheckCircle',
    description: 'Your order has been received',
  },
  {
    id: 'confirmed',
    title: 'Confirmed',
    icon: 'Clock',
    description: 'Restaurant confirmed your order',
  },
  {
    id: 'preparing',
    title: 'Preparing',
    icon: 'ChefHat',
    description: 'Your food is being prepared',
  },
  {
    id: 'ready',
    title: 'Ready for Pickup',
    icon: 'Package',
    description: 'Order is ready',
  },
  {
    id: 'out_for_delivery',
    title: 'Out for Delivery',
    icon: 'Bike',
    description: 'Driver is on the way',
  },
  {
    id: 'delivered',
    title: 'Delivered',
    icon: 'CheckCircle',
    description: 'Order delivered successfully',
  },
];

const OrderTracking = () => {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!orderId) return;

    loadOrderData();

    // Subscribe to real-time order status updates
    const unsubscribe = subscribeToOrderStatus(orderId, (updatedOrder) => {
      console.log('📡 Real-time update received:', updatedOrder);
      setOrder((prev: any) => ({ ...prev, ...updatedOrder }));
      
      // Haptic feedback on status change
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [orderId]);

  const loadOrderData = async () => {
    try {
      setLoading(true);
      const orderData = await getOrderDetails(orderId!);
      console.log('📦 Order loaded:', orderData);
      setOrder(orderData);
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStatusIndex = () => {
    if (!order?.status) return 0;
    return ORDER_STATUSES.findIndex(s => s.id === order.status);
  };

  const getEstimatedDeliveryTime = () => {
    const now = new Date();
    const estimatedMinutes = order?.delivery_time || 35;
    const deliveryTime = new Date(now.getTime() + estimatedMinutes * 60000);
    return deliveryTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleCallRestaurant = () => {
    if (!order?.restaurants?.phone) {
      Alert.alert('Phone number not available');
      return;
    }

    Alert.alert(
      'Call Restaurant',
      `Call ${order.restaurants.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: () => {
            Linking.openURL(`tel:${order.restaurants.phone}`);
          },
        },
      ]
    );
  };

  const handleCancelOrder = () => {
    if (order?.status === 'delivered' || order?.status === 'cancelled') {
      Alert.alert('Cannot cancel', 'This order cannot be cancelled');
      return;
    }

    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              const { cancelOrder } = await import('../lib/orderService');
              await cancelOrder({
                orderId: order.id,
                reason: 'Customer requested cancellation',
                reasonType: 'customer_request',
              });
              Alert.alert('Order Cancelled', 'Your order has been cancelled successfully');
              router.replace('/(tabs)/orders');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to cancel order');
            }
          },
        },
      ]
    );
  };

  const calculateTotal = () => {
    if (!order?.order_items) return 0;
    return order.order_items.reduce((sum: number, item: any) => {
      return sum + (item.unit_price * item.quantity);
    }, 0);
  };

  const getStatusColor = (statusId: string) => {
    const currentIndex = getCurrentStatusIndex();
    const statusIndex = ORDER_STATUSES.findIndex(s => s.id === statusId);

    if (statusIndex < currentIndex) return Colors.success[500];
    if (statusIndex === currentIndex) return Colors.primary[500];
    return Colors.neutral[300];
  };

  const isStatusCompleted = (statusId: string) => {
    const currentIndex = getCurrentStatusIndex();
    const statusIndex = ORDER_STATUSES.findIndex(s => s.id === statusId);
    return statusIndex < currentIndex;
  };

  const isStatusCurrent = (statusId: string) => {
    return order?.status === statusId;
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
            style={styles.primaryButton}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.primaryButtonText}>Go to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Icons.ChevronLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Track Order</Text>
          <Text style={styles.headerSubtitle}>
            Order #{order.id?.slice(-6) || '------'}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Estimated Delivery Time Card */}
        {order.status !== 'delivered' && order.status !== 'cancelled' && (
          <View style={styles.deliveryCard}>
            <View style={styles.deliveryHeader}>
              <Icons.Clock size={28} color={Colors.primary[500]} />
              <Text style={styles.deliveryLabel}>Estimated Delivery</Text>
            </View>
            <Text style={styles.deliveryTime}>{getEstimatedDeliveryTime()}</Text>
            <Text style={styles.deliverySubtext}>
              {order.status === 'out_for_delivery' 
                ? 'Your order is on its way!' 
                : 'Your order is being prepared'}
            </Text>
          </View>
        )}

        {/* Delivered Success Card */}
        {order.status === 'delivered' && (
          <View style={styles.deliveredCard}>
            <Icons.CheckCircle size={64} color={Colors.success[500]} />
            <Text style={styles.deliveredTitle}>Delivered Successfully!</Text>
            <Text style={styles.deliveredSubtext}>
              Hope you enjoy your meal!
            </Text>
          </View>
        )}

        {/* Order Progress Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Progress</Text>

          <View style={styles.timeline}>
            {ORDER_STATUSES.map((status, index) => {
              const isCompleted = isStatusCompleted(status.id);
              const isCurrent = isStatusCurrent(status.id);
              const statusColor = getStatusColor(status.id);

              return (
                <View key={status.id} style={styles.timelineItem}>
                  {/* Timeline Connector Line */}
                  {index > 0 && (
                    <View
                      style={[
                        styles.timelineConnector,
                        {
                          backgroundColor: isCompleted
                            ? Colors.success[500]
                            : Colors.neutral[200],
                        },
                      ]}
                    />
                  )}

                  {/* Status Icon */}
                  <View
                    style={[
                      styles.timelineIcon,
                      {
                        backgroundColor: isCurrent
                          ? Colors.primary[50]
                          : isCompleted
                          ? Colors.success[50]
                          : Colors.neutral[100],
                        borderColor: statusColor,
                        borderWidth: 2,
                      },
                    ]}
                  >
                    {isCompleted ? (
                      <Icons.CheckCircle size={24} color={Colors.success[500]} />
                    ) : isCurrent ? (
                      <View style={styles.currentDot} />
                    ) : (
                      <View style={styles.pendingDot} />
                    )}
                  </View>

                  {/* Status Details */}
                  <View style={styles.timelineContent}>
                    <Text
                      style={[
                        styles.timelineTitle,
                        {
                          color: isCurrent
                            ? Colors.primary[500]
                            : isCompleted
                            ? Colors.text.primary
                            : Colors.text.secondary,
                        },
                      ]}
                    >
                      {status.title}
                    </Text>
                    <Text style={styles.timelineDescription}>
                      {status.description}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Restaurant Info */}
        {order.restaurants && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Restaurant</Text>
            <View style={styles.restaurantCard}>
              <View style={styles.restaurantIconContainer}>
                <Icons.Utensils size={24} color={Colors.primary[500]} />
              </View>
              <View style={styles.restaurantInfo}>
                <Text style={styles.restaurantName}>{order.restaurants.name}</Text>
                <Text style={styles.restaurantAddress}>
                  {order.restaurants.address}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleCallRestaurant}
                style={styles.callButton}
              >
                <Icons.Phone size={20} color={Colors.primary[500]} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Order Details */}
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
            <Text style={styles.sectionTitle}>Order Details</Text>
            <Icons.ChevronDown
              size={20}
              color={Colors.text.secondary}
              style={{
                transform: [{ rotate: showDetails ? '180deg' : '0deg' }],
              }}
            />
          </TouchableOpacity>

          {showDetails && (
            <View style={styles.orderDetailsCard}>
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
        {order.status !== 'delivered' && order.status !== 'cancelled' && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelOrder}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Cancel Order</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Help Section */}
        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>Need Help?</Text>
          <Text style={styles.helpText}>
            Having issues with your order? Contact our support team.
          </Text>

          <TouchableOpacity style={styles.helpAction}>
            <Icons.MessageCircle size={20} color={Colors.primary[500]} />
            <Text style={styles.helpActionText}>Chat with Support</Text>
          </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    fontFamily: 'Georgia',
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  deliveryCard: {
    backgroundColor: Colors.primary[50],
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  deliveryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  deliveryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  deliveryTime: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.primary[500],
    fontFamily: 'Georgia',
    marginVertical: Spacing.sm,
  },
  deliverySubtext: {
    fontSize: 15,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  deliveredCard: {
    backgroundColor: Colors.success[50],
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
    padding: Spacing.xxl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.success[200],
  },
  deliveredTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    fontFamily: 'Georgia',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  deliveredSubtext: {
    fontSize: 15,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  section: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
    fontFamily: 'Georgia',
  },
  timeline: {
    paddingLeft: Spacing.sm,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: Spacing.xl,
    position: 'relative',
  },
  timelineConnector: {
    position: 'absolute',
    left: 19,
    top: -24,
    width: 2,
    height: 32,
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  currentDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary[500],
  },
  pendingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.neutral[300],
  },
  timelineContent: {
    flex: 1,
    paddingTop: 4,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  timelineDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
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
    width: 48,
    height: 48,
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
  callButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderDetailsCard: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.md,
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
    marginTop: Spacing.xl,
  },
  primaryButton: {
    backgroundColor: Colors.primary[500],
    paddingVertical: 16,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    ...Shadows.md,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cancelButton: {
    backgroundColor: Colors.background.card,
    paddingVertical: 16,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.error[500],
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.error[500],
  },
  helpSection: {
    backgroundColor: Colors.background.card,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
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

export default OrderTracking;
