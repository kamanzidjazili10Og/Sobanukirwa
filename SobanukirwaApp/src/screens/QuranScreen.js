import React, { useState, useCallback, useRef, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, RefreshControl, Animated, ImageBackground, SectionList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BookOpen, Search, X, Volume2, Pause, ChevronRight } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useApp } from '../context/AppContext';

const COLORS = {
  primary: '#0F766E',
  secondary: '#14B8A6',
  accent: '#F59E0B',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  border: '#E5E7EB',
};

const TABS = ['All', 'Meccan', 'Medinan'];

export default function QuranScreen({ navigation }) {
  const { surahs, t, refreshing, refreshData } = useApp();
  const [search, setSearch] = useState('');
  const [playingSurah, setPlayingSurah] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [])
  );

  React.useEffect(() => {
    if (playingSurah) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.4, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [playingSurah]);

  const filtered = useMemo(() => {
    return surahs.filter(s => {
      const q = search.toLowerCase();
      const num = s.surah_number || s.number || 0;
      const name = (s.name || '').toLowerCase();
      const arabic = (s.name_arabic || s.nameArabic || '').toLowerCase();
      const revType = (s.revelation_type || s.revelationType || s.type || '').toLowerCase();
      const matchesSearch = !q || name.includes(q) || arabic.includes(q) || String(num).includes(q);
      const matchesTab = activeTab === 'All' || revType.toLowerCase().includes(activeTab.toLowerCase()) ||
        (activeTab === 'Meccan' && (revType === 'makkah' || revType === 'meccan')) ||
        (activeTab === 'Medinan' && (revType === 'madani' || revType === 'medinan'));
      return matchesSearch && matchesTab;
    });
  }, [surahs, search, activeTab]);

  const stats = useMemo(() => {
    const meccan = surahs.filter(s => {
      const rt = (s.revelation_type || s.type || '').toLowerCase();
      return rt === 'makkah' || rt === 'meccan';
    }).length;
    const medinan = surahs.length - meccan;
    return { total: surahs.length, meccan, medinan };
  }, [surahs]);

  function handleSurahPress(surah) {
    const num = surah.surah_number || surah.number;
    const padNum = String(num).padStart(3, '0');
    const audioUrl = surah.audio_url || `https://server7.mp3quran.net/ahmed/${padNum}.mp3`;
    setPlayingSurah(num);
    navigation.navigate('AudioPlayer', {
      category: surah.name || `Surah ${num}`,
      tracks: [{
        id: num,
        title: surah.name || `Surah ${num}`,
        artist_name: 'Ahmed Al-Ajmi',
        audio_url: audioUrl,
      }],
      startIndex: 0,
    });
  }

  return (
    <ImageBackground source={require('../../assets/bg-quran.jpg')} style={styles.bgImage} resizeMode="cover">
      <View style={styles.overlay} />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerIcon}>
            <BookOpen size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.headerTitle}>
            {t('Qor\'an', 'Quran', 'القرآن')}
          </Text>
          <View style={styles.headerStats}>
            <Text style={styles.headerStatsText}>{stats.total}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: COLORS.accent }]}>{stats.total}</Text>
            <Text style={styles.statLabel}>{t('Zose', 'Total', 'الكل')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: '#EF4444' }]}>{stats.meccan}</Text>
            <Text style={styles.statLabel}>{t('Makka', 'Meccan', 'مكية')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: '#10B981' }]}>{stats.medinan}</Text>
            <Text style={styles.statLabel}>{t('Madina', 'Medinan', 'مدنية')}</Text>
          </View>
        </View>

        <View style={styles.tabRow}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {t(
                  tab === 'All' ? 'Zose' : tab === 'Meccan' ? 'Makka' : 'Madina',
                  tab,
                  tab === 'All' ? 'الكل' : tab === 'Meccan' ? 'مكية' : 'مدنية'
                )}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refreshData} tintColor={COLORS.secondary} colors={[COLORS.secondary]} />
          }
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.searchWrap}>
            <View style={styles.searchBar}>
              <Search size={18} color={COLORS.textTertiary} />
              <TextInput
                style={styles.search}
                placeholder={t('Shakisha sura...', 'Search surahs...', 'ابحث عن سورة...')}
                placeholderTextColor={COLORS.textTertiary}
                value={search}
                onChangeText={setSearch}
              />
              {search ? (
                <TouchableOpacity onPress={() => setSearch('')} style={styles.clearBtn}>
                  <X size={16} color={COLORS.textTertiary} />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          <View style={styles.listWrap}>
            {filtered.length === 0 ? (
              <View style={styles.emptyState}>
                <BookOpen size={48} color={COLORS.textTertiary} />
                <Text style={styles.emptyText}>
                  {t('Nta sura zibonetse', 'No surahs found', 'لم يتم العثور على سورة')}
                </Text>
              </View>
            ) : filtered.map((surah) => {
              const num = surah.surah_number || surah.number || 0;
              const name = surah.name || `Surah ${num}`;
              const arabic = surah.name_arabic || surah.nameArabic || '';
              const ayahs = surah.ayahs_count || surah.ayahs || surah.numberOfAyahs || '';
              const revType = surah.revelation_type || surah.revelationType || surah.type || '';
              const isMeccan = revType.toLowerCase() === 'makkah' || revType.toLowerCase() === 'meccan';
              const isPlaying = playingSurah === num;

              return (
                <TouchableOpacity
                  key={surah.id || num}
                  style={[
                    styles.card,
                    isPlaying && styles.cardPlaying,
                  ]}
                  onPress={() => handleSurahPress(surah)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.numberBadge,
                    isPlaying && styles.numberBadgePlaying,
                  ]}>
                    {isPlaying ? (
                      <Animated.View style={{ opacity: pulseAnim }}>
                        <Volume2 size={14} color="#FFFFFF" />
                      </Animated.View>
                    ) : (
                      <Text style={styles.numberBadgeText}>{num}</Text>
                    )}
                  </View>

                  <View style={styles.cardCenter}>
                    <Text style={styles.arName} numberOfLines={1}>{arabic || name}</Text>
                    <Text style={styles.transliteration} numberOfLines={1}>{name}</Text>
                    <View style={styles.cardMeta}>
                      {ayahs ? (
                        <Text style={styles.metaText}>{ayahs} {t('ayahs', 'ayahs', 'آيات')}</Text>
                      ) : null}
                      {revType ? (
                        <View style={[styles.typeBadge, { backgroundColor: isMeccan ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)' }]}>
                          <Text style={[styles.typeText, { color: isMeccan ? '#EF4444' : '#10B981' }]}>
                            {t(isMeccan ? 'Makka' : 'Madina', isMeccan ? 'Meccan' : 'Medinan', isMeccan ? 'مكية' : 'مدنية')}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </View>

                  <View style={styles.cardRight}>
                    {isPlaying ? (
                      <Pause size={20} color={COLORS.secondary} />
                    ) : (
                      <ChevronRight size={20} color={COLORS.textTertiary} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={{ height: 30 }} />
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bgImage: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(6, 48, 44, 0.35)' },
  container: { flex: 1, backgroundColor: 'transparent' },

  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: 'rgba(0,0,0,0.25)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', gap: 10,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.08)',
  },
  headerIcon: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', flex: 1 },
  headerStats: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, backgroundColor: 'rgba(245,158,11,0.2)' },
  headerStatsText: { fontSize: 13, fontWeight: '700', color: '#F59E0B' },

  statsRow: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 12,
    padding: 12, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 18, fontWeight: '700' },
  statLabel: { fontSize: 10, marginTop: 2, color: 'rgba(255,255,255,0.5)' },
  statDivider: { width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.1)' },

  tabRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginTop: 10 },
  tab: {
    flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  tabActive: { backgroundColor: 'rgba(245,158,11,0.2)', borderColor: 'rgba(245,158,11,0.3)' },
  tabText: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.5)' },
  tabTextActive: { color: '#F59E0B' },

  scrollContent: { paddingBottom: 10 },

  searchWrap: { paddingHorizontal: 16, paddingTop: 10 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 14, gap: 8,
  },
  search: { flex: 1, fontSize: 14, paddingVertical: 12, color: '#FFFFFF' },
  clearBtn: { padding: 4 },

  listWrap: { paddingHorizontal: 16, paddingTop: 10, gap: 8 },

  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', gap: 12,
  },
  cardPlaying: { borderColor: COLORS.secondary, borderWidth: 2 },

  numberBadge: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  numberBadgePlaying: { backgroundColor: COLORS.secondary },
  numberBadgeText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },

  cardCenter: { flex: 1 },
  arName: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', fontFamily: 'serif' },
  transliteration: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  metaText: { fontSize: 11, color: 'rgba(255,255,255,0.4)' },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  typeText: { fontSize: 10, fontWeight: '600' },

  cardRight: { alignItems: 'center', paddingLeft: 8 },

  emptyState: {
    alignItems: 'center', paddingVertical: 48, gap: 12, backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  emptyText: { fontSize: 14, color: 'rgba(255,255,255,0.5)' },
});
