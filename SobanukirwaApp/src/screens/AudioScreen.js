import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import ScreenBackground from '../components/ScreenBackground';

export default function AudioScreen({ navigation }) {
  const { tracks, categories, t, COLORS, refreshing, refreshData } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');

  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [])
  );

  const allCategoriesList = ['all', ...categories.map(c => c.name || c)];

  const filteredTracks = selectedCategory === 'all'
    ? tracks
    : tracks.filter(t => (t.category_name || t.category) === selectedCategory);

  const searchedTracks = search
    ? filteredTracks.filter(t =>
        (t.title || '').toLowerCase().includes(search.toLowerCase())
      )
    : filteredTracks;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      <ScreenBackground imageKey="bg-audio">
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: COLORS.secondary }]}>
          {t('Inyigisho za Audio', 'Audio Lessons', 'الدروس الصوتية')}
        </Text>
      </View>

      <View style={styles.categoryTabs}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}>
          {allCategoriesList.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryTab,
                selectedCategory === cat && styles.categoryTabActive,
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[
                styles.categoryTabText,
                { color: selectedCategory === cat ? '#0f2a3f' : COLORS.textMuted },
                selectedCategory === cat && { fontWeight: '700', color: '#0f2a3f' }
              ]}>
                {cat === 'all' ? t('Byose', 'All', 'الكل') : cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.searchWrap}>
        <TextInput
          style={[styles.search, { backgroundColor: COLORS.surface, borderColor: COLORS.border, color: COLORS.text }]}
          placeholder={t('Shakisha inyigisho...', 'Search lessons...', 'ابحث عن درس...')}
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshData}
            tintColor={COLORS.secondary}
            colors={[COLORS.secondary]}
          />
        }
      >
        {searchedTracks.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="musical-notes" size={48} color={COLORS.secondary} />
            <Text style={[styles.emptyText, { color: COLORS.textMuted }]}>
              {t('Nta nyigisho zibonetse', 'No lessons found', 'لم يتم العثور على دروس')}
            </Text>
          </View>
        ) : searchedTracks.map((track, index) => {
          const catName = track.category_name || track.category || 'General';
          const artistName = track.artist_name || track.artist || '';
          return (
            <TouchableOpacity
              key={track.id || index}
              style={[styles.trackCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}
              onPress={() => navigation.navigate('AudioPlayer', { category: catName, tracks: searchedTracks, startIndex: index })}
            >
              <View style={[styles.playBtn, { borderColor: COLORS.secondary }]}>
                <Ionicons name="play" size={20} color={COLORS.secondary} />
              </View>
              <View style={styles.trackInfo}>
                <Text style={[styles.trackTitle, { color: COLORS.text }]} numberOfLines={1}>
                  {t(track.title, track.title_en || track.title, track.title_ar || track.title)}
                </Text>
                {artistName ? (
                  <Text style={[styles.trackArtist, { color: COLORS.textGold }]} numberOfLines={1}>
                    {t(artistName, track.artist_name_en || artistName, track.artist_name_ar || artistName)}
                  </Text>
                ) : null}
                <View style={styles.trackMeta}>
                  <Text style={[styles.trackMetaText, { color: COLORS.textMuted }]}>
                    {catName}
                  </Text>
                  {track.duration ? (
                    <Text style={[styles.trackMetaText, { color: COLORS.textMuted }]}>
                      {track.duration}
                    </Text>
                  ) : null}
                </View>
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
  headerTitle: { fontSize: 24, fontWeight: '700' },
  categoryTabs: { marginBottom: 12 },
  categoryTab: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)',
  },
  categoryTabActive: { backgroundColor: '#d4af37', borderColor: '#d4af37' },
  categoryTabText: { fontSize: 13 },
  searchWrap: { paddingHorizontal: 20, marginBottom: 10 },
  search: { padding: 12, borderRadius: 14, borderWidth: 2, fontSize: 14 },
  list: { padding: 20, paddingTop: 8, gap: 10, paddingBottom: 40 },
  trackCard: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    borderRadius: 14, borderWidth: 1.5, gap: 12,
  },
  playBtn: {
    width: 40, height: 40, borderRadius: 20, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  trackInfo: { flex: 1 },
  trackTitle: { fontSize: 15, fontWeight: '600' },
  trackArtist: { fontSize: 12, marginTop: 2 },
  trackMeta: { flexDirection: 'row', gap: 12, marginTop: 4 },
  trackMetaText: { fontSize: 11 },
  emptyState: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { fontSize: 14 },
});
