/**
 * RESTAURANT STORE
 * Global state management for multi-restaurant functionality
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string;
  cuisine_type: string;
  phone: string;
  email: string;
  logo_url: string;
  cover_image_url: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  delivery_radius: number; // km
  delivery_fee: number;
  minimum_order: number;
  preparation_time: number; // minutes
  is_active: boolean;
  is_featured: boolean;
  rating: number;
  total_reviews: number;
  created_at: string;
  updated_at: string;
}

export interface RestaurantHours {
  day_of_week: number; // 0=Sunday, 1=Monday, etc.
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

interface RestaurantState {
  selectedRestaurant: Restaurant | null;
  restaurants: Restaurant[];
  nearbyRestaurants: Restaurant[];
  favoriteRestaurants: string[]; // restaurant IDs
  userLocation: {
    latitude: number;
    longitude: number;
  } | null;
  
  // Actions
  setSelectedRestaurant: (restaurant: Restaurant | null) => void;
  setRestaurants: (restaurants: Restaurant[]) => void;
  setNearbyRestaurants: (restaurants: Restaurant[]) => void;
  addFavoriteRestaurant: (restaurantId: string) => void;
  removeFavoriteRestaurant: (restaurantId: string) => void;
  setUserLocation: (location: { latitude: number; longitude: number } | null) => void;
  clearSelection: () => void;
  
  // Computed
  isRestaurantOpen: (restaurant: Restaurant, hours?: RestaurantHours[]) => boolean;
  getDistanceToRestaurant: (restaurant: Restaurant) => number | null;
}

const useRestaurantStore = create<RestaurantState>()(
  persist(
    (set, get) => ({
      selectedRestaurant: null,
      restaurants: [],
      nearbyRestaurants: [],
      favoriteRestaurants: [],
      userLocation: null,

      setSelectedRestaurant: (restaurant) => {
        set({ selectedRestaurant: restaurant });
      },

      setRestaurants: (restaurants) => {
        set({ restaurants });
      },

      setNearbyRestaurants: (restaurants) => {
        set({ nearbyRestaurants: restaurants });
      },

      addFavoriteRestaurant: (restaurantId) => {
        set((state) => ({
          favoriteRestaurants: [...state.favoriteRestaurants, restaurantId],
        }));
      },

      removeFavoriteRestaurant: (restaurantId) => {
        set((state) => ({
          favoriteRestaurants: state.favoriteRestaurants.filter(id => id !== restaurantId),
        }));
      },

      setUserLocation: (location) => {
        set({ userLocation: location });
      },

      clearSelection: () => {
        set({ selectedRestaurant: null });
      },

      // Check if restaurant is currently open
      isRestaurantOpen: (restaurant, hours = []) => {
        if (!restaurant.is_active) return false;
        if (hours.length === 0) return true; // No hours set = always open

        const now = new Date();
        const currentDay = now.getDay();
        const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"

        const todayHours = hours.find(h => h.day_of_week === currentDay);
        if (!todayHours || todayHours.is_closed) return false;

        return currentTime >= todayHours.open_time && currentTime <= todayHours.close_time;
      },

      // Calculate distance using Haversine formula
      getDistanceToRestaurant: (restaurant) => {
        const { userLocation } = get();
        if (!userLocation) return null;

        const R = 6371; // Earth's radius in km
        const dLat = toRad(restaurant.latitude - userLocation.latitude);
        const dLon = toRad(restaurant.longitude - userLocation.longitude);

        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(toRad(userLocation.latitude)) *
          Math.cos(toRad(restaurant.latitude)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        return Math.round(distance * 10) / 10; // Round to 1 decimal
      },
    }),
    {
      name: 'restaurant-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        selectedRestaurant: state.selectedRestaurant,
        favoriteRestaurants: state.favoriteRestaurants,
        userLocation: state.userLocation,
      }),
    }
  )
);

// Helper function
function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export default useRestaurantStore;


