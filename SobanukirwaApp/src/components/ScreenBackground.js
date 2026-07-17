import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const BACKGROUNDS = {
  'bg-home': require('../../assets/bg-home.jpg'),
  'bg-prayer': require('../../assets/bg-prayer.jpg'),
  'bg-quran': require('../../assets/seven.jpg'),
  'bg-audio': require('../../assets/bg-audio.jpg'),
  'bg-videos': require('../../assets/nine.jpg'),
  'bg-about': require('../../assets/bg-about.jpg'),
  'bg-loading': require('../../assets/splash.png'),
  'bg-qibla': require('../../assets/bg-qibla.jpg'),
  'bg-settings': require('../../assets/bg-loading.jpg'),
  'bg-adhkar': require('../../assets/seven.jpg'),
  'bg-books': require('../../assets/qoran.jpg'),
};

export default function ScreenBackground({ imageKey, children, style }) {
  const image = BACKGROUNDS[imageKey] || BACKGROUNDS['bg-home'];
  return (
    <ImageBackground source={image} style={[styles.container, style]} resizeMode="cover">
      <LinearGradient
        colors={['rgba(11,26,42,0.82)', 'rgba(0,0,0,0.6)']}
        style={styles.overlay}
      >
        {children}
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: {
    flex: 1,
  },
});
