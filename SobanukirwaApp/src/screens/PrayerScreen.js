import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { fetchPrayerTimes } from '../services/api';
import ScreenBackground from '../components/ScreenBackground';

const PRAYER_NAMES = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const PRAYER_ICONS = ['moon', 'sunny', 'sunny', 'sunny', 'moon', 'moon'];
const PRAYER_AR = ['الفجر', 'الشروق', 'الظهر', 'العصر', 'المغرب', 'العشاء'];

export default function PrayerScreen() {
  const { t, COLORS, refreshing, refreshData } = useApp();
  const [prayerTimes, setPrayerTimes] = useState({});
  const [nextPrayer, setNextPrayer] = useState('');
  const [nextPrayerTime, setNextPrayerTime] = useState('');
  const [location, setLocation] = useState('Kigali, Rwanda');
  const [currentDate, setCurrentDate] = useState('');
  const [countdown, setCountdown] = useState('');
  const [source, setSource] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadPrayerTimes();
      const now = new Date();
      setCurrentDate(now.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
      const interval = setInterval(updateCountdown, 10000);
      return () => clearInterval(interval);
    }, [])
  );

  async function loadPrayerTimes() {
    try {
      const data = await fetchPrayerTimes(-1.9403, 29.8739);
      if (data && data.timings) {
        setPrayerTimes(data.timings);
        setSource(data.source || 'Aladhan API');
        calculateNextPrayer(data.timings);
        updateCountdownWithTimes(data.timings);
      }
    } catch (e) {}
  }

  function calculateNextPrayer(times) {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    for (const prayer of PRAYER_NAMES) {
      const timeStr = times[prayer];
      if (!timeStr) continue;
      const cleanTime = timeStr.replace(/ \(.*\)/, '');
      const [h, m] = cleanTime.split(':').map(Number);
      if (h * 60 + m > currentMinutes) {
        setNextPrayer(prayer);
        setNextPrayerTime(cleanTime);
        return;
      }
    }
    setNextPrayer(PRAYER_NAMES[0]);
    setNextPrayerTime(times[PRAYER_NAMES[0]]?.replace(/ \(.*\)/, '') || '');
  }

  function updateCountdownWithTimes(times) {
    const prayer = nextPrayer || PRAYER_NAMES.find(p => times[p]);
    const timeStr = times[prayer]?.replace(/ \(.*\)/, '');
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
    const cleanTime = prayerTimes[name].replace(/ \(.*\)/, '');
    const [h, m] = cleanTime.split(':').map(Number);
    const start = h * 60 + m;
    const idx = PRAYER_NAMES.indexOf(name);
    const nextName = PRAYER_NAMES[idx + 1];
    if (!nextName || !prayerTimes[nextName]) return currentMinutes >= start;
    const [nh, nm] = prayerTimes[nextName].replace(/ \(.*\)/, '').split(':').map(Number);
    return currentMinutes >= start && currentMinutes < (nh * 60 + nm);
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      <ScreenBackground imageKey="bg-prayer">
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { refreshData(); loadPrayerTimes(); }} tintColor={COLORS.secondary} colors={[COLORS.secondary]} />
        }
      >
        <Text style={[styles.headerTitle, { color: COLORS.secondary }]}>
          {t('Igihe cy\'Isengesho', 'Prayer Times', 'أوقات الصلاة')}
        </Text>

        <View style={[styles.locationCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
          <View style={styles.locationLeft}>
            <View style={[styles.locationIcon, { borderColor: COLORS.secondary }]}>
              <Ionicons name="location" size={16} color={COLORS.secondary} />
            </View>
            <View>
              <Text style={[styles.locationText, { color: COLORS.text }]}>{location}</Text>
              <Text style={[styles.locationCoords, { color: COLORS.textMuted }]}>-1.9403, 29.8739</Text>
            </View>
          </View>
          <TouchableOpacity style={[styles.refreshBtn, { borderColor: COLORS.border }]} onPress={loadPrayerTimes}>
            <Ionicons name="refresh" size={18} color={COLORS.secondary} />
          </TouchableOpacity>
        </View>

        <View style={[styles.dateCard, { backgroundColor: 'rgba(212,175,55,0.08)' }]}>
          <Text style={[styles.dateText, { color: COLORS.text }]}>{currentDate}</Text>
        </View>

        {source ? (
          <Text style={[styles.sourceText, { color: COLORS.textMuted }]}>
            {t('Izadatashe:', 'Source:', 'المصدر:')} {source}
          </Text>
        ) : null}

        <View style={styles.prayerGrid}>
          {PRAYER_NAMES.map((name, i) => {
            const time = prayerTimes[name]?.replace(/ \(.*\)/, '') || '--:--';
            const isNext = name === nextPrayer;
            const isCurrent = isCurrentPrayer(name);
            return (
              <View
                key={name}
                style={[
                  styles.prayerCard,
                  { backgroundColor: COLORS.surface, borderColor: COLORS.border },
                  isNext && { borderColor: COLORS.secondary, backgroundColor: 'rgba(212,175,55,0.1)' },
                  isCurrent && { borderColor: '#27ae60', backgroundColor: 'rgba(39,174,96,0.08)' }
                ]}
              >
                {isNext && (
                  <View style={[styles.cardBadge, { backgroundColor: COLORS.secondary }]}>
                    <Text style={[styles.cardBadgeText, { color: COLORS.primaryDark }]}>NEXT</Text>
                  </View>
                )}
                {isCurrent && (
                  <View style={[styles.cardBadge, { backgroundColor: '#27ae60' }]}>
                    <Text style={[styles.cardBadgeText, { color: '#fff' }]}>NOW</Text>
                  </View>
                )}
                <Ionicons name={PRAYER_ICONS[i]} size={24} color={isCurrent ? '#27ae60' : COLORS.secondary} />
                <Text style={[styles.prayerName, { color: COLORS.text }]}>{name}</Text>
                <Text style={[styles.prayerNameAr, { color: COLORS.textMuted }]}>{PRAYER_AR[i]}</Text>
                <Text style={[styles.prayerTime, { color: isNext ? COLORS.secondary : COLORS.text }]}>{time}</Text>
              </View>
            );
          })}
        </View>

        {nextPrayer && (
          <View style={[styles.nextCard, { backgroundColor: COLORS.secondary }]}>
            <Ionicons name="notifications" size={22} color={COLORS.primaryDark} />
            <Text style={[styles.nextLabel, { color: COLORS.primaryDark }]}>
              {t('Isengesho gikurikira:', 'Next Prayer:', 'الصلاة القادمة:')}
            </Text>
            <Text style={[styles.nextName, { color: COLORS.primaryDark }]}>{nextPrayer}</Text>
            <Text style={[styles.nextTime, { color: COLORS.primaryDark }]}>{nextPrayerTime}</Text>
            <Text style={[styles.nextCountdown, { color: COLORS.primaryDark }]}>nyuma ya {countdown}</Text>
          </View>
        )}
      </ScrollView>
      </ScreenBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, gap: 16, paddingBottom: 40 },
  headerTitle: { fontSize: 24, fontWeight: '700' },
  locationCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderRadius: 14, borderWidth: 1.5 },
  locationLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  locationIcon: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  locationText: { fontSize: 14, fontWeight: '600' },
  locationCoords: { fontSize: 11, marginTop: 2 },
  refreshBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  dateCard: { padding: 12, borderRadius: 14, alignItems: 'center' },
  dateText: { fontSize: 13, fontWeight: '500' },
  sourceText: { fontSize: 11, textAlign: 'center' },
  prayerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' },
  prayerCard: { width: '47%', padding: 18, borderRadius: 14, borderWidth: 1.5, alignItems: 'center', gap: 6, position: 'relative' },
  cardBadge: { position: 'absolute', top: 8, right: 8, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  cardBadgeText: { fontSize: 8, fontWeight: '800', letterSpacing: 0.5 },
  prayerName: { fontSize: 15, fontWeight: '600', marginTop: 4 },
  prayerNameAr: { fontSize: 11 },
  prayerTime: { fontSize: 18, fontWeight: '700', fontVariant: ['tabular-nums'], marginTop: 4 },
  nextCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 14, gap: 8, flexWrap: 'wrap' },
  nextLabel: { fontSize: 13, fontWeight: '600' },
  nextName: { fontSize: 16, fontWeight: '800' },
  nextTime: { fontSize: 16, fontWeight: '700' },
  nextCountdown: { fontSize: 12, fontWeight: '600' },
});
