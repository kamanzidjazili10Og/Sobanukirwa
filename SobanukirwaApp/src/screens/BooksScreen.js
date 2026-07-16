import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, ImageBackground, TextInput, Modal, RefreshControl, Linking, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen, Search, BookMarked, RotateCcw, ChevronLeft, Hand, Hash } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { getMediaUrl } from '../services/api';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#0F766E',
  secondary: '#14B8A6',
  accent: '#F59E0B',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  border: '#E5E7EB',
  success: '#10B981',
  error: '#EF4444',
};

export default function BooksScreen() {
  const { books, t, refreshing, refreshData } = useApp();
  const [search, setSearch] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [readerVisible, setReaderVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [])
  );

  const filtered = books.filter(b => {
    const q = search.toLowerCase();
    const title = (b.title || '').toLowerCase();
    const author = (b.author || '').toLowerCase();
    const category = (b.category || '').toLowerCase();
    return title.includes(q) || author.includes(q) || category.includes(q);
  });

  function openBook(book) {
    setSelectedBook(book);
    setReaderVisible(true);
  }

  function closeBookReader() {
    setReaderVisible(false);
    setSelectedBook(null);
  }

  return (
    <ImageBackground source={require('../../assets/ok5.jpeg')} style={styles.bgImage} resizeMode="cover">
      <View style={styles.overlay} />
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerTitleWrap}>
            <View style={styles.headerIconCircle}>
              <BookOpen size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.headerTitle}>
              {t('Ibitabo', 'Books', 'الكتب')}
            </Text>
          </View>
          <View style={styles.headerBadge}>
            <Text style={styles.headerCount}>{books.length}</Text>
          </View>
        </View>
      </View>

      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Search size={18} color={COLORS.textTertiary} />
          <TextInput
            style={styles.search}
            placeholder={t('Shakisha itabo...', 'Search books...', 'ابحث عن الكتب...')}
            placeholderTextColor={COLORS.textTertiary}
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={styles.clearBtn}>×</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.grid}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshData} tintColor={COLORS.secondary} colors={[COLORS.secondary]} />
        }
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <BookOpen size={48} color={COLORS.secondary} />
            </View>
            <Text style={styles.emptyText}>
              {t('Nta bitabo bibonetse', 'No books found', 'لم يتم العثور على كتب')}
            </Text>
          </View>
        ) : filtered.map((item) => {
          const isPdf = item.fileType === 'pdf';
          const imgUrl = item.imageUrl ? getMediaUrl(item.imageUrl) : null;
          const itemTitle = item.titleEn || item.title || '';
          const itemAuthor = item.authorEn || item.author || '';
          return (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() => openBook(item)}
              activeOpacity={0.85}
            >
              <View style={styles.coverWrap}>
                {imgUrl ? (
                  <Image source={{ uri: imgUrl }} style={styles.cover} resizeMode="cover" />
                ) : (
                  <View style={styles.coverPlaceholder}>
                    <BookOpen size={36} color={COLORS.primary} />
                  </View>
                )}
                <View style={styles.coverOverlay} />
                <View style={[styles.typeBadge, isPdf ? styles.badgePdf : styles.badgeText]}>
                  <Text style={styles.typeBadgeText}>{isPdf ? 'PDF' : 'TEXT'}</Text>
                </View>
              </View>
              <View style={styles.info}>
                <Text style={styles.title} numberOfLines={2}>{itemTitle}</Text>
                <View style={styles.authorRow}>
                  <Hash size={12} color={COLORS.secondary} />
                  <Text style={styles.author} numberOfLines={1}>{itemAuthor}</Text>
                </View>
                {item.category ? (
                  <View style={styles.categoryPill}>
                    <Text style={styles.categoryText}>{item.category}</Text>
                  </View>
                ) : null}
                <TouchableOpacity style={styles.readBtn} onPress={() => openBook(item)}>
                  <BookOpen size={14} color="#FFFFFF" />
                  <Text style={styles.readBtnText}>
                    {t('Soma', 'Read', 'اقرأ')}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 20 }} />
      </ScrollView>

      <Modal visible={readerVisible} animationType="slide" onRequestClose={closeBookReader}>
        <SafeAreaView style={styles.readerContainer}>
          <View style={styles.readerHeader}>
            <Text style={styles.readerTitle} numberOfLines={1}>
              {selectedBook ? (selectedBook.titleEn || selectedBook.title || '') : ''}
            </Text>
            <TouchableOpacity onPress={closeBookReader} style={styles.readerCloseBtn}>
              <Text style={styles.readerCloseBtnText}>×</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.readerBody}>
            {selectedBook && selectedBook.fileType === 'pdf' && selectedBook.fileUrl ? (
              <View style={styles.loadingOverlay}>
                <BookMarked size={64} color={COLORS.secondary} />
                <Text style={styles.loadingTitle}>{selectedBook.titleEn || selectedBook.title}</Text>
                <Text style={styles.loadingSubtitle}>{selectedBook.authorEn || selectedBook.author || ''}</Text>
                <TouchableOpacity
                  style={styles.pdfOpenBtn}
                  onPress={() => Linking.openURL(getMediaUrl(selectedBook.fileUrl))}
                >
                  <BookOpen size={18} color="#FFFFFF" />
                  <Text style={styles.pdfOpenBtnText}>
                    {t('Fungura PDF', 'Open PDF', 'فتح PDF')}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : selectedBook ? (
              <ScrollView contentContainerStyle={styles.textReaderContent}>
                <Text style={styles.textReaderTitle}>{selectedBook.titleEn || selectedBook.title || ''}</Text>
                <View style={styles.textReaderMeta}>
                  <Hash size={14} color={COLORS.secondary} />
                  <Text style={styles.textReaderAuthor}>{selectedBook.authorEn || selectedBook.author || ''}</Text>
                </View>
                <Text style={styles.textReaderBody}>
                  {selectedBook.description || 'This book contains beneficial Islamic knowledge.\n\nMay Allah increase us in knowledge and benefit us with what we learn.'}
                </Text>
              </ScrollView>
            ) : null}
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bgImage: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(6, 48, 44, 0.6)' },
  container: { flex: 1, backgroundColor: 'transparent' },

  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12, backgroundColor: 'rgba(0,0,0,0.25)' },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerIconCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#FFFFFF' },
  headerBadge: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 18,
    backgroundColor: 'rgba(15,118,110,0.2)',
  },
  headerCount: { fontSize: 14, fontWeight: '700', color: '#5EEAD4' },

  searchWrap: { paddingHorizontal: 20, marginBottom: 8, paddingTop: 8 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 14, gap: 8,
  },
  search: { flex: 1, fontSize: 14, paddingVertical: 12, color: '#FFFFFF' },
  clearBtn: { fontSize: 20, color: 'rgba(255,255,255,0.5)', paddingHorizontal: 4 },

  grid: { paddingHorizontal: 20, paddingTop: 8, gap: 14 },

  card: {
    borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(0,0,0,0.2)', overflow: 'hidden',
  },
  coverWrap: { width: '100%', height: 150, position: 'relative' },
  cover: { width: '100%', height: '100%' },
  coverPlaceholder: {
    width: '100%', height: '100%',
    backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center',
  },
  coverOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.05)' },
  typeBadge: { position: 'absolute', top: 8, left: 8, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgePdf: { backgroundColor: COLORS.error },
  badgeText: { backgroundColor: COLORS.secondary },
  typeBadgeText: { color: '#fff', fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },

  info: { flex: 1, padding: 12, gap: 6 },
  title: { fontSize: 14, fontWeight: '600', lineHeight: 19, color: '#FFFFFF' },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  author: { fontSize: 12, flex: 1, fontWeight: '500', color: 'rgba(255,255,255,0.7)' },
  categoryPill: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
    alignSelf: 'flex-start', marginTop: 4, backgroundColor: 'rgba(255,255,255,0.08)',
  },
  categoryText: { fontSize: 10, fontWeight: '600', color: '#5EEAD4' },
  readBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10, borderRadius: 12, marginTop: 'auto',
    backgroundColor: COLORS.primary,
  },
  readBtnText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },

  emptyState: { alignItems: 'center', marginTop: 60, gap: 16 },
  emptyIconWrap: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center',
  },
  emptyText: { fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.6)' },

  readerContainer: { flex: 1, backgroundColor: 'rgba(10,48,44,0.97)' },
  readerHeader: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.3)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  readerTitle: { flex: 1, fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  readerCloseBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', marginLeft: 10,
  },
  readerCloseBtnText: { fontSize: 20, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },

  readerBody: { flex: 1 },
  loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingTitle: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  loadingSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.7)' },

  pdfOpenBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12, marginTop: 16,
  },
  pdfOpenBtnText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },

  textReaderContent: { padding: 24, paddingBottom: 60 },
  textReaderTitle: { fontSize: 22, textAlign: 'center', marginBottom: 16, fontWeight: '700', color: '#5EEAD4' },
  textReaderMeta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  textReaderAuthor: { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.7)' },
  textReaderBody: { fontSize: 16, lineHeight: 28, color: '#FFFFFF' },
});
