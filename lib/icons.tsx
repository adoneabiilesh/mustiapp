// Enhanced icon library for the food app
import { 
  Star, 
  Heart, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Check, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  User, 
  Settings, 
  LogOut,
  Lock,
  Eye,
  EyeOff,
  // Food-specific icons
  Utensils, 
  Coffee, 
  Pizza, 
  IceCream, 
  Apple, 
  Carrot,
  ChefHat, 
  // Navigation icons
  Home, 
  Menu, 
  Bell, 
  // Action icons
  Edit,
  Edit2,
  Trash,
  Trash2,
  Share, 
  // Status icons
  CheckCircle, 
  AlertCircle, 
  Info, 
  // Payment icons
  CreditCard, 
  Wallet,
  DollarSign, 
  // Delivery icons
  Truck, 
  Package,
  Bike, 
  // Rating icons
  ThumbsUp, 
  ThumbsDown, 
  // Additional icons
  Flame,
  Grid,
  // Profile icons
  Camera,
  Image,
  // Payment icons
  Shield,
  // New icons
  Percent,
  ShoppingBag,
  Award,
  MessageCircle,
  RefreshCw,
} from 'lucide-react-native';

export const Icons = {
  // Navigation
  Star,
  Heart,
  ShoppingCart,
  Plus,
  Minus,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowBack: ArrowLeft,
  ArrowLeft,
  ArrowRight,
  Search,
  Filter,
  MapPin,
  Clock,
  Phone,
  Mail,
  User,
  Settings,
  LogOut,
  Lock,
  Eye,
  EyeOff,
  
  // Food & Restaurant
  Utensils,
  Coffee,
  Pizza,
  IceCream,
  Apple,
  Carrot,
  ChefHat,
  
  // Navigation
  Home,
  Menu,
  Bell,
  
  // Actions
  Edit,
  Edit2,
  Trash,
  Trash2,
  Share,
  
  // Status
  CheckCircle,
  AlertCircle,
  Info,
  
  // Payment
  CreditCard,
  Wallet,
  DollarSign,
  
  // Delivery
  Truck,
  Package,
  Bike,
  
  // Rating
  ThumbsUp,
  ThumbsDown,
  
  // Additional
  Flame,
  Grid,
  
  // Profile icons
  Camera,
  Image,
  
  // Payment icons
  Close: X,
  Security: Shield,
  
  // Additional icons
  Percent,
  ShoppingBag,
  Award,
  MessageCircle,
  Location: MapPin,
  RefreshCw,
  
  // Settings icons - using only icons that we know exist
  Tag: Percent, // Tag icon alternative
  Globe: Home, // Globe icon alternative (using Home icon)
  Sun: Star, // Sun icon alternative (using Star icon)
  HelpCircle: AlertCircle, // HelpCircle alternative
  MessageSquare: MessageCircle, // MessageSquare alternative
  FileText: Info, // FileText alternative
};

// Icon size presets
export const IconSizes = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Common icon colors
export const IconColors = {
  primary: '#3B82F6',
  secondary: '#6B7280',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  muted: '#9CA3AF',
};