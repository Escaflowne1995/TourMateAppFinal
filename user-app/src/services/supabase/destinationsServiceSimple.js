import { supabase } from './supabaseClient';

/**
 * Simple Destinations Service for Mobile App
 * Fetches destinations from Supabase with minimal complexity
 * Fallback service if the main one has issues
 */

// Static function to get destination image
const getDestinationImage = (destination) => {
  try {
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
};

// Static function to format destination data
const formatDestinationForMobile = (destination) => {
  try {
    return {
      id: destination.id,
      name: destination.name || 'Unnamed Destination',
      location: destination.location || 'Unknown Location',
      description: destination.description || 'No description available',
      category: destination.category || 'Uncategorized',
      image: getDestinationImage(destination),
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
  } catch (error) {
    console.error('Error formatting destination:', error);
    return {
      id: destination.id || 'unknown',
      name: destination.name || 'Unknown Destination',
      location: 'Unknown Location',
      description: 'No description available',
      category: 'Uncategorized',
      image: require('../../../assets/images/temple-of-leah.jpg'),
      rating: 0,
      coordinates: { latitude: 10.3157, longitude: 123.8854 },
      address: 'Cebu, Philippines',
      featured: false,
      is_active: true
    };
  }
};

/**
 * Get all active destinations from Supabase
 */
export const getDestinations = async () => {
  try {
    console.log('🔄 Fetching destinations from Supabase...');
    
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .eq('is_active', true)
      .eq('featured', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching destinations:', error);
      throw new Error(error.message);
    }

    // Format destinations for mobile app compatibility
    const formattedDestinations = data.map(formatDestinationForMobile);
    
    console.log(`✅ Loaded ${formattedDestinations.length} destinations from Supabase`);
    return { success: true, data: formattedDestinations };

  } catch (error) {
    console.error('❌ Failed to fetch destinations:', error);
    return { 
      success: false, 
      error: error.message,
      data: [] 
    };
  }
};

/**
 * Get featured destinations
 */
export const getFeaturedDestinations = async (limit = 10) => {
  try {
    console.log('🔄 Fetching featured destinations...');
    
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .eq('is_active', true)
      .eq('featured', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(error.message);
    }

    const formatted = data.map(formatDestinationForMobile);
    console.log(`✅ Loaded ${formatted.length} featured destinations`);
    return { success: true, data: formatted };

  } catch (error) {
    console.error('❌ Failed to fetch featured destinations:', error);
    return { success: false, error: error.message, data: [] };
  }
};

/**
 * Get popular destinations (non-featured destinations)
 */
export const getPopularDestinations = async (limit = 20) => {
  try {
    console.log('🔄 Fetching popular destinations...');
    
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .eq('is_active', true)
      .eq('featured', false)
      .order('rating', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(error.message);
    }

    const formatted = data.map(formatDestinationForMobile);
    console.log(`✅ Loaded ${formatted.length} popular destinations`);
    return { success: true, data: formatted };

  } catch (error) {
    console.error('❌ Failed to fetch popular destinations:', error);
    return { success: false, error: error.message, data: [] };
  }
};


export default {
  getDestinations,
  getFeaturedDestinations,
  getPopularDestinations
};
