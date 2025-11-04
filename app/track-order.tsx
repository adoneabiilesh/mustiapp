import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
// MapView import - optional if you haven't configured Google Maps API yet
// import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Icons } from '@/lib/icons';
import { useTheme } from '@/lib/theme';
import { ProfessionalText } from '@/components/ProfessionalText';
import { ProfessionalCard } from '@/components/ProfessionalCard';
import { ProfessionalButton } from '@/components/ProfessionalButton';
import { supabase } from '@/lib/supabase';
import useAuthStore from '@/store/auth.store';

const STATUS_STEPS = [
  { key: 'confirmed', label: 'Confirmed', icon: 'CheckCircle' },
  { key: 'preparing', label: 'Preparing', icon: 'Clock' },
  { key: 'picked_up', label: 'Picked Up', icon: 'Package' },
  { key: 'on_the_way', label: 'On the Way', icon: 'Truck' },
  { key: 'delivered', label: 'Delivered', icon: 'Check' },
];

export default function TrackOrderScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { colors, spacing } = useTheme();
  const { user } = useAuthStore();
  // const mapRef = useRef<MapView>(null); // Uncomment when you add maps
  
  const [order, setOrder] = useState<any>(null);
  const [tracking, setTracking] = useState<any>(null);
  const [driver, setDriver] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'map' | 'chat'>('map');

  useEffect(() => {
    fetchOrderDetails();
    subscribeToUpdates();
    
    return () => {
      // Cleanup subscriptions
    };
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);

      // Fetch order with tracking info
      const { data: orderData } = await supabase
        .from('orders')
        .select('*, delivery_tracking(*), drivers(*)')
        .eq('id', orderId)
        .single();

      setOrder(orderData);
      setTracking(orderData?.delivery_tracking?.[0]);
      setDriver(orderData?.drivers?.[0]);

      // Fetch chat messages
      const { data: chatData } = await supabase
        .from('order_chat')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      setMessages(chatData || []);

      // Mark messages as read
      if (chatData) {
        await supabase
          .from('order_chat')
          .update({ read: true })
          .eq('order_id', orderId)
          .neq('sender_id', user?.id);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToUpdates = () => {
    // Subscribe to delivery tracking changes
    const trackingChannel = supabase
      .channel(`delivery-tracking-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'delivery_tracking',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          setTracking(payload.new);
        }
      )
      .subscribe();

    // Subscribe to chat messages
    const chatChannel = supabase
      .channel(`order-chat-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'order_chat',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
          
          // Mark as read if not from current user
          if (payload.new.sender_id !== user?.id) {
            supabase
              .from('order_chat')
              .update({ read: true })
              .eq('id', payload.new.id)
              .then();
          }
        }
      )
      .subscribe();
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      await supabase.from('order_chat').insert({
        order_id: orderId,
        sender_id: user.id,
        message: newMessage.trim(),
        message_type: 'text',
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const getCurrentStepIndex = () => {
    const statusMap: any = {
      confirmed: 0,
      preparing: 1,
      picked_up: 2,
      on_the_way: 3,
      delivered: 4,
    };
    return statusMap[tracking?.status] || 0;
  };

  const renderProgressBar = () => {
    const currentIndex = getCurrentStepIndex();

    return (
      <View style={{ padding: spacing.lg }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', position: 'relative' }}>
          {/* Progress line */}
          <View
            style={{
              position: 'absolute',
              top: 20,
              left: 20,
              right: 20,
              height: 2,
              backgroundColor: colors.border,
            }}
          >
            <View
              style={{
                width: `${(currentIndex / (STATUS_STEPS.length - 1)) * 100}%`,
                height: '100%',
                backgroundColor: colors.primary,
              }}
            />
          </View>

          {STATUS_STEPS.map((step, index) => {
            const isCompleted = index <= currentIndex;
            const Icon = Icons[step.icon as keyof typeof Icons] as any;

            return (
              <View key={step.key} style={{ alignItems: 'center', flex: 1 }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: isCompleted ? colors.primary : colors.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: spacing.sm,
                  }}
                >
                  <Icon size={20} color={isCompleted ? '#fff' : colors.textSecondary} />
                </View>
                <ProfessionalText
                  size="xs"
                  color={isCompleted ? 'primary' : 'secondary'}
                  weight={isCompleted ? 'semibold' : 'normal'}
                  style={{ textAlign: 'center' }}
                >
                  {step.label}
                </ProfessionalText>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderMapView = () => {
    if (!tracking) {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl }}>
          <Icons.MapPin size={64} color={colors.border} />
          <ProfessionalText weight="semibold" style={{ marginTop: spacing.lg, textAlign: 'center' }}>
            Tracking not available yet
          </ProfessionalText>
          <ProfessionalText size="sm" color="secondary" style={{ marginTop: spacing.sm, textAlign: 'center' }}>
            Your order is being prepared. Live tracking will appear once it's out for delivery.
          </ProfessionalText>
        </View>
      );
    }

    // Show tracking info without map (map requires Google Maps API setup)
    return (
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.lg }}>
        <ProfessionalCard style={{ marginBottom: spacing.md }}>
          <View style={{ alignItems: 'center', padding: spacing.lg }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: colors.primary + '20',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: spacing.md,
              }}
            >
              <Icons.Truck size={40} color={colors.primary} />
            </View>
            <ProfessionalText size="lg" weight="bold" style={{ marginBottom: spacing.sm }}>
              {tracking.status === 'on_the_way' ? 'Driver is on the way!' : 'Order in Progress'}
            </ProfessionalText>
            {tracking.estimated_arrival && (
              <ProfessionalText size="sm" color="secondary">
                Estimated arrival: {new Date(tracking.estimated_arrival).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </ProfessionalText>
            )}
          </View>
        </ProfessionalCard>

        {tracking.distance_remaining && (
          <ProfessionalCard style={{ marginBottom: spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <Icons.MapPin size={24} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <ProfessionalText weight="semibold">Distance Remaining</ProfessionalText>
                <ProfessionalText size="sm" color="secondary">
                  {tracking.distance_remaining.toFixed(1)} km away
                </ProfessionalText>
              </View>
            </View>
          </ProfessionalCard>
        )}

        <ProfessionalCard>
          <View style={{ padding: spacing.md }}>
            <ProfessionalText weight="semibold" style={{ marginBottom: spacing.md }}>
              Delivery Status
            </ProfessionalText>
            <View style={{ gap: spacing.sm }}>
              {tracking.pickup_time && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <ProfessionalText size="sm" color="secondary">
                    Picked up
                  </ProfessionalText>
                  <ProfessionalText size="sm">
                    {new Date(tracking.pickup_time).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </ProfessionalText>
                </View>
              )}
              {tracking.delivery_time && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <ProfessionalText size="sm" color="secondary">
                    Delivered
                  </ProfessionalText>
                  <ProfessionalText size="sm">
                    {new Date(tracking.delivery_time).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </ProfessionalText>
                </View>
              )}
            </View>
          </View>
        </ProfessionalCard>

        <View style={{ marginTop: spacing.lg, padding: spacing.md, backgroundColor: colors.card, borderRadius: 12 }}>
          <ProfessionalText size="xs" color="secondary" style={{ textAlign: 'center' }}>
            💡 Tip: Enable location tracking for real-time map view
          </ProfessionalText>
        </View>
      </ScrollView>
    );
  };

  const renderChat = () => {
    return (
      <View style={{ flex: 1 }}>
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: 80 }}
          renderItem={({ item }) => {
            const isMyMessage = item.sender_id === user?.id;
            return (
              <View
                style={{
                  marginBottom: spacing.md,
                  alignItems: isMyMessage ? 'flex-end' : 'flex-start',
                }}
              >
                <View
                  style={{
                    maxWidth: '75%',
                    padding: spacing.md,
                    borderRadius: 16,
                    backgroundColor: isMyMessage ? colors.primary : colors.card,
                  }}
                >
                  <ProfessionalText style={{ color: isMyMessage ? '#fff' : colors.text }}>
                    {item.message}
                  </ProfessionalText>
                  <ProfessionalText
                    size="xs"
                    style={{
                      color: isMyMessage ? 'rgba(255,255,255,0.7)' : colors.textSecondary,
                      marginTop: 4,
                    }}
                  >
                    {new Date(item.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </ProfessionalText>
                </View>
              </View>
            );
          }}
        />

        {/* Input Area */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={100}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: colors.card,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            padding: spacing.md,
          }}
        >
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <TextInput
              style={{
                flex: 1,
                height: 44,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 22,
                paddingHorizontal: spacing.md,
                fontSize: 16,
                color: colors.text,
              }}
              placeholder="Type a message..."
              placeholderTextColor={colors.textSecondary}
              value={newMessage}
              onChangeText={setNewMessage}
            />
            <TouchableOpacity
              onPress={sendMessage}
              disabled={!newMessage.trim()}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: newMessage.trim() ? colors.primary : colors.border,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icons.Send size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: spacing.lg,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Icons.ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <ProfessionalText size="lg" weight="bold">
          Track Order
        </ProfessionalText>
        <View style={{ width: 24 }} />
      </View>

      {/* Progress Bar */}
      {renderProgressBar()}

      {/* Driver Info */}
      {driver && (
        <ProfessionalCard style={{ margin: spacing.lg, marginTop: 0 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: colors.primary + '20',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icons.User size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <ProfessionalText weight="bold">Driver Assigned</ProfessionalText>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                <Icons.Star size={14} color={colors.warning} fill={colors.warning} />
                <ProfessionalText size="sm" color="secondary">
                  {driver.rating?.toFixed(1)} • {driver.total_deliveries} deliveries
                </ProfessionalText>
              </View>
            </View>
            <TouchableOpacity
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.primary + '20',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icons.Phone size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </ProfessionalCard>
      )}

      {/* Tab Switcher */}
      <View style={{ flexDirection: 'row', padding: spacing.md, gap: spacing.sm }}>
        <TouchableOpacity
          onPress={() => setActiveTab('map')}
          style={{
            flex: 1,
            paddingVertical: spacing.md,
            borderRadius: 12,
            backgroundColor: activeTab === 'map' ? colors.primary : colors.card,
            alignItems: 'center',
          }}
        >
          <ProfessionalText weight="semibold" style={{ color: activeTab === 'map' ? '#fff' : colors.text }}>
            Map View
          </ProfessionalText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('chat')}
          style={{
            flex: 1,
            paddingVertical: spacing.md,
            borderRadius: 12,
            backgroundColor: activeTab === 'chat' ? colors.primary : colors.card,
            alignItems: 'center',
          }}
        >
          <ProfessionalText weight="semibold" style={{ color: activeTab === 'chat' ? '#fff' : colors.text }}>
            Chat
          </ProfessionalText>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        {activeTab === 'map' ? renderMapView() : renderChat()}
      </View>
    </SafeAreaView>
  );
}
