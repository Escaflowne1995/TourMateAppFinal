// TextErrorFix.js - Comprehensive fix for "Text strings must be rendered within a <Text> component" errors
import React from 'react';
import { Text } from 'react-native';

// Utility function to safely render text
export const SafeText = ({ children, style, ...props }) => {
  // If children is a string or number, wrap it in Text
  if (typeof children === 'string' || typeof children === 'number') {
    return <Text style={style} {...props}>{children}</Text>;
  }
  
  // If children is already a React element, return as is
  if (React.isValidElement(children)) {
    return children;
  }
  
  // If children is an array, process each item
  if (Array.isArray(children)) {
    return children.map((child, index) => {
      if (typeof child === 'string' || typeof child === 'number') {
        return <Text key={index} style={style} {...props}>{child}</Text>;
      }
      return child;
    });
  }
  
  // Fallback: wrap in Text component
  return <Text style={style} {...props}>{children}</Text>;
};

// Utility function for conditional text rendering
export const ConditionalText = ({ condition, trueText, falseText, style, ...props }) => {
  const text = condition ? trueText : falseText;
  return <SafeText style={style} {...props}>{text}</SafeText>;
};

// Utility function for template literals
export const TemplateText = ({ template, variables, style, ...props }) => {
  let result = template;
  
  // Replace variables in template
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    result = result.replace(regex, variables[key]);
  });
  
  return <SafeText style={style} {...props}>{result}</SafeText>;
};

// Common patterns that cause the error and their fixes
export const TextErrorPatterns = {
  // ❌ Wrong: Direct string return
  wrong: () => {
    const name = "World";
    // return `Hello ${name}`; // This causes the error
    return null;
  },
  
  // ✅ Correct: Wrapped in Text component
  correct: () => {
    const name = "World";
    return <Text>{`Hello ${name}`}</Text>;
  },
  
  // ❌ Wrong: Conditional string
  wrongConditional: () => {
    const count = 5;
    // return count > 0 ? `${count} items` : 'No items'; // This causes the error
    return null;
  },
  
  // ✅ Correct: Conditional wrapped in Text
  correctConditional: () => {
    const count = 5;
    return <Text>{count > 0 ? `${count} items` : 'No items'}</Text>;
  },
  
  // ❌ Wrong: Array of strings
  wrongArray: () => {
    const items = ["Item 1", "Item 2", "Item 3"];
    // return items.map(item => item); // This causes the error
    return null;
  },
  
  // ✅ Correct: Array wrapped in Text components
  correctArray: () => {
    const items = ["Item 1", "Item 2", "Item 3"];
    return items.map((item, index) => (
      <Text key={index}>{item}</Text>
    ));
  }
};

export default SafeText;
