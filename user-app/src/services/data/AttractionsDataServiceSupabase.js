// AttractionsDataServiceSupabase.js - Attractions data with Supabase
import DestinationsDataServiceSupabase from './DestinationsDataServiceSupabase';

/**
 * Modern AttractionsDataService that uses Supabase for data
 * Replaces the static data approach with dynamic database-driven content
 */
class AttractionsDataServiceSupabase {
  
  /**
   * Get featured attractions from Supabase
   * @param {number} limit - Maximum number of attractions to return
   * @returns {Promise<Array>} Array of featured attractions
   */
  static async getFeaturedAttractions(limit = 10) {
    try {
      const result = await DestinationsDataServiceSupabase.getFeaturedDestinations(limit);
      return result || [];
    } catch (error) {
      console.error('Error fetching featured attractions:', error);
      return [];
    }
  }

  /**
   * Get popular destinations from Supabase
   * @param {number} limit - Maximum number of destinations to return
   * @returns {Promise<Array>} Array of popular destinations
   */
  static async getPopularDestinations(limit = 20) {
    try {
      const result = await DestinationsDataServiceSupabase.getPopularDestinations(limit);
      return result || [];
    } catch (error) {
      console.error('Error fetching popular destinations:', error);
      return [];
    }
  }

  /**
   * Get all active attractions/destinations
   * @returns {Promise<Array>} Array of all active attractions
   */
  static async getAllAttractions() {
    try {
      const result = await DestinationsDataServiceSupabase.getDestinations();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching all attractions:', error);
      return [];
    }
  }

  /**
   * Force refresh of attractions data
   * @returns {Promise<Array>} Fresh attractions data
   */
  static async refreshAttractions() {
    try {
      const result = await DestinationsDataServiceSupabase.getDestinations(false); // Force refresh
      return result.data || [];
    } catch (error) {
      console.error('Error refreshing attractions:', error);
      return [];
    }
  }

  /**
   * Subscribe to real-time updates for attractions/destinations
   * @param {Function} callback - Function to call when data changes
   * @returns {Function} Unsubscribe function
   */
  static subscribeToUpdates(callback) {
    return DestinationsDataServiceSupabase.subscribeToUpdates(callback);
  }

  /**
   * Clear cache to force refresh
   */
  static clearCache() {
    DestinationsDataServiceSupabase.clearCache();
  }
}

export default AttractionsDataServiceSupabase;
