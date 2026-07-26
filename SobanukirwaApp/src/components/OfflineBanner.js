import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useApp } from '../context/AppContext';

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const slideAnim = useState(new Animated.Value(-60))[0];
  const { pendingSyncCount, isSyncing, syncStatus } = useApp();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const offline = !state.isConnected || !state.isInternetReachable;
      setIsOffline(offline);
      if (offline) {
        setShowBanner(true);
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true }).start();
      } else if (pendingSyncCount === 0) {
        Animated.timing(slideAnim, { toValue: -60, duration: 300, useNativeDriver: true }).start(() => {
          setShowBanner(false);
        });
      }
    });
    return () => unsubscribe();
  }, [pendingSyncCount]);

  useEffect(() => {
    if (pendingSyncCount > 0 && !isOffline) {
      setShowBanner(true);
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true }).start();
    } else if (pendingSyncCount === 0 && !isOffline) {
      Animated.timing(slideAnim, { toValue: -60, duration: 300, useNativeDriver: true }).start(() => {
        setShowBanner(false);
      });
    }
  }, [pendingSyncCount, isOffline]);

  if (!showBanner) return null;

  const getMessage = () => {
    if (isOffline) return '📡 Offline — cached data is shown';
    if (isSyncing) return `🔄 Syncing ${pendingSyncCount} pending changes...`;
    if (pendingSyncCount > 0) return `📤 ${pendingSyncCount} changes pending sync`;
    return '📡 Offline — cached data is shown';
  };

  const getSubMessage = () => {
    if (isOffline) return 'Your data is safe — everything works without internet';
    if (isSyncing) return 'Connecting with the website...';
    if (pendingSyncCount > 0) return 'Will sync when connection is restored';
    return '';
  };

  return (
    <Animated.View style={[styles.banner, {
      transform: [{ translateY: slideAnim }],
      backgroundColor: isOffline ? '#F59E0B' : '#10B981',
      borderBottomColor: isOffline ? '#D97706' : '#059669',
    }]}>
      <View style={styles.content}>
        <View style={[styles.dot, { backgroundColor: isOffline ? '#78350F' : '#064E3B' }]} />
        <View style={styles.textWrap}>
          <Text style={[styles.text, { color: isOffline ? '#78350F' : '#064E3B' }]}>{getMessage()}</Text>
          {getSubMessage() ? (
            <Text style={[styles.subText, { color: isOffline ? '#92400E' : '#047857' }]}>{getSubMessage()}</Text>
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
