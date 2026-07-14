import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, RefreshControl, Animated, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { fetchPrayerTimes, fetchHijriDate, fetchAdhkar } from '../services/api';
import SilentBanner from '../components/SilentBanner';
import ScreenBackground from '../components/ScreenBackground';

const { width } = Dimensions.get('window');

const QURAN_VERSES = [
  { verse: 'إِنَّ اللَّهَ لَا يُضِيعُ أَجْرَ الْمُحْسِنِينَ', translation: 'Indeed, Allah does not allow to be lost the reward of those who do good.', surah: 'Yusuf: 120' },
  { verse: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ', translation: 'And whoever relies upon Allah, then He is sufficient for him.', surah: 'At-Talaq: 3' },
  { verse: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً', translation: 'Our Lord, give us in this world good and in the Hereafter good.', surah: 'Al-Baqarah: 201' },
  { verse: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا', translation: 'Indeed, with hardship comes ease.', surah: 'Ash-Sharh: 6' },
  { verse: 'فَاذْكُرُونِي أَذْكُرْكُمْ', translation: 'So remember Me; I will remember you.', surah: 'Al-Baqarah: 152' },
  { verse: 'وَلَا تَيْأَسُوا مِن رَّوْحِ اللَّهِ', translation: 'And do not despair of the mercy of Allah.', surah: 'Yusuf: 87' },
  { verse: 'إِنَّ اللَّهَ مَعَ الصَّابِرِينَ', translation: 'Indeed, Allah is with the patient.', surah: 'Al-Baqarah: 153' },
];

const PRAYER_NAMES = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

const FALLBACK_ADHKAR = [
  { id: 1, arabic: 'سُبْحَانَ اللَّهِ', transliteration: 'Subhanallah', translation_en: 'Glory be to Allah', count_target: 33, category: 'general' },
  { id: 2, arabic: 'الْحَمْدُ لِلَّهِ', transliteration: 'Alhamdulillah', translation_en: 'All praise is due to Allah', count_target: 33, category: 'general' },
  { id: 3, arabic: 'اللَّهُ أَكْبَرُ', transliteration: 'Allahu Akbar', translation_en: 'Allah is the Greatest', count_target: 34, category: 'general' },
  { id: 4, arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ', transliteration: 'La ilaha illallah', translation_en: 'There is no god but Allah alone', count_target: 100, category: 'morning' },
  { id: 5, arabic: 'أَسْتَغْفِرُ اللَّهَ', transliteration: 'Astaghfirullah', translation_en: 'I seek forgiveness from Allah', count_target: 100, category: 'morning' },
  { id: 6, arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ', transliteration: 'Allahumma salli ala Muhammad', translation_en: 'O Allah, send blessings upon Muhammad', count_target: 100, category: 'sleep' },
];

const FEATURE_CARDS = [
  { key: 'prayer', icon: 'time-outline', labelRw: 'Isengesho', labelEn: 'Prayer Times', labelAr: 'أوقات الصلاة', screen: 'Prayer' },
  { key: 'qibla', icon: 'compass-outline', labelRw: 'Qibla', labelEn: 'Qibla', labelAr: 'القبلة', screen: 'Qibla' },
  { key: 'quran', icon: 'book-outline', labelRw: 'Qur\'an', labelEn: 'Quran', labelAr: 'القرآن', screen: 'Quran' },
   { key: 'books', icon: 'library-outline', labelRw: 'Ibitabo', labelEn: 'Books', labelAr: 'كتب', screen: 'Books' },
  { key: 'videos', icon: 'play-circle-outline', labelRw: 'Amashusho', labelEn: 'Videos', labelAr: 'فيديو', screen: 'Videos' },
  { key: 'audio', icon: 'headset-outline', labelRw: 'Inyigisho', labelEn: 'Audio', labelAr: 'صوتي', screen: 'Audio' },
];

export default function HomeScreen({ navigation }) {
  const { t, COLORS, tracks, refreshing, refreshData, isEffectivelySilent, language, setLanguage, saveSetting } = useApp();
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [prayerTimes, setPrayerTimes] = useState({});
  const [nextPrayer, setNextPrayer] = useState('');
  const [nextPrayerTime, setNextPrayerTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [hijriDate, setHijriDate] = useState('');
  const [verseOfDay, setVerseOfDay] = useState(QURAN_VERSES[0]);
  const [adhkarList, setAdhkarList] = useState(FALLBACK_ADHKAR);
  const [adhkarCounts, setAdhkarCounts] = useState({});
  const glowAnim = useRef(new Animated.Value(0.3)).current;

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
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPrayerTimes();
      loadAdhkar();
    }, [])
  );

  async function loadAdhkar() {
    try {
      const data = await fetchAdhkar();
      if (data && data.length > 0) {
        setAdhkarList(data.slice(0, 6).map(a => ({
          id: a.id,
          arabic: a.arabic_text,
          transliteration: a.transliteration,
          translation_en: a.translation_en || '',
          count_target: a.count_target || 100,
          category: a.category || 'general',
        })));
      }
    } catch (e) {
      setAdhkarList(FALLBACK_ADHKAR);
    }
  }

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

  function incrementAdhkar(id) {
    const adhkar = adhkarList.find(a => a.id === id);
    const current = adhkarCounts[id] || 0;
    if (current < (adhkar?.count_target || 100)) {
      setAdhkarCounts(prev => ({ ...prev, [id]: current + 1 }));
    }
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
    return currentMinutes >= start && currentMinutes < (nh * 60 + nm);
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
      {/* Header */}
      <View style={[styles.headerRow, { borderBottomColor: 'rgba(212,175,55,0.12)' }]}>
        <TouchableOpacity style={styles.headerLogo}>
          <View style={[styles.headerLogoWrap, { borderColor: COLORS.secondary }]}>
            <Ionicons name="moon" size={14} color={COLORS.secondary} />
          </View>
          <Text style={[styles.headerLogoText, { color: COLORS.secondary }]}>Sobanukirwa</Text>
        </TouchableOpacity>
        <View style={styles.headerControls}>
          <TouchableOpacity
            style={[styles.headerBtn, { borderColor: 'rgba(212,175,55,0.2)' }]}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Adhkar' })}
          >
            <Ionicons name="hands" size={16} color={COLORS.secondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerBtn, { borderColor: 'rgba(212,175,55,0.2)', position: 'relative' }]}
            onPress={() => setShowLangDropdown(!showLangDropdown)}
          >
            <Ionicons name="globe" size={16} color={COLORS.secondary} />
            <Text style={[styles.langBtnText, { color: COLORS.secondary }]}>{language.toUpperCase()}</Text>
          </TouchableOpacity>
          {showLangDropdown && (
            <View style={[styles.langDropdown, { backgroundColor: COLORS.primaryDark, borderColor: COLORS.border }]}>
              {[
                { key: 'rw', label: 'Kinyarwanda' },
                { key: 'en', label: 'English' },
                { key: 'ar', label: 'العربية' },
              ].map(lang => (
                <TouchableOpacity
                  key={lang.key}
                  style={[styles.langOption, language === lang.key && { backgroundColor: COLORS.secondary }]}
                  onPress={() => {
                    setLanguage(lang.key);
                    saveSetting('language', lang.key);
                    setShowLangDropdown(false);
                  }}
                >
                  <Text style={[styles.langOptionText, { color: language === lang.key ? COLORS.primaryDark : COLORS.text }]}>
                    {lang.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <TouchableOpacity
            style={[styles.headerBtn, { borderColor: 'rgba(212,175,55,0.2)' }]}
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="settings-outline" size={16} color={COLORS.secondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshData} tintColor={COLORS.secondary} colors={[COLORS.secondary]} />
        }
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Animated.View style={[styles.heroGlow, { opacity: glowAnim, backgroundColor: 'rgba(212,175,55,0.08)' }]} />
          <View style={[styles.heroLogoWrap, { borderColor: COLORS.secondary }]}>
            <View style={[styles.heroLogoInner, { backgroundColor: 'rgba(212,175,55,0.12)' }]}>
              <Image source={require('../../assets/icon.png')} style={styles.heroLogoImage} resizeMode="contain" />
            </View>
          </View>
          <Text style={[styles.heroTitle, { color: COLORS.secondary }]}>Sobanukirwa</Text>
          <Text style={[styles.heroSubtitle, { color: COLORS.textMuted }]}>
            {t('Urumuri rw\'abemeramana', 'Light of Faith', 'نور الإيمان')}
          </Text>
          <View style={styles.heroDividerRow}>
            <View style={[styles.heroDividerLine, { backgroundColor: COLORS.secondary }]} />
            <View style={[styles.heroDividerDiamond, { backgroundColor: COLORS.secondary }]}>
              <View style={styles.heroDividerDiamondInner} />
            </View>
            <View style={[styles.heroDividerLine, { backgroundColor: COLORS.secondary }]} />
          </View>
          <View style={[styles.heroTag, { backgroundColor: 'rgba(212,175,55,0.08)', borderColor: 'rgba(212,175,55,0.25)' }]}>
            <Ionicons name="star" size={11} color={COLORS.secondary} />
            <Text style={[styles.heroTagText, { color: COLORS.secondary }]}>
              {t('Ubumenyi bw\'ubusilamu', 'Islamic Knowledge', 'المعرفة الإسلامية')}
            </Text>
            <Ionicons name="star" size={11} color={COLORS.secondary} />
          </View>
        </View>

        {/* Verse of the Day */}
        <View style={[styles.verseCard, { backgroundColor: 'rgba(212,175,55,0.08)', borderColor: 'rgba(212,175,55,0.25)' }]}>
          <Ionicons name="book" size={22} color={COLORS.secondary} />
          <View style={styles.verseContent}>
            <Text style={[styles.verseArabic, { color: COLORS.secondary }]}>{verseOfDay.verse}</Text>
            <Text style={[styles.verseTranslation, { color: COLORS.textMuted }]}>{verseOfDay.translation}</Text>
            <Text style={[styles.verseSurah, { color: COLORS.secondary }]}>{verseOfDay.surah}</Text>
          </View>
        </View>

        {/* Prayer Times Widget */}
        {prayerTimes.Fajr && (
          <View style={[styles.prayerWidget, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
            <View style={styles.prayerWidgetHeader}>
              <Ionicons name="time" size={18} color={COLORS.secondary} />
              <Text style={[styles.prayerWidgetTitle, { color: COLORS.secondary }]}>
                {t('Isengesho', 'Prayer Times', 'أوقات الصلاة')}
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
                <Ionicons name="notifications" size={14} color={COLORS.secondary} />
                <Text style={[styles.nextPrayerFooterText, { color: COLORS.secondary }]}>
                  {nextPrayer}: {nextPrayerTime?.replace(/ \(.*\)/, '')} ({getNextPrayerCountdown()})
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Daily Adhkar Section */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLeft}>
            <Ionicons name="hands" size={18} color={COLORS.secondary} />
            <Text style={[styles.sectionTitle, { color: COLORS.secondary }]}>
              {t('Adhkar za Buri Munsi', 'Daily Adhkar', 'أذكار اليومية')}
            </Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'Adhkar' })}>
            <Text style={[styles.seeAllText, { color: COLORS.secondary }]}>
              {t('Raba Byose', 'See All', 'عرض الكل')} →
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.adhkarScroll}>
          {adhkarList.map((adhkar) => {
            const count = adhkarCounts[adhkar.id] || 0;
            const maxCount = adhkar.count_target || 100;
            const isComplete = count >= maxCount;
            const progress = maxCount > 0 ? count / maxCount : 0;
            return (
              <TouchableOpacity
                key={adhkar.id}
                style={[styles.adhkarCard, { backgroundColor: COLORS.surface, borderColor: isComplete ? '#27ae60' : COLORS.border }]}
                onPress={() => incrementAdhkar(adhkar.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.adhkarProgressTrack, { backgroundColor: 'rgba(255,255,255,0.06)' }]}>
                  <View style={[styles.adhkarProgressFill, { width: `${progress * 100}%`, backgroundColor: isComplete ? '#27ae60' : COLORS.secondary }]} />
                </View>
                <Text style={[styles.adhkarArabic, { color: COLORS.secondary }]} numberOfLines={2}>{adhkar.arabic}</Text>
                <Text style={[styles.adhkarTranslit, { color: COLORS.text }]} numberOfLines={1}>{adhkar.transliteration}</Text>
                <Text style={[styles.adhkarTranslation, { color: COLORS.textMuted }]} numberOfLines={1}>{adhkar.translation_en}</Text>
                <View style={styles.adhkarCounter}>
                  <View style={[styles.adhkarCountBadge, { backgroundColor: isComplete ? 'rgba(39,174,96,0.15)' : 'rgba(212,175,55,0.12)' }]}>
                    <Text style={[styles.adhkarCountText, { color: isComplete ? '#27ae60' : COLORS.secondary }]}>{count}/{maxCount}</Text>
                  </View>
                  {isComplete ? (
                    <Ionicons name="checkmark-circle" size={18} color="#27ae60" />
                  ) : (
                    <Ionicons name="add-circle" size={22} color={COLORS.secondary} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Quick Access Grid */}
        <View style={styles.featureGrid}>
          {FEATURE_CARDS.map((card) => (
            <TouchableOpacity
              key={card.key}
              style={[styles.featureCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}
              onPress={() => navigateToFeature(card.screen)}
              activeOpacity={0.7}
            >
              <View style={[styles.featureIconWrap, { backgroundColor: 'rgba(212,175,55,0.1)' }]}>
                <Ionicons name={card.icon} size={26} color={COLORS.secondary} />
              </View>
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
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1 },
  headerLogo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerLogoWrap: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  headerLogoText: { fontSize: 16, fontWeight: '700', fontFamily: 'serif' },
  headerControls: { flexDirection: 'row', alignItems: 'center', gap: 6, position: 'relative' },
  headerBtn: { width: 34, height: 34, borderRadius: 17, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(30,60,92,0.3)', flexDirection: 'row', gap: 2 },
  langBtnText: { fontSize: 9, fontWeight: '700' },
  langDropdown: {
    position: 'absolute', top: 40, right: 80, minWidth: 140,
    borderRadius: 12, borderWidth: 1.5, overflow: 'hidden', zIndex: 100,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 10,
  },
  langOption: { paddingVertical: 10, paddingHorizontal: 14 },
  langOptionText: { fontSize: 13, fontWeight: '600' },
  scroll: { padding: 20, paddingBottom: 40, gap: 16 },
  hero: { alignItems: 'center', paddingVertical: 16, position: 'relative' },
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
  heroSubtitle: { fontSize: 13, marginTop: 4, textAlign: 'center', letterSpacing: 0.5 },
  heroDividerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  heroDividerLine: { width: 40, height: 2, borderRadius: 1 },
  heroDividerDiamond: { width: 10, height: 10, borderRadius: 2, transform: [{ rotate: '45deg' }], alignItems: 'center', justifyContent: 'center' },
  heroDividerDiamondInner: { width: 4, height: 4, borderRadius: 1, backgroundColor: '#0a1220' },
  heroTag: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, marginTop: 12,
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

  /* Adhkar Section */
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  seeAllText: { fontSize: 13, fontWeight: '600' },
  adhkarScroll: { gap: 12, paddingVertical: 4 },
  adhkarCard: {
    width: 180, padding: 14, borderRadius: 16, borderWidth: 1.5, gap: 6,
    overflow: 'hidden',
  },
  adhkarProgressTrack: { position: 'absolute', top: 0, left: 0, right: 0, height: 3 },
  adhkarProgressFill: { height: '100%', borderRadius: 2 },
  adhkarArabic: { fontSize: 18, fontFamily: 'serif', textAlign: 'center', lineHeight: 28, marginTop: 6 },
  adhkarTranslit: { fontSize: 12, fontWeight: '600', textAlign: 'center', marginTop: 4 },
  adhkarTranslation: { fontSize: 10, textAlign: 'center', fontStyle: 'italic' },
  adhkarCounter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 },
  adhkarCountBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  adhkarCountText: { fontSize: 12, fontWeight: '700', fontVariant: ['tabular-nums'] },

  /* Feature Grid */
  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' },
  featureCard: {
    width: (width - 52) / 3, paddingVertical: 18, borderRadius: 16, borderWidth: 1.5, alignItems: 'center', gap: 8,
  },
  featureIconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  featureLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
});
