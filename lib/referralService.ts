/**
 * Referral Service
 * Handles referral program functionality
 */

import { supabase } from './supabase';

/**
 * Get user's referral code
 */
export const getMyReferralCode = async (): Promise<string | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('referral_codes')
      .select('code')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      // Create new referral code if doesn't exist
      const newCode = await createReferralCode();
      return newCode;
    }

    return data.code;
  } catch (error) {
    console.error('Error getting referral code:', error);
    return null;
  }
};

/**
 * Create a new referral code for user
 */
export const createReferralCode = async (): Promise<string> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Generate unique code
    const emailPrefix = user.email?.split('@')[0].toUpperCase().substring(0, 8) || 'USER';
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const code = `${emailPrefix}${randomSuffix}`;

    const { data, error } = await supabase
      .from('referral_codes')
      .insert({
        user_id: user.id,
        code,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    return code;
  } catch (error: any) {
    console.error('Error creating referral code:', error);
    throw new Error(error.message || 'Failed to create referral code');
  }
};

/**
 * Apply referral code
 */
export const applyReferralCode = async (code: string): Promise<{ success: boolean; message: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Find referral code
    const { data: referralCode, error: codeError } = await supabase
      .from('referral_codes')
      .select('*, user:users!referral_codes_user_id_fkey(id)')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (codeError || !referralCode) {
      throw new Error('Invalid referral code');
    }

    // Check if code is expired
    if (referralCode.expires_at && new Date(referralCode.expires_at) < new Date()) {
      throw new Error('Referral code has expired');
    }

    // Check if code has reached max uses
    if (referralCode.max_uses && referralCode.usage_count >= referralCode.max_uses) {
      throw new Error('Referral code has reached maximum uses');
    }

    // Check if user is trying to use their own code
    if (referralCode.user_id === user.id) {
      throw new Error('Cannot use your own referral code');
    }

    // Check if already referred
    const { data: existing } = await supabase
      .from('referrals')
      .select('id')
      .eq('referred_id', user.id)
      .single();

    if (existing) {
      throw new Error('You have already used a referral code');
    }

    // Create referral record
    const { error: referralError } = await supabase
      .from('referrals')
      .insert({
        referrer_id: referralCode.user_id,
        referred_id: user.id,
        referral_code_id: referralCode.id,
      });

    if (referralError) throw referralError;

    // Increment usage count
    await supabase
      .from('referral_codes')
      .update({
        usage_count: (referralCode.usage_count || 0) + 1,
      })
      .eq('id', referralCode.id);

    return {
      success: true,
      message: 'Referral code applied successfully! You will receive a reward after your first order.',
    };
  } catch (error: any) {
    console.error('Error applying referral code:', error);
    throw new Error(error.message || 'Failed to apply referral code');
  }
};

/**
 * Get referral statistics
 */
export const getReferralStats = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: referrals } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', user.id);

    const { data: code } = await supabase
      .from('referral_codes')
      .select('usage_count')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    const totalReferrals = referrals?.length || 0;
    const completedReferrals = referrals?.filter(r => r.first_order_completed).length || 0;
    const totalRewards = referrals?.reduce((sum, r) => sum + (r.referrer_reward_amount || 0), 0) || 0;

    return {
      referralCode: await getMyReferralCode(),
      totalReferrals,
      completedReferrals,
      pendingReferrals: totalReferrals - completedReferrals,
      totalRewards,
      usageCount: code?.usage_count || 0,
    };
  } catch (error) {
    console.error('Error getting referral stats:', error);
    return null;
  }
};

/**
 * Process referral reward (called after order completion)
 */
export const processReferralReward = async (orderId: string) => {
  try {
    const { data: order } = await supabase
      .from('orders')
      .select('customer_id, total, status')
      .eq('id', orderId)
      .single();

    if (!order || order.status !== 'delivered') {
      return;
    }

    // Find referral for this user
    const { data: referral } = await supabase
      .from('referrals')
      .select('*, settings:restaurant_settings!inner(referrer_reward_amount, referred_reward_amount, minimum_order_for_reward)')
      .eq('referred_id', order.customer_id)
      .eq('first_order_completed', false)
      .single();

    if (!referral) return;

    // Get restaurant settings for reward amounts
    const settings = referral.settings;
    if (!settings) return;

    // Check minimum order
    if (order.total < settings.minimum_order_for_reward) {
      return;
    }

    // Update referral
    await supabase
      .from('referrals')
      .update({
        first_order_completed: true,
        first_order_id: orderId,
        completed_at: new Date().toISOString(),
        referred_reward_amount: settings.referred_reward_amount,
        referrer_reward_amount: settings.referrer_reward_amount,
      })
      .eq('id', referral.id);

    // Give rewards (implement wallet/credit system)
    // This would typically integrate with a wallet system
    console.log('Referral rewards processed:', {
      referrer: settings.referrer_reward_amount,
      referred: settings.referred_reward_amount,
    });

    return { success: true };
  } catch (error) {
    console.error('Error processing referral reward:', error);
    return null;
  }
};

