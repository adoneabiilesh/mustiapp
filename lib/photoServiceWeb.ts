import { supabase } from './supabase';
import { Alert } from 'react-native';

export interface PhotoUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export class PhotoServiceWeb {
  // Create file input for web
  static createFileInput(): HTMLInputElement {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    return input;
  }

  // Choose photo from file system (web)
  static async chooseFromFileSystem(): Promise<PhotoUploadResult> {
    return new Promise((resolve) => {
      const input = this.createFileInput();
      
      input.onchange = async (event: any) => {
        const file = event.target.files[0];
        if (!file) {
          resolve({ success: false, error: 'No file selected' });
          return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
          resolve({ success: false, error: 'Please select an image file' });
          return;
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          resolve({ success: false, error: 'File size must be less than 5MB' });
          return;
        }

        try {
          const result = await this.uploadPhotoFromFile(file);
          resolve(result);
        } catch (error) {
          console.error('Error uploading photo:', error);
          resolve({ success: false, error: 'Failed to upload photo' });
        }
      };

      input.oncancel = () => {
        resolve({ success: false, error: 'File selection cancelled' });
      };

      document.body.appendChild(input);
      input.click();
      document.body.removeChild(input);
    });
  }

  // Upload photo from file (web)
  static async uploadPhotoFromFile(file: File): Promise<PhotoUploadResult> {
    try {
      // Create a unique filename
      const timestamp = Date.now();
      const filename = `profile-${timestamp}.${file.name.split('.').pop()}`;
      const filePath = `profile-photos/${filename}`;

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, file, {
          contentType: file.type,
          upsert: true,
        });

      if (error) {
        console.error('Error uploading photo:', error);
        return { success: false, error: 'Failed to upload photo' };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath);

      return { success: true, url: urlData.publicUrl };
    } catch (error) {
      console.error('Error uploading photo:', error);
      return { success: false, error: 'Failed to upload photo' };
    }
  }

  // Delete photo from storage
  static async deletePhoto(photoUrl: string): Promise<boolean> {
    try {
      // Extract file path from URL
      const urlParts = photoUrl.split('/');
      const filename = urlParts[urlParts.length - 1];
      const filePath = `profile-photos/${filename}`;

      const { error } = await supabase.storage
        .from('profile-photos')
        .remove([filePath]);

      if (error) {
        console.error('Error deleting photo:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting photo:', error);
      return false;
    }
  }

  // Update user profile photo in database
  static async updateUserProfilePhoto(userId: string, photoUrl: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          profile_photo_url: photoUrl,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error updating profile photo:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating profile photo:', error);
      return false;
    }
  }

  // Remove user profile photo from database
  static async removeUserProfilePhoto(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          profile_photo_url: null,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error removing profile photo:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error removing profile photo:', error);
      return false;
    }
  }
}







