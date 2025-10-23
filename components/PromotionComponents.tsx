import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/lib/designSystem';
import { Icons } from '@/lib/icons';
import { getImageSource } from '@/lib/imageUtils';

// Professional Promotion Banner
export const PromotionBanner: React.FC<{
  promotion: {
    id: string;
    title: string;
    description: string;
    discount: number;
    discountType: 'percentage' | 'fixed';
    image: string;
    validUntil: string;
    terms?: string;
  };
  onPress: () => void;
}> = ({ promotion, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: BorderRadius.lg,
        marginHorizontal: Spacing.md,
        marginVertical: Spacing.sm,
        ...Shadows.md,
      }}
    >
      <View style={{ position: 'relative' }}>
        <Image
          source={getImageSource(promotion.image, promotion.title)}
          style={{
            width: '100%',
            height: 150,
            borderTopLeftRadius: BorderRadius.lg,
            borderTopRightRadius: BorderRadius.lg,
          }}
          resizeMode="cover"
        />
        
        {/* Discount Badge */}
        <View
          style={{
            position: 'absolute',
            top: Spacing.sm,
            right: Spacing.sm,
            backgroundColor: Colors.error[500],
            borderRadius: BorderRadius.md,
            paddingHorizontal: Spacing.sm,
            paddingVertical: Spacing.xs,
          }}
        >
          <Text style={[Typography.label, { color: '#FFFFFF' }]}>
            {promotion.discountType === 'percentage' 
              ? `${promotion.discount}% OFF` 
              : `€${promotion.discount} OFF`
            }
          </Text>
        </View>
        
        {/* Valid Until Badge */}
        <View
          style={{
            position: 'absolute',
            bottom: Spacing.sm,
            left: Spacing.sm,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            borderRadius: BorderRadius.sm,
            paddingHorizontal: Spacing.sm,
            paddingVertical: Spacing.xs,
          }}
        >
          <Text style={[Typography.caption, { color: '#FFFFFF' }]}>
            Valid until {promotion.validUntil}
          </Text>
        </View>
      </View>
      
      <View style={{ padding: Spacing.md }}>
        <Text style={[Typography.h5, { color: Colors.neutral[900], marginBottom: Spacing.sm }]}>
          {promotion.title}
        </Text>
        
        <Text style={[Typography.body2, { color: Colors.neutral[600], marginBottom: Spacing.md }]}>
          {promotion.description}
        </Text>
        
        {promotion.terms && (
          <Text style={[Typography.caption, { color: Colors.neutral[500] }]}>
            {promotion.terms}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

// Professional Promo Code Card
export const PromoCodeCard: React.FC<{
  promoCode: {
    id: string;
    code: string;
    description: string;
    discount: number;
    discountType: 'percentage' | 'fixed';
    minimumOrder: number;
    validUntil: string;
    isUsed: boolean;
  };
  onUse: () => void;
  onCopy: () => void;
}> = ({ promoCode, onUse, onCopy }) => (
  <View
    style={{
      backgroundColor: '#FFFFFF',
      borderRadius: BorderRadius.lg,
      marginHorizontal: Spacing.md,
      marginVertical: Spacing.sm,
      padding: Spacing.md,
      ...Shadows.sm,
      borderWidth: 1,
      borderColor: promoCode.isUsed ? Colors.neutral[300] : Colors.primary[200],
    }}
  >
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm }}>
          <Text style={[Typography.h6, { color: Colors.neutral[900] }]}>
            {promoCode.code}
          </Text>
          <View
            style={{
              backgroundColor: Colors.primary[100],
              borderRadius: BorderRadius.sm,
              paddingHorizontal: Spacing.sm,
              paddingVertical: Spacing.xs,
              marginLeft: Spacing.sm,
            }}
          >
            <Text style={[Typography.caption, { color: Colors.primary[700] }]}>
              {promoCode.discountType === 'percentage' 
                ? `${promoCode.discount}% OFF` 
                : `€${promoCode.discount} OFF`
              }
            </Text>
          </View>
        </View>
        
        <Text style={[Typography.body2, { color: Colors.neutral[600], marginBottom: Spacing.sm }]}>
          {promoCode.description}
        </Text>
        
        <Text style={[Typography.caption, { color: Colors.neutral[500] }]}>
          Min. order: €{promoCode.minimumOrder} • Valid until {promoCode.validUntil}
        </Text>
      </View>
      
      <View style={{ alignItems: 'flex-end' }}>
        {promoCode.isUsed ? (
          <View
            style={{
              backgroundColor: Colors.neutral[200],
              borderRadius: BorderRadius.md,
              paddingHorizontal: Spacing.md,
              paddingVertical: Spacing.sm,
            }}
          >
            <Text style={[Typography.label, { color: Colors.neutral[500] }]}>
              Used
            </Text>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
            <TouchableOpacity
              onPress={onCopy}
              style={{
                backgroundColor: Colors.neutral[100],
                borderRadius: BorderRadius.md,
                paddingHorizontal: Spacing.md,
                paddingVertical: Spacing.sm,
              }}
            >
              <Text style={[Typography.label, { color: Colors.neutral[600] }]}>
                Copy
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={onUse}
              style={{
                backgroundColor: Colors.primary[500],
                borderRadius: BorderRadius.md,
                paddingHorizontal: Spacing.md,
                paddingVertical: Spacing.sm,
              }}
            >
              <Text style={[Typography.label, { color: '#FFFFFF' }]}>
                Use
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  </View>
);

// Professional Loyalty Points Card
export const LoyaltyPointsCard: React.FC<{
  points: number;
  level: string;
  nextLevelPoints: number;
  onRedeem: () => void;
}> = ({ points, level, nextLevelPoints, onRedeem }) => (
  <View
    style={{
      backgroundColor: '#FFFFFF',
      borderRadius: BorderRadius.lg,
      marginHorizontal: Spacing.md,
      marginVertical: Spacing.sm,
      padding: Spacing.lg,
      ...Shadows.md,
    }}
  >
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md }}>
      <View>
        <Text style={[Typography.h5, { color: Colors.neutral[900] }]}>
          Loyalty Points
        </Text>
        <Text style={[Typography.body2, { color: Colors.neutral[600] }]}>
          {level} Member
        </Text>
      </View>
      
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={[Typography.h3, { color: Colors.primary[500] }]}>
          {points}
        </Text>
        <Text style={[Typography.caption, { color: Colors.neutral[500] }]}>
          points
        </Text>
      </View>
    </View>
    
    <View style={{ marginBottom: Spacing.md }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm }}>
        <Text style={[Typography.caption, { color: Colors.neutral[600] }]}>
          Progress to next level
        </Text>
        <Text style={[Typography.caption, { color: Colors.neutral[600] }]}>
          {points}/{nextLevelPoints}
        </Text>
      </View>
      
      <View
        style={{
          height: 6,
          backgroundColor: Colors.neutral[200],
          borderRadius: BorderRadius.sm,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            height: '100%',
            width: `${(points / nextLevelPoints) * 100}%`,
            backgroundColor: Colors.primary[500],
            borderRadius: BorderRadius.sm,
          }}
        />
      </View>
    </View>
    
    <TouchableOpacity
      onPress={onRedeem}
      style={{
        backgroundColor: Colors.primary[500],
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.md,
        alignItems: 'center',
      }}
    >
      <Text style={[Typography.button, { color: '#FFFFFF' }]}>
        Redeem Points
      </Text>
    </TouchableOpacity>
  </View>
);

// Professional Referral Card
export const ReferralCard: React.FC<{
  referralCode: string;
  earnedAmount: number;
  onShare: () => void;
  onCopy: () => void;
}> = ({ referralCode, earnedAmount, onShare, onCopy }) => (
  <View
    style={{
      backgroundColor: '#FFFFFF',
      borderRadius: BorderRadius.lg,
      marginHorizontal: Spacing.md,
      marginVertical: Spacing.sm,
      padding: Spacing.lg,
      ...Shadows.md,
    }}
  >
    <View style={{ alignItems: 'center', marginBottom: Spacing.lg }}>
      <View
        style={{
          width: 60,
          height: 60,
          borderRadius: BorderRadius.full,
          backgroundColor: Colors.primary[100],
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: Spacing.md,
        }}
      >
        <Icons.Gift size={24} color={Colors.primary[500]} />
      </View>
      
      <Text style={[Typography.h5, { color: Colors.neutral[900], marginBottom: Spacing.sm }]}>
        Refer & Earn
      </Text>
      
      <Text style={[Typography.body2, { color: Colors.neutral[600], textAlign: 'center', marginBottom: Spacing.md }]}>
        Share your referral code and earn €{earnedAmount} for each friend who signs up!
      </Text>
    </View>
    
    <View
      style={{
        backgroundColor: Colors.neutral[100],
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Text style={[Typography.h6, { color: Colors.neutral[900] }]}>
        {referralCode}
      </Text>
      
      <TouchableOpacity onPress={onCopy}>
        <Icons.Copy size={20} color={Colors.neutral[600]} />
      </TouchableOpacity>
    </View>
    
    <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
      <TouchableOpacity
        onPress={onShare}
        style={{
          flex: 1,
          backgroundColor: Colors.primary[500],
          borderRadius: BorderRadius.md,
          paddingVertical: Spacing.md,
          alignItems: 'center',
        }}
      >
        <Text style={[Typography.button, { color: '#FFFFFF' }]}>
          Share
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        onPress={onCopy}
        style={{
          flex: 1,
          backgroundColor: Colors.neutral[200],
          borderRadius: BorderRadius.md,
          paddingVertical: Spacing.md,
          alignItems: 'center',
        }}
      >
        <Text style={[Typography.button, { color: Colors.neutral[700] }]}>
          Copy
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);

// Professional Promotions List
export const PromotionsList: React.FC<{
  promotions: Array<{
    id: string;
    title: string;
    description: string;
    discount: number;
    discountType: 'percentage' | 'fixed';
    image: string;
    validUntil: string;
    terms?: string;
  }>;
  onPromotionPress: (promotionId: string) => void;
}> = ({ promotions, onPromotionPress }) => (
  <ScrollView showsVerticalScrollIndicator={false}>
    {promotions.map((promotion) => (
      <PromotionBanner
        key={promotion.id}
        promotion={promotion}
        onPress={() => onPromotionPress(promotion.id)}
      />
    ))}
  </ScrollView>
);

// Export individual components
export {
  PromotionBanner,
  PromoCodeCard,
  LoyaltyPointsCard,
  ReferralCard,
  PromotionsList,
};

export default {
  PromotionBanner,
  PromoCodeCard,
  LoyaltyPointsCard,
  ReferralCard,
  PromotionsList,
};
