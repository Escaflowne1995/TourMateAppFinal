import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import LocalAuthService from '../../services/auth/LocalAuthService';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeColors } from '../../utils/theme';
import favoritesService from '../../services/api/favoritesService';
import reviewsService from '../../services/api/reviewsService';

const ProfileScreen = ({ navigation, route, userData: userDataProp, onLogout }) => {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);

  // Add error boundary for text rendering errors
  React.useEffect(() => {
    const originalConsoleError = console.error;
    console.error = (...args) => {
      if (args[0] && args[0].includes && args[0].includes('Text strings must be rendered within a <Text> component')) {
        console.log('🚨 TEXT ERROR DETECTED:', args);
        console.log('🚨 Current component: ProfileScreen');
        console.log('🚨 Stack trace:', new Error().stack);
      }
      originalConsoleError.apply(console, args);
    };

    return () => {
      console.error = originalConsoleError;
    };
  }, []);
  const styles = getStyles(colors, isDarkMode);
  
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserData, setCurrentUserData] = useState(userDataProp || route.params?.userData || {});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load favorites and reviews counts
  const loadCounts = async () => {
    try {
      console.log('ProfileScreen: Loading counts...');
      
      // Force reload data for current user to ensure fresh data
      await favoritesService.reloadData();
      await reviewsService.reloadData();
      
      const [favCount, revCount] = await Promise.all([
        favoritesService.getFavoritesCount(),
        reviewsService.getReviewsCount()
      ]);
      
      console.log(`ProfileScreen: Loaded counts - Favorites: ${favCount}, Reviews: ${revCount}`);
      
      setFavoritesCount(favCount || 0);
      setReviewsCount(revCount || 0);
    } catch (error) {
      console.error('ProfileScreen: Error loading counts:', error);
      // Set defaults if there's an error
      setFavoritesCount(0);
      setReviewsCount(0);
    }
  };



  // Refresh user data when screen focuses or user changes
  useEffect(() => {
    const refreshUserData = async () => {
      try {
        setIsRefreshing(true);
        // Try multiple methods to get user data
        let currentUser = null;
        
        // Method 1: Try LocalAuthService
        try {
          await LocalAuthService.initialize();
          currentUser = await LocalAuthService.getCurrentUser();
          if (currentUser) {
            console.log('ProfileScreen: Data loaded via LocalAuthService');
          }
        } catch (error) {
          console.log('ProfileScreen: LocalAuthService failed, trying direct storage...');
        }
        
        // Method 2: Direct storage access (fallback)
        if (!currentUser) {
          try {
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            const currentUserString = await AsyncStorage.getItem('@tourist_app_current_user');
            if (currentUserString) {
              currentUser = JSON.parse(currentUserString);
              console.log('ProfileScreen: Data loaded via direct storage');
            }
          } catch (error) {
            console.log('ProfileScreen: Direct storage also failed');
          }
        }
        
        if (currentUser) {
          setCurrentUserData(currentUser);
          setRefreshKey(prev => prev + 1); // Force re-render
          console.log('ProfileScreen: User data refreshed for:', currentUser.email);
          console.log('ProfileScreen: Refreshed user data:', {
            name: currentUser.name,
            fullName: currentUser.fullName,
            email: currentUser.email,
            avatar: currentUser.avatar ? 'Present' : 'Missing',
            phone: currentUser.phone,
            location: currentUser.location
          });
        } else {
          console.log('ProfileScreen: No user data found');
        }
      } catch (error) {
        console.error('ProfileScreen: Failed to refresh user data:', error);
      } finally {
        setIsRefreshing(false);
      }
      
      // Load counts after user data
      await loadCounts();
    };

    // Refresh data when screen loads
    refreshUserData();

    // Set up navigation focus listener to refresh when returning to screen
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('ProfileScreen: Screen focused, refreshing data...');
      refreshUserData();
    });
    
    // Listen for route params changes (e.g., when returning from EditProfile)
    if (route.params?.refresh || route.params?.refreshProfile) {
      console.log('ProfileScreen: Refresh triggered from route params');
      refreshUserData();
    }
    
    return unsubscribe;
  }, [navigation]);

  // Listen for route params changes (e.g., when returning from EditProfile)
  useEffect(() => {
    if (route.params?.refresh || route.params?.refreshProfile) {
      console.log('ProfileScreen: Refresh triggered from route params');
      const refreshUserData = async () => {
        try {
          setIsRefreshing(true);
          
          // Try multiple methods to get user data
          let currentUser = null;
          
          // Method 1: Try LocalAuthService
          try {
            await LocalAuthService.initialize();
            currentUser = await LocalAuthService.getCurrentUser();
            if (currentUser) {
              console.log('ProfileScreen: Route params - Data loaded via LocalAuthService');
            }
          } catch (error) {
            console.log('ProfileScreen: Route params - LocalAuthService failed, trying direct storage...');
          }
          
          // Method 2: Direct storage access (fallback)
          if (!currentUser) {
            try {
              const AsyncStorage = require('@react-native-async-storage/async-storage').default;
              const currentUserString = await AsyncStorage.getItem('@tourist_app_current_user');
              if (currentUserString) {
                currentUser = JSON.parse(currentUserString);
                console.log('ProfileScreen: Route params - Data loaded via direct storage');
              }
            } catch (error) {
              console.log('ProfileScreen: Route params - Direct storage also failed');
            }
          }
          
          if (currentUser) {
            setCurrentUserData(currentUser);
            setRefreshKey(prev => prev + 1); // Force re-render
            console.log('ProfileScreen: Route params refresh - User data refreshed for:', currentUser.email);
            console.log('ProfileScreen: Route params refresh - User data:', {
              name: currentUser.name,
              fullName: currentUser.fullName,
              email: currentUser.email,
              avatar: currentUser.avatar ? 'Present' : 'Missing',
              phone: currentUser.phone,
              location: currentUser.location
            });
          } else {
            console.log('ProfileScreen: Route params - No user data found');
          }
        } catch (error) {
          console.error('ProfileScreen: Failed to refresh user data:', error);
        } finally {
          setIsRefreshing(false);
        }
      };
      refreshUserData();
    }
  }, [route.params?.refresh, route.params?.refreshProfile]);

  const userProfile = {
    name: (currentUserData?.fullName || 
          currentUserData?.displayName || 
          currentUserData?.name || 
          currentUserData?.user_metadata?.name ||
          currentUserData?.email?.split('@')[0] || // Use email prefix as fallback
          'Guest User'),
    email: currentUserData?.email || 'guest@example.com',
    avatar: currentUserData?.avatar || currentUserData?.avatar_url || currentUserData?.picture || '', // Check multiple avatar fields
    reviews: reviewsCount || 0,
    language: 'English',
    currency: 'PHP',
    refreshKey: refreshKey, // Include refresh key to force re-render
  };

  // Debug: Log avatar status for troubleshooting
  console.log('ProfileScreen: Avatar status:', userProfile?.avatar ? 'Present' : 'Missing');
  console.log('ProfileScreen: User profile data:', {
    name: userProfile?.name,
    email: userProfile?.email,
    avatar: userProfile?.avatar ? 'Present' : 'Missing',
    reviews: userProfile?.reviews
  });
  console.log('ProfileScreen: Current user data keys:', Object.keys(currentUserData || {}));

  // Safety check - if currentUserData is undefined, show loading or default state
  if (!currentUserData) {
    return (
      <BaseScreen>
        <View style={styles.container}>
          <Text>Loading profile...</Text>
        </View>
      </BaseScreen>
    );
  }

  const menuItems = [
    {
      id: '1',
      title: 'Edit Profile',
      icon: 'person-outline',
      action: () => navigation.navigate('EditProfile', { 
        userData: currentUserData,
        refreshProfile: true 
      }),
      accessibilityLabel: 'Edit Profile',
      accessibilityHint: 'Opens profile editing screen',
    },
    {
      id: '2',
      title: 'My Favorites',
      icon: 'heart-outline',
      action: () => navigation.navigate('FavoriteSpots'),
      accessibilityLabel: 'My Favorites',
      accessibilityHint: 'View and manage your favorite places',
    },
    {
      id: '3',
      title: 'My Reviews',
      icon: 'star-outline',
      action: () => navigation.navigate('MyReviews'),
      accessibilityLabel: 'My Reviews',
      accessibilityHint: 'View and manage your reviews',
    },
    {
      id: '4',
      title: 'Travel History',
      icon: 'map-outline',
      action: () => navigation.navigate('TravelHistory'),
      accessibilityLabel: 'Travel History',
      accessibilityHint: 'View your travel history and past trips',
    },
    {
      id: '6',
      title: 'Language',
      icon: 'language-outline',
      value: userProfile.language,
      action: () => navigation.navigate('Language'),
      accessibilityLabel: 'Language Settings',
      accessibilityHint: `Currently set to ${userProfile.language}. Tap to change language`,
    },
    {
      id: '8',
      title: 'Settings',
      icon: 'settings-outline',
      action: () => navigation.navigate('Settings'),
      accessibilityLabel: 'Settings',
      accessibilityHint: 'Open app settings and preferences',
    },
  ];

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: async () => {
            console.log('🔄 Starting logout process...');
            setIsLoading(true);
            try {
              // Use the onLogout function passed from AppNavigator
              if (onLogout) {
                await onLogout();
                console.log('✅ Logout completed via AppNavigator');
              } else {
                // Fallback to local logout if onLogout is not available
                console.log('🔄 Calling LocalAuthService.signOut()...');
                await LocalAuthService.signOut();
                console.log('✅ LocalAuthService.signOut() completed');
              }
              
              // Clear loading state
              console.log('🔄 Setting isLoading to false...');
              setIsLoading(false);
              console.log('✅ isLoading set to false');
            } catch (error) {
              console.error('❌ Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
              setIsLoading(false);
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshing={isRefreshing}
        onRefresh={loadCounts}
      >
        {/* Profile Header with Background Image */}
        <View style={styles.headerWrapper}>
          <ImageBackground
            source={require('../../../assets/images/profile-background.jpg')}
            style={styles.headerBg}
            imageStyle={styles.headerBgImage}
          >
            <View style={styles.profileInfo}>
              {userProfile?.avatar && userProfile.avatar.trim() !== '' ? (
                <Image
                  source={{ 
                    uri: userProfile.avatar.startsWith('data:image') 
                      ? userProfile.avatar 
                      : `data:image/jpeg;base64,${userProfile.avatar}`
                  }}
                  style={styles.profilePic}
                  onError={(error) => {
                    console.error('ProfileScreen: Image load error:', error);
                    console.log('ProfileScreen: Failed to load avatar:', userProfile.avatar?.substring(0, 100));
                  }}
                  onLoad={() => {
                    console.log('ProfileScreen: Avatar loaded successfully');
                  }}
                />
              ) : (
                <View style={[styles.profilePic, styles.profilePicPlaceholder]}>
                  <Ionicons name="person" size={60} color="#ffffff" />
                </View>
              )}
              <Text style={styles.profileName}>{userProfile?.name || 'Guest User'}</Text>
              
              
              <View style={styles.statsContainer}>
                <View style={[styles.statCard, isDarkMode && styles.statCardDark]}>
                  <Text style={[styles.statNumber, isDarkMode && styles.statNumberDark]}>{favoritesCount || 0}</Text>
                  <Text style={[styles.statLabel, isDarkMode && styles.statLabelDark]}>Favorites</Text>
                </View>
                <View style={[styles.statCard, isDarkMode && styles.statCardDark]}>
                  <Text style={[styles.statNumber, isDarkMode && styles.statNumberDark]}>{userProfile?.reviews || 0}</Text>
                  <Text style={[styles.statLabel, isDarkMode && styles.statLabelDark]}>Reviews</Text>
                </View>
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* Card Section for Menu Items */}
        <View style={[styles.card, isDarkMode && styles.cardDark]}>
          {menuItems.map((item, idx) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.row,
                isDarkMode && styles.rowDark,
                idx === menuItems.length - 1 && { borderBottomWidth: 0 }
              ]}
              onPress={item.action}
              activeOpacity={0.8}
              accessible={true}
              accessibilityLabel={item.accessibilityLabel}
              accessibilityHint={item.accessibilityHint}
            >
              <Ionicons name={item.icon} size={22} color={isDarkMode ? colors.primary : '#888'} style={styles.rowIcon} />
              <Text style={[styles.rowLabel, isDarkMode && styles.rowLabelDark]}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={20} color={isDarkMode ? colors.primary : '#bbb'} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <Ionicons name="log-out-outline" size={22} color="#FFF" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const getStyles = (colors, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  headerWrapper: {
    marginBottom: 10,
  },
  headerBg: {
    height: 300,
    justifyContent: 'flex-end',
  },
  headerBgImage: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileInfo: {
    alignItems: 'center',
    paddingTop: 40,
  },
  profilePic: {
    width: 150,
    height: 150,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: '#fff',
    marginBottom: 10,
  },
  profilePicPlaceholder: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    marginBottom: 10,
    paddingHorizontal: 30,
  },
  statCard: {
    flex: 1,
    minWidth: 0,
    alignSelf: 'stretch',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  statCardDark: {
    backgroundColor: colors.cardBackground,
    shadowColor: 'rgba(0,0,0,0.7)',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  statNumberDark: {
    color: colors.text,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  statLabelDark: {
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 18,
    marginHorizontal: 18,
    marginTop: 24,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  cardDark: {
    backgroundColor: colors.cardBackground,
    shadowColor: 'rgba(0,0,0,0.7)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rowDark: {
    borderBottomColor: colors.border,
  },
  rowIcon: { marginRight: 16 },
  rowLabel: { flex: 1, fontSize: 16, color: '#222' },
  rowLabelDark: {
    color: colors.text,
  },
  logoutButton: {
    backgroundColor: colors.error,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
    shadowColor: colors.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoutText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});

export default ProfileScreen;