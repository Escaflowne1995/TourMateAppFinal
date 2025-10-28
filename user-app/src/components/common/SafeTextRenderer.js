// SafeTextRenderer.js - Universal text renderer that prevents text errors
import React from 'react';
import { Text } from 'react-native';

// Universal safe text renderer
export const SafeTextRenderer = ({ children, style, ...props }) => {
  // Handle different types of children
  if (children === null || children === undefined) {
    return null;
  }
  
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
  
  // Fallback for any other type
  return <Text style={style} {...props}>{String(children)}</Text>;
};

// Safe conditional text renderer
export const SafeConditionalText = ({ condition, trueText, falseText, style, ...props }) => {
  const text = condition ? trueText : falseText;
  return <SafeTextRenderer style={style} {...props}>{text}</SafeTextRenderer>;
};

// Safe template text renderer
export const SafeTemplateText = ({ template, variables = {}, style, ...props }) => {
  let result = template;
  
  // Replace variables in template
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    result = result.replace(regex, variables[key]);
  });
  
  return <SafeTextRenderer style={style} {...props}>{result}</SafeTextRenderer>;
};

export default SafeTextRenderer;
