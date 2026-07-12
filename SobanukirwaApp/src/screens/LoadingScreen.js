import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, ImageBackground, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function LoadingScreen({ onFinish }) {
  const [progress, setProgress] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -10, duration: 2000, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.3, duration: 2000, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(rotateAnim, { toValue: 1, duration: 18000, useNativeDriver: true })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(dot1, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot2, { toValue: 0.3, duration: 400, useNativeDriver: true }),
          Animated.timing(dot3, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(dot1, { toValue: 0.3, duration: 400, useNativeDriver: true }),
          Animated.timing(dot2, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot3, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(dot1, { toValue: 0.3, duration: 400, useNativeDriver: true }),
          Animated.timing(dot2, { toValue: 0.3, duration: 400, useNativeDriver: true }),
          Animated.timing(dot3, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]),
      ])
    ).start();

    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + 2;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            Animated.timing(fadeAnim, { toValue: 0, duration: 800, useNativeDriver: true }).start(() => onFinish());
          }, 300);
          return 100;
        }
        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ImageBackground
        source={require('../../assets/bg-loading.jpg')}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
      </ImageBackground>
      <Animated.View style={[styles.content, { transform: [{ translateY: floatAnim }] }]}>
        {/* Rotating ring */}
        <View style={styles.logoWrap}>
          <Animated.View style={[styles.logoRing, { transform: [{ rotate: rotateAnim.interpolate({ inputRange: [0,1], outputRange: ['0deg','360deg'] }) }] }]} />
          <Animated.View style={[styles.logoGlow, { opacity: glowAnim }]} />
          <View style={styles.iconCircle}>
            <View style={styles.iconInner}>
              <Image source={require('../../assets/icon.png')} style={styles.logoImage} resizeMode="contain" />
            </View>
          </View>
        </View>
        <Text style={styles.title}>Sobanukirwa</Text>
        <Text style={styles.subtitle}>Urumuri rw'Imyemero</Text>
        {/* Diamond divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <View style={styles.dividerDiamond}>
            <View style={styles.dividerDiamondInner} />
          </View>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.progressWrap}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{progress}%</Text>
        </View>

        <View style={styles.dotsRow}>
          <Animated.View style={[styles.dot, { opacity: dot1 }]} />
          <Animated.View style={[styles.dot, { opacity: dot2 }]} />
          <Animated.View style={[styles.dot, { opacity: dot3 }]} />
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(11,26,42,0.80)' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  logoWrap: { width: 120, height: 120, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  logoRing: {
    position: 'absolute', top: -8, left: -8, right: -8, bottom: -8,
    borderRadius: 64, borderWidth: 1.5, borderStyle: 'dashed', borderColor: 'rgba(212,175,55,0.2)',
  },
  logoGlow: {
    position: 'absolute', top: -15, left: -15, right: -15, bottom: -15,
    borderRadius: 75, backgroundColor: 'rgba(212,175,55,0.1)',
  },
  iconCircle: {
    width: 110, height: 110, borderRadius: 55, borderWidth: 3, borderColor: '#d4af37',
    backgroundColor: 'rgba(212,175,55,0.12)', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#d4af37', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 30, elevation: 10,
  },
  iconInner: {
    width: 88, height: 88, borderRadius: 44, backgroundColor: 'rgba(212,175,55,0.08)',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  logoImage: { width: 72, height: 72, borderRadius: 36 },
  title: { fontSize: 30, fontWeight: '700', fontFamily: 'serif', color: '#d4af37', marginTop: 16 },
  subtitle: { fontSize: 14, color: '#a8c1d9' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  dividerLine: { width: 35, height: 2, borderRadius: 1, backgroundColor: '#d4af37' },
  dividerDiamond: { width: 10, height: 10, borderRadius: 2, backgroundColor: '#d4af37', transform: [{ rotate: '45deg' }], alignItems: 'center', justifyContent: 'center' },
  dividerDiamondInner: { width: 4, height: 4, borderRadius: 1, backgroundColor: '#0a1220' },
  progressWrap: { alignItems: 'center', marginTop: 20 },
  progressBar: { width: 240, height: 4, borderRadius: 2, backgroundColor: 'rgba(212,175,55,0.2)', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2, backgroundColor: '#d4af37', shadowColor: '#d4af37', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 8 },
  progressText: { fontSize: 14, color: '#d4af37', marginTop: 8, fontVariant: ['tabular-nums'] },
  dotsRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#d4af37' },
});
