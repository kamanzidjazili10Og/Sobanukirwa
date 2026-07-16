import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Image, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

const COLORS = {
  primary: '#0F766E',
  secondary: '#14B8A6',
  accent: '#F59E0B',
  background: '#F8FAFC',
  text: '#FFFFFF',
  textMuted: 'rgba(255,255,255,0.7)',
  border: 'rgba(255,255,255,0.15)',
};

const { width, height } = Dimensions.get('window');

const STATUS_MESSAGES = [
  'Initializing...',
  'Loading prayer times...',
  'Preparing Qor\'an...',
  'Loading audio lessons...',
  'Setting up Adhkar...',
  'Almost ready...',
];

export default function LoadingScreen({ onFinish }) {
  const { t } = useApp();
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const titleFade = useRef(new Animated.Value(0)).current;
  const subtitleFade = useRef(new Animated.Value(0)).current;
  const progressFade = useRef(new Animated.Value(0)).current;
  const verseFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }),
      Animated.timing(titleFade, { toValue: 1, duration: 800, delay: 300, useNativeDriver: true }),
      Animated.timing(subtitleFade, { toValue: 1, duration: 800, delay: 600, useNativeDriver: true }),
      Animated.timing(verseFade, { toValue: 1, duration: 1000, delay: 900, useNativeDriver: true }),
      Animated.timing(progressFade, { toValue: 1, duration: 600, delay: 1200, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -10, duration: 2500, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2500, useNativeDriver: true }),
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
            Animated.timing(fadeAnim, { toValue: 0, duration: 800, useNativeDriver: false }).start(() => {
              if (onFinishRef.current) onFinishRef.current();
            });
            setTimeout(() => { if (onFinishRef.current) onFinishRef.current(); }, 1200);
          }, 400);
          return 100;
        }
        return next;
      });
    }, 50);

    const statusInterval = setInterval(() => {
      setStatusIndex(prev => (prev + 1) % STATUS_MESSAGES.length);
    }, 700);

    return () => { clearInterval(interval); clearInterval(statusInterval); };
  }, []);

  const spin = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <ImageBackground
      source={require('../../assets/splash.png')}
      style={styles.bgImage}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <View style={[styles.radialGlow, { backgroundColor: `rgba(15, 118, 110, ${0.08 * glowAnim})` }]} />

        <Animated.View style={[styles.content, { transform: [{ translateY: floatAnim }, { scale: scaleAnim }] }]}>

          <View style={styles.logoWrap}>
            <Animated.View style={[styles.logoRing, { transform: [{ rotate: spin }] }]} />
            <Animated.View style={[styles.logoGlow, { opacity: glowAnim, backgroundColor: 'rgba(15, 118, 110, 0.12)' }]} />
            <View style={styles.logoCircle}>
              <Image source={require('../../assets/logo2.png')} style={styles.logoImage} resizeMode="contain" />
            </View>
          </View>

          <Animated.View style={{ opacity: titleFade, alignItems: 'center' }}>
            <Text style={styles.title}>Sobanukirwa</Text>
            <Text style={styles.titleSub}>
              {t('Urumuri rw\'abemeramana', 'Light of Faith', 'نور الإيمان')}
            </Text>
          </Animated.View>

          <Animated.View style={[styles.dividerRow, { opacity: subtitleFade }]}>
            <View style={[styles.dividerLine, { backgroundColor: COLORS.secondary }]} />
            <View style={[styles.dividerDiamond, { backgroundColor: COLORS.accent }]}>
              <View style={[styles.dividerDiamondInner, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
            </View>
            <View style={[styles.dividerLine, { backgroundColor: COLORS.secondary }]} />
          </Animated.View>

          <Animated.View style={{ opacity: subtitleFade, alignItems: 'center' }}>
            <Text style={styles.subtitle}>
              Menya ukuri, ubuhanga, n'ubwiza bwa Islam
            </Text>
          </Animated.View>

          <Animated.View style={[styles.verseWrap, { opacity: verseFade }]}>
            <Text style={styles.verseArabic}>إِنَّ هَذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ</Text>
            <Text style={styles.verseTranslation}>Indeed, this Quran guides to what is most upright</Text>
          </Animated.View>

          <Animated.View style={[styles.progressWrap, { opacity: progressFade }]}>
            <Text style={styles.progressText}>{progress}%</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.statusText}>{STATUS_MESSAGES[statusIndex]}</Text>
          </Animated.View>

          <View style={styles.dotsRow}>
            <Animated.View style={[styles.dot, { backgroundColor: COLORS.secondary, transform: [{ scale: dot1 }] }]} />
            <Animated.View style={[styles.dot, { backgroundColor: COLORS.secondary, transform: [{ scale: dot2 }] }]} />
            <Animated.View style={[styles.dot, { backgroundColor: COLORS.secondary, transform: [{ scale: dot3 }] }]} />
          </View>
        </Animated.View>
      </Animated.View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 9999,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6, 48, 44, 0.78)',
  },
  container: {
    flex: 1,
    zIndex: 1,
  },
  radialGlow: {
    position: 'absolute',
    top: '20%',
    left: '50%',
    marginLeft: -140,
    marginTop: -140,
    width: 280,
    height: 280,
    borderRadius: 140,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  logoWrap: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 16,
  },
  logoRing: {
    position: 'absolute',
    top: -14,
    left: -14,
    right: -14,
    bottom: -14,
    borderRadius: 94,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoGlow: {
    position: 'absolute',
    top: -28,
    left: -28,
    right: -28,
    bottom: -28,
    borderRadius: 108,
  },
  logoCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
    overflow: 'hidden',
  },
  logoImage: {
    width: 100,
    height: 100,
  },

  title: {
    fontSize: 40,
    color: COLORS.accent,
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
    letterSpacing: 1,
  },
  titleSub: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 2,
    color: 'rgba(255, 255, 255, 0.75)',
    textTransform: 'uppercase',
    marginTop: 4,
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
    marginBottom: 6,
  },
  dividerLine: {
    width: 50,
    height: 1.5,
    borderRadius: 1,
  },
  dividerDiamond: {
    width: 8,
    height: 8,
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  dividerDiamondInner: {
    width: 3,
    height: 3,
    borderRadius: 1,
  },

  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 22,
  },

  verseWrap: {
    alignItems: 'center',
    marginTop: 24,
    paddingHorizontal: 28,
    paddingVertical: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  verseArabic: {
    fontSize: 22,
    fontFamily: 'serif',
    textAlign: 'center',
    lineHeight: 36,
    color: COLORS.accent,
  },
  verseTranslation: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
    color: 'rgba(255, 255, 255, 0.55)',
  },

  progressWrap: {
    alignItems: 'center',
    marginTop: 20,
    width: 280,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    fontVariant: ['tabular-nums'],
    color: COLORS.accent,
  },
  progressBar: {
    width: 280,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accent,
  },
  statusText: {
    fontSize: 12,
    marginTop: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
    color: 'rgba(255, 255, 255, 0.5)',
  },

  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
