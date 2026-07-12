import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Magnetometer } from 'expo-sensors';
import * as Location from 'expo-location';
import { useApp } from '../context/AppContext';
import { calculateQiblaDirection, calculateKaabaDistance } from '../utils/prayerCalc';
import ScreenBackground from '../components/ScreenBackground';

const { width } = Dimensions.get('window');
const COMPASS_SIZE = width * 0.7;
const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

export default function QiblaScreen() {
  const { t, COLORS } = useApp();
  const [heading, setHeading] = useState(0);
  const [qiblaDirection, setQiblaDirection] = useState(0);
  const [distance, setDistance] = useState(0);
  const [userCoords, setUserCoords] = useState({ lat: -1.9403, lng: 29.8739 });
  const subRef = useRef(null);

  useEffect(() => {
    initCompass();
    return () => { if (subRef.current) subRef.current.remove(); };
  }, []);

  async function initCompass() {
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
    if (subRef.current) subRef.current.remove();
    subRef.current = Magnetometer.addListener((data) => {
      const angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
      const headingVal = angle >= 0 ? angle : 360 + angle;
      setHeading(headingVal);
    });
  }

  function calibrate() {
    if (subRef.current) subRef.current.remove();
    Magnetometer.setMeasurementInterval(100);
    startMagnetometer();
  }

  const needleRotation = heading - qiblaDirection;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      <ScreenBackground imageKey="bg-qibla">
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: COLORS.secondary }]}>
          {t('Icyerekezo cya Qibla', 'Qibla Finder', 'محدد القبلة')}
        </Text>
      </View>

      <View style={styles.compassContainer}>
        <View style={[styles.compass, { borderColor: COLORS.secondary }]}>
          <Text style={[styles.direction, { top: 8, color: COLORS.text }]}>N</Text>
          <Text style={[styles.direction, { bottom: 8, color: COLORS.text }]}>S</Text>
          <Text style={[styles.direction, { left: 8, color: COLORS.text }]}>W</Text>
          <Text style={[styles.direction, { right: 8, color: COLORS.text }]}>E</Text>

          <View
            style={[
              styles.needle,
              { transform: [{ rotate: `${needleRotation}deg` }] }
            ]}
          >
            <View style={[styles.needleTop, { backgroundColor: COLORS.secondary }]} />
            <View style={[styles.needleBottom, { backgroundColor: COLORS.textMuted }]} />
          </View>

          <View style={[styles.centerDot, { backgroundColor: COLORS.secondary }]} />
        </View>

        <View style={styles.qiblaMarker}>
          <Ionicons name="location" size={24} color={COLORS.secondary} />
          <Text style={{ color: COLORS.secondary, fontWeight: '600' }}>
            {t('Kaaba', 'Kaaba', 'الكعبة')}
          </Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={[styles.infoCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
          <Text style={[styles.infoTitle, { color: COLORS.secondary }]}>
            {t('Icyerekezo', 'Direction', 'الاتجاه')}
          </Text>
          <Text style={[styles.infoValue, { color: COLORS.text }]}>{qiblaDirection.toFixed(1)}°</Text>
          <Text style={[styles.infoDesc, { color: COLORS.textMuted }]}>
            {t('Qibla iri mu burasirazuba', 'Qibla is to the Northeast', 'القبلة إلى الشمال الشرقي')}
          </Text>
        </View>

        <View style={[styles.infoCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
          <Text style={[styles.infoTitle, { color: COLORS.secondary }]}>
            {t('Ibiro', 'Distance', 'المسافة')}
          </Text>
          <Text style={[styles.infoValue, { color: COLORS.text }]}>{distance.toLocaleString()} km</Text>
          <Text style={[styles.infoDesc, { color: COLORS.textMuted }]}>
            {t('Kuva aho uri', 'From your location', 'من موقعك')}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={[styles.calibrateBtn, { borderColor: COLORS.secondary }]} onPress={calibrate}>
        <Ionicons name="compass" size={18} color={COLORS.secondary} />
        <Text style={[styles.calibrateText, { color: COLORS.secondary }]}>
          {t('Kugena Kompassu', 'Calibrate Compass', 'معايرة البوصلة')}
        </Text>
      </TouchableOpacity>
      </ScreenBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20 },
  headerTitle: { fontSize: 24, fontWeight: '700' },
  compassContainer: { alignItems: 'center', marginVertical: 20 },
  compass: { width: COMPASS_SIZE, height: COMPASS_SIZE, borderRadius: COMPASS_SIZE / 2, borderWidth: 3, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  direction: { position: 'absolute', fontSize: 18, fontWeight: '700' },
  needle: { width: 4, height: '80%', alignItems: 'center', justifyContent: 'center' },
  needleTop: { flex: 1, width: '100%', borderRadius: 2 },
  needleBottom: { flex: 1, width: '100%', borderRadius: 2 },
  centerDot: { width: 14, height: 14, borderRadius: 7, position: 'absolute' },
  qiblaMarker: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16 },
  infoRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginBottom: 16 },
  infoCard: { flex: 1, padding: 20, borderRadius: 16, borderWidth: 2, alignItems: 'center' },
  infoTitle: { fontSize: 13, marginBottom: 8 },
  infoValue: { fontSize: 28, fontWeight: '700' },
  infoDesc: { fontSize: 12, marginTop: 6, textAlign: 'center' },
  calibrateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 30, paddingVertical: 14, borderRadius: 14, borderWidth: 2 },
  calibrateText: { fontSize: 14, fontWeight: '600' },
});
