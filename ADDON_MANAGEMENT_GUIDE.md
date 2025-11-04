# Addon Management Guide

## 🎯 **Overview**

Addons are now **completely database-driven** and **not hardcoded**. Products only show addons when they are:
1. **Created in the admin dashboard**
2. **Assigned to specific products**
3. **Active in the database**

## ✅ **What Changed**

### **Before (Hardcoded)**
- ❌ Every product showed addons
- ❌ Hardcoded default addons as fallbacks
- ❌ Same addons for all products
- ❌ No admin control

### **After (Database-Driven)**
- ✅ Only products with assigned addons show customization options
- ✅ No hardcoded fallbacks
- ✅ Each product can have different addons
- ✅ Full admin control via dashboard

## 🗄️ **Database Structure**

### **Addons Table**
```sql
CREATE TABLE addons (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC DEFAULT 0,
  type TEXT CHECK (type IN ('size', 'addon', 'spice')),
  is_required BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **Menu Items Table**
```sql
-- Each product has an available_addons field (JSONB array)
available_addons UUID[] -- Array of addon IDs assigned to this product
```

## 🎛️ **Admin Dashboard Management**

### **1. Create Addons**
1. Go to **Admin Dashboard** → **Addons**
2. Click **"Add New Addon"**
3. Fill in details:
   - **Name**: "Extra Cheese"
   - **Description**: "Additional cheese topping"
   - **Price**: 1.50
   - **Type**: "addon" (size/addon/spice)
   - **Required**: No
   - **Active**: Yes

### **2. Assign Addons to Products**
1. Go to **Admin Dashboard** → **Products**
2. Edit a product
3. In the **"Available Addons"** section:
   - Select which addons should be available for this product
   - Save changes

### **3. Product-Specific Addons**
- **Burgers**: Size options + Extra Cheese, Bacon, Jalapeños + Spice levels
- **Pizza**: Size options + Extra Cheese, Vegetables, Mushrooms + Spice levels  
- **Salads**: Only add-ons like Extra Vegetables, Avocado, Extra Sauce
- **Desserts**: No addons (clean, simple)

## 📱 **Mobile App Behavior**

### **Products WITH Addons**
- Shows customization sections (Size, Add-ons, Spice Level)
- Users can select options and see price changes
- Add to cart includes selected customizations

### **Products WITHOUT Addons**
- No customization sections shown
- Clean, simple product view
- Direct "Add to Cart" button

## 🚀 **Setup Instructions**

### **1. Populate Sample Addons**
```bash
# Run the SQL script to add sample addons
psql -h your-host -U postgres -d your-database -f populate-addons.sql
```

### **2. Assign Addons to Products**
- Use the admin dashboard to assign addons to specific products
- Or run the SQL script which automatically assigns addons to burgers, pizza, and salads

### **3. Test the App**
- Open the mobile app
- Browse products - only some will have customization options
- Test the customization flow

## 🎨 **UI Behavior**

### **Conditional Rendering**
```typescript
// Only show sections when addons exist
{availableSizes.length > 0 && (
  <SizeSelection />
)}

{availableAddons.length > 0 && (
  <AddonSelection />
)}

{availableSpiceLevels.length > 0 && (
  <SpiceLevelSelection />
)}
```

### **No Fallbacks**
- No hardcoded default addons
- If no addons assigned → no customization sections shown
- Clean, professional appearance

## 🔧 **Technical Implementation**

### **Database Functions**
```typescript
// Get all addons from database
const allAddons = await getAddons();

// Filter by product's assigned addons
const productAddons = allAddons.filter(addon => 
  product.available_addons.includes(addon.id)
);

// Group by type
const sizes = productAddons.filter(a => a.type === 'size');
const addons = productAddons.filter(a => a.type === 'addon');
const spiceLevels = productAddons.filter(a => a.type === 'spice');
```

### **Product Card Updates**
- `hasCustomizations={false}` - No hardcoded customization indicators
- Only shows customization icon when product actually has addons

## 📊 **Benefits**

### **For Admins**
- ✅ Full control over which products have addons
- ✅ Easy to add/remove addons via dashboard
- ✅ Product-specific customization options
- ✅ Real-time updates in mobile app

### **For Users**
- ✅ Clean interface - only see relevant options
- ✅ No confusing empty customization sections
- ✅ Product-specific addons make sense
- ✅ Better user experience

### **For Developers**
- ✅ No hardcoded data
- ✅ Database-driven architecture
- ✅ Easy to maintain and extend
- ✅ Consistent with admin dashboard

## 🎯 **Result**

Now your app has **truly dynamic addons** that are:
- **Admin-controlled** via dashboard
- **Product-specific** (not every product has addons)
- **Database-driven** (no hardcoded fallbacks)
- **User-friendly** (clean interface)

Products without assigned addons will show a clean, simple interface, while products with addons will show the appropriate customization options! 🎉
