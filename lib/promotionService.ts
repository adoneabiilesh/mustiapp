import { supabase } from './supabase';

export interface Promotion {
  id: string;
  title: string;
  description: string;
  discount: number;
  discount_type: 'percentage' | 'fixed';
  valid_until: string;
  is_active: boolean;
  minimum_order_amount?: number;
  maximum_discount?: number;
  usage_limit?: number;
  used_count?: number;
  code?: string;
  image_url?: string;
  terms?: string;
  created_at: string;
  updated_at: string;
}

export interface PromotionApplication {
  id: string;
  user_id: string;
  promotion_id: string;
  applied_at: string;
  order_id?: string;
  discount_amount: number;
}

export class PromotionService {
  // Get all active promotions
  static async getActivePromotions(): Promise<Promotion[]> {
    try {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('is_active', true)
        .gt('valid_until', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching promotions:', error);
      throw error;
    }
  }

  // Get promotion by ID
  static async getPromotionById(id: string): Promise<Promotion | null> {
    try {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching promotion:', error);
      return null;
    }
  }

  // Apply promotion to user
  static async applyPromotionToUser(
    userId: string, 
    promotionId: string, 
    orderId?: string
  ): Promise<{ success: boolean; message: string; discountAmount?: number }> {
    try {
      // First, get the promotion details
      const promotion = await this.getPromotionById(promotionId);
      if (!promotion) {
        return { success: false, message: 'Promotion not found' };
      }

      // Check if promotion is still valid
      const now = new Date();
      const validUntil = new Date(promotion.valid_until);
      if (now > validUntil) {
        return { success: false, message: 'This promotion has expired' };
      }

      if (!promotion.is_active) {
        return { success: false, message: 'This promotion is not currently active' };
      }

      // Check usage limit
      if (promotion.usage_limit && promotion.used_count && promotion.used_count >= promotion.usage_limit) {
        return { success: false, message: 'This promotion has reached its usage limit' };
      }

      // Check if user has already applied this promotion
      const { data: existingApplication, error: checkError } = await supabase
        .from('promotion_applications')
        .select('id')
        .eq('user_id', userId)
        .eq('promotion_id', promotionId)
        .is('order_id', null) // Only check for unapplied promotions
        .single();

      if (existingApplication && !checkError) {
        return { success: false, message: 'You have already applied this promotion' };
      }

      // Create promotion application record
      const { data: application, error: applicationError } = await supabase
        .from('promotion_applications')
        .insert({
          user_id: userId,
          promotion_id: promotionId,
          applied_at: new Date().toISOString(),
          order_id: orderId || null,
          discount_amount: 0, // Will be calculated at checkout
        })
        .select()
        .single();

      if (applicationError) throw applicationError;

      // Update promotion usage count
      const { error: updateError } = await supabase
        .from('promotions')
        .update({ 
          used_count: (promotion.used_count || 0) + 1 
        })
        .eq('id', promotionId);

      if (updateError) {
        console.warn('Failed to update promotion usage count:', updateError);
      }

      return { 
        success: true, 
        message: `Applied ${promotion.title} successfully!`,
        discountAmount: 0 // Will be calculated at checkout
      };
    } catch (error) {
      console.error('Error applying promotion:', error);
      return { success: false, message: 'Failed to apply promotion' };
    }
  }

  // Remove promotion from user
  static async removePromotionFromUser(
    userId: string, 
    promotionId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase
        .from('promotion_applications')
        .delete()
        .eq('user_id', userId)
        .eq('promotion_id', promotionId)
        .is('order_id', null); // Only remove unapplied promotions

      if (error) throw error;

      return { success: true, message: 'Promotion removed successfully' };
    } catch (error) {
      console.error('Error removing promotion:', error);
      return { success: false, message: 'Failed to remove promotion' };
    }
  }

  // Get user's applied promotions
  static async getUserAppliedPromotions(userId: string): Promise<PromotionApplication[]> {
    try {
      const { data, error } = await supabase
        .from('promotion_applications')
        .select(`
          *,
          promotions (
            id,
            title,
            description,
            discount,
            discount_type,
            valid_until,
            image_url
          )
        `)
        .eq('user_id', userId)
        .is('order_id', null) // Only get unapplied promotions
        .order('applied_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user promotions:', error);
      return [];
    }
  }

  // Calculate discount amount for a promotion
  static calculateDiscountAmount(
    promotion: Promotion, 
    subtotal: number
  ): number {
    let discountAmount = 0;

    if (promotion.discount_type === 'percentage') {
      discountAmount = (subtotal * promotion.discount) / 100;
    } else {
      discountAmount = promotion.discount;
    }

    // Apply maximum discount limit if specified
    if (promotion.maximum_discount && discountAmount > promotion.maximum_discount) {
      discountAmount = promotion.maximum_discount;
    }

    // Don't exceed subtotal
    return Math.min(discountAmount, subtotal);
  }

  // Validate promotion eligibility
  static validatePromotionEligibility(
    promotion: Promotion,
    subtotal: number = 0
  ): { valid: boolean; message: string } {
    const now = new Date();
    const validUntil = new Date(promotion.valid_until);

    // Check if promotion is still valid
    if (now > validUntil) {
      return { valid: false, message: 'This promotion has expired' };
    }

    // Check if promotion is active
    if (!promotion.is_active) {
      return { valid: false, message: 'This promotion is not currently active' };
    }

    // Check minimum order amount
    if (promotion.minimum_order_amount && subtotal < promotion.minimum_order_amount) {
      return { 
        valid: false, 
        message: `Minimum order of €${promotion.minimum_order_amount} required` 
      };
    }

    return { valid: true, message: 'Promotion is valid' };
  }
}

