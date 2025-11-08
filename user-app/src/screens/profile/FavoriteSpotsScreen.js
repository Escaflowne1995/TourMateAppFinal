import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeColors } from '../../utils/theme';
import favoritesService from '../../services/api/favoritesService';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;

const FavoriteSpotsScreen = ({ navigation }) => {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  const styles = getStyles(colors, isDarkMode);

  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load favorites data
  const loadFavorites = useCallback(async () => {
    try {
      console.log('FavoriteSpotsScreen: Loading favorites...');
      await favoritesService.reloadData();
      const favoritesData = await favoritesService.getFavorites();
      console.log(`FavoriteSpotsScreen: Loaded ${favoritesData.length} favorites`);
      
      // Log each favorite item for debugging
      favoritesData.forEach((item, index) => {
        console.log(`FavoriteSpotsScreen: Item ${index}:`, {
          id: item.id,
          name: item.name || item.title,
          image: item.image,
          images: item.images,
          image_url: item.image_url,
          imageType: typeof (item.image || item.images?.[0]),
          hasImageObject: item.image && typeof item.image === 'object',
          hasImageString: item.image && typeof item.image === 'string',
          hasImageUrl: item.image_url && typeof item.image_url === 'string'
        });
      });
      
      setFavorites(favoritesData);
    } catch (error) {
      console.error('FavoriteSpotsScreen: Error loading favorites:', error);
      Alert.alert('Error', 'Failed to load favorites. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadFavorites();
  }, [loadFavorites]);

  // Remove from favorites
  const handleRemoveFavorite = useCallback(async (attractionId, attractionName) => {
    Alert.alert(
      'Remove from Favorites',
      `Are you sure you want to remove "${attractionName}" from your favorites?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await favoritesService.removeFromFavorites(attractionId);
              if (success) {
                // Update local state
                setFavorites(prev => prev.filter(fav => fav.id !== attractionId));
                Alert.alert('Success', 'Removed from favorites');
              } else {
                Alert.alert('Error', 'Failed to remove from favorites');
              }
            } catch (error) {
              console.error('Error removing favorite:', error);
              Alert.alert('Error', 'Failed to remove from favorites');
            }
          },
        },
      ]
    );
  }, []);

  // Navigate to attraction details
  const handleViewDetails = useCallback((attraction) => {
    navigation.navigate('AttractionDetails', { 
      attraction,
      fromFavorites: true 
    });
  }, [navigation]);

  // Load data on mount and when screen focuses
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('FavoriteSpotsScreen: Screen focused, loading favorites...');
      loadFavorites();
    });

    // Initial load
    loadFavorites();

    return unsubscribe;
  }, [navigation, loadFavorites]);

  // Render favorite item
  const renderFavoriteItem = ({ item }) => {
    // Safely get image source
    const getImageSource = () => {
      // Check if item.image is already a proper image source object
      if (item.image && typeof item.image === 'object') {
        return item.image;
      }
      
      // Check if item.image is a string URI
      if (item.image && typeof item.image === 'string' && item.image.trim() !== '') {
        return { uri: item.image };
      }
      
      // Check if item.images array exists and has content
      if (item.images && Array.isArray(item.images) && item.images.length > 0) {
        const firstImage = item.images[0];
        if (typeof firstImage === 'string' && firstImage.trim() !== '') {
          return { uri: firstImage };
        }
        if (typeof firstImage === 'object') {
          return firstImage;
        }
      }
      
      // Check for image_url field (from database)
      if (item.image_url && typeof item.image_url === 'string' && item.image_url.trim() !== '') {
        return { uri: item.image_url };
      }
      
      // Fallback to default image
      return require('../../../assets/images/basilica.jpg');
    };

    return (
      <TouchableOpacity
        style={[styles.favoriteCard, isDarkMode && styles.favoriteCardDark]}
        onPress={() => handleViewDetails(item)}
        activeOpacity={0.8}
      >
        <Image
          source={getImageSource()}
          style={styles.favoriteImage}
          defaultSource={require('../../../assets/images/basilica.jpg')}
        />
      <View style={styles.favoriteContent}>
        <Text style={[styles.favoriteTitle, isDarkMode && styles.favoriteTitleDark]}>
          {item.name || item.title}
        </Text>
        <Text style={[styles.favoriteLocation, isDarkMode && styles.favoriteLocationDark]}>
          {item.location || item.address || 'Cebu, Philippines'}
        </Text>
        <Text style={[styles.favoriteDate, isDarkMode && styles.favoriteDateDark]}>
          Added {new Date(item.dateAdded).toLocaleDateString()}
        </Text>
      </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveFavorite(item.id, item.name || item.title)}
          activeOpacity={0.7}
        >
          <Ionicons name="heart" size={24} color={colors.error} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-outline" size={80} color={colors.textSecondary} />
      <Text style={[styles.emptyTitle, isDarkMode && styles.emptyTitleDark]}>
        No Favorites Yet
      </Text>
      <Text style={[styles.emptySubtitle, isDarkMode && styles.emptySubtitleDark]}>
        Start exploring Cebu and add places to your favorites by tapping the heart icon
      </Text>
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => navigation.navigate('MainApp', { screen: 'Home' })}
        activeOpacity={0.8}
      >
        <Text style={styles.exploreButtonText}>Explore Cebu</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, isDarkMode && styles.loadingTextDark]}>
          Loading your favorites...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderFavoriteItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
};

const getStyles = (colors, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  loadingTextDark: {
    color: colors.textSecondary,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  favoriteCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  favoriteCardDark: {
    backgroundColor: colors.cardBackground,
    shadowColor: 'rgba(0,0,0,0.7)',
  },
  favoriteImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  favoriteContent: {
    padding: 16,
    flex: 1,
  },
  favoriteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  favoriteTitleDark: {
    color: colors.text,
  },
  favoriteLocation: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  favoriteLocationDark: {
    color: colors.textSecondary,
  },
  favoriteDate: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  favoriteDateDark: {
    color: colors.textSecondary,
  },
  removeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyTitleDark: {
    color: colors.text,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptySubtitleDark: {
    color: colors.textSecondary,
  },
  exploreButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FavoriteSpotsScreen;
