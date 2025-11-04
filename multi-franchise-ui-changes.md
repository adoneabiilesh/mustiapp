# 🎨 Multi-Franchise UI Changes

## 📱 **USER INTERFACE UPDATES**

### **1. Restaurant Selection Screen**
```typescript
// app/restaurant-selection.tsx
interface RestaurantCard {
  id: string;
  name: string;
  cuisineType: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  minimumOrder: number;
  logo: string;
  coverImage: string;
  isOpen: boolean;
  distance: number;
}
```

### **2. Updated Home Screen**
```typescript
// app/(tabs)/index.tsx - Updated for multi-restaurant
interface HomeScreenProps {
  selectedRestaurant?: string;
  nearbyRestaurants: Restaurant[];
  featuredRestaurants: Restaurant[];
  popularItems: MenuItem[];
  promotions: Promotion[];
}
```

### **3. Restaurant-Specific Menu**
```typescript
// app/restaurant-menu.tsx
interface RestaurantMenuProps {
  restaurantId: string;
  categories: Category[];
  menuItems: MenuItem[];
  addons: Addon[];
}
```

## 🏗️ **NAVIGATION STRUCTURE CHANGES**

### **Current Navigation (Single Restaurant):**
```
Home → Menu → Cart → Orders → Profile
```

### **New Navigation (Multi-Restaurant):**
```
Restaurants → [Restaurant] → Menu → Cart → Orders → Profile
```

## 🎯 **KEY UI COMPONENTS TO CREATE**

### **1. Restaurant Selection**
```typescript
// components/RestaurantSelector.tsx
const RestaurantSelector = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>();
  
  return (
    <ScrollView>
      {restaurants.map(restaurant => (
        <RestaurantCard 
          key={restaurant.id}
          restaurant={restaurant}
          onSelect={() => setSelectedRestaurant(restaurant.id)}
        />
      ))}
    </ScrollView>
  );
};
```

### **2. Restaurant Card**
```typescript
// components/RestaurantCard.tsx
interface RestaurantCardProps {
  restaurant: Restaurant;
  onSelect: () => void;
}

const RestaurantCard = ({ restaurant, onSelect }: RestaurantCardProps) => {
  return (
    <TouchableOpacity onPress={onSelect}>
      <View style={styles.card}>
        <Image source={{ uri: restaurant.coverImage }} style={styles.coverImage} />
        <View style={styles.content}>
          <Text style={styles.name}>{restaurant.name}</Text>
          <Text style={styles.cuisine}>{restaurant.cuisineType}</Text>
          <View style={styles.stats}>
            <StarRating rating={restaurant.rating} />
            <Text style={styles.deliveryTime}>{restaurant.deliveryTime}</Text>
            <Text style={styles.deliveryFee}>${restaurant.deliveryFee} delivery</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
```

### **3. Restaurant Filter**
```typescript
// components/RestaurantFilter.tsx
interface FilterOptions {
  cuisineType: string[];
  priceRange: [number, number];
  deliveryTime: number;
  rating: number;
  isOpen: boolean;
}

const RestaurantFilter = ({ onFilterChange }: { onFilterChange: (filters: FilterOptions) => void }) => {
  const [filters, setFilters] = useState<FilterOptions>({
    cuisineType: [],
    priceRange: [0, 100],
    deliveryTime: 60,
    rating: 0,
    isOpen: true
  });

  return (
    <View style={styles.filterContainer}>
      <Text style={styles.filterTitle}>Filter Restaurants</Text>
      
      {/* Cuisine Type Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Cuisine Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {CUISINE_TYPES.map(cuisine => (
            <TouchableOpacity
              key={cuisine}
              style={[
                styles.filterChip,
                filters.cuisineType.includes(cuisine) && styles.filterChipActive
              ]}
              onPress={() => toggleCuisineFilter(cuisine)}
            >
              <Text style={styles.filterChipText}>{cuisine}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Price Range Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Price Range</Text>
        <Slider
          value={filters.priceRange}
          onValueChange={(value) => setFilters({...filters, priceRange: value})}
          minimumValue={0}
          maximumValue={100}
          step={5}
        />
        <Text style={styles.filterValue}>
          ${filters.priceRange[0]} - ${filters.priceRange[1]}
        </Text>
      </View>

      {/* Rating Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Minimum Rating</Text>
        <StarRating
          rating={filters.rating}
          onRatingChange={(rating) => setFilters({...filters, rating})}
          size={24}
        />
      </View>
    </View>
  );
};
```

## 🔄 **APP FLOW CHANGES**

### **1. New User Flow**
```
1. App Launch
2. Location Permission
3. Restaurant Selection Screen
4. Choose Restaurant
5. View Restaurant Menu
6. Add Items to Cart
7. Checkout
8. Order Tracking
```

### **2. Restaurant Switching Flow**
```
1. Current Restaurant Menu
2. Tap "Change Restaurant"
3. Restaurant Selection Screen
4. Choose New Restaurant
5. Clear Cart (or Save for Later)
6. View New Restaurant Menu
```

## 📊 **DATA STRUCTURE CHANGES**

### **1. User State Management**
```typescript
// store/user.store.ts
interface UserState {
  selectedRestaurant: string | null;
  favoriteRestaurants: string[];
  orderHistory: Order[];
  preferences: UserPreferences;
}
```

### **2. Restaurant State Management**
```typescript
// store/restaurant.store.ts
interface RestaurantState {
  restaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  nearbyRestaurants: Restaurant[];
  featuredRestaurants: Restaurant[];
  filters: FilterOptions;
}
```

### **3. Cart State Updates**
```typescript
// store/cart.store.ts - Updated for multi-restaurant
interface CartState {
  items: CartItem[];
  restaurantId: string | null;
  subtotal: number;
  deliveryFee: number;
  total: number;
  
  // New methods
  switchRestaurant: (restaurantId: string) => void;
  clearCart: () => void;
  saveForLater: () => void;
}
```

## 🎨 **DESIGN SYSTEM UPDATES**

### **1. Color Scheme**
```typescript
// lib/designSystem.ts - Updated colors
export const Colors = {
  primary: {
    50: '#f0f9ff',
    500: '#3b82f6', // Blue for platform
    600: '#2563eb',
  },
  restaurant: {
    primary: '#ef4444', // Red for restaurant-specific
    secondary: '#f97316', // Orange for accents
  },
  status: {
    open: '#10b981',
    closed: '#ef4444',
    busy: '#f59e0b',
  }
};
```

### **2. Typography Updates**
```typescript
// lib/designSystem.ts - Updated typography
export const Typography = {
  restaurantName: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
  },
  cuisineType: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.neutral[600],
  },
  deliveryInfo: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.neutral[500],
  }
};
```

## 🚀 **IMPLEMENTATION STEPS**

### **Step 1: Database Migration**
1. Run the multi-franchise schema
2. Migrate existing data
3. Set up restaurant admin accounts

### **Step 2: UI Components**
1. Create restaurant selection screen
2. Update home screen for multi-restaurant
3. Add restaurant switching functionality

### **Step 3: Admin Dashboard**
1. Build admin authentication
2. Create restaurant management interface
3. Add menu management tools

### **Step 4: Testing & Launch**
1. Test multi-restaurant functionality
2. Train restaurant admins
3. Launch with pilot restaurants

## 💡 **BUSINESS BENEFITS**

### **1. Scalability**
- Add unlimited restaurants
- Scale revenue with restaurant count
- Network effects

### **2. Revenue Diversification**
- Commission from multiple restaurants
- Subscription fees
- Premium features

### **3. Market Expansion**
- Serve different cuisines
- Target different demographics
- Geographic expansion







