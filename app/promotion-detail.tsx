import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../lib/designSystem';
import { Icons } from '../lib/icons';
import { getPromotions } from '../lib/supabase';
import { UnifiedText, Heading1, Heading2, Heading3, BodyText, CaptionText, ButtonText } from '../components/UnifiedText';
import { usePromotionStore } from '../store/promotion.store';
import { PromotionService } from '../lib/promotionService';
import useAuthStore from '../store/auth.store';

const { width } = Dimensions.get('window');

const PromotionDetail = () => {
  const { promotionId } = useLocalSearchParams();
  const [promotion, setPromotion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  
  const { user } = useAuthStore();
  const { 
    applyPromotion, 
    isPromotionApplied, 
    isApplying 
  } = usePromotionStore();

  useEffect(() => {
    loadPromotion();
  }, [promotionId]);

  const loadPromotion = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading promotion with ID:', promotionId);
      const promotions = await getPromotions();
      console.log('📊 Available promotions:', promotions?.length || 0);
      console.log('🎯 Looking for promotion ID:', promotionId);
      
      const foundPromotion = promotions.find(p => p.id === promotionId);
      console.log('✅ Found promotion:', foundPromotion);
      
      if (!foundPromotion) {
        console.log('❌ Promotion not found');
        Alert.alert('Promotion Not Found', 'This promotion is no longer available.');
        router.back();
        return;
      }
      
      setPromotion(foundPromotion);
    } catch (error) {
      console.error('❌ Error loading promotion:', error);
      Alert.alert('Error', 'Failed to load promotion details.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPromotion = async () => {
    if (!user) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to apply promotions.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/(auth)/sign-in') },
        ]
      );
      return;
    }

    if (!promotion) return;

    setApplying(true);

    try {
      // Apply promotion using the store
      const result = await applyPromotion(promotion);
      
      if (result.success) {
        Alert.alert(
          'Promotion Applied!',
          result.message,
          [
            { text: 'Continue Shopping', onPress: () => router.push('/(tabs)/index') },
            { text: 'View Cart', onPress: () => router.push('/(tabs)/cart') },
          ]
        );
      } else {
        Alert.alert('Cannot Apply Promotion', result.message);
      }
    } catch (error) {
      console.error('Error applying promotion:', error);
      Alert.alert('Error', 'Failed to apply promotion. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  const handleSharePromotion = () => {
    Alert.alert('Share Promotion', 'Share this promotion with friends!');
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.neutral[50] }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <UnifiedText variant="body1" color={Colors.neutral[600]}>
            Loading promotion...
          </UnifiedText>
        </View>
      </SafeAreaView>
    );
  }

  if (!promotion) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.neutral[50] }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.lg }}>
          <UnifiedText variant="h3" color={Colors.neutral[900]} align="center">
            Promotion Not Found
          </UnifiedText>
          <UnifiedText variant="body1" color={Colors.neutral[600]} align="center" style={{ marginTop: Spacing.sm }}>
            This promotion is no longer available.
          </UnifiedText>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              backgroundColor: Colors.primary[500],
              paddingHorizontal: Spacing.lg,
              paddingVertical: Spacing.md,
              borderRadius: BorderRadius.lg,
              marginTop: Spacing.lg,
            }}
          >
            <ButtonText color="#FFFFFF">Go Back</ButtonText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.neutral[50] }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: Colors.neutral[200],
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: Colors.neutral[100],
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icons.ArrowBack size={20} color={Colors.neutral[700]} />
        </TouchableOpacity>
        
        <UnifiedText variant="h5" color={Colors.neutral[900]}>
          Special Offer
        </UnifiedText>
        
        <TouchableOpacity
          onPress={handleSharePromotion}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: Colors.neutral[100],
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icons.Share size={20} color={Colors.neutral[700]} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Promotion Image */}
        {promotion.image_url && (
          <View style={{ height: 250, width: '100%' }}>
            <Image
              source={{ uri: promotion.image_url }}
              style={{ 
                width: '100%', 
                height: '100%',
                resizeMode: 'cover'
              }}
            />
            {/* Discount Badge Overlay */}
            <View style={{
              position: 'absolute',
              top: Spacing.lg,
              right: Spacing.lg,
              backgroundColor: Colors.primary[500],
              borderRadius: BorderRadius.lg,
              paddingHorizontal: Spacing.md,
              paddingVertical: Spacing.sm,
            }}>
              <UnifiedText variant="h4" color="#FFFFFF" align="center">
                {promotion.discount_type === 'percentage' 
                  ? `${promotion.discount}% OFF` 
                  : `€${promotion.discount} OFF`
                }
              </UnifiedText>
            </View>
          </View>
        )}

        {/* Content */}
        <View style={{ padding: Spacing.lg }}>
          {/* Title */}
          <Heading1 color={Colors.neutral[900]} style={{ marginBottom: Spacing.sm }}>
            {promotion.title}
          </Heading1>

          {/* Description */}
          <BodyText color={Colors.neutral[700]} style={{ marginBottom: Spacing.lg }}>
            {promotion.description}
          </BodyText>

          {/* Discount Details */}
          <View style={{
            backgroundColor: Colors.primary[50],
            borderRadius: BorderRadius.lg,
            padding: Spacing.lg,
            marginBottom: Spacing.lg,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm }}>
              <Icons.Percent size={24} color={Colors.primary[600]} />
              <Heading3 color={Colors.primary[900]} style={{ marginLeft: Spacing.sm }}>
                Discount Details
              </Heading3>
            </View>
            
            <BodyText color={Colors.primary[800]} style={{ marginBottom: Spacing.sm }}>
              {promotion.discount_type === 'percentage' 
                ? `Save ${promotion.discount}% on your order`
                : `Save €${promotion.discount} on your order`
              }
            </BodyText>
            
            <CaptionText color={Colors.primary[700]}>
              Valid until {new Date(promotion.valid_until).toLocaleDateString()}
            </CaptionText>
          </View>

          {/* Terms & Conditions */}
          {promotion.terms && (
            <View style={{
              backgroundColor: Colors.neutral[100],
              borderRadius: BorderRadius.lg,
              padding: Spacing.lg,
              marginBottom: Spacing.lg,
            }}>
              <Heading3 color={Colors.neutral[900]} style={{ marginBottom: Spacing.sm }}>
                Terms & Conditions
              </Heading3>
              <BodyText color={Colors.neutral[700]}>
                {promotion.terms}
              </BodyText>
            </View>
          )}

          {/* Action Buttons */}
          <View style={{ gap: Spacing.md }}>
            {isPromotionApplied(promotion.id) ? (
              <View style={{
                backgroundColor: Colors.success[100],
                borderRadius: BorderRadius.lg,
                paddingVertical: Spacing.lg,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                borderWidth: 1,
                borderColor: Colors.success[300],
              }}>
                <Icons.CheckCircle size={20} color={Colors.success[600]} style={{ marginRight: Spacing.sm }} />
                <ButtonText color={Colors.success[700]}>Promotion Applied</ButtonText>
              </View>
            ) : (
              <TouchableOpacity
                onPress={handleApplyPromotion}
                disabled={applying || isApplying}
                style={{
                  backgroundColor: applying || isApplying ? Colors.neutral[300] : Colors.primary[500],
                  borderRadius: BorderRadius.lg,
                  paddingVertical: Spacing.lg,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                }}
              >
                {applying || isApplying ? (
                  <>
                    <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: Spacing.sm }} />
                    <ButtonText color="#FFFFFF">Applying...</ButtonText>
                  </>
                ) : (
                  <>
                    <Icons.Check size={20} color="#FFFFFF" style={{ marginRight: Spacing.sm }} />
                    <ButtonText color="#FFFFFF">Apply Promotion</ButtonText>
                  </>
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => router.push('/(tabs)/index')}
              style={{
                backgroundColor: Colors.neutral[100],
                borderRadius: BorderRadius.lg,
                paddingVertical: Spacing.lg,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
              }}
            >
              <Icons.ShoppingBag size={20} color={Colors.neutral[700]} style={{ marginRight: Spacing.sm }} />
              <ButtonText color={Colors.neutral[700]}>Continue Shopping</ButtonText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default PromotionDetail;
