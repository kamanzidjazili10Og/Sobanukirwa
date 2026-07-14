import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import ScreenBackground from '../components/ScreenBackground';

const TABS = ['All', 'Meccan', 'Medinan'];

export default function QuranScreen({ navigation }) {
  const { surahs, t, COLORS, refreshing, refreshData } = useApp();
  const [search, setSearch] = useState('');
  const [selectedTab, setSelectedTab] = useState('All');

  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [])
  );

  const filtered = surahs.filter(s => {
    const matchesTab = selectedTab === 'All' || s.revelationType === selectedTab;
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      (s.name || '').toLowerCase().includes(q) ||
      (s.englishName || '').toLowerCase().includes(q) ||
      String(s.number).includes(q);
    return matchesTab && matchesSearch;
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      <ScreenBackground imageKey="bg-quran">
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={[styles.headerTitle, { color: COLORS.secondary }]}>
                {t('Qur\'an', 'Quran', 'القرآن الكريم')}
              </Text>
              <Text style={[styles.headerSub, { color: COLORS.textMuted }]}>
                {surahs.length} {t('sura zose', 'surahs', 'سورة')} • {t('Igihe cyose', 'Read & Listen', 'اقرأ واستمع')}
              </Text>
            </View>
            <View style={[styles.headerBadge, { backgroundColor: 'rgba(212,175,55,0.12)', borderColor: 'rgba(212,175,55,0.25)' }]}>
              <Ionicons name="book" size={28} color={COLORS.secondary} />
            </View>
          </View>
        </View>

        <View style={styles.tabRow}>
          {TABS.map(tab => {
            const isActive = selectedTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, isActive && { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary }]}
                onPress={() => setSelectedTab(tab)}
              >
                <Text style={[styles.tabText, { color: isActive ? '#0a2f44' : COLORS.textMuted }, isActive && { fontWeight: '700' }]}>
                  {t(tab === 'All' ? 'Byose' : tab === 'Meccan' ? 'Mecca' : 'Madina', tab, tab === 'All' ? 'الكل' : tab === 'Meccan' ? 'مكة' : 'المدينة')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.searchWrap}>
          <View style={[styles.searchBar, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
            <Ionicons name="search" size={18} color={COLORS.textMuted} />
            <TextInput
              style={[styles.search, { color: COLORS.text }]}
              placeholder={t('Shakisha sura...', 'Search surahs...', 'ابحث عن سورة...')}
              placeholderTextColor={COLORS.textMuted}
              value={search}
              onChangeText={setSearch}
            />
            {search ? (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refreshData} tintColor={COLORS.secondary} colors={[COLORS.secondary]} />
          }
        >
          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="book" size={48} color={COLORS.secondary} />
              <Text style={[styles.emptyText, { color: COLORS.textMuted }]}>
                {t('Nta sura zibonetse', 'No surahs found', 'لم يتم العثور على سورة')}
              </Text>
            </View>
          ) : filtered.map((surah) => {
            const isMeccan = surah.revelationType === 'Meccan';
            const juz = Math.ceil(surah.number / 20);
            return (
              <TouchableOpacity
                key={surah.number}
                style={[styles.card, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}
                onPress={() => navigation.navigate('SurahDetail', { surah })}
                activeOpacity={0.7}
              >
                <View style={styles.cardLeft}>
                  <View style={[styles.numberWrap, {
                    backgroundColor: isMeccan ? 'rgba(231,76,60,0.1)' : 'rgba(39,174,96,0.1)',
                    borderColor: isMeccan ? 'rgba(231,76,60,0.25)' : 'rgba(39,174,96,0.25)',
                  }]}>
                    <Text style={[styles.number, { color: isMeccan ? '#e74c3c' : '#27ae60' }]}>{surah.number}</Text>
                  </View>
                </View>

                <View style={styles.cardCenter}>
                  <View style={styles.nameRow}>
                    <Text style={[styles.engName, { color: COLORS.text }]} numberOfLines={1}>
                      {surah.englishName || `Surah ${surah.number}`}
                    </Text>
                    <Text style={[styles.ayahCount, { color: COLORS.textMuted }]}>
                      {surah.numberOfAyahs} ayahs
                    </Text>
                  </View>
                  <Text style={[styles.arName, { color: COLORS.secondary }]} numberOfLines={1}>
                    {surah.name}
                  </Text>
                  <Text style={[styles.translation, { color: COLORS.textMuted }]} numberOfLines={1}>
                    {surah.englishNameTranslation || ''}
                  </Text>
                  <View style={styles.metaRow}>
                    <View style={[styles.typePill, {
                      backgroundColor: isMeccan ? 'rgba(231,76,60,0.1)' : 'rgba(39,174,96,0.1)',
                    }]}>
                      <Ionicons name={isMeccan ? 'flame' : 'leaf'} size={10} color={isMeccan ? '#e74c3c' : '#27ae60'} />
                      <Text style={[styles.typeLabel, { color: isMeccan ? '#e74c3c' : '#27ae60' }]}>
                        {surah.revelationType}
                      </Text>
                    </View>
                    <View style={[styles.juzBadge, { backgroundColor: 'rgba(212,175,55,0.1)' }]}>
                      <Text style={[styles.juzLabel, { color: COLORS.secondary }]}>Juz {juz}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.cardRight}>
                  <Text style={[styles.arNameLarge, { color: COLORS.secondary }]} numberOfLines={2}>
                    {surah.name}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </ScreenBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingBottom: 10 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '700' },
  headerSub: { fontSize: 13, marginTop: 4 },
  headerBadge: { width: 48, height: 48, borderRadius: 24, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  tabRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 12 },
  tab: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)' },
  tabText: { fontSize: 13 },
  searchWrap: { paddingHorizontal: 20, marginBottom: 8 },
  searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 2, paddingHorizontal: 14, paddingVertical: 2, gap: 8 },
  search: { flex: 1, fontSize: 14, paddingVertical: 10 },
  list: { padding: 20, paddingTop: 8, gap: 10, paddingBottom: 40 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, borderWidth: 1.5, gap: 12 },
  cardLeft: {},
  numberWrap: { width: 42, height: 42, borderRadius: 21, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  number: { fontWeight: '700', fontSize: 16 },
  cardCenter: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  engName: { fontSize: 15, fontWeight: '700', flex: 1 },
  ayahCount: { fontSize: 11, fontWeight: '500' },
  arName: { fontSize: 14, fontWeight: '600', marginTop: 3 },
  translation: { fontSize: 11, marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  typePill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, gap: 4 },
  typeLabel: { fontSize: 10, fontWeight: '600' },
  juzBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  juzLabel: { fontSize: 10, fontWeight: '600' },
  cardRight: { alignItems: 'flex-end', gap: 8 },
  arNameLarge: { fontSize: 18, fontWeight: '700', textAlign: 'right', maxWidth: 60 },
  emptyState: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { fontSize: 14 },
});
