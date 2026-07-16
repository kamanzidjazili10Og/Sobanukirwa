import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, ImageBackground, TextInput, RefreshControl, Dimensions, SectionList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { getMediaUrl } from '../services/api';
import { Film, Play, Search, PlayCircle, User, X } from 'lucide-react-native';

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

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 52) / 2;

function ThumbImage({ uri, title, style }) {
  const [failed, setFailed] = useState(false);
  if (failed || !uri) {
    return (
      <View style={[style, styles.thumbFallback]}>
        <Film size={32} color={COLORS.surface} />
        <Text style={styles.thumbFallbackText} numberOfLines={2}>{title || ''}</Text>
      </View>
    );
  }
  return <Image source={{ uri }} style={style} resizeMode="cover" onError={() => setFailed(true)} />;
}

export default function VideoScreen({ navigation }) {
  const { videos, t, refreshing, refreshData } = useApp();
  const [search, setSearch] = useState('');

  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [])
  );

  const filtered = search
    ? videos.filter(v =>
        (v.title || '').toLowerCase().includes(search.toLowerCase()) ||
        (v.author || '').toLowerCase().includes(search.toLowerCase())
      )
    : videos;

  const sections = useMemo(() => {
    const authorMap = {};
    const unknownVideos = [];

    filtered.forEach(v => {
      const author = v.author || v.author_en || '';
      if (author.trim()) {
        const key = author.trim();
        if (!authorMap[key]) authorMap[key] = [];
        authorMap[key].push(v);
      } else {
        unknownVideos.push(v);
      }
    });

    const result = [];
    const sortedAuthors = Object.keys(authorMap).sort();
    sortedAuthors.forEach(author => {
      result.push({
        title: author,
        data: authorMap[author],
        isAuthor: true,
      });
    });

    if (unknownVideos.length > 0) {
      result.push({
        title: t('Amashusho yose', 'All Videos', 'جميع الفيديوهات'),
        data: unknownVideos,
        isAuthor: false,
      });
    }

    return result;
  }, [filtered, t]);

  const hasGrouping = sections.length > 1 || (sections.length === 1 && sections[0].isAuthor);

  if (hasGrouping) {
    return (
      <ImageBackground source={require('../../assets/ten.jpg')} style={styles.bgImage} resizeMode="cover">
        <View style={styles.bgOverlay} />
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.headerLeft}>
                <View style={styles.headerIconWrap}>
                  <Film size={20} color={COLORS.surface} />
                </View>
                <View>
                  <Text style={styles.headerTitle}>
                    {t('Amashusho', 'Videos', 'الفيديو')}
                  </Text>
                  <Text style={styles.headerSub}>
                    {filtered.length} {t('amashusho', 'videos', 'فيديو')}
                  </Text>
                </View>
              </View>
              <View style={styles.headerBadge}>
                <PlayCircle size={20} color={COLORS.primary} />
              </View>
            </View>
          </View>

          <View style={styles.searchWrap}>
            <View style={styles.searchBar}>
              <Search size={18} color={COLORS.textTertiary} />
              <TextInput
                style={styles.search}
                placeholder={t('Shakisha amashusho...', 'Search videos...', 'ابحث عن فيديو...')}
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

          <SectionList
            sections={sections}
            keyExtractor={item => String(item.id)}
            renderSectionHeader={({ section }) => (
              <View style={styles.sectionHeader}>
                {section.isAuthor && (
                  <View style={styles.authorIcon}>
                    <User size={14} color={COLORS.primary} />
                  </View>
                )}
                <Text style={[styles.sectionTitle, { color: section.isAuthor ? '#FFFFFF' : COLORS.textSecondary }]}>
                  {section.title}
                </Text>
                <Text style={styles.sectionCount}>
                  {section.data.length} {t('video', 'videos', 'فيديو')}
                </Text>
              </View>
            )}
            renderItem={({ item }) => {
              const thumbUrl = item.thumbnail?.startsWith('http') ? item.thumbnail : getMediaUrl(item.thumbnail);
              return (
                <TouchableOpacity
                  style={styles.listCard}
                  onPress={() => navigation.navigate('VideoPlayer', { video: item })}
                  activeOpacity={0.8}
                >
                  <View style={styles.listThumbWrap}>
                    <ThumbImage uri={thumbUrl} title={item.title} style={styles.listThumb} />
                    <View style={styles.listOverlay}>
                      <View style={styles.listPlayIcon}>
                        <Play size={18} color={COLORS.surface} fill={COLORS.surface} />
                      </View>
                    </View>
                  </View>
                  <View style={styles.listInfo}>
                    <Text style={styles.listTitle} numberOfLines={2}>{item.title}</Text>
                    {item.author ? (
                      <View style={styles.listAuthorRow}>
                        <User size={11} color={COLORS.textTertiary} />
                        <Text style={styles.listAuthor} numberOfLines={1}>{item.author}</Text>
                      </View>
                    ) : null}
                  </View>
                </TouchableOpacity>
              );
            }}
            contentContainerStyle={styles.listContent}
            stickySectionHeadersEnabled={false}
          />
        </SafeAreaView>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={require('../../assets/ten.jpg')} style={styles.bgImage} resizeMode="cover">
      <View style={styles.bgOverlay} />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconWrap}>
                <Film size={20} color={COLORS.surface} />
              </View>
              <View>
                <Text style={styles.headerTitle}>
                  {t('Amashusho', 'Videos', 'الفيديو')}
                </Text>
                <Text style={styles.headerSub}>
                  {filtered.length} {t('amashusho', 'videos', 'فيديو')}
                </Text>
              </View>
            </View>
            <View style={styles.headerBadge}>
              <PlayCircle size={20} color={COLORS.primary} />
            </View>
          </View>
        </View>

        <View style={styles.searchWrap}>
          <View style={styles.searchBar}>
            <Search size={18} color={COLORS.textTertiary} />
            <TextInput
              style={styles.search}
              placeholder={t('Shakisha amashusho...', 'Search videos...', 'ابحث عن فيديو...')}
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

        <ScrollView
          contentContainerStyle={styles.grid}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refreshData} tintColor={COLORS.secondary} colors={[COLORS.secondary]} />
          }
        >
          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <Film size={48} color={COLORS.textTertiary} />
              </View>
              <Text style={styles.emptyText}>
                {t('Nta mashusho abonetse', 'No videos found', 'لم يتم العثور على فيديو')}
              </Text>
            </View>
          ) : filtered.map((video) => {
            const thumbUrl = video.thumbnail?.startsWith('http') ? video.thumbnail : getMediaUrl(video.thumbnail);
            return (
              <TouchableOpacity
                key={video.id}
                style={[styles.card, { width: CARD_WIDTH }]}
                onPress={() => navigation.navigate('VideoPlayer', { video })}
                activeOpacity={0.85}
              >
                <View style={styles.thumbnailWrap}>
                  <ThumbImage uri={thumbUrl} title={video.title} style={styles.thumbnail} />
                  <View style={styles.overlay}>
                    <View style={styles.playIconWrap}>
                      <Play size={28} color={COLORS.surface} fill={COLORS.surface} />
                    </View>
                  </View>
                </View>
                <View style={styles.info}>
                  <Text style={styles.title} numberOfLines={2}>{video.title}</Text>
                  {video.author ? (
                    <View style={styles.authorRow}>
                      <User size={10} color={COLORS.textTertiary} />
                      <Text style={styles.authorText} numberOfLines={1}>{video.author}</Text>
                    </View>
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })}
          <View style={{ height: 20 }} />
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  bgImage: { flex: 1 },
  header: { padding: 20, paddingBottom: 6 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerIconWrap: {
    width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#FFFFFF' },
  headerSub: { fontSize: 12, marginTop: 2, color: 'rgba(255,255,255,0.7)' },
  headerBadge: {
    width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  searchWrap: { paddingHorizontal: 20, marginBottom: 10 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 14, gap: 8,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  search: { flex: 1, fontSize: 14, paddingVertical: 10, color: '#FFFFFF' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, padding: 20, paddingTop: 8 },
  card: {
    borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  thumbnailWrap: { position: 'relative' },
  thumbnail: { width: '100%', height: CARD_WIDTH * 0.6 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  bgOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(6, 48, 44, 0.6)' },
  playIconWrap: {
    width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(15,118,110,0.75)',
  },
  info: { padding: 10 },
  title: { fontSize: 13, fontWeight: '600', lineHeight: 18, color: '#FFFFFF' },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  authorText: { fontSize: 11, color: 'rgba(255,255,255,0.5)' },
  emptyState: { width: '100%', alignItems: 'center', marginTop: 60, gap: 16 },
  emptyIconWrap: {
    width: 90, height: 90, borderRadius: 45, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.06)',
  },
  emptyText: { fontSize: 14, color: 'rgba(255,255,255,0.6)' },
  thumbFallback: {
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(15,118,110,0.3)', gap: 6,
  },
  thumbFallbackText: { color: '#FFFFFF', fontSize: 11, textAlign: 'center', paddingHorizontal: 6 },
  listContent: { padding: 20, paddingTop: 8, paddingBottom: 40 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 12, marginBottom: 8, gap: 8, backgroundColor: 'rgba(255,255,255,0.08)',
  },
  authorIcon: {
    width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  sectionTitle: { flex: 1, fontSize: 15, fontWeight: '700' },
  sectionCount: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  listCard: {
    flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', marginBottom: 8, gap: 12,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  listThumbWrap: { position: 'relative', width: 100, height: 68, borderRadius: 10, overflow: 'hidden' },
  listThumb: { width: '100%', height: '100%' },
  listOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  listPlayIcon: {
    width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(15,118,110,0.75)',
  },
  listInfo: { flex: 1 },
  listTitle: { fontSize: 14, fontWeight: '600', lineHeight: 20, color: '#FFFFFF' },
  listAuthorRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  listAuthor: { fontSize: 11, color: 'rgba(255,255,255,0.5)' },
});
