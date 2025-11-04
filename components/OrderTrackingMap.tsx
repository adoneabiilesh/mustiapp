import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../lib/designSystem';
import { Icons, IconSizes, IconColors } from '../lib/iconSystem';
import { 
  getOrderTracking, 
  subscribeToOrderUpdates, 
  getOrderTimeline,
  formatOrderStatus,
  getEstimatedDeliveryTime,
  OrderTrackingData,
  OrderUpdate
} from '../lib/orderTracking';

interface OrderTrackingMapProps {
  orderId: string;
  onClose?: () => void;
}

const OrderTrackingMap: React.FC<OrderTrackingMapProps> = ({ orderId, onClose }) => {
  const [trackingData, setTrackingData] = useState<OrderTrackingData | null>(null);
  const [timeline, setTimeline] = useState<OrderUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrderTracking();
    setupRealtimeUpdates();
  }, [orderId]);

  const loadOrderTracking = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getOrderTracking(orderId);
      if (data) {
        setTrackingData(data);
        
        // Load timeline
        const timelineData = await getOrderTimeline(orderId);
        setTimeline(timelineData);
      } else {
        setError('Order not found');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load order tracking');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeUpdates = () => {
    const unsubscribe = subscribeToOrderUpdates(
      orderId,
      (update: OrderUpdate) => {
        console.log('📡 Real-time update received:', update);
        setTimeline(prev => [...prev, update]);
      },
      (status: string) => {
        console.log('📡 Status change received:', status);
        setTrackingData(prev => prev ? { ...prev, status } : null);
      }
    );

    return unsubscribe;
  };

  const getStatusProgress = (status: string): number => {
    const statusOrder = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'];
    const currentIndex = statusOrder.indexOf(status);
    return currentIndex >= 0 ? (currentIndex + 1) / statusOrder.length : 0;
  };

  const getEstimatedTime = (): string => {
    if (!trackingData) return '';
    
    const estimatedMinutes = getEstimatedDeliveryTime(trackingData.status, trackingData.orderId);
    if (estimatedMinutes <= 0) return 'Delivered';
    
    if (estimatedMinutes < 60) {
      return `${estimatedMinutes} minutes`;
    } else {
      const hours = Math.floor(estimatedMinutes / 60);
      const minutes = estimatedMinutes % 60;
      return `${hours}h ${minutes}m`;
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: Colors.neutral[50] }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: Colors.neutral[900] }]}>Order Tracking</Text>
          {onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icons.X size={IconSizes.lg} color={IconColors.gray600} />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
          <Text style={[styles.loadingText, { color: Colors.neutral[900] }]}>Loading order details...</Text>
        </View>
      </View>
    );
  }

  if (error || !trackingData) {
    return (
      <View style={[styles.container, { backgroundColor: Colors.neutral[50] }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: Colors.neutral[900] }]}>Order Tracking</Text>
          {onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icons.X size={IconSizes.lg} color={IconColors.gray600} />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.errorContainer}>
          <Icons.AlertCircle size={IconSizes.xl} color={IconColors.error} />
          <Text style={[styles.errorText, { color: Colors.neutral[900] }]}>
            {error || 'Order not found'}
          </Text>
          <TouchableOpacity onPress={loadOrderTracking} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const statusInfo = formatOrderStatus(trackingData.status);
  const progress = getStatusProgress(trackingData.status);

  return (
    <View style={[styles.container, { backgroundColor: Colors.neutral[50] }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: Colors.neutral[900] }]}>Order Tracking</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icons.X size={IconSizes.lg} color={IconColors.gray600} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Status Card */}
        <View style={[styles.statusCard, { backgroundColor: Colors.neutral[100] }]}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusIcon, { backgroundColor: statusInfo.color + '20' }]}>
              <Icons.CheckCircle size={IconSizes.xl} color={statusInfo.color} />
            </View>
            <View style={styles.statusInfo}>
              <Text style={[styles.statusLabel, { color: Colors.neutral[900] }]}>
                {statusInfo.label}
              </Text>
              <Text style={[styles.statusDescription, { color: Colors.neutral[600] }]}>
                {statusInfo.description}
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: Colors.neutral[200] }]}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    backgroundColor: statusInfo.color,
                    width: `${progress * 100}%` 
                  }
                ]} 
              />
            </View>
            <Text style={[styles.progressText, { color: Colors.neutral[600] }]}>
              {Math.round(progress * 100)}% Complete
            </Text>
          </View>

          {/* Estimated Time */}
          {trackingData.status !== 'delivered' && trackingData.status !== 'cancelled' && (
            <View style={styles.estimatedTime}>
              <Icons.Clock size={IconSizes.md} color={IconColors.primary} />
              <Text style={[styles.estimatedTimeText, { color: Colors.neutral[900] }]}>
                Estimated delivery: {getEstimatedTime()}
              </Text>
            </View>
          )}
        </View>

        {/* Restaurant Info */}
        <View style={[styles.restaurantCard, { backgroundColor: Colors.neutral[100] }]}>
          <Text style={[styles.cardTitle, { color: Colors.neutral[900] }]}>Restaurant Info</Text>
          <View style={styles.restaurantInfo}>
            <View style={styles.restaurantItem}>
              <Icons.MapPin size={IconSizes.md} color={IconColors.primary} />
              <Text style={[styles.restaurantText, { color: Colors.neutral[900] }]}>
                {trackingData.restaurantInfo.name}
              </Text>
            </View>
            <View style={styles.restaurantItem}>
              <Icons.Phone size={IconSizes.md} color={IconColors.primary} />
              <Text style={[styles.restaurantText, { color: Colors.neutral[900] }]}>
                {trackingData.restaurantInfo.phone}
              </Text>
            </View>
          </View>
        </View>

        {/* Order Timeline */}
        <View style={[styles.timelineCard, { backgroundColor: Colors.neutral[100] }]}>
          <Text style={[styles.cardTitle, { color: Colors.neutral[900] }]}>Order Timeline</Text>
          <View style={styles.timeline}>
            {timeline.map((update, index) => (
              <View key={update.id} style={styles.timelineItem}>
                <View style={styles.timelineDot}>
                  <View style={[styles.timelineDotInner, { backgroundColor: statusInfo.color }]} />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={[styles.timelineMessage, { color: Colors.neutral[900] }]}>
                    {update.message}
                  </Text>
                  <Text style={[styles.timelineTime, { color: Colors.neutral[600] }]}>
                    {new Date(update.timestamp).toLocaleString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
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
    borderBottomColor: Colors.neutral[200],
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
    ...Typography.body1,
    marginTop: Spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  errorText: {
    ...Typography.body1,
    textAlign: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  retryButton: {
    backgroundColor: Colors.primary[500],
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  retryButtonText: {
    ...Typography.button,
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  statusCard: {
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  statusIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    ...Typography.h3,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  statusDescription: {
    ...Typography.body1,
  },
  progressContainer: {
    marginBottom: Spacing.lg,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: Spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    ...Typography.caption,
    textAlign: 'right',
  },
  estimatedTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  estimatedTimeText: {
    ...Typography.body1,
    marginLeft: Spacing.sm,
    fontWeight: '500',
  },
  restaurantCard: {
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  cardTitle: {
    ...Typography.h3,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  restaurantInfo: {
    gap: Spacing.md,
  },
  restaurantItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  restaurantText: {
    ...Typography.body1,
    marginLeft: Spacing.sm,
  },
  timelineCard: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  timeline: {
    gap: Spacing.lg,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    marginTop: 2,
  },
  timelineDotInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  timelineContent: {
    flex: 1,
  },
  timelineMessage: {
    ...Typography.body1,
    marginBottom: Spacing.xs,
  },
  timelineTime: {
    ...Typography.caption,
  },
});

export default OrderTrackingMap;