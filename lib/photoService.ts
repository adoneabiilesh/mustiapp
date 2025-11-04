import { supabase } from './supabase';
import { Alert, Platform } from 'react-native';
import { PhotoServiceWeb } from './photoServiceWeb';

// Conditional import for expo-image-picker (only on mobile)
let ImagePicker: any = null;
if (Platform.OS !== 'web') {
  try {
    ImagePicker = require('expo-image-picker');
  } catch (error) {
    console.warn('expo-image-picker not available:', error);
  }
}

export interface PhotoUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export class PhotoService {
  // Request camera permissions
  static async requestCameraPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') {
      Alert.alert(
        'Camera Not Available',
        'Camera functionality is not available on web. Please use a mobile device to take photos.',
        [{ text: 'OK' }]
      );
      return false;
    }

    if (!ImagePicker) {
      Alert.alert(
        'Camera Not Available',
        'Camera functionality is not available on this platform.',
        [{ text: 'OK' }]
      );
      return false;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Camera Permission Required',
        'Please grant camera permission to take photos for your profile.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  }

  // Request media library permissions
  static async requestMediaLibraryPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') {
      Alert.alert(
        'Photo Library Not Available',
        'Photo library functionality is not available on web. Please use a mobile device to select photos.',
        [{ text: 'OK' }]
      );
      return false;
    }

    if (!ImagePicker) {
      Alert.alert(
        'Photo Library Not Available',
        'Photo library functionality is not available on this platform.',
        [{ text: 'OK' }]
      );
      return false;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Photo Library Permission Required',
        'Please grant photo library permission to select photos for your profile.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  }

  // Take photo with camera
  static async takePhoto(): Promise<PhotoUploadResult> {
    try {
      if (Platform.OS === 'web') {
        return { success: false, error: 'Camera not available on web platform' };
      }

      if (!ImagePicker) {
        return { success: false, error: 'Image picker not available' };
      }

      const hasPermission = await this.requestCameraPermissions();
      if (!hasPermission) {
        return { success: false, error: 'Camera permission denied' };
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) {
        return { success: false, error: 'Photo capture cancelled' };
      }

      const photoUri = result.assets[0].uri;
      return await this.uploadPhoto(photoUri);
    } catch (error) {
      console.error('Error taking photo:', error);
      return { success: false, error: 'Failed to take photo' };
    }
  }

  // Choose photo from library
  static async chooseFromLibrary(): Promise<PhotoUploadResult> {
    try {
      if (Platform.OS === 'web') {
        return await PhotoServiceWeb.chooseFromFileSystem();
      }

      if (!ImagePicker) {
        return { success: false, error: 'Image picker not available' };
      }

      const hasPermission = await this.requestMediaLibraryPermissions();
      if (!hasPermission) {
        return { success: false, error: 'Photo library permission denied' };
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) {
        return { success: false, error: 'Photo selection cancelled' };
      }

      const photoUri = result.assets[0].uri;
      return await this.uploadPhoto(photoUri);
    } catch (error) {
      console.error('Error choosing photo:', error);
      return { success: false, error: 'Failed to choose photo' };
    }
  }

  // Upload photo to Supabase storage
  static async uploadPhoto(photoUri: string, userId?: string): Promise<PhotoUploadResult> {
    try {
      // Create a unique filename
      const timestamp = Date.now();
      const filename = `profile-${timestamp}.jpg`;
      const filePath = `profile-photos/${filename}`;

      // Convert URI to blob
      const response = await fetch(photoUri);
      const blob = await response.blob();

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, blob, {
          contentType: 'image/jpeg',
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
    if (Platform.OS === 'web') {
      return await PhotoServiceWeb.deletePhoto(photoUrl);
    }

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
    if (Platform.OS === 'web') {
      return await PhotoServiceWeb.updateUserProfilePhoto(userId, photoUrl);
    }

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
    if (Platform.OS === 'web') {
      return await PhotoServiceWeb.removeUserProfilePhoto(userId);
    }

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
