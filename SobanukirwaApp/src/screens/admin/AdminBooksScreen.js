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
import { fetchBooks, createBook, updateBook, deleteBook, getMediaUrl } from '../../services/api';
import AdminLayout, { AdminFAB, AdminEmptyState } from '../../components/admin/AdminLayout';

const FILE_TYPES = ['pdf', 'text', 'docx'];

export default function AdminBooksScreen({ navigation }) {
  const { COLORS, t } = useApp();
  const toast = useToastContext();
  const [books, setBooks] = useState([]);
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
  const [formCategory, setFormCategory] = useState('');
  const [formFileType, setFormFileType] = useState('pdf');
  const [formFile, setFormFile] = useState(null);
  const [formCover, setFormCover] = useState(null);

  const loadBooks = useCallback(async () => {
    try {
      const data = await fetchBooks();
      setBooks(Array.isArray(data) ? data : []);
    } catch { toast.show('Failed to load books', 'error'); }
    setLoading(false);
  }, []);

  useEffect(() => { loadBooks(); }, []);

  const filtered = books.filter(b =>
    (b.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (b.author || b.authorEn || '').toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditing(null);
    setFormTitle(''); setFormTitleEn(''); setFormTitleAr('');
    setFormAuthor(''); setFormDesc(''); setFormCategory('');
    setFormFileType('pdf'); setFormFile(null); setFormCover(null);
    setModalVisible(true);
  };

  const openEdit = (book) => {
    setEditing(book);
    setFormTitle(book.title || '');
    setFormTitleEn(book.titleEn || book.title_en || '');
    setFormTitleAr(book.titleAr || book.title_ar || '');
    setFormAuthor(book.author || '');
    setFormDesc(book.description || '');
    setFormCategory(book.category || '');
    setFormFileType(book.fileType || book.file_type || 'pdf');
    setFormFile(null);
    setFormCover(book.imageUrl || book.image_url ? { uri: getMediaUrl(book.imageUrl || book.image_url) } : null);
    setModalVisible(true);
  };

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] });
    if (!result.canceled) {
      const file = result.assets[0];
      setFormFile(file);
      const ext = file.name?.split('.').pop()?.toLowerCase();
      if (ext === 'pdf') setFormFileType('pdf');
      else if (ext === 'docx') setFormFileType('docx');
      else setFormFileType('text');
    }
  };

  const pickCover = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!result.canceled) setFormCover(result.assets[0]);
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
      if (formCategory) formData.append('category', formCategory.trim());
      formData.append('file_type', formFileType);
      if (formFile) {
        const ext = formFile.name?.split('.').pop() || 'pdf';
        const mimeTypes = { pdf: 'application/pdf', text: 'text/plain', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };
        formData.append('file', { uri: formFile.uri, name: `book.${ext}`, type: mimeTypes[ext] || 'application/octet-stream' });
      }
      if (formCover) formData.append('cover', { uri: formCover.uri, name: 'cover.jpg', type: 'image/jpeg' });
      if (editing) { await updateBook(editing.id, formData); toast.show('Book updated', 'success'); }
      else { await createBook(formData); toast.show('Book created', 'success'); }
      setModalVisible(false);
      loadBooks();
    } catch (e) { toast.show(e.message || 'Save failed', 'error'); }
    setSaving(false);
  };

  const handleDelete = (book) => {
    Alert.alert('Delete Book', `Delete "${book.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await deleteBook(book.id); toast.show('Book deleted', 'success'); loadBooks(); }
        catch { toast.show('Delete failed', 'error'); }
      }},
    ]);
  };

  const getFileTypeColor = (type) => {
    switch (type) { case 'pdf': return '#e74c3c'; case 'docx': return '#3498db'; default: return '#27ae60'; }
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
        {(item.imageUrl || item.image_url) ? (
          <Image source={{ uri: getMediaUrl(item.imageUrl || item.image_url) }} style={styles.cover} />
        ) : (
          <View style={styles.coverPlaceholder}>
            <Ionicons name="book" size={26} color="#F59E0B" />
          </View>
        )}
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
          {item.author ? <Text style={styles.cardSub} numberOfLines={1}>{item.author}</Text> : null}
          <View style={styles.cardFooter}>
            <View style={[styles.typeBadge, { backgroundColor: getFileTypeColor(item.fileType || item.file_type) + '20' }]}>
              <Text style={{ color: getFileTypeColor(item.fileType || item.file_type), fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>{item.fileType || item.file_type || 'pdf'}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity onPress={() => handleDelete(item)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
        </TouchableOpacity>
      </TouchableOpacity>
    </AnimatedListItem>
  );

  return (
    <AdminLayout navigation={navigation} title="Books" subtitle={`${filtered.length} books`}>
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="rgba(255,255,255,0.3)" />
          <TextInput style={styles.searchInput} placeholder="Search books..." placeholderTextColor="rgba(255,255,255,0.3)" value={search} onChangeText={setSearch} />
          {search ? <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.3)" /></TouchableOpacity> : null}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#F59E0B" style={{ flex: 1 }} />
      ) : (
        <FlatList data={filtered} keyExtractor={item => String(item.id)} renderItem={renderItem} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}
          ListEmptyComponent={<AdminEmptyState icon="book" message="No books found" />}
        />
      )}

      <AdminFAB onPress={openAdd} />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View style={styles.modalIconWrap}><Ionicons name="book" size={18} color="#F59E0B" /></View>
                <Text style={styles.modalTitle}>{editing ? 'Edit Book' : 'Add Book'}</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color="rgba(255,255,255,0.5)" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
              <Text style={styles.label}>Title *</Text>
              <TextInput style={styles.input} value={formTitle} onChangeText={setFormTitle} placeholder="Book title" placeholderTextColor="rgba(255,255,255,0.3)" />
              <Text style={styles.label}>Title (English)</Text>
              <TextInput style={styles.input} value={formTitleEn} onChangeText={setFormTitleEn} placeholder="English title" placeholderTextColor="rgba(255,255,255,0.3)" />
              <Text style={styles.label}>Title (Arabic)</Text>
              <TextInput style={[styles.input, { textAlign: 'right' }]} value={formTitleAr} onChangeText={setFormTitleAr} placeholder="Arabic title" placeholderTextColor="rgba(255,255,255,0.3)" />
              <Text style={styles.label}>Author</Text>
              <TextInput style={styles.input} value={formAuthor} onChangeText={setFormAuthor} placeholder="Author name" placeholderTextColor="rgba(255,255,255,0.3)" />
              <Text style={styles.label}>Description</Text>
              <TextInput style={[styles.input, styles.textArea]} value={formDesc} onChangeText={setFormDesc} placeholder="Description" placeholderTextColor="rgba(255,255,255,0.3)" multiline numberOfLines={3} />
              <Text style={styles.label}>Category</Text>
              <TextInput style={styles.input} value={formCategory} onChangeText={setFormCategory} placeholder="e.g. hadith, fiqh" placeholderTextColor="rgba(255,255,255,0.3)" />
              <Text style={styles.label}>File Type</Text>
              <View style={styles.typeRow}>
                {FILE_TYPES.map(type => (
                  <TouchableOpacity key={type} style={[styles.typeChip, { borderColor: formFileType === type ? getFileTypeColor(type) : 'rgba(201,168,76,0.15)', backgroundColor: formFileType === type ? getFileTypeColor(type) + '15' : 'transparent' }]} onPress={() => setFormFileType(type)}>
                    <Text style={{ color: formFileType === type ? getFileTypeColor(type) : 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: '600', textTransform: 'uppercase' }}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={styles.filePicker} onPress={pickFile}>
                <Ionicons name={formFile ? 'checkmark-circle' : 'document-text'} size={24} color={formFile ? '#27ae60' : '#F59E0B'} />
                <Text style={{ color: formFile ? '#27ae60' : 'rgba(255,255,255,0.6)', marginLeft: 8 }}>{formFile ? formFile.name || 'File selected' : 'Pick File'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filePicker} onPress={pickCover}>
                <Ionicons name={formCover ? 'checkmark-circle' : 'image'} size={24} color={formCover ? '#27ae60' : '#F59E0B'} />
                <Text style={{ color: formCover ? '#27ae60' : 'rgba(255,255,255,0.6)', marginLeft: 8 }}>{formCover ? 'Cover selected' : 'Pick Cover Image'}</Text>
              </TouchableOpacity>
              {formCover && <Image source={{ uri: formCover.uri }} style={styles.coverPreview} />}
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
  cover: { width: 55, height: 72, borderRadius: 8 },
  coverPlaceholder: { width: 55, height: 72, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(245,158,11,0.08)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.15)' },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  cardSub: { fontSize: 12, marginTop: 2, color: 'rgba(255,255,255,0.4)' },
  cardFooter: { flexDirection: 'row', marginTop: 6 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
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
  typeRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  typeChip: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  filePicker: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderStyle: 'dashed', borderRadius: 14, padding: 18, marginTop: 14, justifyContent: 'center', borderColor: 'rgba(245,158,11,0.25)', backgroundColor: 'rgba(245,158,11,0.04)' },
  coverPreview: { width: '100%', height: 140, borderRadius: 10, marginTop: 10, resizeMode: 'cover' },
  saveBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 8, marginBottom: 20 },
  saveBtnGradient: { paddingVertical: 15, borderRadius: 14, alignItems: 'center' },
  saveBtnText: { color: '#0a1220', fontSize: 16, fontWeight: '700' },
});
