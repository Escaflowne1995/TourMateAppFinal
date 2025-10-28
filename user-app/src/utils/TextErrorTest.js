// TextErrorTest.js - Test component to identify text rendering issues
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TextErrorTest = () => {
  console.log('🧪 TextErrorTest component rendered');
  
  // Test different patterns that might cause errors
  const testString = "Test string";
  const testNumber = 123;
  const testCondition = true;
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Text Error Test</Text>
      
      {/* These should all work fine */}
      <Text style={styles.text}>Direct string: {testString}</Text>
      <Text style={styles.text}>Direct number: {testNumber}</Text>
      <Text style={styles.text}>Conditional: {testCondition ? 'True' : 'False'}</Text>
      
      {/* Test template literals */}
      <Text style={styles.text}>
        {`Template literal: ${testString} - ${testNumber}`}
      </Text>
      
      {/* Test array rendering */}
      <Text style={styles.text}>
        {['Array', 'of', 'strings'].join(' ')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    fontSize: 14,
    marginBottom: 5,
  },
});

export default TextErrorTest;
