import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { getMediaUrl } from '../services/api';
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
    : tracks.filter(tr => (tr.category_name || tr.category) === selectedCategory);

  const searchedTracks = search
    ? filteredTracks.filter(tr =>
        (tr.title || '').toLowerCase().includes(search.toLowerCase()) ||
        (tr.artist_name || tr.artist || '').toLowerCase().includes(search.toLowerCase())
      )
    : filteredTracks;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      <ScreenBackground imageKey="bg-audio">
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={[styles.headerTitle, { color: COLORS.secondary }]}>
                {t('Inyigisho za Audio', 'Audio Lessons', 'الدروس الصوتية')}
              </Text>
              <Text style={[styles.headerSub, { color: COLORS.textMuted }]}>
                {searchedTracks.length} {t('inyigisho', 'lessons', 'درس')}
              </Text>
            </View>
            <View style={[styles.headerIcon, { backgroundColor: 'rgba(212,175,55,0.12)', borderColor: 'rgba(212,175,55,0.25)' }]}>
              <Ionicons name="headset" size={24} color={COLORS.secondary} />
            </View>
          </View>
        </View>

        <View style={styles.categoryTabs}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            {allCategoriesList.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryTab, isActive && { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary }]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text style={[styles.categoryTabText, { color: isActive ? '#0a2f44' : COLORS.textMuted }]}>
                    {cat === 'all' ? t('Byose', 'All', 'الكل') : cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.searchWrap}>
          <View style={[styles.searchBar, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
            <Ionicons name="search" size={18} color={COLORS.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: COLORS.text }]}
              placeholder={t('Shakisha inyigisho...', 'Search lessons...', 'ابحث عن درس...')}
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
            const artistImage = track.artist_image || track.artistImage || '';
            return (
              <TouchableOpacity
                key={track.id || index}
                style={[styles.trackCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}
                onPress={() => navigation.navigate('AudioPlayer', { category: catName, tracks: searchedTracks, startIndex: index })}
                activeOpacity={0.7}
              >
                <View style={styles.trackLeft}>
                  {artistImage ? (
                    <Image source={{ uri: artistImage.startsWith('http') ? artistImage : getMediaUrl(artistImage) }} style={styles.artistAvatar} />
                  ) : (
                    <View style={[styles.artistAvatarPlaceholder, { backgroundColor: 'rgba(212,175,55,0.1)', borderColor: 'rgba(212,175,55,0.2)' }]}>
                      <Ionicons name="person" size={20} color={COLORS.secondary} />
                    </View>
                  )}
                </View>
                <View style={styles.trackInfo}>
                  <Text style={[styles.trackTitle, { color: COLORS.text }]} numberOfLines={1}>
                    {t(track.title, track.title_en || track.title, track.title_ar || track.title)}
                  </Text>
                  {artistName ? (
                    <Text style={[styles.trackArtist, { color: COLORS.secondary }]} numberOfLines={1}>
                      {t(artistName, track.artist_name_en || artistName, track.artist_name_ar || artistName)}
                    </Text>
                  ) : null}
                  <View style={styles.trackMetaRow}>
                    <View style={[styles.trackCatBadge, { backgroundColor: 'rgba(212,175,55,0.1)' }]}>
                      <Ionicons name="folder" size={10} color={COLORS.secondary} />
                      <Text style={[styles.trackCatText, { color: COLORS.secondary }]}>{catName}</Text>
                    </View>
                    {track.duration ? (
                      <View style={[styles.trackDurBadge, { backgroundColor: 'rgba(212,175,55,0.08)' }]}>
                        <Ionicons name="time" size={10} color={COLORS.textMuted} />
                        <Text style={[styles.trackDurText, { color: COLORS.textMuted }]}>{track.duration}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
                <View style={[styles.trackPlayBtn, { backgroundColor: 'rgba(212,175,55,0.1)', borderColor: 'rgba(212,175,55,0.2)' }]}>
                  <Ionicons name="play" size={18} color={COLORS.secondary} />
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
  headerIcon: { width: 48, height: 48, borderRadius: 24, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  categoryTabs: { marginBottom: 10 },
  categoryScroll: { gap: 8, paddingHorizontal: 20 },
  categoryTab: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)' },
  categoryTabText: { fontSize: 13, fontWeight: '600' },
  searchWrap: { paddingHorizontal: 20, marginBottom: 8 },
  searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 2, paddingHorizontal: 14, gap: 8 },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 10 },
  list: { padding: 20, paddingTop: 8, gap: 10, paddingBottom: 40 },
  trackCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, borderWidth: 1.5, gap: 12 },
  trackLeft: {},
  artistAvatar: { width: 48, height: 48, borderRadius: 24 },
  artistAvatarPlaceholder: { width: 48, height: 48, borderRadius: 24, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  trackInfo: { flex: 1 },
  trackTitle: { fontSize: 15, fontWeight: '700' },
  trackArtist: { fontSize: 12, marginTop: 3, fontWeight: '500' },
  trackMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  trackCatBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, gap: 4 },
  trackCatText: { fontSize: 10, fontWeight: '600' },
  trackDurBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, gap: 4 },
  trackDurText: { fontSize: 10, fontWeight: '600' },
  trackPlayBtn: { width: 42, height: 42, borderRadius: 21, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  emptyState: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { fontSize: 14 },
});
