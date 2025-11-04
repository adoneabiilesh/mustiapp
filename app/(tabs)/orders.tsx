import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Platform,
  RefreshControl,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing, BorderRadius, Shadows } from '@/lib/designSystem';
import { Icons } from '@/lib/icons';
import useAuthStore from '@/store/auth.store';
import { AnimatedListItem } from '@/components/AnimatedComponents';
import * as Haptics from 'expo-haptics';

const OrdersScreen = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    }
  }, [isAuthenticated, filter]);

  const loadOrders = async () => {
    if (!user?.id) {
      console.log('❌ No user ID - user not signed in');
      console.log('User object:', user);
      console.log('Is authenticated:', isAuthenticated);
      setOrders([]);
      return;
    }

    try {
      setLoading(true);
      
      console.log('🔍 Fetching orders for user:', user.id);
      console.log('User email:', user.email);
      
      // Fetch real orders from database
      const { getUserOrders } = await import('@/lib/database');
      const fetchedOrders = await getUserOrders(user.id);
      
      console.log('📡 Raw orders from database:', fetchedOrders);
      console.log(`📊 Found ${fetchedOrders?.length || 0} orders`);
      
      if (!fetchedOrders || fetchedOrders.length === 0) {
        console.log('ℹ️ No orders found for this user');
        console.log('💡 Possible reasons:');
        console.log('  1. User has not placed any orders yet');
        console.log('  2. Orders were created with different customer_id');
        console.log('  3. RLS policy is blocking access');
        setOrders([]);
        setLoading(false);
        return;
      }
      
      // Transform orders to match expected format
      const formattedOrders = (fetchedOrders || []).map((order: any) => ({
        id: order.id,
        restaurant_name: order.restaurants?.name || 'Unknown Restaurant',
        items: (order.order_items || []).map((item: any) => ({
          name: item.menu_items?.name || 'Unknown Item',
          quantity: item.quantity,
          price: item.unit_price,
        })),
        total: order.total || 0,
        status: order.status || 'pending',
        created_at: order.created_at,
        delivery_address: typeof order.delivery_address === 'object' 
          ? `${order.delivery_address.street_address}${order.delivery_address.apartment ? ', ' + order.delivery_address.apartment : ''}`
          : order.delivery_address || 'No address',
      }));
      
      setOrders(formattedOrders);
      console.log(`✅ Successfully loaded ${formattedOrders.length} orders`);
      console.log('📦 Orders:', formattedOrders);
    } catch (error) {
      console.error('❌ Error loading orders:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const handleFilterChange = (newFilter: 'all' | 'active' | 'completed') => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setFilter(newFilter);
  };

  const handleOrderPress = (orderId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    // Navigate to order tracking page for real-time updates
    router.push(`/order-tracking?orderId=${orderId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'completed':
        return Colors.success[500];
      case 'preparing':
      case 'on_the_way':
        return '#FF9F66';
      case 'cancelled':
        return Colors.error[500];
      default:
        return Colors.neutral[500];
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'Delivered';
      case 'preparing':
        return 'Preparing';
      case 'on_the_way':
        return 'On the way';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Orders</Text>
        </View>

        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Icons.Clock size={64} color={Colors.neutral[300]} />
          </View>
          <Text style={styles.emptyTitle}>Sign in to view orders</Text>
          <Text style={styles.emptySubtitle}>
            Track your orders and view order history
          </Text>
          <TouchableOpacity
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }
              router.push('/(auth)/sign-in');
            }}
            style={styles.signInButton}
            activeOpacity={0.8}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const filteredOrders = orders.filter((order) => {
    if (filter === 'all') return true;
    if (filter === 'active') return ['preparing', 'on_the_way'].includes(order.status);
    if (filter === 'completed') return ['delivered', 'cancelled'].includes(order.status);
    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Orders</Text>
        <Text style={styles.headerSubtitle}>
          {orders.length} order{orders.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        >
          {(['all', 'active', 'completed'] as const).map((filterOption) => (
            <TouchableOpacity
              key={filterOption}
              onPress={() => handleFilterChange(filterOption)}
              style={[
                styles.filterPill,
                filter === filterOption && styles.filterPillSelected,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === filterOption && styles.filterTextSelected,
                ]}
              >
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Orders List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary[500]}
          />
        }
      >
        {loading && orders.length === 0 ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading orders...</Text>
          </View>
        ) : filteredOrders.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Icons.Clock size={48} color={Colors.neutral[300]} />
            <Text style={styles.emptyStateText}>No orders found</Text>
            <Text style={styles.emptyStateSubtext}>
              {filter === 'active'
                ? 'You have no active orders'
                : filter === 'completed'
                ? 'You have no completed orders'
                : 'Start ordering to see your history'}
            </Text>
            {filter === 'all' && (
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/index')}
                style={styles.browseButton}
              >
                <Text style={styles.browseButtonText}>Browse Menu</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.ordersContainer}>
            {filteredOrders.map((order, index) => (
              <AnimatedListItem
                key={order.id}
                index={index}
                staggerDelay={50}
              >
                <TouchableOpacity
                  onPress={() => handleOrderPress(order.id)}
                  style={styles.orderCard}
                  activeOpacity={0.7}
                >
                  {/* Order Header */}
                  <View style={styles.orderHeader}>
                    <View style={styles.orderHeaderLeft}>
                      <Text style={styles.restaurantName}>
                        {order.restaurant_name}
                      </Text>
                      <Text style={styles.orderDate}>
                        {formatDate(order.created_at)}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: `${getStatusColor(order.status)}20` },
                      ]}
                    >
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: getStatusColor(order.status) },
                        ]}
                      />
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(order.status) },
                        ]}
                      >
                        {getStatusText(order.status)}
                      </Text>
                    </View>
                  </View>

                  {/* Order Items */}
                  <View style={styles.orderItems}>
                    <Text style={styles.itemsLabel}>Items:</Text>
                    <Text style={styles.itemsList} numberOfLines={2}>
                      {order.items.map((item: any) => `${item.quantity}x ${item.name}`).join(', ')}
                    </Text>
                  </View>

                  {/* Order Footer */}
                  <View style={styles.orderFooter}>
                    <View style={styles.addressContainer}>
                      <Icons.MapPin size={14} color={Colors.neutral[600]} />
                      <Text style={styles.addressText} numberOfLines={1}>
                        {order.delivery_address}
                      </Text>
                    </View>
                    <Text style={styles.orderTotal}>${order.total.toFixed(2)}</Text>
                  </View>

                  {/* View Details Arrow */}
                  <View style={styles.viewDetailsIcon}>
                    <Icons.ChevronRight size={20} color={Colors.neutral[400]} />
                  </View>
                </TouchableOpacity>
              </AnimatedListItem>
            ))}
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
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
  filtersContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  filtersContent: {
    gap: 10,
  },
  filterPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    ...Shadows.sm,
  },
  filterPillSelected: {
    backgroundColor: '#FF9F66',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.neutral[700],
  },
  filterTextSelected: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: Colors.neutral[600],
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
  signInButton: {
    backgroundColor: '#FF9F66',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyStateContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.neutral[900],
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.neutral[600],
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  browseButton: {
    backgroundColor: '#FF9F66',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  browseButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  ordersContainer: {
    paddingHorizontal: Spacing.lg,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.sm,
    position: 'relative',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  orderHeaderLeft: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 18,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontWeight: '600',
    color: Colors.neutral[900],
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 13,
    color: Colors.neutral[600],
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderItems: {
    marginBottom: Spacing.md,
  },
  itemsLabel: {
    fontSize: 12,
    color: Colors.neutral[600],
    marginBottom: 4,
  },
  itemsList: {
    fontSize: 14,
    color: Colors.neutral[900],
    lineHeight: 20,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.md,
    gap: 6,
  },
  addressText: {
    fontSize: 13,
    color: Colors.neutral[600],
    flex: 1,
  },
  orderTotal: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF9F66',
  },
  viewDetailsIcon: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
  },
});

export default OrdersScreen;
