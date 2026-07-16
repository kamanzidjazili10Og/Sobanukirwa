import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, RefreshControl, Image, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { getMediaUrl } from '../services/api';
import { Headphones, Play, Search, Music, ChevronLeft, X } from 'lucide-react-native';

const COLORS = {
  primary: '#0F766E',
  secondary: '#14B8A6',
  accent: '#F59E0B',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  border: '#E5E7EB',
  success: '#10B981',
  error: '#EF4444',
};

export default function AudioScreen({ navigation }) {
  const { tracks, categories, t, refreshing, refreshData } = useApp();
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
    <ImageBackground source={require('../../assets/bg-audio.jpg')} style={styles.bgImage} resizeMode="cover">
      <View style={styles.overlay} />
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refreshData} tintColor={COLORS.secondary} colors={[COLORS.secondary]} />
          }
          showsVerticalScrollIndicator={false}
          scrollIndicatorInsets={{ right: 999 }}
        >
          {/* Hero Header */}
          <View style={styles.heroSection}>
            <View style={styles.heroContent}>
              <View style={styles.heroIconWrap}>
                <Headphones size={28} color={COLORS.surface} />
              </View>
              <Text style={styles.heroTitle}>
                {t('Inyigisho za Audio', 'Audio Lessons', 'الدروس الصوتية')}
              </Text>
              <Text style={styles.heroSub}>
                {searchedTracks.length} {t('inyigisho', 'lessons', 'درس')} • {t('Izihe', 'Listen', 'استمع')}
              </Text>
            </View>
          </View>

          {/* Category Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {allCategoriesList.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryTab, isActive && styles.categoryTabActive]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text style={[styles.categoryTabText, isActive && styles.categoryTabTextActive]}>
                    {cat === 'all' ? t('Byose', 'All', 'الكل') : cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Search */}
          <View style={styles.searchWrap}>
            <View style={styles.searchBar}>
              <Search size={18} color={COLORS.textTertiary} />
              <TextInput
                style={styles.searchInput}
                placeholder={t('Shakisha inyigisho...', 'Search lessons...', 'ابحث عن درس...')}
                placeholderTextColor={COLORS.textTertiary}
                value={search}
                onChangeText={setSearch}
              />
              {search ? (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <X size={18} color={COLORS.textTertiary} />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {/* Track List */}
          <View style={styles.listWrap}>
            {searchedTracks.length === 0 ? (
              <View style={styles.emptyState}>
                <Music size={48} color={COLORS.textTertiary} />
                <Text style={styles.emptyText}>
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
                  style={styles.trackCard}
                  onPress={() => navigation.navigate('AudioPlayer', { category: catName, tracks: searchedTracks, startIndex: index })}
                  activeOpacity={0.7}
                >
                  {/* Album Art Placeholder */}
                  <View style={styles.trackLeft}>
                    {artistImage ? (
                      <Image source={{ uri: artistImage.startsWith('http') ? artistImage : getMediaUrl(artistImage) }} style={styles.artistAvatar} />
                    ) : (
                      <View style={styles.artistAvatarPlaceholder}>
                        <Music size={22} color={COLORS.surface} />
                      </View>
                    )}
                  </View>

                  {/* Track Info */}
                  <View style={styles.trackInfo}>
                    <Text style={styles.trackTitle} numberOfLines={1}>
                      {t(track.title, track.title_en || track.title, track.title_ar || track.title)}
                    </Text>
                    {artistName ? (
                      <Text style={styles.trackArtist} numberOfLines={1}>
                        {t(artistName, track.artist_name_en || artistName, track.artist_name_ar || artistName)}
                      </Text>
                    ) : null}
                    <View style={styles.trackMetaRow}>
                      <View style={styles.trackCatBadge}>
                        <Text style={styles.trackCatText}>{catName}</Text>
                      </View>
                      {track.duration ? (
                        <View style={styles.trackDurBadge}>
                          <Text style={styles.trackDurText}>{track.duration}</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>

                  {/* Play Button */}
                  <View style={styles.trackPlayBtn}>
                    <Play size={18} color={COLORS.primary} fill={COLORS.primary} />
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
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(6, 48, 44, 0.6)' },

  container: { flex: 1, backgroundColor: 'transparent' },

  scrollContent: { paddingBottom: 10 },

  /* Hero */
  heroSection: {
    paddingVertical: 24, paddingHorizontal: 20, alignItems: 'center',
    marginHorizontal: 16, marginTop: 12, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  heroContent: { alignItems: 'center' },
  heroIconWrap: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.primary, marginBottom: 10,
  },
  heroTitle: { fontSize: 22, fontWeight: '800', letterSpacing: 0.5, color: '#FFFFFF' },
  heroSub: { fontSize: 12, marginTop: 4, fontWeight: '500', color: 'rgba(255,255,255,0.7)' },

  /* Categories */
  categoryScroll: { gap: 8, paddingHorizontal: 16, paddingVertical: 10 },
  categoryTab: {
    paddingHorizontal: 18, paddingVertical: 9, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  categoryTabActive: { backgroundColor: '#0F766E', borderColor: '#0F766E' },
  categoryTabText: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.7)' },
  categoryTabTextActive: { color: '#FFFFFF' },

  /* Search */
  searchWrap: { paddingHorizontal: 16 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 14, gap: 8,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 11, color: '#FFFFFF' },

  /* List */
  listWrap: { paddingHorizontal: 16, paddingTop: 12, gap: 10 },

  /* Track Card */
  trackCard: {
    flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 18,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', gap: 12,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  trackLeft: {},
  artistAvatar: { width: 52, height: 52, borderRadius: 26 },
  artistAvatarPlaceholder: {
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  trackInfo: { flex: 1 },
  trackTitle: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  trackArtist: { fontSize: 12, marginTop: 3, fontWeight: '500', color: '#5EEAD4' },
  trackMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  trackCatBadge: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 8, backgroundColor: 'rgba(15,118,110,0.2)',
  },
  trackCatText: { fontSize: 10, fontWeight: '600', color: '#5EEAD4' },
  trackDurBadge: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.08)',
  },
  trackDurText: { fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.5)' },
  trackPlayBtn: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(15,118,110,0.2)', borderWidth: 1, borderColor: 'rgba(15,118,110,0.3)',
  },

  /* Empty */
  emptyState: {
    alignItems: 'center', paddingVertical: 48, gap: 12, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  emptyText: { fontSize: 14, color: 'rgba(255,255,255,0.6)' },
});
