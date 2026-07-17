import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated, Dimensions, Platform, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { getMediaUrl } from '../services/api';

let Audio = null;
try { Audio = require('expo-av').Audio; } catch (e) {}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const C = {
  primary: '#0F766E',
  secondary: '#14B8A6',
  accent: '#F59E0B',
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  text: '#111827',
  textSec: '#6B7280',
  textTer: '#9CA3AF',
  border: '#E5E7EB',
};

export default function AudioPlayerScreen({ route, navigation }) {
  const { category, tracks: passedTracks, startIndex = 0 } = route.params;
  const { t, stopAllMedia, registerPauseAudio } = useApp();
  const soundRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const spinAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const tracks = passedTracks || [];
  const currentTrack = tracks[currentIndex];

  useEffect(() => {
    stopAllMedia();
    registerPauseAudio(pauseAudio);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();
    return () => {
      registerPauseAudio(null);
      if (soundRef.current) {
        try { soundRef.current.unloadAsync(); } catch(e) {}
      }
    };
  }, []);

  useEffect(() => { loadTrack(); }, [currentIndex]);

  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.timing(spinAnim, { toValue: 1, duration: 10000, useNativeDriver: true })
      ).start();
    } else {
      spinAnim.stopAnimation();
    }
  }, [isPlaying]);

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const pauseAudio = async () => {
    if (soundRef.current) { await soundRef.current.pauseAsync(); setIsPlaying(false); }
  };

  async function loadTrack() {
    if (!currentTrack) return;
    if (soundRef.current) await soundRef.current.unloadAsync();
    if (!Audio) return;
    try {
      const rawUrl = currentTrack.audio_url || currentTrack.audioUrl || '';
      const audioUrl = getMediaUrl(rawUrl) || rawUrl;
      if (!audioUrl) return;
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
            } else { nextTrack(); }
          }
        }
      });
    } catch (err) { console.log('Audio error:', err); }
  }

  async function togglePlayPause() {
    if (!soundRef.current) return;
    if (isPlaying) { await soundRef.current.pauseAsync(); setIsPlaying(false); }
    else { await soundRef.current.playAsync(); setIsPlaying(true); }
  }

  async function seekTo(millis) {
    if (soundRef.current) { await soundRef.current.setPositionAsync(millis); setPosition(millis); }
  }

  function nextTrack() {
    if (tracks.length === 0) return;
    if (shuffle) {
      let next;
      do { next = Math.floor(Math.random() * tracks.length); } while (next === currentIndex && tracks.length > 1);
      setCurrentIndex(next);
    } else if (currentIndex < tracks.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (repeatMode === 1) { setCurrentIndex(0); }
  }

  function previousTrack() {
    if (position > 3000) { seekTo(0); }
    else if (currentIndex > 0) { setCurrentIndex(currentIndex - 1); }
    else if (repeatMode === 1) { setCurrentIndex(tracks.length - 1); }
  }

  function formatTime(ms) {
    if (!ms && ms !== 0) return '0:00';
    const totalSec = Math.floor(ms / 1000);
    if (!isFinite(totalSec)) return '0:00';
    return `${Math.floor(totalSec / 60)}:${(totalSec % 60).toString().padStart(2, '0')}`;
  }

  const progress = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <ImageBackground source={require('../../assets/bg-videos.jpg')} style={styles.bgImage} resizeMode="cover">
      <View style={styles.overlay} />
      <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.topBar, { opacity: fadeAnim }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.topBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.topCenter}>
          <Text style={styles.topTitle}>
            {t('Urwego rw\'Inyigisho', 'Now Playing', 'يتم التشغيل')}
          </Text>
          <Text style={styles.topSub}>
            {category || t('Inyigisho', 'Lessons', 'الدروس')}
          </Text>
        </View>
        <TouchableOpacity style={styles.topBtn}>
          <Ionicons name="ellipsis-horizontal" size={22} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[styles.artSection, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.artGlow} />
        <View style={styles.artOuterRing} />
        <Animated.View style={[styles.artDisc, { transform: [{ rotate: spin }] }]}>
          <View style={styles.artDiscInner}>
            <Ionicons name="headset" size={48} color={C.secondary} />
          </View>
        </Animated.View>
        <View style={styles.artCenterDot} />
      </Animated.View>

      <Animated.View style={[styles.trackInfoSection, { opacity: fadeAnim }]}>
        <View style={styles.trackInfoCard}>
          <Text style={styles.trackTitle} numberOfLines={2}>
            {currentTrack?.title || t('Hitamo inyigisho', 'Select a lesson', 'اختر درساً')}
          </Text>
          <Text style={styles.trackArtist}>
            {currentTrack ? (currentTrack.artist_name || currentTrack.artist || category) : ''}
          </Text>
        </View>
      </Animated.View>

      <View style={styles.progressSection}>
        <TouchableOpacity
          style={styles.progressBarTouch}
          onPress={(e) => {
            if (duration > 0) {
              const barWidth = SCREEN_WIDTH - 60;
              const pct = Math.max(0, Math.min(1, e.nativeEvent.locationX / barWidth));
              seekTo(pct * duration);
            }
          }}
        >
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
            {duration > 0 && (
              <View style={[styles.progressThumb, { left: `${progress}%` }]} />
            )}
          </View>
        </TouchableOpacity>
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <Text style={styles.timeText}>
            {duration > 0 ? formatTime(duration) : '0:00'}
          </Text>
        </View>
      </View>

      <View style={styles.controlsSection}>
        <TouchableOpacity onPress={() => setShuffle(!shuffle)} style={styles.ctrlBtn}>
          <Ionicons name="shuffle" size={20} color={shuffle ? '#5EEAD4' : 'rgba(255,255,255,0.5)'} />
        </TouchableOpacity>
        <TouchableOpacity onPress={previousTrack} style={styles.ctrlBtn}>
          <Ionicons name="play-skip-back" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.playBtn} onPress={togglePlayPause}>
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={32} color="#FFFFFF" style={!isPlaying ? { marginLeft: 3 } : {}} />
        </TouchableOpacity>
        <TouchableOpacity onPress={nextTrack} style={styles.ctrlBtn}>
          <Ionicons name="play-skip-forward" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setRepeatMode((repeatMode + 1) % 3)} style={styles.ctrlBtn}>
          <Ionicons name="repeat" size={20} color={repeatMode > 0 ? '#5EEAD4' : 'rgba(255,255,255,0.5)'} />
          {repeatMode === 2 && <Text style={styles.repeatBadge}>1</Text>}
        </TouchableOpacity>
      </View>

      <View style={styles.volumeSection}>
        <Ionicons name="volume-low" size={14} color="rgba(255,255,255,0.5)" />
        <TouchableOpacity
          style={styles.volumeBar}
          onPress={(e) => {
            const barWidth = SCREEN_WIDTH - 120;
            const pct = Math.max(0, Math.min(1, e.nativeEvent.locationX / barWidth));
            setVolume(pct);
            if (soundRef.current) soundRef.current.setVolumeAsync(pct);
          }}
        >
          <View style={[styles.volumeFill, { width: `${volume * 100}%` }]} />
        </TouchableOpacity>
        <Ionicons name="volume-high" size={14} color="rgba(255,255,255,0.5)" />
      </View>

      <View style={styles.playlistSection}>
        <View style={styles.playlistHeader}>
          <Text style={styles.playlistTitle}>
            {t('Urutonde', 'Playlist', 'قائمة التشغيل')}
          </Text>
          <Text style={styles.playlistCount}>
            {tracks.length} {t('inyigisho', 'tracks', 'مقطع')}
          </Text>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          {tracks.map((track, index) => (
            <TouchableOpacity
              key={track.id || index}
              style={[
                styles.playlistItem,
                index === currentIndex && styles.playlistItemActive
              ]}
              onPress={() => setCurrentIndex(index)}
            >
              <View style={[styles.plNumWrap, {
                backgroundColor: index === currentIndex ? C.secondary : 'rgba(20,184,166,0.15)',
              }]}>
                {index === currentIndex && isPlaying ? (
                  <Ionicons name="volume-high" size={12} color="#FFFFFF" />
                ) : (
                  <Text style={[styles.plNum, { color: index === currentIndex ? '#FFFFFF' : '#5EEAD4' }]}>{index + 1}</Text>
                )}
              </View>
              <View style={styles.plInfo}>
                <Text style={[styles.plTitle, { color: index === currentIndex ? C.primary : C.text }]} numberOfLines={1}>
                  {track.title}
                </Text>
                <Text style={styles.plArtist} numberOfLines={1}>
                  {track.artist_name || track.artist || ''}
                </Text>
              </View>
              {index === currentIndex && (
                <View style={styles.plNowPlaying}>
                  <View style={[styles.npBar, { backgroundColor: '#5EEAD4' }]} />
                  <View style={[styles.npBar2, { backgroundColor: '#5EEAD4' }]} />
                  <View style={[styles.npBar, { backgroundColor: '#5EEAD4' }]} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6, 48, 44, 0.55)',
  },
  container: { flex: 1, backgroundColor: 'transparent' },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, backgroundColor: 'rgba(0,0,0,0.3)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  topBtn: { padding: 12 },
  topCenter: { flex: 1, alignItems: 'center' },
  topTitle: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  topSub: { fontSize: 11, marginTop: 2, color: 'rgba(255,255,255,0.6)' },
  artSection: { alignItems: 'center', marginVertical: 20, position: 'relative' },
  artGlow: { position: 'absolute', width: 240, height: 240, borderRadius: 120, backgroundColor: 'rgba(20,184,166,0.15)', opacity: 0.4 },
  artOuterRing: { position: 'absolute', width: 220, height: 220, borderRadius: 110, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)' },
  artDisc: { width: 200, height: 200, borderRadius: 100, borderWidth: 3, borderColor: C.secondary, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center', shadowColor: C.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 6, overflow: 'hidden' },
  artDiscInner: { width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(0,0,0,0.2)', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  artCenterDot: { position: 'absolute', width: 12, height: 12, borderRadius: 6, backgroundColor: '#5EEAD4' },
  trackInfoSection: { paddingHorizontal: 20, alignItems: 'center', marginBottom: 16 },
  trackInfoCard: { backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 20, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  trackTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', textAlign: 'center', lineHeight: 26 },
  trackArtist: { fontSize: 13, marginTop: 6, fontWeight: '500', color: '#5EEAD4' },
  progressSection: { paddingHorizontal: 30, marginBottom: 10 },
  progressBarTouch: { paddingVertical: 8 },
  progressBar: { height: 5, borderRadius: 2.5, backgroundColor: 'rgba(255,255,255,0.15)', overflow: 'visible', position: 'relative' },
  progressFill: { height: '100%', borderRadius: 2.5, backgroundColor: C.secondary },
  progressThumb: { width: 14, height: 14, borderRadius: 7, position: 'absolute', top: -4.5, marginLeft: -7, borderWidth: 2, borderColor: 'rgba(255,255,255,0.8)', backgroundColor: C.secondary, shadowColor: C.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  timeText: { fontSize: 11, fontVariant: ['tabular-nums'], color: 'rgba(255,255,255,0.6)' },
  controlsSection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 10 },
  ctrlBtn: { padding: 8, position: 'relative' },
  repeatBadge: { position: 'absolute', top: 2, right: 0, fontSize: 9, fontWeight: '800', color: '#5EEAD4' },
  playBtn: { width: 66, height: 66, borderRadius: 33, alignItems: 'center', justifyContent: 'center', backgroundColor: C.secondary, elevation: 10, shadowColor: C.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 14 },
  volumeSection: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 30, marginBottom: 6 },
  volumeBar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.15)', overflow: 'hidden' },
  volumeFill: { height: '100%', borderRadius: 2, backgroundColor: C.secondary },
  playlistSection: { flex: 1, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 10, backgroundColor: 'rgba(0,0,0,0.2)' },
  playlistHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 8 },
  playlistTitle: { fontSize: 15, fontWeight: '700', color: '#5EEAD4' },
  playlistCount: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  playlistItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 12, borderWidth: 1, borderRadius: 12, marginHorizontal: 12, marginBottom: 4, borderColor: 'rgba(255,255,255,0.08)' },
  playlistItemActive: { backgroundColor: 'rgba(0,0,0,0.25)', borderColor: 'rgba(20,184,166,0.4)' },
  plNumWrap: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(20,184,166,0.15)' },
  plNum: { fontSize: 11, fontWeight: '700' },
  plInfo: { flex: 1 },
  plTitle: { fontSize: 14, fontWeight: '500', color: '#FFFFFF' },
  plArtist: { fontSize: 11, marginTop: 2, color: 'rgba(255,255,255,0.5)' },
  plNowPlaying: { flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: 16 },
  npBar: { width: 3, height: 16, borderRadius: 1.5 },
  npBar2: { width: 3, height: 10, borderRadius: 1.5 },
});
