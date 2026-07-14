import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, TextInput, RefreshControl, Dimensions, SectionList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { getMediaUrl } from '../services/api';
import ScreenBackground from '../components/ScreenBackground';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 52) / 2;

function ThumbImage({ uri, title, style }) {
  const [failed, setFailed] = useState(false);
  if (failed || !uri) {
    return (
      <View style={[style, styles.thumbFallback]}>
        <Ionicons name="videocam" size={32} color="rgba(212,175,55,0.5)" />
        <Text style={styles.thumbFallbackText} numberOfLines={2}>{title || ''}</Text>
      </View>
    );
  }
  return <Image source={{ uri }} style={style} resizeMode="cover" onError={() => setFailed(true)} />;
}

export default function VideoScreen({ navigation }) {
  const { videos, t, COLORS, refreshing, refreshData } = useApp();
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
      <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
        <ScreenBackground imageKey="bg-videos">
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: COLORS.secondary }]}>
              {t('Amashusho', 'Videos', 'الفيديو')}
            </Text>
            <Text style={[styles.headerSub, { color: COLORS.textMuted }]}>
              {filtered.length} {t('amashusho', 'videos', 'فيديو')}
            </Text>
          </View>

          <View style={styles.searchWrap}>
            <View style={[styles.searchBar, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
              <Ionicons name="search" size={18} color={COLORS.textMuted} />
              <TextInput
                style={[styles.search, { color: COLORS.text }]}
                placeholder={t('Shakisha amashusho...', 'Search videos...', 'ابحث عن فيديو...')}
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

          <SectionList
            sections={sections}
            keyExtractor={item => String(item.id)}
            renderSectionHeader={({ section }) => (
              <View style={[styles.sectionHeader, { backgroundColor: COLORS.primaryDark }]}>
                {section.isAuthor && (
                  <View style={[styles.authorIcon, { backgroundColor: 'rgba(212,175,55,0.12)' }]}>
                    <Ionicons name="person" size={14} color={COLORS.secondary} />
                  </View>
                )}
                <Text style={[styles.sectionTitle, { color: section.isAuthor ? COLORS.secondary : COLORS.textMuted }]}>
                  {section.title}
                </Text>
                <Text style={[styles.sectionCount, { color: COLORS.textMuted }]}>
                  {section.data.length} {t('video', 'videos', 'فيديو')}
                </Text>
              </View>
            )}
            renderItem={({ item }) => {
              const thumbUrl = item.thumbnail?.startsWith('http') ? item.thumbnail : getMediaUrl(item.thumbnail);
              return (
                <TouchableOpacity
                  style={[styles.listCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}
                  onPress={() => navigation.navigate('VideoPlayer', { video: item })}
                  activeOpacity={0.8}
                >
                  <View style={styles.listThumbWrap}>
                    <ThumbImage uri={thumbUrl} title={item.title} style={styles.listThumb} />
                    <View style={styles.listOverlay}>
                      <View style={[styles.listPlayIcon, { backgroundColor: 'rgba(212,175,55,0.3)' }]}>
                        <Ionicons name="play" size={24} color={COLORS.secondary} />
                      </View>
                    </View>
                    {item.duration ? (
                      <View style={styles.durationBadge}>
                        <Text style={styles.durationText}>{item.duration}</Text>
                      </View>
                    ) : null}
                  </View>
                  <View style={styles.listInfo}>
                    <Text style={[styles.listTitle, { color: COLORS.text }]} numberOfLines={2}>{item.title}</Text>
                    {item.author ? (
                      <View style={styles.listAuthorRow}>
                        <Ionicons name="person-outline" size={11} color={COLORS.textMuted} />
                        <Text style={[styles.listAuthor, { color: COLORS.textMuted }]} numberOfLines={1}>{item.author}</Text>
                      </View>
                    ) : null}
                  </View>
                </TouchableOpacity>
              );
            }}
            contentContainerStyle={styles.listContent}
            stickySectionHeadersEnabled={false}
          />
        </ScreenBackground>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      <ScreenBackground imageKey="bg-videos">
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: COLORS.secondary }]}>
            {t('Amashusho', 'Videos', 'الفيديو')}
          </Text>
          <Text style={[styles.headerSub, { color: COLORS.textMuted }]}>
            {filtered.length} {t('amashusho', 'videos', 'فيديو')}
          </Text>
        </View>

        <View style={styles.searchWrap}>
          <View style={[styles.searchBar, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
            <Ionicons name="search" size={18} color={COLORS.textMuted} />
            <TextInput
              style={[styles.search, { color: COLORS.text }]}
              placeholder={t('Shakisha amashusho...', 'Search videos...', 'ابحث عن فيديو...')}
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
          contentContainerStyle={styles.grid}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refreshData} tintColor={COLORS.secondary} colors={[COLORS.secondary]} />
          }
        >
          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="videocam" size={56} color={COLORS.secondary} />
              <Text style={[styles.emptyText, { color: COLORS.textMuted }]}>
                {t('Nta mashusho abonetse', 'No videos found', 'لم يتم العثور على فيديو')}
              </Text>
            </View>
          ) : filtered.map((video) => {
            const thumbUrl = video.thumbnail?.startsWith('http') ? video.thumbnail : getMediaUrl(video.thumbnail);
            return (
              <TouchableOpacity
                key={video.id}
                style={[styles.card, { backgroundColor: COLORS.surface, borderColor: COLORS.border, width: CARD_WIDTH }]}
                onPress={() => navigation.navigate('VideoPlayer', { video })}
                activeOpacity={0.85}
              >
                <View style={styles.thumbnailWrap}>
                  <ThumbImage uri={thumbUrl} title={video.title} style={styles.thumbnail} />
                  <View style={styles.overlay}>
                    <View style={[styles.playIconWrap, { backgroundColor: 'rgba(212,175,55,0.25)' }]}>
                      <Ionicons name="play" size={32} color={COLORS.secondary} />
                    </View>
                  </View>
                  {video.duration ? (
                    <View style={styles.durationBadge}>
                      <Text style={styles.durationText}>{video.duration}</Text>
                    </View>
                  ) : null}
                </View>
                <View style={styles.info}>
                  <Text style={[styles.title, { color: COLORS.text }]} numberOfLines={2}>{video.title}</Text>
                  {video.author ? (
                    <View style={styles.authorRow}>
                      <Ionicons name="person-outline" size={10} color={COLORS.textMuted} />
                      <Text style={[styles.authorText, { color: COLORS.textMuted }]} numberOfLines={1}>{video.author}</Text>
                    </View>
                  ) : null}
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
  header: { padding: 20, paddingBottom: 6 },
  headerTitle: { fontSize: 24, fontWeight: '700' },
  headerSub: { fontSize: 13, marginTop: 4 },
  searchWrap: { paddingHorizontal: 20, marginBottom: 10 },
  searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 2, paddingHorizontal: 14, gap: 8 },
  search: { flex: 1, fontSize: 14, paddingVertical: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, padding: 20, paddingTop: 8, paddingBottom: 40, justifyContent: 'space-between' },
  card: { borderRadius: 16, borderWidth: 1.5, overflow: 'hidden' },
  thumbnailWrap: { position: 'relative' },
  thumbnail: { width: '100%', height: CARD_WIDTH * 0.6 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  playIconWrap: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  durationBadge: { position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.75)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  durationText: { color: '#fff', fontSize: 11, fontWeight: '600', fontVariant: ['tabular-nums'] },
  info: { padding: 10 },
  title: { fontSize: 13, fontWeight: '600', lineHeight: 18 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  authorText: { fontSize: 11 },
  emptyState: { width: '100%', alignItems: 'center', marginTop: 60, gap: 16 },
  emptyText: { fontSize: 14 },
  thumbFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)', gap: 6 },
  thumbFallbackText: { color: 'rgba(255,255,255,0.4)', fontSize: 11, textAlign: 'center', paddingHorizontal: 6 },
  listContent: { padding: 20, paddingTop: 8, paddingBottom: 40 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, marginBottom: 8, gap: 8 },
  authorIcon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { flex: 1, fontSize: 15, fontWeight: '700' },
  sectionCount: { fontSize: 12 },
  listCard: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 14, borderWidth: 1, marginBottom: 8, gap: 12 },
  listThumbWrap: { position: 'relative', width: 100, height: 68, borderRadius: 10, overflow: 'hidden' },
  listThumb: { width: '100%', height: '100%' },
  listOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  listPlayIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  listInfo: { flex: 1 },
  listTitle: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  listAuthorRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  listAuthor: { fontSize: 11 },
});
