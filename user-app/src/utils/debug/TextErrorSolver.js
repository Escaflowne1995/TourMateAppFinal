// TextErrorSolver.js - Utility to help solve "Text strings must be rendered within a <Text> component" errors
import React from 'react';
import { Text } from 'react-native';

class TextErrorSolver {
  // Method to safely render text with automatic Text component wrapping
  static safeText(text, style = {}) {
    if (typeof text === 'string' || typeof text === 'number') {
      return <Text style={style}>{text}</Text>;
    }
    return text;
  }

  // Method to safely render conditional text
  static safeConditionalText(condition, trueText, falseText, style = {}) {
    if (condition) {
      return this.safeText(trueText, style);
    }
    return this.safeText(falseText, style);
  }

  // Method to safely render array of text items
  static safeTextArray(items, style = {}) {
    if (!Array.isArray(items)) {
      return this.safeText(items, style);
    }
    
    return items.map((item, index) => {
      if (typeof item === 'string' || typeof item === 'number') {
        return <Text key={index} style={style}>{item}</Text>;
      }
      return item;
    });
  }

  // Method to safely render template literals
  static safeTemplate(template, variables, style = {}) {
    let result = template;
    
    // Replace variables in template
    Object.keys(variables).forEach(key => {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), variables[key]);
    });
    
    return <Text style={style}>{result}</Text>;
  }

  // Debug method to identify problematic text
  static debugText(text) {
    console.log('Text type:', typeof text);
    console.log('Text value:', text);
    console.log('Is string:', typeof text === 'string');
    console.log('Is number:', typeof text === 'number');
    console.log('Is React element:', React.isValidElement(text));
    
    if (typeof text === 'string' || typeof text === 'number') {
      console.warn('⚠️ This text should be wrapped in a <Text> component!');
      return <Text>{text}</Text>;
    }
    
    return text;
  }

  // Method to validate JSX for text errors
  static validateJSX(jsx) {
    const textPattern = /{[^}]*['"`][^'"]*['"`][^}]*}/g;
    const matches = jsx.match(textPattern);
    
    if (matches) {
      console.warn('⚠️ Potential text rendering issues found:');
      matches.forEach((match, index) => {
        console.warn(`  ${index + 1}. ${match}`);
      });
    }
    
    return matches || [];
  }
}

export default TextErrorSolver;
