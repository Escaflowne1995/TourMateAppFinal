import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

// Simplified image service without Firebase dependencies
class SimpleImageService {
  
  // Pick image from gallery
  static async pickImage() {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Gallery permission required');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        return {
          success: true,
          uri: result.assets[0].uri,
          width: result.assets[0].width,
          height: result.assets[0].height
        };
      } else {
        return { success: false, canceled: true };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Take photo with camera
  static async takePhoto() {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Camera permission required');
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        return {
          success: true,
          uri: result.assets[0].uri,
          width: result.assets[0].width,
          height: result.assets[0].height
        };
      } else {
        return { success: false, canceled: true };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Compress image
  static async compressImage(uri, quality = 0.7, maxSize = 800) {
    try {
      const compressedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: maxSize, height: maxSize } }],
        {
          compress: quality,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );
      return compressedImage;
    } catch (error) {
      console.error('Compression failed:', error);
      return { uri };
    }
  }

  // Convert to base64 for Firestore storage
  static async convertToBase64(imageUri) {
    try {
      console.log('SimpleImageService: convertToBase64 called with URI:', imageUri);
      const compressedImage = await this.compressImage(imageUri, 0.3, 200);
      console.log('SimpleImageService: Image compressed, URI:', compressedImage.uri);
      
      // Try the FileReader method first
      try {
        const base64 = await this.imageToBase64(compressedImage.uri);
        console.log('SimpleImageService: FileReader method successful');
        return {
          success: true,
          base64: `data:image/jpeg;base64,${base64}`,
          method: 'base64'
        };
      } catch (fileReaderError) {
        console.log('SimpleImageService: FileReader method failed, trying alternative:', fileReaderError.message);
        
        // Fallback: Use the compressed image URI directly
        // This might work for some React Native environments
        return {
          success: true,
          base64: compressedImage.uri, // Use URI directly as fallback
          method: 'uri_fallback'
        };
      }
    } catch (error) {
      console.error('SimpleImageService: convertToBase64 failed:', error);
      return {
        success: false,
        error: error.message,
        method: 'base64'
      };
    }
  }

  // Convert image to base64
  static async imageToBase64(uri) {
    try {
      console.log('SimpleImageService: Converting to base64, URI:', uri);
      
      // For React Native, we need to use a different approach
      // FileReader might not be available in all React Native environments
      const response = await fetch(uri);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        // Check if FileReader is available
        if (typeof FileReader === 'undefined') {
          console.error('SimpleImageService: FileReader not available');
          reject(new Error('FileReader not available in this environment'));
          return;
        }
        
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const base64 = reader.result.split(',')[1];
            console.log('SimpleImageService: Base64 conversion successful, length:', base64?.length);
            resolve(base64);
          } catch (error) {
            console.error('SimpleImageService: Error parsing base64 result:', error);
            reject(error);
          }
        };
        reader.onerror = (error) => {
          console.error('SimpleImageService: FileReader error:', error);
          reject(error);
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('SimpleImageService: Base64 conversion failed:', error);
      throw new Error('Base64 conversion failed: ' + error.message);
    }
  }
}

export default SimpleImageService; 