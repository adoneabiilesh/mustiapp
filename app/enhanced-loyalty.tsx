/**
 * ENHANCED LOYALTY PROGRAM
 * Gamified rewards system with tiers and achievements 🏆
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/lib/designSystem';
import { Icons } from '@/lib/icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSmartCache } from '@/lib/performance';
import useAuthStore from '@/store/auth.store';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

interface LoyaltyTier {
  id: string;
  name: string;
  minPoints: number;
  maxPoints: number;
  color: string[];
  benefits: string[];
  icon: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  completed: boolean;
  progress: number;
  total: number;
}

interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  value: number;
  available: boolean;
  expiresAt?: string;
}

const TIERS: LoyaltyTier[] = [
  {
    id: 'bronze',
    name: 'Bronze',
    minPoints: 0,
    maxPoints: 499,
    color: ['#CD7F32', '#8B5A00'],
    benefits: ['5% off orders', 'Birthday reward', 'Earn 1 point per €1'],
    icon: '🥉',
  },
  {
    id: 'silver',
    name: 'Silver',
    minPoints: 500,
    maxPoints: 1499,
    color: ['#C0C0C0', '#808080'],
    benefits: ['10% off orders', 'Free delivery', 'Earn 1.5 points per €1', 'Early access to deals'],
    icon: '🥈',
  },
  {
    id: 'gold',
    name: 'Gold',
    minPoints: 1500,
    maxPoints: 3999,
    color: ['#FFD700', '#FFA500'],
    benefits: ['15% off orders', 'Free delivery + priority', 'Earn 2 points per €1', 'Exclusive menu items'],
    icon: '🥇',
  },
  {
    id: 'platinum',
    name: 'Platinum',
    minPoints: 4000,
    maxPoints: Infinity,
    color: ['#E5E4E2', '#71797E'],
    benefits: ['20% off orders', 'VIP support', 'Earn 3 points per €1', 'Personal chef recommendations'],
    icon: '💎',
  },
];

const EnhancedLoyaltyScreen = () => {
  const { user } = useAuthStore();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'rewards' | 'achievements'>('overview');
  const [currentPoints, setCurrentPoints] = useState(0);
  const [loyaltyData, setLoyaltyData] = useState<any>(null);
  const [rewardsData, setRewardsData] = useState<Reward[]>([]);
  const [userRewards, setUserRewards] = useState<any[]>([]);
  const [pointsHistory, setPointsHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const progressAnim = new Animated.Value(0);

  // Load loyalty data on mount
  useEffect(() => {
    if (user) {
      loadLoyaltyData();
    }
  }, [user]);

  const loadLoyaltyData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { getLoyaltyPoints, getRewards, getUserRewards, getPointsTransactions } = await import('@/lib/database');
      
      // Load all data in parallel
      const [loyalty, rewards, userRewardsData, transactions] = await Promise.all([
        getLoyaltyPoints(user.id),
        getRewards(),
        getUserRewards(user.id),
        getPointsTransactions(user.id, 20),
      ]);

      if (loyalty) {
        setLoyaltyData(loyalty);
        setCurrentPoints(loyalty.points);
      }
      
      setRewardsData(rewards);
      setUserRewards(userRewardsData);
      setPointsHistory(transactions);
      
      if (__DEV__) {
        console.log('🎯 Loaded loyalty data:', {
        points: loyalty?.points,
        tier: loyalty?.tier,
        rewardsCount: rewards.length,
      });
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Error loading loyalty data:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  // Get current tier
  const currentTier = TIERS.find(
    tier => currentPoints >= tier.minPoints && currentPoints <= tier.maxPoints
  ) || TIERS[0];

  const nextTier = TIERS.find(tier => tier.minPoints > currentPoints);

  // Calculate progress to next tier
  const tierProgress = nextTier
    ? ((currentPoints - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100
    : 100;

  // Animate progress bar
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: tierProgress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [tierProgress]);

  // Calculate achievements based on real data
  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'First Order',
      description: 'Place your first order',
      icon: '🎉',
      points: 50,
      completed: (loyaltyData?.total_earned || 0) >= 50,
      progress: (loyaltyData?.total_earned || 0) >= 50 ? 1 : 0,
      total: 1,
    },
    {
      id: '2',
      title: 'Points Collector',
      description: 'Earn 500 points',
      icon: '📦',
      points: 200,
      completed: (loyaltyData?.total_earned || 0) >= 500,
      progress: Math.min(loyaltyData?.total_earned || 0, 500),
      total: 500,
    },
    {
      id: '3',
      title: 'Loyalty Champion',
      description: 'Earn 1000 points',
      icon: '🍽️',
      points: 300,
      completed: (loyaltyData?.total_earned || 0) >= 1000,
      progress: Math.min(loyaltyData?.total_earned || 0, 1000),
      total: 1000,
    },
    {
      id: '4',
      title: 'Reward Enthusiast',
      description: 'Redeem 3 rewards',
      icon: '⭐',
      points: 100,
      completed: userRewards.length >= 3,
      progress: Math.min(userRewards.length, 3),
      total: 3,
    },
  ];

  // Transform database rewards to UI format
  const rewards: Reward[] = rewardsData.map((reward) => ({
    id: reward.id,
    title: reward.title,
    description: reward.description || '',
    pointsCost: reward.points_required,
    value: reward.discount_value || 0,
    available: currentPoints >= reward.points_required,
  }));

  const handleRedeemReward = async (reward: Reward) => {
    if (!user?.id) return;
    
    if (currentPoints >= reward.pointsCost) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      
      try {
        const { redeemReward } = await import('@/lib/database');
        const result = await redeemReward(user.id, reward.id);
        
        if (result) {
          // Update local state
          setCurrentPoints(currentPoints - reward.pointsCost);
          
          // Reload data
          await loadLoyaltyData();
          
          // Show success
          if (__DEV__) {
            console.log(`✅ Redeemed: ${reward.title} for ${reward.pointsCost} points!`);
          }
          
          // Show visual feedback
          if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        }
      } catch (error: any) {
        if (__DEV__) {
          console.error('Error redeeming reward:', error);
          console.log('❌ ' + error.message);
        }
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      }
    }
  };

  const renderOverview = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Spacing.xl }}>
      {/* Tier Card */}
      <LinearGradient
        colors={currentTier.color}
        style={{
          borderRadius: BorderRadius.xl,
          padding: Spacing.xl,
          marginBottom: Spacing.lg,
          ...Shadows.lg,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg }}>
          <View>
            <Text style={[Typography.h1, { color: 'white', fontSize: 32 }]}>
              {currentTier.icon}
            </Text>
            <Text style={[Typography.h2, { color: 'white', marginTop: Spacing.sm }]}>
              {currentTier.name} Member
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[Typography.h1, { color: 'white' }]}>
              {currentPoints}
            </Text>
            <Text style={[Typography.bodySmall, { color: 'white', opacity: 0.9 }]}>
              Points
            </Text>
          </View>
        </View>

        {/* Progress to Next Tier */}
        {nextTier && (
          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xs }}>
              <Text style={[Typography.caption, { color: 'white', opacity: 0.9 }]}>
                {nextTier.minPoints - currentPoints} points to {nextTier.name}
              </Text>
              <Text style={[Typography.caption, { color: 'white', opacity: 0.9 }]}>
                {tierProgress.toFixed(0)}%
              </Text>
            </View>
            <View style={{
              height: 8,
              backgroundColor: 'rgba(255,255,255,0.3)',
              borderRadius: BorderRadius.full,
              overflow: 'hidden',
            }}>
              <Animated.View
                style={{
                  height: '100%',
                  backgroundColor: 'white',
                  width: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                }}
              />
            </View>
          </View>
        )}
      </LinearGradient>

      {/* Benefits */}
      <View style={{ backgroundColor: 'white', borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.lg, ...Shadows.sm }}>
        <Text style={[Typography.h3, { marginBottom: Spacing.md }]}>Your Benefits</Text>
        {currentTier.benefits.map((benefit, index) => (
          <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm }}>
            <Icons.CheckCircle size={20} color={Colors.success[500]} />
            <Text style={[Typography.body, { marginLeft: Spacing.sm }]}>{benefit}</Text>
          </View>
        ))}
      </View>

      {/* Quick Stats */}
      <View style={{ flexDirection: 'row', marginBottom: Spacing.lg }}>
        <View style={{ flex: 1, backgroundColor: 'white', borderRadius: BorderRadius.lg, padding: Spacing.lg, marginRight: Spacing.sm, ...Shadows.sm }}>
          <Text style={[Typography.h2, { color: Colors.primary[500] }]}>
            {achievements.filter(a => a.completed).length}
          </Text>
          <Text style={Typography.caption}>Achievements</Text>
        </View>
        <View style={{ flex: 1, backgroundColor: 'white', borderRadius: BorderRadius.lg, padding: Spacing.lg, marginLeft: Spacing.sm, ...Shadows.sm }}>
          <Text style={[Typography.h2, { color: Colors.primary[500] }]}>
            €{(currentPoints * 0.01).toFixed(2)}
          </Text>
          <Text style={Typography.caption}>Rewards Value</Text>
        </View>
      </View>

      {/* All Tiers */}
      <Text style={[Typography.h3, { marginBottom: Spacing.md }]}>All Tiers</Text>
      {TIERS.map((tier, index) => (
        <View
          key={tier.id}
          style={{
            backgroundColor: tier.id === currentTier.id ? Colors.primary[50] : 'white',
            borderRadius: BorderRadius.lg,
            padding: Spacing.lg,
            marginBottom: Spacing.sm,
            borderWidth: tier.id === currentTier.id ? 2 : 1,
            borderColor: tier.id === currentTier.id ? Colors.primary[500] : Colors.neutral[200],
            ...Shadows.xs,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm }}>
            <Text style={{ fontSize: 24, marginRight: Spacing.sm }}>{tier.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={Typography.h4}>{tier.name}</Text>
              <Text style={Typography.caption}>
                {tier.minPoints} - {tier.maxPoints === Infinity ? '∞' : tier.maxPoints} points
              </Text>
            </View>
            {tier.id === currentTier.id && (
              <View style={{
                backgroundColor: Colors.primary[500],
                paddingHorizontal: Spacing.sm,
                paddingVertical: Spacing.xs,
                borderRadius: BorderRadius.md,
              }}>
                <Text style={[Typography.caption, { color: 'white', fontWeight: '600' }]}>
                  CURRENT
                </Text>
              </View>
            )}
          </View>
          <View style={{ marginLeft: 32 }}>
            {tier.benefits.slice(0, 2).map((benefit, i) => (
              <Text key={i} style={[Typography.bodySmall, { color: Colors.neutral[600], marginBottom: 2 }]}>
                • {benefit}
              </Text>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderRewards = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Spacing.xl }}>
      <Text style={[Typography.h3, { marginBottom: Spacing.md }]}>Available Rewards</Text>
      {rewards.map(reward => (
        <View
          key={reward.id}
          style={{
            backgroundColor: 'white',
            borderRadius: BorderRadius.lg,
            padding: Spacing.lg,
            marginBottom: Spacing.md,
            opacity: reward.available ? 1 : 0.5,
            ...Shadows.sm,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.sm }}>
            <View style={{ flex: 1 }}>
              <Text style={Typography.h4}>{reward.title}</Text>
              <Text style={[Typography.bodySmall, { color: Colors.neutral[600] }]}>
                {reward.description}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: Spacing.xs }}>
                <Icons.Award size={16} color={Colors.warning[500]} />
                <Text style={[Typography.caption, { marginLeft: Spacing.xs, color: Colors.warning[600] }]}>
                  Worth €{reward.value}
                </Text>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[Typography.h4, { color: Colors.primary[500] }]}>
                {reward.pointsCost}
              </Text>
              <Text style={Typography.caption}>points</Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={{
              backgroundColor: currentPoints >= reward.pointsCost ? Colors.primary[500] : Colors.neutral[300],
              paddingVertical: Spacing.md,
              borderRadius: BorderRadius.md,
              alignItems: 'center',
              marginTop: Spacing.sm,
            }}
            onPress={() => handleRedeemReward(reward)}
            disabled={currentPoints < reward.pointsCost}
          >
            <Text style={[Typography.buttonMedium, { color: 'white' }]}>
              {currentPoints >= reward.pointsCost ? 'Redeem Now' : `Need ${reward.pointsCost - currentPoints} more points`}
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );

  const renderAchievements = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Spacing.xl }}>
      <Text style={[Typography.h3, { marginBottom: Spacing.md }]}>Your Achievements</Text>
      {achievements.map(achievement => (
        <View
          key={achievement.id}
          style={{
            backgroundColor: 'white',
            borderRadius: BorderRadius.lg,
            padding: Spacing.lg,
            marginBottom: Spacing.md,
            ...Shadows.sm,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.sm }}>
            <Text style={{ fontSize: 32, marginRight: Spacing.md }}>{achievement.icon}</Text>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xs }}>
                <Text style={Typography.h4}>{achievement.title}</Text>
                {achievement.completed && (
                  <Icons.CheckCircle size={20} color={Colors.success[500]} style={{ marginLeft: Spacing.xs }} />
                )}
              </View>
              <Text style={[Typography.bodySmall, { color: Colors.neutral[600] }]}>
                {achievement.description}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: Spacing.xs }}>
                <Icons.Award size={16} color={Colors.warning[500]} />
                <Text style={[Typography.caption, { marginLeft: Spacing.xs, color: Colors.warning[600] }]}>
                  +{achievement.points} points
                </Text>
              </View>
            </View>
          </View>
          
          {!achievement.completed && (
            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xs }}>
                <Text style={Typography.caption}>
                  Progress: {achievement.progress}/{achievement.total}
                </Text>
                <Text style={Typography.caption}>
                  {((achievement.progress / achievement.total) * 100).toFixed(0)}%
                </Text>
              </View>
              <View style={{
                height: 6,
                backgroundColor: Colors.neutral[200],
                borderRadius: BorderRadius.full,
                overflow: 'hidden',
              }}>
                <View
                  style={{
                    height: '100%',
                    width: `${(achievement.progress / achievement.total) * 100}%`,
                    backgroundColor: Colors.primary[500],
                  }}
                />
              </View>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background[50] }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: Colors.neutral[200],
        ...Shadows.sm,
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: Spacing.md }}>
          <Icons.ArrowLeft size={24} color={Colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={Typography.h2}>Loyalty Rewards 🎁</Text>
      </View>

      {/* Tabs */}
      <View style={{
        flexDirection: 'row',
        backgroundColor: 'white',
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.neutral[200],
      }}>
        {['overview', 'rewards', 'achievements'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={{
              flex: 1,
              paddingVertical: Spacing.md,
              borderBottomWidth: 2,
              borderBottomColor: selectedTab === tab ? Colors.primary[500] : 'transparent',
            }}
            onPress={() => {
              setSelectedTab(tab as any);
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            }}
          >
            <Text style={[
              Typography.buttonMedium,
              { textAlign: 'center', color: selectedTab === tab ? Colors.primary[500] : Colors.neutral[600], textTransform: 'capitalize' }
            ]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={{ flex: 1, padding: Spacing.lg }}>
        {selectedTab === 'overview' && renderOverview()}
        {selectedTab === 'rewards' && renderRewards()}
        {selectedTab === 'achievements' && renderAchievements()}
      </View>
    </SafeAreaView>
  );
};

export default EnhancedLoyaltyScreen;

