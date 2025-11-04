import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AppliedPromotion {
  id: string;
  title: string;
  description: string;
  discount: number;
  discount_type: 'percentage' | 'fixed';
  valid_until: string;
  applied_at: string;
  code?: string;
}

interface PromotionState {
  appliedPromotions: AppliedPromotion[];
  isApplying: boolean;
  
  // Actions
  applyPromotion: (promotion: any) => Promise<{ success: boolean; message: string }>;
  removePromotion: (promotionId: string) => void;
  clearAllPromotions: () => void;
  isPromotionApplied: (promotionId: string) => boolean;
  getTotalDiscount: (subtotal: number) => number;
  validatePromotion: (promotion: any) => { valid: boolean; message: string };
}

export const usePromotionStore = create<PromotionState>()(
  persist(
    (set, get) => ({
      appliedPromotions: [],
      isApplying: false,

      applyPromotion: async (promotion) => {
        const { validatePromotion, isPromotionApplied } = get();
        
        // Check if already applied
        if (isPromotionApplied(promotion.id)) {
          return { success: false, message: 'This promotion is already applied' };
        }

        // Validate promotion
        const validation = validatePromotion(promotion);
        if (!validation.valid) {
          return { success: false, message: validation.message };
        }

        set({ isApplying: true });

        try {
          const appliedPromotion: AppliedPromotion = {
            id: promotion.id,
            title: promotion.title,
            description: promotion.description,
            discount: promotion.discount,
            discount_type: promotion.discount_type,
            valid_until: promotion.valid_until,
            applied_at: new Date().toISOString(),
            code: promotion.code,
          };

          set((state) => ({
            appliedPromotions: [...state.appliedPromotions, appliedPromotion],
            isApplying: false,
          }));

          return { success: true, message: `Applied ${promotion.title} successfully!` };
        } catch (error) {
          set({ isApplying: false });
          return { success: false, message: 'Failed to apply promotion' };
        }
      },

      removePromotion: (promotionId) => {
        set((state) => ({
          appliedPromotions: state.appliedPromotions.filter(p => p.id !== promotionId),
        }));
      },

      clearAllPromotions: () => {
        set({ appliedPromotions: [] });
      },

      isPromotionApplied: (promotionId) => {
        const { appliedPromotions } = get();
        return appliedPromotions.some(p => p.id === promotionId);
      },

      getTotalDiscount: (subtotal) => {
        const { appliedPromotions } = get();
        let totalDiscount = 0;

        appliedPromotions.forEach(promotion => {
          if (promotion.discount_type === 'percentage') {
            totalDiscount += (subtotal * promotion.discount) / 100;
          } else {
            totalDiscount += promotion.discount;
          }
        });

        return Math.min(totalDiscount, subtotal); // Don't exceed subtotal
      },

      validatePromotion: (promotion) => {
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

        // Check minimum order amount if specified
        if (promotion.minimum_order_amount && promotion.minimum_order_amount > 0) {
          return { valid: true, message: `Minimum order of €${promotion.minimum_order_amount} required` };
        }

        return { valid: true, message: 'Promotion is valid' };
      },
    }),
    {
      name: 'promotion-storage',
      partialize: (state) => ({ appliedPromotions: state.appliedPromotions }),
    }
  )
);

