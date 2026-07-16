import React, { useState, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, RefreshControl, Animated, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

export default function QuranScreen({ navigation }) {
  const { surahs, t, refreshing, refreshData } = useApp();
  const [search, setSearch] = useState('');
  const [playingSurah, setPlayingSurah] = useState(null);
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

  const filtered = surahs.filter(s => {
    const q = search.toLowerCase();
    const num = s.surah_number || s.number || 0;
    const name = (s.name || '').toLowerCase();
    const arabic = (s.name_arabic || '').toLowerCase();
    return !q || name.includes(q) || arabic.includes(q) || String(num).includes(q);
  });

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
          <View style={styles.headerIcon}>
            <BookOpen size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.headerTitle}>
            {t('Qor\'an', 'Quran', 'القرآن')}
          </Text>
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
              const arabic = surah.name_arabic || '';
              const translation = surah.translation || surah.translation_en || '';
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
                    {translation ? (
                      <Text style={styles.translation} numberOfLines={1}>{translation}</Text>
                    ) : null}
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
  headerIcon: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },

  scrollContent: { paddingBottom: 10 },

  searchWrap: { paddingHorizontal: 16, paddingTop: 14 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 14, gap: 8,
  },
  search: { flex: 1, fontSize: 14, paddingVertical: 12, color: '#FFFFFF' },
  clearBtn: { padding: 4 },

  listWrap: { paddingHorizontal: 16, paddingTop: 12, gap: 10 },

  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', gap: 12,
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
  translation: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 1 },

  cardRight: { alignItems: 'center', paddingLeft: 8 },

  emptyState: {
    alignItems: 'center', paddingVertical: 48, gap: 12, backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  emptyText: { fontSize: 14, color: 'rgba(255,255,255,0.5)' },
});
