import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');

export default function MiniPlayer({ onPress }) {
  const { currentTrack, isPlaying, setIsPlaying, COLORS } = useApp();
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
      style={[styles.container, { backgroundColor: COLORS.primaryDark, borderTopColor: COLORS.border }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Animated.View style={[styles.art, { borderColor: COLORS.secondary, transform: [{ rotate: spin }] }]}>
        <Ionicons name="headset" size={20} color={COLORS.secondary} />
      </Animated.View>
      <View style={styles.info}>
        <Text style={[styles.title, { color: COLORS.text }]} numberOfLines={1}>
          {currentTrack.title_en || currentTrack.title || 'Now Playing'}
        </Text>
        <Text style={[styles.artist, { color: COLORS.secondary }]} numberOfLines={1}>
          {currentTrack.artist_name || ''}
        </Text>
      </View>
      <TouchableOpacity onPress={() => setIsPlaying(!isPlaying)} style={styles.playBtn}>
        <Ionicons name={isPlaying ? 'pause' : 'play'} size={22} color={COLORS.secondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute', bottom: 60, left: 0, right: 0, zIndex: 99,
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, gap: 12,
    borderTopWidth: 1,
  },
  art: {
    width: 40, height: 40, borderRadius: 20, borderWidth: 2, alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  info: { flex: 1 },
  title: { fontSize: 13, fontWeight: '600' },
  artist: { fontSize: 11, marginTop: 2 },
  playBtn: { padding: 8 },
});
