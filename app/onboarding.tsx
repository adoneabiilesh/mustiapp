import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/lib/designSystem';
import { AnimationHelper, AnimationStyles } from '@/lib/animations';
import { Icons } from '@/lib/icons';
import { images } from '@/constants';

const { width, height } = Dimensions.get('window');

const OnboardingScreen = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const onboardingSteps = [
    {
      id: 1,
      title: 'Welcome to Foodie',
      subtitle: 'Discover amazing food from your favorite restaurants',
      description: 'Order delicious meals from top-rated restaurants near you with just a few taps.',
      image: images.home,
      color: Colors.primary[500],
    },
    {
      id: 2,
      title: 'Fast Delivery',
      subtitle: 'Get your food delivered in minutes',
      description: 'Our network of delivery partners ensures your food arrives hot and fresh, every time.',
      image: images.truck,
      color: Colors.success[500],
    },
    {
      id: 3,
      title: 'Track Your Order',
      subtitle: 'Real-time tracking from kitchen to door',
      description: 'Watch your order being prepared and track the delivery person in real-time.',
      image: images.location,
      color: Colors.warning[500],
    },
    {
      id: 4,
      title: 'Easy Payments',
      subtitle: 'Secure and convenient payment options',
      description: 'Pay with your preferred method - cards, digital wallets, or cash on delivery.',
      image: images.dollar,
      color: Colors.error[500],
    },
  ];
  
  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      scrollViewRef.current?.scrollTo({
        x: nextStep * width,
        animated: true,
      });
    } else {
      handleGetStarted();
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      scrollViewRef.current?.scrollTo({
        x: prevStep * width,
        animated: true,
      });
    }
  };
  
  const handleGetStarted = () => {
    // Animate out
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.replace('/(auth)/sign-in');
    });
  };
  
  const handleSkip = () => {
    router.replace('/(auth)/sign-in');
  };
  
  return (
    <Animated.View
      style={{
        flex: 1,
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: Spacing.lg,
          paddingTop: Spacing.xl,
          paddingBottom: Spacing.md,
        }}
      >
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={handleSkip}>
          <Text style={[Typography.label, { color: Colors.neutral[600] }]}>
            Skip
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Onboarding Steps */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        style={{ flex: 1 }}
      >
        {onboardingSteps.map((step, index) => (
          <View
            key={step.id}
            style={{
              width,
              height: height * 0.7,
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: Spacing.xl,
            }}
          >
            {/* Step Image */}
            <View
              style={{
                width: 200,
                height: 200,
                borderRadius: BorderRadius.full,
                backgroundColor: step.color + '20',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: Spacing.xl,
              }}
            >
              <Image
                source={step.image}
                style={{
                  width: 100,
                  height: 100,
                  tintColor: step.color,
                }}
                resizeMode="contain"
              />
            </View>
            
            {/* Step Content */}
            <View style={{ alignItems: 'center' }}>
              <Text
                style={[
                  Typography.h2,
                  {
                    color: Colors.neutral[900],
                    textAlign: 'center',
                    marginBottom: Spacing.md,
                  },
                ]}
              >
                {step.title}
              </Text>
              
              <Text
                style={[
                  Typography.h5,
                  {
                    color: step.color,
                    textAlign: 'center',
                    marginBottom: Spacing.lg,
                  },
                ]}
              >
                {step.subtitle}
              </Text>
              
              <Text
                style={[
                  Typography.body1,
                  {
                    color: Colors.neutral[600],
                    textAlign: 'center',
                    lineHeight: 24,
                  },
                ]}
              >
                {step.description}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
      
      {/* Bottom Section */}
      <View
        style={{
          paddingHorizontal: Spacing.xl,
          paddingBottom: Spacing.xl,
        }}
      >
        {/* Progress Indicators */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: Spacing.xl,
          }}
        >
          {onboardingSteps.map((_, index) => (
            <View
              key={index}
              style={{
                width: index === currentStep ? 24 : 8,
                height: 8,
                borderRadius: BorderRadius.sm,
                backgroundColor: index === currentStep ? Colors.primary[500] : Colors.neutral[300],
                marginHorizontal: 4,
              }}
            />
          ))}
        </View>
        
        {/* Action Buttons */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {currentStep > 0 ? (
            <TouchableOpacity
              onPress={handlePrevious}
              style={{
                paddingHorizontal: Spacing.lg,
                paddingVertical: Spacing.md,
              }}
            >
              <Text style={[Typography.label, { color: Colors.neutral[600] }]}>
                Previous
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={{ flex: 1 }} />
          )}
          
          <TouchableOpacity
            onPress={handleNext}
            style={{
              backgroundColor: Colors.primary[500],
              borderRadius: BorderRadius.full,
              paddingHorizontal: Spacing.xl,
              paddingVertical: Spacing.md,
              flex: currentStep === 0 ? 1 : 0,
              alignItems: 'center',
            }}
          >
            <Text style={[Typography.button, { color: '#FFFFFF' }]}>
              {currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

export default OnboardingScreen;
