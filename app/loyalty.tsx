import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Icons } from '@/lib/icons';
import { useTheme } from '@/lib/theme';
import { ProfessionalText } from '@/components/ProfessionalText';
import { ProfessionalCard } from '@/components/ProfessionalCard';
import { ProfessionalButton } from '@/components/ProfessionalButton';
import { supabase } from '@/lib/supabase';
import useAuthStore from '@/store/auth.store';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const TIERS = [
  { name: 'Bronze', minPoints: 0, color: '#CD7F32', benefits: '5% off' },
  { name: 'Silver', minPoints: 500, color: '#C0C0C0', benefits: '10% off' },
  { name: 'Gold', minPoints: 1500, color: '#FFD700', benefits: '15% off + Free delivery' },
  { name: 'Platinum', minPoints: 3000, color: '#E5E4E2', benefits: '20% off + Exclusive perks' },
];

export default function LoyaltyScreen() {
  const { colors, spacing } = useTheme();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loyaltyData, setLoyaltyData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);

  useEffect(() => {
    fetchLoyaltyData();
  }, [user]);

  const fetchLoyaltyData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch loyalty account
      const { data: loyalty, error: loyaltyError } = await supabase
        .from('loyalty_accounts')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (loyaltyError && loyaltyError.code !== 'PGRST116') throw loyaltyError;

      setLoyaltyData(loyalty);

      // Fetch recent transactions
      const { data: txData } = await supabase
        .from('loyalty_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      setTransactions(txData || []);

      // Fetch available rewards
      const { data: rewardsData } = await supabase
        .from('loyalty_rewards')
        .select('*')
        .eq('is_active', true)
        .order('points_required', { ascending: true });

      setRewards(rewardsData || []);
    } catch (error) {
      console.error('Error fetching loyalty data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const redeemReward = async (rewardId: string, pointsCost: number) => {
    if (!user || !loyaltyData) return;

    if (loyaltyData.points_balance < pointsCost) {
      alert('Not enough points!');
      return;
    }

    try {
      const { error } = await supabase.from('loyalty_redemptions').insert({
        user_id: user.id,
        reward_id: rewardId,
        points_redeemed: pointsCost,
      });

      if (error) throw error;

      alert('Reward redeemed successfully!');
      fetchLoyaltyData();
    } catch (error) {
      console.error('Error redeeming reward:', error);
      alert('Failed to redeem reward');
    }
  };

  const getCurrentTier = () => {
    if (!loyaltyData) return TIERS[0];
    const points = loyaltyData.points_balance;
    return [...TIERS].reverse().find((tier) => points >= tier.minPoints) || TIERS[0];
  };

  const getNextTier = () => {
    if (!loyaltyData) return TIERS[1];
    const currentTier = getCurrentTier();
    const currentIndex = TIERS.findIndex((t) => t.name === currentTier.name);
    return TIERS[currentIndex + 1] || null;
  };

  const getProgressToNextTier = () => {
    const nextTier = getNextTier();
    if (!nextTier || !loyaltyData) return 100;
    
    const currentPoints = loyaltyData.points_balance;
    const currentTier = getCurrentTier();
    const progress = ((currentPoints - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const currentTier = getCurrentTier();
  const nextTier = getNextTier();
  const progress = getProgressToNextTier();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: spacing.lg,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Icons.ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <ProfessionalText size="xl" weight="bold">
          Loyalty Rewards
        </ProfessionalText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchLoyaltyData} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Points Card */}
        <View style={{ padding: spacing.lg }}>
          <LinearGradient
            colors={[colors.primary, colors.primary + 'CC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 20,
              padding: spacing.xl,
              marginBottom: spacing.lg,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <ProfessionalText size="sm" style={{ color: '#fff', opacity: 0.9, marginBottom: 4 }}>
                  Your Points
                </ProfessionalText>
                <ProfessionalText size="4xl" weight="bold" style={{ color: '#fff' }}>
                  {loyaltyData?.points_balance || 0}
                </ProfessionalText>
                <ProfessionalText size="sm" style={{ color: '#fff', opacity: 0.9, marginTop: 8 }}>
                  {currentTier.name} Member
                </ProfessionalText>
              </View>
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icons.Award size={40} color="#fff" />
              </View>
            </View>

            {nextTier && (
              <View style={{ marginTop: spacing.lg }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <ProfessionalText size="sm" style={{ color: '#fff', opacity: 0.9 }}>
                    Progress to {nextTier.name}
                  </ProfessionalText>
                  <ProfessionalText size="sm" style={{ color: '#fff', opacity: 0.9 }}>
                    {nextTier.minPoints - (loyaltyData?.points_balance || 0)} pts needed
                  </ProfessionalText>
                </View>
                <View
                  style={{ height: 8, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4, overflow: 'hidden' }}
                >
                  <View style={{ width: `${progress}%`, height: '100%', backgroundColor: '#fff' }} />
                </View>
              </View>
            )}
          </LinearGradient>

          {/* Tiers */}
          <ProfessionalText size="lg" weight="bold" style={{ marginBottom: spacing.md }}>
            Membership Tiers
          </ProfessionalText>
          <View style={{ gap: spacing.sm, marginBottom: spacing.xl }}>
            {TIERS.map((tier) => {
              const isCurrentTier = tier.name === currentTier.name;
              return (
                <ProfessionalCard
                  key={tier.name}
                  style={{
                    borderWidth: isCurrentTier ? 2 : 1,
                    borderColor: isCurrentTier ? tier.color : colors.border,
                    backgroundColor: isCurrentTier ? tier.color + '10' : colors.card,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: tier.color + '30',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Icons.Award size={20} color={tier.color} />
                      </View>
                      <View>
                        <ProfessionalText weight="bold">{tier.name}</ProfessionalText>
                        <ProfessionalText size="sm" color="secondary">
                          {tier.minPoints}+ points
                        </ProfessionalText>
                      </View>
                    </View>
                    <ProfessionalText size="sm" weight="semibold" style={{ color: tier.color }}>
                      {tier.benefits}
                    </ProfessionalText>
                  </View>
                </ProfessionalCard>
              );
            })}
          </View>

          {/* Available Rewards */}
          <ProfessionalText size="lg" weight="bold" style={{ marginBottom: spacing.md }}>
            Redeem Rewards
          </ProfessionalText>
          {rewards.length > 0 ? (
            <View style={{ gap: spacing.md, marginBottom: spacing.xl }}>
              {rewards.map((reward) => (
                <ProfessionalCard key={reward.id}>
                  <View style={{ flexDirection: 'row', gap: spacing.md }}>
                    <View
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 12,
                        backgroundColor: colors.primary + '20',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icons.Gift size={28} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <ProfessionalText weight="bold" style={{ marginBottom: 4 }}>
                        {reward.name}
                      </ProfessionalText>
                      <ProfessionalText size="sm" color="secondary" style={{ marginBottom: spacing.sm }}>
                        {reward.description}
                      </ProfessionalText>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Icons.Star size={16} color={colors.warning} fill={colors.warning} />
                          <ProfessionalText weight="semibold">{reward.points_required} pts</ProfessionalText>
                        </View>
                        <ProfessionalButton
                          title="Redeem"
                          onPress={() => redeemReward(reward.id, reward.points_required)}
                          size="sm"
                          disabled={(loyaltyData?.points_balance || 0) < reward.points_required}
                        />
                      </View>
                    </View>
                  </View>
                </ProfessionalCard>
              ))}
            </View>
          ) : (
            <ProfessionalCard>
              <View style={{ alignItems: 'center', padding: spacing.lg }}>
                <Icons.Gift size={48} color={colors.border} />
                <ProfessionalText size="sm" color="secondary" style={{ marginTop: spacing.sm, textAlign: 'center' }}>
                  No rewards available at the moment
                </ProfessionalText>
              </View>
            </ProfessionalCard>
          )}

          {/* Recent Activity */}
          {transactions.length > 0 && (
            <>
              <ProfessionalText size="lg" weight="bold" style={{ marginBottom: spacing.md, marginTop: spacing.md }}>
                Recent Activity
              </ProfessionalText>
              <View style={{ gap: spacing.sm }}>
                {transactions.map((tx) => (
                  <ProfessionalCard key={tx.id}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View>
                        <ProfessionalText weight="semibold">{tx.description}</ProfessionalText>
                        <ProfessionalText size="sm" color="secondary">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </ProfessionalText>
                      </View>
                      <ProfessionalText
                        weight="bold"
                        style={{ color: tx.points_change > 0 ? colors.success : colors.error }}
                      >
                        {tx.points_change > 0 ? '+' : ''}
                        {tx.points_change} pts
                      </ProfessionalText>
                    </View>
                  </ProfessionalCard>
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


