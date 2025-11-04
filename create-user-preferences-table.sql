-- Create user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    phone TEXT,
    address TEXT,
    profile_photo_url TEXT,
    notification_preferences JSONB DEFAULT '{
        "order_updates": true,
        "promotional_offers": true,
        "new_menu_items": true,
        "push_notifications": true,
        "email_notifications": true,
        "sms_notifications": false
    }'::jsonb,
    dietary_restrictions TEXT[] DEFAULT '{}',
    favorite_cuisines TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own preferences" ON public.user_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON public.user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON public.user_preferences
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences" ON public.user_preferences
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_preferences_updated_at 
    BEFORE UPDATE ON public.user_preferences 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing (optional)
-- INSERT INTO public.user_preferences (user_id, name, phone, address, notification_preferences)
-- VALUES (
--     '519eeae2-7720-4c62-8496-3d542a914dfe', -- Replace with actual user ID
--     'John Doe',
--     '+39 123 456 7890',
--     '123 Main St, City, Country',
--     '{
--         "order_updates": true,
--         "promotional_offers": true,
--         "new_menu_items": true,
--         "push_notifications": true,
--         "email_notifications": true,
--         "sms_notifications": false
--     }'::jsonb
-- );
