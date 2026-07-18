import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const slideAnim = useState(new Animated.Value(-50))[0];

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

  if (!showBanner) return null;

  return (
    <Animated.View style={[styles.banner, { transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.dot} />
      <Text style={styles.text}>You are offline — cached data is shown</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 9999,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 10, paddingHorizontal: 16,
    backgroundColor: '#F59E0B', borderBottomWidth: 1, borderBottomColor: '#D97706',
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#78350F' },
  text: { fontSize: 13, fontWeight: '600', color: '#78350F' },
});
