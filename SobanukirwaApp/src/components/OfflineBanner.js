import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useApp } from '../context/AppContext';

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const slideAnim = useState(new Animated.Value(-60))[0];
  const { pendingSyncCount, isSyncing, syncStatus, autoDownloadProgress } = useApp();

  const isAutoDownloading = autoDownloadProgress?.active;

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const offline = !state.isConnected || !state.isInternetReachable;
      setIsOffline(offline);
      if (offline && !isAutoDownloading) {
        setShowBanner(true);
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true }).start();
      } else if (pendingSyncCount === 0 && !isAutoDownloading) {
        Animated.timing(slideAnim, { toValue: -60, duration: 300, useNativeDriver: true }).start(() => {
          setShowBanner(false);
        });
      }
    });
    return () => unsubscribe();
  }, [pendingSyncCount, isAutoDownloading]);

  useEffect(() => {
    if (isAutoDownloading) {
      setShowBanner(true);
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true }).start();
    } else if (!isOffline && pendingSyncCount === 0) {
      Animated.timing(slideAnim, { toValue: -60, duration: 300, useNativeDriver: true }).start(() => {
        setShowBanner(false);
      });
    }
  }, [isAutoDownloading, pendingSyncCount, isOffline]);

  useEffect(() => {
    if (pendingSyncCount > 0 && !isOffline && !isAutoDownloading) {
      setShowBanner(true);
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true }).start();
    } else if (pendingSyncCount === 0 && !isOffline && !isAutoDownloading) {
      Animated.timing(slideAnim, { toValue: -60, duration: 300, useNativeDriver: true }).start(() => {
        setShowBanner(false);
      });
    }
  }, [pendingSyncCount, isOffline, isAutoDownloading]);

  if (!showBanner) return null;

  const getMessage = () => {
    if (isAutoDownloading) {
      const { downloaded, total, phase } = autoDownloadProgress;
      if (phase === 'audio') return `📥 Downloading audio... ${downloaded}/${total}`;
      if (phase === 'books') return `📥 Downloading books... ${downloaded}/${total}`;
      if (phase === 'done') return '✅ All content saved for offline use!';
      return '📥 Preparing offline content...';
    }
    if (isOffline) return '📡 Offline — cached content available';
    if (isSyncing) return `🔄 Syncing ${pendingSyncCount} pending changes...`;
    if (pendingSyncCount > 0) return `📤 ${pendingSyncCount} changes pending sync`;
    return '📡 Offline — cached content available';
  };

  const getSubMessage = () => {
    if (isAutoDownloading && autoDownloadProgress.phase !== 'done') {
      return 'Content is being saved for offline use. You can continue using the app.';
    }
    if (isAutoDownloading && autoDownloadProgress.phase === 'done') {
      return 'You can now use all content without internet.';
    }
    if (isOffline) return 'All saved content is available without internet.';
    if (isSyncing) return 'Connecting to server...';
    if (pendingSyncCount > 0) return 'Will sync when connection is restored';
    return '';
  };

  const bgColor = isAutoDownloading
    ? (autoDownloadProgress.phase === 'done' ? '#10B981' : '#0F766E')
    : (isOffline ? '#F59E0B' : '#10B981');
  const textColor = isAutoDownloading
    ? (autoDownloadProgress.phase === 'done' ? '#064E3B' : '#FFFFFF')
    : (isOffline ? '#78350F' : '#064E3B');

  return (
    <Animated.View style={[styles.banner, {
      transform: [{ translateY: slideAnim }],
      backgroundColor: bgColor,
      borderBottomColor: bgColor === '#F59E0B' ? '#D97706' : (bgColor === '#10B981' ? '#059669' : '#0D5C56'),
    }]}>
      <View style={styles.content}>
        <View style={[styles.dot, { backgroundColor: textColor }]} />
        <View style={styles.textWrap}>
          <Text style={[styles.text, { color: textColor }]}>{getMessage()}</Text>
          {getSubMessage() ? (
            <Text style={[styles.subText, { color: textColor, opacity: 0.7 }]}>{getSubMessage()}</Text>
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 9999,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 10, paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  content: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  textWrap: { flex: 1 },
  text: { fontSize: 13, fontWeight: '600' },
  subText: { fontSize: 10, fontWeight: '500', marginTop: 1 },
});
