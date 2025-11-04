// Smart Product Recommendation System
// Suggests complementary and contradictory products for better user experience

import { getMenuItems } from './database';

export interface ProductRecommendation {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  reason: string;
  type: 'complementary' | 'contradictory' | 'trending' | 'similar';
  confidence: number; // 0-1 score
}

export interface RecommendationContext {
  currentProduct: any;
  userPreferences?: string[];
  orderHistory?: any[];
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
}

// Product relationship mappings
const COMPLEMENTARY_PAIRS = {
  // Main dishes with drinks
  'burger': ['coca-cola', 'pepsi', 'beer', 'milkshake', 'fries'],
  'pizza': ['beer', 'wine', 'coca-cola', 'pepsi', 'garlic-bread'],
  'pasta': ['wine', 'garlic-bread', 'salad'],
  'chicken': ['coca-cola', 'pepsi', 'fries', 'salad'],
  'sandwich': ['chips', 'coca-cola', 'pepsi', 'soup'],
  
  // Drinks with snacks
  'coca-cola': ['burger', 'pizza', 'fries', 'chicken-wings'],
  'beer': ['burger', 'pizza', 'chicken-wings', 'nachos'],
  'coffee': ['croissant', 'muffin', 'bagel', 'donut'],
  
  // Desserts with drinks
  'cake': ['coffee', 'tea', 'milk'],
  'ice-cream': ['waffle', 'brownie', 'cookie'],
  
  // Healthy combinations
  'salad': ['soup', 'smoothie', 'water', 'green-tea'],
  'soup': ['salad', 'bread', 'crackers'],
};

const CONTRADICTORY_PAIRS = {
  // Healthy vs Indulgent
  'salad': ['burger', 'pizza', 'fries', 'ice-cream'],
  'soup': ['burger', 'pizza', 'fries'],
  'smoothie': ['burger', 'pizza', 'fries', 'cake'],
  
  // Hot vs Cold
  'soup': ['ice-cream', 'smoothie', 'cold-drink'],
  'coffee': ['ice-cream', 'smoothie', 'cold-drink'],
  'tea': ['ice-cream', 'smoothie'],
  
  // Light vs Heavy
  'salad': ['pasta', 'pizza', 'burger'],
  'soup': ['pasta', 'pizza', 'burger'],
  'smoothie': ['pasta', 'pizza', 'burger'],
};

const TRENDING_COMBINATIONS = {
  'morning': ['coffee', 'croissant', 'bagel', 'muffin'],
  'afternoon': ['burger', 'coca-cola', 'fries', 'salad'],
  'evening': ['pizza', 'beer', 'wine', 'pasta'],
  'night': ['burger', 'beer', 'fries', 'chicken-wings'],
};

const SIMILAR_PRODUCTS = {
  'burger': ['chicken-burger', 'veggie-burger', 'sandwich'],
  'pizza': ['calzone', 'pasta', 'lasagna'],
  'salad': ['soup', 'smoothie', 'wrap'],
  'pasta': ['pizza', 'lasagna', 'risotto'],
  'coffee': ['latte', 'cappuccino', 'espresso'],
};

// Get product category from name/description
function getProductCategory(product: any): string {
  const name = product.name.toLowerCase();
  const description = product.description?.toLowerCase() || '';
  const text = `${name} ${description}`;
  
  // Category detection logic
  if (text.includes('burger')) return 'burger';
  if (text.includes('pizza')) return 'pizza';
  if (text.includes('pasta')) return 'pasta';
  if (text.includes('salad')) return 'salad';
  if (text.includes('soup')) return 'soup';
  if (text.includes('chicken')) return 'chicken';
  if (text.includes('sandwich')) return 'sandwich';
  if (text.includes('coca-cola') || text.includes('coke')) return 'coca-cola';
  if (text.includes('pepsi')) return 'pepsi';
  if (text.includes('beer')) return 'beer';
  if (text.includes('wine')) return 'wine';
  if (text.includes('coffee')) return 'coffee';
  if (text.includes('tea')) return 'tea';
  if (text.includes('smoothie')) return 'smoothie';
  if (text.includes('ice-cream')) return 'ice-cream';
  if (text.includes('cake')) return 'cake';
  if (text.includes('fries')) return 'fries';
  if (text.includes('chicken-wings')) return 'chicken-wings';
  if (text.includes('nachos')) return 'nachos';
  if (text.includes('croissant')) return 'croissant';
  if (text.includes('muffin')) return 'muffin';
  if (text.includes('bagel')) return 'bagel';
  if (text.includes('donut')) return 'donut';
  if (text.includes('waffle')) return 'waffle';
  if (text.includes('brownie')) return 'brownie';
  if (text.includes('cookie')) return 'cookie';
  if (text.includes('garlic-bread')) return 'garlic-bread';
  if (text.includes('chips')) return 'chips';
  if (text.includes('water')) return 'water';
  if (text.includes('green-tea')) return 'green-tea';
  if (text.includes('milk')) return 'milk';
  if (text.includes('calzone')) return 'calzone';
  if (text.includes('lasagna')) return 'lasagna';
  if (text.includes('risotto')) return 'risotto';
  if (text.includes('latte')) return 'latte';
  if (text.includes('cappuccino')) return 'cappuccino';
  if (text.includes('espresso')) return 'espresso';
  if (text.includes('wrap')) return 'wrap';
  
  return 'unknown';
}

// Get complementary recommendations
export async function getComplementaryRecommendations(
  currentProduct: any,
  limit: number = 3
): Promise<ProductRecommendation[]> {
  try {
    const category = getProductCategory(currentProduct);
    const complementaryCategories = COMPLEMENTARY_PAIRS[category] || [];
    
    if (complementaryCategories.length === 0) {
      return [];
    }
    
    const allProducts = await getMenuItems();
    const recommendations: ProductRecommendation[] = [];
    
    for (const targetCategory of complementaryCategories) {
      const matchingProducts = allProducts.filter(product => 
        getProductCategory(product) === targetCategory
      );
      
      for (const product of matchingProducts) {
        if (product.id !== currentProduct.id) {
          recommendations.push({
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            image_url: product.image_url,
            reason: `Perfect with ${currentProduct.name}`,
            type: 'complementary',
            confidence: 0.8
          });
        }
      }
    }
    
    // Sort by confidence and return top results
    return recommendations
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);
      
  } catch (error) {
    console.error('Error getting complementary recommendations:', error);
    return [];
  }
}

// Get contradictory recommendations (for variety)
export async function getContradictoryRecommendations(
  currentProduct: any,
  limit: number = 2
): Promise<ProductRecommendation[]> {
  try {
    const category = getProductCategory(currentProduct);
    const contradictoryCategories = CONTRADICTORY_PAIRS[category] || [];
    
    if (contradictoryCategories.length === 0) {
      return [];
    }
    
    const allProducts = await getMenuItems();
    const recommendations: ProductRecommendation[] = [];
    
    for (const targetCategory of contradictoryCategories) {
      const matchingProducts = allProducts.filter(product => 
        getProductCategory(product) === targetCategory
      );
      
      for (const product of matchingProducts) {
        if (product.id !== currentProduct.id) {
          recommendations.push({
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            image_url: product.image_url,
            reason: `Try something different from ${currentProduct.name}`,
            type: 'contradictory',
            confidence: 0.6
          });
        }
      }
    }
    
    return recommendations
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);
      
  } catch (error) {
    console.error('Error getting contradictory recommendations:', error);
    return [];
  }
}

// Get trending recommendations based on time
export async function getTrendingRecommendations(
  timeOfDay: string = 'afternoon',
  limit: number = 3
): Promise<ProductRecommendation[]> {
  try {
    const trendingCategories = TRENDING_COMBINATIONS[timeOfDay] || [];
    
    if (trendingCategories.length === 0) {
      return [];
    }
    
    const allProducts = await getMenuItems();
    const recommendations: ProductRecommendation[] = [];
    
    for (const category of trendingCategories) {
      const matchingProducts = allProducts.filter(product => 
        getProductCategory(product) === category
      );
      
      for (const product of matchingProducts) {
        recommendations.push({
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          image_url: product.image_url,
          reason: `Popular ${timeOfDay} choice`,
          type: 'trending',
          confidence: 0.7
        });
      }
    }
    
    return recommendations
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);
      
  } catch (error) {
    console.error('Error getting trending recommendations:', error);
    return [];
  }
}

// Get similar product recommendations
export async function getSimilarRecommendations(
  currentProduct: any,
  limit: number = 3
): Promise<ProductRecommendation[]> {
  try {
    const category = getProductCategory(currentProduct);
    const similarCategories = SIMILAR_PRODUCTS[category] || [];
    
    if (similarCategories.length === 0) {
      return [];
    }
    
    const allProducts = await getMenuItems();
    const recommendations: ProductRecommendation[] = [];
    
    for (const targetCategory of similarCategories) {
      const matchingProducts = allProducts.filter(product => 
        getProductCategory(product) === targetCategory
      );
      
      for (const product of matchingProducts) {
        if (product.id !== currentProduct.id) {
          recommendations.push({
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            image_url: product.image_url,
            reason: `Similar to ${currentProduct.name}`,
            type: 'similar',
            confidence: 0.7
          });
        }
      }
    }
    
    return recommendations
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);
      
  } catch (error) {
    console.error('Error getting similar recommendations:', error);
    return [];
  }
}

// Get all recommendations for a product
export async function getAllRecommendations(
  currentProduct: any,
  context?: RecommendationContext
): Promise<{
  complementary: ProductRecommendation[];
  contradictory: ProductRecommendation[];
  trending: ProductRecommendation[];
  similar: ProductRecommendation[];
}> {
  try {
    const timeOfDay = context?.timeOfDay || 'afternoon';
    
    const [complementary, contradictory, trending, similar] = await Promise.all([
      getComplementaryRecommendations(currentProduct, 3),
      getContradictoryRecommendations(currentProduct, 2),
      getTrendingRecommendations(timeOfDay, 2),
      getSimilarRecommendations(currentProduct, 2)
    ]);
    
    return {
      complementary,
      contradictory,
      trending,
      similar
    };
  } catch (error) {
    console.error('Error getting all recommendations:', error);
    return {
      complementary: [],
      contradictory: [],
      trending: [],
      similar: []
    };
  }
}

// Get smart recommendations (mixed approach)
export async function getSmartRecommendations(
  currentProduct: any,
  context?: RecommendationContext
): Promise<ProductRecommendation[]> {
  try {
    const allRecs = await getAllRecommendations(currentProduct, context);
    
    // Mix different types of recommendations
    const mixedRecommendations = [
      ...allRecs.complementary.slice(0, 2), // Top 2 complementary
      ...allRecs.contradictory.slice(0, 1), // Top 1 contradictory
      ...allRecs.trending.slice(0, 1), // Top 1 trending
      ...allRecs.similar.slice(0, 1), // Top 1 similar
    ];
    
    // Remove duplicates and sort by confidence
    const uniqueRecommendations = mixedRecommendations.filter((rec, index, self) => 
      index === self.findIndex(r => r.id === rec.id)
    );
    
    return uniqueRecommendations
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 6); // Return top 6 recommendations
      
  } catch (error) {
    console.error('Error getting smart recommendations:', error);
    return [];
  }
}
