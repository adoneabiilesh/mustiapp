# 🔧 FIX: Restaurant Settings Not Saving

## 🐛 Problem

When you edit restaurant settings (name, phone, address, etc.) and click "Save Changes", the changes don't get saved to the database.

---

## 🎯 Root Cause

The issue is likely one of these:

1. **Database Permissions (RLS Policies)** - Most common cause
2. **Authentication Issue** - User not properly authenticated
3. **Missing Fields** - Database expecting required fields
4. **Connection Issue** - Supabase connection problem

---

## ✅ SOLUTION

### **Step 1: Fix Database Permissions** (Most Important)

**Run this SQL in your Supabase SQL Editor:**

1. Go to: **Supabase Dashboard → SQL Editor**
2. Click "**New Query**"
3. **Copy and paste** this entire SQL script:

```sql
-- FIX RESTAURANT SETTINGS SAVE ISSUE

-- 1. Enable RLS on restaurants table
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies
DROP POLICY IF EXISTS "Allow public read access to active restaurants" ON restaurants;
DROP POLICY IF EXISTS "Allow authenticated users to read restaurants" ON restaurants;
DROP POLICY IF EXISTS "Allow authenticated users to update restaurants" ON restaurants;
DROP POLICY IF EXISTS "Allow authenticated users to insert restaurants" ON restaurants;
DROP POLICY IF EXISTS "Allow service role full access to restaurants" ON restaurants;

-- 3. Create proper policies

-- Public can view active restaurants (for mobile app)
CREATE POLICY "Allow public read access to active restaurants"
ON restaurants
FOR SELECT
USING (is_active = true);

-- Authenticated users can read all restaurants (for admin)
CREATE POLICY "Allow authenticated users to read restaurants"
ON restaurants
FOR SELECT
TO authenticated
USING (true);

-- Authenticated users can UPDATE restaurants (THIS IS KEY!)
CREATE POLICY "Allow authenticated users to update restaurants"
ON restaurants
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Authenticated users can INSERT restaurants
CREATE POLICY "Allow authenticated users to insert restaurants"
ON restaurants
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Service role has full access
CREATE POLICY "Allow service role full access to restaurants"
ON restaurants
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 4. Grant permissions
GRANT ALL ON restaurants TO authenticated;
GRANT ALL ON restaurants TO service_role;
```

4. Click "**Run**" (or press Ctrl+Enter)
5. You should see: **Success. No rows returned**

---

### **Step 2: Verify the Fix**

1. Go back to your **Admin Dashboard**
2. Navigate to: **Restaurants → Settings**
3. Edit any field (e.g., change restaurant name)
4. Click "**Save Changes**"
5. You should see: **"Restaurant settings updated successfully!"**

---

### **Step 3: Check Console for Errors** (If still not working)

1. Open **Browser Developer Tools** (F12)
2. Go to **Console** tab
3. Try saving again
4. Look for error messages:

**Common Errors:**

#### Error: "new row violates row-level security policy"
**Solution**: Run the SQL script above

#### Error: "JWT expired" or "not authenticated"
**Solution**: Sign out and sign back in to admin dashboard

#### Error: "permission denied for table restaurants"
**Solution**: Check if you're signed in with admin account

#### Error: "Cannot read property 'id' of null"
**Solution**: Make sure a restaurant is selected before editing

---

## 🔍 DEBUGGING

### **Check if Update is Working:**

Run this in Supabase SQL Editor:

```sql
-- Check current restaurant data
SELECT id, name, phone, email, updated_at
FROM restaurants
ORDER BY updated_at DESC
LIMIT 5;
```

**After saving in admin dashboard**, run it again. If `updated_at` changed, it's working!

### **Check RLS Policies:**

```sql
-- View all policies on restaurants table
SELECT schemaname, tablename, policyname, roles, cmd
FROM pg_policies
WHERE tablename = 'restaurants'
ORDER BY policyname;
```

You should see 5 policies listed.

### **Test Update Manually:**

```sql
-- Try updating a restaurant manually
UPDATE restaurants
SET name = 'Test Update ' || NOW()
WHERE id = 'your-restaurant-id';

-- Check if it worked
SELECT name, updated_at FROM restaurants WHERE id = 'your-restaurant-id';
```

---

## 🎯 WHAT THE FIX DOES

### **Before (Broken):**
```
User edits restaurant → Clicks Save → Supabase blocks update
❌ RLS Policy: "Permission denied"
```

### **After (Fixed):**
```
User edits restaurant → Clicks Save → Update succeeds ✅
✅ RLS Policy: "Authenticated users can update"
```

---

## 💡 WHY THIS HAPPENS

**Row Level Security (RLS)** is a Supabase feature that controls who can read/write data.

By default, RLS is **very strict** and blocks all operations unless explicitly allowed.

**The Fix:**
- Added policy: `"Allow authenticated users to update restaurants"`
- This lets signed-in admin users update restaurant data
- Mobile app users (not authenticated) can still only READ active restaurants

---

## 🚀 IMPROVED ERROR MESSAGES

I've also improved the admin dashboard to show **better error messages**:

**Before:**
```
❌ "Failed to update restaurant settings"
```

**After:**
```
✅ "Restaurant settings updated successfully!"
OR
❌ "Permission denied. Please check database policies."
OR  
❌ "Authentication error. Please sign in again."
```

Plus, detailed logs in browser console for debugging!

---

## 📋 VERIFICATION CHECKLIST

After running the SQL fix:

- [ ] SQL script ran without errors
- [ ] Can edit restaurant name
- [ ] Can edit phone/email
- [ ] Can edit address
- [ ] Can toggle "Active" switch
- [ ] Can edit delivery settings
- [ ] Success message appears
- [ ] Changes persist after page refresh
- [ ] Mobile app shows updated info

---

## 🔧 ALTERNATIVE SOLUTIONS

### **Option 1: Temporary Full Access** (For Testing)

If you need to test quickly, **temporarily** disable RLS:

```sql
-- WARNING: Only for testing! Makes table fully public
ALTER TABLE restaurants DISABLE ROW LEVEL SECURITY;
```

**Remember to re-enable it after:**
```sql
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
```

### **Option 2: Use Service Role Key** (Admin Dashboard)

In your admin dashboard `.env.local`:

```env
# Use service role key (bypasses RLS)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-service-role-key
```

**Note**: Service role key has full access, so use carefully!

---

## 📁 FILES CREATED

- **`admin-dashboard/FIX_RESTAURANT_SETTINGS.sql`** - SQL fix script
- **`admin-dashboard/app/restaurant-settings/page.tsx`** - Improved with better error handling
- **`RESTAURANT_SETTINGS_FIX.md`** - This guide

---

## 🎉 RESULT

After applying the fix:

**Before:**
- ❌ Settings don't save
- ❌ No error messages
- ❌ Changes lost
- ❌ Frustrating experience

**After:**
- ✅ Settings save instantly
- ✅ Clear success messages
- ✅ Changes persist
- ✅ Detailed error logs
- ✅ Smooth experience

---

## 💬 COMMON QUESTIONS

### Q: Will this affect mobile app security?
**A:** No! Mobile app users still can only READ active restaurants. Only authenticated admin users can UPDATE.

### Q: Do I need to run this for every restaurant?
**A:** No! This fixes the database policies globally. Works for all restaurants.

### Q: What if I have multiple admin users?
**A:** All authenticated users can update. To restrict further, you'd need to add user role checks.

### Q: Can I undo this change?
**A:** Yes! Just drop the policies and create new ones with different rules.

---

## 🆘 STILL NOT WORKING?

### **Check These:**

1. **Are you signed in?**
   - Sign out and sign back in
   - Check if session is valid

2. **Is restaurant selected?**
   - Go to Restaurants page first
   - Click on a restaurant
   - Then go to Settings

3. **Supabase connection?**
   - Check `.env.local` has correct keys
   - Test connection in Supabase dashboard

4. **Browser console errors?**
   - Press F12
   - Look for red errors
   - Share them for more help

---

## 📞 NEED MORE HELP?

1. **Run the SQL script** (Step 1 above)
2. **Check browser console** for errors
3. **Try the verification checklist**
4. **Share any error messages** you see

---

## ✨ QUICK FIX SUMMARY

```bash
# 1. Go to Supabase SQL Editor
# 2. Run the SQL script from FIX_RESTAURANT_SETTINGS.sql
# 3. Refresh admin dashboard
# 4. Try saving settings again
# 5. Should work! ✅
```

**Time to fix: 2 minutes** ⚡

---

**Your restaurant settings should now save properly!** 🎊


