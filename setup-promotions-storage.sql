-- Create storage bucket for promotion images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'promotion-images',
  'promotion-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for promotion images bucket
CREATE POLICY "Public can view promotion images" ON storage.objects
  FOR SELECT USING (bucket_id = 'promotion-images');

CREATE POLICY "Authenticated users can upload promotion images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'promotion-images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can update promotion images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'promotion-images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can delete promotion images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'promotion-images' 
    AND auth.role() = 'authenticated'
  );
