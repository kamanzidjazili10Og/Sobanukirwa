import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated, PanResponder } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useApp } from '../context/AppContext';

export default function AudioPlayerScreen({ route, navigation }) {
  const { category, tracks: passedTracks, startIndex = 0 } = route.params;
  const { t, COLORS, stopAllMedia, registerPauseAudio } = useApp();
  const soundRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState(0); // 0=off, 1=all, 2=one
  const [volume, setVolume] = useState(0.8);
  const spinAnim = useRef(new Animated.Value(0)).current;

  const tracks = passedTracks || [];
  const currentTrack = tracks[currentIndex];

  useEffect(() => {
    stopAllMedia();
    registerPauseAudio(pauseAudio);
    return () => {
      registerPauseAudio(null);
      if (soundRef.current) soundRef.current.unloadAsync();
    };
  }, []);

  useEffect(() => {
    loadTrack();
  }, [currentIndex]);

  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.timing(spinAnim, { toValue: 1, duration: 8000, useNativeDriver: true })
      ).start();
    } else {
      spinAnim.stopAnimation();
    }
  }, [isPlaying]);

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const pauseAudio = async () => {
    if (soundRef.current) {
      await soundRef.current.pauseAsync();
      setIsPlaying(false);
    }
  };

  async function loadTrack() {
    if (!currentTrack) return;
    if (soundRef.current) await soundRef.current.unloadAsync();
    try {
      const audioUrl = currentTrack.audio_url || currentTrack.audioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true, volume }
      );
      soundRef.current = sound;
      setIsPlaying(true);
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setPosition(status.positionMillis);
          setDuration(status.durationMillis || 0);
          if (status.didJustFinish) {
            if (repeatMode === 2) {
              sound.setPositionAsync(0);
              sound.playAsync();
            } else {
              nextTrack();
            }
          }
        }
      });
    } catch (err) {
      console.log('Audio load error:', err);
    }
  }

  async function togglePlayPause() {
    if (!soundRef.current) return;
    if (isPlaying) {
      await soundRef.current.pauseAsync();
      setIsPlaying(false);
    } else {
      await soundRef.current.playAsync();
      setIsPlaying(true);
    }
  }

  async function seekTo(millis) {
    if (soundRef.current) {
      await soundRef.current.setPositionAsync(millis);
      setPosition(millis);
    }
  }

  function nextTrack() {
    if (tracks.length === 0) return;
    if (shuffle) {
      let next;
      do { next = Math.floor(Math.random() * tracks.length); } while (next === currentIndex && tracks.length > 1);
      setCurrentIndex(next);
    } else if (currentIndex < tracks.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (repeatMode === 1) {
      setCurrentIndex(0);
    }
  }

  function previousTrack() {
    if (position > 3000) {
      seekTo(0);
    } else if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (repeatMode === 1) {
      setCurrentIndex(tracks.length - 1);
    }
  }

  function cycleRepeat() {
    setRepeatMode((repeatMode + 1) % 3);
  }

  async function changeVolume(val) {
    setVolume(val);
    if (soundRef.current) await soundRef.current.setVolumeAsync(val);
  }

  function formatTime(ms) {
    if (!ms && ms !== 0) return '0:00';
    const totalSec = Math.floor(ms / 1000);
    if (!isFinite(totalSec)) return '0:00';
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  }

  const progress = duration > 0 ? (position / duration) * 100 : 0;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX } = evt.nativeEvent;
        const barWidth = 300;
        const pct = Math.max(0, Math.min(1, locationX / barWidth));
        seekTo(pct * duration);
      },
      onPanResponderMove: (evt) => {
        const { locationX } = evt.nativeEvent;
        const barWidth = 300;
        const pct = Math.max(0, Math.min(1, locationX / barWidth));
        setPosition(pct * duration);
      },
      onPanResponderRelease: (evt) => {
        const { locationX } = evt.nativeEvent;
        const barWidth = 300;
        const pct = Math.max(0, Math.min(1, locationX / barWidth));
        seekTo(pct * duration);
      },
    })
  ).current;

  const repeatIcons = { 0: 'repeat', 1: 'repeat', 2: 'repeat' };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-down" size={28} color={COLORS.text} />
      </TouchableOpacity>

      <View style={styles.playerArt}>
        <Animated.View style={[styles.artCircle, { backgroundColor: COLORS.surface, borderColor: COLORS.secondary, transform: [{ rotate: spin }] }]}>
          <Ionicons name="headset" size={60} color={COLORS.secondary} />
        </Animated.View>
      </View>

      <View style={styles.trackInfo}>
        <Text style={[styles.trackTitle, { color: COLORS.text }]} numberOfLines={2}>
          {currentTrack?.title || t('Hitamo inyigisho', 'Select a lesson', 'اختر درساً')}
        </Text>
        <Text style={[styles.categoryName, { color: COLORS.textMuted }]}>
          {currentTrack ? (currentTrack.artist_name || currentTrack.artist || category) : ''}
        </Text>
      </View>

      <View style={styles.progressSection}>
        <View
          style={[styles.progressBar, { backgroundColor: 'rgba(255,255,255,0.12)' }]}
          {...panResponder.panHandlers}
        >
          <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: COLORS.secondary }]} />
          <View style={[styles.progressThumb, { left: `${progress}%`, backgroundColor: COLORS.secondary }]} />
        </View>
        <View style={styles.timeRow}>
          <Text style={{ color: COLORS.textMuted, fontSize: 12, fontVariant: ['tabular-nums'] }}>
            {duration > 0 ? formatTime(position) : '0:00'}
          </Text>
          <Text style={{ color: COLORS.textMuted, fontSize: 12, fontVariant: ['tabular-nums'] }}>
            {duration > 0 ? formatTime(duration) : '0:00'}
          </Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity onPress={() => setShuffle(!shuffle)} style={styles.ctrlBtn}>
          <Ionicons name="shuffle" size={20} color={shuffle ? COLORS.secondary : COLORS.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity onPress={previousTrack} style={styles.ctrlBtn}>
          <Ionicons name="play-skip-back" size={26} color={COLORS.text} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.playBtn, { backgroundColor: COLORS.secondary }]} onPress={togglePlayPause}>
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={32} color={COLORS.primaryDark} />
        </TouchableOpacity>
        <TouchableOpacity onPress={nextTrack} style={styles.ctrlBtn}>
          <Ionicons name="play-skip-forward" size={26} color={COLORS.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={cycleRepeat} style={styles.ctrlBtn}>
          <Ionicons name={repeatIcons[repeatMode]} size={20} color={repeatMode > 0 ? COLORS.secondary : COLORS.textMuted} />
          {repeatMode === 2 && <Text style={[styles.repeatBadge, { color: COLORS.secondary }]}>1</Text>}
        </TouchableOpacity>
      </View>

      <View style={styles.volumeSection}>
        <Ionicons name="volume-low" size={16} color={COLORS.textMuted} />
        <View style={[styles.volumeBar, { backgroundColor: 'rgba(255,255,255,0.12)' }]}>
          <View style={[styles.volumeFill, { width: `${volume * 100}%`, backgroundColor: COLORS.secondary }]} />
        </View>
        <Ionicons name="volume-high" size={16} color={COLORS.textMuted} />
      </View>

      <ScrollView style={styles.playlist} contentContainerStyle={{ gap: 8 }} showsVerticalScrollIndicator={false}>
        <Text style={[styles.playlistTitle, { color: COLORS.secondary }]}>
          {t('Urutonde', 'Playlist', 'قائمة التشغيل')} ({tracks.length})
        </Text>
        {tracks.map((track, index) => (
          <TouchableOpacity
            key={track.id || index}
            style={[
              styles.playlistItem,
              { backgroundColor: index === currentIndex ? 'rgba(212,175,55,0.15)' : COLORS.surface, borderColor: index === currentIndex ? COLORS.secondary : COLORS.border }
            ]}
            onPress={() => setCurrentIndex(index)}
          >
            <Text style={[styles.playlistNumber, { color: COLORS.textMuted }]}>{index + 1}.</Text>
            <View style={styles.playlistInfo}>
              <Text style={[styles.playlistTrack, { color: index === currentIndex ? COLORS.secondary : COLORS.text }]} numberOfLines={1}>
                {track.title}
              </Text>
              <View style={styles.playlistMeta}>
                <Text style={[styles.playlistArtist, { color: COLORS.textMuted }]} numberOfLines={1}>
                  {track.artist_name || track.artist || ''}
                </Text>
                {track.duration && (
                  <Text style={[styles.playlistDuration, { color: COLORS.textMuted }]}>{track.duration}</Text>
                )}
              </View>
            </View>
            {index === currentIndex && (
              <Ionicons name={isPlaying ? 'volume-high' : 'pause'} size={16} color={COLORS.secondary} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { padding: 20, paddingBottom: 0 },
  playerArt: { alignItems: 'center', marginVertical: 24 },
  artCircle: { width: 180, height: 180, borderRadius: 90, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  trackInfo: { paddingHorizontal: 30, alignItems: 'center', marginBottom: 24 },
  trackTitle: { fontSize: 22, fontWeight: '700', textAlign: 'center' },
  categoryName: { fontSize: 15, marginTop: 6, letterSpacing: 0.3 },
  progressSection: { paddingHorizontal: 30, marginBottom: 16 },
  progressBar: { height: 6, borderRadius: 3, overflow: 'visible', position: 'relative' },
  progressFill: { height: '100%', borderRadius: 3 },
  progressThumb: { width: 14, height: 14, borderRadius: 7, position: 'absolute', top: -4, marginLeft: -7 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24, marginBottom: 16 },
  ctrlBtn: { padding: 8, position: 'relative' },
  repeatBadge: { position: 'absolute', top: 2, right: 0, fontSize: 9, fontWeight: '800' },
  playBtn: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', shadowColor: '#d4af37', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  volumeSection: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 30, marginBottom: 16 },
  volumeBar: { flex: 1, height: 4, borderRadius: 2, overflow: 'hidden' },
  volumeFill: { height: '100%', borderRadius: 2 },
  playlist: { flex: 1, paddingHorizontal: 20 },
  playlistTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
  playlistItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, gap: 10 },
  playlistNumber: { width: 24, fontSize: 13 },
  playlistInfo: { flex: 1 },
  playlistTrack: { fontSize: 14, fontWeight: '500' },
  playlistMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  playlistArtist: { fontSize: 11, marginTop: 2, flex: 1 },
  playlistDuration: { fontSize: 11, marginTop: 2 },
});
