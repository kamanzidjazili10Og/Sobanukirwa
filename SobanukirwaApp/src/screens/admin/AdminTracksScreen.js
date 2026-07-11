import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView,
  ActivityIndicator, TextInput, Alert, Modal, ScrollView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import { useApp } from '../../context/AppContext';
import { useToastContext } from '../../components/Toast';
import { fetchTracks, createTrack, updateTrack, deleteTrack, fetchArtists, fetchCategories } from '../../services/api';

export default function AdminTracksScreen() {
  const { COLORS, t } = useApp();
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
        const mins = Math.floor(dur / 60);
        const secs = dur % 60;
        setFormDuration(`${mins}:${String(secs).padStart(2, '0')}`);
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
      if (formArtistId) formData.append('artist_id', String(formArtistId));
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
    } catch (e) { toast.show(e.message || 'Save failed', 'error'); }
    setSaving(false);
  };

  const handleDelete = (track) => {
    Alert.alert('Delete Track', `Delete "${track.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try { await deleteTrack(track.id); toast.show('Track deleted', 'success'); loadData(); }
          catch { toast.show('Delete failed', 'error'); }
        }
      },
    ]);
  };

  const getArtistName = (id) => artists.find(a => a.id === id)?.name || '';
  const getCategoryName = (id) => categories.find(c => c.id === id)?.name || '';

  const renderItem = ({ item }) => (
    <TouchableOpacity style={[styles.card, { backgroundColor: 'rgba(20,35,55,0.7)', borderColor: 'rgba(201,168,76,0.2)' }]} onPress={() => openEdit(item)} onLongPress={() => handleDelete(item)}>
      <Ionicons name="musical-note" size={24} color={COLORS.secondary} />
      <View style={styles.cardInfo}>
        <Text style={[styles.cardTitle, { color: COLORS.text }]} numberOfLines={1}>{item.title}</Text>
        <Text style={[styles.cardSub, { color: COLORS.textMuted }]} numberOfLines={1}>
          {item.artist_name || getArtistName(item.artist_id) || 'Unknown'}
          {item.category_name ? ` • ${item.category_name}` : ''}
        </Text>
      </View>
      <View style={styles.cardRight}>
        {item.duration_str ? <Text style={[styles.duration, { color: COLORS.textMuted }]}>{item.duration_str}</Text> : null}
        <Text style={[styles.playsText, { color: COLORS.secondary }]}>{item.plays_count ?? 0} plays</Text>
      </View>
      <TouchableOpacity onPress={() => handleDelete(item)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Ionicons name="trash-outline" size={18} color={COLORS.error || '#e74c3c'} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderPickerModal = (items, labelKey, onSelect, onClose) => (
    <Modal visible transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.pickerModal, { backgroundColor: '#0a1220', borderColor: 'rgba(201,168,76,0.2)' }]}>
          <Text style={[styles.modalTitle, { color: COLORS.textGold }]}>Select {labelKey}</Text>
          <ScrollView style={{ maxHeight: 300 }}>
            {items.map(item => (
              <TouchableOpacity key={item.id} style={[styles.pickerItem, { borderBottomColor: 'rgba(201,168,76,0.1)' }]} onPress={() => { onSelect(item.id); onClose(); }}>
                <Text style={[styles.pickerItemText, { color: COLORS.text }]}>{item.name || item.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.pickerClose} onPress={onClose}><Text style={{ color: COLORS.secondary }}>Cancel</Text></TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      <View style={styles.searchRow}>
        <View style={[styles.searchBar, { backgroundColor: 'rgba(20,35,55,0.7)', borderColor: 'rgba(201,168,76,0.2)' }]}>
          <Ionicons name="search" size={18} color={COLORS.textMuted} />
          <TextInput style={[styles.searchInput, { color: COLORS.text }]} placeholder="Search tracks..." placeholderTextColor={COLORS.textMuted} value={search} onChangeText={setSearch} />
          {search ? <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={18} color={COLORS.textMuted} /></TouchableOpacity> : null}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.secondary} style={{ flex: 1 }} />
      ) : (
        <FlatList data={filtered} keyExtractor={item => String(item.id)} renderItem={renderItem} contentContainerStyle={styles.list} ListEmptyComponent={<Text style={[styles.empty, { color: COLORS.textMuted }]}>No tracks found</Text>} />
      )}

      <TouchableOpacity style={[styles.fab, { backgroundColor: COLORS.secondary }]} onPress={openAdd}>
        <Ionicons name="add" size={28} color="#0a1220" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: '#0a1220', borderColor: 'rgba(201,168,76,0.2)' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: COLORS.textGold }]}>{editing ? 'Edit Track' : 'Add Track'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><Ionicons name="close" size={24} color={COLORS.textMuted} /></TouchableOpacity>
            </View>
            <ScrollView>
              <Text style={[styles.label, { color: COLORS.textMuted }]}>Title *</Text>
              <TextInput style={[styles.input, { color: COLORS.text, borderColor: 'rgba(201,168,76,0.2)', backgroundColor: 'rgba(20,35,55,0.7)' }]} value={formTitle} onChangeText={setFormTitle} placeholder="Track title" placeholderTextColor={COLORS.textMuted} />

              <Text style={[styles.label, { color: COLORS.textMuted }]}>Title (English)</Text>
              <TextInput style={[styles.input, { color: COLORS.text, borderColor: 'rgba(201,168,76,0.2)', backgroundColor: 'rgba(20,35,55,0.7)' }]} value={formTitleEn} onChangeText={setFormTitleEn} placeholder="English title" placeholderTextColor={COLORS.textMuted} />

              <Text style={[styles.label, { color: COLORS.textMuted }]}>Title (Arabic)</Text>
              <TextInput style={[styles.input, { color: COLORS.text, borderColor: 'rgba(201,168,76,0.2)', backgroundColor: 'rgba(20,35,55,0.7)', textAlign: 'right' }]} value={formTitleAr} onChangeText={setFormTitleAr} placeholder="Arabic title" placeholderTextColor={COLORS.textMuted} />

              <Text style={[styles.label, { color: COLORS.textMuted }]}>Description</Text>
              <TextInput style={[styles.input, styles.textArea, { color: COLORS.text, borderColor: 'rgba(201,168,76,0.2)', backgroundColor: 'rgba(20,35,55,0.7)' }]} value={formDesc} onChangeText={setFormDesc} placeholder="Description" placeholderTextColor={COLORS.textMuted} multiline numberOfLines={3} />

              <Text style={[styles.label, { color: COLORS.textMuted }]}>Artist</Text>
              <TouchableOpacity style={[styles.dropdown, { borderColor: 'rgba(201,168,76,0.2)', backgroundColor: 'rgba(20,35,55,0.7)' }]} onPress={() => setShowArtistPicker(true)}>
                <Text style={{ color: formArtistId ? COLORS.text : COLORS.textMuted }}>{formArtistId ? artists.find(a => a.id === formArtistId)?.name : 'Select artist'}</Text>
                <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>

              <Text style={[styles.label, { color: COLORS.textMuted }]}>Category</Text>
              <TouchableOpacity style={[styles.dropdown, { borderColor: 'rgba(201,168,76,0.2)', backgroundColor: 'rgba(20,35,55,0.7)' }]} onPress={() => setShowCategoryPicker(true)}>
                <Text style={{ color: formCategoryId ? COLORS.text : COLORS.textMuted }}>{formCategoryId ? categories.find(c => c.id === formCategoryId)?.name : 'Select category'}</Text>
                <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>

              <Text style={[styles.label, { color: COLORS.textMuted }]}>Duration (e.g. 3:45)</Text>
              <TextInput style={[styles.input, { color: COLORS.text, borderColor: 'rgba(201,168,76,0.2)', backgroundColor: 'rgba(20,35,55,0.7)' }]} value={formDuration} onChangeText={setFormDuration} placeholder="Auto-detected from audio" placeholderTextColor={COLORS.textMuted} />

              <TouchableOpacity style={[styles.audioPicker, { borderColor: 'rgba(201,168,76,0.2)' }]} onPress={pickAudio}>
                <Ionicons name={formAudio ? 'checkmark-circle' : 'musical-note'} size={24} color={formAudio ? '#27ae60' : COLORS.secondary} />
                <Text style={{ color: formAudio ? '#27ae60' : COLORS.text, marginLeft: 8 }}>{formAudio ? formAudio.name || 'Audio selected' : 'Pick Audio File'}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: COLORS.secondary }]} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator color="#0a1220" /> : <Text style={styles.saveBtnText}>{editing ? 'Update' : 'Create'}</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {showArtistPicker && renderPickerModal(artists, 'Artist', setFormArtistId, () => setShowArtistPicker(false))}
      {showCategoryPicker && renderPickerModal(categories, 'Category', setFormCategoryId, () => setShowCategoryPicker(false))}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchRow: { padding: 12 },
  searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, height: 44, gap: 8 },
  searchInput: { flex: 1, fontSize: 14 },
  list: { padding: 12, paddingBottom: 80 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 10, gap: 12 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '600' },
  cardSub: { fontSize: 12, marginTop: 2 },
  cardRight: { alignItems: 'flex-end', gap: 2 },
  duration: { fontSize: 12 },
  playsText: { fontSize: 11, fontWeight: '600' },
  empty: { textAlign: 'center', marginTop: 60, fontSize: 15 },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 6 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '90%', borderWidth: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14 },
  textArea: { height: 80, textAlignVertical: 'top' },
  dropdown: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  audioPicker: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderStyle: 'dashed', borderRadius: 12, padding: 16, marginTop: 12, marginBottom: 8, justifyContent: 'center' },
  saveBtn: { paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 16, marginBottom: 20 },
  saveBtnText: { color: '#0a1220', fontSize: 16, fontWeight: '700' },
  pickerModal: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, borderWidth: 1 },
  pickerItem: { paddingVertical: 14, borderBottomWidth: 1 },
  pickerItemText: { fontSize: 15 },
  pickerClose: { paddingVertical: 14, alignItems: 'center', marginTop: 8 },
});
