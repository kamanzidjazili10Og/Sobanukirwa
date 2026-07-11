import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Magnetometer } from 'expo-sensors';
import { useApp } from '../context/AppContext';
import ScreenBackground from '../components/ScreenBackground';

const { width } = Dimensions.get('window');
const COMPASS_SIZE = width * 0.7;

export default function QiblaScreen() {
  const { t, COLORS } = useApp();
  const [heading, setHeading] = useState(0);
  const [qiblaDirection, setQiblaDirection] = useState(0);

  useEffect(() => {
    const subscription = Magnetometer.addListener((data) => {
      const angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
      const headingVal = angle >= 0 ? angle : 360 + angle;
      setHeading(headingVal);
    });

    const KAABA_LAT = 21.4225;
    const KAABA_LNG = 39.8262;
    const userLat = -1.9403;
    const userLng = 29.8739;

    const dLng = (KAABA_LNG - userLng) * (Math.PI / 180);
    const lat1 = userLat * (Math.PI / 180);
    const lat2 = KAABA_LAT * (Math.PI / 180);

    const y = Math.sin(dLng);
    const x = Math.cos(lat1) * Math.tan(lat2) - Math.sin(lat1) * Math.cos(dLng);
    let qibla = Math.atan2(y, x) * (180 / Math.PI);
    qibla = (qibla + 360) % 360;
    setQiblaDirection(qibla);

    return () => subscription.remove();
  }, []);

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

      <View style={[styles.infoCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
        <Text style={[styles.infoTitle, { color: COLORS.secondary }]}>
          {t('Icyerekezo', 'Direction', 'الاتجاه')}
        </Text>
        <Text style={[styles.infoValue, { color: COLORS.text }]}>{qiblaDirection.toFixed(1)}°</Text>
        <Text style={[styles.infoDesc, { color: COLORS.textMuted }]}>
          {t('Qibla iri mu burasirazuba', 'Qibla is to the Northeast', 'القبلة إلى الشمال الشرقي')}
        </Text>
      </View>
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
  infoCard: { margin: 30, padding: 24, borderRadius: 20, borderWidth: 2, alignItems: 'center' },
  infoTitle: { fontSize: 14, marginBottom: 8 },
  infoValue: { fontSize: 36, fontWeight: '700' },
  infoDesc: { fontSize: 14, marginTop: 6, textAlign: 'center' },
});
