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
        <Text style={[styles.headerTitle, { color: COLORS.secondary }]}>
          {t('Qur\'an', 'Quran', 'القرآن الكريم')}
        </Text>
        <Text style={[styles.headerSub, { color: COLORS.textMuted }]}>
          {surahs.length} {t('sura', 'surahs', 'سورة')}
        </Text>
      </View>

      <View style={styles.tabRow}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, selectedTab === tab && styles.tabActive]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text style={[styles.tabText, { color: selectedTab === tab ? COLORS.primaryDark : COLORS.textMuted }, selectedTab === tab && { fontWeight: '700' }]}>
              {t(tab === 'All' ? 'Byose' : tab === 'Meccan' ? 'Mecca' : 'Madina', tab, tab === 'All' ? 'الكل' : tab === 'Meccan' ? 'مكة' : 'المدينة')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.searchWrap}>
        <TextInput
          style={[styles.search, { backgroundColor: COLORS.surface, borderColor: COLORS.border, color: COLORS.text }]}
          placeholder={t('Shakisha sura...', 'Search surahs...', 'ابحث عن سورة...')}
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
        />
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
          const typeBadge = surah.revelationType === 'Meccan'
            ? { bg: 'rgba(212,175,55,0.15)', color: COLORS.secondary, label: 'M' }
            : { bg: 'rgba(39,174,96,0.15)', color: '#27ae60', label: 'Md' };
          return (
            <TouchableOpacity
              key={surah.number}
              style={[styles.card, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}
              onPress={() => navigation.navigate('SurahDetail', { surah })}
            >
              <View style={[styles.numberWrap, { backgroundColor: 'rgba(212,175,55,0.1)', borderColor: 'rgba(212,175,55,0.25)' }]}>
                <Text style={[styles.number, { color: COLORS.secondary }]}>{surah.number}</Text>
              </View>
              <View style={styles.info}>
                <View style={styles.nameRow}>
                  <Text style={[styles.name, { color: COLORS.text }]}>{surah.englishName || `Surah ${surah.number}`}</Text>
                  <View style={[styles.typeBadge, { backgroundColor: typeBadge.bg }]}>
                    <Text style={[styles.typeBadgeText, { color: typeBadge.color }]}>{typeBadge.label}</Text>
                  </View>
                </View>
                <Text style={[styles.nameAr, { color: COLORS.secondary }]}>{surah.name}</Text>
                <Text style={[styles.meta, { color: COLORS.textMuted }]}>
                  {surah.numberOfAyahs} ayahs • {surah.revelationType}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
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
  header: { padding: 20, paddingBottom: 6 },
  headerTitle: { fontSize: 24, fontWeight: '700' },
  headerSub: { fontSize: 13, marginTop: 4 },
  tabRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 10 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)' },
  tabActive: { backgroundColor: '#d4af37', borderColor: '#d4af37' },
  tabText: { fontSize: 13 },
  searchWrap: { paddingHorizontal: 20, marginBottom: 10 },
  search: { padding: 12, borderRadius: 14, borderWidth: 2, fontSize: 14 },
  list: { padding: 20, paddingTop: 8, gap: 10, paddingBottom: 40 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 1.5, gap: 12 },
  numberWrap: { width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  number: { fontWeight: '700', fontSize: 15 },
  info: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { fontSize: 15, fontWeight: '600' },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  typeBadgeText: { fontSize: 10, fontWeight: '700' },
  nameAr: { fontSize: 13, marginTop: 2 },
  meta: { fontSize: 12, marginTop: 2 },
  emptyState: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { fontSize: 14 },
});
