import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView,
  ActivityIndicator, TextInput, Alert, Modal, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { useToastContext } from '../../components/Toast';
import { fetchAdhkar, createAdhkar, updateAdhkar, deleteAdhkar } from '../../services/api';

const CATEGORY_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'general', label: 'General' },
  { value: 'morning', label: 'Morning' },
  { value: 'evening', label: 'Evening' },
  { value: 'sleep', label: 'Sleep' },
];

export default function AdminAdhkarScreen() {
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
    setFormCount('1'); setFormCategory('general'); setFormReference('');
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
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formArabic.trim()) { toast.show('Arabic text is required', 'error'); return; }
    setSaving(true);
    try {
      const payload = {
        arabic_text: formArabic.trim(),
        transliteration: formTransliteration.trim(),
        translation_rw: formTransRw.trim(),
        translation_en: formTransEn.trim(),
        count_target: parseInt(formCount) || 1,
        category: formCategory,
        reference: formReference.trim(),
      };
      if (editing) {
        await updateAdhkar(editing.id, payload);
        toast.show('Adhkar updated', 'success');
      } else {
        await createAdhkar(payload);
        toast.show('Adhkar created', 'success');
      }
      setModalVisible(false);
      loadAdhkar();
    } catch (e) { toast.show(e.message || 'Save failed', 'error'); }
    setSaving(false);
  };

  const handleDelete = (item) => {
    Alert.alert('Delete Adhkar', 'Delete this adhkar?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try { await deleteAdhkar(item.id); toast.show('Deleted', 'success'); loadAdhkar(); }
          catch { toast.show('Delete failed', 'error'); }
        }
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={[styles.card, { backgroundColor: 'rgba(20,35,55,0.7)', borderColor: 'rgba(201,168,76,0.2)' }]} onPress={() => openEdit(item)} onLongPress={() => handleDelete(item)}>
      <View style={styles.cardTop}>
        <View style={[styles.badge, { backgroundColor: COLORS.secondary + '22' }]}>
          <Text style={[styles.badgeText, { color: COLORS.secondary }]}>{item.category || 'general'}</Text>
        </View>
        <Text style={[styles.countBadge, { color: COLORS.textMuted }]}>{item.count_target || 1}x</Text>
      </View>
      <Text style={[styles.arabicText, { color: COLORS.text }]} numberOfLines={3}>{item.arabic_text}</Text>
      {item.transliteration ? <Text style={[styles.transText, { color: COLORS.textMuted }]} numberOfLines={1}>{item.transliteration}</Text> : null}
      {(item.translation || item.translation_rw) ? <Text style={[styles.transText, { color: COLORS.textMuted }]} numberOfLines={1}>{item.translation || item.translation_rw}</Text> : null}
      <View style={styles.cardFooter}>
        {item.reference ? <Text style={[styles.refText, { color: COLORS.textMuted }]}>{item.reference}</Text> : null}
        <TouchableOpacity onPress={() => handleDelete(item)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="trash-outline" size={18} color={COLORS.error || '#e74c3c'} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      <View style={styles.searchRow}>
        <View style={[styles.searchBar, { backgroundColor: 'rgba(20,35,55,0.7)', borderColor: 'rgba(201,168,76,0.2)' }]}>
          <Ionicons name="search" size={18} color={COLORS.textMuted} />
          <TextInput style={[styles.searchInput, { color: COLORS.text }]} placeholder="Search adhkar..." placeholderTextColor={COLORS.textMuted} value={search} onChangeText={setSearch} />
          {search ? <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={18} color={COLORS.textMuted} /></TouchableOpacity> : null}
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={styles.filterContent}>
        {CATEGORY_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.filterChip, { borderColor: 'rgba(201,168,76,0.2)', backgroundColor: filterCategory === opt.value ? COLORS.secondary + '22' : 'rgba(20,35,55,0.7)' }]}
            onPress={() => { setFilterCategory(opt.value); setLoading(true); }}
          >
            <Text style={{ color: filterCategory === opt.value ? COLORS.secondary : COLORS.text, fontSize: 13, fontWeight: '600' }}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.secondary} style={{ flex: 1 }} />
      ) : (
        <FlatList data={filtered} keyExtractor={item => String(item.id)} renderItem={renderItem} contentContainerStyle={styles.list} ListEmptyComponent={<Text style={[styles.empty, { color: COLORS.textMuted }]}>No adhkar found</Text>} />
      )}

      <TouchableOpacity style={[styles.fab, { backgroundColor: COLORS.secondary }]} onPress={openAdd}>
        <Ionicons name="add" size={28} color="#0a1220" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: '#0a1220', borderColor: 'rgba(201,168,76,0.2)' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: COLORS.textGold }]}>{editing ? 'Edit Adhkar' : 'Add Adhkar'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><Ionicons name="close" size={24} color={COLORS.textMuted} /></TouchableOpacity>
            </View>
            <ScrollView>
              <Text style={[styles.label, { color: COLORS.textMuted }]}>Arabic Text *</Text>
              <TextInput style={[styles.input, styles.arabicInput, { color: COLORS.text, borderColor: 'rgba(201,168,76,0.2)', backgroundColor: 'rgba(20,35,55,0.7)' }]} value={formArabic} onChangeText={setFormArabic} placeholder="Arabic text" placeholderTextColor={COLORS.textMuted} multiline textAlign="right" />

              <Text style={[styles.label, { color: COLORS.textMuted }]}>Transliteration</Text>
              <TextInput style={[styles.input, { color: COLORS.text, borderColor: 'rgba(201,168,76,0.2)', backgroundColor: 'rgba(20,35,55,0.7)' }]} value={formTransliteration} onChangeText={setFormTransliteration} placeholder="Transliteration" placeholderTextColor={COLORS.textMuted} />

              <Text style={[styles.label, { color: COLORS.textMuted }]}>Translation (Kinyarwanda)</Text>
              <TextInput style={[styles.input, { color: COLORS.text, borderColor: 'rgba(201,168,76,0.2)', backgroundColor: 'rgba(20,35,55,0.7)' }]} value={formTransRw} onChangeText={setFormTransRw} placeholder="Kinyarwanda translation" placeholderTextColor={COLORS.textMuted} />

              <Text style={[styles.label, { color: COLORS.textMuted }]}>Translation (English)</Text>
              <TextInput style={[styles.input, { color: COLORS.text, borderColor: 'rgba(201,168,76,0.2)', backgroundColor: 'rgba(20,35,55,0.7)' }]} value={formTransEn} onChangeText={setFormTransEn} placeholder="English translation" placeholderTextColor={COLORS.textMuted} />

              <Text style={[styles.label, { color: COLORS.textMuted }]}>Count Target</Text>
              <TextInput style={[styles.input, { color: COLORS.text, borderColor: 'rgba(201,168,76,0.2)', backgroundColor: 'rgba(20,35,55,0.7)' }]} value={formCount} onChangeText={setFormCount} placeholder="1" keyboardType="numeric" placeholderTextColor={COLORS.textMuted} />

              <Text style={[styles.label, { color: COLORS.textMuted }]}>Category</Text>
              <View style={styles.categoryRow}>
                {CATEGORY_OPTIONS.filter(c => c.value).map(opt => (
                  <TouchableOpacity key={opt.value} style={[styles.catChip, { borderColor: 'rgba(201,168,76,0.2)', backgroundColor: formCategory === opt.value ? COLORS.secondary + '22' : 'transparent' }]} onPress={() => setFormCategory(opt.value)}>
                    <Text style={{ color: formCategory === opt.value ? COLORS.secondary : COLORS.text, fontSize: 13 }}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { color: COLORS.textMuted }]}>Reference</Text>
              <TextInput style={[styles.input, { color: COLORS.text, borderColor: 'rgba(201,168,76,0.2)', backgroundColor: 'rgba(20,35,55,0.7)' }]} value={formReference} onChangeText={setFormReference} placeholder="e.g. Sahih Bukhari" placeholderTextColor={COLORS.textMuted} />

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
  searchRow: { padding: 12, paddingBottom: 0 },
  searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, height: 44, gap: 8 },
  searchInput: { flex: 1, fontSize: 14 },
  filterRow: { paddingHorizontal: 12, maxHeight: 52 },
  filterContent: { gap: 8, paddingVertical: 10 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  list: { padding: 12, paddingBottom: 80 },
  card: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 10 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  countBadge: { fontSize: 13, fontWeight: '700' },
  arabicText: { fontSize: 18, lineHeight: 30, marginBottom: 6, textAlign: 'right' },
  transText: { fontSize: 13, marginTop: 2 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  refText: { fontSize: 11, fontStyle: 'italic' },
  empty: { textAlign: 'center', marginTop: 60, fontSize: 15 },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 6 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '90%', borderWidth: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14 },
  arabicInput: { fontSize: 18, minHeight: 60, textAlignVertical: 'top' },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  saveBtn: { paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 16, marginBottom: 20 },
  saveBtnText: { color: '#0a1220', fontSize: 16, fontWeight: '700' },
});
