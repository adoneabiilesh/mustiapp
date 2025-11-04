/**
 * Review Service
 * Handles product and restaurant reviews
 */

import { supabase } from './supabase';

export interface CreateProductReviewParams {
  menu_item_id: string;
  order_id?: string;
  rating: number;
  comment?: string;
  images?: string[];
}

export interface CreateRestaurantReviewParams {
  restaurant_id: string;
  order_id?: string;
  rating: number;
  comment?: string;
  food_rating?: number;
  delivery_rating?: number;
  service_rating?: number;
  images?: string[];
}

/**
 * Create a product review
 */
export const createProductReview = async (params: CreateProductReviewParams) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to review');
    }

    // Check if user has already reviewed this product for this order
    if (params.order_id) {
      const { data: existing } = await supabase
        .from('product_reviews')
        .select('id')
        .eq('user_id', user.id)
        .eq('menu_item_id', params.menu_item_id)
        .eq('order_id', params.order_id)
        .single();

      if (existing) {
        throw new Error('You have already reviewed this product for this order');
      }
    }

    // Check if order exists and user owns it
    if (params.order_id) {
      const { data: order } = await supabase
        .from('orders')
        .select('customer_id, status')
        .eq('id', params.order_id)
        .single();

      if (!order || order.customer_id !== user.id) {
        throw new Error('Order not found or access denied');
      }

      // Verify order is delivered before allowing review
      if (order.status !== 'delivered') {
        throw new Error('Can only review delivered orders');
      }
    }

    const { data, error } = await supabase
      .from('product_reviews')
      .insert({
        menu_item_id: params.menu_item_id,
        user_id: user.id,
        order_id: params.order_id || null,
        rating: params.rating,
        comment: params.comment || null,
        images: params.images || [],
        is_verified: !!params.order_id, // Verified if linked to an order
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error('Error creating product review:', error);
    throw new Error(error.message || 'Failed to create review');
  }
};

/**
 * Create a restaurant review
 */
export const createRestaurantReview = async (params: CreateRestaurantReviewParams) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to review');
    }

    // Check if user has already reviewed this restaurant for this order
    if (params.order_id) {
      const { data: existing } = await supabase
        .from('restaurant_reviews')
        .select('id')
        .eq('user_id', user.id)
        .eq('restaurant_id', params.restaurant_id)
        .eq('order_id', params.order_id)
        .single();

      if (existing) {
        throw new Error('You have already reviewed this restaurant for this order');
      }
    }

    const { data, error } = await supabase
      .from('restaurant_reviews')
      .insert({
        restaurant_id: params.restaurant_id,
        user_id: user.id,
        order_id: params.order_id || null,
        rating: params.rating,
        comment: params.comment || null,
        food_rating: params.food_rating || null,
        delivery_rating: params.delivery_rating || null,
        service_rating: params.service_rating || null,
        images: params.images || [],
        is_verified: !!params.order_id,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error('Error creating restaurant review:', error);
    throw new Error(error.message || 'Failed to create review');
  }
};

/**
 * Get product reviews
 */
export const getProductReviews = async (menuItemId: string, limit = 10, offset = 0) => {
  try {
    const { data, error } = await supabase
      .from('product_reviews')
      .select(`
        *,
        user:users(id, name, avatar)
      `)
      .eq('menu_item_id', menuItemId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return data || [];
  } catch (error: any) {
    console.error('Error getting product reviews:', error);
    return [];
  }
};

/**
 * Get restaurant reviews
 */
export const getRestaurantReviews = async (restaurantId: string, limit = 10, offset = 0) => {
  try {
    const { data, error } = await supabase
      .from('restaurant_reviews')
      .select(`
        *,
        user:users(id, name, avatar)
      `)
      .eq('restaurant_id', restaurantId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return data || [];
  } catch (error: any) {
    console.error('Error getting restaurant reviews:', error);
    return [];
  }
};

/**
 * Mark review as helpful
 */
export const markReviewHelpful = async (reviewId: string, reviewType: 'product' | 'restaurant') => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated');
    }

    // Check if already voted
    const { data: existing } = await supabase
      .from('review_helpful_votes')
      .select('id')
      .eq('review_id', reviewId)
      .eq('review_type', reviewType)
      .eq('user_id', user.id)
      .single();

    if (existing) {
      // Remove vote
      await supabase
        .from('review_helpful_votes')
        .delete()
        .eq('review_id', reviewId)
        .eq('review_type', reviewType)
        .eq('user_id', user.id);

      // Decrement helpful count
      const table = reviewType === 'product' ? 'product_reviews' : 'restaurant_reviews';
      await supabase.rpc('decrement_helpful_count', {
        review_id_param: reviewId,
      });

      return { helpful: false };
    } else {
      // Add vote
      await supabase
        .from('review_helpful_votes')
        .insert({
          review_id: reviewId,
          review_type: reviewType,
          user_id: user.id,
        });

      // Increment helpful count
      const table = reviewType === 'product' ? 'product_reviews' : 'restaurant_reviews';
      await supabase.rpc('increment_helpful_count', {
        review_id_param: reviewId,
      });

      return { helpful: true };
    }
  } catch (error: any) {
    console.error('Error marking review helpful:', error);
    throw new Error(error.message || 'Failed to mark review helpful');
  }
};

