// TextErrorDebugger.js - Component to help debug "Text strings must be rendered within a <Text> component" errors
import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';

const TextErrorDebugger = () => {
  // This component demonstrates common patterns that cause the error
  // and how to fix them

  const commonErrors = [
    {
      name: "Conditional String Return",
      wrong: () => {
        // This would cause the error:
        // return someCondition ? "Text" : <Text>Text</Text>;
        return null; // Commented out to prevent error
      },
      correct: () => {
        return someCondition ? <Text>Text</Text> : <Text>Text</Text>;
      }
    },
    {
      name: "Template Literal Without Text",
      wrong: () => {
        // This would cause the error:
        // return `Hello ${name}`;
        return null; // Commented out to prevent error
      },
      correct: () => {
        const name = "World";
        return <Text>{`Hello ${name}`}</Text>;
      }
    },
    {
      name: "Array of Strings",
      wrong: () => {
        // This would cause the error:
        // return items.map(item => item.name);
        return null; // Commented out to prevent error
      },
      correct: () => {
        const items = ["Item 1", "Item 2", "Item 3"];
        return items.map((item, index) => (
          <Text key={index}>{item}</Text>
        ));
      }
    }
  ];

  const someCondition = true;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Text Error Debugger</Text>
      <Text style={styles.subtitle}>Common patterns that cause the error:</Text>
      
      {commonErrors.map((error, index) => (
        <View key={index} style={styles.errorExample}>
          <Text style={styles.errorName}>{error.name}</Text>
          <Text style={styles.correctLabel}>✅ Correct Implementation:</Text>
          {error.correct()}
        </View>
      ))}
      
      <Text style={styles.helpText}>
        If you're still getting the error, check your console for the exact line number
        and look for any text that's not wrapped in a Text component.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 15,
    color: '#666',
  },
  errorExample: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  errorName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  correctLabel: {
    fontSize: 12,
    color: '#4CAF50',
    marginBottom: 5,
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 10,
  },
});

export default TextErrorDebugger;
