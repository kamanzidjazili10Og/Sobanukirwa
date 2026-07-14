import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useApp } from '../context/AppContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function AudioPlayerScreen({ route, navigation }) {
  const { category, tracks: passedTracks, startIndex = 0 } = route.params;
  const { t, COLORS, stopAllMedia, registerPauseAudio } = useApp();
  const soundRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState(0);
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
    try {
      const audioUrl = currentTrack.audio_url || currentTrack.audioUrl || '';
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
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      <View style={[styles.topBar, { borderBottomColor: COLORS.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.topBtn}>
          <Ionicons name="chevron-down" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.topCenter}>
          <Text style={[styles.topTitle, { color: COLORS.secondary }]}>
            {t('Urwego rw\'Inyigisho', 'Now Playing', 'يتم التشغيل')}
          </Text>
          <Text style={[styles.topSub, { color: COLORS.textMuted }]}>
            {category || t('Inyigisho', 'Lessons', 'الدروس')}
          </Text>
        </View>
        <TouchableOpacity style={styles.topBtn}>
          <Ionicons name="ellipsis-horizontal" size={22} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      <View style={styles.artSection}>
        <View style={[styles.artOuterRing, { borderColor: 'rgba(212,175,55,0.1)' }]} />
        <Animated.View style={[styles.artDisc, { backgroundColor: COLORS.surface, borderColor: COLORS.secondary, transform: [{ rotate: spin }] }]}>
          <View style={[styles.artDiscInner, { backgroundColor: 'rgba(212,175,55,0.06)' }]}>
            <Ionicons name="headset" size={48} color={COLORS.secondary} />
          </View>
        </Animated.View>
        <View style={[styles.artCenterDot, { backgroundColor: COLORS.secondary }]} />
      </View>

      <View style={styles.trackInfoSection}>
        <Text style={[styles.trackTitle, { color: COLORS.text }]} numberOfLines={2}>
          {currentTrack?.title || t('Hitamo inyigisho', 'Select a lesson', 'اختر درساً')}
        </Text>
        <Text style={[styles.trackArtist, { color: COLORS.secondary }]}>
          {currentTrack ? (currentTrack.artist_name || currentTrack.artist || category) : ''}
        </Text>
      </View>

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
          <View style={[styles.progressBar, { backgroundColor: 'rgba(212,175,55,0.12)' }]}>
            <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: COLORS.secondary }]} />
            {duration > 0 && (
              <View style={[styles.progressThumb, { left: `${progress}%`, backgroundColor: COLORS.secondary }]} />
            )}
          </View>
        </TouchableOpacity>
        <View style={styles.timeRow}>
          <Text style={[styles.timeText, { color: COLORS.textMuted }]}>{formatTime(position)}</Text>
          <Text style={[styles.timeText, { color: COLORS.textMuted }]}>
            {duration > 0 ? formatTime(duration) : '0:00'}
          </Text>
        </View>
      </View>

      <View style={styles.controlsSection}>
        <TouchableOpacity onPress={() => setShuffle(!shuffle)} style={styles.ctrlBtn}>
          <Ionicons name="shuffle" size={20} color={shuffle ? COLORS.secondary : COLORS.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity onPress={previousTrack} style={styles.ctrlBtn}>
          <Ionicons name="play-skip-back" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.playBtn, { backgroundColor: COLORS.secondary }]} onPress={togglePlayPause}>
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={32} color={COLORS.primaryDark} style={!isPlaying ? { marginLeft: 3 } : {}} />
        </TouchableOpacity>
        <TouchableOpacity onPress={nextTrack} style={styles.ctrlBtn}>
          <Ionicons name="play-skip-forward" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setRepeatMode((repeatMode + 1) % 3)} style={styles.ctrlBtn}>
          <Ionicons name="repeat" size={20} color={repeatMode > 0 ? COLORS.secondary : COLORS.textMuted} />
          {repeatMode === 2 && <Text style={[styles.repeatBadge, { color: COLORS.secondary }]}>1</Text>}
        </TouchableOpacity>
      </View>

      <View style={styles.volumeSection}>
        <Ionicons name="volume-low" size={14} color={COLORS.textMuted} />
        <TouchableOpacity
          style={[styles.volumeBar, { backgroundColor: 'rgba(212,175,55,0.12)' }]}
          onPress={(e) => {
            const barWidth = SCREEN_WIDTH - 120;
            const pct = Math.max(0, Math.min(1, e.nativeEvent.locationX / barWidth));
            setVolume(pct);
            if (soundRef.current) soundRef.current.setVolumeAsync(pct);
          }}
        >
          <View style={[styles.volumeFill, { width: `${volume * 100}%`, backgroundColor: COLORS.secondary }]} />
        </TouchableOpacity>
        <Ionicons name="volume-high" size={14} color={COLORS.textMuted} />
      </View>

      <View style={[styles.playlistSection, { borderTopColor: COLORS.border }]}>
        <View style={styles.playlistHeader}>
          <Text style={[styles.playlistTitle, { color: COLORS.secondary }]}>
            {t('Urutonde', 'Playlist', 'قائمة التشغيل')}
          </Text>
          <Text style={[styles.playlistCount, { color: COLORS.textMuted }]}>
            {tracks.length} {t('inyigisho', 'tracks', 'مقطع')}
          </Text>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          {tracks.map((track, index) => (
            <TouchableOpacity
              key={track.id || index}
              style={[
                styles.playlistItem,
                { backgroundColor: index === currentIndex ? 'rgba(212,175,55,0.1)' : 'transparent', borderColor: index === currentIndex ? 'rgba(212,175,55,0.3)' : 'transparent' }
              ]}
              onPress={() => setCurrentIndex(index)}
            >
              <View style={[styles.plNumWrap, {
                backgroundColor: index === currentIndex ? COLORS.secondary : 'rgba(212,175,55,0.08)',
              }]}>
                {index === currentIndex && isPlaying ? (
                  <Ionicons name="volume-high" size={12} color={COLORS.primaryDark} />
                ) : (
                  <Text style={[styles.plNum, { color: index === currentIndex ? COLORS.primaryDark : COLORS.secondary }]}>{index + 1}</Text>
                )}
              </View>
              <View style={styles.plInfo}>
                <Text style={[styles.plTitle, { color: index === currentIndex ? COLORS.secondary : COLORS.text }]} numberOfLines={1}>
                  {track.title}
                </Text>
                <Text style={[styles.plArtist, { color: COLORS.textMuted }]} numberOfLines={1}>
                  {track.artist_name || track.artist || ''}
                </Text>
              </View>
              {index === currentIndex && (
                <View style={styles.plNowPlaying}>
                  <View style={[styles.npBar, { backgroundColor: COLORS.secondary }]} />
                  <View style={[styles.npBar2, { backgroundColor: COLORS.secondary, height: 10 }]} />
                  <View style={[styles.npBar, { backgroundColor: COLORS.secondary }]} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderBottomWidth: 1 },
  topBtn: { padding: 12 },
  topCenter: { flex: 1, alignItems: 'center' },
  topTitle: { fontSize: 13, fontWeight: '700' },
  topSub: { fontSize: 11, marginTop: 2 },
  artSection: { alignItems: 'center', marginVertical: 20, position: 'relative' },
  artOuterRing: { position: 'absolute', width: 200, height: 200, borderRadius: 100, borderWidth: 1 },
  artDisc: { width: 180, height: 180, borderRadius: 90, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  artDiscInner: { width: 140, height: 140, borderRadius: 70, alignItems: 'center', justifyContent: 'center' },
  artCenterDot: { position: 'absolute', width: 12, height: 12, borderRadius: 6 },
  trackInfoSection: { paddingHorizontal: 30, alignItems: 'center', marginBottom: 20 },
  trackTitle: { fontSize: 20, fontWeight: '700', textAlign: 'center', lineHeight: 28 },
  trackArtist: { fontSize: 14, marginTop: 6, fontWeight: '500' },
  progressSection: { paddingHorizontal: 30, marginBottom: 14 },
  progressBarTouch: { paddingVertical: 8 },
  progressBar: { height: 5, borderRadius: 2.5, overflow: 'visible', position: 'relative' },
  progressFill: { height: '100%', borderRadius: 2.5 },
  progressThumb: { width: 14, height: 14, borderRadius: 7, position: 'absolute', top: -4.5, marginLeft: -7, borderWidth: 2, borderColor: '#fff' },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  timeText: { fontSize: 11, fontVariant: ['tabular-nums'] },
  controlsSection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 12 },
  ctrlBtn: { padding: 8, position: 'relative' },
  repeatBadge: { position: 'absolute', top: 2, right: 0, fontSize: 9, fontWeight: '800' },
  playBtn: { width: 66, height: 66, borderRadius: 33, alignItems: 'center', justifyContent: 'center', elevation: 10, shadowColor: '#d4af37', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 14 },
  volumeSection: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 30, marginBottom: 8 },
  volumeBar: { flex: 1, height: 4, borderRadius: 2, overflow: 'hidden' },
  volumeFill: { height: '100%', borderRadius: 2 },
  playlistSection: { flex: 1, borderTopWidth: 1, paddingTop: 12 },
  playlistHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 8 },
  playlistTitle: { fontSize: 15, fontWeight: '700' },
  playlistCount: { fontSize: 12 },
  playlistItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, gap: 12, borderWidth: 1, borderRadius: 12, marginHorizontal: 12, marginBottom: 4 },
  plNumWrap: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  plNum: { fontSize: 11, fontWeight: '700' },
  plInfo: { flex: 1 },
  plTitle: { fontSize: 14, fontWeight: '500' },
  plArtist: { fontSize: 11, marginTop: 2 },
  plNowPlaying: { flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: 16 },
  npBar: { width: 3, height: 16, borderRadius: 1.5 },
  npBar2: { width: 3, borderRadius: 1.5 },
});
