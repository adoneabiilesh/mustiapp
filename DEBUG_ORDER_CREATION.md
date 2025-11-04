# 🐛 Debug Order Creation Issue

## Error Details
```
Failed to load resource: the server responded with a status of 400
Error creating order: Object
❌ Error in createOrder: Object
❌ Error placing order: Error: Failed to create order
```

## Common Causes of 400 Errors

### 1. **Missing Required Fields**
Check if these fields exist in your `orders` table:
- ✅ `customer_id` (UUID, NOT NULL)
- ✅ `restaurant_id` (UUID, NOT NULL)
- ✅ `status` (TEXT, NOT NULL)
- ✅ `total` (NUMERIC, NOT NULL)
- ✅ `delivery_address` (JSONB)
- ✅ `subtotal` (NUMERIC)
- ✅ `delivery_fee` (NUMERIC)
- ✅ `tax` (NUMERIC)

### 2. **RLS Policies**
Ensure `orders` table has INSERT policy:
```sql
-- Check current policies
SELECT * FROM pg_policies WHERE tablename = 'orders';

-- Create INSERT policy if missing
CREATE POLICY "Users can create own orders"
ON orders
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = customer_id);
```

### 3. **Foreign Key Constraints**
Check if `restaurant_id` exists in `restaurants` table:
```sql
SELECT id, name FROM restaurants LIMIT 5;
```

---

## 🔍 Debugging Steps

### Step 1: Check Browser Console
Open Developer Tools (F12) and look for the full error message:
```javascript
// Look for detailed error like:
{
  code: "23502",  // NOT NULL violation
  details: "Failing row contains...",
  hint: "...",
  message: "..."
}
```

### Step 2: Test in Supabase SQL Editor
Run this to manually create an order:
```sql
INSERT INTO orders (
  customer_id,
  customer_name,
  restaurant_id,
  status,
  total,
  subtotal,
  delivery_fee,
  tax,
  delivery_address,
  payment_method,
  payment_status
) VALUES (
  auth.uid(),  -- Your user ID
  'Test User',
  (SELECT id FROM restaurants LIMIT 1),  -- First restaurant
  'pending',
  25.50,
  20.00,
  2.99,
  2.51,
  '{"street": "123 Main St", "city": "Test City"}'::jsonb,
  'cash',
  'pending'
) RETURNING *;
```

If this fails, you'll see the exact error!

### Step 3: Check Restaurant Selection
Make sure `selectedRestaurant` is not null:
```javascript
console.log('Selected restaurant:', selectedRestaurant);
```

### Step 4: Verify User is Authenticated
```javascript
console.log('Current user:', user);
```

---

## 🛠️ Fixes Applied

### ✅ Added Validation
```typescript
// Validate required fields before insert
if (!restaurantId) throw new Error('Restaurant ID is required');
if (!orderData.customer_id) throw new Error('Customer ID is required');
if (!orderData.items.length) throw new Error('Order must contain items');
```

### ✅ Added Default Values
```typescript
customer_name: orderData.customer_name || 'Guest',
phone_number: orderData.phone_number || '',
special_instructions: orderData.special_instructions || '',
stripe_payment_intent_id: orderData.stripe_payment_intent_id || null,
```

### ✅ Enhanced Error Logging
```typescript
console.error('❌ Error creating order:', {
  error: orderError,
  message: orderError.message,
  details: orderError.details,
  hint: orderError.hint,
});
```

---

## 🧪 Test the Fix

1. **Clear browser console** (Ctrl+Shift+J or F12)
2. **Add items to cart**
3. **Go to checkout**
4. **Select a delivery address**
5. **Click "Place Order"**
6. **Check console** for detailed error messages

You should now see specific errors like:
```
❌ Missing restaurant_id
❌ Missing customer_id
❌ No items in order
```

OR a Supabase error with:
```
{
  code: "23502",
  message: "null value in column 'X' violates not-null constraint"
}
```

---

## 📝 Next Steps

If you still get a 400 error:
1. **Copy the FULL error object** from browser console
2. **Check Supabase Dashboard** → Table Editor → `orders` table structure
3. **Verify RLS policies** in Authentication → Policies
4. **Check if restaurant exists** in `restaurants` table

Let me know the specific error details and I'll help fix it! 🚀




