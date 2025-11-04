import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { images } from '@/constants';
import { cn } from '@/lib/utils';

const RateOrder = () => {
  const { orderId } = useLocalSearchParams();
  const [foodRating, setFoodRating] = useState(0);
  const [deliveryRating, setDeliveryRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmitReview = async () => {
    if (foodRating === 0 || deliveryRating === 0) {
      Alert.alert('Error', 'Please rate both food quality and delivery');
      return;
    }

    setLoading(true);

    try {
      const { createRestaurantReview } = await import('../lib/reviewService');
      const { supabase } = await import('../lib/supabase');
      
      // Get restaurant ID from order
      const { data: order } = await supabase
        .from('orders')
        .select('restaurant_id')
        .eq('id', orderId)
        .single();
      
      if (!order?.restaurant_id) {
        throw new Error('Restaurant not found');
      }
      
      const avgRating = Math.round((foodRating + deliveryRating) / 2);
      
      await createRestaurantReview({
        restaurant_id: order.restaurant_id,
        order_id: orderId as string,
        rating: avgRating,
        food_rating: foodRating,
        delivery_rating: deliveryRating,
        comment: reviewText || undefined,
        images: photos.length > 0 ? photos : undefined,
      });
      
      Alert.alert(
        'Thank You!',
        'Your review has been submitted successfully.',
        [
          { text: 'OK', onPress: () => router.back() }
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Review',
      'Are you sure you want to skip rating this order?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Skip', onPress: () => router.back() }
      ]
    );
  };

  const StarRating = ({ rating, onRatingChange, title }: {
    rating: number;
    onRatingChange: (rating: number) => void;
    title: string;
  }) => (
    <View className="mb-6">
      <Text className="text-lg font-semibold text-gray-900 mb-3">{title}</Text>
      <View className="flex-row space-x-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => onRatingChange(star)}
            className="w-12 h-12 items-center justify-center"
          >
            <Image
              source={images.star}
              className="w-8 h-8"
              tintColor={star <= rating ? '#FFD700' : '#E5E7EB'}
            />
          </TouchableOpacity>
        ))}
      </View>
      <Text className="text-sm text-gray-600 mt-2">
        {rating === 0 ? 'Tap to rate' : 
         rating === 1 ? 'Poor' :
         rating === 2 ? 'Fair' :
         rating === 3 ? 'Good' :
         rating === 4 ? 'Very Good' : 'Excellent'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-5 pt-4 pb-6 border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-4"
          >
            <Image source={images.arrowBack} className="w-5 h-5" tintColor="#333" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-900">Rate Your Order</Text>
            <Text className="text-gray-600">Order #{orderId?.slice(-6) || '123456'}</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <View className="px-5 py-6 bg-gray-50">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Order Summary</Text>
          
          <View className="bg-white rounded-xl p-4 space-y-3">
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-lg overflow-hidden mr-3">
                <Image
                  source={getImageSource('', 'Classic Cheeseburger')}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
              <View className="flex-1">
                <Text className="font-medium text-gray-900">Classic Cheeseburger</Text>
                <Text className="text-sm text-gray-600">Medium, Extra Cheese</Text>
              </View>
              <Text className="text-gray-900">€12.99</Text>
            </View>
            
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-lg overflow-hidden mr-3">
                <Image
                  source={getImageSource('', 'French Fries')}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
              <View className="flex-1">
                <Text className="font-medium text-gray-900">French Fries</Text>
                <Text className="text-sm text-gray-600">Regular</Text>
              </View>
              <Text className="text-gray-900">€4.99</Text>
            </View>
            
            <View className="border-t border-gray-200 pt-3">
              <View className="flex-row justify-between">
                <Text className="font-bold text-gray-900">Total</Text>
                <Text className="font-bold text-gray-900">€25.99</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Rating Section */}
        <View className="px-5 py-6">
          <Text className="text-2xl font-bold text-gray-900 mb-2">Rate your experience</Text>
          <Text className="text-gray-600 mb-6">
            Help us improve by sharing your feedback about this order.
          </Text>

          {/* Food Quality Rating */}
          <StarRating
            rating={foodRating}
            onRatingChange={setFoodRating}
            title="How was the food quality?"
          />

          {/* Delivery Rating */}
          <StarRating
            rating={deliveryRating}
            onRatingChange={setDeliveryRating}
            title="How was the delivery experience?"
          />

          {/* Review Text */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3">Write a Review</Text>
            <TextInput
              value={reviewText}
              onChangeText={setReviewText}
              placeholder="Tell us about your experience... (optional)"
              className="border border-gray-300 rounded-xl p-4 text-base"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Photo Upload */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3">Add Photos (Optional)</Text>
            <TouchableOpacity
              onPress={() => {
                Alert.alert('Add Photos', 'Photo upload feature will be implemented');
              }}
              className="border-2 border-dashed border-gray-300 rounded-xl p-6 items-center"
            >
              <Image source={images.plus} className="w-8 h-8 mb-2" tintColor="#6B7280" />
              <Text className="text-gray-600 font-medium">Add Photos</Text>
              <Text className="text-gray-500 text-sm">Share photos of your food</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Feedback */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3">Quick Feedback</Text>
            <View className="flex-row flex-wrap space-x-2 space-y-2">
              {['Excellent', 'Good Value', 'Fast Delivery', 'Great Taste', 'Friendly Service'].map((tag) => (
                <TouchableOpacity
                  key={tag}
                  className="bg-gray-100 px-4 py-2 rounded-full"
                >
                  <Text className="text-gray-700 font-medium">{tag}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View className="p-5 bg-white border-t border-gray-200">
        <View className="flex-row space-x-3">
          <TouchableOpacity
            onPress={handleSkip}
            className="flex-1 bg-gray-100 py-4 rounded-xl items-center"
          >
            <Text className="text-gray-700 font-medium">Skip</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleSubmitReview}
            disabled={loading || (foodRating === 0 || deliveryRating === 0)}
            className={cn(
              'flex-1 py-4 rounded-xl items-center',
              loading || (foodRating === 0 || deliveryRating === 0)
                ? 'bg-gray-400'
                : 'bg-green-500'
            )}
          >
            <Text className="text-white font-bold">
              {loading ? 'Submitting...' : 'Submit Review'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default RateOrder;
