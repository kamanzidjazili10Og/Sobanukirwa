import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, TextInput, Alert, Modal, ScrollView, Image, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../../context/AppContext';
import { useToastContext } from '../../components/Toast';
import { fetchVideos, createVideo, updateVideo, deleteVideo, getMediaUrl } from '../../services/api';
import AdminLayout, { AdminFAB, AdminEmptyState } from '../../components/admin/AdminLayout';

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
    (v.author || v.authorEn || '').toLowerCase().includes(search.toLowerCase())
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
    setFormTitleEn(video.titleEn || video.title_en || '');
    setFormTitleAr(video.titleAr || video.title_ar || '');
    setFormAuthor(video.author || '');
    setFormDesc(video.description || '');
    setFormVideo(null);
    setFormThumb(video.thumbnail || video.thumbnail_url ? { uri: getMediaUrl(video.thumbnail || video.thumbnail_url) } : null);
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
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await deleteVideo(video.id); toast.show('Video deleted', 'success'); loadVideos(); }
        catch { toast.show('Delete failed', 'error'); }
      }},
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
        {(item.thumbnail || item.thumbnail_url) ? (
          <Image source={{ uri: getMediaUrl(item.thumbnail || item.thumbnail_url) }} style={styles.thumb} />
        ) : (
          <View style={styles.thumbPlaceholder}>
            <Ionicons name="videocam" size={22} color="#F59E0B" />
          </View>
        )}
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
          {item.author ? <Text style={styles.cardSub}>{item.author}</Text> : null}
          {(item.durationStr || item.duration_str) ? <Text style={[styles.cardSub, { color: '#F59E0B' }]}>{item.durationStr || item.duration_str}</Text> : null}
        </View>
        <TouchableOpacity onPress={() => handleDelete(item)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
        </TouchableOpacity>
      </TouchableOpacity>
    </AnimatedListItem>
  );

  return (
    <AdminLayout navigation={navigation} title="Videos" subtitle={`${filtered.length} videos`}>
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="rgba(255,255,255,0.3)" />
          <TextInput style={styles.searchInput} placeholder="Search videos..." placeholderTextColor="rgba(255,255,255,0.3)" value={search} onChangeText={setSearch} />
          {search ? <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.3)" /></TouchableOpacity> : null}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#F59E0B" style={{ flex: 1 }} />
      ) : (
        <FlatList data={filtered} keyExtractor={item => String(item.id)} renderItem={renderItem} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}
          ListEmptyComponent={<AdminEmptyState icon="videocam" message="No videos found" />}
        />
      )}

      <AdminFAB onPress={openAdd} />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View style={styles.modalIconWrap}>
                  <Ionicons name="videocam" size={18} color="#F59E0B" />
                </View>
                <Text style={styles.modalTitle}>{editing ? 'Edit Video' : 'Add Video'}</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color="rgba(255,255,255,0.5)" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
              <Text style={styles.label}>Title *</Text>
              <TextInput style={styles.input} value={formTitle} onChangeText={setFormTitle} placeholder="Video title" placeholderTextColor="rgba(255,255,255,0.3)" />
              <Text style={styles.label}>Title (English)</Text>
              <TextInput style={styles.input} value={formTitleEn} onChangeText={setFormTitleEn} placeholder="English title" placeholderTextColor="rgba(255,255,255,0.3)" />
              <Text style={styles.label}>Title (Arabic)</Text>
              <TextInput style={[styles.input, { textAlign: 'right' }]} value={formTitleAr} onChangeText={setFormTitleAr} placeholder="Arabic title" placeholderTextColor="rgba(255,255,255,0.3)" />
              <Text style={styles.label}>Author</Text>
              <TextInput style={styles.input} value={formAuthor} onChangeText={setFormAuthor} placeholder="Author name" placeholderTextColor="rgba(255,255,255,0.3)" />
              <Text style={styles.label}>Description</Text>
              <TextInput style={[styles.input, styles.textArea]} value={formDesc} onChangeText={setFormDesc} placeholder="Description" placeholderTextColor="rgba(255,255,255,0.3)" multiline numberOfLines={3} />
              <TouchableOpacity style={styles.filePicker} onPress={pickVideo}>
                <Ionicons name={formVideo ? 'checkmark-circle' : 'videocam'} size={24} color={formVideo ? '#27ae60' : '#F59E0B'} />
                <Text style={{ color: formVideo ? '#27ae60' : 'rgba(255,255,255,0.6)', marginLeft: 8 }}>{formVideo ? formVideo.name || 'Video selected' : 'Pick Video File'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filePicker} onPress={pickThumb}>
                <Ionicons name={formThumb ? 'checkmark-circle' : 'image'} size={24} color={formThumb ? '#27ae60' : '#F59E0B'} />
                <Text style={{ color: formThumb ? '#27ae60' : 'rgba(255,255,255,0.6)', marginLeft: 8 }}>{formThumb ? 'Thumbnail selected' : 'Pick Thumbnail'}</Text>
              </TouchableOpacity>
              {formThumb && <Image source={{ uri: formThumb.uri }} style={styles.thumbPreview} />}
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
  searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, height: 46, gap: 10, backgroundColor: 'rgba(20,35,55,0.6)', borderColor: 'rgba(201,168,76,0.15)' },
  searchInput: { flex: 1, fontSize: 14, color: '#FFFFFF' },
  list: { padding: 12, paddingBottom: 100 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(201,168,76,0.12)', backgroundColor: 'rgba(20,35,55,0.5)', marginBottom: 10, gap: 12 },
  thumb: { width: 80, height: 52, borderRadius: 10 },
  thumbPlaceholder: { width: 80, height: 52, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(245,158,11,0.08)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.15)' },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  cardSub: { fontSize: 12, marginTop: 2, color: 'rgba(255,255,255,0.4)' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '95%', backgroundColor: '#0a1220', borderWidth: 1, borderColor: 'rgba(201,168,76,0.15)' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  modalIconWrap: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(245,158,11,0.12)' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#F59E0B' },
  modalCloseBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)' },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 14, color: 'rgba(255,255,255,0.5)' },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#FFFFFF', borderColor: 'rgba(201,168,76,0.15)', backgroundColor: 'rgba(20,35,55,0.6)', marginBottom: 4 },
  textArea: { height: 80, textAlignVertical: 'top' },
  filePicker: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderStyle: 'dashed', borderRadius: 14, padding: 18, marginTop: 14, justifyContent: 'center', borderColor: 'rgba(245,158,11,0.25)', backgroundColor: 'rgba(245,158,11,0.04)' },
  thumbPreview: { width: '100%', height: 120, borderRadius: 10, marginTop: 10, resizeMode: 'cover' },
  saveBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 8, marginBottom: 20 },
  saveBtnGradient: { paddingVertical: 15, borderRadius: 14, alignItems: 'center' },
  saveBtnText: { color: '#0a1220', fontSize: 16, fontWeight: '700' },
});
