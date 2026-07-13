import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, RefreshControl, Animated, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { fetchPrayerTimes, fetchHijriDate } from '../services/api';
import SilentBanner from '../components/SilentBanner';
import ScreenBackground from '../components/ScreenBackground';

const { width } = Dimensions.get('window');

const QURAN_VERSES = [
  { verse: 'إِنَّ اللَّهَ لَا يُضِيعُ أَجْرَ الْمُحْسِنِينَ', translation: 'Indeed, Allah does not allow to be lost the reward of those who do good.', surah: 'Yusuf: 120' },
  { verse: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ', translation: 'And whoever relies upon Allah, then He is sufficient for him.', surah: 'At-Talaq: 3' },
  { verse: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً', translation: 'Our Lord, give us in this world good and in the Hereafter good.', surah: 'Al-Baqarah: 201' },
  { verse: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا', translation: 'Indeed, with hardship comes ease.', surah: 'Ash-Sharh: 6' },
  { verse: 'وَإِلَٰهُكُمْ إِلَٰهٌ وَاحِدٌ ۖ لَّا إِلَٰهَ إِلَّا هُوَ الرَّحْمَٰنُ الرَّحِيمُ', translation: 'And your god is one God. There is no deity except Him, the Entirely Merciful, the Especially Merciful.', surah: 'Al-Baqarah: 163' },
  { verse: 'فَاذْكُرُونِي أَذْكُرْكُمْ', translation: 'So remember Me; I will remember you.', surah: 'Al-Baqarah: 152' },
  { verse: 'وَلَا تَيْأَسُوا مِن رَّوْحِ اللَّهِ', translation: 'And do not despair of the mercy of Allah.', surah: 'Yusuf: 87' },
  { verse: 'إِنَّ اللَّهَ مَعَ الصَّابِرِينَ', translation: 'Indeed, Allah is with the patient.', surah: 'Al-Baqarah: 153' },
];

const PRAYER_NAMES = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const PRAYER_NAMES_RW = ['Subuho', 'Izera', 'Umunsi', 'Impera', 'Imihiganiriro', 'Ijoro'];
const PRAYER_NAMES_AR = ['الفجر', 'الشروق', 'الظهر', 'العصر', 'المغرب', 'العشاء'];

const FEATURE_CARDS = [
  { key: 'prayer', icon: 'time-outline', labelRw: 'Igihe cy\'Isengesho', labelEn: 'Prayer Times', labelAr: 'أوقات الصلاة', screen: 'Prayer' },
  { key: 'qibla', icon: 'navigate-outline', labelRw: 'Icyerekezo cya Qibla', labelEn: 'Qibla', labelAr: 'القبلة', screen: 'Qibla' },
  { key: 'quran', icon: 'book-outline', labelRw: 'Qur\'an', labelEn: 'Quran', labelAr: 'القرآن', screen: 'Quran' },
  { key: 'books', icon: 'book', labelRw: 'Amatabo', labelEn: 'Books', labelAr: 'كتب', screen: 'Books' },
  { key: 'videos', icon: 'videocam-outline', labelRw: 'Amashusho', labelEn: 'Videos', labelAr: 'فيديو', screen: 'Videos' },
];

export default function HomeScreen({ navigation }) {
  const { t, COLORS, tracks, refreshing, refreshData, isEffectivelySilent } = useApp();
  const [prayerTimes, setPrayerTimes] = useState({});
  const [nextPrayer, setNextPrayer] = useState('');
  const [nextPrayerTime, setNextPrayerTime] = useState('');
  const [location, setLocation] = useState('Kigali, Rwanda');
  const [currentDate, setCurrentDate] = useState('');
  const [hijriDate, setHijriDate] = useState('');
  const [verseOfDay, setVerseOfDay] = useState(QURAN_VERSES[0]);
  const glowAnim = useRef(new Animated.Value(0.3)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
    setVerseOfDay(QURAN_VERSES[dayOfYear % QURAN_VERSES.length]);
    setCurrentDate(today.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    fetchHijriDate().then(h => { if (h) setHijriDate(h); });
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2500, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.3, duration: 2500, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.timing(rotateAnim, { toValue: 1, duration: 20000, useNativeDriver: true })
    ).start();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPrayerTimes();
    }, [])
  );

  async function loadPrayerTimes() {
    try {
      const data = await fetchPrayerTimes(-1.9403, 29.8739);
      if (data && data.timings) {
        setPrayerTimes(data.timings);
        calculateNextPrayer(data.timings);
      }
    } catch (e) {}
  }

  function calculateNextPrayer(times) {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    for (const prayer of PRAYER_NAMES) {
      const timeStr = times[prayer];
      if (!timeStr) continue;
      const [h, m] = timeStr.replace(/ \(.*\)/, '').split(':').map(Number);
      const prayerMinutes = h * 60 + m;
      if (prayerMinutes > currentMinutes) {
        setNextPrayer(prayer);
        setNextPrayerTime(timeStr);
        return;
      }
    }
    setNextPrayer(PRAYER_NAMES[0]);
    setNextPrayerTime(times[PRAYER_NAMES[0]] || '');
  }

  function getNextPrayerCountdown() {
    if (!nextPrayerTime) return '';
    const now = new Date();
    const [h, m] = nextPrayerTime.replace(/ \(.*\)/, '').split(':').map(Number);
    const target = new Date(now);
    target.setHours(h, m, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);
    const diff = target - now;
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  }

  function isCurrentPrayer(name) {
    if (!prayerTimes[name]) return false;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [h, m] = prayerTimes[name].replace(/ \(.*\)/, '').split(':').map(Number);
    const start = h * 60 + m;
    const idx = PRAYER_NAMES.indexOf(name);
    const nextName = PRAYER_NAMES[idx + 1];
    if (!nextName || !prayerTimes[nextName]) return currentMinutes >= start;
    const [nh, nm] = prayerTimes[nextName].replace(/ \(.*\)/, '').split(':').map(Number);
    const end = nh * 60 + nm;
    return currentMinutes >= start && currentMinutes < end;
  }

  function navigateToFeature(screen) {
    if (screen === 'Qibla') {
      navigation.navigate('Qibla');
    } else {
      navigation.navigate('MainTabs', { screen });
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      <SilentBanner visible={isEffectivelySilent} />
      <ScreenBackground imageKey="bg-home">
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshData} tintColor={COLORS.secondary} colors={[COLORS.secondary]} />
        }
      >
        <View style={styles.hero}>
          {/* Rotating decorative ring */}
          <View style={[styles.heroDecorRing, { borderColor: 'rgba(212,175,55,0.18)' }]}>
            <Animated.View style={[styles.heroDecorDot, { top: -3, alignSelf: 'center', backgroundColor: COLORS.secondary }]} />
            <Animated.View style={[styles.heroDecorDot, { bottom: -3, alignSelf: 'center', backgroundColor: COLORS.secondary }]} />
          </View>
          <Animated.View style={[styles.heroGlow, { opacity: glowAnim, backgroundColor: 'rgba(212,175,55,0.1)' }]} />
          <View style={[styles.heroLogoWrap, { borderColor: COLORS.secondary }]}>
            <View style={[styles.heroLogoInner, { backgroundColor: 'rgba(212,175,55,0.12)' }]}>
              <Image source={require('../../assets/icon.png')} style={styles.heroLogoImage} resizeMode="contain" />
            </View>
          </View>
          <Text style={[styles.heroTitle, { color: COLORS.secondary }]}>Sobanukirwa</Text>
          <Text style={[styles.heroSubtitle, { color: COLORS.textMuted }]}>
            {t('Urumuri rw\'Imyemero', 'Light of Faith', 'نور الإيمان')}
          </Text>
          {/* Diamond divider */}
          <View style={styles.heroDividerRow}>
            <View style={[styles.heroDividerLine, { backgroundColor: COLORS.secondary }]} />
            <View style={[styles.heroDividerDiamond, { backgroundColor: COLORS.secondary }]}>
              <View style={styles.heroDividerDiamondInner} />
            </View>
            <View style={[styles.heroDividerLine, { backgroundColor: COLORS.secondary }]} />
          </View>
          {/* Tagline */}
          <View style={[styles.heroTag, { backgroundColor: 'rgba(212,175,55,0.08)', borderColor: 'rgba(212,175,55,0.25)' }]}>
            <Ionicons name="star" size={11} color={COLORS.secondary} />
            <Text style={[styles.heroTagText, { color: COLORS.secondary }]}>
              {t('Ubumenyi bw\'Igisilamu', 'Islamic Knowledge', 'المعرفة الإسلامية')}
            </Text>
            <Ionicons name="star" size={11} color={COLORS.secondary} />
          </View>
        </View>

        <View style={[styles.verseCard, { backgroundColor: 'rgba(212,175,55,0.08)', borderColor: 'rgba(212,175,55,0.25)' }]}>
          <Ionicons name="book" size={24} color={COLORS.secondary} />
          <View style={styles.verseContent}>
            <Text style={[styles.verseArabic, { color: COLORS.secondary }]}>{verseOfDay.verse}</Text>
            <Text style={[styles.verseTranslation, { color: COLORS.textMuted }]}>{verseOfDay.translation}</Text>
            <Text style={[styles.verseSurah, { color: COLORS.secondary }]}>{verseOfDay.surah}</Text>
          </View>
        </View>

        {prayerTimes.Fajr && (
          <View style={[styles.prayerWidget, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
            <View style={styles.prayerWidgetHeader}>
              <Ionicons name="time" size={18} color={COLORS.secondary} />
              <Text style={[styles.prayerWidgetTitle, { color: COLORS.secondary }]}>
                {t('Ibihe by\'Isengesho', 'Prayer Times', 'أوقات الصلاة')}
              </Text>
              <View style={[styles.dateBadge, { backgroundColor: 'rgba(212,175,55,0.12)' }]}>
                <Text style={[styles.dateText, { color: COLORS.secondary }]} numberOfLines={1}>{currentDate}</Text>
                {hijriDate ? <Text style={[styles.dateText, { color: COLORS.secondary, marginTop: 2 }]} numberOfLines={1}>{hijriDate}</Text> : null}
              </View>
            </View>
            <View style={[styles.prayerWidgetLine, { backgroundColor: 'rgba(212,175,55,0.15)' }]} />
            {PRAYER_NAMES.map((name) => {
              const time = prayerTimes[name]?.replace(/ \(.*\)/, '') || '--:--';
              const isNext = name === nextPrayer;
              const isCurrent = isCurrentPrayer(name);
              return (
                <View
                  key={name}
                  style={[
                    styles.prayerRow,
                    isNext && { backgroundColor: 'rgba(212,175,55,0.1)', borderColor: COLORS.secondary, borderWidth: 1 },
                    isCurrent && { backgroundColor: 'rgba(39,174,96,0.1)', borderColor: '#27ae60', borderWidth: 1 }
                  ]}
                >
                  <Text style={[styles.prayerName, { color: isCurrent ? '#27ae60' : COLORS.text }]}>{name}</Text>
                  <Text style={[styles.prayerTime, { color: isNext ? COLORS.secondary : COLORS.text }]}>{time}</Text>
                  {isNext && (
                    <View style={[styles.nextBadge, { backgroundColor: COLORS.secondary }]}>
                      <Text style={[styles.nextBadgeText, { color: COLORS.primaryDark }]}>NEXT</Text>
                    </View>
                  )}
                </View>
              );
            })}
            {nextPrayer && (
              <View style={[styles.nextPrayerFooter, { borderTopColor: 'rgba(212,175,55,0.15)' }]}>
                <Ionicons name="notifications" size={16} color={COLORS.secondary} />
                <Text style={[styles.nextPrayerFooterText, { color: COLORS.secondary }]}>
                  {nextPrayer}: {nextPrayerTime?.replace(/ \(.*\)/, '')} ({getNextPrayerCountdown()})
                </Text>
              </View>
            )}
          </View>
        )}

        {tracks.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: COLORS.secondary }]}>
                {t('Inyigisho z\'Icyubahiro', 'Featured Audio', 'الدروس المميزة')}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'Audio' })}>
                <Text style={[styles.seeAllText, { color: COLORS.secondary }]}>
                  {t('Raba Byose', 'See All', 'عرض الكل')} →
                </Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredScroll}>
              {tracks.slice(0, 6).map((track, index) => {
                const catName = track.category_name || track.category || '';
                const artistName = track.artist_name || track.artist || '';
                return (
                  <TouchableOpacity
                    key={track.id || index}
                    style={[styles.featuredCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}
                    onPress={() => navigation.navigate('AudioPlayer', { category: catName, tracks: tracks.slice(0, 6), startIndex: index })}
                    activeOpacity={0.75}
                  >
                    <View style={[styles.featuredPlayBtn, { borderColor: COLORS.secondary }]}>
                      <Ionicons name="play" size={18} color={COLORS.secondary} />
                    </View>
                    <Text style={[styles.featuredTitle, { color: COLORS.text }]} numberOfLines={2}>
                      {t(track.title, track.title_en || track.title, track.title_ar || track.title)}
                    </Text>
                    {artistName ? (
                      <Text style={[styles.featuredArtist, { color: COLORS.textGold }]} numberOfLines={1}>
                        {artistName}
                      </Text>
                    ) : null}
                    {catName ? (
                      <Text style={[styles.featuredCategory, { color: COLORS.textMuted }]} numberOfLines={1}>
                        {catName}
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </>
        )}

        <Text style={[styles.sectionTitle, { color: COLORS.secondary }]}>
          {t('Hitamwo', 'Quick Access', 'وصول سريع')}
        </Text>
        <View style={styles.featureGrid}>
          {FEATURE_CARDS.map((card) => (
            <TouchableOpacity
              key={card.key}
              style={[styles.featureCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}
              onPress={() => navigateToFeature(card.screen)}
              activeOpacity={0.7}
            >
              <Ionicons name={card.icon} size={28} color={COLORS.secondary} />
              <Text style={[styles.featureLabel, { color: COLORS.text }]}>
                {t(card.labelRw, card.labelEn, card.labelAr)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>


      </ScrollView>
      </ScreenBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40, gap: 18 },
  hero: { alignItems: 'center', paddingVertical: 20, position: 'relative' },
  heroDecorRing: {
    position: 'absolute', top: -5, width: 140, height: 140, borderRadius: 70,
    borderWidth: 1, borderStyle: 'dashed', transform: [{ rotate: '0deg' }],
  },
  heroDecorDot: { position: 'absolute', width: 5, height: 5, borderRadius: 2.5 },
  heroGlow: { position: 'absolute', top: -20, width: 200, height: 200, borderRadius: 100 },
  heroLogoWrap: {
    width: 80, height: 80, borderRadius: 40, borderWidth: 3,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#d4af37', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.35, shadowRadius: 20, elevation: 10,
    marginBottom: 12,
  },
  heroLogoInner: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  heroLogoImage: { width: 52, height: 52, borderRadius: 26 },
  heroTitle: { fontSize: 26, fontWeight: '700', fontFamily: 'serif', textAlign: 'center' },
  heroSubtitle: { fontSize: 13, marginTop: 6, textAlign: 'center', letterSpacing: 0.5 },
  heroDividerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14 },
  heroDividerLine: { width: 40, height: 2, borderRadius: 1 },
  heroDividerDiamond: { width: 10, height: 10, borderRadius: 2, transform: [{ rotate: '45deg' }], alignItems: 'center', justifyContent: 'center' },
  heroDividerDiamondInner: { width: 4, height: 4, borderRadius: 1, backgroundColor: '#0a1220' },
  heroTag: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, marginTop: 14,
  },
  heroTagText: { fontSize: 11, fontWeight: '600' },
  verseCard: { flexDirection: 'row', padding: 16, borderRadius: 16, borderWidth: 1, gap: 12, alignItems: 'flex-start' },
  verseContent: { flex: 1 },
  verseArabic: { fontSize: 18, fontFamily: 'serif', textAlign: 'right', lineHeight: 30 },
  verseTranslation: { fontSize: 12, marginTop: 8, fontStyle: 'italic', lineHeight: 18 },
  verseSurah: { fontSize: 11, fontWeight: '600', marginTop: 6 },
  prayerWidget: { borderRadius: 16, borderWidth: 1.5, padding: 16 },
  prayerWidgetHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  prayerWidgetTitle: { flex: 1, fontSize: 15, fontWeight: '600' },
  dateBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  dateText: { fontSize: 10, fontWeight: '600' },
  prayerWidgetLine: { height: 1, marginBottom: 8 },
  prayerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, marginBottom: 4 },
  prayerName: { flex: 1, fontSize: 14, fontWeight: '500' },
  prayerTime: { fontSize: 15, fontWeight: '700', fontVariant: ['tabular-nums'] },
  nextBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginLeft: 10 },
  nextBadgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  nextPrayerFooter: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, paddingTop: 10, borderTopWidth: 1 },
  nextPrayerFooterText: { fontSize: 13, fontWeight: '600', flex: 1 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 4 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  seeAllText: { fontSize: 13, fontWeight: '600' },
  featuredScroll: { gap: 10, paddingVertical: 4 },
  featuredCard: { width: 150, padding: 14, borderRadius: 14, borderWidth: 1.5, gap: 6 },
  featuredPlayBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  featuredTitle: { fontSize: 13, fontWeight: '600', lineHeight: 17 },
  featuredArtist: { fontSize: 11, fontWeight: '500' },
  featuredCategory: { fontSize: 10 },
  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' },
  featureCard: { width: (width - 52) / 2, paddingVertical: 22, borderRadius: 16, borderWidth: 1.5, alignItems: 'center', gap: 10 },
  featureLabel: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
});
