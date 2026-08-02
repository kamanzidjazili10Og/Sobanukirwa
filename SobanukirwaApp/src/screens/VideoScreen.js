import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, ImageBackground, TextInput, RefreshControl, Dimensions, SectionList, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { getMediaUrl } from '../services/api';
import { Film, Play, Search, PlayCircle, User, X, Download, CheckCircle, CloudOff, Wifi, WifiOff } from 'lucide-react-native';

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

function CacheButton({ videoUrl, cachedVideos, videoDownloads, cacheVideo, uncacheVideo, t, isOffline }) {
  const isCached = cachedVideos[videoUrl] || false;
  const dl = videoDownloads[videoUrl];
  const isDownloading = dl?.downloading || false;
  const progress = dl?.progress || 0;

  if (isDownloading) {
    return (
      <View style={styles.cacheProgressWrap}>
        <ActivityIndicator size="small" color="#F59E0B" />
        <Text style={styles.cacheProgressText}>{Math.round(progress * 100)}%</Text>
      </View>
    );
  }

  if (isCached) {
    return (
      <TouchableOpacity
        style={styles.cachedBadge}
        onPress={() => !isOffline && uncacheVideo(videoUrl)}
      >
        <CheckCircle size={12} color="#10B981" />
        <Text style={styles.cachedText}>{t('Birabitswe', 'Cached', 'مخزن')}</Text>
      </TouchableOpacity>
    );
  }

  if (isOffline) return null;

  return (
    <TouchableOpacity
      style={styles.cacheBtn}
      onPress={() => cacheVideo(videoUrl)}
    >
      <Download size={12} color="#F59E0B" />
    </TouchableOpacity>
  );
}

function ThumbImage({ uri, title, style, isCached, isOffline }) {
  const [failed, setFailed] = useState(false);
  if (failed || !uri) {
    return (
      <View style={[style, styles.thumbFallback]}>
        <Film size={32} color={COLORS.surface} />
        <Text style={styles.thumbFallbackText} numberOfLines={2}>{title || ''}</Text>
        {isCached && (
          <View style={styles.cachedOverlay}>
            <CheckCircle size={14} color="#10B981" />
          </View>
        )}
        {isOffline && !isCached && (
          <View style={styles.unavailableOverlay}>
            <WifiOff size={20} color="rgba(255,255,255,0.5)" />
          </View>
        )}
      </View>
    );
  }
  return (
    <View>
      <Image source={{ uri }} style={style} resizeMode="cover" onError={() => setFailed(true)} />
      {isCached && (
        <View style={styles.cachedDotOverlay}>
          <CheckCircle size={14} color="#10B981" />
          <Text style={styles.cachedDotText}>{t ? t('Offline', 'Offline', 'محفوظ') : 'Offline'}</Text>
        </View>
      )}
      {isOffline && !isCached && (
        <View style={styles.unavailableOverlay}>
          <WifiOff size={20} color="rgba(255,255,255,0.5)" />
        </View>
      )}
    </View>
  );
}

export default function VideoScreen({ navigation }) {
  const { videos, t, refreshing, refreshData, cachedVideos, videoDownloads, cacheVideo, uncacheVideo, checkVideoCache, isOffline } = useApp();
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (videos && videos.length > 0) {
      videos.forEach(v => {
        if (v.videoUrl) checkVideoCache(v.videoUrl);
      });
    }
  }, [videos]);

  useFocusEffect(
    useCallback(() => {
      if (!isOffline) refreshData();
    }, [isOffline])
  );

  const displayVideos = useMemo(() => {
    return videos;
  }, [videos]);

  const cachedCount = useMemo(() => {
    return Object.values(cachedVideos).filter(Boolean).length;
  }, [cachedVideos]);

  const filtered = search
    ? displayVideos.filter(v =>
        (v.title || '').toLowerCase().includes(search.toLowerCase()) ||
        (v.author || '').toLowerCase().includes(search.toLowerCase())
      )
    : displayVideos;

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

  function renderHeader() {
    return (
      <>
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
                  {filtered.length} {t('amashusho', 'videos', 'فيديو')}{isOffline ? '' : ''}
                </Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              {isOffline ? (
                <View style={styles.offlineIndicator}>
                  <WifiOff size={12} color="#F59E0B" />
                  <Text style={styles.offlineIndicatorText}>{t('Offline', 'Offline', 'غير متصل')}</Text>
                </View>
              ) : (
                <View style={[styles.offlineIndicator, { backgroundColor: 'rgba(16,185,129,0.15)' }]}>
                  <Wifi size={12} color="#10B981" />
                  <Text style={[styles.offlineIndicatorText, { color: '#10B981' }]}>{t('Online', 'Online', 'متصل')}</Text>
                </View>
              )}
              <View style={styles.headerBadge}>
                <PlayCircle size={20} color={COLORS.primary} />
              </View>
            </View>
          </View>
          {isOffline && (
            <View style={styles.offlineBar}>
              <CloudOff size={14} color="#F59E0B" />
              <Text style={styles.offlineText}>
                {t(
                  `Amashusho ${videos.length} ashyizwe ahagaragara, ${cachedCount} arabitswe`,
                  `${videos.length} videos shown, ${cachedCount} cached for offline`,
                  `عرض ${videos.length} فيديو، ${cachedCount} مخزنة`
                )}
              </Text>
            </View>
          )}
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
      </>
    );
  }

  function renderListItem({ item }) {
    const thumbUrl = item.thumbnail?.startsWith('http') ? item.thumbnail : getMediaUrl(item.thumbnail);
    const isVideoCached = cachedVideos[item.videoUrl] || false;
    const notAvailableOffline = isOffline && !isVideoCached;

    return (
      <TouchableOpacity
        style={[styles.listCard, notAvailableOffline && styles.listCardDisabled]}
        onPress={() => !notAvailableOffline && navigation.navigate('VideoPlayer', { video: item })}
        activeOpacity={0.8}
        disabled={notAvailableOffline}
      >
        <View style={styles.listThumbWrap}>
          <ThumbImage
            uri={isOffline && !isVideoCached ? null : thumbUrl}
            title={item.title}
            style={styles.listThumb}
            isCached={isVideoCached}
            isOffline={isOffline}
          />
          <View style={styles.listOverlay}>
            {!notAvailableOffline && (
              <View style={styles.listPlayIcon}>
                <Play size={18} color={COLORS.surface} fill={COLORS.surface} />
              </View>
            )}
            {notAvailableOffline && (
              <View style={styles.listUnavailableIcon}>
                <WifiOff size={18} color="rgba(255,255,255,0.6)" />
              </View>
            )}
          </View>
        </View>
        <View style={styles.listInfo}>
          <Text style={[styles.listTitle, notAvailableOffline && styles.listTitleDisabled]} numberOfLines={2}>{item.title}</Text>
          {item.author ? (
            <View style={styles.listAuthorRow}>
              <User size={11} color="rgba(255,255,255,0.5)" />
              <Text style={styles.listAuthor} numberOfLines={1}>{item.author}</Text>
            </View>
          ) : null}
          <View style={styles.listBottomRow}>
            {item.durationStr ? (
              <Text style={styles.listDuration}>{item.durationStr}</Text>
            ) : <View />}
            <CacheButton
              videoUrl={item.videoUrl}
              cachedVideos={cachedVideos}
              videoDownloads={videoDownloads}
              cacheVideo={cacheVideo}
              uncacheVideo={uncacheVideo}
              t={t}
              isOffline={isOffline}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  function renderGridItem(video) {
    const thumbUrl = video.thumbnail?.startsWith('http') ? video.thumbnail : getMediaUrl(video.thumbnail);
    const isVideoCached = cachedVideos[video.videoUrl] || false;
    const notAvailableOffline = isOffline && !isVideoCached;

    return (
      <TouchableOpacity
        key={video.id}
        style={[styles.card, { width: CARD_WIDTH }, notAvailableOffline && styles.cardDisabled]}
        onPress={() => !notAvailableOffline && navigation.navigate('VideoPlayer', { video })}
        activeOpacity={0.85}
        disabled={notAvailableOffline}
      >
        <View style={styles.thumbnailWrap}>
          <ThumbImage
            uri={isOffline && !isVideoCached ? null : thumbUrl}
            title={video.title}
            style={styles.thumbnail}
            isCached={isVideoCached}
            isOffline={isOffline}
          />
          <View style={styles.overlay}>
            {!notAvailableOffline && (
              <View style={styles.playIconWrap}>
                <Play size={28} color={COLORS.surface} fill={COLORS.surface} />
              </View>
            )}
            {notAvailableOffline && (
              <View style={styles.unavailableIconWrap}>
                <WifiOff size={28} color="rgba(255,255,255,0.5)" />
              </View>
            )}
          </View>
        </View>
        <View style={styles.info}>
          <Text style={[styles.title, notAvailableOffline && styles.titleDisabled]} numberOfLines={2}>{video.title}</Text>
          {video.author ? (
            <View style={styles.authorRow}>
              <User size={10} color="rgba(255,255,255,0.5)" />
              <Text style={styles.authorText} numberOfLines={1}>{video.author}</Text>
            </View>
          ) : null}
          <View style={styles.gridBottomRow}>
            {video.durationStr ? (
              <Text style={styles.authorText}>{video.durationStr}</Text>
            ) : <View />}
            <CacheButton
              videoUrl={video.videoUrl}
              cachedVideos={cachedVideos}
              videoDownloads={videoDownloads}
              cacheVideo={cacheVideo}
              uncacheVideo={uncacheVideo}
              t={t}
              isOffline={isOffline}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  if (hasGrouping) {
    return (
      <ImageBackground source={require('../../assets/ten.jpg')} style={styles.bgImage} resizeMode="cover">
        <View style={styles.bgOverlay} />
        <SafeAreaView style={styles.container}>
          {renderHeader()}
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
            renderItem={renderListItem}
            contentContainerStyle={styles.listContent}
            stickySectionHeadersEnabled={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <View style={styles.emptyIconWrap}>
                  {isOffline ? (
                    <WifiOff size={48} color={COLORS.textTertiary} />
                  ) : (
                    <Film size={48} color={COLORS.textTertiary} />
                  )}
                </View>
                <Text style={styles.emptyText}>
                  {isOffline
                    ? t('Nta video irabonetse', 'No cached videos found', 'لم يتم العثور على فيديوهات مخزنة')
                    : t('Nta mashusho abonetse', 'No videos found', 'لم يتم العثور على فيديو')}
                </Text>
                {isOffline && (
                  <Text style={styles.emptySubText}>
                    {t('Kurura amashusho ubwo ufite interineti kugira ngo ubone kuyareba udafite interineti', 'Download videos when online for offline use', 'قم بتنزيل الفيديوهات عند الاتصال للاستخدام بدون إنترنت')}
                  </Text>
                )}
              </View>
            }
          />
        </SafeAreaView>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={require('../../assets/ten.jpg')} style={styles.bgImage} resizeMode="cover">
      <View style={styles.bgOverlay} />
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <ScrollView
          contentContainerStyle={styles.grid}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refreshData} tintColor={COLORS.secondary} colors={[COLORS.secondary]} />
          }
        >
          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                {isOffline ? (
                  <WifiOff size={48} color={COLORS.textTertiary} />
                ) : (
                  <Film size={48} color={COLORS.textTertiary} />
                )}
              </View>
              <Text style={styles.emptyText}>
                {isOffline
                  ? t('Nta video irabonetse', 'No cached videos found', 'لم يتم العثور على فيديوهات مخزنة')
                  : t('Nta mashusho abonetse', 'No videos found', 'لم يتم العثور على فيديو')}
              </Text>
              {isOffline && (
                <Text style={styles.emptySubText}>
                  {t('Kurura amashusho ubwo uri在线', 'Download videos when online for offline use', 'قم بتنزيل الفيديوهات عند الاتصال للاستخدام بدون إنترنت')}
                </Text>
              )}
            </View>
          ) : filtered.map(renderGridItem)}
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
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
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
  offlineIndicator: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
    backgroundColor: 'rgba(245,158,11,0.15)',
  },
  offlineIndicatorText: { fontSize: 10, fontWeight: '600', color: '#F59E0B' },
  offlineBar: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10,
    backgroundColor: 'rgba(245,158,11,0.12)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.25)',
  },
  offlineText: { fontSize: 11, color: '#F59E0B', fontWeight: '500', flex: 1 },
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
  cardDisabled: { opacity: 0.5 },
  thumbnailWrap: { position: 'relative' },
  thumbnail: { width: '100%', height: CARD_WIDTH * 0.6 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  bgOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(6, 48, 44, 0.6)' },
  playIconWrap: {
    width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(15,118,110,0.75)',
  },
  unavailableIconWrap: {
    width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  info: { padding: 10 },
  title: { fontSize: 13, fontWeight: '600', lineHeight: 18, color: '#FFFFFF' },
  titleDisabled: { color: 'rgba(255,255,255,0.4)' },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  authorText: { fontSize: 11, color: 'rgba(255,255,255,0.5)' },
  emptyState: { width: '100%', alignItems: 'center', marginTop: 60, gap: 12 },
  emptyIconWrap: {
    width: 90, height: 90, borderRadius: 45, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.06)',
  },
  emptyText: { fontSize: 14, color: 'rgba(255,255,255,0.6)', textAlign: 'center' },
  emptySubText: { fontSize: 12, color: 'rgba(255,255,255,0.4)', textAlign: 'center', paddingHorizontal: 20 },
  thumbFallback: {
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(15,118,110,0.3)', gap: 6,
  },
  thumbFallbackText: { color: '#FFFFFF', fontSize: 11, textAlign: 'center', paddingHorizontal: 6 },
  cachedOverlay: {
    position: 'absolute', bottom: 6, right: 6,
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
    backgroundColor: 'rgba(16,185,129,0.9)',
  },
  cachedDotOverlay: {
    position: 'absolute', top: 6, right: 6,
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
    backgroundColor: 'rgba(16,185,129,0.9)',
  },
  cachedDotText: { fontSize: 8, fontWeight: '700', color: '#FFFFFF' },
  unavailableOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
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
  listCardDisabled: { opacity: 0.5 },
  listThumbWrap: { position: 'relative', width: 100, height: 68, borderRadius: 10, overflow: 'hidden' },
  listThumb: { width: '100%', height: '100%' },
  listOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  listPlayIcon: {
    width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(15,118,110,0.75)',
  },
  listUnavailableIcon: {
    width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  listInfo: { flex: 1 },
  listTitle: { fontSize: 14, fontWeight: '600', lineHeight: 20, color: '#FFFFFF' },
  listTitleDisabled: { color: 'rgba(255,255,255,0.4)' },
  listAuthorRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  listAuthor: { fontSize: 11, color: 'rgba(255,255,255,0.5)' },
  listDuration: { fontSize: 11, color: 'rgba(245,158,11,0.7)', fontWeight: '500' },
  listBottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  cacheBtn: {
    width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(245,158,11,0.15)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)',
  },
  cachedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8,
    backgroundColor: 'rgba(16,185,129,0.15)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)',
  },
  cachedText: { fontSize: 9, color: '#10B981', fontWeight: '600' },
  cacheProgressWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8,
    backgroundColor: 'rgba(245,158,11,0.15)',
  },
  cacheProgressText: { fontSize: 9, color: '#F59E0B', fontWeight: '600' },
  gridBottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
});
