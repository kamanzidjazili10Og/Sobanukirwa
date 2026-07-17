import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Compass, Navigation } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { calculateQiblaDirection, calculateKaabaDistance } from '../utils/prayerCalc';

let Magnetometer = null;
let Location = null;

try { Magnetometer = require('expo-sensors').Magnetometer; } catch (e) {}
try { Location = require('expo-location'); } catch (e) {}

const { width } = Dimensions.get('window');
const COMPASS_SIZE = width * 0.7;

const THEME = {
  primary: '#0F766E',
  secondary: '#14B8A6',
  accent: '#F59E0B',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  border: '#E5E7EB',
  success: '#10B981',
  error: '#EF4444',
};

export default function QiblaScreen() {
  const { t } = useApp();
  const [heading, setHeading] = useState(0);
  const [qiblaDirection, setQiblaDirection] = useState(0);
  const [distance, setDistance] = useState(0);
  const [userCoords, setUserCoords] = useState({ lat: -1.9403, lng: 29.8739 });
  const subRef = useRef(null);

  useEffect(() => {
    initCompass();
    return () => { if (subRef.current && subRef.current.remove) subRef.current.remove(); };
  }, []);

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
        setUserCoords({ lat, lng });
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

  const needleRotation = heading - qiblaDirection;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Compass size={24} color={THEME.primary} />
        <Text style={styles.headerTitle}>
          {t('Icyerekezo cya Qibla', 'Qibla Finder', 'محدد القبلة')}
        </Text>
      </View>

      <View style={styles.compassContainer}>
        <View style={styles.compass}>
          <Text style={[styles.direction, { top: 8 }]}>N</Text>
          <Text style={[styles.direction, { bottom: 8 }]}>S</Text>
          <Text style={[styles.direction, { left: 8 }]}>W</Text>
          <Text style={[styles.direction, { right: 8 }]}>E</Text>

          <View
            style={[
              styles.needle,
              { transform: [{ rotate: `${needleRotation}deg` }] }
            ]}
          >
            <View style={[styles.needleTop, { backgroundColor: THEME.primary }]} />
            <View style={[styles.needleBottom, { backgroundColor: THEME.textTertiary }]} />
          </View>

          <View style={styles.centerDot} />
        </View>

        <View style={styles.qiblaMarker}>
          <Navigation size={20} color={THEME.primary} />
          <Text style={styles.qiblaMarkerText}>
            {t('Kaaba', 'Kaaba', 'الكعبة')}
          </Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>
            {t('Icyerekezo', 'Direction', 'الاتجاه')}
          </Text>
          <Text style={styles.infoValue}>{qiblaDirection.toFixed(1)}°</Text>
          <Text style={styles.infoDesc}>
            {t('Qibla iri mu burasirazuba', 'Qibla is to the Northeast', 'القبلة إلى الشمال الشرقي')}
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>
            {t('Ibiro', 'Distance', 'المسافة')}
          </Text>
          <Text style={styles.infoValue}>{distance.toLocaleString()} km</Text>
          <Text style={styles.infoDesc}>
            {t('Kuva aho uri', 'From your location', 'من موقعك')}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.calibrateBtn, Platform.OS === 'web' && { opacity: 0.5 }]}
        onPress={calibrate}
        disabled={Platform.OS === 'web'}
      >
        <Compass size={18} color="#FFFFFF" />
        <Text style={styles.calibrateText}>
          {Platform.OS === 'web'
            ? t('Compass sirakora kuri web', 'Compass not available on web', 'البوصلة غير متاحة على الويب')
            : t('Kugena Kompassu', 'Calibrate Compass', 'معايرة البوصلة')
          }
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 20 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: THEME.text },
  compassContainer: { alignItems: 'center', marginVertical: 20 },
  compass: {
    width: COMPASS_SIZE, height: COMPASS_SIZE, borderRadius: COMPASS_SIZE / 2,
    borderWidth: 3, borderColor: THEME.primary, alignItems: 'center', justifyContent: 'center',
    position: 'relative', backgroundColor: THEME.surface,
    shadowColor: THEME.primary, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15, shadowRadius: 20, elevation: 8,
  },
  direction: { position: 'absolute', fontSize: 18, fontWeight: '700', color: THEME.textSecondary },
  needle: { width: 4, height: '80%', alignItems: 'center', justifyContent: 'center' },
  needleTop: { flex: 1, width: '100%', borderRadius: 2 },
  needleBottom: { flex: 1, width: '100%', borderRadius: 2 },
  centerDot: {
    width: 14, height: 14, borderRadius: 7, position: 'absolute',
    backgroundColor: THEME.primary,
  },
  qiblaMarker: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16 },
  qiblaMarkerText: { color: THEME.primary, fontWeight: '600' },
  infoRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginBottom: 16 },
  infoCard: {
    flex: 1, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: THEME.border,
    alignItems: 'center', backgroundColor: THEME.surface,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  infoTitle: { fontSize: 13, marginBottom: 8, color: THEME.textSecondary },
  infoValue: { fontSize: 28, fontWeight: '700', color: THEME.primary },
  infoDesc: { fontSize: 12, marginTop: 6, textAlign: 'center', color: THEME.textTertiary },
  calibrateBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginHorizontal: 30, paddingVertical: 14, borderRadius: 14,
    backgroundColor: THEME.primary, shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  calibrateText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
});
