import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import useAuthStore from '../../store/auth.store';
import { useCartStore } from '../../store/cart.store';
import { getUserOrders, subscribeUserOrdersRealtime } from '../../lib/supabase';
import { router } from 'expo-router';
import cn from 'clsx';
import { images } from '@/constants';
import { getImageSource } from '../../lib/imageUtils';

interface OrderItem {
  id: string;
  quantity: number;
  unit_price: number;
  customizations?: any[];
  menu_items?: {
    name: string;
    image_url?: string;
  };
}

interface Order {
  id: string;
  status: string;
  total: number;
  created_at: string;
  delivery_address: any;
  payment_method: string;
  order_items: OrderItem[];
}

const OrderCard = ({ order }: { order: Order }) => {
  const { addItem } = useCartStore();
  const [showDetails, setShowDetails] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'out_for_delivery': return 'text-blue-600 bg-blue-100';
      case 'preparing': return 'text-orange-600 bg-orange-100';
      case 'confirmed': return 'text-purple-600 bg-purple-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered': return 'Delivered';
      case 'out_for_delivery': return 'Out for Delivery';
      case 'preparing': return 'Preparing';
      case 'confirmed': return 'Confirmed';
      case 'pending': return 'Pending';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleReorder = () => {
    if (order.order_items && order.order_items.length > 0) {
      order.order_items.forEach((item: any) => {
        for (let i = 0; i < item.quantity; i++) {
          addItem({
            id: item.menu_item_id,
            name: item.menu_items?.name || 'Item',
            price: item.unit_price,
            image_url: item.menu_items?.image_url,
            customizations: item.customizations || []
          });
        }
      });
      router.push('/(tabs)/cart');
    }
  };

  const handleTrackOrder = () => {
    router.push(`/order-tracking?orderId=${order.id}`);
  };

  const handleViewDetails = () => {
    router.push(`/order-details?orderId=${order.id}`);
  };

  return (
    <View className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
      {/* Order Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View>
          <Text className="text-lg font-semibold text-gray-900">
            Order #{order.id.slice(-6)}
          </Text>
          <Text className="text-sm text-gray-600">{formatDate(order.created_at)}</Text>
        </View>
        <View className={cn('px-3 py-1 rounded-full', getStatusColor(order.status))}>
          <Text className="text-sm font-medium">{getStatusText(order.status)}</Text>
        </View>
      </View>

      {/* Order Items Preview */}
      <View className="mb-3">
        {order.order_items?.slice(0, 2).map((item: any, index: number) => (
          <View key={index} className="flex-row items-center mb-2">
            <View className="w-8 h-8 rounded-lg overflow-hidden mr-3">
              <Image
                source={getImageSource(item.menu_items?.image_url, item.menu_items?.name)}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 font-medium" numberOfLines={1}>
                {item.quantity}x {item.menu_items?.name}
              </Text>
            </View>
            <Text className="text-gray-600">
              €{(item.unit_price * item.quantity).toFixed(2)}
            </Text>
          </View>
        ))}
        
        {order.order_items?.length > 2 && (
          <Text className="text-sm text-gray-500">
            +{order.order_items.length - 2} more items
          </Text>
        )}
      </View>

      {/* Order Total */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-bold text-gray-900">
          Total: €{order.total.toFixed(2)}
        </Text>
        <TouchableOpacity onPress={() => setShowDetails(!showDetails)}>
          <Text className="text-blue-600 font-medium">
            {showDetails ? 'Hide Details' : 'View Details'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Expanded Details */}
      {showDetails && (
        <View className="border-t border-gray-200 pt-4 space-y-3">
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Payment Method</Text>
            <Text className="text-gray-900">{order.payment_method}</Text>
          </View>
          
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Delivery Address</Text>
            <Text className="text-gray-900 text-right">
              {order.delivery_address?.street}
              {'\n'}{order.delivery_address?.city}, {order.delivery_address?.zip}
            </Text>
          </View>
          
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Items</Text>
            <Text className="text-gray-900">{order.order_items?.length || 0} items</Text>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View className="flex-row space-x-3 mt-4">
        {order.status === 'delivered' && (
          <TouchableOpacity
            onPress={handleReorder}
            className="flex-1 bg-green-500 py-3 rounded-lg"
          >
            <View className="items-center">
              <Text className="text-white font-medium">Reorder</Text>
            </View>
          </TouchableOpacity>
        )}
        
        {(order.status === 'out_for_delivery' || order.status === 'preparing') && (
          <TouchableOpacity
            onPress={handleTrackOrder}
            className="flex-1 bg-blue-500 py-3 rounded-lg"
          >
            <View className="items-center">
              <Text className="text-white font-medium">Track Order</Text>
            </View>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          onPress={handleViewDetails}
          className="flex-1 bg-gray-100 py-3 rounded-lg"
        >
          <View className="items-center">
            <Text className="text-gray-700 font-medium">View Details</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const Orders = () => {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All');

  const filters = [
    { id: 'All', label: 'All Orders' },
    { id: 'Ongoing', label: 'Ongoing' },
    { id: 'Completed', label: 'Completed' },
    { id: 'Cancelled', label: 'Cancelled' },
  ];

  const fetchOrders = useCallback(async () => {
    if (!user?.$id) return;
    
    try {
      const userOrders = await getUserOrders(user.$id);
      setOrders(userOrders);
    } catch (error) {
      console.log('Error fetching orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.$id]);

  useEffect(() => {
    fetchOrders();
  }, [user, fetchOrders]);

  // Refresh orders when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('📱 Orders screen focused, refreshing...');
      fetchOrders();
    }, [fetchOrders])
  );

  useEffect(() => {
    if (!user?.$id) return;

    const unsubscribe = subscribeUserOrdersRealtime(user.$id, () => {
      console.log('🔄 Order updated, refreshing...');
      fetchOrders();
    });

    return unsubscribe;
  }, [user?.$id, fetchOrders]);

  // Add a periodic refresh as backup (every 30 seconds)
  useEffect(() => {
    if (!user?.$id) return;

    const interval = setInterval(() => {
      console.log('🔄 Periodic refresh of orders...');
      fetchOrders();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [user?.$id, fetchOrders]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const getFilteredOrders = () => {
    switch (selectedFilter) {
      case 'Ongoing':
        return orders.filter(order => 
          ['pending', 'confirmed', 'preparing', 'out_for_delivery'].includes(order.status)
        );
      case 'Completed':
        return orders.filter(order => order.status === 'delivered');
      case 'Cancelled':
        return orders.filter(order => order.status === 'cancelled');
      default:
        return orders;
    }
  };

  const filteredOrders = getFilteredOrders();

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="px-5 pt-4 pb-6 bg-white border-b border-gray-100">
          <Text className="text-2xl font-bold text-gray-900">My Orders</Text>
        </View>
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-gray-600">Loading orders...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-5 pt-4 pb-6 bg-white border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-gray-900">My Orders</Text>
            <Text className="text-gray-600 mt-1">
              {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
            </Text>
          </View>
        </View>
      </View>

      {/* Filter Tabs */}
      <View className="px-5 py-4 bg-white border-b border-gray-100">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row space-x-3">
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                onPress={() => setSelectedFilter(filter.id)}
                className={cn(
                  'px-4 py-2 rounded-full',
                  selectedFilter === filter.id
                    ? 'bg-blue-500'
                    : 'bg-gray-100'
                )}
              >
                <Text className={cn(
                  'font-medium',
                  selectedFilter === filter.id
                    ? 'text-white'
                    : 'text-gray-700'
                )}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {filteredOrders.length === 0 ? (
        /* Empty State */
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View className="flex-1 justify-center items-center px-5">
            <Image source={images.emptyState} className="w-32 h-32 mb-6 opacity-50" />
            <Text className="text-xl font-bold text-gray-900 mb-3">
              {selectedFilter === 'All' ? 'No Orders Yet' : `No ${selectedFilter} Orders`}
            </Text>
            <Text className="text-gray-600 text-center mb-8">
              {selectedFilter === 'All' 
                ? 'Start ordering your favorite food and track your orders here'
                : `You don't have any ${selectedFilter.toLowerCase()} orders yet`
              }
            </Text>
            {selectedFilter === 'All' && (
              <TouchableOpacity 
                className="bg-green-500 px-6 py-4 rounded-xl"
                onPress={() => router.push('/(tabs)/index')}
              >
                <Text className="text-white font-bold text-lg">Browse Menu</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      ) : (
        /* Orders List */
        <FlatList
          data={filteredOrders}
          renderItem={({ item }) => <OrderCard order={item} />}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
};

export default Orders;
