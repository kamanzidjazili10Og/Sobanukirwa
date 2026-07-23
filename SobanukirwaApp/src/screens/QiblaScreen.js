import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  Platform, Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Navigation, MapPin, ChevronLeft, Compass as CompassIcon, RotateCcw, Info } from 'lucide-react-native';
import { Audio } from 'expo-av';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming,
  withSpring, runOnJS, Easing, interpolate, Extrapolate,
  useAnimatedReaction,
} from 'react-native-reanimated';
import { useApp } from '../context/AppContext';
import { calculateQiblaDirection, calculateKaabaDistance } from '../utils/prayerCalc';
import ScreenBackground from '../components/ScreenBackground';

let Magnetometer = null;
let Location = null;
try { Magnetometer = require('expo-sensors').Magnetometer; } catch (e) {}
try { Location = require('expo-location'); } catch (e) {}

const { width } = Dimensions.get('window');
const COMPASS_SIZE = Math.min(width * 0.78, 340);
const HALF = COMPASS_SIZE / 2;
const TICK_COUNT = 72;

const DIRS = [
  { deg: 0, label: 'N', color: '#EF4444' },
  { deg: 45, label: 'NE', color: 'rgba(255,255,255,0.5)' },
  { deg: 90, label: 'E', color: '#FFFFFF' },
  { deg: 135, label: 'SE', color: 'rgba(255,255,255,0.5)' },
  { deg: 180, label: 'S', color: '#FFFFFF' },
  { deg: 225, label: 'SW', color: 'rgba(255,255,255,0.5)' },
  { deg: 270, label: 'W', color: '#FFFFFF' },
  { deg: 315, label: 'NW', color: 'rgba(255,255,255,0.5)' },
];

const MAJOR_TICKS = new Set([0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]);
const CARDINAL_DEGS = new Set([0, 90, 180, 270]);

function angleDiff(a, b) {
  let d = ((b - a) % 360 + 360) % 360;
  return d > 180 ? d - 360 : d;
}

const QIBLA_SOUND = require('../../../audio/Subhanallah.m4a');

export default function QiblaScreen({ navigation }) {
  const { t, language } = useApp();
  const [heading, setHeading] = useState(0);
  const [qiblaDir, setQiblaDir] = useState(0);
  const [distance, setDistance] = useState(0);
  const [accuracy, setAccuracy] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [wasAligned, setWasAligned] = useState(false);

  const subRef = useRef(null);
  const soundRef = useRef(null);
  const lastPlayRef = useRef(0);

  const compassRotation = useSharedValue(0);
  const glowOpacity = useSharedValue(0.3);
  const glowScale = useSharedValue(1);
  const foundOpacity = useSharedValue(0);
  const needleBounce = useSharedValue(0);
  const kaabaGlow = useSharedValue(0.4);

  const checkAlignment = useCallback((diff) => {
    const absDiff = Math.abs(diff);
    const aligned = absDiff < 5;

    if (aligned && !wasAligned) {
      setWasAligned(true);
      foundOpacity.value = withTiming(1, { duration: 300 });
      if (Date.now() - lastPlayRef.current > 8000) {
        lastPlayRef.current = Date.now();
        Vibration.vibrate(200);
        playQiblaSound();
      }
    } else if (!aligned && wasAligned) {
      setWasAligned(false);
      foundOpacity.value = withTiming(0, { duration: 300 });
    }

    const intensity = interpolate(absDiff, [0, 30, 90], [1, 0.5, 0.2], Extrapolate.CLAMP);
    glowOpacity.value = withTiming(intensity, { duration: 150 });
    const scale = interpolate(absDiff, [0, 30, 90], [1.2, 1.05, 1], Extrapolate.CLAMP);
    glowScale.value = withTiming(scale, { duration: 150 });
    const bounce = interpolate(absDiff, [0, 5, 15], [8, 0, 0], Extrapolate.CLAMP);
    needleBounce.value = withSpring(bounce, { damping: 8, stiffness: 200 });
    const kGlow = interpolate(absDiff, [0, 20, 60], [1, 0.6, 0.3], Extrapolate.CLAMP);
    kaabaGlow.value = withTiming(kGlow, { duration: 200 });
  }, [wasAligned, foundOpacity, glowOpacity, glowScale, needleBounce, kaabaGlow]);

  useAnimatedReaction(
    () => compassRotation.value,
    (current) => {
      if (qiblaDir > 0) {
        const normalizedCurrent = ((current % 360) + 360) % 360;
        const diff = angleDiff(normalizedCurrent, qiblaDir);
        runOnJS(checkAlignment)(diff);
      }
    }
  );

  useEffect(() => {
    initCompass();
    return () => {
      if (subRef.current?.remove) subRef.current.remove();
      if (soundRef.current) { soundRef.current.unloadAsync().catch(() => {}); }
    };
  }, []);

  useEffect(() => {
    compassRotation.value = withTiming(-heading, { duration: 80, easing: Easing.out(Easing.quad) });
  }, [heading]);

  async function initCompass() {
    if (Platform.OS === 'web') {
      setDefaultQibla();
      return;
    }
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setAccuracy(pos.coords.accuracy ? Math.round(pos.coords.accuracy) : null);
        setQiblaDir(calculateQiblaDirection(lat, lng));
        setDistance(calculateKaabaDistance(lat, lng));
        try {
          const [place] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
          if (place) setLocationName(place.city || place.region || place.country || '');
        } catch {}
      } else {
        setDefaultQibla();
      }
    } catch {
      setDefaultQibla();
    }
    startMagnetometer();
  }

  function setDefaultQibla() {
    setQiblaDir(calculateQiblaDirection(-1.9403, 29.8739));
    setDistance(calculateKaabaDistance(-1.9403, 29.8739));
  }

  function startMagnetometer() {
    if (Platform.OS === 'web' || !Magnetometer) return;
    if (subRef.current?.remove) subRef.current.remove();
    Magnetometer.setMeasurementInterval(60);
    subRef.current = Magnetometer.addListener((data) => {
      const angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
      const h = ((angle % 360) + 360) % 360;
      setHeading(h);
    });
  }

  async function playQiblaSound() {
    try {
      if (soundRef.current) await soundRef.current.unloadAsync();
      const { sound } = await Audio.Sound.createAsync(QIBLA_SOUND, { volume: 0.5 });
      soundRef.current = sound;
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) sound.unloadAsync().catch(() => {});
      });
    } catch {}
  }

  function calibrate() {
    if (Platform.OS === 'web' || !Magnetometer) return;
    if (subRef.current?.remove) subRef.current.remove();
    Magnetometer.setMeasurementInterval(20);
    setTimeout(() => {
      Magnetometer.setMeasurementInterval(60);
      startMagnetometer();
    }, 2000);
    startMagnetometer();
  }

  const diff = angleDiff(heading, qiblaDir);
  const absDiff = Math.abs(diff);
  const diffColor = absDiff < 5 ? '#22C55E' : absDiff < 15 ? '#F59E0B' : '#EF4444';
  const isAligned = absDiff < 5;

  const compassAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${compassRotation.value}deg` }],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));

  const foundAnimatedStyle = useAnimatedStyle(() => ({
    opacity: foundOpacity.value,
  }));

  const needleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: needleBounce.value }],
  }));

  const kaabaGlowStyle = useAnimatedStyle(() => ({
    opacity: kaabaGlow.value,
  }));

  return (
    <ScreenBackground imageKey="bg-qibla" style={styles.bgContainer}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack()}>
            <ChevronLeft size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('Qibla', 'Qibla', 'القبلة')}</Text>
          <TouchableOpacity style={styles.backBtn} onPress={calibrate}>
            <RotateCcw size={16} color="#D4AF37" />
          </TouchableOpacity>
        </View>

        <View style={styles.banner}>
          <Navigation size={14} color="#D4AF37" />
          <Text style={styles.bannerText}>
            {t('Icyerekezo cya Qibla', 'Qibla Direction', 'اتجاه القبلة')}
          </Text>
        </View>

        <View style={styles.compassArea}>
          <Animated.View style={[styles.glowRing, glowAnimatedStyle, isAligned && styles.glowRingAligned]} />

          <Animated.View style={[styles.foundOverlay, foundAnimatedStyle]}>
            <Text style={styles.foundText}>
              {t('Qibla irabonetse!', 'Qibla Found!', '!وجدت القبلة')}
            </Text>
          </Animated.View>

          <View style={styles.headingIndicator}>
            <View style={styles.headingTriangle} />
          </View>

          <Animated.View style={[styles.compassOuter, compassAnimatedStyle]}>
            {Array.from({ length: TICK_COUNT }, (_, i) => {
              const deg = (i / TICK_COUNT) * 360;
              const rounded = Math.round(deg);
              const isCard = CARDINAL_DEGS.has(rounded);
              const isMajor = MAJOR_TICKS.has(rounded);
              const rad = (deg - 90) * (Math.PI / 180);
              const outerR = HALF - 6;
              const len = isCard ? 18 : isMajor ? 14 : 7;
              const innerR = outerR - len;
              const midR = (outerR + innerR) / 2;
              return (
                <View
                  key={i}
                  style={{
                    position: 'absolute',
                    left: HALF + Math.cos(rad) * midR - (isCard ? 1.2 : 0.6),
                    top: HALF + Math.sin(rad) * midR - (isCard ? 9 : len / 2),
                    width: isCard ? 2.4 : isMajor ? 1.5 : 0.8,
                    height: len,
                    borderRadius: 1,
                    backgroundColor: isCard ? '#D4AF37' : isMajor ? '#FFFFFF' : 'rgba(255,255,255,0.3)',
                    transform: [{ rotate: `${deg}deg` }],
                  }}
                />
              );
            })}

            {DIRS.map((d) => {
              const rad = (d.deg - 90) * (Math.PI / 180);
              const r = HALF - 36;
              return (
                <Text
                  key={d.deg}
                  style={{
                    position: 'absolute',
                    left: HALF + Math.cos(rad) * r - 14,
                    top: HALF + Math.sin(rad) * r - 9,
                    width: 28,
                    textAlign: 'center',
                    fontSize: CARDINAL_DEGS.has(d.deg) ? 17 : 11,
                    fontWeight: CARDINAL_DEGS.has(d.deg) ? '800' : '500',
                    color: d.color,
                    textShadowColor: 'rgba(0,0,0,0.7)',
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 3,
                  }}
                >
                  {d.label}
                </Text>
              );
            })}

            <View style={styles.innerRing} />
          </Animated.View>

          <View style={styles.qiblaMarker}>
            <Animated.View style={[styles.needleWrap, needleAnimatedStyle]}>
              <View style={styles.needleHead} />
              <View style={[styles.needleShaft, { height: HALF - 55 }]} />
            </Animated.View>
            <Animated.View style={[styles.kaabaBadge, kaabaGlowStyle]}>
              <Text style={styles.kaabaIcon}>🕋</Text>
            </Animated.View>
          </View>

          <View style={styles.centerDot}>
            <View style={styles.centerDotInner} />
          </View>
        </View>

        <View style={styles.degreeSection}>
          <Text style={[styles.diffValue, { color: diffColor }]}>
            {absDiff < 1 ? '✓' : `${Math.round(absDiff)}°`}
          </Text>
          <Text style={[styles.diffLabel, isAligned && styles.diffLabelAligned]}>
            {absDiff < 5
              ? t('Qibla iri hano!', 'Facing Qibla!', 'أمام القبلة!')
              : diff > 0
                ? t(`Jya ku rubaruro ${Math.round(absDiff)}°`, `Turn right ${Math.round(absDiff)}°`, `انعج يميناً ${Math.round(absDiff)}°`)
                : t(`Jya ku ibumoso ${Math.round(absDiff)}°`, `Turn left ${Math.round(absDiff)}°`, `انعج يساراً ${Math.round(absDiff)}°`)
            }
          </Text>
          <Text style={styles.qiblaDeg}>{Math.round(qiblaDir)}°</Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <View style={styles.infoIconWrap}>
              <MapPin size={13} color="#D4AF37" />
            </View>
            <Text style={styles.infoVal}>{distance.toLocaleString()}</Text>
            <Text style={styles.infoUnit}>km</Text>
            <Text style={styles.infoLabel}>{t('Ku Kaaba', 'To Kaaba', 'إلى الكعبة')}</Text>
          </View>
          <View style={styles.infoCard}>
            <View style={styles.infoIconWrap}>
              <CompassIcon size={13} color="#D4AF37" />
            </View>
            <Text style={styles.infoVal}>{Math.round(heading)}°</Text>
            <Text style={styles.infoLabel}>{t('Heading', 'Heading', 'الاتجاه')}</Text>
          </View>
          <View style={styles.infoCard}>
            <View style={styles.infoIconWrap}>
              <Navigation size={13} color="#D4AF37" />
            </View>
            <Text style={[styles.infoVal, { color: diffColor }]}>{Math.round(qiblaDir)}°</Text>
            <Text style={styles.infoLabel}>{t('Qibla', 'Qibla', 'القبلة')}</Text>
          </View>
        </View>

        <View style={styles.locationBar}>
          <MapPin size={10} color="rgba(255,255,255,0.4)" />
          <Text style={styles.locationText}>
            {locationName ? locationName + ' · ' : ''}
            {accuracy
              ? `${t('Accuracy', 'Accuracy', 'الدقة')}: ~${accuracy}m`
              : t('Ntibizwi', 'Locating...', 'جاري التحديد...')
            }
          </Text>
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  bgContainer: { flex: 1 },
  container: { flex: 1, backgroundColor: 'transparent' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 6,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  headerTitle: {
    fontSize: 18, fontWeight: '700', color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  banner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 4,
  },
  bannerText: {
    fontSize: 12, fontWeight: '600', color: '#D4AF37', letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  compassArea: {
    width: COMPASS_SIZE + 40, height: COMPASS_SIZE + 40,
    alignSelf: 'center', marginVertical: 8, position: 'relative',
    alignItems: 'center', justifyContent: 'center',
  },

  glowRing: {
    position: 'absolute',
    width: COMPASS_SIZE + 24, height: COMPASS_SIZE + 24,
    borderRadius: (COMPASS_SIZE + 24) / 2,
    borderWidth: 2.5, borderColor: 'rgba(212,175,55,0.4)',
    shadowColor: '#D4AF37', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7, shadowRadius: 20, elevation: 15,
  },
  glowRingAligned: {
    borderColor: 'rgba(34,197,94,0.6)',
    shadowColor: '#22C55E', shadowOpacity: 0.9, shadowRadius: 30,
  },

  foundOverlay: {
    position: 'absolute', top: -30, zIndex: 20,
    backgroundColor: 'rgba(34,197,94,0.15)',
    borderWidth: 1, borderColor: 'rgba(34,197,94,0.4)',
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6,
  },
  foundText: {
    fontSize: 13, fontWeight: '700', color: '#22C55E',
    letterSpacing: 0.5,
  },

  headingIndicator: {
    position: 'absolute', top: 6, zIndex: 18,
    alignItems: 'center',
  },
  headingTriangle: {
    width: 0, height: 0,
    borderLeftWidth: 8, borderRightWidth: 8, borderBottomWidth: 12,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
    borderBottomColor: '#EF4444',
    shadowColor: '#EF4444', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5, shadowRadius: 6, elevation: 8,
  },

  compassOuter: {
    width: COMPASS_SIZE, height: COMPASS_SIZE,
    borderRadius: HALF,
    borderWidth: 2, borderColor: 'rgba(212,175,55,0.5)',
    backgroundColor: 'rgba(10,18,32,0.92)',
    position: 'absolute',
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6, shadowRadius: 20, elevation: 12,
  },

  innerRing: {
    position: 'absolute', top: 28, left: 28, right: 28, bottom: 28,
    borderRadius: (COMPASS_SIZE - 56) / 2,
    borderWidth: 0.8, borderColor: 'rgba(255,255,255,0.08)',
  },

  qiblaMarker: {
    position: 'absolute', zIndex: 15,
    width: 32, alignItems: 'center',
    top: 18,
  },
  needleWrap: { alignItems: 'center' },
  needleHead: {
    width: 0, height: 0,
    borderLeftWidth: 8, borderRightWidth: 8, borderBottomWidth: 14,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
    borderBottomColor: '#D4AF37',
  },
  needleShaft: {
    width: 2,
    backgroundColor: '#D4AF37',
    opacity: 0.7,
  },

  kaabaBadge: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(212,175,55,0.12)',
    borderWidth: 2, borderColor: '#D4AF37',
    alignItems: 'center', justifyContent: 'center',
    marginTop: 4,
    shadowColor: '#D4AF37', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5, shadowRadius: 10, elevation: 10,
  },
  kaabaIcon: { fontSize: 19 },

  centerDot: {
    position: 'absolute',
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: '#D4AF37',
    shadowColor: '#D4AF37', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7, shadowRadius: 8, elevation: 10,
    zIndex: 16,
  },
  centerDotInner: {
    position: 'absolute', top: 4, left: 4,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },

  degreeSection: { alignItems: 'center', marginVertical: 6 },
  diffValue: {
    fontSize: 44, fontWeight: '300',
    fontVariant: ['tabular-nums'], letterSpacing: 1,
  },
  diffLabel: {
    fontSize: 13, fontWeight: '600',
    color: 'rgba(255,255,255,0.7)', marginTop: 2,
    textAlign: 'center', paddingHorizontal: 20,
  },
  diffLabelAligned: {
    color: '#22C55E',
  },
  qiblaDeg: {
    fontSize: 11, fontWeight: '500',
    color: '#D4AF37', marginTop: 2, letterSpacing: 1,
  },

  infoRow: {
    flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginTop: 10,
  },
  infoCard: {
    flex: 1, padding: 12, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center', gap: 3,
  },
  infoIconWrap: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: 'rgba(212,175,55,0.1)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 2,
  },
  infoVal: {
    fontSize: 20, fontWeight: '700', color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  infoUnit: {
    fontSize: 10, fontWeight: '500',
    color: 'rgba(255,255,255,0.4)', marginTop: -2,
  },
  infoLabel: {
    fontSize: 10, fontWeight: '500',
    color: 'rgba(255,255,255,0.4)',
  },

  locationBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, marginTop: 10,
  },
  locationText: { fontSize: 10, color: 'rgba(255,255,255,0.35)' },
});
