import React from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { Colors, Spacing, BorderRadius } from '../lib/designSystem';
import { Icons } from '../lib/icons';
import { UnifiedText, Heading3, BodyText, CaptionText } from './UnifiedText';
import { usePromotionStore } from '../store/promotion.store';

interface AppliedPromotionsProps {
  onRemovePromotion?: (promotionId: string) => void;
  showRemoveButton?: boolean;
}

export const AppliedPromotions: React.FC<AppliedPromotionsProps> = ({
  onRemovePromotion,
  showRemoveButton = true,
}) => {
  const { appliedPromotions, removePromotion } = usePromotionStore();

  const handleRemovePromotion = (promotionId: string) => {
    removePromotion(promotionId);
    onRemovePromotion?.(promotionId);
  };

  if (appliedPromotions.length === 0) {
    return null;
  }

  return (
    <View style={{ marginBottom: Spacing.lg }}>
      <Heading3 color={Colors.neutral[900]} style={{ marginBottom: Spacing.md }}>
        Applied Promotions
      </Heading3>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', gap: Spacing.md }}>
          {appliedPromotions.map((promotion) => (
            <View
              key={promotion.id}
              style={{
                backgroundColor: Colors.primary[50],
                borderRadius: BorderRadius.lg,
                padding: Spacing.md,
                minWidth: 200,
                borderWidth: 1,
                borderColor: Colors.primary[200],
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <BodyText color={Colors.primary[900]} style={{ fontWeight: '600', marginBottom: Spacing.xs }}>
                    {promotion.title}
                  </BodyText>
                  
                  <CaptionText color={Colors.primary[700]} style={{ marginBottom: Spacing.xs }}>
                    {promotion.discount_type === 'percentage' 
                      ? `${promotion.discount}% off`
                      : `€${promotion.discount} off`
                    }
                  </CaptionText>
                  
                  <CaptionText color={Colors.primary[600]}>
                    Applied {new Date(promotion.applied_at).toLocaleDateString()}
                  </CaptionText>
                </View>
                
                {showRemoveButton && (
                  <TouchableOpacity
                    onPress={() => handleRemovePromotion(promotion.id)}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: Colors.error[100],
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginLeft: Spacing.sm,
                    }}
                  >
                    <Icons.X size={14} color={Colors.error[600]} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default AppliedPromotions;

