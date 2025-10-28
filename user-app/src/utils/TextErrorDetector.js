// TextErrorDetector.js - Advanced debugging for text rendering errors
import React from 'react';
import { Text } from 'react-native';

// Override console.error to catch text rendering errors
export const setupTextErrorDetection = () => {
  const originalConsoleError = console.error;
  
  console.error = (...args) => {
    const errorMessage = args[0];
    
    if (errorMessage && errorMessage.includes && errorMessage.includes('Text strings must be rendered within a <Text> component')) {
      console.log('\n🚨 TEXT RENDERING ERROR DETECTED!');
      console.log('🚨 Error:', errorMessage);
      console.log('🚨 Full args:', args);
      
      // Get stack trace
      const stack = new Error().stack;
      console.log('🚨 Stack trace:');
      console.log(stack);
      
      // Find the problematic file
      const stackLines = stack.split('\n');
      const userAppLines = stackLines.filter(line => 
        line.includes('user-app/src') && 
        !line.includes('node_modules')
      );
      
      if (userAppLines.length > 0) {
        console.log('🚨 Likely source files:');
        userAppLines.forEach((line, index) => {
          console.log(`   ${index + 1}. ${line.trim()}`);
        });
      }
      
      console.log('🚨 End of error details\n');
    }
    
    // Call original console.error
    originalConsoleError.apply(console, args);
  };
};

// Safe text component that prevents errors
export const SafeText = ({ children, style, ...props }) => {
  // Ensure children is always wrapped in Text
  if (typeof children === 'string' || typeof children === 'number') {
    return <Text style={style} {...props}>{children}</Text>;
  }
  
  if (React.isValidElement(children)) {
    return children;
  }
  
  if (Array.isArray(children)) {
    return children.map((child, index) => {
      if (typeof child === 'string' || typeof child === 'number') {
        return <Text key={index} style={style} {...props}>{child}</Text>;
      }
      return child;
    });
  }
  
  // Fallback
  return <Text style={style} {...props}>{children}</Text>;
};

// Debug component to wrap other components
export const withTextErrorProtection = (WrappedComponent) => {
  return class extends React.Component {
    componentDidMount() {
      setupTextErrorDetection();
    }
    
    render() {
      try {
        return <WrappedComponent {...this.props} />;
      } catch (error) {
        console.log('🚨 Error in component:', WrappedComponent.name);
        console.log('🚨 Error details:', error);
        return null;
      }
    }
  };
};

export default SafeText;
