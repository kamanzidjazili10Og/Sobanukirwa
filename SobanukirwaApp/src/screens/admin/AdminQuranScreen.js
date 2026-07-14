import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView,
  ActivityIndicator, TextInput, Modal, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import { useApp } from '../../context/AppContext';
import { useToastContext } from '../../components/Toast';
import { fetchSurahs, uploadSurahAudio, getMediaUrl } from '../../services/api';

const REVELATION_TYPES = ['Meccan', 'Medinan'];

export default function AdminQuranScreen({ navigation }) {
  const { COLORS } = useApp();
  const toast = useToastContext();
  const [surahs, setSurahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSurah, setEditingSurah] = useState(null);
  const [previewSound, setPreviewSound] = useState(null);
  const [previewingId, setPreviewingId] = useState(null);
  const [filterTab, setFilterTab] = useState('all');

  const loadSurahs = useCallback(async () => {
    try {
      const data = await fetchSurahs();
      setSurahs(Array.isArray(data) ? data : []);
    } catch { toast.show('Failed to load surahs', 'error'); }
    setLoading(false);
  }, []);

  useEffect(() => { loadSurahs(); }, []);

  useEffect(() => {
    return () => { if (previewSound) previewSound.unloadAsync(); };
  }, []);

  const filtered = surahs.filter(s => {
    const matchesTab = filterTab === 'all' || s.revelationType === filterTab;
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      (s.name || '').toLowerCase().includes(q) ||
      (s.englishName || s.name_en || '').toLowerCase().includes(q) ||
      String(s.number || s.id).includes(q);
    return matchesTab && matchesSearch;
  });

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
      toast.show('Audio uploaded successfully', 'success');
      loadSurahs();
    } catch (e) {
      toast.show(e.message || 'Upload failed', 'error');
    }
    setUploading(null);
  };

  const handlePreview = async (surah) => {
    const num = surah.number || surah.id;
    if (previewingId === num) {
      if (previewSound) { await previewSound.stopAsync(); await previewSound.unloadAsync(); }
      setPreviewSound(null);
      setPreviewingId(null);
      return;
    }
    if (previewSound) { await previewSound.stopAsync(); await previewSound.unloadAsync(); }
    const audioUrl = surah.audio_url;
    if (!audioUrl) { toast.show('No audio available for this surah', 'error'); return; }
    try {
      const uri = audioUrl.startsWith('http') ? audioUrl : getMediaUrl(audioUrl);
      const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true });
      setPreviewSound(sound);
      setPreviewingId(num);
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) { setPreviewSound(null); setPreviewingId(null); }
      });
    } catch (e) {
      toast.show('Failed to play audio', 'error');
      setPreviewingId(null);
    }
  };

  const handleEdit = (surah) => {
    setEditingSurah({
      number: surah.number || surah.id,
      name: surah.name || '',
      englishName: surah.englishName || surah.name_en || '',
      numberOfAyahs: String(surah.numberOfAyahs || ''),
      revelationType: surah.revelationType || 'Meccan',
      audio_url: surah.audio_url || '',
    });
    setModalVisible(true);
  };

  const handleSaveEdit = () => {
    if (!editingSurah) return;
    setSurahs(prev => prev.map(s => {
      if ((s.number || s.id) !== editingSurah.number) return s;
      return {
        ...s,
        name: editingSurah.name,
        englishName: editingSurah.englishName,
        numberOfAyahs: parseInt(editingSurah.numberOfAyahs) || s.numberOfAyahs,
        revelationType: editingSurah.revelationType,
      };
    }));
    setModalVisible(false);
    setEditingSurah(null);
    toast.show('Surah updated (local)', 'success');
  };

  const stats = {
    total: surahs.length,
    withAudio: surahs.filter(s => s.audio_url).length,
    meccan: surahs.filter(s => s.revelationType === 'Meccan').length,
    medinan: surahs.filter(s => s.revelationType === 'Medinan').length,
  };

  const renderItem = ({ item }) => {
    const num = item.number || item.id;
    const isLoading = uploading === num;
    const hasAudio = !!item.audio_url;
    const isPreviewing = previewingId === num;

    return (
      <View style={[styles.card, { backgroundColor: 'rgba(20,35,55,0.7)', borderColor: hasAudio ? 'rgba(201,168,76,0.3)' : 'rgba(201,168,76,0.15)' }]}>
        <View style={[styles.numberBadge, { backgroundColor: hasAudio ? 'rgba(201,168,76,0.2)' : 'rgba(201,168,76,0.08)' }]}>
          <Text style={[styles.numberText, { color: COLORS.secondary }]}>{num}</Text>
        </View>
        <View style={styles.cardInfo}>
          <View style={styles.cardTitleRow}>
            <Text style={[styles.cardTitle, { color: COLORS.text }]} numberOfLines={1}>{item.englishName || item.name}</Text>
            {hasAudio && (
              <View style={[styles.audioBadge, { backgroundColor: 'rgba(39,174,96,0.15)' }]}>
                <Ionicons name="musical-notes" size={10} color="#27ae60" />
                <Text style={styles.audioBadgeText}>Audio</Text>
              </View>
            )}
          </View>
          <Text style={[styles.cardArabic, { color: COLORS.secondary }]} numberOfLines={1}>{item.name}</Text>
          <View style={styles.cardMeta}>
            {item.numberOfAyahs ? (
              <Text style={[styles.metaText, { color: COLORS.textMuted }]}>{item.numberOfAyahs} ayahs</Text>
            ) : null}
            {item.revelationType ? (
              <View style={[styles.typeBadge, { backgroundColor: item.revelationType === 'Meccan' ? 'rgba(231,76,60,0.12)' : 'rgba(39,174,96,0.12)' }]}>
                <Text style={[styles.typeText, { color: item.revelationType === 'Meccan' ? '#e74c3c' : '#27ae60' }]}>{item.revelationType}</Text>
              </View>
            ) : null}
          </View>
        </View>
        <View style={styles.cardActions}>
          {hasAudio && (
            <TouchableOpacity
              style={[styles.actionBtn, { borderColor: isPreviewing ? COLORS.secondary : 'rgba(201,168,76,0.2)' }]}
              onPress={() => handlePreview(item)}
            >
              <Ionicons name={isPreviewing ? 'pause' : 'play'} size={14} color={COLORS.secondary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionBtn, { borderColor: 'rgba(201,168,76,0.2)' }]}
            onPress={() => handleUploadAudio(item)}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size={14} color={COLORS.secondary} />
            ) : (
              <Ionicons name="cloud-upload-outline" size={14} color={COLORS.secondary} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { borderColor: 'rgba(201,168,76,0.2)' }]}
            onPress={() => handleEdit(item)}
          >
            <Ionicons name="create-outline" size={14} color={COLORS.secondary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      <View style={[styles.headerRow, { borderBottomColor: 'rgba(201,168,76,0.15)' }]}>
        <TouchableOpacity onPress={() => navigation.navigate('AdminDashboard')} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.secondary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: COLORS.secondary }]}>Quran Management</Text>
          <Text style={[styles.headerSub, { color: COLORS.textMuted }]}>{stats.total} surahs · {stats.withAudio} with audio</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <View style={[styles.statsRow, { backgroundColor: 'rgba(20,35,55,0.5)', borderColor: 'rgba(201,168,76,0.15)' }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: COLORS.secondary }]}>{stats.total}</Text>
          <Text style={[styles.statLabel, { color: COLORS.textMuted }]}>Total</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: 'rgba(201,168,76,0.15)' }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: '#27ae60' }]}>{stats.withAudio}</Text>
          <Text style={[styles.statLabel, { color: COLORS.textMuted }]}>Audio</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: 'rgba(201,168,76,0.15)' }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: '#e74c3c' }]}>{stats.meccan}</Text>
          <Text style={[styles.statLabel, { color: COLORS.textMuted }]}>Meccan</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: 'rgba(201,168,76,0.15)' }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: '#3498db' }]}>{stats.medinan}</Text>
          <Text style={[styles.statLabel, { color: COLORS.textMuted }]}>Medinan</Text>
        </View>
      </View>

      <View style={styles.filterRow}>
        {['all', 'Meccan', 'Medinan'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.filterTab, filterTab === tab && { backgroundColor: COLORS.secondary }]}
            onPress={() => setFilterTab(tab)}
          >
            <Text style={[styles.filterTabText, { color: filterTab === tab ? '#0a2f44' : COLORS.textMuted }]}>
              {tab === 'all' ? 'All' : tab}
            </Text>
          </TouchableOpacity>
        ))}
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
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="book-outline" size={48} color={COLORS.secondary} />
              <Text style={[styles.empty, { color: COLORS.textMuted }]}>No surahs found</Text>
            </View>
          }
        />
      )}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: COLORS.primaryDark, borderColor: 'rgba(201,168,76,0.3)' }]}>
            <View style={[styles.modalHeader, { borderBottomColor: 'rgba(201,168,76,0.15)' }]}>
              <Text style={[styles.modalTitle, { color: COLORS.secondary }]}>Edit Surah {editingSurah?.number}</Text>
              <TouchableOpacity onPress={() => { setModalVisible(false); setEditingSurah(null); }}>
                <Ionicons name="close" size={22} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
            {editingSurah && (
              <ScrollView style={styles.modalBody}>
                <Text style={[styles.fieldLabel, { color: COLORS.textMuted }]}>Arabic Name</Text>
                <TextInput
                  style={[styles.fieldInput, { backgroundColor: 'rgba(20,35,55,0.7)', borderColor: 'rgba(201,168,76,0.2)', color: COLORS.text }]}
                  value={editingSurah.name}
                  onChangeText={v => setEditingSurah(p => ({ ...p, name: v }))}
                  placeholder="e.g. الفاتحة"
                  placeholderTextColor={COLORS.textMuted}
                />
                <Text style={[styles.fieldLabel, { color: COLORS.textMuted }]}>English Name</Text>
                <TextInput
                  style={[styles.fieldInput, { backgroundColor: 'rgba(20,35,55,0.7)', borderColor: 'rgba(201,168,76,0.2)', color: COLORS.text }]}
                  value={editingSurah.englishName}
                  onChangeText={v => setEditingSurah(p => ({ ...p, englishName: v }))}
                  placeholder="e.g. Al-Fatihah"
                  placeholderTextColor={COLORS.textMuted}
                />
                <Text style={[styles.fieldLabel, { color: COLORS.textMuted }]}>Number of Ayahs</Text>
                <TextInput
                  style={[styles.fieldInput, { backgroundColor: 'rgba(20,35,55,0.7)', borderColor: 'rgba(201,168,76,0.2)', color: COLORS.text }]}
                  value={editingSurah.numberOfAyahs}
                  onChangeText={v => setEditingSurah(p => ({ ...p, numberOfAyahs: v }))}
                  keyboardType="numeric"
                  placeholder="e.g. 7"
                  placeholderTextColor={COLORS.textMuted}
                />
                <Text style={[styles.fieldLabel, { color: COLORS.textMuted }]}>Revelation Type</Text>
                <View style={styles.typeRow}>
                  {REVELATION_TYPES.map(type => (
                    <TouchableOpacity
                      key={type}
                      style={[styles.typeOption, {
                        backgroundColor: editingSurah.revelationType === type
                          ? (type === 'Meccan' ? 'rgba(231,76,60,0.2)' : 'rgba(39,174,96,0.2)')
                          : 'rgba(20,35,55,0.5)',
                        borderColor: editingSurah.revelationType === type
                          ? (type === 'Meccan' ? '#e74c3c' : '#27ae60')
                          : 'rgba(201,168,76,0.15)',
                      }]}
                      onPress={() => setEditingSurah(p => ({ ...p, revelationType: type }))}
                    >
                      <Text style={{ color: editingSurah.revelationType === type
                        ? (type === 'Meccan' ? '#e74c3c' : '#27ae60')
                        : COLORS.textMuted, fontSize: 14, fontWeight: '600'
                      }}>{type}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            )}
            <View style={[styles.modalFooter, { borderTopColor: 'rgba(201,168,76,0.15)' }]}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: 'rgba(201,168,76,0.1)', borderColor: 'rgba(201,168,76,0.3)' }]} onPress={() => { setModalVisible(false); setEditingSurah(null); }}>
                <Text style={[styles.modalBtnText, { color: COLORS.textMuted }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: COLORS.secondary }]} onPress={handleSaveEdit}>
                <Text style={[styles.modalBtnText, { color: '#0a2f44' }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  backBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(201,168,76,0.3)', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(201,168,76,0.08)' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  headerSub: { fontSize: 11, marginTop: 2 },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 12, marginTop: 10, padding: 12, borderRadius: 12, borderWidth: 1 },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 18, fontWeight: '700' },
  statLabel: { fontSize: 10, marginTop: 2 },
  statDivider: { width: 1, height: 28 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 12, gap: 6, marginTop: 10 },
  filterTab: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center', backgroundColor: 'rgba(20,35,55,0.5)' },
  filterTabText: { fontSize: 13, fontWeight: '600' },
  searchRow: { padding: 12, paddingBottom: 4 },
  searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, height: 42, gap: 8 },
  searchInput: { flex: 1, fontSize: 14 },
  list: { padding: 12, paddingBottom: 32 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 14, borderWidth: 1, marginBottom: 8, gap: 10 },
  numberBadge: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  numberText: { fontSize: 15, fontWeight: '700' },
  cardInfo: { flex: 1 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardTitle: { fontSize: 14, fontWeight: '600', flex: 1 },
  audioBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, gap: 3 },
  audioBadgeText: { fontSize: 9, fontWeight: '700', color: '#27ae60' },
  cardArabic: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  metaText: { fontSize: 11 },
  typeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  typeText: { fontSize: 10, fontWeight: '600' },
  cardActions: { flexDirection: 'row', gap: 6 },
  actionBtn: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(201,168,76,0.05)' },
  emptyState: { alignItems: 'center', marginTop: 60, gap: 12 },
  empty: { textAlign: 'center', fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  modalTitle: { fontSize: 17, fontWeight: '700' },
  modalBody: { padding: 16 },
  fieldLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6, marginTop: 10 },
  fieldInput: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  typeRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  typeOption: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1.5, alignItems: 'center' },
  modalFooter: { flexDirection: 'row', gap: 10, padding: 16, borderTopWidth: 1 },
  modalBtn: { flex: 1, paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
  modalBtnText: { fontSize: 15, fontWeight: '700' },
});
