import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, Platform, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, RefreshCw, Bell, Clock } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { fetchPrayerTimes, fetchHijriDate } from '../services/api';
import { calculatePrayerTimes } from '../utils/prayerCalc';

let Location = null;
try { Location = require('expo-location'); } catch (e) {}

const PRAYER_NAMES = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const PRAYER_ICONS = ['moon', 'sunny', 'sunny', 'sunny', 'moon', 'moon'];
const PRAYER_AR = ['الفجر', 'الشروق', 'الظهر', 'العصر', 'المغرب', 'العشاء'];
const DEFAULT_LAT = -1.9403;
const DEFAULT_LNG = 29.8739;

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

export default function PrayerScreen() {
  const { t, refreshing, refreshData } = useApp();
  const [prayerTimes, setPrayerTimes] = useState({});
  const [nextPrayer, setNextPrayer] = useState('');
  const [nextPrayerTime, setNextPrayerTime] = useState('');
  const [location, setLocation] = useState('Kigali, Rwanda');
  const [coords, setCoords] = useState({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
  const [currentDate, setCurrentDate] = useState('');
  const [hijriDate, setHijriDate] = useState('');
  const [countdown, setCountdown] = useState('');
  const [source, setSource] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const now = new Date();
      setCurrentDate(now.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
      loadHijriDate();
      getUserLocation();
      const interval = setInterval(updateCountdown, 10000);
      return () => clearInterval(interval);
    }, [])
  );

  async function getUserLocation() {
    if (Platform.OS === 'web' || !Location) {
      await loadPrayerTimes(DEFAULT_LAT, DEFAULT_LNG);
      setLocationLoading(false);
      return;
    }
    try {
      setLocationLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });
        const rev = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
        if (rev && rev.length > 0) {
          const place = rev[0];
          setLocation(`${place.city || place.subregion || ''}, ${place.country || ''}`.replace(/^,\s*/, ''));
        }
        await loadPrayerTimes(lat, lng);
        setLocationLoading(false);
        return;
      }
    } catch (e) {}
    await loadPrayerTimes(DEFAULT_LAT, DEFAULT_LNG);
    setLocationLoading(false);
  }

  async function loadHijriDate() {
    const h = await fetchHijriDate();
    if (h) setHijriDate(h);
  }

  async function loadPrayerTimes(lat, lng) {
    try {
      const data = await fetchPrayerTimes(lat, lng);
      if (data && data.timings) {
        const sanitized = sanitizePrayerTimes(data.timings);
        if (sanitized) {
          setPrayerTimes(sanitized);
          setSource(data.source || 'Aladhan API');
          calculateNextPrayer(sanitized);
          updateCountdownWithTimes(sanitized);
          return;
        }
      }
    } catch (e) {}
    fallbackOfflineCalc(lat, lng);
  }

  function fallbackOfflineCalc(lat, lng) {
    const d = new Date();
    const times = calculatePrayerTimes(lat, lng, d.getFullYear(), d.getMonth() + 1, d.getDate());
    if (times) {
      setPrayerTimes(times);
      setSource('Offline Calculation');
      calculateNextPrayer(times);
      updateCountdownWithTimes(times);
    }
  }

  function sanitizePrayerTimes(timings) {
    const result = {};
    for (const name of PRAYER_NAMES) {
      const val = timings[name];
      if (!val) continue;
      const clean = val.replace(/ \(.*\)/, '');
      if (/^\d{1,2}:\d{2}$/.test(clean)) {
        result[name] = clean;
      }
    }
    if (Object.keys(result).length < 3) return null;
    return result;
  }

  function calculateNextPrayer(times) {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    for (const prayer of PRAYER_NAMES) {
      const timeStr = times[prayer];
      if (!timeStr) continue;
      const [h, m] = timeStr.split(':').map(Number);
      if (h * 60 + m > currentMinutes) {
        setNextPrayer(prayer);
        setNextPrayerTime(timeStr);
        return;
      }
    }
    setNextPrayer(PRAYER_NAMES[0]);
    setNextPrayerTime(times[PRAYER_NAMES[0]] || '');
  }

  function updateCountdownWithTimes(times) {
    const prayer = nextPrayer || PRAYER_NAMES.find(p => times[p]);
    const timeStr = times[prayer];
    if (!timeStr) return;
    const now = new Date();
    const [h, m] = timeStr.split(':').map(Number);
    const target = new Date(now);
    target.setHours(h, m, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);
    const diff = target - now;
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    setCountdown(hours > 0 ? `${hours}h ${mins}m` : `${mins}m`);
  }

  function updateCountdown() {
    if (nextPrayerTime) updateCountdownWithTimes(prayerTimes);
  }

  function isCurrentPrayer(name) {
    if (!prayerTimes[name]) return false;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [h, m] = prayerTimes[name].split(':').map(Number);
    const start = h * 60 + m;
    const idx = PRAYER_NAMES.indexOf(name);
    const nextName = PRAYER_NAMES[idx + 1];
    if (!nextName || !prayerTimes[nextName]) return currentMinutes >= start;
    const [nh, nm] = prayerTimes[nextName].split(':').map(Number);
    return currentMinutes >= start && currentMinutes < (nh * 60 + nm);
  }

  return (
    <ImageBackground source={require('../../assets/bg-prayer.jpg')} style={styles.bgImage} resizeMode="cover">
      <View style={styles.overlay} />
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { refreshData(); getUserLocation(); }} tintColor={THEME.secondary} colors={[THEME.secondary]} />
          }
        >
          <View style={styles.headerRow}>
            <Clock size={24} color={THEME.primary} />
            <Text style={styles.headerTitle}>
              {t('Igihe cy\'Isengesho', 'Prayer Times', 'أوقات الصلاة')}
            </Text>
          </View>

          <View style={styles.locationCard}>
            <View style={styles.locationLeft}>
              <View style={styles.locationIconWrap}>
                <MapPin size={16} color={THEME.primary} />
              </View>
              <View>
                <Text style={styles.locationText}>{location}</Text>
                <Text style={styles.locationCoords}>
                  {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.refreshBtn}
              onPress={getUserLocation}
              disabled={locationLoading}
            >
              <RefreshCw size={18} color={THEME.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.dateBadge}>
            <Text style={styles.dateText}>{currentDate}</Text>
            {hijriDate ? (
              <Text style={styles.hijriText}>{hijriDate}</Text>
            ) : null}
          </View>

          {source ? (
            <Text style={styles.sourceText}>
              {t('Izadatashe:', 'Source:', 'المصدر:')} {source}
            </Text>
          ) : null}

          <View style={styles.prayerGrid}>
            {PRAYER_NAMES.map((name, i) => {
              const time = prayerTimes[name] || '--:--';
              const isNext = name === nextPrayer;
              const isCurrent = isCurrentPrayer(name);
              return (
                <View
                  key={name}
                  style={[
                    styles.prayerCard,
                    isNext && styles.prayerCardNext,
                    isCurrent && styles.prayerCardCurrent,
                  ]}
                >
                  {isNext && (
                    <View style={styles.cardBadge}>
                      <Text style={styles.cardBadgeText}>NEXT</Text>
                    </View>
                  )}
                  {isCurrent && (
                    <View style={[styles.cardBadge, { backgroundColor: THEME.success }]}>
                      <Text style={styles.cardBadgeText}>NOW</Text>
                    </View>
                  )}
                  <Text style={[styles.prayerIconEmoji, isCurrent && { color: THEME.success }]}>{PRAYER_ICONS[i] === 'moon' ? '🌙' : '☀️'}</Text>
                  <Text style={styles.prayerName}>{name}</Text>
                  <Text style={styles.prayerNameAr}>{PRAYER_AR[i]}</Text>
                  <Text style={[styles.prayerTime, isNext && { color: THEME.primary }]}>{time}</Text>
                </View>
              );
            })}
          </View>

          {nextPrayer && (
            <LinearGradient
              colors={[THEME.primary, THEME.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.nextCard}
            >
              <Bell size={20} color="#FFFFFF" />
              <Text style={styles.nextLabel}>
                {t('Isengesho gikurikira:', 'Next Prayer:', 'الصلاة القادمة:')}
              </Text>
              <Text style={styles.nextName}>{nextPrayer}</Text>
              <Text style={styles.nextTime}>{nextPrayerTime}</Text>
              <Text style={styles.nextCountdown}>in {countdown}</Text>
            </LinearGradient>
          )}
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bgImage: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(6, 48, 44, 0.65)' },
  container: { flex: 1, backgroundColor: 'transparent' },
  scroll: { padding: 20, gap: 16, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#FFFFFF' },
  locationCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 14, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  locationLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  locationIconWrap: {
    width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.08)',
  },
  locationText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  locationCoords: { fontSize: 11, marginTop: 2, color: 'rgba(255,255,255,0.5)' },
  refreshBtn: {
    width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.08)',
  },
  dateBadge: {
    padding: 12, borderRadius: 20, alignItems: 'center', backgroundColor: 'rgba(15,118,110,0.85)',
  },
  dateText: { fontSize: 13, fontWeight: '500', color: '#FFFFFF' },
  hijriText: { fontSize: 13, fontWeight: '600', marginTop: 4, color: '#FFFFFF' },
  sourceText: { fontSize: 11, textAlign: 'center', color: 'rgba(255,255,255,0.6)' },
  prayerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' },
  prayerCard: {
    width: '31%', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', gap: 6, position: 'relative', backgroundColor: 'rgba(0,0,0,0.2)',
  },
  prayerCardNext: { borderColor: THEME.primary, backgroundColor: 'rgba(15,118,110,0.2)' },
  prayerCardCurrent: { borderColor: THEME.success, backgroundColor: 'rgba(16,185,129,0.2)' },
  cardBadge: {
    position: 'absolute', top: 8, right: 8, paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 8, backgroundColor: THEME.primary,
  },
  cardBadgeText: { fontSize: 8, fontWeight: '800', letterSpacing: 0.5, color: '#FFFFFF' },
  prayerIconEmoji: { fontSize: 22, marginTop: 4 },
  prayerName: { fontSize: 13, fontWeight: '500', marginTop: 4, color: '#FFFFFF' },
  prayerNameAr: { fontSize: 11, color: 'rgba(255,255,255,0.6)' },
  prayerTime: { fontSize: 15, fontWeight: '700', fontVariant: ['tabular-nums'], marginTop: 4, color: '#FFFFFF' },
  nextCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18,
    borderRadius: 14, gap: 8, flexWrap: 'wrap',
    shadowColor: THEME.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 12, elevation: 6,
  },
  nextLabel: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
  nextName: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  nextTime: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  nextCountdown: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.85)' },
});
