import {View, Text, Image, TouchableOpacity} from 'react-native'
import {SafeAreaView} from "react-native-safe-area-context";
import CustomHeader from "@/components/CustomHeader";
import {useLocalSearchParams, router} from "expo-router";
import {useEffect, useState} from "react";
import {supabase} from "@/lib/supabase";
import cn from "clsx";
import {images} from "@/constants";

interface Order {
  id: string;
  status: string;
  total: number;
  created_at: string;
  delivery_address: any;
  order_items: any[];
}

const StatusStep = ({ 
  title, 
  description, 
  isActive, 
  isCompleted, 
  icon 
}: {
  title: string;
  description: string;
  isActive: boolean;
  isCompleted: boolean;
  icon: any;
}) => (
  <View className="flex-row items-start mb-6">
    <View className={cn(
      "size-12 rounded-full flex-center mr-4",
      isCompleted ? "bg-success-500" : isActive ? "bg-primary-500" : "bg-gray-300"
    )}>
      <Image 
        source={icon} 
        className="size-6" 
        tintColor={isCompleted || isActive ? "white" : "#9CA3AF"} 
      />
    </View>
    <View className="flex-1">
      <Text className={cn(
        "paragraph-bold mb-1",
        isActive ? "text-primary-600" : isCompleted ? "text-success-600" : "text-gray-500"
      )}>
        {title}
      </Text>
      <Text className="body-regular text-gray-600">{description}</Text>
    </View>
  </View>
);

const TrackOrder = () => {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    if (!orderId) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error) {
      console.log('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  useEffect(() => {
    if (!orderId) return;

    // Subscribe to real-time order updates
    const channel = supabase
      .channel(`order-${orderId}`)
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` }, 
        (payload) => {
          console.log('🔄 Order updated:', payload.new);
          setOrder(payload.new as Order);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  const getStatusSteps = (status: string) => {
    const steps = [
      {
        key: 'confirmed',
        title: 'Order Confirmed',
        description: 'Your order has been received and confirmed',
        icon: images.check
      },
      {
        key: 'preparing',
        title: 'Preparing',
        description: 'Our chefs are preparing your delicious meal',
        icon: images.clock
      },
      {
        key: 'out_for_delivery',
        title: 'Out for Delivery',
        description: 'Your order is on its way to you',
        icon: images.location
      },
      {
        key: 'delivered',
        title: 'Delivered',
        description: 'Enjoy your meal!',
        icon: images.check
      }
    ];

    return steps.map((step, index) => {
      const stepIndex = steps.findIndex(s => s.key === status);
      const isCompleted = index < stepIndex;
      const isActive = index === stepIndex;

      return (
        <StatusStep
          key={step.key}
          title={step.title}
          description={step.description}
          isActive={isActive}
          isCompleted={isCompleted}
          icon={step.icon}
        />
      );
    });
  };

  if (loading) {
    return (
      <SafeAreaView className="bg-gray-50 h-full">
        <CustomHeader title="Track Order" />
        <View className="flex-center py-20">
          <Text className="paragraph-medium text-gray-600">Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView className="bg-gray-50 h-full">
        <CustomHeader title="Track Order" />
        <View className="flex-center py-20 px-5">
          <Image source={images.emptyState} className="size-32 mb-6" />
          <Text className="h3-bold text-dark-900 mb-2">Order Not Found</Text>
          <Text className="paragraph-regular text-gray-600 text-center mb-6">
            We couldn't find the order you're looking for
          </Text>
          <TouchableOpacity 
            className="custom-btn"
            onPress={() => router.back()}
          >
            <Text className="paragraph-bold text-white">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-gray-50 h-full">
      <CustomHeader title="Track Order" />
      
      <View className="px-5 pb-32">
        {/* Order Info */}
        <View className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100 mb-6">
          <View className="flex-between mb-4">
            <Text className="h3-bold text-dark-900">Order #{order.id.slice(-6)}</Text>
            <View className={cn(
              "status-badge",
              order.status === 'confirmed' ? 'status-confirmed' :
              order.status === 'preparing' ? 'status-preparing' :
              order.status === 'out_for_delivery' ? 'status-out-for-delivery' :
              order.status === 'delivered' ? 'status-delivered' : 'status-pending'
            )}>
              <Text className="small-bold">
                {order.status.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
          </View>
          
          <Text className="paragraph-medium text-gray-600 mb-2">
            Ordered on {new Date(order.created_at).toLocaleDateString()}
          </Text>
          <Text className="paragraph-bold text-dark-900">
            Total: ${order.total.toFixed(2)}
          </Text>
        </View>

        {/* Status Steps */}
        <View className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
          <Text className="h4-bold text-dark-900 mb-6">Order Status</Text>
          {getStatusSteps(order.status)}
        </View>

        {/* Estimated Time */}
        <View className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 mt-6">
          <View className="flex-row items-center">
            <Image source={images.clock} className="size-8 mr-4" tintColor="white" />
            <View>
              <Text className="paragraph-bold text-white">Estimated Delivery</Text>
              <Text className="h3-bold text-white">
                {order.status === 'delivered' ? 'Delivered' : 
                 order.status === 'out_for_delivery' ? '15-20 mins' :
                 order.status === 'preparing' ? '25-30 mins' : '30-35 mins'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default TrackOrder;


