# 🏪 RESTAURANT SELECTION - How It Works

## ❓ Why Does the Menu Change When I Select a Restaurant?

Your app is a **multi-franchise system**! This means:
- Multiple restaurant locations can exist
- Each restaurant has its own menu
- Users select which location they want to order from
- **The menu filters to show only that restaurant's items**

---

## 🎯 How It Works

### **When You Select a Restaurant:**

1. **Restaurant is saved** → Stored in app (persists across sessions)
2. **Menu filters** → Only shows items from that restaurant
3. **Categories update** → Only relevant categories appear
4. **Search filters** → Searches only that restaurant's menu
5. **Orders link** → Future orders go to that restaurant

### **Visual Flow:**
```
User opens app
    ↓
Sees restaurant slider at top
    ↓
Taps a restaurant
    ↓
Restaurant saved globally
    ↓
Menu updates to show ONLY that restaurant's items
    ↓
User browses and orders from that location
```

---

## 🏢 Real-World Example

**Similar to:**
- **Starbucks App** - Select your location → See that store's available items
- **McDonald's App** - Choose restaurant → See location-specific menu
- **Uber Eats** - Pick restaurant → See their menu only

**Why?**
- Different locations may have different items
- Different availability times
- Different delivery areas
- Better user experience (no confusion)

---

## 🔄 Where Restaurant Selection is Used

### **1. Menu Screen** (`app/(tabs)/index.tsx`)
```typescript
// Filters menu items by selected restaurant
if (selectedRestaurant) {
  filters.restaurant_id = selectedRestaurant.id;
}
const items = await getMenuItems(filters);
```

### **2. Search Screen** (`app/(tabs)/search.tsx`)
```typescript
// Search only within selected restaurant
if (selectedRestaurant) {
  filters.restaurant_id = selectedRestaurant.id;
}
```

### **3. Checkout** (`app/checkout.tsx`)
```typescript
// Order is linked to selected restaurant
restaurant_id: selectedRestaurant.id
```

### **4. Global Store** (`store/restaurant.store.ts`)
```typescript
// Restaurant persists across app restarts
const useRestaurantStore = create(
  persist(
    (set) => ({
      selectedRestaurant: null,
      setSelectedRestaurant: (restaurant) => set({ selectedRestaurant: restaurant }),
    }),
    { name: 'restaurant-storage' } // Saves to device
  )
);
```

---

## 🎛️ How to Manage Restaurant Selection

### **Option 1: Let Users Change Anytime** (Current Implementation)
- Users see restaurant slider on menu screen
- Tap any restaurant to change selection
- Menu updates immediately

**Pros:**
- ✅ Easy to switch locations
- ✅ Clear visual indicator
- ✅ Flexible for users

### **Option 2: Add "View All Restaurants" Button**
Show all items from all restaurants:

```typescript
// Add button to clear selection
const handleViewAll = () => {
  clearSelectedRestaurant();
};

// Menu shows items from ALL restaurants
```

**Pros:**
- ✅ See everything available
- ✅ Browse all options

**Cons:**
- ❌ May confuse users (which location?)
- ❌ Can't order from multiple locations at once

### **Option 3: Force Selection** (Recommended)
Require users to select a restaurant before browsing:

```typescript
// Block menu until restaurant selected
if (!selectedRestaurant) {
  return <RestaurantSelectionScreen />;
}
```

**Pros:**
- ✅ Clear which location they're ordering from
- ✅ No confusion
- ✅ Better for delivery logistics

---

## 🛠️ Customization Options

### **1. Auto-Select Nearest Restaurant**
```typescript
// On app open, auto-select based on location
useEffect(() => {
  if (!selectedRestaurant) {
    const nearest = findNearestRestaurant(userLocation);
    setSelectedRestaurant(nearest);
  }
}, []);
```

### **2. Remember Last Selected**
```typescript
// Already implemented!
// Restaurant persists in AsyncStorage
// Opens to same restaurant on next launch
```

### **3. Show All Items + Restaurant Badge**
```typescript
// Show all items with restaurant name on each card
<ProductCard
  {...item}
  restaurantName={item.restaurant.name} // Add badge
/>
```

### **4. Add "Change Restaurant" in Cart**
```typescript
// Let users change restaurant from cart
// Warning: This will clear cart if items incompatible
```

---

## 🚫 What If You DON'T Want Restaurant Filtering?

If you want ONE restaurant (not multi-franchise):

### **Option A: Hide Restaurant Selection**
```typescript
// In app/(tabs)/index.tsx
// Comment out or remove:
<RestaurantSlider />

// Load all items without filter:
const items = await getMenuItems({ is_available: true });
```

### **Option B: Auto-Select Default Restaurant**
```typescript
// Always use the same restaurant
useEffect(() => {
  const defaultRestaurant = restaurants[0]; // First restaurant
  setSelectedRestaurant(defaultRestaurant);
}, []);
```

### **Option C: Remove Restaurant System**
```typescript
// Remove restaurant_id from filters
// Show all products regardless of restaurant
const items = await getMenuItems({ is_available: true }); // No filter
```

---

## 🎯 Current Implementation Benefits

### **Why This Design?**

1. **Scalability** - Easy to add new locations
2. **Clarity** - Users know which restaurant they're ordering from
3. **Flexibility** - Each restaurant can have different menus
4. **Delivery** - Orders go to correct location
5. **Management** - Each restaurant manages its own items

### **User Experience:**
```
User Journey:
1. Opens app
2. Sees beautiful restaurant slider
3. Scrolls through options (photos, ratings, hours)
4. Taps preferred location
5. Browses menu for that location
6. Orders with confidence
```

---

## 📊 Data Flow

### **Database Structure:**
```
restaurants
  ├─ id
  ├─ name
  ├─ logo_url
  └─ is_active

menu_items
  ├─ id
  ├─ name
  ├─ price
  └─ restaurant_id (links to restaurant)

orders
  ├─ id
  ├─ customer_id
  └─ restaurant_id (which location)
```

### **App Flow:**
```
1. App loads restaurants from database
2. Shows in slider
3. User taps restaurant
4. Saved to store: { selectedRestaurant }
5. Menu queries: WHERE restaurant_id = selected
6. Display filtered results
```

---

## 🔧 Troubleshooting

### **Issue: Menu is empty**
**Cause:** Selected restaurant has no menu items
**Solution:** 
- Check database: `SELECT * FROM menu_items WHERE restaurant_id = 'xxx'`
- Add items to that restaurant via admin dashboard

### **Issue: Restaurant selection doesn't persist**
**Cause:** AsyncStorage not working
**Solution:**
- Check store configuration
- Verify persist setup in `restaurant.store.ts`

### **Issue: Want to see all items**
**Cause:** Restaurant filtering is active
**Solution:**
- Clear restaurant selection
- Or modify code to skip filter

---

## 💡 Recommendations

### **For Single Location:**
If you only have ONE restaurant:
1. Auto-select it on app open
2. Hide the restaurant slider
3. Users never see selection (seamless)

### **For Multi-Location:**
If you have MULTIPLE restaurants:
1. Keep current implementation ✅
2. Show beautiful slider (done!) ✅
3. Let users choose (done!) ✅
4. Filter menu by selection (done!) ✅

### **For Franchise/Chain:**
If you're a chain with many locations:
1. Keep current system ✅
2. Add location search/filter
3. Show nearest locations first
4. Display delivery radius

---

## 🎉 Summary

**Restaurant selection filters the menu because:**
- ✅ You have a multi-restaurant system
- ✅ Each restaurant has its own menu
- ✅ Users need to know where they're ordering from
- ✅ Orders need to go to the correct location
- ✅ This is standard for food delivery apps

**To change behavior:**
1. **Keep as-is** (recommended for multi-location)
2. **Auto-select default** (for single location)
3. **Show all items** (add "View All" option)
4. **Remove filtering** (modify code)

**Current system provides the best UX for multi-franchise apps!** 🚀

---

## 🛠️ Quick Fixes

### Want to disable restaurant filtering temporarily?

**File:** `app/(tabs)/index.tsx`

**Find:**
```typescript
if (selectedRestaurant) {
  filters.restaurant_id = selectedRestaurant.id;
}
```

**Change to:**
```typescript
// Temporarily show all items (comment out filter)
// if (selectedRestaurant) {
//   filters.restaurant_id = selectedRestaurant.id;
// }
```

**Result:** Menu shows ALL items from ALL restaurants

---

**Need specific changes? Let me know what behavior you want!** 🎯


