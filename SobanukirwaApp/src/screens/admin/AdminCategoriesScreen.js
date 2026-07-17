import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, TextInput, Alert, Modal, ScrollView, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { useToastContext } from '../../components/Toast';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../../services/api';
import AdminLayout, { AdminFAB, AdminEmptyState } from '../../components/admin/AdminLayout';

export default function AdminCategoriesScreen({ navigation }) {
  const { COLORS, t, refreshData } = useApp();
  const toast = useToastContext();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formName, setFormName] = useState('');
  const [formNameEn, setFormNameEn] = useState('');
  const [formNameAr, setFormNameAr] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formIcon, setFormIcon] = useState('');
  const [formSortOrder, setFormSortOrder] = useState('0');
  const [formDesc, setFormDesc] = useState('');

  const loadCategories = useCallback(async () => {
    try {
      const data = await fetchCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch { toast.show('Failed to load categories', 'error'); }
    setLoading(false);
  }, []);

  useEffect(() => { loadCategories(); }, []);

  const filtered = categories.filter(c =>
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.slug || '').toLowerCase().includes(search.toLowerCase())
  );

  const generateSlug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const openAdd = () => {
    setEditing(null);
    setFormName(''); setFormNameEn(''); setFormNameAr('');
    setFormSlug(''); setFormIcon(''); setFormSortOrder('0'); setFormDesc('');
    setModalVisible(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setFormName(cat.name || '');
    setFormNameEn(cat.name_en || '');
    setFormNameAr(cat.name_ar || '');
    setFormSlug(cat.slug || '');
    setFormIcon(cat.icon || '');
    setFormSortOrder(String(cat.sort_order ?? 0));
    setFormDesc(cat.description || '');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) { toast.show('Name is required', 'error'); return; }
    setSaving(true);
    try {
      const payload = {
        name: formName.trim(), name_en: formNameEn.trim(), name_ar: formNameAr.trim(),
        slug: formSlug.trim() || generateSlug(formName.trim()), icon: formIcon.trim(),
        sort_order: parseInt(formSortOrder) || 0, description: formDesc.trim(),
      };
      if (editing) { await updateCategory(editing.id, payload); toast.show('Category updated', 'success'); }
      else { await createCategory(payload); toast.show('Category created', 'success'); }
      setModalVisible(false);
      loadCategories();
      refreshData().catch(() => {});
    } catch (e) { toast.show(e.message || 'Save failed', 'error'); }
    setSaving(false);
  };

  const handleDelete = (cat) => {
    Alert.alert('Delete Category', `Delete "${cat.name}"? This may affect tracks using this category.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await deleteCategory(cat.id); toast.show('Category deleted', 'success'); loadCategories(); refreshData().catch(() => {}); }
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
        <View style={styles.iconWrap}>
          <Ionicons name={item.icon || 'grid'} size={22} color="#F59E0B" />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.cardSub} numberOfLines={1}>{item.slug || '—'}</Text>
        </View>
        <View style={styles.cardRight}>
          <Text style={styles.trackCount}>{item.tracks_count ?? item.track_count ?? 0}</Text>
          <Text style={styles.trackLabel}>tracks</Text>
        </View>
        <TouchableOpacity onPress={() => handleDelete(item)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
        </TouchableOpacity>
      </TouchableOpacity>
    </AnimatedListItem>
  );

  return (
    <AdminLayout navigation={navigation} title="Categories" subtitle={`${filtered.length} categories`}>
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="rgba(255,255,255,0.3)" />
          <TextInput style={styles.searchInput} placeholder="Search categories..." placeholderTextColor="rgba(255,255,255,0.3)" value={search} onChangeText={setSearch} />
          {search ? <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.3)" /></TouchableOpacity> : null}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#F59E0B" style={{ flex: 1 }} />
      ) : (
        <FlatList data={filtered} keyExtractor={item => String(item.id)} renderItem={renderItem} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}
          ListEmptyComponent={<AdminEmptyState icon="grid" message="No categories found" />}
        />
      )}

      <AdminFAB onPress={openAdd} />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View style={styles.modalIconWrap}><Ionicons name="grid" size={18} color="#F59E0B" /></View>
                <Text style={styles.modalTitle}>{editing ? 'Edit Category' : 'Add Category'}</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color="rgba(255,255,255,0.5)" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
              <Text style={styles.label}>Name *</Text>
              <TextInput style={styles.input} value={formName} onChangeText={(text) => { setFormName(text); if (!editing) setFormSlug(generateSlug(text)); }} placeholder="Category name" placeholderTextColor="rgba(255,255,255,0.3)" />
              <Text style={styles.label}>Name (English)</Text>
              <TextInput style={styles.input} value={formNameEn} onChangeText={setFormNameEn} placeholder="English name" placeholderTextColor="rgba(255,255,255,0.3)" />
              <Text style={styles.label}>Name (Arabic)</Text>
              <TextInput style={[styles.input, { textAlign: 'right' }]} value={formNameAr} onChangeText={setFormNameAr} placeholder="Arabic name" placeholderTextColor="rgba(255,255,255,0.3)" />
              <Text style={styles.label}>Slug</Text>
              <TextInput style={styles.input} value={formSlug} onChangeText={setFormSlug} placeholder="category-slug" placeholderTextColor="rgba(255,255,255,0.3)" />
              <Text style={styles.label}>Icon (Ionicons name)</Text>
              <TextInput style={styles.input} value={formIcon} onChangeText={setFormIcon} placeholder="e.g. musical-note" placeholderTextColor="rgba(255,255,255,0.3)" />
              <Text style={styles.label}>Sort Order</Text>
              <TextInput style={styles.input} value={formSortOrder} onChangeText={setFormSortOrder} placeholder="0" keyboardType="numeric" placeholderTextColor="rgba(255,255,255,0.3)" />
              <Text style={styles.label}>Description</Text>
              <TextInput style={[styles.input, styles.textArea]} value={formDesc} onChangeText={setFormDesc} placeholder="Description" placeholderTextColor="rgba(255,255,255,0.3)" multiline numberOfLines={3} />
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
  card: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(201,168,76,0.12)', backgroundColor: 'rgba(20,35,55,0.5)', marginBottom: 10, gap: 12 },
  iconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(245,158,11,0.1)' },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  cardSub: { fontSize: 12, marginTop: 2, color: 'rgba(255,255,255,0.4)' },
  cardRight: { alignItems: 'center', marginRight: 8 },
  trackCount: { fontSize: 18, fontWeight: '700', color: '#F59E0B' },
  trackLabel: { fontSize: 10, color: 'rgba(255,255,255,0.4)' },
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
  saveBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 8, marginBottom: 20 },
  saveBtnGradient: { paddingVertical: 15, borderRadius: 14, alignItems: 'center' },
  saveBtnText: { color: '#0a1220', fontSize: 16, fontWeight: '700' },
});
