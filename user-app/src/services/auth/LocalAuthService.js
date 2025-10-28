import AsyncStorage from '@react-native-async-storage/async-storage';

const USERS_STORAGE_KEY = '@tourist_app_users';
const CURRENT_USER_STORAGE_KEY = '@tourist_app_current_user';

// Local authentication service without Firebase
class LocalAuthService {
  static currentUser = null;

  // Initialize the service by loading current user
  static async initialize() {
    try {
      const currentUserString = await AsyncStorage.getItem(CURRENT_USER_STORAGE_KEY);
      if (currentUserString) {
        this.currentUser = JSON.parse(currentUserString);
        
        // Migrate current user to have proper name fields
        if (!this.currentUser.fullName && !this.currentUser.name) {
          this.currentUser.fullName = this.currentUser.displayName || this.currentUser.email?.split('@')[0] || 'User';
          this.currentUser.name = this.currentUser.displayName || this.currentUser.email?.split('@')[0] || 'User';
          
          // Save the migrated current user
          await AsyncStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(this.currentUser));
          console.log('LocalAuthService: Migrated current user with proper name fields');
        }
        
        console.log('LocalAuthService: Current user loaded:', this.currentUser.email);
      }
    } catch (error) {
      console.error('LocalAuthService: Error initializing:', error);
    }
  }

  // Get all registered users
  static async getUsers() {
    try {
      const usersString = await AsyncStorage.getItem(USERS_STORAGE_KEY);
      const users = usersString ? JSON.parse(usersString) : [];
      
      // Migrate existing users to have proper name fields
      const migratedUsers = users.map(user => {
        if (!user.fullName && !user.name) {
          return {
            ...user,
            fullName: user.displayName || user.email?.split('@')[0] || 'User',
            name: user.displayName || user.email?.split('@')[0] || 'User'
          };
        }
        return user;
      });
      
      // Save migrated users if any changes were made
      if (JSON.stringify(users) !== JSON.stringify(migratedUsers)) {
        await this.saveUsers(migratedUsers);
        console.log('LocalAuthService: Migrated users with proper name fields');
      }
      
      return migratedUsers;
    } catch (error) {
      console.error('LocalAuthService: Error getting users:', error);
      return [];
    }
  }

  // Save users to storage
  static async saveUsers(users) {
    try {
      console.log('LocalAuthService: Saving users to storage, count:', users.length);
      await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      console.log('LocalAuthService: Users saved to storage successfully');
    } catch (error) {
      console.error('LocalAuthService: Error saving users:', error);
    }
  }

  // Generate a simple user ID
  static generateUserId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // Create a new account
  static async createAccount(email, password) {
    try {
      const users = await this.getUsers();
      
      // Check if user already exists
      const existingUser = users.find(user => user.email.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        return {
          success: false,
          user: null,
          error: { code: 'auth/email-already-in-use', message: 'Email already in use' }
        };
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return {
          success: false,
          user: null,
          error: { code: 'auth/invalid-email', message: 'Invalid email format' }
        };
      }

      // Validate password length
      if (password.length < 6) {
        return {
          success: false,
          user: null,
          error: { code: 'auth/weak-password', message: 'Password should be at least 6 characters' }
        };
      }

      // Create new user
      const newUser = {
        uid: this.generateUserId(),
        email: email.toLowerCase(),
        password: password, // In a real app, this should be hashed
        createdAt: new Date().toISOString(),
        displayName: email.split('@')[0],
        fullName: email.split('@')[0], // Add fullName for compatibility
        name: email.split('@')[0], // Add name for compatibility
      };

      users.push(newUser);
      await this.saveUsers(users);

      // Set as current user
      this.currentUser = { ...newUser };
      delete this.currentUser.password; // Don't keep password in memory
      await AsyncStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(this.currentUser));

      // Reset services state for new user
      this.resetUserServices();

      console.log('LocalAuthService: Account created successfully for:', email);
      return {
        success: true,
        user: this.currentUser,
        error: null
      };
    } catch (error) {
      console.error('LocalAuthService: Account creation failed:', error);
      return {
        success: false,
        user: null,
        error: { code: 'auth/unknown', message: 'Account creation failed' }
      };
    }
  }

  // Login with email and password
  static async login(email, password) {
    try {
      const users = await this.getUsers();
      
      // Find user by email
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        return {
          success: false,
          user: null,
          error: { code: 'auth/user-not-found', message: 'Account not found' }
        };
      }

      // Check password
      if (user.password !== password) {
        return {
          success: false,
          user: null,
          error: { code: 'auth/wrong-password', message: 'Invalid password' }
        };
      }

      // Set as current user
      this.currentUser = { ...user };
      delete this.currentUser.password; // Don't keep password in memory
      await AsyncStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(this.currentUser));

      // Reset services state for new user
      this.resetUserServices();

      console.log('LocalAuthService: Login successful for:', email);
      return {
        success: true,
        user: this.currentUser,
        error: null
      };
    } catch (error) {
      console.error('LocalAuthService: Login failed:', error);
      return {
        success: false,
        user: null,
        error: { code: 'auth/unknown', message: 'Login failed' }
      };
    }
  }

  // Reset password (simulated - in real app would send email)
  static async resetPassword(email) {
    try {
      const users = await this.getUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!user) {
        return {
          success: false,
          error: { code: 'auth/user-not-found', message: 'Account not found' }
        };
      }

      // In a real app, this would send an email
      console.log('LocalAuthService: Password reset would be sent to:', email);
      return {
        success: true,
        error: null
      };
    } catch (error) {
      console.error('LocalAuthService: Password reset failed:', error);
      return {
        success: false,
        error: { code: 'auth/unknown', message: 'Password reset failed' }
      };
    }
  }

  // Get current user
  static async getCurrentUser() {
    // Ensure current user is loaded
    if (!this.currentUser) {
      await this.initialize();
    }
    return this.currentUser;
  }

  // Ensure user is authenticated
  static async ensureAuthenticated() {
    const currentUser = await this.getCurrentUser();
    if (!currentUser) {
      console.error('LocalAuthService: User not authenticated - currentUser is null');
      throw new Error('User not authenticated');
    }
    console.log('LocalAuthService: User authenticated successfully:', currentUser.email);
    return currentUser;
  }

  // Check if user is logged in
  static async isLoggedIn() {
    try {
      const currentUser = await this.getCurrentUser();
      const isLoggedIn = !!currentUser;
      console.log('LocalAuthService: isLoggedIn check:', isLoggedIn, currentUser?.email);
      return isLoggedIn;
    } catch (error) {
      console.error('LocalAuthService: Error checking login status:', error);
      return false;
    }
  }

  // Force refresh current user from storage
  static async refreshCurrentUser() {
    try {
      console.log('LocalAuthService: Refreshing current user from storage...');
      const currentUserString = await AsyncStorage.getItem(CURRENT_USER_STORAGE_KEY);
      if (currentUserString) {
        this.currentUser = JSON.parse(currentUserString);
        console.log('LocalAuthService: Current user refreshed:', this.currentUser?.email);
        return this.currentUser;
      } else {
        console.log('LocalAuthService: No current user found in storage');
        this.currentUser = null;
        return null;
      }
    } catch (error) {
      console.error('LocalAuthService: Error refreshing current user:', error);
      this.currentUser = null;
      return null;
    }
  }

  // Debug method to check storage contents
  static async debugStorage() {
    try {
      const currentUserString = await AsyncStorage.getItem(CURRENT_USER_STORAGE_KEY);
      const usersString = await AsyncStorage.getItem(USERS_STORAGE_KEY);
      
      console.log('=== STORAGE DEBUG ===');
      console.log('Current user in storage:', currentUserString ? JSON.parse(currentUserString) : 'None');
      console.log('Users in storage:', usersString ? JSON.parse(usersString) : 'None');
      console.log('Current user in memory:', this.currentUser);
      console.log('=== END STORAGE DEBUG ===');
    } catch (error) {
      console.error('LocalAuthService: Error debugging storage:', error);
    }
  }

  // Sign out
  static async signOut() {
    try {
      // Reset services state before logout
      this.resetUserServices();
      
      this.currentUser = null;
      await AsyncStorage.removeItem(CURRENT_USER_STORAGE_KEY);
      console.log('LocalAuthService: Sign out successful');
      return { success: true };
    } catch (error) {
      console.error('LocalAuthService: Sign out failed:', error);
      return { success: false, error };
    }
  }

  // Check if user is signed in
  static isSignedIn() {
    return this.currentUser !== null;
  }

  // Get error message for display
  static getErrorMessage(errorCode) {
    const errorMessages = {
      'auth/user-not-found': 'Account not found',
      'auth/invalid-credential': 'Invalid credentials. Try resetting your password or creating a new account.',
      'auth/wrong-password': 'Invalid password',
      'auth/email-already-in-use': 'Email already in use',
      'auth/invalid-email': 'Invalid email format',
      'auth/weak-password': 'Password should be at least 6 characters',
      'auth/too-many-requests': 'Too many attempts. Please try again later.',
      'default': 'Authentication failed. Please try again.'
    };
    return errorMessages[errorCode] || errorMessages.default;
  }

  // Reset user services state (prevents data leakage between users)
  static resetUserServices() {
    try {
      console.log('LocalAuthService: Resetting user services state');
      
      // Import services and reset their state
      const favoritesService = require('../api/favoritesService').default;
      const reviewsService = require('../api/reviewsService').default;
      
      favoritesService.resetState();
      reviewsService.resetState();
      
      console.log('LocalAuthService: User services state reset complete');
    } catch (error) {
      console.error('LocalAuthService: Error resetting services:', error);
    }
  }

    // Update user profile
    static async updateUserProfile(profileData) {
      try {
        console.log('LocalAuthService: Updating user profile');
        
        // Ensure user is authenticated
        const currentUser = await this.ensureAuthenticated();
        console.log('LocalAuthService: User authenticated:', currentUser.email);

      // Ensure email is never null - use current user's email if not provided
      const safeProfileData = {
        ...profileData,
        email: profileData.email || currentUser.email || 'user@example.com'
      };

      // Validate required fields
      if (!safeProfileData.email) {
        return {
          success: false,
          error: { code: 'auth/invalid-email', message: 'Email is required' }
        };
      }

      const users = await this.getUsers();
      const userIndex = users.findIndex(user => user.uid === currentUser.uid);
      
      if (userIndex === -1) {
        console.error('LocalAuthService: User not found in users array');
        console.log('LocalAuthService: Available users:', users.map(u => ({ uid: u.uid, email: u.email })));
        
        // Try to create the user if they don't exist
        const newUser = {
          uid: currentUser.uid,
          email: currentUser.email || safeProfileData.email,
          name: currentUser.name || safeProfileData.name || 'User',
          fullName: currentUser.fullName || safeProfileData.fullName || safeProfileData.name || 'User',
          displayName: currentUser.displayName || safeProfileData.name || 'User',
          avatar: safeProfileData.avatar || '',
          phone: safeProfileData.phone || '',
          location: safeProfileData.location || '',
          country: safeProfileData.country || 'Philippines',
          zip_code: safeProfileData.zip_code || '',
          birth_date: safeProfileData.birth_date || null,
          gender: safeProfileData.gender || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        users.push(newUser);
        await this.saveUsers(users);
        
        // Update current user with the new data
        this.currentUser = { ...currentUser, ...safeProfileData };
        await AsyncStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(this.currentUser));
        
        return {
          success: true,
          user: this.currentUser,
          error: null
        };
      }

      // Update user data in local storage
      // Ensure name consistency across all name fields
      const updatedData = {
        ...users[userIndex],
        ...safeProfileData,
        updatedAt: new Date().toISOString()
      };

      // If name is being updated, update all name-related fields
      if (safeProfileData.name || safeProfileData.fullName) {
        const nameValue = safeProfileData.name || safeProfileData.fullName;
        updatedData.name = nameValue;
        updatedData.fullName = nameValue;
        updatedData.displayName = nameValue;
      }

      // If avatar is being updated, ensure it's properly set
      if (safeProfileData.avatar) {
        updatedData.avatar = safeProfileData.avatar;
        updatedData.avatar_url = safeProfileData.avatar; // Also set avatar_url for compatibility
      }

      users[userIndex] = updatedData;
      console.log('LocalAuthService: Updated user data in array:', updatedData);

      await this.saveUsers(users);
      console.log('LocalAuthService: Users array saved to storage');

      // Update current user
      this.currentUser = { ...this.currentUser, ...safeProfileData };
      console.log('LocalAuthService: Updated currentUser:', this.currentUser);
      
      // Ensure name consistency in current user as well
      if (safeProfileData.name || safeProfileData.fullName) {
        const nameValue = safeProfileData.name || safeProfileData.fullName;
        this.currentUser.name = nameValue;
        this.currentUser.fullName = nameValue;
        this.currentUser.displayName = nameValue;
      }

      // Ensure avatar consistency in current user as well
      if (safeProfileData.avatar) {
        this.currentUser.avatar = safeProfileData.avatar;
        this.currentUser.avatar_url = safeProfileData.avatar; // Also set avatar_url for compatibility
      }
      
      console.log('LocalAuthService: Saving currentUser to storage:', this.currentUser);
      await AsyncStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(this.currentUser));
      console.log('LocalAuthService: CurrentUser saved to storage successfully');

      // Try to sync with Supabase (but don't fail if it doesn't work)
      try {
        const { supabase } = require('../supabase/supabaseClient');
        
        const { error: supabaseError } = await supabase
          .from('users')
          .upsert({
            auth_user_id: this.currentUser.uid,
            email: safeProfileData.email,
            name: safeProfileData.name || safeProfileData.full_name || this.currentUser.displayName,
            full_name: safeProfileData.full_name || safeProfileData.name || this.currentUser.displayName,
            phone: safeProfileData.phone || '',
            location: safeProfileData.location || '',
            country: safeProfileData.country || 'Philippines',
            zip_code: safeProfileData.zip_code || '',
            birth_date: safeProfileData.birth_date || null,
            gender: safeProfileData.gender || '',
            avatar_url: safeProfileData.avatar_url || '',
            status: 'ACTIVE',
            is_active: true,
            favorite_spots: safeProfileData.favorite_spots || [],
            total_reviews: safeProfileData.total_reviews || 0,
            updated_at: new Date().toISOString()
          }, { onConflict: 'auth_user_id' });

        if (supabaseError) {
          console.warn('Supabase sync failed (non-critical):', supabaseError.message);
        } else {
          console.log('Profile synced to Supabase successfully');
        }
      } catch (supabaseError) {
        console.warn('Supabase sync failed (non-critical):', supabaseError.message);
      }

      console.log('LocalAuthService: Profile updated successfully');
      return {
        success: true,
        user: this.currentUser,
        error: null
      };
    } catch (error) {
      console.error('LocalAuthService: Profile update failed:', error);
      return {
        success: false,
        user: null,
        error: { code: 'auth/unknown', message: 'Profile update failed' }
      };
    }
  }

  // Clear all user data (for testing)
  static async clearAllData() {
    try {
      await AsyncStorage.removeItem(USERS_STORAGE_KEY);
      await AsyncStorage.removeItem(CURRENT_USER_STORAGE_KEY);
      this.currentUser = null;
      this.resetUserServices();
      console.log('LocalAuthService: All data cleared');
    } catch (error) {
      console.error('LocalAuthService: Error clearing data:', error);
    }
  }
}

// Initialize the service
LocalAuthService.initialize();

export default LocalAuthService;
