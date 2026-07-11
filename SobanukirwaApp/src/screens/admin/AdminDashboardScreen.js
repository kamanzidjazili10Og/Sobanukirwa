import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  TouchableOpacity, SafeAreaView, ActivityIndicator, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { useToastContext } from '../../components/Toast';
import { fetchDashboard, getMediaUrl } from '../../services/api';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const STAT_CONFIG = [
  { key: 'artists', icon: 'people', label: 'Artists', color: '#3498db' },
  { key: 'tracks', icon: 'musical-notes', label: 'Tracks', color: '#27ae60' },
  { key: 'videos', icon: 'videocam', label: 'Videos', color: '#e74c3c' },
  { key: 'books', icon: 'book', label: 'Books', color: '#f39c12' },
  { key: 'categories', icon: 'grid', label: 'Categories', color: '#9b59b6' },
  { key: 'plays', icon: 'play-circle', label: 'Total Plays', color: '#c9a84c' },
];

const NAV_ITEMS = [
  { screen: 'AdminArtists', icon: 'people' },
  { screen: 'AdminTracks', icon: 'musical-notes' },
  { screen: 'AdminVideos', icon: 'videocam' },
  { screen: 'AdminBooks', icon: 'book' },
  { screen: 'AdminCategories', icon: 'grid' },
  { screen: 'AdminAdhkar', icon: 'text' },
  { screen: 'AdminQuran', icon: 'book-outline' },
  { screen: 'AdminSettings', icon: 'settings' },
];

export default function AdminDashboardScreen({ navigation }) {
  const { COLORS, t } = useApp();
  const toast = useToastContext();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = useCallback(async () => {
    try {
      const data = await fetchDashboard();
      setDashboard(data);
    } catch {
      toast.show('Failed to load dashboard', 'error');
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { loadDashboard(); }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  const stats = dashboard?.stats || {};
  const recentTracks = dashboard?.recentTracks || [];
  const topTracks = dashboard?.topTracks || [];

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
        <ActivityIndicator size="large" color={COLORS.secondary} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.secondary} />}
      >
        <Text style={[styles.title, { color: COLORS.textGold }]}>Admin Dashboard</Text>

        <View style={styles.statsGrid}>
          {STAT_CONFIG.map((stat) => (
            <TouchableOpacity
              key={stat.key}
              style={[styles.statCard, { backgroundColor: 'rgba(20,35,55,0.7)', borderColor: 'rgba(201,168,76,0.2)' }]}
              onPress={() => {
                const nav = NAV_ITEMS.find(n => n.screen.toLowerCase().includes(stat.key));
                if (nav) navigation.navigate(nav.screen);
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.statIconWrap, { backgroundColor: stat.color + '22' }]}>
                <Ionicons name={stat.icon} size={22} color={stat.color} />
              </View>
              <Text style={[styles.statValue, { color: COLORS.text }]}>{stats[stat.key] ?? 0}</Text>
              <Text style={[styles.statLabel, { color: COLORS.textMuted }]}>{stat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {recentTracks.length > 0 && (
          <View style={[styles.section, { borderColor: 'rgba(201,168,76,0.2)' }]}>
            <Text style={[styles.sectionTitle, { color: COLORS.textGold }]}>Recent Tracks</Text>
            {recentTracks.slice(0, 5).map((track, i) => (
              <View key={track.id || i} style={[styles.listItem, { borderBottomColor: 'rgba(201,168,76,0.1)' }]}>
                <Ionicons name="musical-note" size={16} color={COLORS.secondary} />
                <View style={styles.listItemText}>
                  <Text style={[styles.listItemTitle, { color: COLORS.text }]} numberOfLines={1}>{track.title}</Text>
                  <Text style={[styles.listItemSub, { color: COLORS.textMuted }]}>{track.artist_name || 'Unknown'}</Text>
                </View>
                <Text style={[styles.listItemBadge, { color: COLORS.textMuted }]}>{track.plays_count ?? 0} plays</Text>
              </View>
            ))}
          </View>
        )}

        {topTracks.length > 0 && (
          <View style={[styles.section, { borderColor: 'rgba(201,168,76,0.2)' }]}>
            <Text style={[styles.sectionTitle, { color: COLORS.textGold }]}>Top Tracks</Text>
            {topTracks.slice(0, 5).map((track, i) => (
              <View key={track.id || i} style={[styles.listItem, { borderBottomColor: 'rgba(201,168,76,0.1)' }]}>
                <Text style={[styles.rank, { color: COLORS.secondary }]}>{i + 1}</Text>
                <View style={styles.listItemText}>
                  <Text style={[styles.listItemTitle, { color: COLORS.text }]} numberOfLines={1}>{track.title}</Text>
                  <Text style={[styles.listItemSub, { color: COLORS.textMuted }]}>{track.artist_name || 'Unknown'}</Text>
                </View>
                <Ionicons name="play" size={14} color={COLORS.secondary} />
                <Text style={[styles.listItemBadge, { color: COLORS.textGold }]}>{track.plays_count ?? 0}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={[styles.section, { borderColor: 'rgba(201,168,76,0.2)' }]}>
          <Text style={[styles.sectionTitle, { color: COLORS.textGold }]}>Quick Actions</Text>
          <View style={styles.quickGrid}>
            {NAV_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.screen}
                style={[styles.quickCard, { backgroundColor: 'rgba(20,35,55,0.7)', borderColor: 'rgba(201,168,76,0.2)' }]}
                onPress={() => navigation.navigate(item.screen)}
              >
                <Ionicons name={item.icon} size={24} color={COLORS.secondary} />
                <Text style={[styles.quickLabel, { color: COLORS.text }]}>{item.screen.replace('Admin', '')}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  statCard: {
    width: CARD_WIDTH, padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 12,
    alignItems: 'center',
  },
  statIconWrap: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statValue: { fontSize: 22, fontWeight: '700' },
  statLabel: { fontSize: 12, marginTop: 2 },
  section: { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  listItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, gap: 10 },
  listItemText: { flex: 1 },
  listItemTitle: { fontSize: 14, fontWeight: '600' },
  listItemSub: { fontSize: 12, marginTop: 2 },
  listItemBadge: { fontSize: 12, fontWeight: '600' },
  rank: { fontSize: 16, fontWeight: '700', width: 24, textAlign: 'center' },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  quickCard: {
    width: '48%', padding: 16, borderRadius: 12, borderWidth: 1,
    alignItems: 'center', marginBottom: 10, gap: 6,
  },
  quickLabel: { fontSize: 12, fontWeight: '600' },
});
