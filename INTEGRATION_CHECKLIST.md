# ✅ INTEGRATION CHECKLIST - Make Your App Multi-Restaurant!

## 🎯 Quick Steps to Activate Multi-Restaurant Features

---

## STEP 1: Update Home Screen (5 minutes)

### File: `app/(tabs)/index.tsx`

**Add at the top with other imports:**
```typescript
import useRestaurantStore from '@/store/restaurant.store';
import { useSmartCache } from '@/lib/performance';
```

**Inside your component, add:**
```typescript
const { selectedRestaurant } = useRestaurantStore();

// Redirect to restaurant selection if none selected
useEffect(() => {
  if (!selectedRestaurant) {
    router.push('/restaurant-discovery');
  }
}, [selectedRestaurant]);
```

**Update menu fetching to filter by restaurant:**
```typescript
// OLD:
const { data: menuItems } = useSmartCache(
  'menu_items',
  () => getMenuItems(),
  { ttl: 300000 }
);

// NEW:
const { data: menuItems } = useSmartCache(
  `menu_${selectedRestaurant?.id || 'default'}`,
  () => getMenuItems({ restaurant_id: selectedRestaurant?.id }),
  { ttl: 300000 }
);
```

**Add restaurant switcher button (after header, before filters):**
```typescript
{selectedRestaurant && (
  <TouchableOpacity 
    onPress={() => router.push('/restaurant-discovery')}
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      padding: Spacing.md,
      backgroundColor: 'white',
      borderRadius: BorderRadius.lg,
      marginHorizontal: Spacing.lg,
      marginBottom: Spacing.md,
      ...Shadows.sm,
    }}
  >
    <Image 
      source={{ uri: selectedRestaurant.logo_url }} 
      style={{ 
        width: 40, 
        height: 40, 
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.neutral[200]
      }}
      resizeMode="cover"
    />
    <View style={{ flex: 1, marginLeft: Spacing.md }}>
      <Text style={Typography.semibold}>{selectedRestaurant.name}</Text>
      <Text style={[Typography.caption, { color: Colors.neutral[600] }]}>
        {selectedRestaurant.cuisine_type} • {selectedRestaurant.preparation_time} min
      </Text>
    </View>
    <Icons.ChevronRight size={20} color={Colors.neutral[400]} />
  </TouchableOpacity>
)}
```

---

## STEP 2: Update Profile Screen (3 minutes)

### File: `app/(tabs)/profile.tsx`

**Add these menu items:**
```typescript
// After other imports
import useRestaurantStore from '@/store/restaurant.store';

// Inside component
const { selectedRestaurant } = useRestaurantStore();

// Add these menu items:
<TouchableOpacity
  style={menuItemStyle}
  onPress={() => router.push('/restaurant-discovery')}
>
  <Icons.MapPin size={24} color={Colors.primary[500]} />
  <View style={{ flex: 1, marginLeft: Spacing.md }}>
    <Text style={Typography.semibold}>Change Restaurant</Text>
    <Text style={Typography.caption}>
      Currently: {selectedRestaurant?.name || 'Not selected'}
    </Text>
  </View>
  <Icons.ChevronRight size={20} color={Colors.neutral[400]} />
</TouchableOpacity>

<TouchableOpacity
  style={menuItemStyle}
  onPress={() => router.push('/enhanced-loyalty')}
>
  <Icons.Award size={24} color={Colors.primary[500]} />
  <View style={{ flex: 1, marginLeft: Spacing.md }}>
    <Text style={Typography.semibold}>Loyalty Rewards 🏆</Text>
    <Text style={Typography.caption}>Earn points and get rewards</Text>
  </View>
  <Icons.ChevronRight size={20} color={Colors.neutral[400]} />
</TouchableOpacity>

<TouchableOpacity
  style={menuItemStyle}
  onPress={() => router.push('/settings')}
>
  <Icons.Settings size={24} color={Colors.primary[500]} />
  <View style={{ flex: 1, marginLeft: Spacing.md }}>
    <Text style={Typography.semibold}>Settings</Text>
    <Text style={Typography.caption}>App preferences and account</Text>
  </View>
  <Icons.ChevronRight size={20} color={Colors.neutral[400]} />
</TouchableOpacity>
```

---

## STEP 3: Update Cart Screen (5 minutes)

### File: `app/(tabs)/cart.tsx`

**Add restaurant validation:**
```typescript
import useRestaurantStore from '@/store/restaurant.store';
import { Alert } from 'react-native';

// Inside component
const { selectedRestaurant } = useRestaurantStore();

// Update addToCart function
const handleAddToCart = (item) => {
  // Check if item is from selected restaurant
  if (selectedRestaurant && item.restaurant_id !== selectedRestaurant.id) {
    Alert.alert(
      'Different Restaurant',
      `This item is from a different restaurant. Your cart contains items from ${selectedRestaurant.name}. Clear cart first?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear Cart', 
          style: 'destructive',
          onPress: () => {
            clearCart();
            addToCart(item);
          }
        }
      ]
    );
    return;
  }
  
  // Normal add to cart logic
  addToCart(item);
};
```

**Update checkout button:**
```typescript
<TouchableOpacity
  style={{
    backgroundColor: Colors.primary[500],
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  }}
  onPress={() => router.push('/fast-checkout')}
>
  <Text style={[Typography.buttonLarge, { color: 'white' }]}>
    Fast Checkout ⚡ - €{total.toFixed(2)}
  </Text>
</TouchableOpacity>
```

---

## STEP 4: Add Skeleton Loaders (2 minutes)

**In any screen with loading state:**
```typescript
import { MenuPageSkeleton } from '@/components/SkeletonLoaders';

// Replace loading spinners with:
{isLoading ? <MenuPageSkeleton /> : <YourContent />}
```

**Available skeletons:**
- `MenuPageSkeleton` - Full menu page
- `CartPageSkeleton` - Full cart page
- `OrdersPageSkeleton` - Full orders page
- `ProductCardSkeleton` - Product card
- `ListItemSkeleton` - List item
- `OrderCardSkeleton` - Order card

---

## STEP 5: Database Setup (One-time)

### Run in Supabase SQL Editor:

**1. Check if restaurants table exists:**
```sql
SELECT * FROM restaurants LIMIT 5;
```

**2. If empty, add sample restaurants:**
```sql
INSERT INTO restaurants (
  name, slug, description, cuisine_type, phone, email,
  logo_url, cover_image_url, address, city, state, country,
  postal_code, latitude, longitude, delivery_radius,
  delivery_fee, minimum_order, preparation_time,
  is_active, is_featured, rating, total_reviews
) VALUES
  (
    'Pizza Palace',
    'pizza-palace',
    'Best pizza in town with fresh ingredients',
    'Italian',
    '+1-555-0101',
    'contact@pizzapalace.com',
    'https://example.com/logo1.jpg',
    'https://example.com/cover1.jpg',
    '123 Main St',
    'New York',
    'NY',
    'USA',
    '10001',
    40.7128,
    -74.0060,
    5,
    3.99,
    15.00,
    30,
    true,
    true,
    4.5,
    248
  ),
  (
    'Burger Heaven',
    'burger-heaven',
    'Gourmet burgers and fries',
    'American',
    '+1-555-0102',
    'hello@burgerheaven.com',
    'https://example.com/logo2.jpg',
    'https://example.com/cover2.jpg',
    '456 Oak Ave',
    'New York',
    'NY',
    'USA',
    '10002',
    40.7589,
    -73.9851,
    8,
    2.99,
    12.00,
    25,
    true,
    true,
    4.7,
    512
  ),
  (
    'Sushi Master',
    'sushi-master',
    'Authentic Japanese sushi',
    'Japanese',
    '+1-555-0103',
    'info@sushimaster.com',
    'https://example.com/logo3.jpg',
    'https://example.com/cover3.jpg',
    '789 Pine Rd',
    'New York',
    'NY',
    'USA',
    '10003',
    40.7489,
    -73.9680,
    6,
    4.99,
    20.00,
    35,
    true,
    false,
    4.8,
    892
  );
```

**3. Link menu items to restaurants:**
```sql
-- Update existing menu items to have restaurant_id
UPDATE menu_items 
SET restaurant_id = (SELECT id FROM restaurants LIMIT 1)
WHERE restaurant_id IS NULL;
```

---

## STEP 6: Install Missing Packages (if needed)

```bash
# If you haven't installed these:
npx expo install expo-haptics
npx expo install expo-location
npx expo install expo-linear-gradient
npx expo install zustand
```

---

## STEP 7: Test Everything (10 minutes)

### Test Checklist:

1. **Restaurant Discovery**
   - [ ] Open app → Should redirect to restaurant selection
   - [ ] See list of restaurants
   - [ ] Search works
   - [ ] Filters work (All, Nearby, Favorites, Open)
   - [ ] Can select a restaurant

2. **Home Screen**
   - [ ] Shows selected restaurant at top
   - [ ] Menu loads for selected restaurant only
   - [ ] Can tap restaurant to change

3. **Profile**
   - [ ] "Change Restaurant" link works
   - [ ] "Loyalty Rewards" link works
   - [ ] "Settings" link works

4. **Cart**
   - [ ] Adding items from same restaurant works
   - [ ] Warning when adding from different restaurant
   - [ ] "Fast Checkout" button appears

5. **Performance**
   - [ ] Skeleton loaders show while loading
   - [ ] Smooth animations
   - [ ] Fast response times

---

## 🎯 QUICK WINS (Do These First!)

### Priority 1: Essential
1. ✅ Step 1 - Update home screen
2. ✅ Step 5 - Database setup (add sample restaurants)

### Priority 2: User Experience
3. ✅ Step 2 - Update profile screen
4. ✅ Step 4 - Add skeleton loaders

### Priority 3: Polish
5. ✅ Step 3 - Cart validation
6. ✅ Step 7 - Test everything

---

## 🚀 OPTIONAL ENHANCEMENTS

### Add Restaurant Details Page
Create `app/restaurant-detail.tsx`:
```typescript
// Show full restaurant info:
- Cover image
- Logo
- Description
- Hours
- Contact info
- Reviews
- Full menu
```

### Add Restaurant Reviews
```sql
CREATE TABLE restaurant_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id),
  user_id UUID REFERENCES users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Add Restaurant Hours
```sql
CREATE TABLE restaurant_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id),
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
  open_time TIME,
  close_time TIME,
  is_closed BOOLEAN DEFAULT false
);
```

---

## 📊 VERIFICATION

After completing all steps, you should have:

✅ Restaurant discovery screen with search & filters  
✅ Restaurant info displayed on home screen  
✅ Menu filtered by selected restaurant  
✅ Cart restricted to single restaurant  
✅ Profile links to all new features  
✅ Skeleton loaders throughout  
✅ Fast checkout available  
✅ Loyalty program accessible  
✅ Settings page functional  

---

## 🆘 TROUBLESHOOTING

### "No restaurants found"
- Check database has restaurants (Step 5)
- Check `is_active = true`
- Check Supabase connection

### "Menu not loading"
- Verify menu items have `restaurant_id`
- Check restaurant is selected
- Check network connection

### "App crashes on startup"
- Install all required packages (Step 6)
- Check imports are correct
- Check for typos in code

### "Skeleton loaders not showing"
- Import from `@/components/SkeletonLoaders`
- Use `isLoading` state properly
- Check component is rendering

---

## 📚 DOCUMENTATION

For more details, see:
- `TOP_TIER_APP_COMPLETE.md` - Full overview
- `QUICK_START_GUIDE.md` - Quick integration
- `APP_PERFORMANCE_UPGRADE_COMPLETE.md` - Performance details

---

**Total Integration Time: ~30 minutes**  
**Difficulty: Easy** ✅  
**Result: TOP-TIER APP!** 🚀

---

**Let's make your app amazing!** ✨


