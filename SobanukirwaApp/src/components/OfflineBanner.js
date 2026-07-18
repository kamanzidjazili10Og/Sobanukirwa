import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useApp } from '../context/AppContext';

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const slideAnim = useState(new Animated.Value(-50))[0];
  const { pendingSyncCount, isSyncing } = useApp();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const offline = !state.isConnected || !state.isInternetReachable;
      setIsOffline(offline);
      if (offline) {
        setShowBanner(true);
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true }).start();
      } else {
        Animated.timing(slideAnim, { toValue: -50, duration: 300, useNativeDriver: true }).start(() => {
          setShowBanner(false);
        });
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (pendingSyncCount > 0 && !isOffline) {
      setShowBanner(true);
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true }).start();
    } else if (pendingSyncCount === 0 && !isOffline) {
      Animated.timing(slideAnim, { toValue: -50, duration: 300, useNativeDriver: true }).start(() => {
        setShowBanner(false);
      });
    }
  }, [pendingSyncCount, isOffline]);

  if (!showBanner) return null;

  const getMessage = () => {
    if (isOffline) return 'You are offline — cached data is shown';
    if (isSyncing) return `Syncing ${pendingSyncCount} pending changes...`;
    if (pendingSyncCount > 0) return `${pendingSyncCount} changes pending sync`;
    return 'You are offline — cached data is shown';
  };

  return (
    <Animated.View style={[styles.banner, {
      transform: [{ translateY: slideAnim }],
      backgroundColor: isOffline ? '#F59E0B' : '#10B981',
      borderBottomColor: isOffline ? '#D97706' : '#059669',
    }]}>
      <View style={[styles.dot, { backgroundColor: isOffline ? '#78350F' : '#064E3B' }]} />
      <Text style={[styles.text, { color: isOffline ? '#78350F' : '#064E3B' }]}>{getMessage()}</Text>
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
  dot: { width: 8, height: 8, borderRadius: 4 },
  text: { fontSize: 13, fontWeight: '600' },
});
