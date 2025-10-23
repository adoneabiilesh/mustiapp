import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import * as Location from 'expo-location';
import { Icons } from '@/lib/icons';
import { useTheme } from '@/lib/theme';
import { ProfessionalText } from '@/components';

const { width, height } = Dimensions.get('window');

interface OrderTrackingMapProps {
  orderId: string;
  restaurantLocation: {
    latitude: number;
    longitude: number;
    name: string;
  };
  deliveryPersonLocation?: {
    latitude: number;
    longitude: number;
    name: string;
  };
  customerLocation?: {
    latitude: number;
    longitude: number;
  };
  orderStatus: 'preparing' | 'out_for_delivery' | 'delivered';
}

const OrderTrackingMap: React.FC<OrderTrackingMapProps> = ({
  orderId,
  restaurantLocation,
  deliveryPersonLocation,
  customerLocation,
  orderStatus,
}) => {
  const { colors } = useTheme();
  const [region, setRegion] = useState({
    latitude: restaurantLocation.latitude,
    longitude: restaurantLocation.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    getCurrentLocation();
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      if (!isMountedRef.current) return;

      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const getMapRegion = () => {
    const locations = [
      restaurantLocation,
      deliveryPersonLocation,
      customerLocation,
      userLocation,
    ].filter(Boolean);

    if (locations.length === 0) return region;

    const latitudes = locations.map(loc => loc!.latitude);
    const longitudes = locations.map(loc => loc!.longitude);

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    const deltaLat = Math.max(maxLat - minLat, 0.01) * 1.2;
    const deltaLng = Math.max(maxLng - minLng, 0.01) * 1.2;

    return {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: deltaLat,
      longitudeDelta: deltaLng,
    };
  };

  const getRouteCoordinates = () => {
    const coordinates = [restaurantLocation];
    
    if (deliveryPersonLocation) {
      coordinates.push(deliveryPersonLocation);
    }
    
    if (customerLocation) {
      coordinates.push(customerLocation);
    }

    return coordinates;
  };

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        <View style={styles.mapPlaceholder}>
          <View style={styles.mapContent}>
            <Icons.Location size={48} color={colors.primary[500]} />
            <ProfessionalText variant="h4" color={colors.neutral[900]} style={{ marginTop: 16, marginBottom: 8 }}>
              Live Order Tracking
            </ProfessionalText>
            <ProfessionalText variant="body2" color={colors.neutral[600]} style={{ textAlign: 'center', marginBottom: 16 }}>
              Real-time delivery tracking for order #{orderId.slice(-6)}
            </ProfessionalText>
            
            <View style={styles.trackingInfo}>
              <View style={styles.locationItem}>
                <View style={[styles.locationDot, { backgroundColor: '#EF4444' }]} />
                <ProfessionalText variant="body2" color={colors.neutral[700]}>
                  🏪 {restaurantLocation.name}
                </ProfessionalText>
              </View>
              
              {deliveryPersonLocation && (
                <View style={styles.locationItem}>
                  <View style={[styles.locationDot, { backgroundColor: '#3B82F6' }]} />
                  <ProfessionalText variant="body2" color={colors.neutral[700]}>
                    🚚 {deliveryPersonLocation.name}
                  </ProfessionalText>
                </View>
              )}
              
              {customerLocation && (
                <View style={styles.locationItem}>
                  <View style={[styles.locationDot, { backgroundColor: '#10B981' }]} />
                  <ProfessionalText variant="body2" color={colors.neutral[700]}>
                    🏠 Your Location
                  </ProfessionalText>
                </View>
              )}
            </View>
            
            {orderStatus === 'out_for_delivery' && (
              <View style={styles.deliveryStatus}>
                <ProfessionalText variant="body2" color={colors.primary[600]}>
                  🚚 Out for delivery - Driver is on the way!
                </ProfessionalText>
              </View>
            )}
          </View>
        </View>
      ) : (
        <View style={styles.mapPlaceholder}>
          <ProfessionalText variant="body1" color={colors.neutral[600]}>
            Map functionality requires native build
          </ProfessionalText>
        </View>
      )}

      {/* Status Overlay */}
      <View style={styles.statusOverlay}>
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Icons.Clock size={20} color={colors.primary[500]} />
            <ProfessionalText variant="body1" color={colors.neutral[900]} style={{ marginLeft: 8 }}>
              Order Status
            </ProfessionalText>
          </View>
          
          <ProfessionalText variant="h4" color={colors.neutral[900]} style={{ marginTop: 8 }}>
            Order #{orderId.slice(-6)}
          </ProfessionalText>
          
          <View style={styles.statusInfo}>
            <ProfessionalText variant="body2" color={colors.neutral[600]}>
              {orderStatus === 'preparing' && '🍳 Preparing your order'}
              {orderStatus === 'out_for_delivery' && '🚚 Out for delivery'}
              {orderStatus === 'delivered' && '✅ Delivered'}
            </ProfessionalText>
            
            {deliveryPersonLocation && (
              <ProfessionalText variant="body2" color={colors.neutral[500]} style={{ marginTop: 4 }}>
                Delivery person is on the way
              </ProfessionalText>
            )}
          </View>
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
          <ProfessionalText variant="caption" color={colors.neutral[600]}>
            Restaurant
          </ProfessionalText>
        </View>
        
        {deliveryPersonLocation && (
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
            <ProfessionalText variant="caption" color={colors.neutral[600]}>
              Delivery Person
            </ProfessionalText>
          </View>
        )}
        
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
          <ProfessionalText variant="caption" color={colors.neutral[600]}>
            Your Location
          </ProfessionalText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContent: {
    alignItems: 'center',
    padding: 20,
  },
  trackingInfo: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  deliveryStatus: {
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    alignItems: 'center',
  },
  statusOverlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusInfo: {
    marginTop: 8,
  },
  legend: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
});

export default OrderTrackingMap;
