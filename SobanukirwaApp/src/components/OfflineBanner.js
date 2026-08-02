import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { WifiOff, Download, CheckCircle2, RefreshCw, UploadCloud } from 'lucide-react-native';
import { useApp } from '../context/AppContext';

export default function OfflineBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const slideAnim = useState(new Animated.Value(-60))[0];
  const { isOffline, pendingSyncCount, isSyncing, autoDownloadProgress } = useApp();

  const isAutoDownloading = autoDownloadProgress?.active;

  useEffect(() => {
    if (isAutoDownloading) {
      setShowBanner(true);
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true }).start();
    } else if (!isOffline && pendingSyncCount === 0 && !isSyncing) {
      Animated.timing(slideAnim, { toValue: -60, duration: 300, useNativeDriver: true }).start(() => {
        setShowBanner(false);
      });
    } else if (isOffline || pendingSyncCount > 0 || isSyncing) {
      setShowBanner(true);
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true }).start();
    }
  }, [isOffline, pendingSyncCount, isSyncing, isAutoDownloading]);

  if (!showBanner) return null;

  const getMessage = () => {
    if (isAutoDownloading) {
      const { downloaded, total, phase } = autoDownloadProgress;
      if (phase === 'audio') return `Downloading audio... ${downloaded}/${total}`;
      if (phase === 'books') return `Downloading books... ${downloaded}/${total}`;
      if (phase === 'done') return 'All content saved for offline use!';
      return 'Preparing offline content...';
    }
    if (isOffline) return 'Offline — cached content available';
    if (isSyncing) return `Syncing ${pendingSyncCount} pending changes...`;
    if (pendingSyncCount > 0) return `${pendingSyncCount} changes pending sync`;
    return 'Offline — cached content available';
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

  const getIcon = () => {
    if (isAutoDownloading) return autoDownloadProgress.phase === 'done' ? CheckCircle2 : Download;
    if (isOffline) return WifiOff;
    if (isSyncing || pendingSyncCount > 0) return RefreshCw;
    return WifiOff;
  };

  const bgColor = isAutoDownloading
    ? (autoDownloadProgress.phase === 'done' ? '#10B981' : '#0F766E')
    : (isOffline ? '#F59E0B' : '#10B981');
  const textColor = isAutoDownloading
    ? (autoDownloadProgress.phase === 'done' ? '#064E3B' : '#FFFFFF')
    : (isOffline ? '#78350F' : '#064E3B');

  const Icon = getIcon();

  return (
    <Animated.View style={[styles.banner, {
      transform: [{ translateY: slideAnim }],
      backgroundColor: bgColor,
      borderBottomColor: bgColor === '#F59E0B' ? '#D97706' : (bgColor === '#10B981' ? '#059669' : '#0D5C56'),
    }]}>
      <View style={styles.content}>
        <Icon size={16} color={textColor} />
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
  textWrap: { flex: 1 },
  text: { fontSize: 13, fontWeight: '600' },
  subText: { fontSize: 10, fontWeight: '500', marginTop: 1 },
});
