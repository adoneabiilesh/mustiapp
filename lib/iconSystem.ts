// Professional Icon System for Food Delivery App
import { 
  // Lucide Icons
  Star, Heart, ShoppingCart, Plus, Minus, Check, X,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Search, Filter, MapPin, Clock, Phone, Mail, User,
  Settings, LogOut, Bell, Camera, Image, Trash,
  Utensils, Coffee, Pizza, IceCream, Apple, Carrot,
  Home, Menu, Edit, Share, CheckCircle, AlertCircle,
  Info, CreditCard, Wallet, Truck, Package,
  ThumbsUp, ThumbsDown, Flame, ChefHat, Wine, Cake,
  Cookie, Sandwich, Salad, Drink, Burger, Dessert
} from 'lucide-react-native';

// React Native Vector Icons
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Professional Icon Sizes
export const IconSizes = {
  xs: 12,    // Very small - for inline text
  sm: 16,    // Small - for compact UI
  md: 20,    // Medium - standard size
  lg: 24,    // Large - prominent actions
  xl: 32,    // Extra large - headers
  xxl: 48,   // Very large - hero sections
  xxxl: 64,  // Massive - splash screens
};

// Professional Color Palette
export const IconColors = {
  // Brand Colors
  primary: '#E53E3E',        // Italian Red
  primaryLight: '#F87171',    // Light Red
  primaryDark: '#B91C1C',    // Dark Red
  
  // Secondary Colors
  secondary: '#F59E0B',      // Gold
  secondaryLight: '#FCD34D', // Light Gold
  secondaryDark: '#D97706',  // Dark Gold
  
  // Status Colors
  success: '#10B981',        // Green
  warning: '#F59E0B',        // Orange
  error: '#EF4444',          // Red
  info: '#3B82F6',           // Blue
  
  // Neutral Colors
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  
  // Food Category Colors
  pizza: '#FF6B6B',
  burger: '#FF8C42',
  pasta: '#FFD93D',
  sushi: '#6BCF7F',
  salad: '#4ECDC4',
  dessert: '#A8E6CF',
  coffee: '#8B4513',
  healthy: '#98D8C8',
};

// Main Icons Object
export const Icons = {
  // Navigation
  Star, Heart, ShoppingCart, Plus, Minus, Check, X,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Search, Filter, MapPin, Clock, Phone, Mail, User,
  Settings, LogOut, Bell, Camera, Image, Trash,
  
  // Food & Restaurant
  Utensils, Coffee, Pizza, IceCream, Apple, Carrot,
  ChefHat, Wine, Cake, Cookie, Sandwich, Salad,
  Drink, Burger, Dessert,
  
  // Navigation
  Home, Menu,
  
  // Actions
  Edit, Share,
  
  // Status
  CheckCircle, AlertCircle, Info,
  
  // Payment
  CreditCard, Wallet,
  
  // Delivery
  Truck, Package,
  
  // Rating
  ThumbsUp, ThumbsDown,
  
  // Additional
  Flame,
};

// Food Category Icons
export const FoodCategoryIcons = {
  pizza: Icons.Pizza,
  burger: Icons.Burger,
  pasta: Icons.Utensils,
  sushi: Icons.Salad,
  salad: Icons.Salad,
  dessert: Icons.Cake,
  coffee: Icons.Coffee,
  healthy: Icons.Apple,
  all: Icons.Utensils,
};

// Order Status Icons
export const OrderStatusIcons = {
  pending: Icons.Clock,
  confirmed: Icons.CheckCircle,
  preparing: Icons.ChefHat,
  outForDelivery: Icons.Truck,
  delivered: Icons.CheckCircle,
  cancelled: Icons.X,
};

// Payment Method Icons
export const PaymentIcons = {
  card: Icons.CreditCard,
  cash: Icons.Wallet,
  apple: Icons.CreditCard,
  google: Icons.CreditCard,
};

// Professional Icon Helper Functions
export const IconHelpers = {
  // Get category icon with fallback
  getCategoryIcon: (category: string) => {
    return FoodCategoryIcons[category as keyof typeof FoodCategoryIcons] || Icons.Utensils;
  },
  
  // Get status icon with fallback
  getStatusIcon: (status: string) => {
    return OrderStatusIcons[status as keyof typeof OrderStatusIcons] || Icons.Clock;
  },
  
  // Get payment icon with fallback
  getPaymentIcon: (method: string) => {
    return PaymentIcons[method as keyof typeof PaymentIcons] || Icons.CreditCard;
  },
  
  // Get category color
  getCategoryColor: (category: string) => {
    const categoryColors = {
      pizza: IconColors.pizza,
      burger: IconColors.burger,
      pasta: IconColors.pasta,
      sushi: IconColors.sushi,
      salad: IconColors.salad,
      dessert: IconColors.dessert,
      coffee: IconColors.coffee,
      healthy: IconColors.healthy,
    };
    return categoryColors[category as keyof typeof categoryColors] || IconColors.primary;
  },
};

// Vector Icons for specific use cases
export const VectorIcons = {
  MaterialIcons,
  FontAwesome,
  Ionicons,
};

export default {
  Icons,
  IconSizes,
  IconColors,
  FoodCategoryIcons,
  OrderStatusIcons,
  PaymentIcons,
  IconHelpers,
  VectorIcons,
};
