import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView,
  ActivityIndicator, TextInput, Alert, Modal, ScrollView, Image, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../../context/AppContext';
import { useToastContext } from '../../components/Toast';
import { fetchArtists, createArtist, updateArtist, deleteArtist, getMediaUrl } from '../../services/api';

export default function AdminArtistsScreen({ navigation }) {
  const { COLORS, t } = useApp();
  const toast = useToastContext();
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formName, setFormName] = useState('');
  const [formNameEn, setFormNameEn] = useState('');
  const [formNameAr, setFormNameAr] = useState('');
  const [formBio, setFormBio] = useState('');
  const [formImage, setFormImage] = useState(null);

  const loadArtists = useCallback(async () => {
    try {
      const data = await fetchArtists();
      setArtists(Array.isArray(data) ? data : []);
    } catch { toast.show('Failed to load artists', 'error'); }
    setLoading(false);
  }, []);

  useEffect(() => { loadArtists(); }, []);

  const filtered = artists.filter(a =>
    (a.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (a.name_en || '').toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditing(null);
    setFormName(''); setFormNameEn(''); setFormNameAr(''); setFormBio(''); setFormImage(null);
    setModalVisible(true);
  };

  const openEdit = (artist) => {
    setEditing(artist);
    setFormName(artist.name || '');
    setFormNameEn(artist.name_en || '');
    setFormNameAr(artist.name_ar || '');
    setFormBio(artist.bio || '');
    setFormImage(artist.image_url ? { uri: getMediaUrl(artist.image_url) } : null);
    setModalVisible(true);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!result.canceled) setFormImage(result.assets[0]);
  };

  const handleSave = async () => {
    if (!formName.trim()) { toast.show('Name is required', 'error'); return; }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', formName.trim());
      if (formNameEn) formData.append('name_en', formNameEn.trim());
      if (formNameAr) formData.append('name_ar', formNameAr.trim());
      if (formBio) formData.append('bio', formBio.trim());
      if (formImage && formImage.uri) {
        formData.append('image', { uri: formImage.uri, name: 'artist.jpg', type: 'image/jpeg' });
      }
      if (editing) {
        await updateArtist(editing.id, formData);
        toast.show('Artist updated', 'success');
      } else {
        await createArtist(formData);
        toast.show('Artist created', 'success');
      }
      setModalVisible(false);
      loadArtists();
    } catch (e) { toast.show(e.message || 'Save failed', 'error'); }
    setSaving(false);
  };

  const handleDelete = (artist) => {
    Alert.alert('Delete Artist', `Delete "${artist.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try { await deleteArtist(artist.id); toast.show('Artist deleted', 'success'); loadArtists(); }
          catch { toast.show('Delete failed', 'error'); }
        }
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={[styles.card, { backgroundColor: 'rgba(20,35,55,0.7)', borderColor: 'rgba(201,168,76,0.2)' }]} onPress={() => openEdit(item)} onLongPress={() => handleDelete(item)}>
      {item.image_url ? (
        <Image source={{ uri: getMediaUrl(item.image_url) }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: 'rgba(201,168,76,0.15)' }]}>
          <Ionicons name="person" size={28} color={COLORS.secondary} />
        </View>
      )}
      <View style={styles.cardInfo}>
        <Text style={[styles.cardTitle, { color: COLORS.text }]} numberOfLines={1}>{item.name}</Text>
        {item.name_en ? <Text style={[styles.cardSub, { color: COLORS.textMuted }]} numberOfLines={1}>{item.name_en}</Text> : null}
        <Text style={[styles.cardBadge, { color: COLORS.secondary }]}>{item.tracks_count ?? item.track_count ?? 0} tracks</Text>
      </View>
      <TouchableOpacity onPress={() => handleDelete(item)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Ionicons name="trash-outline" size={20} color={COLORS.error || '#e74c3c'} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.navigate('AdminDashboard')} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textGold} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: COLORS.textGold }]}>Artists</Text>
        <View style={{ width: 36 }} />
      </View>
      <View style={styles.searchRow}>
        <View style={[styles.searchBar, { backgroundColor: 'rgba(20,35,55,0.7)', borderColor: 'rgba(201,168,76,0.2)' }]}>
          <Ionicons name="search" size={18} color={COLORS.textMuted} />
          <TextInput style={[styles.searchInput, { color: COLORS.text }]} placeholder="Search artists..." placeholderTextColor={COLORS.textMuted} value={search} onChangeText={setSearch} />
          {search ? <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={18} color={COLORS.textMuted} /></TouchableOpacity> : null}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.secondary} style={{ flex: 1 }} />
      ) : (
        <FlatList data={filtered} keyExtractor={item => String(item.id)} renderItem={renderItem} contentContainerStyle={styles.list} ListEmptyComponent={<Text style={[styles.empty, { color: COLORS.textMuted }]}>No artists found</Text>} />
      )}

      <TouchableOpacity style={[styles.fab, { backgroundColor: COLORS.secondary }]} onPress={openAdd}>
        <Ionicons name="add" size={28} color="#0a1220" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: '#0a1220', borderColor: 'rgba(201,168,76,0.2)' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: COLORS.textGold }]}>{editing ? 'Edit Artist' : 'Add Artist'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><Ionicons name="close" size={24} color={COLORS.textMuted} /></TouchableOpacity>
            </View>
            <ScrollView>
              <Text style={[styles.label, { color: COLORS.textMuted }]}>Name *</Text>
              <TextInput style={[styles.input, { color: COLORS.text, borderColor: 'rgba(201,168,76,0.2)', backgroundColor: 'rgba(20,35,55,0.7)' }]} value={formName} onChangeText={setFormName} placeholder="Artist name" placeholderTextColor={COLORS.textMuted} />

              <Text style={[styles.label, { color: COLORS.textMuted }]}>Name (English)</Text>
              <TextInput style={[styles.input, { color: COLORS.text, borderColor: 'rgba(201,168,76,0.2)', backgroundColor: 'rgba(20,35,55,0.7)' }]} value={formNameEn} onChangeText={setFormNameEn} placeholder="English name" placeholderTextColor={COLORS.textMuted} />

              <Text style={[styles.label, { color: COLORS.textMuted }]}>Name (Arabic)</Text>
              <TextInput style={[styles.input, { color: COLORS.text, borderColor: 'rgba(201,168,76,0.2)', backgroundColor: 'rgba(20,35,55,0.7)', textAlign: 'right' }]} value={formNameAr} onChangeText={setFormNameAr} placeholder="Arabic name" placeholderTextColor={COLORS.textMuted} />

              <Text style={[styles.label, { color: COLORS.textMuted }]}>Bio</Text>
              <TextInput style={[styles.input, styles.textArea, { color: COLORS.text, borderColor: 'rgba(201,168,76,0.2)', backgroundColor: 'rgba(20,35,55,0.7)' }]} value={formBio} onChangeText={setFormBio} placeholder="Bio" placeholderTextColor={COLORS.textMuted} multiline numberOfLines={3} />

              <TouchableOpacity style={[styles.imagePicker, { borderColor: 'rgba(201,168,76,0.2)' }]} onPress={pickImage}>
                {formImage ? (
                  <Image source={{ uri: formImage.uri }} style={styles.imagePreview} />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="camera" size={32} color={COLORS.secondary} />
                    <Text style={[styles.imagePlaceholderText, { color: COLORS.textMuted }]}>Pick Image</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: COLORS.secondary }]} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator color="#0a1220" /> : <Text style={styles.saveBtnText}>{editing ? 'Update' : 'Create'}</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  list: { padding: 12, paddingBottom: 80 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 10, gap: 12 },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  avatarPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '600' },
  cardSub: { fontSize: 12, marginTop: 2 },
  cardBadge: { fontSize: 12, marginTop: 4, fontWeight: '600' },
  empty: { textAlign: 'center', marginTop: 60, fontSize: 15 },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '85%', borderWidth: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, marginBottom: 4 },
  textArea: { height: 80, textAlignVertical: 'top' },
  imagePicker: { height: 160, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', overflow: 'hidden', marginTop: 12, marginBottom: 16 },
  imagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  imagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  imagePlaceholderText: { fontSize: 13, marginTop: 6 },
  saveBtn: { paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
  saveBtnText: { color: '#0a1220', fontSize: 16, fontWeight: '700' },
});
