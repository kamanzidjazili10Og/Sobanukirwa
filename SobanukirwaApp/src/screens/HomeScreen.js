import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, RefreshControl, Animated, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { fetchPrayerTimes, fetchHijriDate, fetchAdhkar } from '../services/api';
import SilentBanner from '../components/SilentBanner';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Home, BookOpen, Headphones, PlayCircle, Library, Settings, Globe, ChevronRight, Clock, Compass, Hand, Star, Heart } from 'lucide-react-native';

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

const PRAYER_NAMES = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

const FALLBACK_ADHKAR = [
  { id: 1, arabic: 'سُبْحَانَ اللَّهِ', transliteration: 'Subhanallah', translation_en: 'Glory be to Allah', count_target: 33, category: 'general' },
  { id: 2, arabic: 'الْحَمْدُ لِلَّهِ', transliteration: 'Alhamdulillah', translation_en: 'All praise is due to Allah', count_target: 33, category: 'general' },
  { id: 3, arabic: 'اللَّهُ أَكْبَرُ', transliteration: 'Allahu Akbar', translation_en: 'Allah is the Greatest', count_target: 34, category: 'general' },
  { id: 4, arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ', transliteration: 'La ilaha illallah', translation_en: 'There is no god but Allah alone', count_target: 100, category: 'morning' },
  { id: 5, arabic: 'أَسْتَغْفِرُ اللَّهَ', transliteration: 'Astaghfirullah', translation_en: 'I seek forgiveness from Allah', count_target: 100, category: 'morning' },
  { id: 6, arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ', transliteration: 'Allahumma salli ala Muhammad', translation_en: 'O Allah, send blessings upon Muhammad', count_target: 100, category: 'sleep' },
];

const FEATURE_CARDS = [
  { key: 'prayer', iconComponent: Clock, labelRw: 'Isengesho', labelEn: 'Prayer Times', labelAr: 'أوقات الصلاة', descRw: 'Ibihe nyabyo by\'amasengesho', descEn: 'Daily prayer times', descAr: 'أوقات الصلاة اليومية', screen: 'Prayer' },
  { key: 'qibla', iconComponent: Compass, labelRw: 'Qibla', labelEn: 'Qibla', labelAr: 'القبلة', descRw: 'Shakisha icyerekezo cya Kaaba', descEn: 'Find Kaaba direction', descAr: 'اكتشف اتجاه الكعبة', screen: 'Qibla' },
  { key: 'quran', iconComponent: BookOpen, labelRw: "Qor'an", labelEn: 'Quran', labelAr: 'القرآن', descRw: 'Soma untege amatwi', descEn: 'Read & Listen', descAr: 'اقرأ واستمع', screen: 'Quran' },
  { key: 'audio', iconComponent: Headphones, labelRw: 'Inyigisho', labelEn: 'Audio', labelAr: 'صوتي', descRw: 'Amasomo ya audio', descEn: 'Audio lessons', descAr: 'دروس صوتية', screen: 'Audio' },
  { key: 'books', iconComponent: Library, labelRw: 'Ibitabo', labelEn: 'Books', labelAr: 'كتب', descRw: 'Ibitabo by\'ubumenyi', descEn: 'Islamic books', descAr: 'كتب إسلامية', screen: 'Books' },
  { key: 'videos', iconComponent: PlayCircle, labelRw: 'Amashusho', labelEn: 'Videos', labelAr: 'فيديو', descRw: 'Amashusho y\'inyigisho', descEn: 'Teaching videos', descAr: 'فيديوهات تعليمية', screen: 'Videos' },
];

const C = {
  primary: '#0F766E', secondary: '#14B8A6', accent: '#F59E0B',
  bg: '#F8FAFC', surface: '#FFFFFF', card: '#FFFFFF',
  text: '#111827', textSec: '#6B7280', textTer: '#9CA3AF',
  border: '#E5E7EB', success: '#10B981', error: '#EF4444',
};

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
  const [adhkarCompletedCount, setAdhkarCompletedCount] = useState(0);
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
      loadCounts();
    }, [])
  );

  async function loadCounts() {
    try {
      const saved = await AsyncStorage.getItem('adhkar_counts');
      const parsed = saved ? JSON.parse(saved) : {};
      setAdhkarCounts(parsed);
      updateCompletedCount(parsed);
    } catch (e) {}
  }

  function updateCompletedCount(counts) {
    let completed = 0;
    adhkarList.forEach(adhkar => {
      const count = counts[adhkar.id] || 0;
      if (count >= (adhkar.count_target || 100)) completed++;
    });
    setAdhkarCompletedCount(completed);
  }

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
      const newCounts = { ...adhkarCounts, [id]: current + 1 };
      setAdhkarCounts(newCounts);
      AsyncStorage.setItem('adhkar_counts', JSON.stringify(newCounts));
      updateCompletedCount(newCounts);
    }
  }

  function isCurrentPrayer(name) {
    if (!prayerTimes[name]) return false;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [h, m] = prayerTimes[name].replace(/ \(.*\)/, '').split(':').map(Number);
    const start = h * 60 + m;
    const nextPrayerIndex = PRAYER_NAMES.indexOf(name) + 1;
    const nextPrayerName = PRAYER_NAMES[nextPrayerIndex % PRAYER_NAMES.length];
    const [nh, nm] = prayerTimes[nextPrayerName].replace(/ \(.*\)/, '').split(':').map(Number);
    let end = nh * 60 + nm;
    if (end < start) end += 24 * 60;
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
    <ImageBackground source={require('../../assets/bg-about.jpg')} style={styles.bgImage} resizeMode="cover">
      <View style={styles.overlay} />
      <SafeAreaView style={styles.container}>
        <SilentBanner visible={isEffectivelySilent} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerLogo}>
          <View style={styles.mosqueIconWrap}>
            <Home size={14} color={C.primary} strokeWidth={2.5} />
          </View>
          <Text style={styles.headerTitle}>Sobanukirwa</Text>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.navigate('Adhkar')}
          >
            <Hand size={16} color={C.primary} />
            {adhkarCompletedCount > 0 && (
              <View style={styles.adhkarBadge}>
                <Text style={styles.adhkarBadgeText}>{adhkarCompletedCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => setShowLangDropdown(!showLangDropdown)}
          >
            <Globe size={16} color={C.primary} />
            <Text style={styles.langText}>{language.toUpperCase()}</Text>
          </TouchableOpacity>
          {showLangDropdown && (
            <View style={styles.langDropdown}>
              {[
                { key: 'rw', label: 'Kinyarwanda' },
                { key: 'en', label: 'English' },
                { key: 'ar', label: 'العربية' },
              ].map(lang => (
                <TouchableOpacity
                  key={lang.key}
                  style={[styles.langOption, language === lang.key && styles.langOptionActive]}
                  onPress={() => {
                    setLanguage(lang.key);
                    saveSetting('language', lang.key);
                    setShowLangDropdown(false);
                  }}
                >
                  <Text style={[styles.langOptionText, language === lang.key && styles.langOptionTextActive]}>
                    {lang.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.navigate('Settings')}
          >
            <Settings size={16} color={C.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshData} tintColor={C.primary} colors={[C.primary]} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroCard}>
          <View style={styles.heroStrip} />
          <Text style={styles.heroTitle}>
            {t('Sobanukirwa Ubu Islam', 'Sobanukirwa Islamic', 'سوبانوكيروا الإسلامي')}
          </Text>
          <Text style={styles.heroSubtitle}>
            {t('Menya ukuri, ubuhanga, n\'ubwiza bwa Islam', 'Learn the truth, knowledge, and beauty of Islam', 'اعرف الحقيقة والمعرفة وجمال الإسلام')}
          </Text>
        </View>

        {/* Verse of the Day */}
        <View style={styles.verseCard}>
          <View style={styles.verseGoldBorder} />
          <View style={styles.verseIconWrap}>
            <Star size={18} color={C.accent} />
          </View>
          <View style={styles.verseContent}>
            <Text style={styles.verseArabic}>{verseOfDay.verse}</Text>
            <Text style={styles.verseTranslation}>{verseOfDay.translation}</Text>
            <Text style={styles.verseSurah}>{verseOfDay.surah}</Text>
          </View>
        </View>

        {/* Prayer Times Widget */}
        {prayerTimes.Fajr && (
          <View style={styles.prayerCard}>
            <View style={styles.prayerHeader}>
              <View style={styles.prayerHeaderLeft}>
                <Clock size={18} color={C.primary} />
                <Text style={styles.prayerTitle}>
                  {t('Ibihe by\'Isengesho', 'Prayer Times', 'أوقات الصلاة')}
                </Text>
              </View>
              <View style={styles.dateBadge}>
                <Text style={styles.dateText} numberOfLines={1}>{currentDate}</Text>
                {hijriDate ? <Text style={styles.dateText} numberOfLines={1}>{hijriDate}</Text> : null}
              </View>
            </View>
            <View style={styles.prayerDivider} />
            {PRAYER_NAMES.map((name) => {
              const time = prayerTimes[name]?.replace(/ \(.*\)/, '') || '--:--';
              const isNext = name === nextPrayer;
              const isCurrent = isCurrentPrayer(name);
              return (
                <View
                  key={name}
                  style={[
                    styles.prayerRow,
                    isNext && styles.prayerRowNext,
                    isCurrent && styles.prayerRowCurrent,
                  ]}
                >
                  <Text style={[styles.prayerName, isCurrent && { color: C.success }]}>{name}</Text>
                  <Text style={[styles.prayerTime, isNext && { color: C.primary }]}>{time}</Text>
                  {isNext && (
                    <View style={styles.nextBadge}>
                      <Text style={styles.nextBadgeText}>NEXT</Text>
                    </View>
                  )}
                </View>
              );
            })}
            {nextPrayer && (
              <View style={styles.prayerFooter}>
                <ChevronRight size={14} color={C.primary} />
                <Text style={styles.prayerFooterText}>
                  {nextPrayer}: {nextPrayerTime?.replace(/ \(.*\)/, '')} ({getNextPrayerCountdown()})
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Daily Adhkar Section */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLeft}>
            <Hand size={18} color={C.primary} />
            <Text style={styles.sectionTitle}>
              {t('Adhkar za Buri Munsi', 'Daily Adhkar', 'أذكار اليومية')}
            </Text>
          </View>
          <TouchableOpacity style={styles.seeAllBtn} onPress={() => navigation.navigate('Adhkar')}>
            <Text style={styles.seeAllText}>
              {t('Raba Byose', 'See All', 'عرض الكل')}
            </Text>
            <ChevronRight size={14} color={C.secondary} />
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
                style={[styles.adhkarCard, isComplete && styles.adhkarCardComplete]}
                onPress={() => incrementAdhkar(adhkar.id)}
                activeOpacity={0.7}
              >
                <View style={styles.adhkarProgressTrack}>
                  <View style={[styles.adhkarProgressFill, { width: `${progress * 100}%`, backgroundColor: isComplete ? C.success : C.secondary }]} />
                </View>
                <Text style={styles.adhkarArabic} numberOfLines={2}>{adhkar.arabic}</Text>
                <Text style={styles.adhkarTranslit} numberOfLines={1}>{adhkar.transliteration}</Text>
                <Text style={styles.adhkarTranslation} numberOfLines={1}>{adhkar.translation_en}</Text>
                <View style={styles.adhkarCounter}>
                  <View style={[styles.adhkarCountBadge, isComplete && styles.adhkarCountBadgeComplete]}>
                    <Text style={[styles.adhkarCountText, isComplete && { color: C.success }]}>{count}/{maxCount}</Text>
                  </View>
                  {isComplete ? (
                    <Heart size={16} color={C.success} fill={C.success} />
                  ) : (
                    <PlusIcon color={C.secondary} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Quick Access Grid */}
        <View style={styles.featureGrid}>
          {FEATURE_CARDS.map((card) => {
            const IconComp = card.iconComponent;
            return (
              <TouchableOpacity
                key={card.key}
                style={styles.featureCard}
                onPress={() => navigateToFeature(card.screen)}
                activeOpacity={0.7}
              >
                <View style={styles.featureGoldLine} />
                <View style={styles.featureIconWrap}>
                  <IconComp size={24} color={C.primary} />
                </View>
                <Text style={styles.featureLabel}>
                  {t(card.labelRw, card.labelEn, card.labelAr)}
                </Text>
                <Text style={styles.featureDesc}>
                  {t(card.descRw, card.descEn, card.descAr)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

      </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const PlusIcon = ({ color }) => (
  <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: color, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ width: 8, height: 2, backgroundColor: color, borderRadius: 1 }} />
    <View style={{ width: 2, height: 8, backgroundColor: color, borderRadius: 1, position: 'absolute' }} />
  </View>
);

const styles = StyleSheet.create({
  bgImage: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(6, 48, 44, 0.6)' },
  container: { flex: 1, backgroundColor: 'transparent' },

  /* Header */
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: 'rgba(0,0,0,0.25)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  headerLogo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mosqueIconWrap: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#FFFFFF', fontFamily: 'serif' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.2)', flexDirection: 'row', gap: 2, position: 'relative' },
  adhkarBadge: { position: 'absolute', top: -4, right: -4, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: '#F59E0B', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, borderWidth: 1.5, borderColor: 'rgba(0,0,0,0.3)' },
  adhkarBadgeText: { fontSize: 9, fontWeight: '800', color: '#FFFFFF' },
  langText: { fontSize: 9, fontWeight: '700', color: '#5EEAD4' },
  langDropdown: {
    position: 'absolute', top: 44, right: 80, minWidth: 150,
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(10,48,44,0.95)', overflow: 'hidden', zIndex: 100,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  langOption: { paddingVertical: 11, paddingHorizontal: 16 },
  langOptionActive: { backgroundColor: 'rgba(255,255,255,0.08)' },
  langOptionText: { fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.7)' },
  langOptionTextActive: { color: '#5EEAD4', fontWeight: '700' },

  /* Scroll */
  scroll: { padding: 20, paddingBottom: 40, gap: 16 },

  /* Hero */
  heroCard: { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 16, padding: 20, alignItems: 'center', overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  heroStrip: { position: 'absolute', top: 0, left: 0, right: 0, height: 4, backgroundColor: '#14B8A6' },
  heroTitle: { fontSize: 21, fontWeight: '700', color: '#FFFFFF', fontFamily: 'serif', textAlign: 'center', marginTop: 8 },
  heroSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 19, maxWidth: 300, marginTop: 8 },

  /* Verse Card */
  verseCard: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 16, padding: 16, alignItems: 'center', gap: 12, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  verseGoldBorder: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: '#F59E0B', borderTopLeftRadius: 16, borderBottomLeftRadius: 16 },
  verseIconWrap: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(245,158,11,0.15)', alignItems: 'center', justifyContent: 'center' },
  verseContent: { flex: 1 },
  verseArabic: { fontSize: 16, fontFamily: 'serif', textAlign: 'right', color: '#FFFFFF', lineHeight: 28 },
  verseTranslation: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 6, fontStyle: 'italic', lineHeight: 18 },
  verseSurah: { fontSize: 11, fontWeight: '600', color: '#5EEAD4', marginTop: 6 },

  /* Prayer Widget */
  prayerCard: { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  prayerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  prayerHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  prayerTitle: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  dateBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, backgroundColor: 'rgba(15,118,110,0.2)' },
  dateText: { fontSize: 9, fontWeight: '600', color: '#5EEAD4' },
  prayerDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 8 },
  prayerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, marginBottom: 2 },
  prayerRowNext: { backgroundColor: 'rgba(15,118,110,0.15)', borderWidth: 1, borderColor: 'rgba(15,118,110,0.3)' },
  prayerRowCurrent: { backgroundColor: 'rgba(16,185,129,0.15)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)' },
  prayerName: { flex: 1, fontSize: 14, fontWeight: '500', color: '#FFFFFF' },
  prayerTime: { fontSize: 15, fontWeight: '700', color: '#FFFFFF', fontVariant: ['tabular-nums'] },
  nextBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginLeft: 10, backgroundColor: '#0F766E' },
  nextBadgeText: { fontSize: 9, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.5 },
  prayerFooter: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  prayerFooterText: { fontSize: 13, fontWeight: '600', color: '#5EEAD4', flex: 1 },

  /* Section Header */
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  seeAllText: { fontSize: 13, fontWeight: '600', color: '#5EEAD4' },

  /* Adhkar */
  adhkarScroll: { gap: 12, paddingVertical: 4, paddingHorizontal: 4 },
  adhkarCard: { width: 180, padding: 14, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.2)', gap: 6, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  adhkarCardComplete: { borderColor: 'rgba(16,185,129,0.4)' },
  adhkarProgressTrack: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: 'rgba(255,255,255,0.1)' },
  adhkarProgressFill: { height: '100%', borderRadius: 2 },
  adhkarArabic: { fontSize: 18, fontFamily: 'serif', textAlign: 'center', color: '#5EEAD4', lineHeight: 28, marginTop: 6 },
  adhkarTranslit: { fontSize: 12, fontWeight: '600', textAlign: 'center', color: '#FFFFFF', marginTop: 4 },
  adhkarTranslation: { fontSize: 10, textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontStyle: 'italic' },
  adhkarCounter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 },
  adhkarCountBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: 'rgba(15,118,110,0.2)' },
  adhkarCountBadgeComplete: { backgroundColor: 'rgba(16,185,129,0.2)' },
  adhkarCountText: { fontSize: 12, fontWeight: '700', color: '#5EEAD4', fontVariant: ['tabular-nums'] },

  /* Feature Grid */
  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  featureCard: {
    width: (width - 52) / 2, paddingVertical: 18, paddingHorizontal: 12, borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.2)', alignItems: 'center', gap: 6, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  featureGoldLine: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: '#F59E0B' },
  featureIconWrap: { width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(15,118,110,0.2)', alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  featureLabel: { fontSize: 13, fontWeight: '600', color: '#FFFFFF', textAlign: 'center' },
  featureDesc: { fontSize: 10, color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 14 },
});
