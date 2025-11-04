/**
 * Restaurant Service
 * Fetches restaurant configuration from database instead of hardcoded values
 */

import { supabase } from './supabase';

export interface RestaurantSettings {
  id: string;
  restaurant_id: string;
  tagline?: string;
  primary_color: string;
  secondary_color?: string;
  accent_color?: string;
  facebook_url?: string;
  instagram_url?: string;
  twitter_url?: string;
  loyalty_points_per_euro: number;
  euro_per_point: number;
  loyalty_tiers: any[];
  referral_enabled: boolean;
  referral_reward_amount: number;
  referrer_reward_amount: number;
  minimum_order_for_reward: number;
  free_delivery_threshold: number;
  default_delivery_time: string;
  features: {
    hasDelivery: boolean;
    hasPickup: boolean;
    hasDineIn: boolean;
    hasOnlineOrdering: boolean;
    hasLoyaltyProgram: boolean;
    hasReferralProgram: boolean;
    acceptsCash: boolean;
    acceptsCards: boolean;
    acceptsDigitalWallets: boolean;
  };
  payment_methods: Array<{
    id: string;
    name: string;
    icon: string;
    enabled: boolean;
  }>;
  delivery_areas: Array<{
    name: string;
    deliveryTime: string;
    fee: number;
  }>;
  dietary_options: Array<{
    name: string;
    icon: string;
    available: boolean;
  }>;
  allergens: string[];
}

export interface RestaurantConfig {
  id: string;
  name: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: any;
  delivery_fee: number;
  minimum_order: number;
  delivery_radius: number;
  rating: number;
  total_reviews: number;
  settings?: RestaurantSettings;
  hours?: Array<{
    day_of_week: number;
    open_time?: string;
    close_time?: string;
    is_closed: boolean;
  }>;
}

/**
 * Get restaurant configuration from database
 */
export const getRestaurantConfig = async (restaurantId?: string): Promise<RestaurantConfig | null> => {
  try {
    // Get restaurant ID (use provided or fetch default/active)
    let targetRestaurantId = restaurantId;
    
    if (!targetRestaurantId) {
      // Get first active restaurant
      const { data: restaurants, error: restaurantError } = await supabase
        .from('restaurants')
        .select('id')
        .eq('is_active', true)
        .limit(1)
        .single();
      
      if (restaurantError || !restaurants) {
        console.error('Error fetching restaurant:', restaurantError);
        return null;
      }
      
      targetRestaurantId = restaurants.id;
    }

    // Fetch restaurant and settings together
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select(`
        *,
        restaurant_settings (*),
        restaurant_hours (*)
      `)
      .eq('id', targetRestaurantId)
      .single();

    if (restaurantError || !restaurant) {
      console.error('Error fetching restaurant config:', restaurantError);
      return null;
    }

    return {
      id: restaurant.id,
      name: restaurant.name,
      description: restaurant.description,
      phone: restaurant.phone,
      email: restaurant.email,
      address: restaurant.address,
      delivery_fee: restaurant.delivery_fee || 2.99,
      minimum_order: restaurant.minimum_order || 15.00,
      delivery_radius: restaurant.delivery_radius || 5,
      rating: restaurant.rating || 0,
      total_reviews: restaurant.total_reviews || 0,
      settings: restaurant.restaurant_settings?.[0] as RestaurantSettings | undefined,
      hours: restaurant.restaurant_hours || [],
    };
  } catch (error) {
    console.error('Error in getRestaurantConfig:', error);
    return null;
  }
};

/**
 * Get restaurant settings with fallback to defaults
 */
export const getRestaurantSettings = async (restaurantId?: string): Promise<RestaurantSettings | null> => {
  try {
    const config = await getRestaurantConfig(restaurantId);
    return config?.settings || null;
  } catch (error) {
    console.error('Error in getRestaurantSettings:', error);
    return null;
  }
};

/**
 * Get default restaurant settings (fallback when DB is unavailable)
 */
export const getDefaultRestaurantSettings = (): RestaurantSettings => {
  return {
    id: '',
    restaurant_id: '',
    tagline: 'Authentic Italian Taste',
    primary_color: '#E53E3E',
    secondary_color: '#FED7D7',
    accent_color: '#F6AD55',
    loyalty_points_per_euro: 1,
    euro_per_point: 0.01,
    loyalty_tiers: [
      { name: 'Bronze', points: 0, benefits: ['Welcome bonus'] },
      { name: 'Silver', points: 500, benefits: ['Free delivery', '5% discount'] },
      { name: 'Gold', points: 1000, benefits: ['Free delivery', '10% discount', 'Priority support'] },
      { name: 'Platinum', points: 2000, benefits: ['Free delivery', '15% discount', 'Exclusive offers', 'Birthday surprise'] },
    ],
    referral_enabled: true,
    referral_reward_amount: 5.00,
    referrer_reward_amount: 5.00,
    minimum_order_for_reward: 20.00,
    free_delivery_threshold: 25.00,
    default_delivery_time: '25-35 min',
    features: {
      hasDelivery: true,
      hasPickup: true,
      hasDineIn: true,
      hasOnlineOrdering: true,
      hasLoyaltyProgram: true,
      hasReferralProgram: true,
      acceptsCash: true,
      acceptsCards: true,
      acceptsDigitalWallets: true,
    },
    payment_methods: [
      { id: 'card', name: 'Credit/Debit Card', icon: '💳', enabled: true },
      { id: 'cash', name: 'Cash on Delivery', icon: '💵', enabled: true },
      { id: 'apple_pay', name: 'Apple Pay', icon: '📱', enabled: true },
      { id: 'google_pay', name: 'Google Pay', icon: '📱', enabled: true },
      { id: 'paypal', name: 'PayPal', icon: '💰', enabled: true },
    ],
    delivery_areas: [
      { name: 'Downtown', deliveryTime: '20-30 min', fee: 2.99 },
      { name: 'Midtown', deliveryTime: '25-35 min', fee: 2.99 },
      { name: 'Uptown', deliveryTime: '30-40 min', fee: 3.99 },
      { name: 'Suburbs', deliveryTime: '35-45 min', fee: 4.99 },
    ],
    dietary_options: [
      { name: 'Vegetarian', icon: '🌱', available: true },
      { name: 'Vegan', icon: '🌿', available: true },
      { name: 'Gluten-Free', icon: '🌾', available: true },
      { name: 'Keto', icon: '🥑', available: false },
      { name: 'Low-Carb', icon: '🥗', available: true },
    ],
    allergens: ['Gluten', 'Dairy', 'Eggs', 'Nuts', 'Soy'],
  };
};

/**
 * Get restaurant settings with smart fallback
 */
export const getRestaurantSettingsWithFallback = async (restaurantId?: string): Promise<RestaurantSettings> => {
  const settings = await getRestaurantSettings(restaurantId);
  if (settings) {
    return settings;
  }
  
  // Return defaults if DB fetch fails
  console.warn('Using default restaurant settings (database unavailable)');
  return getDefaultRestaurantSettings();
};

