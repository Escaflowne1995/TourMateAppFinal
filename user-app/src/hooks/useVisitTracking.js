import { useState, useEffect } from 'react';
import VisitTrackingService from '../services/api/visitTrackingService';

/**
 * Custom hook for managing visit tracking state
 * @param {string} attractionId - The ID of the attraction
 * @param {string} attractionType - 'destination' or 'delicacy'
 * @returns {Object} Visit tracking state and methods
 */
export const useVisitTracking = (attractionId, attractionType) => {
  const [hasVisited, setHasVisited] = useState(false);
  const [visitData, setVisitData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingVisit, setIsMarkingVisit] = useState(false);

  // Check visit status when component mounts or attraction changes
  useEffect(() => {
    if (attractionId && attractionType) {
      checkVisitStatus();
    }
  }, [attractionId, attractionType]);

  const checkVisitStatus = async () => {
    try {
      setIsLoading(true);
      const result = await VisitTrackingService.hasVisited(attractionId, attractionType);
      if (result.success) {
        setHasVisited(result.hasVisited);
        setVisitData(result.lastVisit);
      }
    } catch (error) {
      console.error('Error checking visit status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsVisited = async (visitData = {}) => {
    if (isMarkingVisit) return { success: false, error: 'Already processing' };
    
    setIsMarkingVisit(true);
    try {
      const result = await VisitTrackingService.markAsVisited(
        attractionId,
        attractionType,
        visitData
      );

      if (result.success) {
        setHasVisited(true);
        setVisitData(result.data);
      }

      return result;
    } catch (error) {
      console.error('Error marking as visited:', error);
      return { success: false, error: error.message };
    } finally {
      setIsMarkingVisit(false);
    }
  };

  const markAsNotVisited = async () => {
    try {
      if (visitData && visitData.id) {
        const result = await VisitTrackingService.deleteVisit(visitData.id);
        if (result.success) {
          setHasVisited(false);
          setVisitData(null);
        }
        return result;
      }
      return { success: false, error: 'No visit data to remove' };
    } catch (error) {
      console.error('Error removing visit:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    hasVisited,
    visitData,
    isLoading,
    isMarkingVisit,
    checkVisitStatus,
    markAsVisited,
    markAsNotVisited,
  };
};

export default useVisitTracking;
