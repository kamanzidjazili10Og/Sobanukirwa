import React from 'react';
import { View, Text, StyleSheet, Platform, Image } from 'react-native';

export default function WebHeader() {
  if (Platform.OS !== 'web') return null;
  
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoSection}>
          <Image source={require('../../assets/logo2.png')} style={styles.logoImage} resizeMode="contain" />
          <Text style={styles.title}>Sobanukirwa</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0b1a2a',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212,175,55,0.2)',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  content: {
    maxWidth: 480,
    alignSelf: 'center',
    alignItems: 'center',
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#d4af37',
    fontFamily: 'serif',
  },
});
