import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import * as Location from 'expo-location';
import { Icons } from '@/lib/icons';
import { useTheme } from '../lib/theme';
import { ProfessionalText } from './ProfessionalText';
import { ProfessionalButton } from './ProfessionalButton';

const { width, height } = Dimensions.get('window');

interface MapSelectorProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelected: (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
  initialLocation?: {
    latitude: number;
    longitude: number;
  };
}

const MapSelector: React.FC<MapSelectorProps> = ({
  visible,
  onClose,
  onLocationSelected,
  initialLocation
}) => {
  const { colors } = useTheme();
  const [region, setRegion] = useState({
    latitude: initialLocation?.latitude || 41.9028,
    longitude: initialLocation?.longitude || 12.4964,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('');
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    if (visible) {
      getCurrentLocation();
    }
    
    return () => {
      isMountedRef.current = false;
    };
  }, [visible]);

  const getCurrentLocation = async () => {
    try {
      if (!isMountedRef.current) return;
      setLoading(true);
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        if (isMountedRef.current) {
          Alert.alert(
            'Permission Required',
            'Location permission is required to use this feature.',
            [{ text: 'OK' }]
          );
        }
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      if (!isMountedRef.current) return;

      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setRegion(newRegion);
      setSelectedLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      // Get address from coordinates
      await getAddressFromCoordinates(
        location.coords.latitude,
        location.coords.longitude
      );
    } catch (error) {
      console.error('Error getting location:', error);
      if (isMountedRef.current) {
        Alert.alert('Error', 'Unable to get your current location');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const getAddressFromCoordinates = async (latitude: number, longitude: number) => {
    try {
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (!isMountedRef.current) return;

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        const addressString = [
          address.street,
          address.city,
          address.region,
          address.postalCode,
          address.country,
        ].filter(Boolean).join(', ');
        
        setAddress(addressString);
      }
    } catch (error) {
      console.error('Error getting address:', error);
    }
  };

  const handleMapPress = async (event: any) => {
    if (!isMountedRef.current) return;
    
    const { latitude, longitude } = event.nativeEvent.coordinate;
    
    setSelectedLocation({ latitude, longitude });
    await getAddressFromCoordinates(latitude, longitude);
  };

  const handleConfirmLocation = () => {
    if (selectedLocation && address) {
      onLocationSelected({
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        address,
      });
      onClose();
    } else {
      Alert.alert('Error', 'Please select a location on the map');
    }
  };

  if (!visible) return null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Icons.ArrowBack size={24} color={colors.neutral[600]} />
        </TouchableOpacity>
        <ProfessionalText variant="h3" color={colors.neutral[900]}>
          Select Location
        </ProfessionalText>
        <View style={styles.placeholder} />
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        {Platform.OS === 'web' ? (
          <View style={styles.mapPlaceholder}>
            <View style={styles.mapContent}>
              <Icons.Location size={48} color={colors.primary[500]} />
              <ProfessionalText variant="h4" color={colors.neutral[900]} style={{ marginTop: 16, marginBottom: 8 }}>
                Interactive Map
              </ProfessionalText>
              <ProfessionalText variant="body2" color={colors.neutral[600]} style={{ textAlign: 'center', marginBottom: 16 }}>
                {selectedLocation 
                  ? `Selected: ${region.latitude.toFixed(4)}, ${region.longitude.toFixed(4)}`
                  : 'Tap "Use Current Location" to get your position'
                }
              </ProfessionalText>
              
              {selectedLocation && (
                <View style={styles.selectedLocationInfo}>
                  <ProfessionalText variant="body2" color={colors.primary[600]}>
                    📍 Selected Location
                  </ProfessionalText>
                  <ProfessionalText variant="caption" color={colors.neutral[500]}>
                    {address || 'Address will be detected automatically'}
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
      </View>

      {/* Location Info */}
      <View style={styles.locationInfo}>
        <View style={styles.locationHeader}>
          <Icons.Location size={20} color={colors.primary[500]} />
          <ProfessionalText variant="body1" color={colors.neutral[900]} style={{ marginLeft: 8 }}>
            Selected Location
          </ProfessionalText>
        </View>
        
        {address ? (
          <ProfessionalText variant="body2" color={colors.neutral[600]} style={styles.addressText}>
            {address}
          </ProfessionalText>
        ) : (
          <ProfessionalText variant="body2" color={colors.neutral[500]} style={styles.addressText}>
            Tap on the map to select a location
          </ProfessionalText>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          onPress={getCurrentLocation}
          style={[styles.button, styles.currentLocationButton]}
          disabled={loading}
        >
          <Icons.Location size={20} color={colors.primary[500]} />
          <ProfessionalText variant="body2" color={colors.primary[500]} style={{ marginLeft: 8 }}>
            {loading ? 'Getting Location...' : 'Use Current Location'}
          </ProfessionalText>
        </TouchableOpacity>

        <ProfessionalButton
          title="Confirm Location"
          onPress={handleConfirmLocation}
          disabled={!selectedLocation || !address}
          variant="primary"
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: 40,
  },
  mapContainer: {
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
  selectedLocationInfo: {
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    alignItems: 'center',
  },
  locationInfo: {
    padding: 20,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressText: {
    marginLeft: 28,
    lineHeight: 20,
  },
  actionButtons: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  currentLocationButton: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#0EA5E9',
  },
});

export default MapSelector;
