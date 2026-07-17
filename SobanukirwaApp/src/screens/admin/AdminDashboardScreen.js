import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  TouchableOpacity, ActivityIndicator, Dimensions, ImageBackground, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { useToastContext } from '../../components/Toast';
import { fetchDashboard } from '../../services/api';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const STAT_CONFIG = [
  { key: 'artists', icon: 'people', label: 'Artists', color: '#3498db', gradient: ['#3498db', '#2980b9'] },
  { key: 'tracks', icon: 'musical-notes', label: 'Tracks', color: '#27ae60', gradient: ['#27ae60', '#229954'] },
  { key: 'videos', icon: 'videocam', label: 'Videos', color: '#e74c3c', gradient: ['#e74c3c', '#c0392b'] },
  { key: 'books', icon: 'book', label: 'Books', color: '#f39c12', gradient: ['#f39c12', '#d68910'] },
  { key: 'categories', icon: 'grid', label: 'Categories', color: '#9b59b6', gradient: ['#9b59b6', '#8e44ad'] },
  { key: 'plays', icon: 'play-circle', label: 'Total Plays', color: '#F59E0B', gradient: ['#F59E0B', '#D97706'] },
];

const NAV_ITEMS = [
  { screen: 'AdminArtists', icon: 'people', label: 'Artists' },
  { screen: 'AdminTracks', icon: 'musical-notes', label: 'Tracks' },
  { screen: 'AdminVideos', icon: 'videocam', label: 'Videos' },
  { screen: 'AdminBooks', icon: 'book', label: 'Books' },
  { screen: 'AdminCategories', icon: 'grid', label: 'Categories' },
  { screen: 'AdminAdhkar', icon: 'text', label: 'Adhkar' },
  { screen: 'AdminQuran', icon: 'book-outline', label: 'Quran' },
  { screen: 'AdminSettings', icon: 'settings', label: 'Settings' },
];

function StatCard({ stat, stats, onPress, delay }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <TouchableOpacity style={styles.statCard} onPress={onPress} activeOpacity={0.7}>
        <View style={[styles.statIconWrap, { backgroundColor: stat.color + '18' }]}>
          <Ionicons name={stat.icon} size={22} color={stat.color} />
        </View>
        <Text style={[styles.statValue, { color: stat.color }]}>{stats[stat.key] ?? 0}</Text>
        <Text style={styles.statLabel}>{stat.label}</Text>
        <View style={[styles.statAccent, { backgroundColor: stat.color }]} />
      </TouchableOpacity>
    </Animated.View>
  );
}

function QuickAction({ item, onPress, delay }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim, width: '48%' }}>
      <TouchableOpacity style={styles.quickCard} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.quickIconWrap}>
          <Ionicons name={item.icon} size={24} color="#F59E0B" />
        </View>
        <Text style={styles.quickLabel}>{item.label}</Text>
        <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.2)" />
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function AdminDashboardScreen({ navigation }) {
  const { COLORS, t } = useApp();
  const toast = useToastContext();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const headerFade = useRef(new Animated.Value(0)).current;

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

  useEffect(() => {
    Animated.timing(headerFade, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    loadDashboard();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  const stats = dashboard?.stats || {};
  const recentTracks = dashboard?.recentTracks || [];
  const topTracks = dashboard?.topTracks || [];

  if (loading) {
    return (
      <ImageBackground source={require('../../../assets/bg-home.jpg')} style={styles.bgImage} resizeMode="cover">
        <LinearGradient colors={['rgba(10,18,32,0.95)', 'rgba(0,0,0,0.85)']} style={styles.overlay} />
        <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
          <ActivityIndicator size="large" color="#F59E0B" style={{ flex: 1 }} />
        </SafeAreaView>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={require('../../../assets/bg-home.jpg')} style={styles.bgImage} resizeMode="cover">
      <LinearGradient colors={['rgba(10,18,32,0.95)', 'rgba(0,0,0,0.85)']} style={styles.overlay} />
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F59E0B" />}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View style={[styles.headerRow, { opacity: headerFade }]}>
            <View>
              <Text style={styles.title}>Admin Dashboard</Text>
              <Text style={styles.headerSub}>Manage your content</Text>
            </View>
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={() => navigation.navigate('AdminLogin')}
            >
              <Ionicons name="log-out" size={18} color="#EF4444" />
            </TouchableOpacity>
          </Animated.View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            {STAT_CONFIG.map((stat, i) => (
              <StatCard
                key={stat.key}
                stat={stat}
                stats={stats}
                delay={i * 60}
                onPress={() => {
                  const nav = NAV_ITEMS.find(n => n.screen.toLowerCase().includes(stat.key));
                  if (nav) navigation.navigate(nav.screen);
                }}
              />
            ))}
          </View>

          {/* Recent Tracks */}
          {recentTracks.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionDot} />
                <Text style={styles.sectionTitle}>Recent Tracks</Text>
              </View>
              {recentTracks.slice(0, 5).map((track, i) => (
                <View key={track.id || i} style={styles.listItem}>
                  <View style={styles.listItemIcon}>
                    <Ionicons name="musical-note" size={16} color="#14B8A6" />
                  </View>
                  <View style={styles.listItemText}>
                    <Text style={styles.listItemTitle} numberOfLines={1}>{track.title}</Text>
                    <Text style={styles.listItemSub}>{track.artist_name || 'Unknown'}</Text>
                  </View>
                  <Text style={styles.listItemBadge}>{track.plays_count ?? 0} plays</Text>
                </View>
              ))}
            </View>
          )}

          {/* Top Tracks */}
          {topTracks.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <View style={[styles.sectionDot, { backgroundColor: '#F59E0B' }]} />
                <Text style={styles.sectionTitle}>Top Tracks</Text>
              </View>
              {topTracks.slice(0, 5).map((track, i) => (
                <View key={track.id || i} style={styles.listItem}>
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>{i + 1}</Text>
                  </View>
                  <View style={styles.listItemText}>
                    <Text style={styles.listItemTitle} numberOfLines={1}>{track.title}</Text>
                    <Text style={styles.listItemSub}>{track.artist_name || 'Unknown'}</Text>
                  </View>
                  <View style={styles.playsWrap}>
                    <Ionicons name="play" size={12} color="#F59E0B" />
                    <Text style={styles.playsText}>{track.plays_count ?? 0}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Quick Actions */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <View style={[styles.sectionDot, { backgroundColor: '#14B8A6' }]} />
              <Text style={styles.sectionTitle}>Quick Actions</Text>
            </View>
            <View style={styles.quickGrid}>
              {NAV_ITEMS.map((item, i) => (
                <QuickAction
                  key={item.screen}
                  item={item}
                  delay={200 + i * 50}
                  onPress={() => navigation.navigate(item.screen)}
                />
              ))}
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerLine} />
            <Text style={styles.footerText}>Sobanukirwa Admin</Text>
            <View style={styles.footerLine} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bgImage: { flex: 1, width: '100%', height: '100%' },
  overlay: { ...StyleSheet.absoluteFillObject },
  container: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  title: { fontSize: 26, fontWeight: '700', color: '#F59E0B' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  logoutBtn: {
    width: 42, height: 42, borderRadius: 21, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.25)',
  },

  /* Stats */
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  statCard: {
    width: CARD_WIDTH, padding: 16, borderRadius: 16, borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.12)', backgroundColor: 'rgba(20,35,55,0.5)',
    alignItems: 'center', marginBottom: 12, overflow: 'hidden', position: 'relative',
  },
  statIconWrap: {
    width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  statValue: { fontSize: 26, fontWeight: '700' },
  statLabel: { fontSize: 12, marginTop: 4, color: 'rgba(255,255,255,0.5)', fontWeight: '500' },
  statAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, borderRadius: 2 },

  /* Sections */
  section: { marginBottom: 20 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  sectionDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#F59E0B' },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },

  /* List Items */
  listItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14,
    borderBottomWidth: 1, borderBottomColor: 'rgba(201,168,76,0.08)', gap: 12,
  },
  listItemIcon: {
    width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(20,184,166,0.12)',
  },
  listItemText: { flex: 1 },
  listItemTitle: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  listItemSub: { fontSize: 12, marginTop: 2, color: 'rgba(255,255,255,0.4)' },
  listItemBadge: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.4)' },
  rankBadge: {
    width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(245,158,11,0.12)',
  },
  rankText: { fontSize: 13, fontWeight: '700', color: '#F59E0B' },
  playsWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  playsText: { fontSize: 13, fontWeight: '700', color: '#F59E0B' },

  /* Quick Actions */
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  quickCard: {
    flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(201,168,76,0.12)', backgroundColor: 'rgba(20,35,55,0.5)',
    marginBottom: 10, gap: 10,
  },
  quickIconWrap: {
    width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(245,158,11,0.1)',
  },
  quickLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: '#FFFFFF' },

  /* Footer */
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16 },
  footerLine: { width: 30, height: 1.5, borderRadius: 1, backgroundColor: 'rgba(201,168,76,0.15)' },
  footerText: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.25)' },
});
