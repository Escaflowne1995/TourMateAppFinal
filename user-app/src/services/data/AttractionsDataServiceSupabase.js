// AttractionsDataServiceSupabase.js - Attractions data with Supabase
import destinationsServiceSimple from '../supabase/destinationsServiceSimple';

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
      const result = await destinationsServiceSimple.getFeaturedDestinations(limit);
      return result.data || [];
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
      const result = await destinationsServiceSimple.getPopularDestinations(limit);
      return result.data || [];
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
      const result = await destinationsServiceSimple.getDestinations();
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
      const result = await destinationsServiceSimple.getDestinations();
      return result.data || [];
    } catch (error) {
      console.error('Error refreshing attractions:', error);
      return [];
    }
  }
}

export default AttractionsDataServiceSupabase;
