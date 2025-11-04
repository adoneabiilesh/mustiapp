// Supabase Storage functions for image upload

import { supabase } from './supabase';

const PRODUCT_IMAGES_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_PRODUCT_BUCKET || 'product-images';
const PROMOTION_IMAGES_BUCKET = 'promotion-images';

// Upload an image file to Supabase Storage and return its public URL
export async function uploadProductImage(file: File, opts?: { folder?: string }): Promise<string> {
  const folder = opts?.folder ?? 'products';
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
  const filePath = `${folder}/${fileName}`;

  // Use appropriate bucket based on folder
  const bucket = folder === 'promotions' ? PROMOTION_IMAGES_BUCKET : PRODUCT_IMAGES_BUCKET;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
  if (!publicUrlData?.publicUrl) {
    throw new Error('Failed to obtain public URL for uploaded image');
  }

  return publicUrlData.publicUrl;
}

// Delete an existing image by its public URL (best-effort)
export async function deleteProductImageByPublicUrl(publicUrl: string): Promise<void> {
  try {
    const url = new URL(publicUrl);
    // Expected format: /storage/v1/object/public/<bucket>/<path>
    const parts = url.pathname.split('/').filter(Boolean);
    const bucket = parts[parts.indexOf('public') + 1];
    const pathStart = parts.indexOf(bucket) + 1;
    const filePath = parts.slice(pathStart).join('/');

    if (!bucket || !filePath) return;

    await supabase.storage.from(bucket).remove([filePath]);
  } catch {
    // ignore
  }
}

/**
 * Update product image (delete old, upload new)
 */
export async function updateProductImage(
  oldImageUrl: string | null,
  newFile: File,
  productId?: string
): Promise<string> {
  // Delete old image if exists
  if (oldImageUrl) {
    await deleteProductImageByPublicUrl(oldImageUrl);
  }

  // Upload new image
  return await uploadProductImage(newFile, { folder: 'products' });
}

/**
 * Check if storage bucket exists, if not create it
 */
export async function ensureBucketExists(): Promise<void> {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    
    const bucketExists = buckets?.some(b => b.name === 'product-images');
    
    if (!bucketExists) {
      const { error } = await supabase.storage.createBucket('product-images', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
      });

      if (error) throw error;
      console.log('✅ Product images bucket created');
    }
  } catch (error: any) {
    console.error('Bucket setup error:', error);
    // Don't throw - bucket might already exist
  }
}


