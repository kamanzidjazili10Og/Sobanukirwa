import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView,
  ActivityIndicator, TextInput, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useApp } from '../../context/AppContext';
import { useToastContext } from '../../components/Toast';
import { fetchSurahs, uploadSurahAudio } from '../../services/api';

export default function AdminQuranScreen({ navigation }) {
  const { COLORS } = useApp();
  const toast = useToastContext();
  const [surahs, setSurahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(null);

  const loadSurahs = useCallback(async () => {
    try {
      const data = await fetchSurahs();
      setSurahs(Array.isArray(data) ? data : []);
    } catch { toast.show('Failed to load surahs', 'error'); }
    setLoading(false);
  }, []);

  useEffect(() => { loadSurahs(); }, []);

  const filtered = surahs.filter(s =>
    (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.englishName || s.name_en || '').toLowerCase().includes(search.toLowerCase()) ||
    String(s.number || s.id).includes(search)
  );

  const handleUploadAudio = async (surah) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*' });
      if (result.canceled) return;
      const file = result.assets[0];
      setUploading(surah.number || surah.id);
      const formData = new FormData();
      const ext = file.name?.split('.').pop() || 'mp3';
      formData.append('audio', { uri: file.uri, name: `surah.${ext}`, type: `audio/${ext}` });
      await uploadSurahAudio(surah.number || surah.id, formData);
      toast.show('Audio uploaded', 'success');
      loadSurahs();
    } catch (e) {
      toast.show(e.message || 'Upload failed', 'error');
    }
    setUploading(null);
  };

  const renderItem = ({ item }) => {
    const num = item.number || item.id;
    const isLoading = uploading === num;
    return (
      <View style={[styles.card, { backgroundColor: 'rgba(20,35,55,0.7)', borderColor: 'rgba(201,168,76,0.2)' }]}>
        <View style={[styles.numberBadge, { backgroundColor: COLORS.secondary + '22' }]}>
          <Text style={[styles.numberText, { color: COLORS.secondary }]}>{num}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.cardTitle, { color: COLORS.text }]} numberOfLines={1}>{item.name || item.englishName}</Text>
          <Text style={[styles.cardSub, { color: COLORS.textMuted }]} numberOfLines={1}>
            {item.englishName || item.name_en || ''}
            {item.numberOfAyahs ? ` • ${item.numberOfAyahs} ayahs` : ''}
          </Text>
          {item.revelationType ? (
            <View style={[styles.typeBadge, { backgroundColor: item.revelationType === 'Meccan' ? '#e74c3c22' : '#27ae6022' }]}>
              <Text style={{ color: item.revelationType === 'Meccan' ? '#e74c3c' : '#27ae60', fontSize: 11, fontWeight: '600' }}>{item.revelationType}</Text>
            </View>
          ) : null}
        </View>
        <TouchableOpacity
          style={[styles.uploadBtn, { borderColor: 'rgba(201,168,76,0.2)', opacity: isLoading ? 0.6 : 1 }]}
          onPress={() => handleUploadAudio(item)}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={COLORS.secondary} />
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={16} color={COLORS.secondary} />
              <Text style={[styles.uploadText, { color: COLORS.secondary }]}>Audio</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.navigate('AdminDashboard')} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textGold} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: COLORS.textGold }]}>Quran</Text>
        <View style={{ width: 36 }} />
      </View>
      <View style={styles.searchRow}>
        <View style={[styles.searchBar, { backgroundColor: 'rgba(20,35,55,0.7)', borderColor: 'rgba(201,168,76,0.2)' }]}>
          <Ionicons name="search" size={18} color={COLORS.textMuted} />
          <TextInput style={[styles.searchInput, { color: COLORS.text }]} placeholder="Search surahs..." placeholderTextColor={COLORS.textMuted} value={search} onChangeText={setSearch} />
          {search ? <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={18} color={COLORS.textMuted} /></TouchableOpacity> : null}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.secondary} style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => String(item.number || item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={[styles.empty, { color: COLORS.textMuted }]}>No surahs found</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(201,168,76,0.3)', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(201,168,76,0.08)' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  searchRow: { padding: 12 },
  searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, height: 44, gap: 8 },
  searchInput: { flex: 1, fontSize: 14 },
  list: { padding: 12, paddingBottom: 32 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 8, gap: 12 },
  numberBadge: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  numberText: { fontSize: 15, fontWeight: '700' },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '600' },
  cardSub: { fontSize: 12, marginTop: 2 },
  typeBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginTop: 4 },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, gap: 4 },
  uploadText: { fontSize: 12, fontWeight: '600' },
  empty: { textAlign: 'center', marginTop: 60, fontSize: 15 },
});
