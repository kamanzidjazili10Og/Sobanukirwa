import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Platform, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Compass, Navigation, MapPin, ChevronLeft } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { calculateQiblaDirection, calculateKaabaDistance } from '../utils/prayerCalc';
import ScreenBackground from '../components/ScreenBackground';

let Magnetometer = null;
let Location = null;

try { Magnetometer = require('expo-sensors').Magnetometer; } catch (e) {}
try { Location = require('expo-location'); } catch (e) {}

const { width } = Dimensions.get('window');
const COMPASS_SIZE = width * 0.72;
const TICK_COUNT = 72;
const DEGREE_MARKS = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

const DIR_LABELS = [
  { deg: 0, label: 'N', color: '#EF4444' },
  { deg: 45, label: 'NE', color: '#FFFFFF' },
  { deg: 90, label: 'E', color: '#FFFFFF' },
  { deg: 135, label: 'SE', color: '#FFFFFF' },
  { deg: 180, label: 'S', color: '#FFFFFF' },
  { deg: 225, label: 'SW', color: '#FFFFFF' },
  { deg: 270, label: 'W', color: '#FFFFFF' },
  { deg: 315, label: 'NW', color: '#FFFFFF' },
];

const CARDINAL_FULL = {
  0: 'Amajyaruguru', 45: 'Iburasirazuba', 90: 'Iburasirazuba',
  135: 'Iburyo', 180: 'Amabereko', 225: 'Iburasirazuba',
  270: 'Ibumoso', 315: 'Iburasirazuba',
};

const CARDINAL_FULL_EN = {
  0: 'North', 45: 'Northeast', 90: 'East',
  135: 'Southeast', 180: 'South', 225: 'Southwest',
  270: 'West', 315: 'Northwest',
};

const CARDINAL_FULL_AR = {
  0: 'الشمال', 45: 'الشمال الشرقي', 90: 'الشرق',
  135: 'الجنوب الشرقي', 180: 'الجنوب', 225: 'الجنوب الغربي',
  270: 'الغرب', 315: 'الشمال الغربي',
};

export default function QiblaScreen({ navigation }) {
  const { t, language } = useApp();
  const [heading, setHeading] = useState(0);
  const [qiblaDirection, setQiblaDirection] = useState(0);
  const [distance, setDistance] = useState(0);
  const [accuracy, setAccuracy] = useState(null);
  const [isAligned, setIsAligned] = useState(false);
  const [compassActive, setCompassActive] = useState(false);
  const subRef = useRef(null);
  const compassAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    initCompass();
    return () => {
      if (subRef.current && subRef.current.remove) subRef.current.remove();
    };
  }, []);

  useEffect(() => {
    Animated.timing(compassAnim, {
      toValue: -heading,
      duration: 100,
      useNativeDriver: true,
    }).start();

    if (qiblaDirection > 0) {
      const diff = Math.abs(((heading - qiblaDirection + 180) % 360) - 180);
      const aligned = diff < 8;
      setIsAligned(aligned);
      if (aligned) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.timing(glowAnim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
          ])
        ).start();
      } else {
        glowAnim.setValue(0.3);
      }
    }
  }, [heading, qiblaDirection]);

  async function initCompass() {
    if (Platform.OS === 'web') {
      setDefaultQibla();
      setCompassActive(false);
      return;
    }
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setAccuracy(pos.coords.accuracy ? Math.round(pos.coords.accuracy) : null);
        setQiblaDirection(calculateQiblaDirection(lat, lng));
        setDistance(calculateKaabaDistance(lat, lng));
      } else {
        setDefaultQibla();
      }
    } catch (e) {
      setDefaultQibla();
    }
    startMagnetometer();
  }

  function setDefaultQibla() {
    setQiblaDirection(calculateQiblaDirection(-1.9403, 29.8739));
    setDistance(calculateKaabaDistance(-1.9403, 29.8739));
  }

  function startMagnetometer() {
    if (Platform.OS === 'web' || !Magnetometer) return;
    if (subRef.current) subRef.current.remove();
    setCompassActive(true);
    subRef.current = Magnetometer.addListener((data) => {
      const angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
      const headingVal = angle >= 0 ? angle : 360 + angle;
      setHeading(headingVal);
    });
  }

  function calibrate() {
    if (Platform.OS === 'web' || !Magnetometer) return;
    if (subRef.current) subRef.current.remove();
    Magnetometer.setMeasurementInterval(100);
    startMagnetometer();
  }

  function getDirectionLabel(deg) {
    const rounded = Math.round(deg / 45) * 45 % 360;
    if (language === 'ar') return CARDINAL_FULL_AR[rounded] || '';
    if (language === 'en') return CARDINAL_FULL_EN[rounded] || '';
    return CARDINAL_FULL[rounded] || '';
  }

  const ticks = Array.from({ length: TICK_COUNT }, (_, i) => {
    const deg = (i / TICK_COUNT) * 360;
    const isMajor = DEGREE_MARKS.includes(Math.round(deg));
    const isCardinal = [0, 90, 180, 270].includes(Math.round(deg));
    return { deg, isMajor, isCardinal };
  });

  return (
    <ScreenBackground imageKey="bg-qibla" style={styles.bgContainer}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack()}>
            <ChevronLeft size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              {t('Qibla', 'Qibla', 'القبلة')}
            </Text>
          </View>
          <View style={styles.backBtn} />
        </View>

        {/* Direction Label */}
        <View style={styles.directionBanner}>
          <Navigation size={16} color="#D4AF37" />
          <Text style={styles.directionLabel}>
            {t('Icyerekezo cya Qibla', 'Qibla Direction', 'اتجاه القبلة')}
          </Text>
        </View>

        {/* Compass */}
        <View style={styles.compassWrap}>
          {/* Outer Glow */}
          <Animated.View style={[styles.compassGlow, {
            opacity: glowAnim.interpolate({ inputRange: [0.3, 1], outputRange: [0, 0.6] }),
          }]} />

          {/* Fixed Qibla Arrow - always points to Qibla */}
          <View style={[styles.qiblaArrow, { transform: [{ rotate: `${qiblaDirection}deg` }] }]}>
            <View style={styles.qiblaArrowInner}>
              <View style={styles.qiblaArrowHead} />
              <View style={styles.qiblaArrowShaft} />
            </View>
          </View>

          {/* Kaaba marker */}
          <View style={[styles.kaabaMarker, { transform: [{ rotate: `${qiblaDirection}deg` }] }]}>
            <View style={styles.kaabaBadge}>
              <Text style={styles.kaabaIcon}>🕋</Text>
            </View>
          </View>

          {/* Rotating Compass Face */}
          <Animated.View style={[styles.compassFace, {
            transform: [{ rotate: compassAnim.interpolate({
              inputRange: [-360, 0, 360],
              outputRange: ['360deg', '0deg', '-360deg'],
            }) }],
          }]}>
            {/* Tick marks */}
            {ticks.map((tick, i) => {
              const rad = (tick.deg - 90) * (Math.PI / 180);
              const radius = COMPASS_SIZE / 2 - 12;
              const innerRadius = tick.isMajor ? radius - 14 : radius - 8;
              return (
                <View
                  key={i}
                  style={{
                    position: 'absolute',
                    left: COMPASS_SIZE / 2 + Math.cos(rad) * radius - (tick.isCardinal ? 1 : 0.5),
                    top: COMPASS_SIZE / 2 + Math.sin(rad) * radius - (tick.isMajor ? 8 : 4),
                    width: tick.isCardinal ? 2 : tick.isMajor ? 1.5 : 1,
                    height: tick.isMajor ? 16 : 8,
                    backgroundColor: tick.isCardinal ? '#D4AF37' : tick.isMajor ? '#FFFFFF' : 'rgba(255,255,255,0.4)',
                    transform: [{ rotate: `${tick.deg}deg` }],
                    borderRadius: 1,
                  }}
                />
              );
            })}

            {/* Cardinal direction labels */}
            {DIR_LABELS.map((dir) => {
              const rad = (dir.deg - 90) * (Math.PI / 180);
              const labelRadius = COMPASS_SIZE / 2 - 36;
              return (
                <Text
                  key={dir.deg}
                  style={{
                    position: 'absolute',
                    left: COMPASS_SIZE / 2 + Math.cos(rad) * labelRadius - 12,
                    top: COMPASS_SIZE / 2 + Math.sin(rad) * labelRadius - 8,
                    fontSize: dir.deg % 90 === 0 ? 16 : 11,
                    fontWeight: dir.deg % 90 === 0 ? '800' : '500',
                    color: dir.color,
                    width: 24,
                    textAlign: 'center',
                    textShadowColor: 'rgba(0,0,0,0.5)',
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 3,
                  }}
                >
                  {dir.label}
                </Text>
              );
            })}

            {/* Inner decorative circle */}
            <View style={styles.compassInnerCircle} />

            {/* Compass center */}
            <View style={styles.compassCenter}>
              <View style={styles.compassCenterDot} />
            </View>
          </Animated.View>
        </View>

        {/* Degree Display */}
        <View style={styles.degreeSection}>
          <Text style={styles.degreeValue}>{Math.round(qiblaDirection)}°</Text>
          <Text style={styles.degreeLabel}>
            {t('Qibla', 'Qibla', 'القبلة')}
          </Text>
        </View>

        {/* Info Cards */}
        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <View style={styles.infoIconWrap}>
              <MapPin size={16} color="#D4AF37" />
            </View>
            <Text style={styles.infoValue}>{distance.toLocaleString()}</Text>
            <Text style={styles.infoUnit}>km</Text>
            <Text style={styles.infoLabel}>
              {t('Ku Kaaba', 'To Kaaba', 'إلى الكعبة')}
            </Text>
          </View>
          <View style={styles.infoCard}>
            <View style={styles.infoIconWrap}>
              <Compass size={16} color="#D4AF37" />
            </View>
            <Text style={styles.infoValue}>{Math.round(heading)}°</Text>
            <Text style={styles.infoUnit}></Text>
            <Text style={styles.infoLabel}>
              {t('Uburyo bw\'Ikibaho', 'Device Heading', 'اتجاه الجهاز')}
            </Text>
          </View>
        </View>

        {/* Calibrate Button */}
        <TouchableOpacity
          style={[styles.calibrateBtn, Platform.OS === 'web' && { opacity: 0.5 }]}
          onPress={calibrate}
          disabled={Platform.OS === 'web'}
        >
          <Compass size={16} color="#D4AF37" />
          <Text style={styles.calibrateText}>
            {Platform.OS === 'web'
              ? t('Compass ntirakora kuri web', 'Compass not available on web', 'البوصلة غير متاحة على الويب')
              : t('Kugena Kompassu', 'Calibrate Compass', 'معايرة البوصلة')
            }
          </Text>
        </TouchableOpacity>

        {/* Location Info */}
        <View style={styles.locationBar}>
          <MapPin size={12} color="rgba(255,255,255,0.5)" />
          <Text style={styles.locationText}>
            {accuracy
              ? t(`Ibihano: ~${accuracy}m`, `Accuracy: ~${accuracy}m`, `الدقة: ~${accuracy}م`)
              : t('Ntibizwi', 'Getting location...', 'جاري تحديد الموقع...')
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

  /* Header */
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  headerCenter: { alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', fontFamily: 'serif' },

  /* Direction Banner */
  directionBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 6 },
  directionLabel: { fontSize: 13, fontWeight: '600', color: '#D4AF37', letterSpacing: 1 },

  /* Compass */
  compassWrap: {
    width: COMPASS_SIZE, height: COMPASS_SIZE, alignSelf: 'center',
    marginVertical: 12, position: 'relative',
  },
  compassGlow: {
    position: 'absolute', top: -20, left: -20, right: -20, bottom: -20,
    borderRadius: (COMPASS_SIZE + 40) / 2,
    backgroundColor: 'transparent',
    borderWidth: 2, borderColor: '#D4AF37',
    shadowColor: '#D4AF37', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8, shadowRadius: 30, elevation: 12,
  },
  compassFace: {
    width: COMPASS_SIZE, height: COMPASS_SIZE,
    borderRadius: COMPASS_SIZE / 2,
    borderWidth: 2, borderColor: 'rgba(212,175,55,0.6)',
    backgroundColor: 'rgba(15,25,40,0.85)',
    position: 'relative',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, shadowRadius: 15, elevation: 10,
  },
  compassInnerCircle: {
    position: 'absolute', top: 30, left: 30, right: 30, bottom: 30,
    borderRadius: (COMPASS_SIZE - 60) / 2,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  compassCenter: {
    position: 'absolute', top: COMPASS_SIZE / 2 - 6,
    left: COMPASS_SIZE / 2 - 6, width: 12, height: 12,
    borderRadius: 6, backgroundColor: '#D4AF37',
    shadowColor: '#D4AF37', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6, shadowRadius: 6,
  },
  compassCenterDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFFFFF', position: 'absolute', top: 3, left: 3 },

  /* Qibla Arrow */
  qiblaArrow: {
    position: 'absolute', top: 0, left: COMPASS_SIZE / 2 - 1.5,
    width: 3, height: COMPASS_SIZE / 2,
    zIndex: 10,
  },
  qiblaArrowInner: { width: '100%', height: '100%', alignItems: 'center' },
  qiblaArrowHead: {
    width: 0, height: 0,
    borderLeftWidth: 6, borderRightWidth: 6, borderBottomWidth: 10,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
    borderBottomColor: '#D4AF37',
  },
  qiblaArrowShaft: {
    width: 2, flex: 1,
    backgroundColor: '#D4AF37',
  },

  /* Kaaba Marker */
  kaabaMarker: {
    position: 'absolute', top: -2, left: COMPASS_SIZE / 2 - 16,
    width: 32, zIndex: 11,
    alignItems: 'center',
    transformOrigin: `16px ${COMPASS_SIZE / 2 + 2}px`,
  },
  kaabaBadge: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(212,175,55,0.2)',
    borderWidth: 1.5, borderColor: '#D4AF37',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#D4AF37', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4, shadowRadius: 6,
  },
  kaabaIcon: { fontSize: 14 },

  /* Degree Section */
  degreeSection: { alignItems: 'center', marginVertical: 10 },
  degreeValue: { fontSize: 48, fontWeight: '300', color: '#FFFFFF', fontVariant: ['tabular-nums'], letterSpacing: 2 },
  degreeLabel: { fontSize: 13, fontWeight: '600', color: '#D4AF37', letterSpacing: 2, marginTop: -4 },

  /* Info Cards */
  infoRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 24, marginBottom: 16 },
  infoCard: {
    flex: 1, padding: 16, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  infoIconWrap: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(212,175,55,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  infoValue: { fontSize: 24, fontWeight: '700', color: '#FFFFFF', fontVariant: ['tabular-nums'] },
  infoUnit: { fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.5)', marginTop: -2 },
  infoLabel: { fontSize: 11, fontWeight: '500', color: 'rgba(255,255,255,0.5)', marginTop: 4, textAlign: 'center' },

  /* Calibrate */
  calibrateBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginHorizontal: 24, paddingVertical: 12, borderRadius: 14,
    backgroundColor: 'rgba(212,175,55,0.12)',
    borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)',
  },
  calibrateText: { fontSize: 13, fontWeight: '600', color: '#D4AF37' },

  /* Location */
  locationBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12 },
  locationText: { fontSize: 11, color: 'rgba(255,255,255,0.4)' },
});
