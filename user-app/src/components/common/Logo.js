import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Logo = ({ size = 'normal', showIcons = true }) => {
  // Calculate dimensions based on size - making them bigger
  const logoSize = size === 'large' ? 80 : size === 'small' ? 50 : 65;
  const titleSize = size === 'large' ? 42 : size === 'small' ? 26 : 34;
  const subtitleSize = size === 'large' ? 18 : size === 'small' ? 12 : 16;

  const styles = getStyles();

  return (
    <View style={styles.container}>
      {/* Logo Image */}
      {showIcons && (
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../../assets/images/logo-removebg-preview.png')}
            style={[styles.logoImage, { width: logoSize, height: logoSize }]}
            resizeMode="contain"
          />
        </View>
      )}
      
      {/* TourMate Text */}
      <Text style={[styles.title, { fontSize: titleSize }]}>TourMate</Text>
      <Text style={[styles.subtitle, { fontSize: subtitleSize }]}>Your Travel Companion</Text>
    </View>
  );
};

const getStyles = () => StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    // Logo image styling
  },
  title: {
    fontWeight: 'bold',
    color: '#ff8c42',
    letterSpacing: 2,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    color: '#ff6b1a',
    letterSpacing: 1,
    marginTop: 3,
    fontWeight: '500',
    textShadowColor: 'rgba(255, 255, 255, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
});

export default Logo; 