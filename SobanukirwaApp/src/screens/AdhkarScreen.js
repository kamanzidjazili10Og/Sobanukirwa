import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { useApp } from '../context/AppContext';
import { fetchAdhkar, getMediaUrl } from '../services/api';

const FALLBACK_ADHKAR = [
  { id: 1, arabic: 'سُبْحَانَ اللَّهِ', transliteration: 'Subhanallah', translation_en: 'Glory be to Allah', translation_rw: 'Imana ni yose', count_target: 33 },
  { id: 2, arabic: 'الْحَمْدُ لِلَّهِ', transliteration: 'Alhamdulillah', translation_en: 'All praise is due to Allah', translation_rw: 'Ishimwe ryose ni ry\'Imana', count_target: 33 },
  { id: 3, arabic: 'اللَّهُ أَكْبَرُ', transliteration: 'Allahu Akbar', translation_en: 'Allah is the Greatest', translation_rw: 'Imana ni Nkuru', count_target: 34 },
  { id: 4, arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ', transliteration: 'La ilaha illallah wahdahu la shareeka lahu', translation_en: 'There is no god but Allah alone, He has no partner', translation_rw: 'Nta Imana yindi kugeza kuri Yewe, ntaho yifatanyije', count_target: 100 },
  { id: 5, arabic: 'أَسْتَغْفِرُ اللَّهَ', transliteration: 'Astaghfirullah', translation_en: 'I seek forgiveness from Allah', translation_rw: 'Ndusaba imbababuko ku Mana', count_target: 100 },
  { id: 6, arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', transliteration: 'Subhanallahi wa bihamdihi', translation_en: 'Glory be to Allah and His praise', translation_rw: 'Imana ni yose mu kwishimira', count_target: 100 },
  { id: 7, arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', transliteration: 'La hawla wa la quwwata illa billah', translation_en: 'There is no power nor strength except with Allah', translation_rw: 'Nta muhungiro usibye ku Mana', count_target: 100 },
  { id: 8, arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ', transliteration: 'Allahumma salli ala Muhammad', translation_en: 'O Allah, send blessings upon Muhammad', translation_rw: 'Mana, endenciesa kuri Muhammad', count_target: 100 },
  { id: 9, arabic: 'سُبْحَانَ اللَّهِ الْعَظِيمِ وَبِحَمْدِهِ', transliteration: 'Subhanallahi al-Azeem wa bihamdihi', translation_en: 'Glory be to Allah the Magnificent and His praise', translation_rw: 'Imana Nkuru ni yose mu kwishimira', count_target: 100 },
  { id: 10, arabic: 'اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ', transliteration: 'Allahumma antas-salam wa minkas-salam', translation_en: 'O Allah, You are Peace and from You comes peace', translation_rw: 'Mana, Wowe ni Amahoro, kubera Awowe harubaho Amahoro', count_target: 100 },
];

export default function AdhkarScreen() {
  const { t, COLORS, language } = useApp();
  const [counts, setCounts] = useState({});
  const [adhkarList, setAdhkarList] = useState(FALLBACK_ADHKAR);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const clockRef = useRef(null);
  const soundRef = useRef(null);
  const [playingId, setPlayingId] = useState(null);
  const [audioLoading, setAudioLoading] = useState(null);

  useFocusEffect(
    useCallback(() => {
      loadCounts();
      loadAdhkarData();
      clockRef.current = setInterval(() => {
        setCurrentTime(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }, 1000);
      setCurrentTime(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
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
      console.log('Adhkar audio error:', e);
      setAudioLoading(null);
      setPlayingId(null);
    }
  }

  const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);

  function getTranslation(adhkar) {
    if (language === 'ar') return adhkar.translation_rw || adhkar.translation_en;
    if (language === 'rw') return adhkar.translation_rw || adhkar.translation_en;
    return adhkar.translation_en;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: COLORS.secondary }]}>
          {t('Adhkar za Buri Munsi', 'Daily Adhkar', 'أذكار اليومية')}
        </Text>
        <View style={styles.headerRow}>
          <Text style={[styles.headerSub, { color: COLORS.textMuted }]}>
            {totalCount} {t('ibikorwa', 'counted', 'عد')}
          </Text>
          {currentTime ? (
            <Text style={[styles.clockText, { color: COLORS.secondary }]}>{currentTime}</Text>
          ) : null}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.secondary} colors={[COLORS.secondary]} />
        }
      >
        {totalCount > 0 && (
          <TouchableOpacity style={[styles.resetBtn, { borderColor: COLORS.border }]} onPress={resetAll}>
            <Ionicons name="refresh" size={16} color={COLORS.secondary} />
            <Text style={[styles.resetText, { color: COLORS.secondary }]}>
              {t('Subiza', 'Reset', 'إعادة تعيين')}
            </Text>
          </TouchableOpacity>
        )}

        {adhkarList.map((adhkar) => {
          const count = counts[adhkar.id] || 0;
          const maxCount = adhkar.count_target || 100;
          const isComplete = count >= maxCount;
          const translation = getTranslation(adhkar);
          return (
            <View
              key={adhkar.id}
              style={[
                styles.card,
                { backgroundColor: COLORS.surface, borderColor: COLORS.border },
                isComplete && { borderColor: '#27ae60', backgroundColor: 'rgba(39,174,96,0.08)' }
              ]}
            >
              <View style={[styles.accentBar, isComplete ? styles.accentComplete : { backgroundColor: COLORS.secondary }]} />
              <Text style={[styles.arabicText, { color: COLORS.secondary }]}>{adhkar.arabic}</Text>
              <Text style={[styles.translitText, { color: COLORS.text }]}>{adhkar.transliteration}</Text>
              {translation ? (
                <Text style={[styles.translationText, { color: COLORS.textMuted }]}>{translation}</Text>
              ) : null}
              <View style={styles.counterRow}>
                {adhkar.audio_url ? (
                  <TouchableOpacity
                    style={[styles.counterBtn, { borderColor: COLORS.border }, playingId === adhkar.id && { backgroundColor: 'rgba(212,175,55,0.15)', borderColor: COLORS.secondary }]}
                    onPress={() => toggleAudio(adhkar)}
                  >
                    {audioLoading === adhkar.id ? (
                      <ActivityIndicator size="small" color={COLORS.secondary} />
                    ) : (
                      <Ionicons name={playingId === adhkar.id ? 'pause' : 'volume-high'} size={18} color={playingId === adhkar.id ? COLORS.secondary : COLORS.text} />
                    )}
                  </TouchableOpacity>
                ) : null}
                <TouchableOpacity style={[styles.counterBtn, { borderColor: COLORS.border }]} onPress={() => decrement(adhkar.id)}>
                  <Ionicons name="remove" size={18} color={COLORS.text} />
                </TouchableOpacity>
                <View style={[styles.countDisplay, isComplete && { backgroundColor: 'rgba(39,174,96,0.15)' }]}>
                  <Text style={[styles.countText, { color: isComplete ? '#27ae60' : COLORS.secondary }]}>
                    {count}/{maxCount}
                  </Text>
                </View>
                <TouchableOpacity style={[styles.counterBtn, { borderColor: COLORS.border }]} onPress={() => increment(adhkar.id)}>
                  <Ionicons name="add" size={18} color={COLORS.text} />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingBottom: 10 },
  headerTitle: { fontSize: 24, fontWeight: '700' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  headerSub: { fontSize: 13 },
  clockText: { fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] },
  list: { padding: 20, paddingTop: 8, gap: 12, paddingBottom: 40 },
  resetBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 10, borderRadius: 12, borderWidth: 1.5, marginBottom: 4 },
  resetText: { fontSize: 13, fontWeight: '600' },
  card: { borderRadius: 16, borderWidth: 1.5, overflow: 'hidden' },
  accentBar: { height: 4, opacity: 0.7 },
  accentComplete: { backgroundColor: '#27ae60' },
  arabicText: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginTop: 14, paddingHorizontal: 16, lineHeight: 36, fontFamily: 'serif' },
  translitText: { fontSize: 14, fontWeight: '600', textAlign: 'center', marginTop: 8, paddingHorizontal: 16 },
  translationText: { fontSize: 12, textAlign: 'center', marginTop: 4, paddingHorizontal: 16, fontStyle: 'italic' },
  counterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, paddingVertical: 14, paddingHorizontal: 16 },
  counterBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  countDisplay: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 16, backgroundColor: 'rgba(212,175,55,0.1)' },
  countText: { fontSize: 16, fontWeight: '700', fontVariant: ['tabular-nums'] },
});
