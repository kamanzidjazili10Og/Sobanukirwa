import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, StatusBar, Linking, Platform, ActivityIndicator } from 'react-native';
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
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

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

  const handleRetry = () => {
    setError(false);
    setLoading(true);
    setRetryCount(c => c + 1);
  };

  const openInBrowser = () => {
    Linking.openURL(videoUrl).catch(() => {});
  };

  return (
    <View style={styles.container}>
      <View style={[styles.videoContainer, { height: playerHeight }]}>
        {!error ? (
          <>
            {loading && (
              <View style={styles.loadingWrap}>
                <ActivityIndicator size="large" color="#d4af37" />
                <Text style={styles.loadingText}>{t('Gutegura video...', 'Loading video...', 'جاري تحميل الفيديو...')}</Text>
              </View>
            )}
            <Video
              ref={videoRef}
              source={{ uri: videoUrl }}
              style={{ flex: 1 }}
              resizeMode={ResizeMode.CONTAIN}
              useNativeControls
              shouldPlay
              onPlaybackStatusUpdate={(s) => {
                setStatus(s);
                if (s.isLoaded) setLoading(false);
              }}
              onError={() => {
                setError(true);
                setLoading(false);
              }}
              onLoadStart={() => setLoading(true)}
              key={retryCount}
            />
          </>
        ) : (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#e74c3c" />
            <Text style={[styles.errorTitle, { color: COLORS.text }]}>{video.title}</Text>
            <Text style={styles.errorText}>{t('Video ntirashoboye gukina', 'Unable to play video', 'تعذر تشغيل الفيديو')}</Text>
            <Text style={styles.errorUrl} numberOfLines={2}>{videoUrl}</Text>
            <View style={styles.errorBtns}>
              <TouchableOpacity style={styles.retryBtn} onPress={handleRetry}>
                <Ionicons name="refresh" size={18} color="#d4af37" />
                <Text style={styles.retryText}>{t('Ongera ugerageze', 'Retry', 'إعادة المحاولة')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.browserBtn} onPress={openInBrowser}>
                <Ionicons name="open-outline" size={18} color="#3498db" />
                <Text style={styles.browserText}>{t('Fungura mu browser', 'Open in browser', 'فتح في المتصفح')}</Text>
              </TouchableOpacity>
            </View>
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
        {video.author ? (
          <Text style={[styles.author, { color: COLORS.textMuted }]}>{video.author}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  videoContainer: { width: '100%', position: 'relative', backgroundColor: '#000' },
  closeBtn: { position: 'absolute', top: 8, left: 8, padding: 4, zIndex: 10 },
  closeBtnInner: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  info: { paddingVertical: 16, paddingHorizontal: 20 },
  title: { fontSize: 18, fontWeight: '700' },
  author: { fontSize: 14, marginTop: 4 },
  loadingWrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', zIndex: 5 },
  loadingText: { color: '#999', fontSize: 13, marginTop: 10 },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 20 },
  errorTitle: { fontSize: 16, fontWeight: '700', textAlign: 'center' },
  errorText: { color: '#ccc', fontSize: 15, textAlign: 'center' },
  errorUrl: { color: '#666', fontSize: 11, textAlign: 'center', fontStyle: 'italic' },
  errorBtns: { flexDirection: 'row', gap: 12, marginTop: 8 },
  retryBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(212,175,55,0.2)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(212,175,55,0.4)' },
  retryText: { color: '#d4af37', fontSize: 14, fontWeight: '600' },
  browserBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(52,152,219,0.2)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(52,152,219,0.4)' },
  browserText: { color: '#3498db', fontSize: 14, fontWeight: '600' },
});
