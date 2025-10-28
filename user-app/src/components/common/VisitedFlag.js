import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeColors } from '../../utils/theme';

const VisitedFlag = ({ hasVisited, isVerified = false, size = 'medium' }) => {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);

  if (!hasVisited) return null;

  const styles = getStyles(colors, isDarkMode, size);

  return (
    <View style={styles.flagContainer}>
      <Ionicons 
        name="flag" 
        size={size === 'large' ? 16 : 12} 
        color="#fff" 
      />
      <Text style={styles.flagText}>VISITED</Text>
      {isVerified && (
        <Ionicons 
          name="checkmark-circle" 
          size={size === 'large' ? 12 : 8} 
          color="#4CAF50" 
          style={styles.verifiedIcon}
        />
      )}
    </View>
  );
};

const getStyles = (colors, isDarkMode, size) => StyleSheet.create({
  flagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    paddingHorizontal: size === 'large' ? 10 : 6,
    paddingVertical: size === 'large' ? 6 : 4,
    borderRadius: size === 'large' ? 15 : 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  flagText: {
    color: '#fff',
    fontSize: size === 'large' ? 12 : 10,
    fontWeight: 'bold',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  verifiedIcon: {
    marginLeft: 4,
  },
});

export default VisitedFlag;
