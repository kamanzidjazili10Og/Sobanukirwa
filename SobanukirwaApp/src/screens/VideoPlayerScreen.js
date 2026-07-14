import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, StatusBar, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import { useApp } from '../context/AppContext';
import { getMediaUrl } from '../services/api';

export default function VideoPlayerScreen({ route, navigation }) {
  const { video } = route.params;
  const { t, COLORS, stopAllMedia } = useApp();
  const videoRef = useRef(null);
  const [status, setStatus] = useState({});
  const [error, setError] = useState(false);

  const videoUrl = video.videoUrl?.startsWith('http')
    ? video.videoUrl
    : getMediaUrl(video.videoUrl);

  const { width } = Dimensions.get('window');
  const playerHeight = width * 9 / 16;

  useEffect(() => {
    stopAllMedia();
    StatusBar.setHidden(true);
    return () => StatusBar.setHidden(false);
  }, []);

  const openInBrowser = () => {
    Linking.openURL(videoUrl).catch(() => {});
  };

  return (
    <View style={styles.container}>
      <View style={[styles.videoContainer, { height: playerHeight }]}>
        {!error ? (
          <Video
            ref={videoRef}
            source={{ uri: videoUrl }}
            style={{ flex: 1 }}
            resizeMode={ResizeMode.CONTAIN}
            useNativeControls
            shouldPlay
            onPlaybackStatusUpdate={setStatus}
            onError={() => setError(true)}
          />
        ) : (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#e74c3c" />
            <Text style={styles.errorText}>{t('Video ntirashoboye gukina', 'Unable to play video', 'تعذر تشغيل الفيديو')}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={openInBrowser}>
              <Text style={styles.retryText}>{t('Fungura mu browser', 'Open in browser', 'فتح في المتصفح')}</Text>
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <View style={styles.closeBtnInner}>
            <Ionicons name="chevron-down" size={24} color="white" />
          </View>
        </TouchableOpacity>
      </View>

      <View style={[styles.info, { backgroundColor: COLORS.background }]}>
        <Text style={[styles.title, { color: COLORS.text }]}>{video.title}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  videoContainer: { width: '100%', position: 'relative' },
  closeBtn: { position: 'absolute', top: 8, left: 8, padding: 4, zIndex: 10 },
  closeBtnInner: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  info: { paddingVertical: 16, paddingHorizontal: 20 },
  title: { fontSize: 18, fontWeight: '700' },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 20 },
  errorText: { color: '#ccc', fontSize: 15, textAlign: 'center' },
  retryBtn: { backgroundColor: 'rgba(212,175,55,0.2)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(212,175,55,0.4)' },
  retryText: { color: '#d4af37', fontSize: 14, fontWeight: '600' },
});
