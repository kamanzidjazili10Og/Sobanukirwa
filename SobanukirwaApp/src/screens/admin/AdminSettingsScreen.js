import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView,
  ActivityIndicator, Linking, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { useToastContext } from '../../components/Toast';
import { fetchHealth, fetchDashboard } from '../../services/api';

const API_BASE = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

export default function AdminSettingsScreen({ navigation }) {
  const { COLORS } = useApp();
  const toast = useToastContext();
  const [health, setHealth] = useState(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [stats, setStats] = useState(null);

  const checkHealth = useCallback(async () => {
    setHealthLoading(true);
    try {
      const data = await fetchHealth();
      setHealth(data);
      if (data?.status === 'ok' || data?.status === 'healthy') {
        toast.show('API is healthy', 'success');
      } else {
        toast.show('API responded but status is unexpected', 'info');
      }
    } catch {
      setHealth({ status: 'error', message: 'Connection failed' });
      toast.show('API is unreachable', 'error');
    }
    setHealthLoading(false);
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const data = await fetchDashboard();
      if (data?.stats) setStats(data.stats);
    } catch {}
  }, []);

  useEffect(() => { checkHealth(); loadStats(); }, []);

  const openWebAdmin = () => {
    const webUrl = API_BASE.replace('/api', '');
    Linking.openURL(webUrl).catch(() => toast.show('Cannot open browser', 'error'));
  };

  const StatusDot = ({ ok }) => (
    <View style={[styles.statusDot, { backgroundColor: ok ? '#27ae60' : '#e74c3c' }]} />
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.navigate('AdminDashboard')} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textGold} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: COLORS.textGold }]}>Settings</Text>
        <View style={{ width: 36 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: COLORS.textGold }]}>Settings</Text>

        <View style={[styles.section, { backgroundColor: 'rgba(20,35,55,0.7)', borderColor: 'rgba(201,168,76,0.2)' }]}>
          <Text style={[styles.sectionTitle, { color: COLORS.textGold }]}>API Health</Text>
          <View style={styles.row}>
            <StatusDot ok={health?.status === 'ok' || health?.status === 'healthy'} />
            <Text style={[styles.rowLabel, { color: COLORS.text }]}>Status: {health?.status || 'Unknown'}</Text>
          </View>
          {health?.message ? (
            <Text style={[styles.rowSub, { color: COLORS.textMuted }]}>{health.message}</Text>
          ) : null}
          {health?.timestamp ? (
            <Text style={[styles.rowSub, { color: COLORS.textMuted }]}>Last check: {new Date(health.timestamp).toLocaleTimeString()}</Text>
          ) : null}
          <TouchableOpacity style={[styles.btn, { backgroundColor: COLORS.secondary }]} onPress={checkHealth} disabled={healthLoading}>
            {healthLoading ? <ActivityIndicator color="#0a1220" size="small" /> : <Text style={styles.btnText}>Check Health</Text>}
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { backgroundColor: 'rgba(20,35,55,0.7)', borderColor: 'rgba(201,168,76,0.2)' }]}>
          <Text style={[styles.sectionTitle, { color: COLORS.textGold }]}>API URL</Text>
          <View style={[styles.urlBox, { backgroundColor: 'rgba(10,18,32,0.8)', borderColor: 'rgba(201,168,76,0.15)' }]}>
            <Text style={[styles.urlText, { color: COLORS.textMuted }]} selectable>{API_BASE}</Text>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: 'rgba(20,35,55,0.7)', borderColor: 'rgba(201,168,76,0.2)' }]}>
          <Text style={[styles.sectionTitle, { color: COLORS.textGold }]}>System Info</Text>
          <View style={styles.row}>
            <Ionicons name="phone-portrait" size={18} color={COLORS.secondary} />
            <Text style={[styles.rowLabel, { color: COLORS.text }]}>Platform: {Platform.OS}</Text>
          </View>
          <View style={styles.row}>
            <Ionicons name="information-circle" size={18} color={COLORS.secondary} />
            <Text style={[styles.rowLabel, { color: COLORS.text }]}>App Version: 1.0.0</Text>
          </View>
          <View style={styles.row}>
            <Ionicons name="code-working" size={18} color={COLORS.secondary} />
            <Text style={[styles.rowLabel, { color: COLORS.text }]}>Build: Production</Text>
          </View>
        </View>

        {stats && (
          <View style={[styles.section, { backgroundColor: 'rgba(20,35,55,0.7)', borderColor: 'rgba(201,168,76,0.2)' }]}>
            <Text style={[styles.sectionTitle, { color: COLORS.textGold }]}>Quick Stats</Text>
            <View style={styles.statsGrid}>
              {[
                { label: 'Artists', value: stats.artists, icon: 'people' },
                { label: 'Tracks', value: stats.tracks, icon: 'musical-notes' },
                { label: 'Videos', value: stats.videos, icon: 'videocam' },
                { label: 'Books', value: stats.books, icon: 'book' },
                { label: 'Categories', value: stats.categories, icon: 'grid' },
                { label: 'Plays', value: stats.plays, icon: 'play-circle' },
              ].map((item, i) => (
                <View key={i} style={[styles.statItem, { borderColor: 'rgba(201,168,76,0.1)' }]}>
                  <Ionicons name={item.icon} size={16} color={COLORS.secondary} />
                  <Text style={[styles.statValue, { color: COLORS.text }]}>{item.value ?? 0}</Text>
                  <Text style={[styles.statLabel, { color: COLORS.textMuted }]}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={[styles.section, { backgroundColor: 'rgba(20,35,55,0.7)', borderColor: 'rgba(201,168,76,0.2)' }]}>
          <Text style={[styles.sectionTitle, { color: COLORS.textGold }]}>Actions</Text>
          <TouchableOpacity style={[styles.actionBtn, { borderColor: 'rgba(201,168,76,0.2)' }]} onPress={openWebAdmin}>
            <Ionicons name="globe-outline" size={20} color={COLORS.secondary} />
            <Text style={[styles.actionText, { color: COLORS.text }]}>Open Web Admin</Text>
            <Ionicons name="open-outline" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(201,168,76,0.3)', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(201,168,76,0.08)' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  scrollContent: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  section: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  rowLabel: { fontSize: 14 },
  rowSub: { fontSize: 12, marginTop: 4 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  btn: { paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 12 },
  btnText: { color: '#0a1220', fontSize: 14, fontWeight: '700' },
  urlBox: { borderWidth: 1, borderRadius: 10, padding: 12 },
  urlText: { fontSize: 13, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statItem: { width: '30%', alignItems: 'center', paddingVertical: 10, borderWidth: 1, borderRadius: 10, gap: 4 },
  statValue: { fontSize: 16, fontWeight: '700' },
  statLabel: { fontSize: 11 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, padding: 14, gap: 12 },
  actionText: { flex: 1, fontSize: 15, fontWeight: '600' },
});
