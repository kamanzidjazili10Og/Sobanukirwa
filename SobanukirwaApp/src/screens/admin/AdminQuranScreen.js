import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, TextInput, Modal, ScrollView, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import { useApp } from '../../context/AppContext';
import { useToastContext } from '../../components/Toast';
import { fetchSurahs, uploadSurahAudio, updateSurah, getMediaUrl } from '../../services/api';
import AdminLayout from '../../components/admin/AdminLayout';

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
  useEffect(() => { return () => { if (previewSound) previewSound.unloadAsync(); }; }, []);

  const getRevelationLabel = (s) => {
    const rt = s.revelationType || s.revelation_type;
    if (rt === 'Meccan' || rt === 'Makkah') return 'Meccan';
    if (rt === 'Medinan' || rt === 'Madani') return 'Medinan';
    return rt || '';
  };

  const filtered = surahs.filter(s => {
    const label = getRevelationLabel(s);
    const matchesTab = filterTab === 'all' || label === filterTab;
    const q = search.toLowerCase();
    const matchesSearch = !q || (s.name || '').toLowerCase().includes(q) || (s.englishName || s.name_en || s.name || '').toLowerCase().includes(q) || String(s.number || s.surah_number || s.id).includes(q);
    return matchesTab && matchesSearch;
  });

  const handleUploadAudio = async (surah) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*' });
      if (result.canceled) return;
      const file = result.assets[0];
      const num = surah.number || surah.surah_number || surah.id;
      setUploading(num);
      const formData = new FormData();
      const ext = file.name?.split('.').pop() || 'mp3';
      formData.append('audio', { uri: file.uri, name: `surah.${ext}`, type: `audio/${ext}` });
      await uploadSurahAudio(num, formData);
      toast.show('Audio uploaded successfully', 'success');
      loadSurahs();
    } catch (e) { toast.show(e.message || 'Upload failed', 'error'); }
    setUploading(null);
  };

  const handlePreview = async (surah) => {
    const num = surah.number || surah.surah_number || surah.id;
    if (previewingId === num) {
      if (previewSound) { await previewSound.stopAsync(); await previewSound.unloadAsync(); }
      setPreviewSound(null); setPreviewingId(null); return;
    }
    if (previewSound) { await previewSound.stopAsync(); await previewSound.unloadAsync(); }
    const audioUrl = surah.audio_url;
    if (!audioUrl) { toast.show('No audio available for this surah', 'error'); return; }
    try {
      const uri = audioUrl.startsWith('http') ? audioUrl : getMediaUrl(audioUrl);
      const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true });
      setPreviewSound(sound); setPreviewingId(num);
      sound.setOnPlaybackStatusUpdate((status) => { if (status.didJustFinish) { setPreviewSound(null); setPreviewingId(null); } });
    } catch { toast.show('Failed to play audio', 'error'); setPreviewingId(null); }
  };

  const handleEdit = (surah) => {
    setEditingSurah({
      number: surah.number || surah.id,
      name: surah.name_arabic || '',
      englishName: surah.englishName || surah.name || '',
      numberOfAyahs: String(surah.numberOfAyahs || surah.ayahs_count || ''),
      revelationType: surah.revelationType || (surah.revelation_type === 'Makkah' ? 'Meccan' : surah.revelation_type === 'Madani' ? 'Medinan' : 'Meccan'),
      audio_url: surah.audio_url || ''
    });
    setModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editingSurah) return;
    try {
      const dbRevelation = editingSurah.revelationType === 'Meccan' ? 'Makkah' : 'Madani';
      await updateSurah(editingSurah.number, {
        name: editingSurah.englishName || editingSurah.name,
        name_arabic: editingSurah.name,
        ayahs_count: parseInt(editingSurah.numberOfAyahs) || 0,
        revelation_type: dbRevelation,
      });
      toast.show('Surah updated', 'success');
      setModalVisible(false); setEditingSurah(null);
      loadSurahs();
    } catch (e) { toast.show(e.message || 'Update failed', 'error'); }
  };

  const stats = { total: surahs.length, withAudio: surahs.filter(s => s.audio_url).length, meccan: surahs.filter(s => getRevelationLabel(s) === 'Meccan').length, medinan: surahs.filter(s => getRevelationLabel(s) === 'Medinan').length };

  const AnimatedListItem = React.memo(({ item, index, children }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, delay: index * 30, useNativeDriver: true }).start();
    }, []);
    return <Animated.View style={{ opacity: fadeAnim }}>{children}</Animated.View>;
  });

  const renderItem = ({ item, index }) => {
    const num = item.number || item.surah_number || item.id;
    const isLoading = uploading === num;
    const hasAudio = !!item.audio_url;
    const isPreviewing = previewingId === num;

    return (
      <AnimatedListItem item={item} index={index}>
        <View style={[styles.card, { borderColor: hasAudio ? 'rgba(201,168,76,0.25)' : 'rgba(201,168,76,0.1)' }]}>
          <View style={[styles.numberBadge, { backgroundColor: hasAudio ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.06)' }]}>
            <Text style={styles.numberText}>{num}</Text>
          </View>
          <View style={styles.cardInfo}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.englishName || item.name}</Text>
              {hasAudio && (
                <View style={styles.audioBadge}>
                  <Ionicons name="musical-notes" size={10} color="#27ae60" />
                  <Text style={styles.audioBadgeText}>Audio</Text>
                </View>
              )}
            </View>
            <Text style={styles.cardArabic} numberOfLines={1}>{item.name_arabic || ''}</Text>
            <View style={styles.cardMeta}>
              {item.numberOfAyahs || item.ayahs_count ? <Text style={styles.metaText}>{item.numberOfAyahs || item.ayahs_count} ayahs</Text> : null}
              {getRevelationLabel(item) ? (
                <View style={[styles.typeBadge, { backgroundColor: getRevelationLabel(item) === 'Meccan' ? 'rgba(231,76,60,0.12)' : 'rgba(39,174,96,0.12)' }]}>
                  <Text style={[styles.typeText, { color: getRevelationLabel(item) === 'Meccan' ? '#e74c3c' : '#27ae60' }]}>{getRevelationLabel(item)}</Text>
                </View>
              ) : null}
            </View>
          </View>
          <View style={styles.cardActions}>
            {hasAudio && (
              <TouchableOpacity style={[styles.actionBtn, isPreviewing && styles.actionBtnActive]} onPress={() => handlePreview(item)}>
                <Ionicons name={isPreviewing ? 'pause' : 'play'} size={14} color={isPreviewing ? '#FFFFFF' : '#F59E0B'} />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleUploadAudio(item)} disabled={isLoading}>
              {isLoading ? <ActivityIndicator size={14} color="#F59E0B" /> : <Ionicons name="cloud-upload-outline" size={14} color="#F59E0B" />}
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleEdit(item)}>
              <Ionicons name="create-outline" size={14} color="#F59E0B" />
            </TouchableOpacity>
          </View>
        </View>
      </AnimatedListItem>
    );
  };

  return (
    <AdminLayout navigation={navigation} title="Quran" subtitle={`${stats.total} surahs · ${stats.withAudio} with audio`}>
      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}><Text style={[styles.statNum, { color: '#F59E0B' }]}>{stats.total}</Text><Text style={styles.statLabel}>Total</Text></View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}><Text style={[styles.statNum, { color: '#27ae60' }]}>{stats.withAudio}</Text><Text style={styles.statLabel}>Audio</Text></View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}><Text style={[styles.statNum, { color: '#e74c3c' }]}>{stats.meccan}</Text><Text style={styles.statLabel}>Meccan</Text></View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}><Text style={[styles.statNum, { color: '#3498db' }]}>{stats.medinan}</Text><Text style={styles.statLabel}>Medinan</Text></View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {['all', 'Meccan', 'Medinan'].map(tab => (
          <TouchableOpacity key={tab} style={[styles.filterTab, filterTab === tab && styles.filterTabActive]} onPress={() => setFilterTab(tab)}>
            <Text style={[styles.filterTabText, filterTab === tab && styles.filterTabTextActive]}>{tab === 'all' ? 'All' : tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="rgba(255,255,255,0.3)" />
          <TextInput style={styles.searchInput} placeholder="Search surahs..." placeholderTextColor="rgba(255,255,255,0.3)" value={search} onChangeText={setSearch} />
          {search ? <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.3)" /></TouchableOpacity> : null}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#F59E0B" style={{ flex: 1 }} />
      ) : (
        <FlatList data={filtered} keyExtractor={item => String(item.number || item.surah_number || item.id)} renderItem={renderItem} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}
          ListEmptyComponent={<View style={styles.emptyState}><Ionicons name="book-outline" size={48} color="rgba(245,158,11,0.2)" /><Text style={styles.emptyText}>No surahs found</Text></View>}
        />
      )}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View style={styles.modalIconWrap}><Ionicons name="book" size={18} color="#F59E0B" /></View>
                <Text style={styles.modalTitle}>Edit Surah {editingSurah?.number}</Text>
              </View>
              <TouchableOpacity onPress={() => { setModalVisible(false); setEditingSurah(null); }} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color="rgba(255,255,255,0.5)" />
              </TouchableOpacity>
            </View>
            {editingSurah && (
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <Text style={styles.label}>Arabic Name</Text>
                <TextInput style={styles.input} value={editingSurah.name} onChangeText={v => setEditingSurah(p => ({ ...p, name: v }))} placeholder="e.g. الفاتحة" placeholderTextColor="rgba(255,255,255,0.3)" />
                <Text style={styles.label}>English Name</Text>
                <TextInput style={styles.input} value={editingSurah.englishName} onChangeText={v => setEditingSurah(p => ({ ...p, englishName: v }))} placeholder="e.g. Al-Fatihah" placeholderTextColor="rgba(255,255,255,0.3)" />
                <Text style={styles.label}>Number of Ayahs</Text>
                <TextInput style={styles.input} value={editingSurah.numberOfAyahs} onChangeText={v => setEditingSurah(p => ({ ...p, numberOfAyahs: v }))} keyboardType="numeric" placeholder="e.g. 7" placeholderTextColor="rgba(255,255,255,0.3)" />
                <Text style={styles.label}>Revelation Type</Text>
                <View style={styles.typeRow}>
                  {REVELATION_TYPES.map(type => (
                    <TouchableOpacity key={type} style={[styles.typeOption, { borderColor: editingSurah.revelationType === type ? (type === 'Meccan' ? '#e74c3c' : '#27ae60') : 'rgba(201,168,76,0.15)', backgroundColor: editingSurah.revelationType === type ? (type === 'Meccan' ? 'rgba(231,76,60,0.15)' : 'rgba(39,174,96,0.15)') : 'transparent' }]} onPress={() => setEditingSurah(p => ({ ...p, revelationType: type }))}>
                      <Text style={{ color: editingSurah.revelationType === type ? (type === 'Meccan' ? '#e74c3c' : '#27ae60') : 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: '600' }}>{type}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            )}
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => { setModalVisible(false); setEditingSurah(null); }}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveEdit}>
                <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.saveBtnGradient}>
                  <Text style={styles.saveBtnText}>Save</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </AdminLayout>
  );
}

const styles = StyleSheet.create({
  statsRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 12, marginTop: 8, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(201,168,76,0.1)', backgroundColor: 'rgba(20,35,55,0.4)' },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 20, fontWeight: '700' },
  statLabel: { fontSize: 10, marginTop: 3, color: 'rgba(255,255,255,0.4)' },
  statDivider: { width: 1, height: 28, backgroundColor: 'rgba(201,168,76,0.1)' },
  filterRow: { flexDirection: 'row', paddingHorizontal: 12, gap: 6, marginTop: 10 },
  filterTab: { flex: 1, paddingVertical: 9, borderRadius: 12, alignItems: 'center', backgroundColor: 'rgba(20,35,55,0.5)' },
  filterTabActive: { backgroundColor: 'rgba(245,158,11,0.15)' },
  filterTabText: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.4)' },
  filterTabTextActive: { color: '#F59E0B' },
  searchRow: { padding: 12, paddingBottom: 4 },
  searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, height: 44, gap: 10, backgroundColor: 'rgba(20,35,55,0.6)', borderColor: 'rgba(201,168,76,0.15)' },
  searchInput: { flex: 1, fontSize: 14, color: '#FFFFFF' },
  list: { padding: 12, paddingBottom: 32 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, borderWidth: 1, marginBottom: 8, gap: 10, backgroundColor: 'rgba(20,35,55,0.5)' },
  numberBadge: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  numberText: { fontSize: 15, fontWeight: '700', color: '#F59E0B' },
  cardInfo: { flex: 1 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#FFFFFF', flex: 1 },
  audioBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8, gap: 3, backgroundColor: 'rgba(39,174,96,0.12)' },
  audioBadgeText: { fontSize: 9, fontWeight: '700', color: '#27ae60' },
  cardArabic: { fontSize: 13, fontWeight: '600', marginTop: 2, color: 'rgba(255,255,255,0.5)' },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  metaText: { fontSize: 11, color: 'rgba(255,255,255,0.4)' },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  typeText: { fontSize: 10, fontWeight: '600' },
  cardActions: { flexDirection: 'row', gap: 6 },
  actionBtn: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: 'rgba(201,168,76,0.15)', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(201,168,76,0.05)' },
  actionBtnActive: { backgroundColor: 'rgba(245,158,11,0.2)', borderColor: '#F59E0B' },
  emptyState: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { textAlign: 'center', fontSize: 15, color: 'rgba(255,255,255,0.4)' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, maxHeight: '85%', backgroundColor: '#0a1220', borderColor: 'rgba(201,168,76,0.15)' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderBottomWidth: 1, borderBottomColor: 'rgba(201,168,76,0.1)' },
  modalHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  modalIconWrap: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(245,158,11,0.12)' },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#F59E0B' },
  modalCloseBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)' },
  modalBody: { padding: 18 },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 6, marginTop: 12, color: 'rgba(255,255,255,0.5)' },
  input: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#FFFFFF', borderColor: 'rgba(201,168,76,0.15)', backgroundColor: 'rgba(20,35,55,0.6)' },
  typeRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  typeOption: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, alignItems: 'center' },
  modalFooter: { flexDirection: 'row', gap: 10, padding: 18, borderTopWidth: 1, borderTopColor: 'rgba(201,168,76,0.1)' },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(201,168,76,0.15)' },
  cancelBtnText: { fontSize: 15, fontWeight: '700', color: 'rgba(255,255,255,0.5)' },
  saveBtn: { flex: 1, borderRadius: 12, overflow: 'hidden' },
  saveBtnGradient: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  saveBtnText: { fontSize: 15, fontWeight: '700', color: '#0a1220' },
});
