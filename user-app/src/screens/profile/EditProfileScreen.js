import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import LocalAuthService from '../../services/auth/LocalAuthService';
import { getCurrentUser } from '../../services/supabase/authService';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeColors } from '../../utils/theme';

const EditProfileScreen = ({ navigation, route }) => {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  const styles = getStyles(colors, isDarkMode);
  
  const userData = route.params?.userData || {};
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [profileData, setProfileData] = useState({
    name: userData.fullName || 
          userData.displayName || 
          userData.name || 
          userData.user_metadata?.name ||
          userData.email?.split('@')[0] || // Use email prefix as fallback
          'Guest User',
    email: userData.email || 'guest@example.com',
    phone: userData.phone || '',
    location: userData.location || 'Cebu City, Philippines',
    avatar: userData.avatar || '',
    birthDate: userData.birthDate || '',
    gender: userData.gender || '',
    country: userData.country || '',
    zipCode: userData.zipCode || ''
  });

  // Check if birthdate is already set (to make it non-editable)
  const isBirthDateSet = userData.birthDate && userData.birthDate.trim() !== '';
  const isGenderSet = userData.gender && userData.gender.trim() !== '';

  // Gender options
  const genderOptions = [
    { id: 'male', label: 'Male', icon: '♂️' },
    { id: 'female', label: 'Female', icon: '♀️' },
  ];

  // State for gender dropdown
  const [showGenderPicker, setShowGenderPicker] = useState(false);

  // Load fresh user data when screen mounts
  useEffect(() => {
    const loadFreshUserData = async () => {
      try {
        console.log('EditProfile: Loading fresh user data...');
        
        // Check if we already have profile data from route params
        if (userData && Object.keys(userData).length > 0) {
          console.log('EditProfile: Using route params data:', userData);
          setProfileData({
            name: userData.fullName || userData.name || userData.displayName || 'Guest User',
            email: userData.email || 'guest@example.com',
            phone: userData.phone || '',
            location: userData.location || 'Cebu City, Philippines',
            avatar: userData.avatar || userData.avatar_url || '',
            birthDate: userData.birthDate || userData.birth_date || '',
            gender: userData.gender || '',
            country: userData.country || '',
            zipCode: userData.zipCode || userData.zip_code || ''
          });
          setDataLoaded(true);
          return; // Don't override with fresh data if we have route params
        }
        
        // Only load fresh data if we don't have route params
        console.log('EditProfile: No route params, loading fresh data...');
        
        // Try multiple methods to get user data (even when logged out)
        let freshData = null;
        
        // Method 1: Try current user storage first (most recent data)
        try {
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          const currentUserString = await AsyncStorage.getItem('@tourist_app_current_user');
          if (currentUserString) {
            freshData = JSON.parse(currentUserString);
            console.log('EditProfile: Fresh user data from current user storage:', freshData);
          }
        } catch (error) {
          console.log('EditProfile: Current user storage failed');
        }
        
        // Method 2: Try LocalAuthService
        if (!freshData) {
          try {
            await LocalAuthService.initialize();
            const localUser = await LocalAuthService.getCurrentUser();
            if (localUser) {
              freshData = localUser;
              console.log('EditProfile: Fresh user data from LocalAuth:', freshData);
            }
          } catch (error) {
            console.log('EditProfile: LocalAuthService failed');
          }
        }
        
        // Method 3: Try Supabase (if authenticated)
        if (!freshData) {
          try {
            const supabaseResult = await getCurrentUser();
            if (supabaseResult.success && supabaseResult.data) {
              freshData = supabaseResult.data;
              console.log('EditProfile: Fresh user data from Supabase:', freshData);
            }
          } catch (error) {
            console.log('EditProfile: Supabase failed');
          }
        }
        
        // Method 4: Try to find user in users array by email (fallback)
        if (!freshData && profileData.email && profileData.email !== 'guest@example.com') {
          try {
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            const usersString = await AsyncStorage.getItem('@tourist_app_users');
            if (usersString) {
              const users = JSON.parse(usersString);
              const foundUser = users.find(user => user.email === profileData.email);
              if (foundUser) {
                freshData = foundUser;
                console.log('EditProfile: Found user in users array:', freshData);
              }
            }
          } catch (error) {
            console.log('EditProfile: Users array search failed');
          }
        }
        
        if (freshData) {
          // Debug: Log the fresh data to see what fields are available
          console.log('EditProfile: Fresh data received:', JSON.stringify(freshData, null, 2));
          
          // Update profile data with fresh data
          setProfileData({
            name: freshData.fullName || 
                  freshData.displayName || 
                  freshData.name || 
                  freshData.user_metadata?.name ||
                  freshData.email?.split('@')[0] || // Use email prefix as fallback
                  'Guest User',
            email: freshData.email || 'guest@example.com',
            phone: freshData.phone || '',
            location: freshData.location || 'Cebu City, Philippines',
            avatar: freshData.avatar || '',
            birthDate: freshData.birthDate || '',
            gender: freshData.gender || '',
            country: freshData.country || '',
            zipCode: freshData.zipCode || ''
          });
          setDataLoaded(true);
        } else {
          console.log('EditProfile: No user data found, using default values');
          // Set default values if no data is found
          setProfileData({
            name: 'Guest User',
            email: 'guest@example.com',
            phone: '',
            location: 'Cebu City, Philippines',
            avatar: '',
            birthDate: '',
            gender: '',
            country: 'Philippines',
            zipCode: ''
          });
          setDataLoaded(true);
        }
      } catch (error) {
        console.error('EditProfile: Error loading fresh user data:', error);
      }
    };

    loadFreshUserData();
    
    // Set up navigation focus listener to refresh when returning to screen
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('EditProfile: Screen focused, checking if refresh is needed...');
      // Only refresh if data hasn't been loaded yet
      if (!dataLoaded) {
        console.log('EditProfile: Data not loaded yet, refreshing...');
        loadFreshUserData();
      } else {
        console.log('EditProfile: Data already loaded, skipping refresh');
      }
    });
    
    return unsubscribe;
  }, [navigation, dataLoaded]); // Run when component mounts and when navigation changes

  const handleSave = async () => {
    console.log('=== SIMPLE PROFILE SAVE START ===');
    console.log('Profile data to save:', profileData);
    
    setIsLoading(true);
    
    try {
      // Ultra-simple save approach - just save directly to storage
      console.log('=== ULTRA-SIMPLE SAVE APPROACH ===');
      
      // Import AsyncStorage
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      
      // Prepare the data to save
      const updatedUserData = {
        name: profileData.name,
        fullName: profileData.name,
        displayName: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        location: profileData.location,
        avatar: profileData.avatar,
        avatar_url: profileData.avatar,
        birthDate: profileData.birthDate,
        birth_date: profileData.birthDate,
        gender: profileData.gender,
        country: profileData.country,
        zipCode: profileData.zipCode,
        zip_code: profileData.zipCode,
        updatedAt: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('Saving user data:', updatedUserData);
      
      // Get existing users
      const usersString = await AsyncStorage.getItem('@tourist_app_users');
      const users = usersString ? JSON.parse(usersString) : [];
      
      // Find current user by email
      const userIndex = users.findIndex(user => user.email === profileData.email);
      
      if (userIndex !== -1) {
        // Update existing user
        users[userIndex] = { ...users[userIndex], ...updatedUserData };
        console.log('✅ Updated existing user at index:', userIndex);
      } else {
        // Create new user entry
        const newUser = {
          uid: Date.now().toString(),
          email: profileData.email,
          ...updatedUserData,
          createdAt: new Date().toISOString()
        };
        users.push(newUser);
        console.log('✅ Created new user entry');
      }
      
      // Save users array
      await AsyncStorage.setItem('@tourist_app_users', JSON.stringify(users));
      console.log('✅ Users array saved to storage');
      
      // Always save as current user (even when logged out)
      const currentUser = users.find(user => user.email === profileData.email);
      if (currentUser) {
        await AsyncStorage.setItem('@tourist_app_current_user', JSON.stringify(currentUser));
        console.log('✅ Current user saved to storage');
        
        // Also update LocalAuthService currentUser if it exists
        try {
          const LocalAuthService = require('../../services/auth/LocalAuthService').default;
          LocalAuthService.currentUser = currentUser;
          console.log('✅ LocalAuthService currentUser updated');
        } catch (error) {
          console.log('LocalAuthService not available, skipping update');
        }
      } else {
        console.log('❌ Could not find user to save as current user');
      }
      
      console.log('=== SAVE COMPLETED SUCCESSFULLY ===');
      
      // Verify the data was saved
      const verifyString = await AsyncStorage.getItem('@tourist_app_current_user');
      const verifyData = verifyString ? JSON.parse(verifyString) : null;
      console.log('=== VERIFICATION ===');
      console.log('Saved data verification:', verifyData);
      console.log('=== END VERIFICATION ===');

      console.log('=== SAVE SUCCESS - NAVIGATING BACK ===');
      console.log('Updated profile data:', profileData);
      console.log('User data being passed:', {
        ...userData,
        fullName: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        location: profileData.location,
        avatar: profileData.avatar
      });

      Alert.alert(
        'Profile Updated',
        'Your profile has been successfully updated!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back and trigger a refresh of the profile screen
              navigation.navigate('Profile', { 
                refresh: true,
                refreshProfile: true,
                timestamp: Date.now(), // Add timestamp to force refresh
                userData: {
                  ...userData,
                  fullName: profileData.name,
                  email: profileData.email,
                  phone: profileData.phone,
                  location: profileData.location,
                  avatar: profileData.avatar
                }
              });
            }
          }
        ]
      );
    } catch (error) {
      console.error('Profile save error:', error);
      Alert.alert(
        'Error', 
        `Failed to update profile: ${error.message}. Please try again.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Direct storage save method (fallback)
  const directSaveToStorage = async (userData) => {
    try {
      console.log('=== DIRECT STORAGE SAVE ===');
      
      // Import AsyncStorage
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      
      // Get existing users
      const usersString = await AsyncStorage.getItem('@tourist_app_users');
      const users = usersString ? JSON.parse(usersString) : [];
      
      // Find current user by email
      const userIndex = users.findIndex(user => user.email === userData.email);
      
      if (userIndex !== -1) {
        // Update existing user
        users[userIndex] = { ...users[userIndex], ...userData };
        console.log('Updated existing user at index:', userIndex);
      } else {
        // Create new user entry
        const newUser = {
          uid: Date.now().toString(),
          email: userData.email,
          ...userData,
          createdAt: new Date().toISOString()
        };
        users.push(newUser);
        console.log('Created new user entry');
      }
      
      // Save users array
      await AsyncStorage.setItem('@tourist_app_users', JSON.stringify(users));
      
      // Also save as current user
      const currentUser = users.find(user => user.email === userData.email);
      await AsyncStorage.setItem('@tourist_app_current_user', JSON.stringify(currentUser));
      
      console.log('✅ Direct storage save successful');
      return { success: true };
    } catch (error) {
      console.error('❌ Direct storage save failed:', error);
      return { success: false, error: error.message };
    }
  };

  const convertImageToBase64 = async (uri) => {
    try {
      console.log('EditProfileScreen: Converting image to base64, URI:', uri);
      
      // Import the simple image service
      const SimpleImageService = require('../../services/image/SimpleImageService').default;
      
      // Convert to base64 using our simple service
      console.log('EditProfileScreen: Calling SimpleImageService.convertToBase64...');
      const result = await SimpleImageService.convertToBase64(uri);
      console.log('EditProfileScreen: SimpleImageService result:', result);
      
      if (result.success) {
        console.log('EditProfileScreen: Base64 conversion successful, length:', result.base64?.length);
        return result.base64;
      } else {
        console.error('EditProfileScreen: Base64 conversion failed:', result.error);
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('EditProfileScreen: Base64 conversion error:', error);
      throw new Error(`Image processing failed: ${error.message}`);
    }
  };

  const pickImageFromGallery = async () => {
    try {
      console.log('EditProfileScreen: pickImageFromGallery called');
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('EditProfileScreen: Gallery permission result:', permissionResult);
      
      if (permissionResult.granted === false) {
        console.log('EditProfileScreen: Gallery permission denied');
        Alert.alert('Permission Required', 'Permission to access gallery is required!');
        return;
      }

      console.log('EditProfileScreen: Launching image library...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5, // Reduced quality to avoid size issues
        base64: false,
        exif: false,
      });
      console.log('EditProfileScreen: Image library result:', result);

      if (!result.canceled && result.assets[0]) {
        setIsLoading(true);
        try {
          const base64Avatar = await convertImageToBase64(result.assets[0].uri);
          setProfileData({...profileData, avatar: base64Avatar});
          
          // Save directly to storage (works even when logged out)
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          
          // Get current user data
          const currentUserString = await AsyncStorage.getItem('@tourist_app_current_user');
          if (currentUserString) {
            const currentUser = JSON.parse(currentUserString);
            const updatedUser = {
              ...currentUser,
              avatar: base64Avatar,
              avatar_url: base64Avatar,
              updatedAt: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            // Save updated user
            await AsyncStorage.setItem('@tourist_app_current_user', JSON.stringify(updatedUser));
            
            // Also update in users array
            const usersString = await AsyncStorage.getItem('@tourist_app_users');
            if (usersString) {
              const users = JSON.parse(usersString);
              const userIndex = users.findIndex(user => user.email === currentUser.email);
              if (userIndex !== -1) {
                users[userIndex] = { ...users[userIndex], ...updatedUser };
                await AsyncStorage.setItem('@tourist_app_users', JSON.stringify(users));
              }
            }
          } else {
            // No current user, create a temporary one
            const tempUser = {
              uid: Date.now().toString(),
              email: profileData.email || 'guest@example.com',
              name: profileData.name || 'Guest User',
              avatar: base64Avatar,
              avatar_url: base64Avatar,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            
            await AsyncStorage.setItem('@tourist_app_current_user', JSON.stringify(tempUser));
          }
          
          Alert.alert('Success', 'Profile picture updated!', [
            {
              text: 'OK',
              onPress: () => {
                // Navigate back to Profile screen with refresh flag
                navigation.navigate('Profile', { 
                  refresh: true,
                  refreshProfile: true,
                  timestamp: Date.now(), // Add timestamp to force refresh
                  userData: {
                    ...userData,
                    avatar: base64Avatar
                  }
                });
              }
            }
          ]);
        } catch (error) {
          Alert.alert('Error', 'Failed to process image. Please try again.');
        } finally {
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Error', 'Failed to open gallery.');
    }
  };

  const pickImageFromCamera = async () => {
    try {
      console.log('EditProfileScreen: pickImageFromCamera called');
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      console.log('EditProfileScreen: Camera permission result:', permissionResult);
      
      if (permissionResult.granted === false) {
        console.log('EditProfileScreen: Camera permission denied');
        Alert.alert('Permission Required', 'Permission to access camera is required!');
        return;
      }

      console.log('EditProfileScreen: Launching camera...');
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5, // Reduced quality to avoid size issues
        base64: false,
        exif: false,
      });
      console.log('EditProfileScreen: Camera result:', result);

      if (!result.canceled && result.assets[0]) {
        setIsLoading(true);
        try {
          const base64Avatar = await convertImageToBase64(result.assets[0].uri);
          setProfileData({...profileData, avatar: base64Avatar});
          
          // Save directly to storage (works even when logged out)
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          
          // Get current user data
          const currentUserString = await AsyncStorage.getItem('@tourist_app_current_user');
          if (currentUserString) {
            const currentUser = JSON.parse(currentUserString);
            const updatedUser = {
              ...currentUser,
              avatar: base64Avatar,
              avatar_url: base64Avatar,
              updatedAt: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            // Save updated user
            await AsyncStorage.setItem('@tourist_app_current_user', JSON.stringify(updatedUser));
            
            // Also update in users array
            const usersString = await AsyncStorage.getItem('@tourist_app_users');
            if (usersString) {
              const users = JSON.parse(usersString);
              const userIndex = users.findIndex(user => user.email === currentUser.email);
              if (userIndex !== -1) {
                users[userIndex] = { ...users[userIndex], ...updatedUser };
                await AsyncStorage.setItem('@tourist_app_users', JSON.stringify(users));
              }
            }
          } else {
            // No current user, create a temporary one
            const tempUser = {
              uid: Date.now().toString(),
              email: profileData.email || 'guest@example.com',
              name: profileData.name || 'Guest User',
              avatar: base64Avatar,
              avatar_url: base64Avatar,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            
            await AsyncStorage.setItem('@tourist_app_current_user', JSON.stringify(tempUser));
          }
          
          Alert.alert('Success', 'Profile picture updated!', [
            {
              text: 'OK',
              onPress: () => {
                // Navigate back to Profile screen with refresh flag
                navigation.navigate('Profile', { 
                  refresh: true,
                  refreshProfile: true,
                  timestamp: Date.now(), // Add timestamp to force refresh
                  userData: {
                    ...userData,
                    avatar: base64Avatar
                  }
                });
              }
            }
          ]);
        } catch (error) {
          Alert.alert('Error', 'Failed to process image. Please try again.');
        } finally {
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to open camera.');
    }
  };

  const handleChangeAvatar = () => {
    console.log('EditProfileScreen: handleChangeAvatar called');
    Alert.alert(
      'Change Profile Picture',
      'Choose an option',
      [
        { text: 'Camera', onPress: () => {
          console.log('EditProfileScreen: Camera option selected');
          pickImageFromCamera();
        }},
        { text: 'Gallery', onPress: () => {
          console.log('EditProfileScreen: Gallery option selected');
          pickImageFromGallery();
        }},
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} accessible={true} accessibilityLabel="Edit Profile Screen">
        <View style={styles.profileImageSection}>
          <TouchableOpacity onPress={handleChangeAvatar} style={styles.avatarContainer}>
            {profileData.avatar ? (
              <Image
                source={{ uri: profileData.avatar }}
                style={styles.avatar}
                accessible={true}
                accessibilityRole="image"
                accessibilityLabel={`Current profile picture of ${profileData.name}`}
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons name="person" size={40} color="#ccc" />
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={handleChangeAvatar}>
            <Text style={styles.uploadPhotoText}>Upload Photo</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.formFlat}>
          <Text style={styles.labelFlat}>Name</Text>
          <TextInput
            style={styles.inputFlat}
            value={profileData.name}
            onChangeText={(text) => setProfileData({...profileData, name: text})}
            placeholder="Enter your full name"
          />
          <View style={styles.row2col}>
            <View style={styles.col2}>
              <Text style={styles.labelFlat}>Birth Date</Text>
              <TextInput
                style={[styles.inputFlat, isBirthDateSet && styles.inputDisabled]}
                value={profileData.birthDate || ''}
                onChangeText={isBirthDateSet ? undefined : (text) => setProfileData({...profileData, birthDate: text})}
                placeholder="MM/DD/YYYY"
                editable={!isBirthDateSet}
                selectTextOnFocus={!isBirthDateSet}
              />
              {isBirthDateSet && (
                <Text style={styles.disabledNote}>Birth date cannot be changed</Text>
              )}
            </View>
            <View style={styles.col2}>
              <Text style={styles.labelFlat}>Gender</Text>
              {isGenderSet ? (
                <>
                  <TextInput
                    style={[styles.inputFlat, styles.inputDisabled]}
                    value={profileData.gender || ''}
                    placeholder="Gender"
                    editable={false}
                    selectTextOnFocus={false}
                  />
                  <Text style={styles.disabledNote}>Gender cannot be changed</Text>
                </>
              ) : (
                <TouchableOpacity
                  style={styles.genderSelector}
                  onPress={() => setShowGenderPicker(true)}
                >
                  <Text style={[styles.genderText, !profileData.gender && styles.genderPlaceholder]}>
                    {profileData.gender ? 
                      genderOptions.find(option => option.id === profileData.gender.toLowerCase())?.label || profileData.gender
                      : 'Select Gender'
                    }
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
              )}
            </View>
          </View>
          <Text style={styles.labelFlat}>Email</Text>
          <TextInput
            style={[styles.inputFlat, styles.inputDisabled]}
            value={profileData.email}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            editable={false}
            selectTextOnFocus={false}
          />
          <Text style={styles.disabledNote}>Email cannot be changed</Text>
          <Text style={styles.labelFlat}>Mobile</Text>
          <TextInput
            style={styles.inputFlat}
            value={profileData.phone}
            onChangeText={(text) => setProfileData({...profileData, phone: text})}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
          />
          <View style={styles.row2col}>
            <View style={styles.col2}>
              <Text style={styles.labelFlat}>Country</Text>
              <TextInput
                style={styles.inputFlat}
                value={profileData.country || ''}
                onChangeText={(text) => setProfileData({...profileData, country: text})}
                placeholder="Country"
              />
            </View>
            <View style={styles.col2}>
              <Text style={styles.labelFlat}>Zip Code</Text>
              <TextInput
                style={styles.inputFlat}
                value={profileData.zipCode || ''}
                onChangeText={(text) => setProfileData({...profileData, zipCode: text})}
                placeholder="Zip Code"
                keyboardType="numeric"
              />
            </View>
          </View>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={isLoading}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Save Changes"
            accessibilityHint="Save your profile changes"
            accessibilityState={{ disabled: isLoading }}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
          
        </View>
      </ScrollView>

      {/* Gender Picker Modal */}
      <Modal
        visible={showGenderPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowGenderPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Gender</Text>
              <TouchableOpacity
                onPress={() => setShowGenderPicker(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={genderOptions}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.genderItem,
                    profileData.gender?.toLowerCase() === item.id && styles.selectedGenderItem
                  ]}
                  onPress={() => {
                    setProfileData({...profileData, gender: item.label});
                    setShowGenderPicker(false);
                  }}
                >
                  <Text style={styles.genderItemIcon}>{item.icon}</Text>
                  <Text style={styles.genderItemLabel}>{item.label}</Text>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const getStyles = (colors, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    backgroundColor: 'transparent',
    flex: 1,
  },
  topBarSaveOnly: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 40,
    paddingHorizontal: 18,
    paddingBottom: 10,
    backgroundColor: colors.cardBackground,
  },
  saveButtonTop: {
    padding: 4,
  },
  saveButtonTopText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
  },
  profileImageSection: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: '#eee',
  },
  avatarPlaceholder: {
    backgroundColor: isDarkMode ? '#374151' : '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadPhotoText: {
    color: '#FF6B35',
    fontWeight: '600',
    fontSize: 16,
    marginTop: 10,
  },
  formFlat: {
    paddingHorizontal: 18,
    paddingBottom: 30,
  },
  labelFlat: {
    fontSize: 15,
    color: isDarkMode ? colors.textSecondary : '#888',
    marginBottom: 2,
    marginTop: 18,
    fontWeight: '500',
  },
  inputFlat: {
    fontSize: 18,
    color: isDarkMode ? '#9CA3AF' : '#666',
    fontWeight: '700',
    backgroundColor: isDarkMode ? '#374151' : '#f5f5f5', // Match email field background
    borderWidth: 0,
    borderBottomWidth: 1.5,
    borderColor: isDarkMode ? '#4B5563' : '#ddd',
    borderRadius: 0,
    paddingVertical: 8,
    marginBottom: 2,
  },
  inputDisabled: {
    backgroundColor: isDarkMode ? '#374151' : '#f5f5f5',
    color: isDarkMode ? '#9CA3AF' : '#666',
    borderColor: isDarkMode ? '#4B5563' : '#ddd',
  },
  disabledNote: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 2,
    marginBottom: 8,
  },
  row2col: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  col2: {
    flex: 1,
    marginRight: 10,
  },
  saveButton: {
    padding: 16,
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  // Gender selector styles
  genderSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: isDarkMode ? '#374151' : '#f5f5f5', // Match email field background
    borderBottomWidth: 1.5,
    borderColor: isDarkMode ? '#4B5563' : '#ddd',
    marginBottom: 2,
  },
  genderText: {
    fontSize: 18,
    color: isDarkMode ? '#9CA3AF' : '#666',
    fontWeight: '700',
  },
  genderPlaceholder: {
    color: isDarkMode ? '#6B7280' : '#999',
    fontWeight: '400',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    width: '80%',
    maxHeight: '40%',
    shadowColor: isDarkMode ? '#000' : '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDarkMode ? 0.5 : 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  modalCloseButton: {
    padding: 4,
  },
  genderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedGenderItem: {
    backgroundColor: isDarkMode ? '#1E3A8A' : '#f0f8ff',
  },
  genderItemIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  genderItemLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});

export default EditProfileScreen; 