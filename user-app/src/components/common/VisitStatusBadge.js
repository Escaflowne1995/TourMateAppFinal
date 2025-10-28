import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeColors } from '../../utils/theme';

const VisitStatusBadge = ({ hasVisited, isVerified = false, size = 'small' }) => {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);

  if (!hasVisited) return null;

  const styles = getStyles(colors, isDarkMode, size);

  return (
    <View style={styles.badge}>
      <Ionicons 
        name={isVerified ? "checkmark-circle" : "checkmark-circle-outline"} 
        size={size === 'large' ? 16 : 12} 
        color="#4CAF50" 
      />
      <Text style={styles.text}>
        {isVerified ? 'Visited ✓' : 'Visited'}
      </Text>
    </View>
  );
};

const getStyles = (colors, isDarkMode, size) => StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDarkMode ? 'rgba(76, 175, 80, 0.2)' : 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: size === 'large' ? 8 : 6,
    paddingVertical: size === 'large' ? 4 : 2,
    borderRadius: size === 'large' ? 12 : 8,
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(76, 175, 80, 0.4)' : 'rgba(76, 175, 80, 0.3)',
  },
  text: {
    color: '#4CAF50',
    fontSize: size === 'large' ? 12 : 10,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default VisitStatusBadge;
