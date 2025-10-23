'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useQuery } from '@tanstack/react-query';
import { getCourierLocation, subscribeToCourierLocation, Order } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';

// Fix for default markers in Next.js
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-ignore
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconUrl: markerIcon.src,
  iconRetinaUrl: markerIcon2x.src,
  shadowUrl: markerShadow.src,
});

// Custom courier icon
const courierIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="1" y="3" width="15" height="13"></rect>
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
      <circle cx="5.5" cy="18.5" r="2.5"></circle>
      <circle cx="18.5" cy="18.5" r="2.5"></circle>
    </svg>
  `),
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

// Custom destination icon
const destinationIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="#4CAF50" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3" fill="white"></circle>
    </svg>
  `),
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

interface DeliveryMapProps {
  order: Order;
  courierId?: string | null;
}

export default function DeliveryMap({ order, courierId }: DeliveryMapProps) {
  const queryClient = useQueryClient();
  const [courierPosition, setCourierPosition] = useState<[number, number] | null>(null);

  // Fetch courier location
  const { data: courierLocation } = useQuery({
    queryKey: ['courier-location', courierId],
    queryFn: () => courierId ? getCourierLocation(courierId) : null,
    enabled: !!courierId,
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  // Real-time subscription for courier location
  useEffect(() => {
    if (!courierId) return;

    const unsubscribe = subscribeToCourierLocation(courierId, (payload) => {
      console.log('Courier location update:', payload);
      queryClient.invalidateQueries({ queryKey: ['courier-location', courierId] });
    });

    return () => {
      unsubscribe();
    };
  }, [courierId, queryClient]);

  // Update courier position when location changes
  useEffect(() => {
    if (courierLocation?.location) {
      const [lng, lat] = courierLocation.location.coordinates;
      setCourierPosition([lat, lng]);
    }
  }, [courierLocation]);

  // Get destination coordinates from delivery address
  // In a real app, you'd geocode the address to get coordinates
  // For demo, using Rome coordinates + small offset based on address
  const getDestinationCoords = (): [number, number] => {
    // Rome center coordinates
    const baseCoords: [number, number] = [41.9028, 12.4964];
    
    // Add small random offset for demo (in real app, use geocoding)
    const hash = order.delivery_address?.street?.length || 0;
    return [
      baseCoords[0] + (hash % 10) * 0.001,
      baseCoords[1] + (hash % 10) * 0.001,
    ];
  };

  const destinationCoords = getDestinationCoords();
  
  // Default map center (Rome, Italy)
  const defaultCenter: LatLngExpression = [41.9028, 12.4964];
  const center = courierPosition || destinationCoords || defaultCenter;

  // Calculate route (simplified - in real app, use routing API)
  const route: LatLngExpression[] = courierPosition 
    ? [courierPosition, destinationCoords]
    : [];

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Destination Marker */}
      <Marker position={destinationCoords} icon={destinationIcon}>
        <Popup>
          <div className="p-2">
            <p className="font-bold mb-1">Delivery Destination</p>
            <p className="text-sm">
              {order.delivery_address?.street}<br />
              {order.delivery_address?.city}, {order.delivery_address?.state}
            </p>
          </div>
        </Popup>
      </Marker>

      {/* Courier Marker (if location available) */}
      {courierPosition && (
        <>
          <Marker position={courierPosition} icon={courierIcon}>
            <Popup>
              <div className="p-2">
                <p className="font-bold mb-1">Courier Location</p>
                <p className="text-sm">
                  {order.deliveries?.[0]?.courier?.name || 'Courier'}
                </p>
                {courierLocation?.speed && (
                  <p className="text-xs text-gray-600 mt-1">
                    Speed: {(courierLocation.speed * 3.6).toFixed(1)} km/h
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Updated: {new Date(courierLocation?.updated_at || '').toLocaleTimeString()}
                </p>
              </div>
            </Popup>
          </Marker>

          {/* Route line */}
          {route.length > 1 && (
            <Polyline
              positions={route}
              color="#FF6B35"
              weight={4}
              opacity={0.7}
              dashArray="10, 10"
            />
          )}
        </>
      )}
    </MapContainer>
  );
}



