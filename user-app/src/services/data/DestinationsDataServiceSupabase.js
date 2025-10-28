// DestinationsDataServiceSupabase.js - Supabase-based destinations data service with real-time updates
import { supabase } from '../supabase/supabaseClient';

class DestinationsDataServiceSupabase {
  constructor() {
    this.destinationsCache = [];
    this.lastFetch = null;
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.subscription = null;
    this.listeners = new Set();
  }

  /**
   * Check if cache is still valid
   */
  isCacheValid() {
    return this.lastFetch && (Date.now() - this.lastFetch) < this.cacheTimeout;
  }

  /**
   * Get all active destinations from Supabase
   * @param {boolean} useCache - Whether to use cached data if available
   * @returns {Promise<Array>} Array of destination objects
   */
  async getDestinations(useCache = true) {
    try {
      // Use cache if it's still valid
      if (useCache && this.isCacheValid()) {
        console.log('📄 Using cached destinations data');
        return { success: true, data: this.destinationsCache };
      }

      console.log('🔄 Fetching destinations from Supabase...');
      
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .eq('is_active', true)
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching destinations:', error);
        throw new Error(error.message);
      }

      // Format destinations for mobile app compatibility
      const formattedDestinations = data.map(destination => this.formatDestinationForMobile(destination));
      
      // Update cache
      this.destinationsCache = formattedDestinations;
      this.lastFetch = Date.now();

      console.log(`✅ Loaded ${formattedDestinations.length} destinations from Supabase`);
      return { success: true, data: formattedDestinations };

    } catch (error) {
      console.error('❌ Failed to fetch destinations:', error);
      // Return cached data if available, otherwise empty array
      return { 
        success: false, 
        error: error.message,
        data: this.destinationsCache || [] 
      };
    }
  }

  /**
   * Get featured destinations
   * @param {number} limit - Maximum number of destinations to return
   * @returns {Promise<Array>} Array of featured destinations
   */
  async getFeaturedDestinations(limit = 10) {
    try {
      // First try to get destinations marked as featured
      const { data: featuredData, error: featuredError } = await supabase
        .from('destinations')
        .select('*')
        .eq('is_active', true)
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (featuredError) {
        console.error('❌ Error fetching featured destinations:', featuredError);
        throw new Error(featuredError.message);
      }

      // If we have featured destinations, return them
      if (featuredData && featuredData.length > 0) {
        const formattedDestinations = featuredData.map(destination => this.formatDestinationForMobile(destination));
        console.log(`✅ Loaded ${formattedDestinations.length} featured destinations from Supabase`);
        return formattedDestinations;
      }

      // Fallback: Get top-rated destinations if no featured ones
      console.log('⚠️ No featured destinations found, falling back to top-rated destinations');
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('destinations')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false })
        .limit(limit);

      if (fallbackError) {
        console.error('❌ Error fetching fallback destinations:', fallbackError);
        throw new Error(fallbackError.message);
      }

      const formattedDestinations = fallbackData.map(destination => this.formatDestinationForMobile(destination));
      console.log(`✅ Loaded ${formattedDestinations.length} fallback destinations from Supabase`);
      return formattedDestinations;

    } catch (error) {
      console.error('❌ Failed to fetch featured destinations:', error);
      return [];
    }
  }

  /**
   * Get popular destinations (sorted by rating and reviews)
   * @param {number} limit - Maximum number of destinations to return
   * @returns {Promise<Array>} Array of popular destinations
   */
  async getPopularDestinations(limit = 20) {
    try {
      const result = await this.getDestinations();
      const destinations = result.data || [];
      
      // Return destinations sorted by rating and review count
      const popular = destinations
        .sort((a, b) => {
          // Sort by featured first, then by rating and review count
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          
          const aScore = (a.rating * 0.7) + (Math.min(a.review_count || 0, 100) * 0.3);
          const bScore = (b.rating * 0.7) + (Math.min(b.review_count || 0, 100) * 0.3);
          
          return bScore - aScore;
        })
        .slice(0, limit);
        
      console.log(`✅ Loaded ${popular.length} popular destinations from Supabase`);
      return popular;
    } catch (error) {
      console.error('❌ Failed to fetch popular destinations:', error);
      return [];
    }
  }

  /**
   * Get destination by ID
   * @param {string} id - Destination ID
   * @returns {Promise<Object|null>} Destination object or null
   */
  async getDestinationById(id) {
    try {
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('❌ Error fetching destination by ID:', error);
        return null;
      }

      return this.formatDestinationForMobile(data);

    } catch (error) {
      console.error('❌ Failed to fetch destination by ID:', error);
      return null;
    }
  }

  /**
   * Format destination data for mobile app compatibility
   * @param {Object} destination - Raw destination data from Supabase
   * @returns {Object} Formatted destination object
   */
  formatDestinationForMobile(destination) {
    return {
      id: destination.id,
      name: destination.name || 'Unnamed Destination',
      location: destination.location || 'Unknown Location',
      description: destination.description || 'No description available',
      category: destination.category || 'Uncategorized',
      image: this.getDestinationImage(destination),
      rating: parseFloat(destination.rating) || 0,
      coordinates: destination.coordinates || {
        latitude: 10.3157, // Default to Cebu City coordinates
        longitude: 123.8854
      },
      address: destination.location || 'Cebu, Philippines',
      entrance_fee: destination.entrance_fee,
      opening_hours: destination.opening_hours,
      contact_number: destination.contact_number,
      website: destination.website,
      amenities: destination.amenities || [],
      accessibility_features: destination.accessibility_features || [],
      best_time_to_visit: destination.best_time_to_visit,
      estimated_duration: destination.estimated_duration,
      difficulty_level: destination.difficulty_level || 'Easy',
      review_count: parseInt(destination.review_count) || 0,
      featured: destination.featured || false,
      is_active: destination.is_active,
      created_at: destination.created_at,
      updated_at: destination.updated_at
    };
  }

  /**
   * Get appropriate image for destination
   * @param {Object} destination - Destination object
   * @returns {Object} Image object
   */
  getDestinationImage(destination) {
    try {
      // First check if there's an image_url from the database
      if (destination.image_url && destination.image_url.trim() !== '') {
        return { uri: destination.image_url };
      }

      // If destination has images array and it's not empty
      if (destination.images && Array.isArray(destination.images) && destination.images.length > 0) {
        return { uri: destination.images[0] };
      }

      // Fallback to local images based on destination name
      const name = destination.name?.toLowerCase() || '';
      
      if (name.includes('basilica') || name.includes('santo niño')) {
        return require('../../../assets/images/basilica.jpg');
      }
      if (name.includes('magellan') || name.includes('cross')) {
        return require('../../../assets/images/magellan-cross.jpg');
      }
      if (name.includes('temple') || name.includes('leah')) {
        return require('../../../assets/images/temple-of-leah.jpg');
      }
      if (name.includes('kawasan') || name.includes('falls')) {
        return require('../../../assets/images/kawasan-falls.jpg');
      }
      if (name.includes('moalboal')) {
        return require('../../../assets/images/moalboal.jpg');
      }
      if (name.includes('oslob')) {
        return require('../../../assets/images/oslob.jpg');
      }
      if (name.includes('bantayan') || name.includes('camotes')) {
        return require('../../../assets/images/bantayan.jpg');
      }
      if (name.includes('wow') || name.includes('alejandra')) {
        return require('../../../assets/images/wow-alejandra-garden.jpg');
      }

      // Default fallback image
      return require('../../../assets/images/temple-of-leah.jpg');
    } catch (error) {
      console.warn('Error getting destination image:', error);
      return require('../../../assets/images/temple-of-leah.jpg');
    }
  }

  /**
   * Clear cache to force refresh
   */
  clearCache() {
    this.destinationsCache = [];
    this.lastFetch = null;
    console.log('🗑️ Destinations cache cleared');
  }

  /**
   * Subscribe to real-time updates for destinations
   * @param {Function} callback - Function to call when data changes
   * @returns {Function} Unsubscribe function
   */
  subscribeToUpdates(callback) {
    this.listeners.add(callback);

    // Start subscription if not already active
    if (!this.subscription) {
      this.startRealtimeSubscription();
    }

    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
      if (this.listeners.size === 0) {
        this.stopRealtimeSubscription();
      }
    };
  }

  /**
   * Start real-time subscription to destinations table
   */
  startRealtimeSubscription() {
    console.log('🔄 Starting real-time subscription for destinations...');
    
    this.subscription = supabase
      .channel('destinations-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'destinations'
        },
        (payload) => {
          console.log('📡 Destinations real-time update:', payload.eventType);
          this.handleRealtimeUpdate(payload);
        }
      )
      .subscribe();
  }

  /**
   * Stop real-time subscription
   */
  stopRealtimeSubscription() {
    if (this.subscription) {
      console.log('🛑 Stopping real-time subscription for destinations...');
      supabase.removeChannel(this.subscription);
      this.subscription = null;
    }
  }

  /**
   * Handle real-time updates from Supabase
   * @param {Object} payload - The payload from Supabase real-time
   */
  handleRealtimeUpdate(payload) {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    console.log(`📡 Destinations ${eventType} event received:`, { 
      eventType, 
      id: newRecord?.id || oldRecord?.id 
    });

    // Clear cache to force fresh data on next fetch
    this.clearCache();

    // Notify all listeners
    this.listeners.forEach(callback => {
      try {
        callback({
          eventType,
          record: newRecord || oldRecord,
          data: this.destinationsCache
        });
      } catch (error) {
        console.error('Error in destinations update callback:', error);
      }
    });
  }

  /**
   * Get current cached data
   * @returns {Array} Current cached destinations
   */
  getCachedData() {
    return this.destinationsCache;
  }
}

export default new DestinationsDataServiceSupabase();
