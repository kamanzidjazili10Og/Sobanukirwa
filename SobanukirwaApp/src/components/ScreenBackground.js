import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';

const BACKGROUNDS = {
  'bg-home': require('../../assets/bg-home.jpg'),
  'bg-prayer': require('../../assets/bg-prayer.jpg'),
  'bg-quran': require('../../assets/bg-quran.jpg'),
  'bg-audio': require('../../assets/bg-audio.jpg'),
  'bg-videos': require('../../assets/bg-videos.jpg'),
  'bg-about': require('../../assets/bg-about.jpg'),
  'bg-loading': require('../../assets/bg-loading.jpg'),
  'bg-qibla': require('../../assets/bg-qibla.jpg'),
  'bg-settings': require('../../assets/bg-quran.jpg'),
  'bg-adhkar': require('../../assets/bg-audio.jpg'),
};

export default function ScreenBackground({ imageKey, children, style }) {
  const image = BACKGROUNDS[imageKey] || BACKGROUNDS['bg-home'];
  return (
    <ImageBackground source={image} style={[styles.container, style]} resizeMode="cover">
      <View style={styles.overlay}>
        {children}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(11,26,42,0.75)' },
});
