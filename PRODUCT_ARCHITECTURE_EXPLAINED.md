# 🏗️ Product Architecture: How Products Work Across Restaurants

## 📊 Current Setup

### Database Structure:
**ONE `menu_items` table** for ALL products across ALL restaurants.

Each product has a `restaurant_id` column that determines which restaurant(s) it belongs to:

```
┌─────────────────────────────────────────────────────────────┐
│                     menu_items TABLE                         │
├──────────────────┬─────────────────┬───────────────────────┤
│ Product Name     │ restaurant_id   │ Visible To            │
├──────────────────┼─────────────────┼───────────────────────┤
│ Vodka Lemon      │ ccbf921d-...    │ Musti Place ONLY     │
│ Gin Tonic        │ ccbf921d-...    │ Musti Place ONLY     │
│ Pepperoni Pizza  │ NULL            │ ALL Restaurants      │
│ Chicken Caesar   │ NULL            │ ALL Restaurants      │
│ Special Burger   │ abc123-...      │ Restaurant 2 ONLY    │
└──────────────────┴─────────────────┴───────────────────────┘
```

---

## 🔍 How It Works

### Option 1: Restaurant-Specific Products
**`restaurant_id = 'ccbf921d-5d78-484d-8690-c3a33159f609'`**
- Product belongs to **Musti Place ONLY**
- Only shows in Musti Place's menu
- Other restaurants cannot see it

### Option 2: Shared Products (Global Menu Items)
**`restaurant_id = NULL`**
- Product is **UNASSIGNED** (no specific restaurant)
- Shows in **ALL restaurants**
- Available to every restaurant by default

---

## 📈 Your Current Data

Based on the test results:

```
Total Products in Database: 258
├── 178 Musti Place-specific (restaurant_id = Musti Place ID)
└── 80 Unassigned/Shared (restaurant_id = NULL)
```

### When You View Musti Place:
✅ See 178 Musti Place products
✅ See 80 shared products
📊 **Total: 258 products**

### When You View Another Restaurant:
✅ See 0 that restaurant's specific products (unless assigned)
✅ See 80 shared products
📊 **Total: 80 products** (only the shared ones)

---

## 🎯 Query Logic

### Admin Dashboard Query:
```sql
SELECT * FROM menu_items
WHERE restaurant_id = '<selected_restaurant_id>'
   OR restaurant_id IS NULL
ORDER BY name ASC
```

**Translation**: Show products that either:
1. Belong specifically to the selected restaurant, OR
2. Are unassigned (NULL) and available to all

---

## 🔄 Architecture Options

### Current: **Hybrid Model** ✅
- **Pros**: 
  - Flexibility (products can be global or restaurant-specific)
  - Easy to share common items (drinks, popular dishes)
  - Single source of truth (one database table)
- **Cons**: 
  - Products can appear in multiple restaurants if NULL
  - Need to manage which products are shared vs. specific

### Alternative 1: **Fully Separate**
Each restaurant has ONLY its own products (no sharing):
```sql
WHERE restaurant_id = '<restaurant_id>'
-- (Remove the OR restaurant_id IS NULL)
```
- **Pros**: Complete isolation, no cross-contamination
- **Cons**: Must duplicate common items, more maintenance

### Alternative 2: **Fully Shared**
All products available to all restaurants:
```sql
SELECT * FROM menu_items
-- (No filtering at all)
```
- **Pros**: Maximum flexibility, easy management
- **Cons**: Menu gets cluttered, no customization per restaurant

---

## 💡 Recommended Workflow

### For Restaurant-Specific Products:
1. Create product in admin dashboard
2. Assign it to a specific restaurant
3. **Only that restaurant sees it**

### For Shared Products (Common Menu Items):
1. Create product in admin dashboard
2. Leave `restaurant_id` as **NULL** (or "Unassigned")
3. **All restaurants see it**

---

## 🔧 How to Assign Products

### In Admin Dashboard:

When editing a product, you'll see:
```
┌─────────────────────────────────────┐
│ Product: Vodka Lemon                │
├─────────────────────────────────────┤
│ Restaurant: [Dropdown]              │
│   ⚪ Unassigned (All Restaurants)   │
│   🔵 Musti Place                    │
│   ⚪ Restaurant 2                   │
│   ⚪ Restaurant 3                   │
└─────────────────────────────────────┘
```

Select restaurant = Product is specific to that restaurant
Select "Unassigned" = Product appears in all restaurants

---

## 📊 Your Current Situation

### Musti Place Products (178):
- Imported from your menu images
- All assigned to `restaurant_id = 'ccbf921d-5d78-484d-8690-c3a33159f609'`
- **Only visible in Musti Place**

### Unassigned Products (80):
- Probably created before multi-restaurant setup
- Have `restaurant_id = NULL`
- **Visible in ALL restaurants**

---

## ❓ What Do You Want?

### Option A: Keep Current Setup (Recommended)
- Musti Place-specific products stay specific
- Shared products remain shared
- Maximum flexibility

### Option B: Make All Products Restaurant-Specific
Run this to assign unassigned products to Musti Place:
```sql
UPDATE menu_items
SET restaurant_id = 'ccbf921d-5d78-484d-8690-c3a33159f609'
WHERE restaurant_id IS NULL;
```
**Result**: All 258 products only visible in Musti Place

### Option C: Make All Products Shared
Run this to unassign all products:
```sql
UPDATE menu_items
SET restaurant_id = NULL;
```
**Result**: All 258 products visible in all restaurants

---

## 🎯 Best Practice

**For Multi-Franchise Setup:**

1. **Common Items** (drinks, popular dishes) → `restaurant_id = NULL`
   - Coca-Cola, Water, etc.
   - Shows in all restaurant menus

2. **Location-Specific Items** → Assign to specific `restaurant_id`
   - Musti Place signature cocktails
   - Restaurant 2's special pizza
   - Each restaurant has unique offerings

3. **Easy Management**:
   - Update a shared item once → changes everywhere
   - Each restaurant can have signature items
   - Customers see a mix of global + local items

---

## 🔍 Check Your Data

Want to see the breakdown? Run in Supabase SQL Editor:
```sql
-- Count by restaurant
SELECT 
  COALESCE(r.name, 'Unassigned (Shared)') as restaurant,
  COUNT(*) as product_count
FROM menu_items m
LEFT JOIN restaurants r ON m.restaurant_id = r.id
GROUP BY r.name
ORDER BY product_count DESC;
```

---

## ✅ Summary

**Current Setup:**
- 📁 **Database**: One shared table (`menu_items`)
- 🔗 **Linking**: Products linked to restaurants via `restaurant_id`
- 🌐 **Visibility**: Products with NULL = All restaurants, Specific ID = That restaurant only
- 💪 **Flexibility**: Can have both shared and restaurant-specific products

**This is a standard multi-tenant architecture!** Each tenant (restaurant) has their own products, but can also share common items. Very common in SaaS and franchise setups.

---

Let me know if you want to:
1. Keep current setup (recommended)
2. Make all products specific to one restaurant
3. Make all products shared across all restaurants
4. Something else?


