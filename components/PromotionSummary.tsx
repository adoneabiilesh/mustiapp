import React from 'react';
import { View } from 'react-native';
import { Colors, Spacing, BorderRadius } from '../lib/designSystem';
import { Icons } from '../lib/icons';
import { UnifiedText, BodyText, CaptionText, PriceText } from './UnifiedText';
import { usePromotionStore } from '../store/promotion.store';
import { useCartStore } from '../store/cart.store';

interface PromotionSummaryProps {
  showAppliedPromotions?: boolean;
}

export const PromotionSummary: React.FC<PromotionSummaryProps> = ({
  showAppliedPromotions = true,
}) => {
  const { appliedPromotions, getTotalDiscount } = usePromotionStore();
  const { getSubtotal, getDiscountAmount, getFinalTotal } = useCartStore();

  const subtotal = getSubtotal();
  const discountAmount = getDiscountAmount();
  const finalTotal = getFinalTotal();

  if (appliedPromotions.length === 0) {
    return null;
  }

  return (
    <View style={{
      backgroundColor: Colors.neutral[50],
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      marginBottom: Spacing.lg,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md }}>
        <Icons.Percent size={20} color={Colors.primary[600]} />
        <UnifiedText variant="h6" color={Colors.neutral[900]} style={{ marginLeft: Spacing.sm }}>
          Promotion Summary
        </UnifiedText>
      </View>

      {showAppliedPromotions && (
        <View style={{ marginBottom: Spacing.md }}>
          {appliedPromotions.map((promotion) => (
            <View key={promotion.id} style={{ marginBottom: Spacing.xs }}>
              <BodyText color={Colors.neutral[700]} style={{ fontSize: 14 }}>
                {promotion.title}
                {promotion.discount_type === 'percentage' 
                  ? ` (${promotion.discount}% off)`
                  : ` (€${promotion.discount} off)`
                }
              </BodyText>
            </View>
          ))}
        </View>
      )}

      <View style={{
        borderTopWidth: 1,
        borderTopColor: Colors.neutral[200],
        paddingTop: Spacing.md,
      }}>
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: Spacing.sm 
        }}>
          <BodyText color={Colors.neutral[700]}>Subtotal</BodyText>
          <PriceText color={Colors.neutral[700]}>€{subtotal.toFixed(2)}</PriceText>
        </View>

        {discountAmount > 0 && (
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: Spacing.sm 
          }}>
            <BodyText color={Colors.success[600]}>Discount</BodyText>
            <PriceText color={Colors.success[600]}>-€{discountAmount.toFixed(2)}</PriceText>
          </View>
        )}

        <View style={{
          borderTopWidth: 1,
          borderTopColor: Colors.neutral[200],
          paddingTop: Spacing.sm,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <UnifiedText variant="h5" color={Colors.neutral[900]} style={{ fontWeight: '600' }}>
            Total
          </UnifiedText>
          <PriceText color={Colors.neutral[900]} style={{ fontSize: 18, fontWeight: '700' }}>
            €{finalTotal.toFixed(2)}
          </PriceText>
        </View>

        {discountAmount > 0 && (
          <CaptionText color={Colors.success[600]} style={{ marginTop: Spacing.xs, textAlign: 'center' }}>
            You saved €{discountAmount.toFixed(2)}!
          </CaptionText>
        )}
      </View>
    </View>
  );
};

export default PromotionSummary;

