# Addon Sync Guide

## Overview

The mobile app now syncs addons with the database instead of using hardcoded values. This ensures that addons created in the admin dashboard are immediately available in the mobile app.

## How It Works

### 1. Database Structure
- **`addons` table**: Stores all available addons with types (size, addon, spice)
- **`menu_items.available_addons`**: JSONB array of addon IDs assigned to each product

### 2. Mobile App Flow
1. **Load Product**: Fetches product details including `available_addons` field
2. **Fetch Addons**: Gets all addons from database
3. **Filter Addons**: Shows only addons assigned to the specific product
4. **Fallback**: Uses default addons if database is empty or product has no assigned addons

### 3. Admin Dashboard Flow
1. **Create Addons**: Add new addons in the Addons section
2. **Assign to Products**: Edit products and select which addons should be available
3. **Sync**: Changes are immediately reflected in the mobile app

## Features

### ✅ Dynamic Addon Loading
- Fetches addons from database
- Filters by product's `available_addons` field
- Groups by type (size, addon, spice)

### ✅ Conditional Rendering
- Only shows sections that have addons
- Hides empty sections gracefully
- Maintains clean UI

### ✅ Fallback System
- Uses default addons if database is empty
- Graceful error handling
- Always provides working experience

### ✅ Real-time Sync
- Changes in admin dashboard immediately available in mobile app
- No app restart required
- Seamless user experience

## Configuration

### Admin Dashboard
1. **Create Addons**: Go to Addons page and create addons
2. **Assign to Products**: Edit products and select available addons
3. **Test**: Check mobile app to see changes

### Mobile App
- Automatically loads addons when viewing product details
- No configuration needed
- Works out of the box

## Troubleshooting

### No Addons Showing
1. Check if addons exist in database
2. Verify product has `available_addons` assigned
3. Check console logs for errors

### Addons Not Syncing
1. Ensure database migration is complete
2. Check network connectivity
3. Verify Supabase configuration

### Performance Issues
- Addons are cached after first load
- Only fetches when viewing product details
- Minimal database queries

## Benefits

- **Centralized Management**: All addons managed in one place
- **Product-Specific**: Each product can have different addons
- **Real-time Updates**: Changes reflect immediately
- **Scalable**: Easy to add new addons and products
- **Maintainable**: No hardcoded values to update

## Next Steps

1. **Test the Integration**: Create addons in admin dashboard and check mobile app
2. **Assign to Products**: Edit products to assign specific addons
3. **Verify Sync**: Ensure changes appear in mobile app immediately
4. **Monitor Performance**: Check console logs for any issues
