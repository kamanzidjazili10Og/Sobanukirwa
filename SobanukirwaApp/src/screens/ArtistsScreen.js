import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, RefreshControl, Image, ActivityIndicator, FlatList,
  Dimensions, ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { fetchArtists, fetchTracks, getMediaUrl } from '../services/api';
import { Users, Play, Search, Music, ChevronLeft, Headphones, Plus } from 'lucide-react-native';
import { playClickSound } from '../utils/sound';

export default function ArtistsScreen({ navigation }) {
  const { t } = useApp();
  const [artists, setArtists] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [artistTracks, setArtistTracks] = useState([]);

  const loadData = useCallback(async () => {
    try {
      const [a, tr] = await Promise.all([
        fetchArtists().catch(() => []),
        fetchTracks().catch(() => []),
      ]);
      setArtists(Array.isArray(a) ? a : []);
      setTracks(Array.isArray(tr) ? tr : []);
    } catch (e) {}
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filteredArtists = search
    ? artists.filter(a =>
        (a.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (a.name_en || '').toLowerCase().includes(search.toLowerCase())
      )
    : artists;

  const handleArtistPress = (artist) => {
    playClickSound();
    if (selectedArtist?.id === artist.id) {
      setSelectedArtist(null);
      setArtistTracks([]);
    } else {
      setSelectedArtist(artist);
      const filtered = tracks.filter(t => t.artist_id === artist.id || t.artist_name === artist.name);
      setArtistTracks(filtered);
    }
  };

  const handleTrackPress = (track, index) => {
    playClickSound();
    const trackList = artistTracks.length > 0 ? artistTracks : tracks;
    navigation.navigate('AudioPlayer', {
      category: selectedArtist?.name || 'Artists',
      tracks: trackList,
      startIndex: index,
    });
  };

  return (
    <ImageBackground source={require('../../assets/bg-audio.jpg')} style={styles.bgImage} resizeMode="cover">
      <View style={styles.overlay} />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack()}>
            <ChevronLeft size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{t('Abahanzi', 'Artists', 'الفنانون')}</Text>
            <Text style={styles.headerSub}>
              {filteredArtists.length} {t('abahanzi', 'artists', 'فنان')}
            </Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        <View style={styles.searchWrap}>
          <View style={styles.searchBar}>
            <Search size={18} color="rgba(255,255,255,0.4)" />
            <TextInput
              style={styles.searchInput}
              placeholder={t('Shakisha uhanzi...', 'Search artists...', 'ابحث عن فنان...')}
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color="#D4AF37" />
            <Text style={styles.loadingText}>{t('Gutegura...', 'Loading...', 'جاري التحميل...')}</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D4AF37" colors={['#D4AF37']} />
            }
            showsVerticalScrollIndicator={false}
          >
            {filteredArtists.length === 0 ? (
              <View style={styles.emptyState}>
                <Users size={48} color="rgba(255,255,255,0.2)" />
                <Text style={styles.emptyText}>
                  {t('Nta bahanzi babonetse', 'No artists found', 'لم يتم العثور على فنانين')}
                </Text>
              </View>
            ) : (
              <View style={styles.artistGrid}>
                {filteredArtists.map((artist) => {
                  const isSelected = selectedArtist?.id === artist.id;
                  const trackCount = artist.total_tracks ?? artist.tracks_count ?? tracks.filter(t => t.artist_id === artist.id).length;
                  const imageUrl = artist.image_url ? getMediaUrl(artist.image_url) : null;

                  return (
                    <View key={artist.id}>
                      <TouchableOpacity
                        style={[styles.artistCard, isSelected && styles.artistCardActive]}
                        onPress={() => handleArtistPress(artist)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.artistImageWrap}>
                          {imageUrl ? (
                            <Image source={{ uri: imageUrl }} style={styles.artistImage} />
                          ) : (
                            <View style={styles.artistImagePlaceholder}>
                              <Users size={28} color="#D4AF37" />
                            </View>
                          )}
                          <View style={styles.artistPlayBadge}>
                            <Play size={14} color="#0a1220" fill="#0a1220" />
                          </View>
                        </View>
                        <View style={styles.artistInfo}>
                          <Text style={styles.artistName} numberOfLines={1}>
                            {t(artist.name, artist.name_en || artist.name, artist.name_ar || artist.name)}
                          </Text>
                          <Text style={styles.artistTrackCount}>
                            {trackCount} {t('inyigisho', 'tracks', 'مقطع')}
                          </Text>
                        </View>
                      </TouchableOpacity>

                      {isSelected && artistTracks.length > 0 && (
                        <View style={styles.artistTracksSection}>
                          <Text style={styles.artistTracksTitle}>
                            {t('Inyigisho bya', 'Tracks by', 'مقاطع')} {artist.name}
                          </Text>
                          {artistTracks.map((track, index) => (
                            <TouchableOpacity
                              key={track.id || index}
                              style={styles.trackCard}
                              onPress={() => handleTrackPress(track, index)}
                              activeOpacity={0.7}
                            >
                              <View style={styles.trackLeft}>
                                <View style={styles.trackNumWrap}>
                                  <Text style={styles.trackNum}>{index + 1}</Text>
                                </View>
                              </View>
                              <View style={styles.trackInfo}>
                                <Text style={styles.trackTitle} numberOfLines={1}>
                                  {t(track.title, track.title_en || track.title, track.title_ar || track.title)}
                                </Text>
                                {track.category_name ? (
                                  <Text style={styles.trackCategory}>{track.category_name}</Text>
                                ) : null}
                              </View>
                              <View style={styles.trackPlayBtn}>
                                <Play size={14} color="#D4AF37" fill="#D4AF37" />
                              </View>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}

                      {isSelected && artistTracks.length === 0 && (
                        <View style={styles.noTracksMsg}>
                          <Music size={16} color="rgba(255,255,255,0.4)" />
                          <Text style={styles.noTracksText}>
                            {t('Nta nyigisho zibonetse', 'No tracks found', 'لم يتم العثور على مقاطع')}
                          </Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}

            {!selectedArtist && tracks.length > 0 && (
              <View style={styles.allTracksSection}>
                <View style={styles.sectionHeader}>
                  <Headphones size={18} color="#D4AF37" />
                  <Text style={styles.sectionTitle}>
                    {t('Ibinyigisho byose', 'All Tracks', 'جميع المقاطع')}
                  </Text>
                </View>
                {tracks.slice(0, 20).map((track, index) => (
                  <TouchableOpacity
                    key={track.id || index}
                    style={styles.trackCard}
                    onPress={() => {
                      playClickSound();
                      navigation.navigate('AudioPlayer', {
                        category: track.category_name || 'Audio',
                        tracks: tracks,
                        startIndex: index,
                      });
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.trackLeft}>
                      {track.artist_image ? (
                        <Image
                          source={{ uri: getMediaUrl(track.artist_image) }}
                          style={styles.trackThumb}
                        />
                      ) : (
                        <View style={styles.trackThumbPlaceholder}>
                          <Music size={16} color="#D4AF37" />
                        </View>
                      )}
                    </View>
                    <View style={styles.trackInfo}>
                      <Text style={styles.trackTitle} numberOfLines={1}>
                        {t(track.title, track.title_en || track.title, track.title_ar || track.title)}
                      </Text>
                      <Text style={styles.trackArtist} numberOfLines={1}>
                        {t(track.artist_name || track.artist || '', track.artist_name_en || track.artist_name || '', track.artist_name_ar || track.artist_name || '')}
                      </Text>
                    </View>
                    {track.duration_str ? (
                      <Text style={styles.trackDuration}>{track.duration_str}</Text>
                    ) : null}
                    <View style={styles.trackPlayBtn}>
                      <Play size={14} color="#D4AF37" fill="#D4AF37" />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <View style={{ height: 30 }} />
          </ScrollView>
        )}
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bgImage: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(6, 48, 44, 0.6)' },
  container: { flex: 1, backgroundColor: 'transparent' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 8,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', fontFamily: 'serif' },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 },

  searchWrap: { paddingHorizontal: 16, marginBottom: 8 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 14, gap: 8,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 11, color: '#FFFFFF' },

  scrollContent: { paddingBottom: 20 },

  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 13, color: 'rgba(255,255,255,0.6)' },

  emptyState: {
    alignItems: 'center', paddingVertical: 60, gap: 12,
    marginHorizontal: 16, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  emptyText: { fontSize: 14, color: 'rgba(255,255,255,0.5)' },

  artistGrid: { paddingHorizontal: 16, gap: 12 },

  artistCard: {
    flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(0,0,0,0.2)', gap: 12,
  },
  artistCardActive: {
    borderColor: 'rgba(212,175,55,0.5)',
    backgroundColor: 'rgba(212,175,55,0.08)',
  },
  artistImageWrap: { position: 'relative' },
  artistImage: { width: 64, height: 64, borderRadius: 32 },
  artistImagePlaceholder: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(212,175,55,0.1)',
    borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)',
  },
  artistPlayBadge: {
    position: 'absolute', bottom: -2, right: -2,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#D4AF37', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(6,48,44,0.8)',
  },
  artistInfo: { flex: 1 },
  artistName: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  artistTrackCount: { fontSize: 12, color: '#5EEAD4', marginTop: 3, fontWeight: '500' },

  artistTracksSection: {
    marginTop: 4, marginBottom: 4, marginLeft: 20, gap: 6,
  },
  artistTracksTitle: {
    fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.5)',
    paddingHorizontal: 8, paddingVertical: 4,
  },

  trackCard: {
    flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(0,0,0,0.15)', gap: 10,
  },
  trackLeft: {},
  trackNumWrap: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(212,175,55,0.1)',
  },
  trackNum: { fontSize: 12, fontWeight: '700', color: '#D4AF37' },
  trackInfo: { flex: 1 },
  trackTitle: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
  trackArtist: { fontSize: 11, color: '#5EEAD4', marginTop: 2 },
  trackCategory: { fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  trackDuration: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginRight: 4 },
  trackPlayBtn: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(212,175,55,0.12)',
  },
  trackThumb: { width: 36, height: 36, borderRadius: 8 },
  trackThumbPlaceholder: {
    width: 36, height: 36, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(212,175,55,0.1)',
  },

  noTracksMsg: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 8, marginLeft: 20,
  },
  noTracksText: { fontSize: 12, color: 'rgba(255,255,255,0.4)' },

  allTracksSection: { marginTop: 20, paddingHorizontal: 16 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
