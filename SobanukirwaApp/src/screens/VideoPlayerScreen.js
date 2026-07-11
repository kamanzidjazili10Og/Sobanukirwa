import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { useApp } from '../context/AppContext';
import { getMediaUrl } from '../services/api';

export default function VideoPlayerScreen({ route, navigation }) {
  const { video } = route.params;
  const { t, COLORS, stopAllMedia, registerPauseVideo } = useApp();

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

  return (
    <View style={styles.container}>
      <View style={[styles.videoContainer, { height: playerHeight }]}>
        <WebView
          source={{ html: `
            <html><body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;height:100vh">
              <video controls style="width:100%;height:auto;max-height:100vh" src="${videoUrl}" playsinline>
                Your browser does not support video.
              </video>
              <script>
                var v = document.querySelector('video');
                v.addEventListener('error', function() {
                  document.body.innerHTML = '<p style="color:white;text-align:center;padding:20px;font-family:sans-serif;">Video could not be loaded</p>';
                });
              </script>
            </body></html>
          `}}
          style={styles.webview}
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled
        />
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
  webview: { flex: 1 },
  closeBtn: { position: 'absolute', top: 8, left: 8, padding: 4, zIndex: 10 },
  closeBtnInner: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    backdropFilter: 'blur(10px)',
  },
  info: { paddingVertical: 16, paddingHorizontal: 20 },
  title: { fontSize: 18, fontWeight: '700' },
});
