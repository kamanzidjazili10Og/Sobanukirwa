import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '../context/AppContext';

const ADHKAR_DATA = [
  { id: 1, arabic: 'سُبْحَانَ اللَّهِ', transliteration: 'Subhanallah', translation: 'Glory be to Allah', maxCount: 33 },
  { id: 2, arabic: 'الْحَمْدُ لِلَّهِ', transliteration: 'Alhamdulillah', translation: 'All praise is due to Allah', maxCount: 33 },
  { id: 3, arabic: 'اللَّهُ أَكْبَرُ', transliteration: 'Allahu Akbar', translation: 'Allah is the Greatest', maxCount: 34 },
  { id: 4, arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ', transliteration: 'La ilaha illallah wahdahu la shareeka lahu', translation: 'There is no god but Allah alone, He has no partner', maxCount: 100 },
  { id: 5, arabic: 'أَسْتَغْفِرُ اللَّهَ', transliteration: 'Astaghfirullah', translation: 'I seek forgiveness from Allah', maxCount: 100 },
  { id: 6, arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', transliteration: 'Subhanallahi wa bihamdihi', translation: 'Glory be to Allah and His praise', maxCount: 100 },
  { id: 7, arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', transliteration: 'La hawla wa la quwwata illa billah', translation: 'There is no power nor strength except with Allah', maxCount: 100 },
  { id: 8, arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ', transliteration: 'Allahumma salli ala Muhammad', translation: 'O Allah, send blessings upon Muhammad', maxCount: 100 },
  { id: 9, arabic: 'سُبْحَانَ اللَّهِ الْعَظِيمِ وَبِحَمْدِهِ', transliteration: 'Subhanallahi al-Azeem wa bihamdihi', translation: 'Glory be to Allah the Magnificent and His praise', maxCount: 100 },
  { id: 10, arabic: 'اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ', transliteration: 'Allahumma antas-salam wa minkas-salam', translation: 'O Allah, You are Peace and from You comes peace', maxCount: 100 },
  { id: 11, arabic: 'إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ', transliteration: 'Inna lillahi wa inna ilayhi raji\'un', translation: 'Indeed we belong to Allah and indeed to Him we will return', maxCount: 100 },
  { id: 12, arabic: 'اللَّهُمَّ لَا مَانِعَ لِمَا أَعْطَيْتَ', transliteration: 'Allahumma la mani\'a lima a\'tayta', translation: 'O Allah, none can withhold what You give', maxCount: 100 },
  { id: 13, arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً', transliteration: 'Rabbana atina fid-dunya hasanah', translation: 'Our Lord, give us in this world [that which is] good', maxCount: 100 },
  { id: 14, arabic: 'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ', transliteration: 'Subhanakallahumma wa bihamdik', translation: 'Glory be to You, O Allah, and with Your praise', maxCount: 100 },
  { id: 15, arabic: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ', transliteration: 'Allahumma salli wa sallim ala nabiyyina Muhammad', translation: 'O Allah, send peace and blessings upon our Prophet Muhammad', maxCount: 100 },
];

export default function AdhkarScreen() {
  const { t, COLORS } = useApp();
  const [counts, setCounts] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadCounts();
    }, [])
  );

  async function loadCounts() {
    try {
      const saved = await AsyncStorage.getItem('adhkar_counts');
      if (saved) setCounts(JSON.parse(saved));
    } catch (e) {}
  }

  async function saveCounts(newCounts) {
    setCounts(newCounts);
    try {
      await AsyncStorage.setItem('adhkar_counts', JSON.stringify(newCounts));
    } catch (e) {}
  }

  function increment(id) {
    const current = counts[id] || 0;
    const adhkar = ADHKAR_DATA.find(a => a.id === id);
    if (current < (adhkar?.maxCount || 100)) {
      saveCounts({ ...counts, [id]: current + 1 });
    }
  }

  function decrement(id) {
    const current = counts[id] || 0;
    if (current > 0) {
      saveCounts({ ...counts, [id]: current - 1 });
    }
  }

  function resetAll() {
    saveCounts({});
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadCounts();
    setRefreshing(false);
  }

  const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: COLORS.secondary }]}>
          {t('Adhkar za Buri Munsi', 'Daily Adhkar', 'أذكار اليومية')}
        </Text>
        <Text style={[styles.headerSub, { color: COLORS.textMuted }]}>
          {totalCount} {t('ibikorwa', 'counted', 'عد')}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.secondary}
            colors={[COLORS.secondary]}
          />
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

        {ADHKAR_DATA.map((adhkar) => {
          const count = counts[adhkar.id] || 0;
          const isComplete = count >= adhkar.maxCount;
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
              <Text style={[styles.translationText, { color: COLORS.textMuted }]}>{adhkar.translation}</Text>
              <View style={styles.counterRow}>
                <TouchableOpacity style={[styles.counterBtn, { borderColor: COLORS.border }]} onPress={() => decrement(adhkar.id)}>
                  <Ionicons name="remove" size={18} color={COLORS.text} />
                </TouchableOpacity>
                <View style={[styles.countDisplay, isComplete && { backgroundColor: 'rgba(39,174,96,0.15)' }]}>
                  <Text style={[styles.countText, { color: isComplete ? '#27ae60' : COLORS.secondary }]}>
                    {count}/{adhkar.maxCount}
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
  headerSub: { fontSize: 13, marginTop: 4 },
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
