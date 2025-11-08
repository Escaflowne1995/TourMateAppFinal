import React, { useState, useEffect } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator } from 'react-native';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import AttractionDetails from '../screens/main/AttractionDetails';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import MyReviewsScreen from '../screens/profile/MyReviewsScreen';
import TravelHistoryScreen from '../screens/profile/TravelHistoryScreen';
import FavoriteSpotsScreen from '../screens/profile/FavoriteSpotsScreen';
import LanguageScreen from '../screens/settings/LanguageScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import HelpSupportScreen from '../screens/settings/HelpSupportScreen';
import LocalAuthService from '../services/auth/LocalAuthService';

import { useTheme } from '../contexts/ThemeContext';
import { getThemeColors } from '../utils/theme';

const Stack = createStackNavigator();

function AppNavigatorContent() {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading, true = logged in, false = logged out
  const [userData, setUserData] = useState(null);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const isLoggedIn = await LocalAuthService.isLoggedIn();
      if (isLoggedIn) {
        const currentUser = await LocalAuthService.getCurrentUser();
        setUserData(currentUser);
        setIsAuthenticated(true);
        console.log('AppNavigator: User is authenticated:', currentUser?.email);
      } else {
        setUserData(null);
        setIsAuthenticated(false);
        console.log('AppNavigator: User is not authenticated');
      }
    } catch (error) {
      console.error('AppNavigator: Error checking auth status:', error);
      setUserData(null);
      setIsAuthenticated(false);
    }
  };

  // Function to handle logout - will be passed to child components
  const handleLogout = async () => {
    try {
      await LocalAuthService.signOut();
      setUserData(null);
      setIsAuthenticated(false);
      console.log('AppNavigator: User logged out successfully');
    } catch (error) {
      console.error('AppNavigator: Error during logout:', error);
    }
  };

  // Function to handle login - will be passed to child components
  const handleLogin = (user) => {
    setUserData(user);
    setIsAuthenticated(true);
    console.log('AppNavigator: User logged in successfully:', user?.email);
  };

  // Show loading screen while checking authentication
  if (isAuthenticated === null) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: colors.background 
      }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Common header options that adapt to theme
  const getHeaderOptions = (title) => ({
    headerShown: true,
    title: title,
    headerStyle: {
      backgroundColor: colors.cardBackground,
    },
    headerTintColor: colors.primary,
    headerTitleStyle: {
      color: colors.text,
      fontWeight: '600',
    },
  });

  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        headerStyle: {
          backgroundColor: colors.cardBackground,
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          color: colors.text,
          fontWeight: '600',
        },
      }}
    >
        {isAuthenticated ? (
          <Stack.Screen name="MainApp">
            {(props) => <MainNavigator {...props} route={{ params: { userData, onLogout: handleLogout } }} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Auth">
            {(props) => <AuthNavigator {...props} onLogin={handleLogin} />}
          </Stack.Screen>
        )}
        <Stack.Screen
          name="AttractionDetails"
          component={AttractionDetails}
          options={getHeaderOptions('Details')}
        />
        <Stack.Screen
          name="EditProfile"
          component={EditProfileScreen}
          options={getHeaderOptions('Edit Profile')}
        />
        <Stack.Screen
          name="MyReviews"
          component={MyReviewsScreen}
          options={getHeaderOptions('My Reviews')}
        />
        <Stack.Screen
          name="TravelHistory"
          component={TravelHistoryScreen}
          options={getHeaderOptions('Travel History')}
        />
        <Stack.Screen
          name="FavoriteSpots"
          component={FavoriteSpotsScreen}
          options={getHeaderOptions('My Favorites')}
        />
        <Stack.Screen
          name="Language"
          component={LanguageScreen}
          options={getHeaderOptions('Language')}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={getHeaderOptions('Settings')}
        />

        <Stack.Screen
          name="HelpSupport"
          component={HelpSupportScreen}
          options={getHeaderOptions('Help & Support')}
        />
      </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);

  // Create custom navigation theme based on our app's theme
  const customTheme = {
    ...(isDarkMode ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDarkMode ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.primary,
      background: colors.background,
      card: colors.cardBackground,
      text: colors.text,
      border: colors.border,
      notification: colors.primary,
    },
  };

  return (
    <NavigationContainer theme={customTheme}>
      <AppNavigatorContent />
    </NavigationContainer>
  );
} 