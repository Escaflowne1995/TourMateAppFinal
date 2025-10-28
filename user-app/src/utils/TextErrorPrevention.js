// TextErrorPrevention.js - Comprehensive solution for text rendering errors
import React from 'react';
import { Text } from 'react-native';

// Global error handler for text rendering
export const setupTextErrorPrevention = () => {
  const originalConsoleError = console.error;
  
  console.error = (...args) => {
    if (args[0] && args[0].includes && args[0].includes('Text strings must be rendered within a <Text> component')) {
      console.log('🚨 TEXT ERROR DETECTED:', args);
      console.log('🚨 Stack trace:', new Error().stack);
      
      // Try to identify the problematic component
      const stack = new Error().stack;
      const lines = stack.split('\n');
      const relevantLines = lines.filter(line => 
        line.includes('user-app/src') && 
        !line.includes('node_modules')
      );
      
      if (relevantLines.length > 0) {
        console.log('🚨 Likely source file:', relevantLines[0]);
      }
    }
    
    originalConsoleError.apply(console, args);
  };
};

// Safe text renderer that automatically wraps strings
export const SafeTextRenderer = ({ children, style, ...props }) => {
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

// Higher-order component to wrap any component with text error prevention
export const withTextErrorPrevention = (WrappedComponent) => {
  return class extends React.Component {
    componentDidMount() {
      setupTextErrorPrevention();
    }
    
    render() {
      return <WrappedComponent {...this.props} />;
    }
  };
};

// Utility to safely render conditional text
export const SafeConditionalText = ({ condition, trueText, falseText, style, ...props }) => {
  const text = condition ? trueText : falseText;
  return <SafeTextRenderer style={style} {...props}>{text}</SafeTextRenderer>;
};

// Utility to safely render template literals
export const SafeTemplateText = ({ template, variables, style, ...props }) => {
  let result = template;
  
  // Replace variables in template
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    result = result.replace(regex, variables[key]);
  });
  
  return <SafeTextRenderer style={style} {...props}>{result}</SafeTextRenderer>;
};

export default SafeTextRenderer;
