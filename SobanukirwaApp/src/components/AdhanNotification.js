import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

let Audio = null;
if (Platform.OS !== 'web') {
  try { Audio = require('expo-av').Audio; } catch (e) {}
}

const { width } = Dimensions.get('window');

const ADHAN_BASE = 'https://sobanukirwa-production.up.railway.app';
const ADHAN_FILES = {
  Adhan1: `${ADHAN_BASE}/Sounds/Adhan1.mpeg`,
  Adhan2: `${ADHAN_BASE}/Sounds/Adhan2.mpeg`,
  Mansour: `${ADHAN_BASE}/Sounds/Mansour_Adhan.mpeg`,
};

export default function AdhanNotification({ visible, prayerName, reciter, volume, onDismiss }) {
  const slideAnim = useRef(new Animated.Value(-200)).current;
  const soundRef = useRef(null);

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 50, friction: 8 }).start();
      playAdhan();
    } else {
      Animated.timing(slideAnim, { toValue: -200, useNativeDriver: true, duration: 300 }).start();
      stopAdhan();
    }
    return () => stopAdhan();
  }, [visible]);

  async function playAdhan() {
    if (!Audio) return;
    try {
      if (soundRef.current) await soundRef.current.unloadAsync();
      const uri = ADHAN_FILES[reciter] || ADHAN_FILES.Adhan1;
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true, volume: (volume || 80) / 100 }
      );
      soundRef.current = sound;
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
          soundRef.current = null;
        }
      });
    } catch (e) {}
  }

  async function stopAdhan() {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    } catch (e) {}
  }

  function handleDismiss() {
    stopAdhan();
    if (onDismiss) onDismiss();
  }

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="notifications" size={28} color="#fff" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.label}>Adhan</Text>
          <Text style={styles.prayerName}>{prayerName || ''}</Text>
        </View>
        <TouchableOpacity style={styles.dismissBtn} onPress={handleDismiss}>
          <Ionicons name="close-circle" size={32} color="#fff" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 9999,
    elevation: 20,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e3c5c',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#d4af37',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#d4af37',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: { flex: 1 },
  label: { fontSize: 12, color: '#d4af37', fontWeight: '600', letterSpacing: 0.5 },
  prayerName: { fontSize: 20, fontWeight: '800', color: '#fff', marginTop: 2 },
  dismissBtn: { padding: 4 },
});
