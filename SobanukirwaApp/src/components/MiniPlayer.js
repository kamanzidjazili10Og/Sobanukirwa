import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');

const C = {
  primary: '#0F766E',
  secondary: '#14B8A6',
  surface: '#FFFFFF',
  text: '#111827',
  textSec: '#6B7280',
  border: '#E5E7EB',
  bg: '#F8FAFC',
};

export default function MiniPlayer({ onPress }) {
  const { currentTrack, isPlaying, setIsPlaying } = useApp();
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.timing(spinAnim, { toValue: 1, duration: 8000, useNativeDriver: true })
      ).start();
    } else {
      spinAnim.stopAnimation();
    }
  }, [isPlaying]);

  if (!currentTrack) return null;

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.progressBar}>
        <View style={styles.progressFill} />
      </View>
      <View style={styles.content}>
        <Animated.View style={[styles.art, { borderColor: C.secondary, transform: [{ rotate: spin }] }]}>
          <Ionicons name="headset" size={18} color={C.primary} />
        </Animated.View>
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {currentTrack.title_en || currentTrack.title || 'Now Playing'}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {currentTrack.artist_name || ''}
          </Text>
        </View>
        <TouchableOpacity onPress={() => setIsPlaying(!isPlaying)} style={styles.playBtn}>
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={20} color={C.primary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute', bottom: 60, left: 8, right: 8, zIndex: 99,
    backgroundColor: C.surface,
    borderTopLeftRadius: 16, borderTopRightRadius: 16,
    borderTopWidth: 1, borderTopColor: C.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: 3, backgroundColor: C.border, width: '100%',
  },
  progressFill: {
    height: '100%', width: '35%', backgroundColor: C.secondary, borderTopRightRadius: 2,
  },
  content: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, gap: 12,
  },
  art: {
    width: 38, height: 38, borderRadius: 19, borderWidth: 2, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F0FDFA',
    overflow: 'hidden',
  },
  info: { flex: 1 },
  title: { fontSize: 13, fontWeight: '600', color: C.text },
  artist: { fontSize: 11, marginTop: 2, color: C.textSec },
  playBtn: {
    width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F0FDFA',
  },
});
