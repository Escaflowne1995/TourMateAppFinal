import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeColors } from '../../utils/theme';
import VisitTrackingService from '../../services/api/visitTrackingService';

const { width } = Dimensions.get('window');

const MyVisitsScreen = ({ navigation }) => {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  const [visits, setVisits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [visitStats, setVisitStats] = useState(null);

  const styles = getStyles(colors, isDarkMode);

  useEffect(() => {
    loadVisits();
    loadVisitStats();
  }, []);

  const loadVisits = async () => {
    try {
      setIsLoading(true);
      const result = await VisitTrackingService.getVisitedAttractions();
      if (result.success) {
        setVisits(result.data);
      } else {
        console.error('Error loading visits:', result.error);
      }
    } catch (error) {
      console.error('Error loading visits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadVisitStats = async () => {
    try {
      const result = await VisitTrackingService.getVisitStats();
      if (result.success) {
        setVisitStats(result.data);
      }
    } catch (error) {
      console.error('Error loading visit stats:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadVisits(), loadVisitStats()]);
    setRefreshing(false);
  };

  const handleVisitPress = (visit) => {
    // Navigate to attraction details
    const attraction = {
      id: visit.entity_id,
      name: visit.destinations?.name || visit.delicacies?.name || 'Unknown',
      location: visit.destinations?.location || visit.delicacies?.location || 'Unknown',
      image: visit.destinations?.image_url 
        ? { uri: visit.destinations.image_url }
        : visit.delicacies?.image_url
        ? { uri: visit.delicacies.image_url }
        : require('../../../assets/images/basilica.jpg'),
      rating: visit.rating || 0,
      coordinates: visit.destinations?.coordinates || visit.delicacies?.coordinates,
      address: visit.destinations?.address || visit.delicacies?.address,
    };

    navigation.navigate('AttractionDetails', { attraction });
  };

  const handleRemoveVisit = async (visitId) => {
    Alert.alert(
      'Remove Visit',
      'Are you sure you want to remove this visit from your history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const result = await VisitTrackingService.deleteVisit(visitId);
            if (result.success) {
              await loadVisits();
              await loadVisitStats();
            } else {
              Alert.alert('Error', 'Failed to remove visit.');
            }
          },
        },
      ]
    );
  };

  const renderVisitItem = ({ item }) => {
    const attraction = item.destinations || item.delicacies;
    const isDelicacy = item.entity_type === 'delicacy';
    
    return (
      <TouchableOpacity
        style={styles.visitCard}
        onPress={() => handleVisitPress(item)}
      >
        <View style={styles.visitImageContainer}>
          <Image
            source={
              attraction?.image_url
                ? { uri: attraction.image_url }
                : require('../../../assets/images/basilica.jpg')
            }
            style={styles.visitImage}
          />
          <View style={styles.visitTypeBadge}>
            <Ionicons
              name={isDelicacy ? 'restaurant' : 'location'}
              size={12}
              color="#fff"
            />
            <Text style={styles.visitTypeText}>
              {isDelicacy ? 'Delicacy' : 'Destination'}
            </Text>
          </View>
          {item.is_verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            </View>
          )}
        </View>

        <View style={styles.visitContent}>
          <Text style={styles.visitName} numberOfLines={2}>
            {attraction?.name || 'Unknown'}
          </Text>
          <Text style={styles.visitLocation} numberOfLines={1}>
            {attraction?.location || 'Unknown location'}
          </Text>
          
          <View style={styles.visitDetails}>
            <View style={styles.visitDateContainer}>
              <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.visitDate}>
                {new Date(item.visit_date).toLocaleDateString()}
              </Text>
            </View>
            
            {item.rating && (
              <View style={styles.visitRatingContainer}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.visitRating}>{item.rating}</Text>
              </View>
            )}
          </View>

          {item.visit_notes && (
            <Text style={styles.visitNotes} numberOfLines={2}>
              "{item.visit_notes}"
            </Text>
          )}

          <View style={styles.visitActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleVisitPress(item)}
            >
              <Ionicons name="eye-outline" size={16} color={colors.primary} />
              <Text style={styles.actionButtonText}>View Details</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.removeButton]}
              onPress={() => handleRemoveVisit(item.id)}
            >
              <Ionicons name="trash-outline" size={16} color="#FF5722" />
              <Text style={[styles.actionButtonText, styles.removeButtonText]}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderStatsHeader = () => {
    if (!visitStats) return null;

    return (
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Your Visit Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{visitStats.total_visits || 0}</Text>
            <Text style={styles.statLabel}>Total Visits</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{visitStats.destinations_visited || 0}</Text>
            <Text style={styles.statLabel}>Destinations</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{visitStats.delicacies_tried || 0}</Text>
            <Text style={styles.statLabel}>Delicacies</Text>
          </View>
        </View>
        {visitStats.last_visit_date && (
          <Text style={styles.lastVisitText}>
            Last visit: {new Date(visitStats.last_visit_date).toLocaleDateString()}
          </Text>
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="location-outline" size={64} color={colors.textSecondary} />
      <Text style={styles.emptyTitle}>No Visits Yet</Text>
      <Text style={styles.emptySubtitle}>
        Start exploring Cebu and mark attractions as visited when you go there!
      </Text>
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Ionicons name="compass-outline" size={20} color="#fff" />
        <Text style={styles.exploreButtonText}>Explore Attractions</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient
      colors={[colors.background, colors.cardBackground]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Visits</Text>
        <Text style={styles.headerSubtitle}>
          Track your journey through Cebu
        </Text>
      </View>

      {renderStatsHeader()}

      <FlatList
        data={visits}
        renderItem={renderVisitItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
      />
    </LinearGradient>
  );
};

const getStyles = (colors, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statsContainer: {
    margin: 20,
    marginTop: 0,
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  lastVisitText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  listContainer: {
    padding: 20,
    paddingTop: 0,
  },
  visitCard: {
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  visitImageContainer: {
    width: 100,
    height: 100,
    position: 'relative',
  },
  visitImage: {
    width: '100%',
    height: '100%',
  },
  visitTypeBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  visitTypeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 3,
  },
  verifiedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    padding: 4,
  },
  visitContent: {
    flex: 1,
    padding: 15,
    justifyContent: 'space-between',
  },
  visitName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  visitLocation: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  visitDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  visitDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  visitDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  visitRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  visitRating: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
    fontWeight: '600',
  },
  visitNotes: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: 10,
  },
  visitActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
  },
  actionButtonText: {
    fontSize: 12,
    color: colors.primary,
    marginLeft: 4,
    fontWeight: '600',
  },
  removeButton: {
    backgroundColor: isDarkMode ? 'rgba(255, 87, 34, 0.1)' : 'rgba(255, 87, 34, 0.05)',
  },
  removeButtonText: {
    color: '#FF5722',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  exploreButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 25,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default MyVisitsScreen;
