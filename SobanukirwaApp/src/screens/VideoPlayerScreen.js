import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, StatusBar, Linking, Platform, ActivityIndicator, ImageBackground, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { getMediaUrl } from '../services/api';

let Video = null;
let ResizeMode = null;
try {
  const av = require('expo-av');
  Video = av.Video;
  ResizeMode = av.ResizeMode;
} catch (e) {}

export default function VideoPlayerScreen({ route, navigation }) {
  const { video } = route.params;
  const { t, COLORS, stopAllMedia } = useApp();
  const videoRef = useRef(null);
  const [status, setStatus] = useState({});
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const videoUrl = video?.videoUrl?.startsWith('http')
    ? video.videoUrl
    : getMediaUrl(video?.videoUrl);

  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const playerHeight = isFullscreen ? screenHeight - 40 : screenWidth * 9 / 16;

  useEffect(() => {
    stopAllMedia();
    if (Platform.OS !== 'web') {
      try { StatusBar.setHidden(true); } catch(e) {}
    }
    return () => {
      if (videoRef.current) {
        try { videoRef.current.stopAsync(); } catch(e) {}
        try { videoRef.current.unloadAsync(); } catch(e) {}
      }
      if (Platform.OS !== 'web') {
        try { StatusBar.setHidden(false); } catch(e) {}
      }
    };
  }, []);

  const handleRetry = () => {
    setError(false);
    setLoading(true);
    setRetryCount(c => c + 1);
  };

  const openInBrowser = () => {
    Linking.openURL(videoUrl).catch(() => {});
  };

  const handleGoBack = async () => {
    if (videoRef.current) {
      try { await videoRef.current.stopAsync(); } catch(e) {}
    }
    navigation.goBack();
  };

  const videoTitle = video?.title || 'Video';
  const videoAuthor = video?.author || video?.authorAr || '';
  const videoDescription = video?.description || '';
  const videoDuration = video?.durationStr || (video?.duration ? `${Math.floor(video.duration / 60)}:${String(video.duration % 60).padStart(2, '0')}` : '');
  const videoViews = video?.viewsCount || 0;

  const renderVideo = () => {
    if (Video) {
      return (
        <Video
          ref={videoRef}
          source={{ uri: videoUrl }}
          style={{ flex: 1 }}
          resizeMode={ResizeMode?.CONTAIN || 'contain'}
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
      );
    }
    return (
      <iframe
        src={videoUrl}
        style={{ width: '100%', height: '100%', border: 'none', backgroundColor: '#000' }}
        allow="autoplay; fullscreen"
        allowFullScreen
      />
    );
  };

  return (
    <ImageBackground source={require('../../assets/home.jpg')} style={styles.bgImage} resizeMode="cover">
      <View style={styles.overlay} />
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={handleGoBack}>
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.topBarTitle} numberOfLines={1}>{videoTitle}</Text>
          {Platform.OS !== 'web' ? (
            <TouchableOpacity style={styles.backBtn} onPress={() => setIsFullscreen(!isFullscreen)}>
              <Ionicons name={isFullscreen ? 'contract-outline' : 'expand-outline'} size={22} color="#FFFFFF" />
            </TouchableOpacity>
          ) : <View style={{ width: 40 }} />}
        </View>

        <View style={[styles.videoContainer, { height: playerHeight }]}>
          {!error ? (
            <>
              {loading && (
                <View style={styles.loadingWrap}>
                  <ActivityIndicator size="large" color="#F59E0B" />
                  <Text style={styles.loadingText}>{t('Gutegura video...', 'Loading video...', 'جاري تحميل الفيديو...')}</Text>
                </View>
              )}
              {renderVideo()}
            </>
          ) : (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
              <Text style={[styles.errorTitle, { color: '#FFFFFF' }]}>{videoTitle}</Text>
              <Text style={styles.errorText}>{t('Video ntirashoboye gukina', 'Unable to play video', 'تعذر تشغيل الفيديو')}</Text>
              <Text style={styles.errorUrl} numberOfLines={2}>{videoUrl}</Text>
              <View style={styles.errorBtns}>
                <TouchableOpacity style={styles.retryBtn} onPress={handleRetry}>
                  <Ionicons name="refresh" size={18} color="#F59E0B" />
                  <Text style={styles.retryText}>{t('Ongera ugerageze', 'Retry', 'إعادة المحاولة')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.browserBtn} onPress={openInBrowser}>
                  <Ionicons name="open-outline" size={18} color="#3498db" />
                  <Text style={styles.browserText}>{t('Fungura mu browser', 'Open in browser', 'فتح في المتصفح')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <ScrollView style={styles.infoPanel}>
          <Text style={styles.title}>{videoTitle}</Text>
          <View style={styles.metaRow}>
            {videoAuthor ? (
              <View style={styles.metaItem}>
                <Ionicons name="person-outline" size={14} color="rgba(255,255,255,0.6)" />
                <Text style={styles.metaText}>{videoAuthor}</Text>
              </View>
            ) : null}
            {videoDuration ? (
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.6)" />
                <Text style={styles.metaText}>{videoDuration}</Text>
              </View>
            ) : null}
            {videoViews > 0 ? (
              <View style={styles.metaItem}>
                <Ionicons name="eye-outline" size={14} color="rgba(255,255,255,0.6)" />
                <Text style={styles.metaText}>{videoViews} {t('ireba', 'views', 'مشاهدة')}</Text>
              </View>
            ) : null}
          </View>
          {videoDescription ? (
            <View style={styles.descSection}>
              <Text style={styles.descLabel}>{t('Sobanuro', 'Description', 'الوصف')}</Text>
              <Text style={styles.descText}>{videoDescription}</Text>
            </View>
          ) : null}
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bgImage: { flex: 1, width: '100%', height: '100%' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.9)' },
  container: { flex: 1, backgroundColor: 'transparent' },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingTop: Platform.OS === 'ios' ? 50 : 36, paddingBottom: 10,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  topBarTitle: { flex: 1, fontSize: 16, fontWeight: '600', color: '#FFFFFF', textAlign: 'center', marginHorizontal: 8 },
  videoContainer: { width: '100%', position: 'relative', backgroundColor: '#000' },
  infoPanel: { flex: 1, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  title: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', lineHeight: 28 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 13, color: 'rgba(255,255,255,0.6)' },
  descSection: { marginTop: 16, padding: 14, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)' },
  descLabel: { fontSize: 13, fontWeight: '700', color: '#F59E0B', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  descText: { fontSize: 14, lineHeight: 22, color: 'rgba(255,255,255,0.8)' },
  loadingWrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', zIndex: 5 },
  loadingText: { color: '#999', fontSize: 13, marginTop: 10 },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 20 },
  errorTitle: { fontSize: 16, fontWeight: '700', textAlign: 'center' },
  errorText: { color: '#ccc', fontSize: 15, textAlign: 'center' },
  errorUrl: { color: '#666', fontSize: 11, textAlign: 'center', fontStyle: 'italic' },
  errorBtns: { flexDirection: 'row', gap: 12, marginTop: 8 },
  retryBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(245,158,11,0.2)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(245,158,11,0.4)' },
  retryText: { color: '#F59E0B', fontSize: 14, fontWeight: '600' },
  browserBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(52,152,219,0.2)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(52,152,219,0.4)' },
  browserText: { color: '#3498db', fontSize: 14, fontWeight: '600' },
});
