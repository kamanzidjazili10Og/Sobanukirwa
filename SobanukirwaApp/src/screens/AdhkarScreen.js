import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { useApp } from '../context/AppContext';
import { fetchAdhkar, getMediaUrl } from '../services/api';
import ScreenBackground from '../components/ScreenBackground';

const FALLBACK_ADHKAR = [
  { id: 1, arabic: 'سُبْحَانَ اللَّهِ', transliteration: 'Subhanallah', translation_en: 'Glory be to Allah', translation_rw: 'Imana ni yose', count_target: 33, category: 'general' },
  { id: 2, arabic: 'الْحَمْدُ لِلَّهِ', transliteration: 'Alhamdulillah', translation_en: 'All praise is due to Allah', translation_rw: 'Ishimwe ryose ni ry\'Imana', count_target: 33, category: 'general' },
  { id: 3, arabic: 'اللَّهُ أَكْبَرُ', transliteration: 'Allahu Akbar', translation_en: 'Allah is the Greatest', translation_rw: 'Imana ni Nkuru', count_target: 34, category: 'general' },
  { id: 4, arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ', transliteration: 'La ilaha illallah wahdahu la shareeka lahu', translation_en: 'There is no god but Allah alone, He has no partner', translation_rw: 'Nta Imana yindi kugeza kuri Yewe, ntaho yifatanyije', count_target: 100, category: 'morning' },
  { id: 5, arabic: 'أَسْتَغْفِرُ اللَّهَ', transliteration: 'Astaghfirullah', translation_en: 'I seek forgiveness from Allah', translation_rw: 'Ndusaba imbababuko ku Mana', count_target: 100, category: 'morning' },
  { id: 6, arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', transliteration: 'Subhanallahi wa bihamdihi', translation_en: 'Glory be to Allah and His praise', translation_rw: 'Imana ni yose mu kwishimira', count_target: 100, category: 'evening' },
  { id: 7, arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', transliteration: 'La hawla wa la quwwata illa billah', translation_en: 'There is no power nor strength except with Allah', translation_rw: 'Nta muhungiro usibye ku Mana', count_target: 100, category: 'evening' },
  { id: 8, arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ', transliteration: 'Allahumma salli ala Muhammad', translation_en: 'O Allah, send blessings upon Muhammad', translation_rw: 'Mana, endenciesa kuri Muhammad', count_target: 100, category: 'sleep' },
  { id: 9, arabic: 'سُبْحَانَ اللَّهِ الْعَظِيمِ وَبِحَمْدِهِ', transliteration: 'Subhanallahi al-Azeem wa bihamdihi', translation_en: 'Glory be to Allah the Magnificent and His praise', translation_rw: 'Imana Nkuru ni yose mu kwishimira', count_target: 100, category: 'sleep' },
  { id: 10, arabic: 'اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ', transliteration: 'Allahumma antas-salam wa minkas-salam', translation_en: 'O Allah, You are Peace and from You comes peace', translation_rw: 'Mana, Wowe ni Amahoro, kubera Awowe harubaho Amahoro', count_target: 100, category: 'sleep' },
];

const CATEGORIES = [
  { key: 'all', labelRw: 'Byose', labelEn: 'All', labelAr: 'الكل', icon: 'apps' },
  { key: 'general', labelRw: 'Rusange', labelEn: 'General', labelAr: 'عام', icon: 'grid' },
  { key: 'morning', labelRw: 'Amaraso', labelEn: 'Morning', labelAr: 'صباح', icon: 'sunny' },
  { key: 'evening', labelRw: 'Ijambo', labelEn: 'Evening', labelAr: 'مساء', icon: 'moon' },
  { key: 'sleep', labelRw: 'Buririro', labelEn: 'Sleep', labelAr: 'نوم', icon: 'bed' },
];

export default function AdhkarScreen({ navigation }) {
  const { t, COLORS, language } = useApp();
  const [counts, setCounts] = useState({});
  const [adhkarList, setAdhkarList] = useState(FALLBACK_ADHKAR);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const clockRef = useRef(null);
  const soundRef = useRef(null);
  const [playingId, setPlayingId] = useState(null);
  const [audioLoading, setAudioLoading] = useState(null);
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useFocusEffect(
    useCallback(() => {
      loadCounts();
      loadAdhkarData();
      clockRef.current = setInterval(() => {
        setCurrentTime(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }, 1000);
      setCurrentTime(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0.4, duration: 2000, useNativeDriver: true }),
        ])
      ).start();

      return () => {
        if (clockRef.current) clearInterval(clockRef.current);
        stopAudio();
      };
    }, [])
  );

  async function loadAdhkarData() {
    try {
      const data = await fetchAdhkar();
      if (data && data.length > 0) {
        setAdhkarList(data.map(a => ({
          id: a.id,
          arabic: a.arabic_text,
          transliteration: a.transliteration,
          translation_en: a.translation_en || '',
          translation_rw: a.translation_rw || a.translation_en || '',
          count_target: a.count_target || 100,
          audio_url: a.audio_url || null,
          category: a.category || 'general',
        })));
      }
    } catch (e) {
      setAdhkarList(FALLBACK_ADHKAR);
    }
  }

  async function loadCounts() {
    try {
      const saved = await AsyncStorage.getItem('adhkar_counts');
      if (saved) setCounts(JSON.parse(saved));
    } catch (e) {}
  }

  async function saveCounts(newCounts) {
    setCounts(newCounts);
    try { await AsyncStorage.setItem('adhkar_counts', JSON.stringify(newCounts)); } catch (e) {}
  }

  function increment(id) {
    const adhkar = adhkarList.find(a => a.id === id);
    const current = counts[id] || 0;
    if (current < (adhkar?.count_target || 100)) {
      saveCounts({ ...counts, [id]: current + 1 });
    }
  }

  function decrement(id) {
    const current = counts[id] || 0;
    if (current > 0) saveCounts({ ...counts, [id]: current - 1 });
  }

  function resetAll() { saveCounts({}); }

  async function onRefresh() {
    setRefreshing(true);
    await Promise.all([loadCounts(), loadAdhkarData()]);
    setRefreshing(false);
  }

  async function stopAudio() {
    if (soundRef.current) {
      try { await soundRef.current.unloadAsync(); } catch (e) {}
      soundRef.current = null;
    }
    setPlayingId(null);
    setAudioLoading(null);
  }

  async function toggleAudio(adhkar) {
    if (!adhkar.audio_url) return;
    if (playingId === adhkar.id) {
      await stopAudio();
      return;
    }
    await stopAudio();
    setAudioLoading(adhkar.id);
    try {
      const url = getMediaUrl(adhkar.audio_url);
      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true }
      );
      soundRef.current = sound;
      setPlayingId(adhkar.id);
      setAudioLoading(null);
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setPlayingId(null);
          soundRef.current = null;
        }
      });
    } catch (e) {
      setAudioLoading(null);
      setPlayingId(null);
    }
  }

  const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);
  const filteredAdhkar = activeCategory === 'all'
    ? adhkarList
    : adhkarList.filter(a => a.category === activeCategory);

  function getTranslation(adhkar) {
    if (language === 'ar') return adhkar.translation_rw || adhkar.translation_en;
    if (language === 'rw') return adhkar.translation_rw || adhkar.translation_en;
    return adhkar.translation_en;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      <ScreenBackground imageKey="bg-adhkar">
        {/* Header */}
        <View style={[styles.header, { backgroundColor: 'rgba(15,42,63,0.95)' }]}>
          <View style={styles.headerCenter}>
            <Ionicons name="hands" size={20} color={COLORS.secondary} />
            <Text style={[styles.headerTitle, { color: COLORS.secondary }]}>
              {t('Adhkar za Buri Munsi', 'Daily Adhkar', 'أذكار اليومية')}
            </Text>
          </View>
          {totalCount > 0 ? (
            <TouchableOpacity style={[styles.resetBtn, { borderColor: 'rgba(212,175,55,0.2)' }]} onPress={resetAll}>
              <Ionicons name="refresh" size={18} color={COLORS.secondary} />
            </TouchableOpacity>
          ) : <View style={{ width: 38 }} />}
        </View>

        {/* Clock & Stats */}
        <View style={[styles.clockSection, { backgroundColor: 'rgba(212,175,55,0.08)', borderColor: 'rgba(212,175,55,0.2)' }]}>
          <Animated.View style={[styles.clockGlow, { opacity: pulseAnim, backgroundColor: 'rgba(212,175,55,0.08)' }]} />
          {currentTime ? (
            <Text style={[styles.clockTime, { color: COLORS.secondary }]}>{currentTime}</Text>
          ) : null}
          <View style={styles.clockStats}>
            <Ionicons name="finger-print" size={14} color={COLORS.secondary} />
            <Text style={[styles.clockStatsText, { color: COLORS.textMuted }]}>
              {totalCount} {t('ibikorwa', 'counted', 'عد')}
            </Text>
          </View>
        </View>

        {/* Category Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.key}
              style={[
                styles.categoryTab,
                { borderColor: 'rgba(212,175,55,0.2)', backgroundColor: 'rgba(255,255,255,0.03)' },
                activeCategory === cat.key && { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary }
              ]}
              onPress={() => setActiveCategory(cat.key)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={cat.icon}
                size={13}
                color={activeCategory === cat.key ? COLORS.primaryDark : COLORS.secondary}
              />
              <Text style={[
                styles.categoryLabel,
                { color: activeCategory === cat.key ? COLORS.primaryDark : COLORS.text }
              ]}>
                {t(cat.labelRw, cat.labelEn, cat.labelAr)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Adhkar List */}
        <ScrollView
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.secondary} colors={[COLORS.secondary]} />
          }
          showsVerticalScrollIndicator={false}
        >
          {filteredAdhkar.map((adhkar) => {
            const count = counts[adhkar.id] || 0;
            const maxCount = adhkar.count_target || 100;
            const isComplete = count >= maxCount;
            const translation = getTranslation(adhkar);
            const progress = maxCount > 0 ? count / maxCount : 0;
            return (
              <View
                key={adhkar.id}
                style={[
                  styles.card,
                  { backgroundColor: 'rgba(30,60,92,0.25)', borderColor: COLORS.border },
                  isComplete && { borderColor: 'rgba(39,174,96,0.5)', backgroundColor: 'rgba(39,174,96,0.06)' }
                ]}
              >
                {/* Left accent bar */}
                <View style={[styles.accentBar, isComplete
                  ? { backgroundColor: '#27ae60' }
                  : { backgroundColor: COLORS.secondary }
                ]} />

                {/* Progress indicator */}
                <View style={[styles.progressTrack, { backgroundColor: 'rgba(255,255,255,0.06)' }]}>
                  <View style={[
                    styles.progressFill,
                    {
                      width: `${progress * 100}%`,
                      backgroundColor: isComplete ? '#27ae60' : COLORS.secondary,
                    }
                  ]} />
                </View>

                {/* Content */}
                <View style={styles.cardContent}>
                  <Text style={[styles.arabicText, { color: COLORS.secondary }]}>{adhkar.arabic}</Text>
                  <Text style={[styles.translitText, { color: COLORS.text }]}>{adhkar.transliteration}</Text>
                  {translation ? (
                    <Text style={[styles.translationText, { color: COLORS.textMuted }]}>{translation}</Text>
                  ) : null}

                  {/* Counter Row */}
                  <View style={styles.counterRow}>
                    {adhkar.audio_url ? (
                      <TouchableOpacity
                        style={[
                          styles.audioBtn,
                          { borderColor: COLORS.border, backgroundColor: 'rgba(255,255,255,0.04)' },
                          playingId === adhkar.id && { backgroundColor: 'rgba(212,175,55,0.15)', borderColor: COLORS.secondary }
                        ]}
                        onPress={() => toggleAudio(adhkar)}
                        activeOpacity={0.7}
                      >
                        {audioLoading === adhkar.id ? (
                          <ActivityIndicator size="small" color={COLORS.secondary} />
                        ) : (
                          <Ionicons
                            name={playingId === adhkar.id ? 'pause' : 'volume-high'}
                            size={16}
                            color={playingId === adhkar.id ? COLORS.secondary : COLORS.text}
                          />
                        )}
                      </TouchableOpacity>
                    ) : null}

                    <TouchableOpacity
                      style={[styles.counterBtn, { borderColor: COLORS.border, backgroundColor: 'rgba(255,255,255,0.04)' }]}
                      onPress={() => decrement(adhkar.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="remove" size={18} color={COLORS.text} />
                    </TouchableOpacity>

                    <View style={[styles.countDisplay, isComplete && { backgroundColor: 'rgba(39,174,96,0.12)' }]}>
                      <Text style={[styles.countText, { color: isComplete ? '#27ae60' : COLORS.secondary }]}>
                        {count}
                      </Text>
                      <Text style={[styles.countTarget, { color: COLORS.textMuted }]}>
                        / {maxCount}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[styles.counterBtn, { borderColor: COLORS.border, backgroundColor: 'rgba(255,255,255,0.04)' }]}
                      onPress={() => increment(adhkar.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="add" size={18} color={COLORS.text} />
                    </TouchableOpacity>
                  </View>

                  {isComplete && (
                    <View style={styles.completeBadge}>
                      <Ionicons name="checkmark-circle" size={14} color="#27ae60" />
                      <Text style={styles.completeText}>{t('Urarangira', 'Complete', 'مكتمل')}</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}

          {filteredAdhkar.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="hands" size={48} color="rgba(212,175,55,0.3)" />
              <Text style={[styles.emptyText, { color: COLORS.textMuted }]}>
                {t('Nta adhkar iri mu bwoko', 'No adhkar in this category', 'لا أذكار في هذا التصنيف')}
              </Text>
            </View>
          )}
        </ScrollView>
      </ScreenBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  /* Header */
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: 'rgba(212,175,55,0.12)',
  },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', fontFamily: 'serif' },
  resetBtn: {
    width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(30,60,92,0.3)', borderWidth: 1.5,
  },

  /* Clock */
  clockSection: {
    margin: 16, marginBottom: 8, borderRadius: 16, borderWidth: 1, padding: 16,
    alignItems: 'center', position: 'relative', overflow: 'hidden',
  },
  clockGlow: {
    position: 'absolute', top: -30, left: -30, right: -30, bottom: -30, borderRadius: 60,
  },
  clockTime: {
    fontSize: 28, fontWeight: '700', fontVariant: ['tabular-nums'], letterSpacing: 3,
    position: 'relative',
  },
  clockStats: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, position: 'relative' },
  clockStatsText: { fontSize: 12, fontWeight: '500' },

  /* Categories */
  categoryRow: { paddingHorizontal: 16, paddingBottom: 8, gap: 6 },
  categoryTab: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5,
  },
  categoryLabel: { fontSize: 12, fontWeight: '600' },

  /* List */
  list: { padding: 16, paddingBottom: 40, gap: 12 },

  /* Card */
  card: {
    borderRadius: 16, borderWidth: 1.5, overflow: 'hidden', flexDirection: 'row',
  },
  accentBar: { width: 4, opacity: 0.8 },
  progressTrack: { position: 'absolute', bottom: 0, left: 4, right: 0, height: 3 },
  progressFill: { height: '100%', borderRadius: 2 },
  cardContent: { flex: 1, padding: 16 },

  arabicText: {
    fontSize: 22, fontWeight: '700', textAlign: 'center', lineHeight: 36,
    fontFamily: 'serif', marginTop: 4,
  },
  translitText: {
    fontSize: 14, fontWeight: '600', textAlign: 'center', marginTop: 8,
  },
  translationText: {
    fontSize: 12, textAlign: 'center', marginTop: 4, fontStyle: 'italic',
    lineHeight: 18,
  },

  /* Counter */
  counterRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 12, marginTop: 14,
  },
  audioBtn: {
    width: 38, height: 38, borderRadius: 19, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  counterBtn: {
    width: 42, height: 42, borderRadius: 21, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  countDisplay: {
    flexDirection: 'row', alignItems: 'baseline', gap: 2,
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16,
    backgroundColor: 'rgba(212,175,55,0.1)',
  },
  countText: { fontSize: 18, fontWeight: '700', fontVariant: ['tabular-nums'] },
  countTarget: { fontSize: 12, fontWeight: '500' },

  completeBadge: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, marginTop: 10,
  },
  completeText: { fontSize: 12, fontWeight: '600', color: '#27ae60' },

  /* Empty */
  emptyState: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyText: { fontSize: 14, fontWeight: '500' },
});
