import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, TextInput, Alert, Modal, ScrollView, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useApp } from '../../context/AppContext';
import { useToastContext } from '../../components/Toast';
import { fetchAdhkar, createAdhkar, updateAdhkar, deleteAdhkar, prepareFileForUpload } from '../../services/api';
import AdminLayout, { AdminFAB, AdminEmptyState } from '../../components/admin/AdminLayout';

const CATEGORY_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'general', label: 'General' },
  { value: 'morning', label: 'Morning' },
  { value: 'evening', label: 'Evening' },
  { value: 'sleep', label: 'Sleep' },
];

export default function AdminAdhkarScreen({ navigation }) {
  const { COLORS, t } = useApp();
  const toast = useToastContext();
  const [adhkar, setAdhkar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formArabic, setFormArabic] = useState('');
  const [formTransliteration, setFormTransliteration] = useState('');
  const [formTransRw, setFormTransRw] = useState('');
  const [formTransEn, setFormTransEn] = useState('');
  const [formCount, setFormCount] = useState('1');
  const [formCategory, setFormCategory] = useState('general');
  const [formReference, setFormReference] = useState('');
  const [formAudio, setFormAudio] = useState(null);

  const loadAdhkar = useCallback(async () => {
    try {
      const data = await fetchAdhkar(filterCategory || undefined);
      setAdhkar(Array.isArray(data) ? data : []);
    } catch { toast.show('Failed to load adhkar', 'error'); }
    setLoading(false);
  }, [filterCategory]);

  useEffect(() => { loadAdhkar(); }, [filterCategory]);

  const filtered = adhkar.filter(a =>
    (a.arabic_text || '').includes(search) ||
    (a.transliteration || '').toLowerCase().includes(search.toLowerCase()) ||
    (a.translation || '').toLowerCase().includes(search.toLowerCase()) ||
    (a.translation_rw || '').toLowerCase().includes(search.toLowerCase()) ||
    (a.translation_en || '').toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditing(null);
    setFormArabic(''); setFormTransliteration(''); setFormTransRw(''); setFormTransEn('');
    setFormCount('1'); setFormCategory('general'); setFormReference(''); setFormAudio(null);
    setModalVisible(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setFormArabic(item.arabic_text || '');
    setFormTransliteration(item.transliteration || '');
    setFormTransRw(item.translation_rw || item.translation || '');
    setFormTransEn(item.translation_en || '');
    setFormCount(String(item.count_target || 1));
    setFormCategory(item.category || 'general');
    setFormReference(item.reference || '');
    setFormAudio(null);
    setModalVisible(true);
  };

  const pickAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*' });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFormAudio(result.assets[0]);
      }
    } catch (e) {
      toast.show('Failed to pick audio', 'error');
    }
  };

  const handleSave = async () => {
    if (!formArabic.trim()) { toast.show('Arabic text is required', 'error'); return; }
    setSaving(true);
    try {
      if (formAudio) {
        const formData = new FormData();
        formData.append('arabic_text', formArabic.trim());
        formData.append('transliteration', formTransliteration.trim());
        formData.append('translation_rw', formTransRw.trim());
        formData.append('translation_en', formTransEn.trim());
        formData.append('count_target', parseInt(formCount) || 1);
        formData.append('category', formCategory);
        formData.append('reference', formReference.trim());
        if (editing) formData.append('audio_url', editing.audio_url || '');
        const ext = formAudio.name?.split('.').pop() || 'mp3';
        const audioFile = await prepareFileForUpload(formAudio, `adhkar.${ext}`, `audio/${ext}`);
        if (audioFile) formData.append('audio', audioFile);
        if (editing) { await updateAdhkar(editing.id, formData); toast.show('Adhkar updated', 'success'); }
        else { await createAdhkar(formData); toast.show('Adhkar created', 'success'); }
      } else {
        const payload = {
          arabic_text: formArabic.trim(), transliteration: formTransliteration.trim(),
          translation_rw: formTransRw.trim(), translation_en: formTransEn.trim(),
          count_target: parseInt(formCount) || 1, category: formCategory, reference: formReference.trim(),
        };
        if (editing) { await updateAdhkar(editing.id, payload); toast.show('Adhkar updated', 'success'); }
        else { await createAdhkar(payload); toast.show('Adhkar created', 'success'); }
      }
      setModalVisible(false);
      loadAdhkar();
    } catch (e) { toast.show(e.message || 'Save failed', 'error'); }
    setSaving(false);
  };

  const handleDelete = (item) => {
    Alert.alert('Delete Adhkar', 'Delete this adhkar?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await deleteAdhkar(item.id); toast.show('Deleted', 'success'); loadAdhkar(); }
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
        <View style={styles.cardTop}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.category || 'general'}</Text>
          </View>
          <Text style={styles.countBadge}>{item.count_target || 1}x</Text>
        </View>
        <Text style={styles.arabicText} numberOfLines={3}>{item.arabic_text}</Text>
        {item.transliteration ? <Text style={styles.transText} numberOfLines={1}>{item.transliteration}</Text> : null}
        {(item.translation || item.translation_rw) ? <Text style={styles.transText} numberOfLines={1}>{item.translation || item.translation_rw}</Text> : null}
        <View style={styles.cardFooter}>
          {item.reference ? <Text style={styles.refText}>{item.reference}</Text> : null}
          <TouchableOpacity onPress={() => handleDelete(item)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </AnimatedListItem>
  );

  return (
    <AdminLayout navigation={navigation} title="Adhkar" subtitle={`${filtered.length} adhkar`}>
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="rgba(255,255,255,0.3)" />
          <TextInput style={styles.searchInput} placeholder="Search adhkar..." placeholderTextColor="rgba(255,255,255,0.3)" value={search} onChangeText={setSearch} />
          {search ? <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.3)" /></TouchableOpacity> : null}
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={styles.filterContent}>
        {CATEGORY_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.filterChip, filterCategory === opt.value && styles.filterChipActive]}
            onPress={() => { setFilterCategory(opt.value); setLoading(true); }}
          >
            <Text style={[styles.filterChipText, filterCategory === opt.value && styles.filterChipTextActive]}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator size="large" color="#F59E0B" style={{ flex: 1 }} />
      ) : (
        <FlatList data={filtered} keyExtractor={item => String(item.id)} renderItem={renderItem} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}
          ListEmptyComponent={<AdminEmptyState icon="text" message="No adhkar found" />}
        />
      )}

      <AdminFAB onPress={openAdd} />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View style={styles.modalIconWrap}><Ionicons name="text" size={18} color="#F59E0B" /></View>
                <Text style={styles.modalTitle}>{editing ? 'Edit Adhkar' : 'Add Adhkar'}</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color="rgba(255,255,255,0.5)" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
              <Text style={styles.label}>Arabic Text *</Text>
              <TextInput style={[styles.input, styles.arabicInput]} value={formArabic} onChangeText={setFormArabic} placeholder="Arabic text" placeholderTextColor="rgba(255,255,255,0.3)" multiline textAlign="right" />
              <Text style={styles.label}>Transliteration</Text>
              <TextInput style={styles.input} value={formTransliteration} onChangeText={setFormTransliteration} placeholder="Transliteration" placeholderTextColor="rgba(255,255,255,0.3)" />
              <Text style={styles.label}>Translation (Kinyarwanda)</Text>
              <TextInput style={styles.input} value={formTransRw} onChangeText={setFormTransRw} placeholder="Kinyarwanda translation" placeholderTextColor="rgba(255,255,255,0.3)" />
              <Text style={styles.label}>Translation (English)</Text>
              <TextInput style={styles.input} value={formTransEn} onChangeText={setFormTransEn} placeholder="English translation" placeholderTextColor="rgba(255,255,255,0.3)" />
              <Text style={styles.label}>Count Target</Text>
              <TextInput style={styles.input} value={formCount} onChangeText={setFormCount} placeholder="1" keyboardType="numeric" placeholderTextColor="rgba(255,255,255,0.3)" />
              <Text style={styles.label}>Category</Text>
              <View style={styles.categoryRow}>
                {CATEGORY_OPTIONS.filter(c => c.value).map(opt => (
                  <TouchableOpacity key={opt.value} style={[styles.catChip, formCategory === opt.value && styles.catChipActive]} onPress={() => setFormCategory(opt.value)}>
                    <Text style={[styles.catChipText, formCategory === opt.value && styles.catChipTextActive]}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.label}>Reference</Text>
              <TextInput style={styles.input} value={formReference} onChangeText={setFormReference} placeholder="e.g. Sahih Bukhari" placeholderTextColor="rgba(255,255,255,0.3)" />
              <Text style={styles.label}>Audio Sound</Text>
              <TouchableOpacity style={styles.audioPickBtn} onPress={pickAudio}>
                <Ionicons name={formAudio ? "musical-notes" : "cloud-upload-outline"} size={20} color="#F59E0B" />
                <Text style={styles.audioPickText} numberOfLines={1}>
                  {formAudio ? (formAudio.name || 'Audio selected') : (editing?.audio_url ? 'Replace current audio' : 'Pick audio file')}
                </Text>
                {formAudio && <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.4)" onPress={() => setFormAudio(null)} />}
              </TouchableOpacity>
              {editing?.audio_url && !formAudio && (
                <Text style={styles.audioCurrent}>Current: {editing.audio_url.split('/').pop()}</Text>
              )}
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
  filterRow: { paddingHorizontal: 12, maxHeight: 52 },
  filterContent: { gap: 8, paddingVertical: 10 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(201,168,76,0.15)', backgroundColor: 'rgba(20,35,55,0.5)' },
  filterChipActive: { backgroundColor: 'rgba(245,158,11,0.15)', borderColor: 'rgba(245,158,11,0.3)' },
  filterChipText: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.5)' },
  filterChipTextActive: { color: '#F59E0B' },
  list: { padding: 12, paddingBottom: 100 },
  card: { padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(201,168,76,0.12)', backgroundColor: 'rgba(20,35,55,0.5)', marginBottom: 10 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  badge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, backgroundColor: 'rgba(245,158,11,0.12)' },
  badgeText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', color: '#F59E0B' },
  countBadge: { fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.5)' },
  arabicText: { fontSize: 19, lineHeight: 32, marginBottom: 6, textAlign: 'right', color: '#FFFFFF' },
  transText: { fontSize: 13, marginTop: 3, color: 'rgba(255,255,255,0.5)' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  refText: { fontSize: 11, fontStyle: 'italic', color: 'rgba(255,255,255,0.3)' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '95%', backgroundColor: '#0a1220', borderWidth: 1, borderColor: 'rgba(201,168,76,0.15)' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  modalIconWrap: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(245,158,11,0.12)' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#F59E0B' },
  modalCloseBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)' },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 14, color: 'rgba(255,255,255,0.5)' },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#FFFFFF', borderColor: 'rgba(201,168,76,0.15)', backgroundColor: 'rgba(20,35,55,0.6)', marginBottom: 4 },
  arabicInput: { fontSize: 18, minHeight: 60, textAlignVertical: 'top' },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(201,168,76,0.15)', backgroundColor: 'rgba(20,35,55,0.5)' },
  catChipActive: { backgroundColor: 'rgba(245,158,11,0.15)', borderColor: 'rgba(245,158,11,0.3)' },
  catChipText: { fontSize: 13, color: 'rgba(255,255,255,0.5)' },
  catChipTextActive: { color: '#F59E0B' },
  saveBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 8, marginBottom: 20 },
  saveBtnGradient: { paddingVertical: 15, borderRadius: 14, alignItems: 'center' },
  saveBtnText: { color: '#0a1220', fontSize: 16, fontWeight: '700' },
  audioPickBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, borderColor: 'rgba(245,158,11,0.3)', backgroundColor: 'rgba(245,158,11,0.05)' },
  audioPickText: { flex: 1, fontSize: 14, color: 'rgba(255,255,255,0.6)' },
  audioCurrent: { fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4, fontStyle: 'italic' },
});
