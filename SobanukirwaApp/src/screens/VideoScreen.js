import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, TextInput, RefreshControl, Dimensions } from 'react-native';
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
    ? videos.filter(v => (v.title || '').toLowerCase().includes(search.toLowerCase()))
    : videos;

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
        <TextInput
          style={[styles.search, { backgroundColor: COLORS.surface, borderColor: COLORS.border, color: COLORS.text }]}
          placeholder={t('Shakisha amashusho...', 'Search videos...', 'ابحث عن فيديو...')}
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
        />
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
  search: { padding: 12, borderRadius: 14, borderWidth: 2, fontSize: 14 },
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
  emptyState: { width: '100%', alignItems: 'center', marginTop: 60, gap: 16 },
  emptyText: { fontSize: 14 },
  thumbFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)', gap: 6 },
  thumbFallbackText: { color: 'rgba(255,255,255,0.4)', fontSize: 11, textAlign: 'center', paddingHorizontal: 6 },
});
