import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Linking, Platform, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { useToastContext } from '../../components/Toast';
import { fetchHealth, fetchDashboard } from '../../services/api';
import AdminLayout from '../../components/admin/AdminLayout';

const API_BASE = 'https://sobanukirwa-production.up.railway.app/api';

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
      if (data?.status === 'ok' || data?.status === 'healthy') toast.show('API is healthy', 'success');
      else toast.show('API responded but status is unexpected', 'info');
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
    <AdminLayout navigation={navigation} title="Settings" subtitle="System configuration">
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* API Health */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionDot} />
            <Text style={styles.sectionTitle}>API Health</Text>
          </View>
          <View style={styles.row}>
            <StatusDot ok={health?.status === 'ok' || health?.status === 'healthy'} />
            <Text style={styles.rowLabel}>Status: {health?.status || 'Unknown'}</Text>
          </View>
          {health?.message ? <Text style={styles.rowSub}>{health.message}</Text> : null}
          {health?.timestamp ? <Text style={styles.rowSub}>Last check: {new Date(health.timestamp).toLocaleTimeString()}</Text> : null}
          <TouchableOpacity style={styles.btn} onPress={checkHealth} disabled={healthLoading}>
            <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.btnGradient}>
              {healthLoading ? <ActivityIndicator color="#0a1220" size="small" /> : <Text style={styles.btnText}>Check Health</Text>}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* API URL */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View style={[styles.sectionDot, { backgroundColor: '#14B8A6' }]} />
            <Text style={styles.sectionTitle}>API URL</Text>
          </View>
          <View style={styles.urlBox}>
            <Text style={styles.urlText} selectable>{API_BASE}</Text>
          </View>
        </View>

        {/* System Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View style={[styles.sectionDot, { backgroundColor: '#5EEAD4' }]} />
            <Text style={styles.sectionTitle}>System Info</Text>
          </View>
          <View style={styles.row}>
            <Ionicons name="phone-portrait" size={18} color="#14B8A6" />
            <Text style={styles.rowLabel}>Platform: {Platform.OS}</Text>
          </View>
          <View style={styles.row}>
            <Ionicons name="information-circle" size={18} color="#14B8A6" />
            <Text style={styles.rowLabel}>App Version: 1.0.0</Text>
          </View>
          <View style={styles.row}>
            <Ionicons name="code-working" size={18} color="#14B8A6" />
            <Text style={styles.rowLabel}>Build: Production</Text>
          </View>
        </View>

        {/* Quick Stats */}
        {stats && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <View style={[styles.sectionDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.sectionTitle}>Quick Stats</Text>
            </View>
            <View style={styles.statsGrid}>
              {[
                { label: 'Artists', value: stats.artists, icon: 'people', color: '#3498db' },
                { label: 'Tracks', value: stats.tracks, icon: 'musical-notes', color: '#27ae60' },
                { label: 'Videos', value: stats.videos, icon: 'videocam', color: '#e74c3c' },
                { label: 'Books', value: stats.books, icon: 'book', color: '#f39c12' },
                { label: 'Categories', value: stats.categories, icon: 'grid', color: '#9b59b6' },
                { label: 'Plays', value: stats.plays, icon: 'play-circle', color: '#F59E0B' },
              ].map((item, i) => (
                <View key={i} style={styles.statItem}>
                  <View style={[styles.statIconWrap, { backgroundColor: item.color + '15' }]}>
                    <Ionicons name={item.icon} size={16} color={item.color} />
                  </View>
                  <Text style={[styles.statValue, { color: item.color }]}>{item.value ?? 0}</Text>
                  <Text style={styles.statLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View style={[styles.sectionDot, { backgroundColor: '#14B8A6' }]} />
            <Text style={styles.sectionTitle}>Actions</Text>
          </View>
          <TouchableOpacity style={styles.actionBtn} onPress={openWebAdmin}>
            <Ionicons name="globe-outline" size={20} color="#F59E0B" />
            <Text style={styles.actionText}>Open Web Admin</Text>
            <Ionicons name="open-outline" size={16} color="rgba(255,255,255,0.3)" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </AdminLayout>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 12, paddingBottom: 32 },
  section: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 14, borderColor: 'rgba(201,168,76,0.1)', backgroundColor: 'rgba(20,35,55,0.5)' },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  sectionDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#F59E0B' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  rowLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  rowSub: { fontSize: 12, marginTop: 4, color: 'rgba(255,255,255,0.4)' },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  btn: { borderRadius: 12, overflow: 'hidden', marginTop: 10 },
  btnGradient: { paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#0a1220', fontSize: 14, fontWeight: '700' },
  urlBox: { borderWidth: 1, borderRadius: 12, padding: 14, borderColor: 'rgba(201,168,76,0.1)', backgroundColor: 'rgba(0,0,0,0.3)' },
  urlText: { fontSize: 13, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: 'rgba(255,255,255,0.5)' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statItem: { width: '30%', alignItems: 'center', paddingVertical: 12, borderWidth: 1, borderRadius: 12, gap: 5, borderColor: 'rgba(201,168,76,0.08)', backgroundColor: 'rgba(0,0,0,0.2)' },
  statIconWrap: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 18, fontWeight: '700' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.4)' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 14, padding: 16, gap: 12, borderColor: 'rgba(201,168,76,0.12)', backgroundColor: 'rgba(0,0,0,0.2)' },
  actionText: { flex: 1, fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
});
