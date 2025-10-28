import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import VisitTrackingService from '../../services/api/visitTrackingService';

const VisitTrackingTest = () => {
  const [testResults, setTestResults] = useState([]);

  const runTest = async (testName, testFunction) => {
    try {
      console.log(`🧪 Running test: ${testName}`);
      const result = await testFunction();
      const success = result.success;
      
      setTestResults(prev => [...prev, {
        name: testName,
        success,
        result: result
      }]);
      
      console.log(`✅ ${testName}:`, result);
      return result;
    } catch (error) {
      console.error(`❌ ${testName} failed:`, error);
      setTestResults(prev => [...prev, {
        name: testName,
        success: false,
        error: error.message
      }]);
    }
  };

  const testDatabaseConnection = async () => {
    return await runTest('Database Connection', async () => {
      const dbCheck = await VisitTrackingService.checkDatabaseTables();
      return {
        success: true,
        data: dbCheck,
        message: dbCheck.exists ? 'Database tables exist' : 'Using local storage fallback'
      };
    });
  };

  const testMarkAsVisited = async () => {
    return await runTest('Mark as Visited', async () => {
      return await VisitTrackingService.markAsVisited(
        '3', // Temple of Leah
        'destination',
        {
          isVerified: true,
          verificationMethod: 'location',
          notes: 'Test visit from debug component',
          rating: 5
        }
      );
    });
  };

  const testHasVisited = async () => {
    return await runTest('Check Visit Status', async () => {
      return await VisitTrackingService.hasVisited('3', 'destination');
    });
  };

  const testGetVisitedAttractions = async () => {
    return await runTest('Get Visited Attractions', async () => {
      return await VisitTrackingService.getVisitedAttractions();
    });
  };

  const runAllTests = async () => {
    setTestResults([]);
    
    await testDatabaseConnection();
    await testMarkAsVisited();
    await testHasVisited();
    await testGetVisitedAttractions();
    
    Alert.alert('Tests Complete', 'Check console for detailed results');
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Visit Tracking Test</Text>
      
      <TouchableOpacity style={styles.button} onPress={runAllTests}>
        <Text style={styles.buttonText}>Run All Tests</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={testMarkAsVisited}>
        <Text style={styles.buttonText}>Test Mark as Visited</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={clearResults}>
        <Text style={styles.buttonText}>Clear Results</Text>
      </TouchableOpacity>
      
      {testResults.map((test, index) => (
        <View key={index} style={styles.resultItem}>
          <Text style={[
            styles.resultText,
            { color: test.success ? '#4CAF50' : '#F44336' }
          ]}>
            {test.success ? '✅' : '❌'} {test.name}
          </Text>
          {test.error && (
            <Text style={styles.errorText}>{test.error}</Text>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  resultItem: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 5,
  },
  resultText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 5,
  },
});

export default VisitTrackingTest;
