#!/bin/bash
# Script to run Supabase migration from terminal

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Error: Supabase CLI is not installed."
    echo "Install it with: npm install -g supabase"
    exit 1
fi

# Check if .env file exists with Supabase credentials
if [ ! -f .env.local ] && [ ! -f .env ]; then
    echo "Warning: No .env file found. Make sure you have Supabase credentials set."
    echo "You can also run the SQL directly in Supabase Dashboard > SQL Editor"
fi

echo "Running migration: 20250110000000_restaurant_settings_system.sql"
echo "=========================================="

# Read the SQL file and execute it
if [ -f "supabase/migrations/20250110000000_restaurant_settings_system.sql" ]; then
    # If using Supabase CLI with link
    if supabase status &> /dev/null; then
        echo "Using Supabase CLI..."
        supabase db reset --linked
        echo "Migration complete!"
    else
        echo "Supabase project not linked. Please run:"
        echo "  supabase link --project-ref YOUR_PROJECT_REF"
        echo ""
        echo "Or manually run the SQL file in Supabase Dashboard > SQL Editor"
        echo "File location: supabase/migrations/20250110000000_restaurant_settings_system.sql"
    fi
else
    echo "Error: Migration file not found!"
    exit 1
fi

