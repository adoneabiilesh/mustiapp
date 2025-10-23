// Single Restaurant/Franchise Configuration
export const RESTAURANT_CONFIG = {
  // Basic Info
  name: 'Musti Place',
  tagline: 'Authentic Italian Taste',
  description: 'Experience the authentic flavors of Italy with our traditional recipes passed down through generations.',
  
  // Brand Colors
  primaryColor: '#E53E3E', // Italian Red
  secondaryColor: '#FED7D7',
  accentColor: '#F6AD55', // Gold
  
  // Contact Info
  address: '123 Main Street, Rome, Italy',
  phone: '+39 06 1234 5678',
  email: 'info@mustiplace.com',
  website: 'www.mustiplace.com',
  
  // Operating Hours
  hours: {
    monday: '11:00 AM - 10:00 PM',
    tuesday: '11:00 AM - 10:00 PM',
    wednesday: '11:00 AM - 10:00 PM',
    thursday: '11:00 AM - 10:00 PM',
    friday: '11:00 AM - 11:00 PM',
    saturday: '11:00 AM - 11:00 PM',
    sunday: '12:00 PM - 9:00 PM',
  },
  
  // Delivery Info
  delivery: {
    time: '25-35 min',
    fee: 2.99,
    minimumOrder: 15.00,
    freeDeliveryThreshold: 25.00,
    deliveryRadius: 5, // km
  },
  
  // Features
  features: {
    hasDelivery: true,
    hasPickup: true,
    hasDineIn: true,
    hasOnlineOrdering: true,
    hasLoyaltyProgram: true,
    hasReferralProgram: true,
    acceptsCash: true,
    acceptsCards: true,
    acceptsDigitalWallets: true,
  },
  
  // Social Media
  socialMedia: {
    facebook: 'https://facebook.com/mustiplace',
    instagram: 'https://instagram.com/mustiplace',
    twitter: 'https://twitter.com/mustiplace',
  },
  
  // Loyalty Program
  loyalty: {
    pointsPerEuro: 1,
    euroPerPoint: 0.01,
    levels: [
      { name: 'Bronze', points: 0, benefits: ['Welcome bonus'] },
      { name: 'Silver', points: 500, benefits: ['Free delivery', '5% discount'] },
      { name: 'Gold', points: 1000, benefits: ['Free delivery', '10% discount', 'Priority support'] },
      { name: 'Platinum', points: 2000, benefits: ['Free delivery', '15% discount', 'Exclusive offers', 'Birthday surprise'] },
    ],
  },
  
  // Referral Program
  referral: {
    code: 'MUSTIPLACE2024',
    rewardAmount: 5.00,
    referrerReward: 5.00,
    minimumOrderForReward: 20.00,
  },
  
  // Menu Categories
  menuCategories: [
    { id: 'pizza', name: 'Pizza', icon: '🍕', description: 'Authentic Italian pizzas' },
    { id: 'pasta', name: 'Pasta', icon: '🍝', description: 'Traditional pasta dishes' },
    { id: 'appetizers', name: 'Appetizers', icon: '🥗', description: 'Start your meal right' },
    { id: 'desserts', name: 'Desserts', icon: '🍰', description: 'Sweet endings' },
    { id: 'beverages', name: 'Beverages', icon: '🥤', description: 'Refreshing drinks' },
  ],
  
  // Special Offers
  specialOffers: [
    {
      id: 'welcome',
      title: 'Welcome to Musti Place!',
      description: 'Get 20% off your first order',
      discount: 20,
      discountType: 'percentage',
      code: 'WELCOME20',
      validUntil: '2024-12-31',
      minimumOrder: 15.00,
    },
    {
      id: 'weekend',
      title: 'Weekend Special',
      description: 'Free delivery on weekends',
      discount: 2.99,
      discountType: 'fixed',
      code: 'WEEKEND',
      validUntil: '2024-12-31',
      minimumOrder: 0,
    },
  ],
  
  // Payment Methods
  paymentMethods: [
    { id: 'card', name: 'Credit/Debit Card', icon: '💳', enabled: true },
    { id: 'cash', name: 'Cash on Delivery', icon: '💵', enabled: true },
    { id: 'apple_pay', name: 'Apple Pay', icon: '📱', enabled: true },
    { id: 'google_pay', name: 'Google Pay', icon: '📱', enabled: true },
    { id: 'paypal', name: 'PayPal', icon: '💰', enabled: true },
  ],
  
  // Delivery Areas
  deliveryAreas: [
    { name: 'Downtown', deliveryTime: '20-30 min', fee: 2.99 },
    { name: 'Midtown', deliveryTime: '25-35 min', fee: 2.99 },
    { name: 'Uptown', deliveryTime: '30-40 min', fee: 3.99 },
    { name: 'Suburbs', deliveryTime: '35-45 min', fee: 4.99 },
  ],
  
  // Restaurant Images
  images: {
    logo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
    hero: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b',
    interior: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
    exterior: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
  },
  
  // Reviews & Ratings
  ratings: {
    average: 4.5,
    totalReviews: 1247,
    breakdown: {
      5: 856,
      4: 234,
      3: 89,
      2: 45,
      1: 23,
    },
  },
  
  // Popular Items
  popularItems: [
    'Margherita Pizza',
    'Spaghetti Carbonara',
    'Pepperoni Pizza',
    'Chicken Alfredo',
    'Caesar Salad',
  ],
  
  // Allergen Information
  allergens: [
    'Gluten',
    'Dairy',
    'Eggs',
    'Nuts',
    'Soy',
  ],
  
  // Dietary Options
  dietaryOptions: [
    { name: 'Vegetarian', icon: '🌱', available: true },
    { name: 'Vegan', icon: '🌿', available: true },
    { name: 'Gluten-Free', icon: '🌾', available: true },
    { name: 'Keto', icon: '🥑', available: false },
    { name: 'Low-Carb', icon: '🥗', available: true },
  ],
};

export default RESTAURANT_CONFIG;
