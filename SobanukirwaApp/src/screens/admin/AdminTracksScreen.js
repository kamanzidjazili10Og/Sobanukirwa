import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, TextInput, Alert, Modal, ScrollView, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import { useApp } from '../../context/AppContext';
import { useToastContext } from '../../components/Toast';
import { fetchTracks, createTrack, updateTrack, deleteTrack, fetchArtists, fetchCategories } from '../../services/api';
import AdminLayout, { AdminFAB, AdminEmptyState } from '../../components/admin/AdminLayout';

export default function AdminTracksScreen({ navigation }) {
  const { COLORS, t, refreshData } = useApp();
  const toast = useToastContext();
  const [tracks, setTracks] = useState([]);
  const [artists, setArtists] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formTitle, setFormTitle] = useState('');
  const [formTitleEn, setFormTitleEn] = useState('');
  const [formTitleAr, setFormTitleAr] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formArtistId, setFormArtistId] = useState(null);
  const [formCategoryId, setFormCategoryId] = useState(null);
  const [formDuration, setFormDuration] = useState('');
  const [formAudio, setFormAudio] = useState(null);
  const [showArtistPicker, setShowArtistPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [t, a, c] = await Promise.all([fetchTracks(), fetchArtists(), fetchCategories()]);
      setTracks(Array.isArray(t) ? t : []);
      setArtists(Array.isArray(a) ? a : []);
      setCategories(Array.isArray(c) ? c : []);
    } catch { toast.show('Failed to load data', 'error'); }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, []);

  const filtered = tracks.filter(tr =>
    (tr.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (tr.artist_name || '').toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditing(null);
    setFormTitle(''); setFormTitleEn(''); setFormTitleAr(''); setFormDesc('');
    setFormArtistId(null); setFormCategoryId(null); setFormDuration(''); setFormAudio(null);
    setModalVisible(true);
  };

  const openEdit = (track) => {
    setEditing(track);
    setFormTitle(track.title || '');
    setFormTitleEn(track.title_en || '');
    setFormTitleAr(track.title_ar || '');
    setFormDesc(track.description || '');
    setFormArtistId(track.artist_id || null);
    setFormCategoryId(track.category_id || null);
    setFormDuration(track.duration_str || String(track.duration || ''));
    setFormAudio(null);
    setModalVisible(true);
  };

  const pickAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*' });
      if (result.canceled) return;
      const file = result.assets[0];
      setFormAudio(file);
      try {
        const { sound } = await Audio.Sound.createAsync({ uri: file.uri });
        const status = await sound.getStatusAsync();
        const dur = Math.floor((status.durationMillis || 0) / 1000);
        const hrs = Math.floor(dur / 3600);
        const mins = Math.floor((dur % 3600) / 60);
        const secs = dur % 60;
        setFormDuration(`${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
        await sound.unloadAsync();
      } catch {}
    } catch {}
  };

  const handleSave = async () => {
    if (!formTitle.trim()) { toast.show('Title is required', 'error'); return; }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', formTitle.trim());
      if (formTitleEn) formData.append('title_en', formTitleEn.trim());
      if (formTitleAr) formData.append('title_ar', formTitleAr.trim());
      if (formDesc) formData.append('description', formDesc.trim());
      const resolvedArtistId = formArtistId || (artists.length > 0 ? artists[0].id : null);
      if (resolvedArtistId) formData.append('artist_id', String(resolvedArtistId));
      if (formCategoryId) formData.append('category_id', String(formCategoryId));
      if (formDuration) formData.append('duration_str', formDuration);
      if (formAudio) {
        const ext = formAudio.name?.split('.').pop() || 'mp3';
        formData.append('audio', { uri: formAudio.uri, name: `track.${ext}`, type: `audio/${ext}` });
      }
      if (editing) {
        await updateTrack(editing.id, formData);
        toast.show('Track updated', 'success');
      } else {
        await createTrack(formData);
        toast.show('Track created', 'success');
      }
      setModalVisible(false);
      loadData();
      refreshData().catch(() => {});
    } catch (e) { toast.show(e.message || 'Save failed', 'error'); }
    setSaving(false);
  };

  const handleDelete = (track) => {
    Alert.alert('Delete Track', `Delete "${track.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try { await deleteTrack(track.id); toast.show('Track deleted', 'success'); loadData(); refreshData().catch(() => {}); }
          catch { toast.show('Delete failed', 'error'); }
        }
      },
    ]);
  };

  const getArtistName = (id) => artists.find(a => a.id === id)?.name || '';
  const getCategoryName = (id) => categories.find(c => c.id === id)?.name || '';

  const AnimatedListItem = React.memo(({ item, index, children }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, delay: index * 40, useNativeDriver: true }).start();
    }, []);
    return <Animated.View style={{ opacity: fadeAnim }}>{children}</Animated.View>;
  });

  const renderItem = ({ item, index }) => (
    <AnimatedListItem item={item} index={index}>
      <TouchableOpacity style={styles.card} onPress={() => openEdit(item)} onLongPress={() => handleDelete(item)}>
        <View style={styles.cardIconWrap}>
          <Ionicons name="musical-note" size={22} color="#14B8A6" />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.cardSub} numberOfLines={1}>
            {item.artist_name || getArtistName(item.artist_id) || 'Unknown'}
            {item.category_name ? ` · ${item.category_name}` : ''}
          </Text>
        </View>
        <View style={styles.cardRight}>
          {item.duration_str ? <Text style={styles.duration}>{item.duration_str}</Text> : null}
          <Text style={styles.playsText}>{item.plays_count ?? 0} plays</Text>
        </View>
        <TouchableOpacity onPress={() => handleDelete(item)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
        </TouchableOpacity>
      </TouchableOpacity>
    </AnimatedListItem>
  );

  const renderPickerModal = (items, labelKey, onSelect, onClose) => (
    <Modal visible transparent animationType="fade">
      <View style={styles.pickerOverlay}>
        <View style={styles.pickerModal}>
          <Text style={styles.pickerTitle}>Select {labelKey}</Text>
          <ScrollView style={{ maxHeight: 300 }}>
            {items.map(item => (
              <TouchableOpacity key={item.id} style={styles.pickerItem} onPress={() => { onSelect(item.id); onClose(); }}>
                <Text style={styles.pickerItemText}>{item.name || item.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.pickerClose} onPress={onClose}>
            <Text style={{ color: '#F59E0B', fontWeight: '600' }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <AdminLayout navigation={navigation} title="Tracks" subtitle={`${filtered.length} tracks`}>
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="rgba(255,255,255,0.3)" />
          <TextInput style={styles.searchInput} placeholder="Search tracks..." placeholderTextColor="rgba(255,255,255,0.3)" value={search} onChangeText={setSearch} />
          {search ? <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.3)" /></TouchableOpacity> : null}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#F59E0B" style={{ flex: 1 }} />
      ) : (
        <FlatList data={filtered} keyExtractor={item => String(item.id)} renderItem={renderItem} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}
          ListEmptyComponent={<AdminEmptyState icon="musical-notes" message="No tracks found" />}
        />
      )}

      <AdminFAB onPress={openAdd} />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View style={styles.modalIconWrap}>
                  <Ionicons name="musical-note" size={18} color="#F59E0B" />
                </View>
                <Text style={styles.modalTitle}>{editing ? 'Edit Track' : 'Add Track'}</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color="rgba(255,255,255,0.5)" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
              <Text style={styles.label}>Title *</Text>
              <TextInput style={styles.input} value={formTitle} onChangeText={setFormTitle} placeholder="Track title" placeholderTextColor="rgba(255,255,255,0.3)" />

              <Text style={styles.label}>Title (English)</Text>
              <TextInput style={styles.input} value={formTitleEn} onChangeText={setFormTitleEn} placeholder="English title" placeholderTextColor="rgba(255,255,255,0.3)" />

              <Text style={styles.label}>Title (Arabic)</Text>
              <TextInput style={[styles.input, { textAlign: 'right' }]} value={formTitleAr} onChangeText={setFormTitleAr} placeholder="Arabic title" placeholderTextColor="rgba(255,255,255,0.3)" />

              <Text style={styles.label}>Description</Text>
              <TextInput style={[styles.input, styles.textArea]} value={formDesc} onChangeText={setFormDesc} placeholder="Description" placeholderTextColor="rgba(255,255,255,0.3)" multiline numberOfLines={3} />

              <Text style={styles.label}>Artist</Text>
              <TouchableOpacity style={styles.dropdown} onPress={() => setShowArtistPicker(true)}>
                <Text style={{ color: formArtistId ? '#FFFFFF' : 'rgba(255,255,255,0.3)', flex: 1 }}>{formArtistId ? artists.find(a => a.id === formArtistId)?.name : 'Select artist'}</Text>
                <Ionicons name="chevron-down" size={16} color="rgba(255,255,255,0.3)" />
              </TouchableOpacity>

              <Text style={styles.label}>Category</Text>
              <TouchableOpacity style={styles.dropdown} onPress={() => setShowCategoryPicker(true)}>
                <Text style={{ color: formCategoryId ? '#FFFFFF' : 'rgba(255,255,255,0.3)', flex: 1 }}>{formCategoryId ? categories.find(c => c.id === formCategoryId)?.name : 'Select category'}</Text>
                <Ionicons name="chevron-down" size={16} color="rgba(255,255,255,0.3)" />
              </TouchableOpacity>

              <Text style={styles.label}>Duration (e.g. 3:45)</Text>
              <TextInput style={styles.input} value={formDuration} onChangeText={setFormDuration} placeholder="Auto-detected from audio" placeholderTextColor="rgba(255,255,255,0.3)" />

              <TouchableOpacity style={styles.audioPicker} onPress={pickAudio}>
                <Ionicons name={formAudio ? 'checkmark-circle' : 'musical-note'} size={24} color={formAudio ? '#27ae60' : '#F59E0B'} />
                <Text style={{ color: formAudio ? '#27ae60' : 'rgba(255,255,255,0.6)', marginLeft: 8 }}>{formAudio ? formAudio.name || 'Audio selected' : 'Pick Audio File'}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.saveBtnGradient}>
                  {saving ? <ActivityIndicator color="#0a1220" /> : <Text style={styles.saveBtnText}>{editing ? 'Update' : 'Create'}</Text>}
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {showArtistPicker && renderPickerModal(artists, 'Artist', setFormArtistId, () => setShowArtistPicker(false))}
      {showCategoryPicker && renderPickerModal(categories, 'Category', setFormCategoryId, () => setShowCategoryPicker(false))}
    </AdminLayout>
  );
}

const styles = StyleSheet.create({
  searchRow: { paddingHorizontal: 12, paddingBottom: 4 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1,
    paddingHorizontal: 14, height: 46, gap: 10,
    backgroundColor: 'rgba(20,35,55,0.6)', borderColor: 'rgba(201,168,76,0.15)',
  },
  searchInput: { flex: 1, fontSize: 14, color: '#FFFFFF' },
  list: { padding: 12, paddingBottom: 100 },
  card: {
    flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(201,168,76,0.12)', backgroundColor: 'rgba(20,35,55,0.5)',
    marginBottom: 10, gap: 12,
  },
  cardIconWrap: {
    width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(20,184,166,0.12)',
  },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  cardSub: { fontSize: 12, marginTop: 2, color: 'rgba(255,255,255,0.4)' },
  cardRight: { alignItems: 'flex-end', gap: 2 },
  duration: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  playsText: { fontSize: 11, fontWeight: '600', color: '#14B8A6' },

  /* Modal */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '95%',
    backgroundColor: '#0a1220', borderWidth: 1, borderColor: 'rgba(201,168,76,0.15)',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  modalIconWrap: {
    width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(245,158,11,0.12)',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#F59E0B' },
  modalCloseBtn: {
    width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 14, color: 'rgba(255,255,255,0.5)' },
  input: {
    borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14,
    color: '#FFFFFF', borderColor: 'rgba(201,168,76,0.15)', backgroundColor: 'rgba(20,35,55,0.6)',
    marginBottom: 4,
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  dropdown: {
    borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
    borderColor: 'rgba(201,168,76,0.15)', backgroundColor: 'rgba(20,35,55,0.6)',
  },
  audioPicker: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderStyle: 'dashed',
    borderRadius: 14, padding: 18, marginTop: 14, marginBottom: 8, justifyContent: 'center',
    borderColor: 'rgba(245,158,11,0.25)', backgroundColor: 'rgba(245,158,11,0.04)',
  },
  saveBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 8, marginBottom: 20 },
  saveBtnGradient: { paddingVertical: 15, borderRadius: 14, alignItems: 'center' },
  saveBtnText: { color: '#0a1220', fontSize: 16, fontWeight: '700' },

  /* Picker */
  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  pickerModal: {
    borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20,
    backgroundColor: '#0a1220', borderWidth: 1, borderColor: 'rgba(201,168,76,0.15)',
  },
  pickerTitle: { fontSize: 16, fontWeight: '700', color: '#F59E0B', marginBottom: 12 },
  pickerItem: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(201,168,76,0.08)' },
  pickerItemText: { fontSize: 15, color: '#FFFFFF' },
  pickerClose: { paddingVertical: 14, alignItems: 'center', marginTop: 8 },
});
