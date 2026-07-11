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
import { fetchBooks, createBook, updateBook, deleteBook, getMediaUrl } from '../../services/api';

const FILE_TYPES = ['pdf', 'text', 'docx'];

export default function AdminBooksScreen() {
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
    (b.author || '').toLowerCase().includes(search.toLowerCase())
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
      if (formCover) {
        formData.append('cover', { uri: formCover.uri, name: 'cover.jpg', type: 'image/jpeg' });
      }
      if (editing) {
        await updateBook(editing.id, formData);
        toast.show('Book updated', 'success');
      } else {
        await createBook(formData);
        toast.show('Book created', 'success');
      }
      setModalVisible(false);
      loadBooks();
    } catch (e) { toast.show(e.message || 'Save failed', 'error'); }
    setSaving(false);
  };

  const handleDelete = (book) => {
    Alert.alert('Delete Book', `Delete "${book.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try { await deleteBook(book.id); toast.show('Book deleted', 'success'); loadBooks(); }
          catch { toast.show('Delete failed', 'error'); }
        }
      },
    ]);
  };

  const getFileTypeColor = (type) => {
    switch (type) { case 'pdf': return '#e74c3c'; case 'docx': return '#3498db'; default: return '#27ae60'; }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={[styles.card, { backgroundColor: 'rgba(20,35,55,0.7)', borderColor: 'rgba(201,168,76,0.2)' }]} onPress={() => openEdit(item)} onLongPress={() => handleDelete(item)}>
      {(item.imageUrl || item.image_url) ? (
        <Image source={{ uri: getMediaUrl(item.imageUrl || item.image_url) }} style={styles.cover} />
      ) : (
        <View style={[styles.cover, styles.coverPlaceholder, { backgroundColor: 'rgba(201,168,76,0.1)' }]}>
          <Ionicons name="book" size={28} color={COLORS.secondary} />
        </View>
      )}
      <View style={styles.cardInfo}>
        <Text style={[styles.cardTitle, { color: COLORS.text }]} numberOfLines={2}>{item.title}</Text>
        {item.author ? <Text style={[styles.cardSub, { color: COLORS.textMuted }]} numberOfLines={1}>{item.author}</Text> : null}
        <View style={styles.cardFooter}>
          <View style={[styles.typeBadge, { backgroundColor: getFileTypeColor(item.fileType || item.file_type) + '22' }]}>
            <Text style={{ color: getFileTypeColor(item.fileType || item.file_type), fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>{item.fileType || item.file_type || 'pdf'}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity onPress={() => handleDelete(item)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Ionicons name="trash-outline" size={18} color={COLORS.error || '#e74c3c'} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      <View style={styles.searchRow}>
        <View style={[styles.searchBar, { backgroundColor: 'rgba(20,35,55,0.7)', borderColor: 'rgba(201,168,76,0.2)' }]}>
          <Ionicons name="search" size={18} color={COLORS.textMuted} />
          <TextInput style={[styles.searchInput, { color: COLORS.text }]} placeholder="Search books..." placeholderTextColor={COLORS.textMuted} value={search} onChangeText={setSearch} />
          {search ? <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={18} color={COLORS.textMuted} /></TouchableOpacity> : null}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.secondary} style={{ flex: 1 }} />
      ) : (
        <FlatList data={filtered} keyExtractor={item => String(item.id)} renderItem={renderItem} contentContainerStyle={styles.list} ListEmptyComponent={<Text style={[styles.empty, { color: COLORS.textMuted }]}>No books found</Text>} />
      )}

      <TouchableOpacity style={[styles.fab, { backgroundColor: COLORS.secondary }]} onPress={openAdd}>
        <Ionicons name="add" size={28} color="#0a1220" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: '#0a1220', borderColor: 'rgba(201,168,76,0.2)' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: COLORS.textGold }]}>{editing ? 'Edit Book' : 'Add Book'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><Ionicons name="close" size={24} color={COLORS.textMuted} /></TouchableOpacity>
            </View>
            <ScrollView>
              <Text style={[styles.label, { color: COLORS.textMuted }]}>Title *</Text>
              <TextInput style={[styles.input, { color: COLORS.text, borderColor: 'rgba(201,168,76,0.2)', backgroundColor: 'rgba(20,35,55,0.7)' }]} value={formTitle} onChangeText={setFormTitle} placeholder="Book title" placeholderTextColor={COLORS.textMuted} />

              <Text style={[styles.label, { color: COLORS.textMuted }]}>Title (English)</Text>
              <TextInput style={[styles.input, { color: COLORS.text, borderColor: 'rgba(201,168,76,0.2)', backgroundColor: 'rgba(20,35,55,0.7)' }]} value={formTitleEn} onChangeText={setFormTitleEn} placeholder="English title" placeholderTextColor={COLORS.textMuted} />

              <Text style={[styles.label, { color: COLORS.textMuted }]}>Title (Arabic)</Text>
              <TextInput style={[styles.input, { color: COLORS.text, borderColor: 'rgba(201,168,76,0.2)', backgroundColor: 'rgba(20,35,55,0.7)', textAlign: 'right' }]} value={formTitleAr} onChangeText={setFormTitleAr} placeholder="Arabic title" placeholderTextColor={COLORS.textMuted} />

              <Text style={[styles.label, { color: COLORS.textMuted }]}>Author</Text>
              <TextInput style={[styles.input, { color: COLORS.text, borderColor: 'rgba(201,168,76,0.2)', backgroundColor: 'rgba(20,35,55,0.7)' }]} value={formAuthor} onChangeText={setFormAuthor} placeholder="Author name" placeholderTextColor={COLORS.textMuted} />

              <Text style={[styles.label, { color: COLORS.textMuted }]}>Description</Text>
              <TextInput style={[styles.input, styles.textArea, { color: COLORS.text, borderColor: 'rgba(201,168,76,0.2)', backgroundColor: 'rgba(20,35,55,0.7)' }]} value={formDesc} onChangeText={setFormDesc} placeholder="Description" placeholderTextColor={COLORS.textMuted} multiline numberOfLines={3} />

              <Text style={[styles.label, { color: COLORS.textMuted }]}>Category</Text>
              <TextInput style={[styles.input, { color: COLORS.text, borderColor: 'rgba(201,168,76,0.2)', backgroundColor: 'rgba(20,35,55,0.7)' }]} value={formCategory} onChangeText={setFormCategory} placeholder="e.g. hadith, fiqh" placeholderTextColor={COLORS.textMuted} />

              <Text style={[styles.label, { color: COLORS.textMuted }]}>File Type</Text>
              <View style={styles.typeRow}>
                {FILE_TYPES.map(type => (
                  <TouchableOpacity key={type} style={[styles.typeChip, { borderColor: 'rgba(201,168,76,0.2)', backgroundColor: formFileType === type ? getFileTypeColor(type) + '22' : 'transparent' }]} onPress={() => setFormFileType(type)}>
                    <Text style={{ color: formFileType === type ? getFileTypeColor(type) : COLORS.text, fontSize: 13, fontWeight: '600', textTransform: 'uppercase' }}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={[styles.filePicker, { borderColor: 'rgba(201,168,76,0.2)' }]} onPress={pickFile}>
                <Ionicons name={formFile ? 'checkmark-circle' : 'document-text'} size={24} color={formFile ? '#27ae60' : COLORS.secondary} />
                <Text style={{ color: formFile ? '#27ae60' : COLORS.text, marginLeft: 8 }}>{formFile ? formFile.name || 'File selected' : 'Pick File'}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.filePicker, { borderColor: 'rgba(201,168,76,0.2)' }]} onPress={pickCover}>
                <Ionicons name={formCover ? 'checkmark-circle' : 'image'} size={24} color={formCover ? '#27ae60' : COLORS.secondary} />
                <Text style={{ color: formCover ? '#27ae60' : COLORS.text, marginLeft: 8 }}>{formCover ? 'Cover selected' : 'Pick Cover Image'}</Text>
              </TouchableOpacity>

              {formCover && <Image source={{ uri: formCover.uri }} style={styles.coverPreview} />}

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
  searchRow: { padding: 12 },
  searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, height: 44, gap: 8 },
  searchInput: { flex: 1, fontSize: 14 },
  list: { padding: 12, paddingBottom: 80 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 10, gap: 12 },
  cover: { width: 55, height: 70, borderRadius: 8 },
  coverPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '600' },
  cardSub: { fontSize: 12, marginTop: 2 },
  cardFooter: { flexDirection: 'row', marginTop: 6 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  empty: { textAlign: 'center', marginTop: 60, fontSize: 15 },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 6 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '90%', borderWidth: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14 },
  textArea: { height: 80, textAlignVertical: 'top' },
  typeRow: { flexDirection: 'row', gap: 10 },
  typeChip: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  filePicker: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderStyle: 'dashed', borderRadius: 12, padding: 16, marginTop: 12, justifyContent: 'center' },
  coverPreview: { width: '100%', height: 140, borderRadius: 8, marginTop: 10, resizeMode: 'cover' },
  saveBtn: { paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 16, marginBottom: 20 },
  saveBtnText: { color: '#0a1220', fontSize: 16, fontWeight: '700' },
});
