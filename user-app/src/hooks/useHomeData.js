// useHomeData.js - Custom hook for home screen data (SRP + DIP)
import { useState, useEffect, useRef } from 'react';
import AttractionsDataServiceSupabase from '../services/data/AttractionsDataServiceSupabase';
import DelicaciesDataServiceSupabase from '../services/data/DelicaciesDataServiceSupabase';

const useHomeData = () => {
  const [featuredAttractions, setFeaturedAttractions] = useState([]);
  const [popularDestinations, setPopularDestinations] = useState([]);
  const [localDelicacies, setLocalDelicacies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);
  const [realtimeUpdateCount, setRealtimeUpdateCount] = useState(0);
  
  // Refs to store unsubscribe functions
  const unsubscribeDestinations = useRef(null);
  const unsubscribeDelicacies = useRef(null);

  useEffect(() => {
    loadHomeData();
    setupRealtimeSubscriptions();
    
    // Cleanup subscriptions on unmount
    return () => {
      if (unsubscribeDestinations.current) {
        unsubscribeDestinations.current();
      }
      if (unsubscribeDelicacies.current) {
        unsubscribeDelicacies.current();
      }
    };
  }, []);

  const setupRealtimeSubscriptions = () => {
    console.log('🔄 Setting up real-time subscriptions...');
    
    // Subscribe to destinations updates
    unsubscribeDestinations.current = AttractionsDataServiceSupabase.subscribeToUpdates((update) => {
      console.log('📡 Destinations real-time update received:', update.eventType);
      handleDestinationsUpdate(update);
    });
    
    // Subscribe to delicacies updates
    unsubscribeDelicacies.current = DelicaciesDataServiceSupabase.subscribeToUpdates((update) => {
      console.log('📡 Delicacies real-time update received:', update.eventType);
      handleDelicaciesUpdate(update);
    });
  };

  const handleDestinationsUpdate = async (update) => {
    console.log('🔄 Refreshing destinations data due to real-time update...');
    try {
      // Refresh destinations data
      const [featured, popular] = await Promise.all([
        AttractionsDataServiceSupabase.getFeaturedAttractions(5),
        AttractionsDataServiceSupabase.getPopularDestinations(10)
      ]);
      
      setFeaturedAttractions(featured);
      setPopularDestinations(popular);
      setLastUpdated(new Date());
      setRealtimeUpdateCount(prev => prev + 1);
      
      console.log('✅ Destinations data refreshed from real-time update');
    } catch (error) {
      console.error('❌ Error refreshing destinations from real-time update:', error);
    }
  };

  const handleDelicaciesUpdate = async (update) => {
    console.log('🔄 Refreshing delicacies data due to real-time update...');
    try {
      // Refresh delicacies data
      const delicacies = await DelicaciesDataServiceSupabase.getFeaturedDelicacies(3);
      setLocalDelicacies(delicacies);
      setLastUpdated(new Date());
      setRealtimeUpdateCount(prev => prev + 1);
      
      console.log('✅ Delicacies data refreshed from real-time update');
    } catch (error) {
      console.error('❌ Error refreshing delicacies from real-time update:', error);
    }
  };

  const loadHomeData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 Loading home data from Supabase...');
      
      // Use Supabase service for data
      const [featured, popular, delicacies] = await Promise.all([
        AttractionsDataServiceSupabase.getFeaturedAttractions(5),
        AttractionsDataServiceSupabase.getPopularDestinations(10),
        DelicaciesDataServiceSupabase.getFeaturedDelicacies(3)
      ]);
      
      setFeaturedAttractions(featured);
      setPopularDestinations(popular);
      setLocalDelicacies(delicacies);
      setLastUpdated(new Date());
      
      console.log(`✅ Home data loaded: ${featured.length} featured, ${popular.length} popular`);
    } catch (error) {
      console.error('Error loading home data:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToAttraction = (navigation, attraction) => {
    navigation.navigate('AttractionDetails', { 
      attraction,
      userData: null 
    });
  };

  const navigateToDelicacy = (navigation, delicacy) => {
    navigation.navigate('AttractionDetails', { 
      attraction: delicacy,
      userData: null 
    });
  };

  const refreshData = async () => {
    console.log('🔄 Manual refresh triggered');
    await loadHomeData();
  };

  const forceRefresh = async () => {
    console.log('🔄 Force refresh triggered (bypassing cache)');
    try {
      setIsLoading(true);
      setError(null);
      
      // Force refresh all data
      DelicaciesDataServiceSupabase.clearCache(); // Clear delicacies cache
      const [featured, popular, delicacies] = await Promise.all([
        AttractionsDataServiceSupabase.refreshAttractions().then(all => 
          all.filter(attr => attr.featured).slice(0, 5)
        ),
        AttractionsDataServiceSupabase.refreshAttractions().then(all => 
          all.slice(0, 10)
        ),
        DelicaciesDataServiceSupabase.getFeaturedDelicacies(3)
      ]);
      
      setFeaturedAttractions(featured);
      setPopularDestinations(popular);
      setLocalDelicacies(delicacies);
      setLastUpdated(new Date());
      
    } catch (error) {
      console.error('Error force refreshing data:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    featuredAttractions,
    popularDestinations,
    localDelicacies,
    isLoading,
    error,
    lastUpdated,
    realtimeUpdateCount,
    navigateToAttraction,
    navigateToDelicacy,
    refreshData,
    forceRefresh
  };
};

export default useHomeData; 