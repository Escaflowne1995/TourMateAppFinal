// DelicaciesDataServiceSupabase.js - Supabase-based delicacies data service
import { supabase } from '../supabase/supabaseClient';
import { imageMap } from '../../utils/imageMap';

class DelicaciesDataServiceSupabase {
  constructor() {
    this.delicaciesCache = [];
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
   * Get all active delicacies from Supabase
   * @param {boolean} useCache - Whether to use cached data if available
   * @returns {Promise<Array>} Array of delicacy objects
   */
  async getDelicacies(useCache = true) {
    try {
      // Use cache if it's still valid
      if (useCache && this.isCacheValid()) {
        console.log('📄 Using cached delicacies data');
        return { success: true, data: this.delicaciesCache };
      }

      console.log('🔄 Fetching delicacies from Supabase...');
      
      const { data, error } = await supabase
        .from('local_delicacies')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching delicacies:', error);
        throw new Error(error.message);
      }

      // Format delicacies for mobile app compatibility
      const formattedDelicacies = data.map(delicacy => this.formatDelicacyForMobile(delicacy));
      
      // Update cache
      this.delicaciesCache = formattedDelicacies;
      this.lastFetch = Date.now();

      console.log(`✅ Loaded ${formattedDelicacies.length} delicacies from Supabase`);
      return { success: true, data: formattedDelicacies };

    } catch (error) {
      console.error('❌ Failed to fetch delicacies:', error);
      // Return cached data if available, otherwise empty array
      return { 
        success: false, 
        error: error.message,
        data: this.delicaciesCache || [] 
      };
    }
  }

  /**
   * Get featured delicacies
   * @param {number} limit - Maximum number of delicacies to return
   * @returns {Promise<Array>} Array of featured delicacies
   */
  async getFeaturedDelicacies(limit = 3) {
    try {
      const { data, error } = await supabase
        .from('local_delicacies')
        .select('*')
        .eq('is_active', true)
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Error fetching featured delicacies:', error);
        throw new Error(error.message);
      }

      const formattedDelicacies = data.map(delicacy => this.formatDelicacyForMobile(delicacy));
      console.log(`✅ Loaded ${formattedDelicacies.length} featured delicacies from Supabase`);
      return formattedDelicacies;

    } catch (error) {
      console.error('❌ Failed to fetch featured delicacies:', error);
      // Return empty array on error
      return [];
    }
  }

  /**
   * Get popular delicacies (non-featured delicacies)
   * @param {number} limit - Maximum number of delicacies to return
   * @returns {Promise<Array>} Array of popular delicacies
   */
  async getPopularDelicacies(limit = 10) {
    try {
      console.log('🔄 Fetching popular delicacies from Supabase...');
      
      const { data, error } = await supabase
        .from('local_delicacies')
        .select('*')
        .eq('is_active', true)
        .eq('featured', false)
        .order('rating', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Error fetching popular delicacies:', error);
        throw new Error(error.message);
      }

      // Format delicacies for mobile app compatibility
      const formattedDelicacies = data.map(delicacy => this.formatDelicacyForMobile(delicacy));
      
      console.log(`✅ Loaded ${formattedDelicacies.length} popular delicacies from Supabase`);
      return formattedDelicacies;
    } catch (error) {
      console.error('❌ Failed to fetch popular delicacies:', error);
      return [];
    }
  }

  /**
   * Get delicacy by ID
   * @param {string} id - Delicacy ID
   * @returns {Promise<Object|null>} Delicacy object or null
   */
  async getDelicacyById(id) {
    try {
      const { data, error } = await supabase
        .from('local_delicacies')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('❌ Error fetching delicacy by ID:', error);
        return null;
      }

      return this.formatDelicacyForMobile(data);

    } catch (error) {
      console.error('❌ Failed to fetch delicacy by ID:', error);
      return null;
    }
  }

  /**
   * Get delicacies by location
   * @param {string} location - Location to filter by
   * @returns {Promise<Array>} Array of delicacies in the location
   */
  async getDelicaciesByLocation(location) {
    try {
      const { data, error } = await supabase
        .from('local_delicacies')
        .select('*')
        .eq('is_active', true)
        .ilike('origin', `%${location}%`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching delicacies by location:', error);
        throw new Error(error.message);
      }

      const formattedDelicacies = data.map(delicacy => this.formatDelicacyForMobile(delicacy));
      console.log(`✅ Loaded ${formattedDelicacies.length} delicacies for location: ${location}`);
      return formattedDelicacies;

    } catch (error) {
      console.error('❌ Failed to fetch delicacies by location:', error);
      return [];
    }
  }

  /**
   * Format delicacy data for mobile app compatibility
   * @param {Object} delicacy - Raw delicacy data from Supabase
   * @returns {Object} Formatted delicacy object
   */
  formatDelicacyForMobile(delicacy) {
    return {
      id: delicacy.id,
      name: delicacy.name,
      description: delicacy.description || 'No description available',
      location: delicacy.origin || 'Cebu',
      image: this.getDelicacyImage(delicacy),
      price: this.getDefaultPrice(delicacy.name),
      coordinates: this.getDefaultCoordinates(delicacy.origin),
      address: this.getDefaultAddress(delicacy.origin),
      category: delicacy.category || 'Food/Beverage',
      is_active: delicacy.is_active,
      created_at: delicacy.created_at
    };
  }

  /**
   * Get appropriate image for delicacy
   * @param {Object} delicacy - Delicacy object with potential image_url
   * @returns {Object} Image object
   */
  getDelicacyImage(delicacy) {
    // First check if there's an image_url from the database
    if (delicacy.image_url && delicacy.image_url.trim() !== '') {
      return { uri: delicacy.image_url };
    }
    
    // Fallback to name-based image mapping
    const nameLower = delicacy.name.toLowerCase();
    
    if (nameLower.includes('lechon')) return imageMap.lechon;
    if (nameLower.includes('puso')) return imageMap.puso;
    if (nameLower.includes('pochero')) return imageMap.pochero;
    if (nameLower.includes('rosquillos')) return imageMap.rosquillos;
    if (nameLower.includes('danggit')) return imageMap.danggit;
    if (nameLower.includes('masareal')) return imageMap.masareal;
    
    // Default image
    return imageMap.puso;
  }

  /**
   * Get default price for delicacy
   * @param {string} name - Delicacy name
   * @returns {string} Default price
   */
  getDefaultPrice(name) {
    const nameLower = name.toLowerCase();
    
    if (nameLower.includes('lechon')) return '₱350-500/kilo';
    if (nameLower.includes('puso')) return '₱10-15/piece';
    if (nameLower.includes('pochero')) return '₱80-120/bowl';
    if (nameLower.includes('rosquillos')) return '₱150-200/pack';
    if (nameLower.includes('danggit')) return '₱180-250/pack';
    if (nameLower.includes('masareal')) return '₱100-150/pack';
    
    return '₱50-100/serving';
  }

  /**
   * Get default coordinates for location
   * @param {string} location - Location name
   * @returns {Object} Coordinates object
   */
  getDefaultCoordinates(location) {
    const locationLower = (location || '').toLowerCase();
    
    if (locationLower.includes('carcar')) return { latitude: 10.1067, longitude: 123.6428 };
    if (locationLower.includes('carbon')) return { latitude: 10.2934, longitude: 123.9012 };
    if (locationLower.includes('liloan')) return { latitude: 10.3919, longitude: 123.9847 };
    if (locationLower.includes('bantayan')) return { latitude: 11.1674, longitude: 123.7269 };
    if (locationLower.includes('mandaue')) return { latitude: 10.3457, longitude: 123.9327 };
    
    // Default to Cebu City center
    return { latitude: 10.3157, longitude: 123.8854 };
  }

  /**
   * Get default address for location
   * @param {string} location - Location name
   * @returns {string} Default address
   */
  getDefaultAddress(location) {
    const locationLower = (location || '').toLowerCase();
    
    if (locationLower.includes('carcar')) return 'Carcar City Public Market, Carcar City, Cebu, Philippines';
    if (locationLower.includes('carbon')) return 'Carbon Market, Cebu City, Philippines';
    if (locationLower.includes('liloan')) return 'Liloan, Cebu, Philippines';
    if (locationLower.includes('bantayan')) return 'Bantayan Island, Cebu, Philippines';
    if (locationLower.includes('mandaue')) return 'Mandaue City Public Market, Mandaue City, Cebu, Philippines';
    
    return 'Cebu City, Philippines';
  }

  /**
   * Clear cache to force refresh
   */
  clearCache() {
    this.delicaciesCache = [];
    this.lastFetch = null;
    console.log('🗑️ Delicacies cache cleared');
  }

  /**
   * Subscribe to real-time updates for delicacies
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
   * Start real-time subscription to delicacies table
   */
  startRealtimeSubscription() {
    console.log('🔄 Starting real-time subscription for delicacies...');
    
    this.subscription = supabase
      .channel('delicacies-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'local_delicacies'
        },
        (payload) => {
          console.log('📡 Delicacies real-time update:', payload.eventType);
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
      console.log('🛑 Stopping real-time subscription for delicacies...');
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
    
    console.log(`📡 Delicacies ${eventType} event received:`, { 
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
          data: this.delicaciesCache
        });
      } catch (error) {
        console.error('Error in delicacies update callback:', error);
      }
    });
  }

  /**
   * Get current cached data
   * @returns {Array} Current cached delicacies
   */
  getCachedData() {
    return this.delicaciesCache;
  }
}

export default new DelicaciesDataServiceSupabase();
