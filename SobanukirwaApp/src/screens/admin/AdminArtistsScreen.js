import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, TextInput, Alert, Modal, ScrollView, Image, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../../context/AppContext';
import { useToastContext } from '../../components/Toast';
import { fetchArtists, createArtist, updateArtist, deleteArtist, getMediaUrl } from '../../services/api';
import AdminLayout, { AdminFAB, AdminEmptyState } from '../../components/admin/AdminLayout';

export default function AdminArtistsScreen({ navigation }) {
  const { COLORS, t, refreshData } = useApp();
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
      refreshData().catch(() => {});
    } catch (e) { toast.show(e.message || 'Save failed', 'error'); }
    setSaving(false);
  };

  const handleDelete = (artist) => {
    Alert.alert('Delete Artist', `Delete "${artist.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try { await deleteArtist(artist.id); toast.show('Artist deleted', 'success'); loadArtists(); refreshData().catch(() => {}); }
          catch { toast.show('Delete failed', 'error'); }
        }
      },
    ]);
  };

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
        {item.image_url ? (
          <Image source={{ uri: getMediaUrl(item.image_url) }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={26} color="#F59E0B" />
          </View>
        )}
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
          {item.name_en ? <Text style={styles.cardSub} numberOfLines={1}>{item.name_en}</Text> : null}
          <Text style={styles.cardBadge}>{item.tracks_count ?? item.track_count ?? 0} tracks</Text>
        </View>
        <TouchableOpacity onPress={() => handleDelete(item)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
        </TouchableOpacity>
      </TouchableOpacity>
    </AnimatedListItem>
  );

  return (
    <AdminLayout navigation={navigation} title="Artists" subtitle={`${filtered.length} artists`}>
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="rgba(255,255,255,0.3)" />
          <TextInput style={styles.searchInput} placeholder="Search artists..." placeholderTextColor="rgba(255,255,255,0.3)" value={search} onChangeText={setSearch} />
          {search ? <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.3)" /></TouchableOpacity> : null}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#F59E0B" style={{ flex: 1 }} />
      ) : (
        <FlatList data={filtered} keyExtractor={item => String(item.id)} renderItem={renderItem} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}
          ListEmptyComponent={<AdminEmptyState icon="people" message="No artists found" />}
        />
      )}

      <AdminFAB onPress={openAdd} />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View style={styles.modalIconWrap}>
                  <Ionicons name="person" size={18} color="#F59E0B" />
                </View>
                <Text style={styles.modalTitle}>{editing ? 'Edit Artist' : 'Add Artist'}</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color="rgba(255,255,255,0.5)" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
              <Text style={styles.label}>Name *</Text>
              <TextInput style={styles.input} value={formName} onChangeText={setFormName} placeholder="Artist name" placeholderTextColor="rgba(255,255,255,0.3)" />

              <Text style={styles.label}>Name (English)</Text>
              <TextInput style={styles.input} value={formNameEn} onChangeText={setFormNameEn} placeholder="English name" placeholderTextColor="rgba(255,255,255,0.3)" />

              <Text style={styles.label}>Name (Arabic)</Text>
              <TextInput style={[styles.input, { textAlign: 'right' }]} value={formNameAr} onChangeText={setFormNameAr} placeholder="Arabic name" placeholderTextColor="rgba(255,255,255,0.3)" />

              <Text style={styles.label}>Bio</Text>
              <TextInput style={[styles.input, styles.textArea]} value={formBio} onChangeText={setFormBio} placeholder="Bio" placeholderTextColor="rgba(255,255,255,0.3)" multiline numberOfLines={3} />

              <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                {formImage ? (
                  <Image source={{ uri: formImage.uri }} style={styles.imagePreview} />
                ) : (
                  <View style={styles.imagePlaceholderContent}>
                    <Ionicons name="camera" size={32} color="#F59E0B" />
                    <Text style={styles.imagePlaceholderText}>Pick Image</Text>
                  </View>
                )}
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
    marginBottom: 10, gap: 14,
  },
  avatar: { width: 54, height: 54, borderRadius: 27 },
  avatarPlaceholder: {
    width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(245,158,11,0.1)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)',
  },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  cardSub: { fontSize: 12, marginTop: 2, color: 'rgba(255,255,255,0.4)' },
  cardBadge: { fontSize: 12, marginTop: 4, fontWeight: '600', color: '#14B8A6' },

  /* Modal */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '95%',
    backgroundColor: '#0a1220', borderWidth: 1, borderColor: 'rgba(201,168,76,0.15)',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
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
  imagePicker: {
    height: 160, borderRadius: 14, borderWidth: 1, borderStyle: 'dashed',
    borderColor: 'rgba(245,158,11,0.25)', overflow: 'hidden', marginTop: 12, marginBottom: 16,
    backgroundColor: 'rgba(245,158,11,0.04)',
  },
  imagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  imagePlaceholderContent: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  imagePlaceholderText: { fontSize: 13, marginTop: 6, color: 'rgba(255,255,255,0.4)' },
  saveBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 8, marginBottom: 20 },
  saveBtnGradient: { paddingVertical: 15, borderRadius: 14, alignItems: 'center' },
  saveBtnText: { color: '#0a1220', fontSize: 16, fontWeight: '700' },
});
