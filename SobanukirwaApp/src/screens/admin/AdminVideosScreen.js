import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView,
  ActivityIndicator, TextInput, Alert, Modal, ScrollView, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../../context/AppContext';
import { useToastContext } from '../../components/Toast';
import { fetchVideos, createVideo, updateVideo, deleteVideo, getMediaUrl } from '../../services/api';

export default function AdminVideosScreen({ navigation }) {
  const { COLORS, t } = useApp();
  const toast = useToastContext();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formTitle, setFormTitle] = useState('');
  const [formTitleEn, setFormTitleEn] = useState('');
  const [formTitleAr, setFormTitleAr] = useState('');
  const [formAuthor, setFormAuthor] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formVideo, setFormVideo] = useState(null);
  const [formThumb, setFormThumb] = useState(null);

  const loadVideos = useCallback(async () => {
    try {
      const data = await fetchVideos();
      setVideos(Array.isArray(data) ? data : []);
    } catch { toast.show('Failed to load videos', 'error'); }
    setLoading(false);
  }, []);

  useEffect(() => { loadVideos(); }, []);

  const filtered = videos.filter(v =>
    (v.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (v.author || '').toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditing(null);
    setFormTitle(''); setFormTitleEn(''); setFormTitleAr('');
    setFormAuthor(''); setFormDesc(''); setFormVideo(null); setFormThumb(null);
    setModalVisible(true);
  };

  const openEdit = (video) => {
    setEditing(video);
    setFormTitle(video.title || '');
    setFormTitleEn(video.title_en || '');
    setFormTitleAr(video.title_ar || '');
    setFormAuthor(video.author || '');
    setFormDesc(video.description || '');
    setFormVideo(null);
    setFormThumb(video.thumbnail ? { uri: getMediaUrl(video.thumbnail) } : null);
    setModalVisible(true);
  };

  const pickVideo = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'video/*' });
    if (!result.canceled) setFormVideo(result.assets[0]);
  };

  const pickThumb = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!result.canceled) setFormThumb(result.assets[0]);
  };

  const handleSave = async () => {
    if (!formTitle.trim()) { toast.show('Title is required', 'error'); return; }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', formTitle.trim());
      if (formTitleEn) formData.append('title_en', formTitleEn.trim());
      if (formTitleAr) formData.append('title_ar', formTitleAr.trim());
      if (formAuthor) formData.append('author', formAuthor.trim());
      if (formDesc) formData.append('description', formDesc.trim());
      if (formVideo) {
        const ext = formVideo.name?.split('.').pop() || 'mp4';
        formData.append('video', { uri: formVideo.uri, name: `video.${ext}`, type: `video/${ext}` });
      }
      if (formThumb) {
        formData.append('thumbnail', { uri: formThumb.uri, name: 'thumb.jpg', type: 'image/jpeg' });
      }
      if (editing) {
        await updateVideo(editing.id, formData);
        toast.show('Video updated', 'success');
      } else {
        await createVideo(formData);
        toast.show('Video created', 'success');
      }
      setModalVisible(false);
      loadVideos();
    } catch (e) { toast.show(e.message || 'Save failed', 'error'); }
    setSaving(false);
  };

  const handleDelete = (video) => {
    Alert.alert('Delete Video', `Delete "${video.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try { await deleteVideo(video.id); toast.show('Video deleted', 'success'); loadVideos(); }
          catch { toast.show('Delete failed', 'error'); }
        }
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={[styles.card, { backgroundColor: 'rgba(20,35,55,0.7)', borderColor: 'rgba(201,168,76,0.2)' }]} onPress={() => openEdit(item)} onLongPress={() => handleDelete(item)}>
      {item.thumbnail ? (
        <Image source={{ uri: getMediaUrl(item.thumbnail) }} style={styles.thumb} />
      ) : (
        <View style={[styles.thumb, styles.thumbPlaceholder, { backgroundColor: 'rgba(201,168,76,0.1)' }]}>
          <Ionicons name="videocam" size={24} color={COLORS.secondary} />
        </View>
      )}
      <View style={styles.cardInfo}>
        <Text style={[styles.cardTitle, { color: COLORS.text }]} numberOfLines={2}>{item.title}</Text>
        {item.author ? <Text style={[styles.cardSub, { color: COLORS.textMuted }]}>{item.author}</Text> : null}
        {item.duration ? <Text style={[styles.cardSub, { color: COLORS.textMuted }]}>{item.duration}</Text> : null}
      </View>
      <TouchableOpacity onPress={() => handleDelete(item)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Ionicons name="trash-outline" size={18} color={COLORS.error || '#e74c3c'} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.navigate('AdminDashboard')} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textGold} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: COLORS.textGold }]}>Videos</Text>
        <View style={{ width: 36 }} />
      </View>
      <View style={styles.searchRow}>
        <View style={[styles.searchBar, { backgroundColor: 'rgba(20,35,55,0.7)', borderColor: 'rgba(201,168,76,0.2)' }]}>
          <Ionicons name="search" size={18} color={COLORS.textMuted} />
          <TextInput style={[styles.searchInput, { color: COLORS.text }]} placeholder="Search videos..." placeholderTextColor={COLORS.textMuted} value={search} onChangeText={setSearch} />
          {search ? <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={18} color={COLORS.textMuted} /></TouchableOpacity> : null}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.secondary} style={{ flex: 1 }} />
      ) : (
        <FlatList data={filtered} keyExtractor={item => String(item.id)} renderItem={renderItem} contentContainerStyle={styles.list} ListEmptyComponent={<Text style={[styles.empty, { color: COLORS.textMuted }]}>No videos found</Text>} />
      )}

      <TouchableOpacity style={[styles.fab, { backgroundColor: COLORS.secondary }]} onPress={openAdd}>
        <Ionicons name="add" size={28} color="#0a1220" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: '#0a1220', borderColor: 'rgba(201,168,76,0.2)' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: COLORS.textGold }]}>{editing ? 'Edit Video' : 'Add Video'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><Ionicons name="close" size={24} color={COLORS.textMuted} /></TouchableOpacity>
            </View>
            <ScrollView>
              <Text style={[styles.label, { color: COLORS.textMuted }]}>Title *</Text>
              <TextInput style={[styles.input, { color: COLORS.text, borderColor: 'rgba(201,168,76,0.2)', backgroundColor: 'rgba(20,35,55,0.7)' }]} value={formTitle} onChangeText={setFormTitle} placeholder="Video title" placeholderTextColor={COLORS.textMuted} />

              <Text style={[styles.label, { color: COLORS.textMuted }]}>Title (English)</Text>
              <TextInput style={[styles.input, { color: COLORS.text, borderColor: 'rgba(201,168,76,0.2)', backgroundColor: 'rgba(20,35,55,0.7)' }]} value={formTitleEn} onChangeText={setFormTitleEn} placeholder="English title" placeholderTextColor={COLORS.textMuted} />

              <Text style={[styles.label, { color: COLORS.textMuted }]}>Title (Arabic)</Text>
              <TextInput style={[styles.input, { color: COLORS.text, borderColor: 'rgba(201,168,76,0.2)', backgroundColor: 'rgba(20,35,55,0.7)', textAlign: 'right' }]} value={formTitleAr} onChangeText={setFormTitleAr} placeholder="Arabic title" placeholderTextColor={COLORS.textMuted} />

              <Text style={[styles.label, { color: COLORS.textMuted }]}>Author</Text>
              <TextInput style={[styles.input, { color: COLORS.text, borderColor: 'rgba(201,168,76,0.2)', backgroundColor: 'rgba(20,35,55,0.7)' }]} value={formAuthor} onChangeText={setFormAuthor} placeholder="Author name" placeholderTextColor={COLORS.textMuted} />

              <Text style={[styles.label, { color: COLORS.textMuted }]}>Description</Text>
              <TextInput style={[styles.input, styles.textArea, { color: COLORS.text, borderColor: 'rgba(201,168,76,0.2)', backgroundColor: 'rgba(20,35,55,0.7)' }]} value={formDesc} onChangeText={setFormDesc} placeholder="Description" placeholderTextColor={COLORS.textMuted} multiline numberOfLines={3} />

              <TouchableOpacity style={[styles.filePicker, { borderColor: 'rgba(201,168,76,0.2)' }]} onPress={pickVideo}>
                <Ionicons name={formVideo ? 'checkmark-circle' : 'videocam'} size={24} color={formVideo ? '#27ae60' : COLORS.secondary} />
                <Text style={{ color: formVideo ? '#27ae60' : COLORS.text, marginLeft: 8 }}>{formVideo ? formVideo.name || 'Video selected' : 'Pick Video File'}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.filePicker, { borderColor: 'rgba(201,168,76,0.2)' }]} onPress={pickThumb}>
                <Ionicons name={formThumb ? 'checkmark-circle' : 'image'} size={24} color={formThumb ? '#27ae60' : COLORS.secondary} />
                <Text style={{ color: formThumb ? '#27ae60' : COLORS.text, marginLeft: 8 }}>{formThumb ? 'Thumbnail selected' : 'Pick Thumbnail'}</Text>
              </TouchableOpacity>

              {formThumb && <Image source={{ uri: formThumb.uri }} style={styles.thumbPreview} />}

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
  card: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 12, borderWidth: 1, marginBottom: 10, gap: 12 },
  thumb: { width: 80, height: 50, borderRadius: 8 },
  thumbPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '600' },
  cardSub: { fontSize: 12, marginTop: 2 },
  empty: { textAlign: 'center', marginTop: 60, fontSize: 15 },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 6 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '90%', borderWidth: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14 },
  textArea: { height: 80, textAlignVertical: 'top' },
  filePicker: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderStyle: 'dashed', borderRadius: 12, padding: 16, marginTop: 12, justifyContent: 'center' },
  thumbPreview: { width: '100%', height: 120, borderRadius: 8, marginTop: 10, resizeMode: 'cover' },
  saveBtn: { paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 16, marginBottom: 20 },
  saveBtnText: { color: '#0a1220', fontSize: 16, fontWeight: '700' },
});
