import React, { useState } from 'react';
import { Image, View, ImageSourcePropType } from 'react-native';

interface OptimizedImageProps {
  source: { uri: string } | ImageSourcePropType;
  className?: string;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  fallbackUri?: string;
  showLoadingSpinner?: boolean;
  onError?: () => void;
  onLoad?: () => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  className = '',
  resizeMode = 'cover',
  fallbackUri = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
  showLoadingSpinner = true,
  onError,
  onLoad,
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleError = () => {
    setImageError(true);
    setImageLoading(false);
    onError?.();
  };

  const handleLoad = () => {
    setImageLoading(false);
    onLoad?.();
  };

  const imageSource = imageError 
    ? { uri: fallbackUri }
    : source;

  return (
    <View className={`relative ${className}`}>
      {imageLoading && showLoadingSpinner && (
        <View className="absolute inset-0 bg-gray-200 rounded-lg flex-center z-10">
          <View className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </View>
      )}
      <Image
        source={imageSource}
        className="w-full h-full"
        resizeMode={resizeMode}
        onLoad={handleLoad}
        onError={handleError}
      />
    </View>
  );
};

export default OptimizedImage;
