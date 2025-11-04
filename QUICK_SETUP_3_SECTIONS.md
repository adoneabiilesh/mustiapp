# ⚡ Quick Setup Guide - 3 Section Home Screen

## 🚀 Get Started in 5 Minutes

### Step 1: Run Database Migration (2 min)

**Option A - Supabase Dashboard:**
1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `create-special-offers-combos.sql`
3. Paste and run

**Option B - CLI:**
```bash
psql -h your-host -U postgres -d your-db -f create-special-offers-combos.sql
```

---

### Step 2: Set Featured Restaurant (30 sec)

```sql
-- In Supabase SQL Editor or your database
UPDATE restaurants 
SET is_featured = true,
    is_active = true
WHERE id = 'your-restaurant-id';
```

Or via Admin Dashboard:
1. Go to `Restaurants`
2. Edit your restaurant
3. Check "Featured" checkbox

---

### Step 3: Upload Restaurant Images (1 min)

1. Navigate to `/restaurant-settings` in admin dashboard
2. Under "Basic Information" section
3. Upload **Logo** (square image, 200x200px min)
4. Upload **Cover Image** (16:9 ratio, 1200x675px min)
5. Click "Save Changes"

---

### Step 4: Mark Products as Featured (30 sec)

1. Go to `/products` in admin dashboard
2. Edit 5-10 of your best products
3. Check "Featured" checkbox for each
4. Save

---

### Step 5: Create Your First Special Offer (1 min)

1. Navigate to `/special-offers` (new menu item)
2. Click "Create Combo"
3. Enter title: e.g., "Family Feast"
4. Add description
5. Click products to add them to combo
6. Adjust quantities with +/- buttons
7. Set offer price (discounted)
8. Upload an image
9. Set expiry date
10. Click "Create Offer"

---

## ✅ Verify Everything Works

### Mobile App:
1. Refresh home screen (pull down)
2. You should see:
   - ✅ **Section 1**: Your featured restaurant with image
   - ✅ **Section 2**: Featured products (horizontal scroll)
   - ✅ **Section 3**: Special offers (horizontal scroll)

### If Something's Missing:

**Restaurant not showing?**
- Check `is_featured = true` and `is_active = true`
- Verify image uploaded

**Featured products not showing?**
- Ensure products marked as `is_featured = true`
- Check `is_available = true`

**Special offers not showing?**
- Verify offer `is_active = true`
- Check `valid_until` date is future
- Ensure products added to combo

---

## 🎯 What You Get

### Mobile App:
```
📱 HOME SCREEN

┌────────────────────────────┐
│  OUR RESTAURANT            │
│  [Beautiful Hero Card]     │
│  Restaurant Image          │
│  Name, Rating, Location    │
└────────────────────────────┘

┌────────────────────────────┐
│  FEATURED PRODUCTS         │
│  ← [Card] [Card] [Card] →  │
│  Scroll horizontally       │
└────────────────────────────┘

┌────────────────────────────┐
│  SPECIAL OFFERS           │
│  ← [Combo] [Combo] →      │
│  Discounts & Savings      │
└────────────────────────────┘

─────────────────────────────

[Rest of menu below]
```

### Admin Dashboard:
```
🖥️ ADMIN PANEL

├─ Restaurant Settings
│  └─ Logo & Cover Upload ✨NEW
│
└─ Special Offers ✨NEW
   ├─ Create Combos
   ├─ Add Multiple Products
   ├─ Set Discounts
   ├─ Upload Images
   └─ Manage Validity
```

---

## 📁 Files Created

### Mobile Components:
- `components/OurRestaurantSection.tsx`
- `components/FeaturedProductsSection.tsx`
- `components/SpecialOffersSection.tsx`

### Admin Pages:
- `admin-dashboard/app/special-offers/page.tsx`

### Database:
- `create-special-offers-combos.sql`

### Documentation:
- `HOME_SCREEN_3_SECTIONS_COMPLETE.md` (full guide)
- `QUICK_SETUP_3_SECTIONS.md` (this file)

---

## 💡 Quick Tips

1. **Use High-Quality Images** - They make or break the design
2. **Feature Your Best** - Only feature top-selling products
3. **Create Urgency** - Use time limits on offers
4. **Show Value** - Highlight savings clearly
5. **Rotate Content** - Update featured items weekly

---

## 🆘 Need Help?

### Check These First:
1. All database migrations ran successfully
2. Images uploaded to correct folders
3. Products/restaurant marked as active
4. Dates are in the future for offers

### Console Logs:
Mobile app logs everything:
```
🔄 Loading featured restaurant...
✅ Featured products loaded: 5
✅ Special offers loaded: 2
```

---

## 🎨 Customization

### Want Different Colors?
- All sections use your existing design system
- Colors in `lib/designSystem.ts`
- Primary orange: `#FF6B35`

### Want Different Layouts?
- All components are in `components/` folder
- Easy to modify styles
- Change card sizes, spacing, etc.

### Want More Sections?
- Follow same pattern
- Create new component
- Add to home screen
- Super flexible!

---

## ✨ That's It!

You now have a **beautiful, professional home screen** with:
- ✅ Restaurant showcase
- ✅ Featured products
- ✅ Special combo offers

All **fully customizable** from your admin dashboard!

**Happy selling!** 🚀🎉




