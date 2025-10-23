/**
 * Utility functions for handling images in the mobile app
 */

// Food category to image mapping
const FOOD_CATEGORY_IMAGES = {
  'pizza': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
  'burger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
  'pasta': 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400',
  'salad': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
  'sushi': 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400',
  'chicken': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400',
  'beef': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400',
  'fish': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400',
  'dessert': 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400',
  'drink': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400',
  'sandwich': 'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=400',
  'soup': 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400',
  'rice': 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400',
  'noodles': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
  'taco': 'https://images.unsplash.com/photo-1565299585323-38174c4aabaa?w=400',
  'wrap': 'https://images.unsplash.com/photo-1565299585323-38174c4aabaa?w=400',
  'steak': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400',
  'seafood': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400',
  'vegetarian': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
  'vegan': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
};

const DEFAULT_FOOD_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';

/**
 * Get a fallback image URL based on food name or category
 */
export const getFallbackImageUrl = (name: string, category?: string): string => {
  const searchText = `${name} ${category || ''}`.toLowerCase();
  
  // First, try to match by category
  if (category) {
    const categoryLower = category.toLowerCase();
    for (const [keyword, url] of Object.entries(FOOD_CATEGORY_IMAGES)) {
      if (categoryLower.includes(keyword)) {
        return url;
      }
    }
  }
  
  // Then, try to match by food name keywords
  for (const [keyword, url] of Object.entries(FOOD_CATEGORY_IMAGES)) {
    if (searchText.includes(keyword)) {
      return url;
    }
  }
  
  return DEFAULT_FOOD_IMAGE;
};

/**
 * Validate if an image URL is accessible
 */
export const isValidImageUrl = (url: string): boolean => {
  if (!url) return false;
  
  // Basic URL validation
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get optimized image URL with size parameters
 */
export const getOptimizedImageUrl = (url: string, width: number = 400, height?: number): string => {
  if (!isValidImageUrl(url)) return DEFAULT_FOOD_IMAGE;
  
  // For Unsplash images, add size parameters
  if (url.includes('unsplash.com')) {
    const baseUrl = url.split('?')[0];
    const params = new URLSearchParams();
    params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    params.set('fit', 'crop');
    params.set('auto', 'format');
    return `${baseUrl}?${params.toString()}`;
  }
  
  return url;
};

/**
 * Get image source with fallback
 */
export const getImageSource = (imageUrl?: string, fallbackName?: string, category?: string) => {
  if (imageUrl && isValidImageUrl(imageUrl)) {
    return { uri: imageUrl };
  }
  
  const fallbackUrl = getFallbackImageUrl(fallbackName || 'food', category);
  return { uri: fallbackUrl };
};
