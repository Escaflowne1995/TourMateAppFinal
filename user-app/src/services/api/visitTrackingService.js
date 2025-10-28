// VisitTrackingService.js - Service for tracking user visits to attractions
import { supabase } from '../supabase/supabaseClient';

class VisitTrackingService {
  // Check if database tables exist
  static async checkDatabaseTables() {
    try {
      const { data, error } = await supabase
        .from('user_visits')
        .select('id')
        .limit(1);
      
      return { exists: !error, error };
    } catch (error) {
      return { exists: false, error };
    }
  }
  /**
   * Mark an attraction as visited by the current user
   * @param {string} attractionId - The ID of the attraction
   * @param {string} attractionType - 'destination' or 'delicacy'
   * @param {Object} visitData - Optional visit data (notes, photos, rating, duration)
   * @returns {Promise<Object>} Result object with success status
   */
  static async markAsVisited(attractionId, attractionType, visitData = {}) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return {
          success: false,
          error: 'User not authenticated'
        };
      }

      // First, check if the user_visits table exists
      const { data: tableCheck, error: tableError } = await supabase
        .from('user_visits')
        .select('id')
        .limit(1);

      if (tableError && (tableError.code === 'PGRST116' || tableError.code === 'PGRST205')) {
        // Table doesn't exist, use local storage fallback
        console.log('Database table not found, using local storage fallback');
        return await this.markAsVisitedLocal(attractionId, attractionType, visitData);
      }

      const visitRecord = {
        user_id: user.id,
        entity_type: attractionType,
        entity_id: attractionId,
        visit_date: new Date().toISOString(),
        visit_duration: visitData.duration || null,
        visit_notes: visitData.notes || null,
        photos: visitData.photos || [],
        rating: visitData.rating || null,
        is_verified: visitData.isVerified || false,
        verification_method: visitData.verificationMethod || 'manual'
      };

      const { data, error } = await supabase
        .from('user_visits')
        .insert([visitRecord])
        .select()
        .single();

      if (error) {
        console.error('Error marking as visited:', error);
        // Check if it's a table not found error
        if (error.code === 'PGRST205' || error.message.includes('Could not find the table')) {
          console.log('Database table not found, using local storage fallback');
          return await this.markAsVisitedLocal(attractionId, attractionType, visitData);
        }
        // Fallback to local storage if database fails
        return await this.markAsVisitedLocal(attractionId, attractionType, visitData);
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error in markAsVisited:', error);
      // Fallback to local storage
      return await this.markAsVisitedLocal(attractionId, attractionType, visitData);
    }
  }

  // Local storage fallback for when database is not available
  static async markAsVisitedLocal(attractionId, attractionType, visitData = {}) {
    try {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      
      const visitRecord = {
        id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: 'local_user',
        entity_type: attractionType,
        entity_id: attractionId,
        visit_date: new Date().toISOString(),
        visit_duration: visitData.duration || null,
        visit_notes: visitData.notes || null,
        photos: visitData.photos || [],
        rating: visitData.rating || null,
        is_verified: visitData.isVerified || false,
        verification_method: visitData.verificationMethod || 'manual',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Get existing visits
      const existingVisits = await AsyncStorage.getItem('@user_visits');
      const visits = existingVisits ? JSON.parse(existingVisits) : [];
      
      // Add new visit
      visits.push(visitRecord);
      
      // Save back to storage
      await AsyncStorage.setItem('@user_visits', JSON.stringify(visits));

      return {
        success: true,
        data: visitRecord
      };
    } catch (error) {
      console.error('Error in markAsVisitedLocal:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check if user has visited a specific attraction
   * @param {string} attractionId - The ID of the attraction
   * @param {string} attractionType - 'destination' or 'delicacy'
   * @returns {Promise<Object>} Result object with visit status
   */
  static async hasVisited(attractionId, attractionType) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        // Fallback to local storage
        return await this.hasVisitedLocal(attractionId, attractionType);
      }

      // First, check if the user_visits table exists
      const { data: tableCheck, error: tableError } = await supabase
        .from('user_visits')
        .select('id')
        .limit(1);

      if (tableError && (tableError.code === 'PGRST116' || tableError.code === 'PGRST205')) {
        // Table doesn't exist, use local storage
        console.log('Database table not found, using local storage fallback');
        return await this.hasVisitedLocal(attractionId, attractionType);
      }

      const { data, error } = await supabase
        .from('user_visits')
        .select('*')
        .eq('user_id', user.id)
        .eq('entity_id', attractionId)
        .eq('entity_type', attractionType)
        .order('visit_date', { ascending: false });

      if (error) {
        console.error('Error checking visit status:', error);
        // Check if it's a table not found error
        if (error.code === 'PGRST205' || error.message.includes('Could not find the table')) {
          console.log('Database table not found, using local storage fallback');
          return await this.hasVisitedLocal(attractionId, attractionType);
        }
        // Fallback to local storage
        return await this.hasVisitedLocal(attractionId, attractionType);
      }

      return {
        success: true,
        hasVisited: data.length > 0,
        visits: data,
        lastVisit: data.length > 0 ? data[0] : null
      };
    } catch (error) {
      console.error('Error in hasVisited:', error);
      // Fallback to local storage
      return await this.hasVisitedLocal(attractionId, attractionType);
    }
  }

  // Local storage fallback for checking visit status
  static async hasVisitedLocal(attractionId, attractionType) {
    try {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      
      const existingVisits = await AsyncStorage.getItem('@user_visits');
      if (!existingVisits) {
        return {
          success: true,
          hasVisited: false,
          visits: [],
          lastVisit: null
        };
      }

      const visits = JSON.parse(existingVisits);
      const userVisits = visits.filter(visit => 
        visit.entity_id === attractionId && 
        visit.entity_type === attractionType
      );

      return {
        success: true,
        hasVisited: userVisits.length > 0,
        visits: userVisits,
        lastVisit: userVisits.length > 0 ? userVisits[0] : null
      };
    } catch (error) {
      console.error('Error in hasVisitedLocal:', error);
      return {
        success: false,
        hasVisited: false,
        error: error.message
      };
    }
  }

  /**
   * Get all visited attractions for the current user
   * @param {string} attractionType - Optional filter by type ('destination' or 'delicacy')
   * @returns {Promise<Object>} Result object with visited attractions
   */
  static async getVisitedAttractions(attractionType = null) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        // Fallback to local storage
        return await this.getVisitedAttractionsLocal(attractionType);
      }

      // First, check if the user_visits table exists
      const { data: tableCheck, error: tableError } = await supabase
        .from('user_visits')
        .select('id')
        .limit(1);

      if (tableError && (tableError.code === 'PGRST116' || tableError.code === 'PGRST205')) {
        // Table doesn't exist, use local storage
        console.log('Database table not found, using local storage fallback');
        return await this.getVisitedAttractionsLocal(attractionType);
      }

      let query = supabase
        .from('user_visits')
        .select(`
          *,
          destinations!inner(name, location, image_url, category),
          delicacies!inner(name, location, image_url, category)
        `)
        .eq('user_id', user.id)
        .order('visit_date', { ascending: false });

      if (attractionType) {
        query = query.eq('entity_type', attractionType);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching visited attractions:', error);
        // Check if it's a table not found error
        if (error.code === 'PGRST205' || error.message.includes('Could not find the table')) {
          console.log('Database table not found, using local storage fallback');
          return await this.getVisitedAttractionsLocal(attractionType);
        }
        // Fallback to local storage
        return await this.getVisitedAttractionsLocal(attractionType);
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error in getVisitedAttractions:', error);
      // Fallback to local storage
      return await this.getVisitedAttractionsLocal(attractionType);
    }
  }

  // Local storage fallback for getting visited attractions
  static async getVisitedAttractionsLocal(attractionType = null) {
    try {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      
      const existingVisits = await AsyncStorage.getItem('@user_visits');
      if (!existingVisits) {
        return {
          success: true,
          data: []
        };
      }

      let visits = JSON.parse(existingVisits);
      
      if (attractionType) {
        visits = visits.filter(visit => visit.entity_type === attractionType);
      }

      // Sort by visit date (most recent first)
      visits.sort((a, b) => new Date(b.visit_date) - new Date(a.visit_date));

      return {
        success: true,
        data: visits
      };
    } catch (error) {
      console.error('Error in getVisitedAttractionsLocal:', error);
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  }

  /**
   * Get user's visit statistics
   * @returns {Promise<Object>} Result object with visit statistics
   */
  static async getVisitStats() {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return {
          success: false,
          data: null,
          error: 'User not authenticated'
        };
      }

      const { data, error } = await supabase
        .from('user_visit_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching visit stats:', error);
        return {
          success: false,
          data: null,
          error: error.message
        };
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error in getVisitStats:', error);
      return {
        success: false,
        data: null,
        error: error.message
      };
    }
  }

  /**
   * Update a visit record
   * @param {string} visitId - The ID of the visit record
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Result object with success status
   */
  static async updateVisit(visitId, updateData) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return {
          success: false,
          error: 'User not authenticated'
        };
      }

      const { data, error } = await supabase
        .from('user_visits')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', visitId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating visit:', error);
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error in updateVisit:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Delete a visit record
   * @param {string} visitId - The ID of the visit record
   * @returns {Promise<Object>} Result object with success status
   */
  static async deleteVisit(visitId) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        // Fallback to local storage
        return await this.deleteVisitLocal(visitId);
      }

      // Check if it's a local visit ID
      if (visitId.startsWith('local_')) {
        return await this.deleteVisitLocal(visitId);
      }

      const { error } = await supabase
        .from('user_visits')
        .delete()
        .eq('id', visitId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting visit:', error);
        // Fallback to local storage
        return await this.deleteVisitLocal(visitId);
      }

      return {
        success: true
      };
    } catch (error) {
      console.error('Error in deleteVisit:', error);
      // Fallback to local storage
      return await this.deleteVisitLocal(visitId);
    }
  }

  // Local storage fallback for deleting visits
  static async deleteVisitLocal(visitId) {
    try {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      
      const existingVisits = await AsyncStorage.getItem('@user_visits');
      if (!existingVisits) {
        return {
          success: false,
          error: 'No visits found'
        };
      }

      const visits = JSON.parse(existingVisits);
      const filteredVisits = visits.filter(visit => visit.id !== visitId);
      
      if (filteredVisits.length === visits.length) {
        return {
          success: false,
          error: 'Visit not found'
        };
      }

      await AsyncStorage.setItem('@user_visits', JSON.stringify(filteredVisits));

      return {
        success: true
      };
    } catch (error) {
      console.error('Error in deleteVisitLocal:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get visit count for a specific attraction
   * @param {string} attractionId - The ID of the attraction
   * @param {string} attractionType - 'destination' or 'delicacy'
   * @returns {Promise<Object>} Result object with visit count
   */
  static async getAttractionVisitCount(attractionId, attractionType) {
    try {
      const { data, error } = await supabase
        .from('user_visits')
        .select('id', { count: 'exact' })
        .eq('entity_id', attractionId)
        .eq('entity_type', attractionType);

      if (error) {
        console.error('Error fetching visit count:', error);
        return {
          success: false,
          count: 0,
          error: error.message
        };
      }

      return {
        success: true,
        count: data.length
      };
    } catch (error) {
      console.error('Error in getAttractionVisitCount:', error);
      return {
        success: false,
        count: 0,
        error: error.message
      };
    }
  }

  /**
   * Mark visit as verified (e.g., when user is at the location)
   * @param {string} visitId - The ID of the visit record
   * @param {string} verificationMethod - Method used for verification
   * @returns {Promise<Object>} Result object with success status
   */
  static async verifyVisit(visitId, verificationMethod = 'location') {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return {
          success: false,
          error: 'User not authenticated'
        };
      }

      const { data, error } = await supabase
        .from('user_visits')
        .update({
          is_verified: true,
          verification_method: verificationMethod,
          updated_at: new Date().toISOString()
        })
        .eq('id', visitId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error verifying visit:', error);
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error in verifyVisit:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default VisitTrackingService;
