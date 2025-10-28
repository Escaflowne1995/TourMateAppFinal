// Test script for visit tracking functionality
import VisitTrackingService from './visitTrackingService';

export const testVisitTracking = async () => {
  console.log('🧪 Testing Visit Tracking Service...');
  
  try {
    // Test 1: Mark an attraction as visited
    console.log('Test 1: Marking attraction as visited...');
    const markResult = await VisitTrackingService.markAsVisited(
      '3', // Temple of Leah ID
      'destination',
      {
        isVerified: true,
        verificationMethod: 'location',
        notes: 'Test visit - amazing view!',
        rating: 5
      }
    );
    
    console.log('Mark result:', markResult);
    
    if (markResult.success) {
      console.log('✅ Successfully marked as visited');
    } else {
      console.log('❌ Failed to mark as visited:', markResult.error);
    }
    
    // Test 2: Check if visited
    console.log('Test 2: Checking visit status...');
    const hasVisitedResult = await VisitTrackingService.hasVisited('3', 'destination');
    
    console.log('Has visited result:', hasVisitedResult);
    
    if (hasVisitedResult.success && hasVisitedResult.hasVisited) {
      console.log('✅ Visit status correctly detected');
    } else {
      console.log('❌ Visit status not detected:', hasVisitedResult.error);
    }
    
    // Test 3: Get visited attractions
    console.log('Test 3: Getting visited attractions...');
    const visitedResult = await VisitTrackingService.getVisitedAttractions();
    
    console.log('Visited attractions:', visitedResult);
    
    if (visitedResult.success && visitedResult.data.length > 0) {
      console.log('✅ Successfully retrieved visited attractions');
    } else {
      console.log('❌ Failed to retrieve visited attractions:', visitedResult.error);
    }
    
    // Test 4: Delete visit
    console.log('Test 4: Deleting visit...');
    if (hasVisitedResult.lastVisit) {
      const deleteResult = await VisitTrackingService.deleteVisit(hasVisitedResult.lastVisit.id);
      
      console.log('Delete result:', deleteResult);
      
      if (deleteResult.success) {
        console.log('✅ Successfully deleted visit');
      } else {
        console.log('❌ Failed to delete visit:', deleteResult.error);
      }
    }
    
    console.log('🎉 Visit tracking test completed!');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
};

export default testVisitTracking;
