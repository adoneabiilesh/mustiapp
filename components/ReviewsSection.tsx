import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Icons } from '@/lib/icons';
import { useTheme } from '@/lib/theme';
import { ProfessionalButton } from './ProfessionalButton';
import { ProfessionalText } from './ProfessionalText';
import { ProfessionalCard } from './ProfessionalCard';
import { supabase } from '@/lib/supabase';
import useAuthStore from '@/store/auth.store';
import { format } from 'date-fns';

interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  photos: string[];
  created_at: string;
  user_profiles?: {
    full_name: string;
    avatar_url: string;
  };
  helpful_count: number;
}

interface ReviewsSectionProps {
  productId: string;
  productName: string;
}

export default function ReviewsSection({ productId, productName }: ReviewsSectionProps) {
  const { colors, spacing } = useTheme();
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('product_reviews')
        .select(`
          *,
          user_profiles (
            full_name,
            avatar_url
          )
        `)
        .eq('product_id', productId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setReviews(data || []);
      
      // Calculate average
      if (data && data.length > 0) {
        const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
        setAverageRating(avg);
        setTotalReviews(data.length);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to submit a review');
      return;
    }

    if (!newComment.trim()) {
      Alert.alert('Comment Required', 'Please write a comment');
      return;
    }

    try {
      setSubmitting(true);
      const { error } = await supabase.from('product_reviews').insert({
        product_id: productId,
        user_id: user.id,
        rating: newRating,
        comment: newComment.trim(),
        photos: [],
      });

      if (error) throw error;

      Alert.alert('Success', 'Review submitted successfully!');
      setShowReviewModal(false);
      setNewComment('');
      setNewRating(5);
      fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, size: number = 16, interactive: boolean = false) => {
    return (
      <View style={{ flexDirection: 'row', gap: 4 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            disabled={!interactive}
            onPress={() => interactive && setNewRating(star)}
          >
            <Icons.Star
              size={size}
              color={star <= rating ? colors.warning : colors.border}
              fill={star <= rating ? colors.warning : 'none'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderReview = ({ item }: { item: Review }) => (
    <ProfessionalCard style={{ marginBottom: spacing.md }}>
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.primary + '20',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ProfessionalText weight="bold" style={{ color: colors.primary }}>
            {item.user_profiles?.full_name?.charAt(0) || 'U'}
          </ProfessionalText>
        </View>

        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <ProfessionalText weight="semibold">
              {item.user_profiles?.full_name || 'Anonymous'}
            </ProfessionalText>
            {renderStars(item.rating, 14)}
          </View>

          <ProfessionalText size="sm" color="secondary" style={{ marginBottom: spacing.sm }}>
            {format(new Date(item.created_at), 'MMM dd, yyyy')}
          </ProfessionalText>

          <ProfessionalText>{item.comment}</ProfessionalText>

          {item.photos && item.photos.length > 0 && (
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
              {item.photos.map((photo, index) => (
                <Image
                  key={index}
                  source={{ uri: photo }}
                  style={{ width: 60, height: 60, borderRadius: 8 }}
                />
              ))}
            </View>
          )}

          <View style={{ flexDirection: 'row', gap: spacing.lg, marginTop: spacing.sm }}>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Icons.ThumbsUp size={16} color={colors.textSecondary} />
              <ProfessionalText size="sm" color="secondary">
                {item.helpful_count || 0} Helpful
              </ProfessionalText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ProfessionalCard>
  );

  return (
    <View style={{ paddingVertical: spacing.lg }}>
      {/* Header with Average Rating */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing.lg,
        }}
      >
        <View>
          <ProfessionalText size="xl" weight="bold">
            Reviews
          </ProfessionalText>
          {totalReviews > 0 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <ProfessionalText size="2xl" weight="bold">
                  {averageRating.toFixed(1)}
                </ProfessionalText>
                <Icons.Star size={20} color={colors.warning} fill={colors.warning} />
              </View>
              <ProfessionalText size="sm" color="secondary">
                ({totalReviews} reviews)
              </ProfessionalText>
            </View>
          )}
        </View>

        <ProfessionalButton
          title="Write Review"
          onPress={() => setShowReviewModal(true)}
          variant="outline"
          size="sm"
          icon={<Icons.Plus size={16} color={colors.primary} />}
        />
      </View>

      {/* Reviews List */}
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : reviews.length > 0 ? (
        <FlatList
          data={reviews}
          renderItem={renderReview}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      ) : (
        <ProfessionalCard>
          <View style={{ alignItems: 'center', padding: spacing.xl }}>
            <Icons.Star size={48} color={colors.border} />
            <ProfessionalText weight="semibold" style={{ marginTop: spacing.md }}>
              No reviews yet
            </ProfessionalText>
            <ProfessionalText size="sm" color="secondary" style={{ textAlign: 'center', marginTop: 4 }}>
              Be the first to review {productName}
            </ProfessionalText>
          </View>
        </ProfessionalCard>
      )}

      {/* Review Modal */}
      <Modal
        visible={showReviewModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowReviewModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: spacing.lg,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <ProfessionalText size="xl" weight="bold">
              Write a Review
            </ProfessionalText>
            <TouchableOpacity onPress={() => setShowReviewModal(false)}>
              <Icons.X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={{ padding: spacing.lg }}>
            {/* Product Name */}
            <ProfessionalText size="lg" weight="semibold" style={{ marginBottom: spacing.lg }}>
              {productName}
            </ProfessionalText>

            {/* Rating */}
            <View style={{ marginBottom: spacing.lg }}>
              <ProfessionalText weight="semibold" style={{ marginBottom: spacing.sm }}>
                Your Rating
              </ProfessionalText>
              {renderStars(newRating, 32, true)}
            </View>

            {/* Comment */}
            <View style={{ marginBottom: spacing.lg }}>
              <ProfessionalText weight="semibold" style={{ marginBottom: spacing.sm }}>
                Your Review
              </ProfessionalText>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  padding: spacing.md,
                  height: 120,
                  textAlignVertical: 'top',
                  fontSize: 16,
                  color: colors.text,
                }}
                placeholder="Share your experience with this product..."
                placeholderTextColor={colors.textSecondary}
                value={newComment}
                onChangeText={setNewComment}
                multiline
                maxLength={500}
              />
              <ProfessionalText size="xs" color="secondary" style={{ marginTop: 4, textAlign: 'right' }}>
                {newComment.length}/500
              </ProfessionalText>
            </View>

            {/* Submit Button */}
            <ProfessionalButton
              title={submitting ? 'Submitting...' : 'Submit Review'}
              onPress={submitReview}
              disabled={submitting || !newComment.trim()}
              loading={submitting}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}


