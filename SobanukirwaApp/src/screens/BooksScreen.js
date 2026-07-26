import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, ImageBackground, TextInput, Modal, RefreshControl, Linking, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen, Search, BookMarked, RotateCcw, ChevronLeft, Hand, Hash, Download, Check, Wifi, WifiOff, FileText, File, Filter } from 'lucide-react-native';
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

const CATEGORIES = [
  { key: 'all', labelRw: 'Vyose', labelEn: 'All', labelAr: 'الكل' },
  { key: 'hadith', labelRw: 'Hadith', labelEn: 'Hadith', labelAr: 'الحديث' },
  { key: 'tafsir', labelRw: 'Tafsir', labelEn: 'Tafsir', labelAr: 'التفسير' },
  { key: 'fiqh', labelRw: 'Fiqh', labelEn: 'Fiqh', labelAr: 'الفقه' },
  { key: 'sirah', labelRw: 'Sirah', labelEn: 'Sirah', labelAr: 'السيرة' },
  { key: 'tauhid', labelRw: 'Tauhid', labelEn: 'Tauhid', labelAr: 'التوحيد' },
  { key: 'other', labelRw: 'Ibindi', labelEn: 'Other', labelAr: 'أخرى' },
];

export default function BooksScreen() {
  const { books, t, refreshing, refreshData, isOffline, cachedBooks, bookDownloads, cacheBook, uncacheBook, getBookLocalUri, checkBookCache } = useApp();
  const [search, setSearch] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [readerVisible, setReaderVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [downloadingBook, setDownloadingBook] = useState(null);

  useFocusEffect(
    useCallback(() => {
      refreshData();
      books.forEach(b => {
        if (b.fileUrl) {
          const fullUrl = getMediaUrl(b.fileUrl);
          checkBookCache(fullUrl);
        }
      });
    }, [])
  );

  const filtered = books.filter(b => {
    const q = search.toLowerCase();
    const title = (b.title || '').toLowerCase();
    const author = (b.author || '').toLowerCase();
    const category = (b.category || '').toLowerCase();
    const matchesSearch = title.includes(q) || author.includes(q) || category.includes(q);
    const matchesCategory = selectedCategory === 'all' || (b.category || '').toLowerCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  function openBook(book) {
    setSelectedBook(book);
    setReaderVisible(true);
  }

  function closeBookReader() {
    setReaderVisible(false);
    setSelectedBook(null);
  }

  async function handleDownloadBook(book) {
    if (!book.fileUrl) return;
    const fullUrl = getMediaUrl(book.fileUrl);
    setDownloadingBook(book.id);
    await cacheBook(fullUrl);
    setDownloadingBook(null);
  }

  async function handleRemoveBook(book) {
    if (!book.fileUrl) return;
    const fullUrl = getMediaUrl(book.fileUrl);
    await uncacheBook(fullUrl);
  }

  async function openCachedBook(book) {
    if (!book.fileUrl) return;
    const fullUrl = getMediaUrl(book.fileUrl);
    const localUri = await getBookLocalUri(fullUrl);
    if (localUri) {
      setSelectedBook({ ...book, localUri });
    } else {
      setSelectedBook(book);
    }
    setReaderVisible(true);
  }

  function getTypeIcon(fileType) {
    if (fileType === 'pdf') return File;
    if (fileType === 'docx') return FileText;
    return BookOpen;
  }

  function getTypeColor(fileType) {
    if (fileType === 'pdf') return COLORS.error;
    if (fileType === 'docx') return '#2980B9';
    return COLORS.secondary;
  }

  const categoryCounts = {};
  books.forEach(b => {
    const cat = (b.category || 'other').toLowerCase();
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });
  categoryCounts.all = books.length;

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
          <View style={styles.headerRight}>
            {isOffline ? (
              <View style={styles.offlineIndicator}>
                <WifiOff size={12} color="#F59E0B" />
                <Text style={styles.offlineText}>{t('Offline', 'Offline', 'غير متصل')}</Text>
              </View>
            ) : (
              <View style={[styles.offlineIndicator, { backgroundColor: 'rgba(16,185,129,0.15)' }]}>
                <Wifi size={12} color="#10B981" />
                <Text style={[styles.offlineText, { color: '#10B981' }]}>{t('Online', 'Online', 'متصل')}</Text>
              </View>
            )}
            <View style={styles.headerBadge}>
              <Text style={styles.headerCount}>{books.length}</Text>
            </View>
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

      <View style={styles.categoryWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {CATEGORIES.map(cat => {
            const count = categoryCounts[cat.key] || 0;
            const isActive = selectedCategory === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                style={[styles.categoryPill, isActive && styles.categoryPillActive]}
                onPress={() => setSelectedCategory(cat.key)}
                activeOpacity={0.7}
              >
                <Text style={[styles.categoryPillText, isActive && styles.categoryPillTextActive]}>
                  {t(cat.labelRw, cat.labelEn, cat.labelAr)}
                </Text>
                <Text style={[styles.categoryCount, isActive && styles.categoryCountActive]}>
                  {count}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
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
            {selectedCategory !== 'all' && (
              <TouchableOpacity onPress={() => setSelectedCategory('all')} style={styles.clearFilterBtn}>
                <Text style={styles.clearFilterText}>{t('Siba icegereranyo', 'Clear filter', 'مسح الفلتر')}</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : filtered.map((item) => {
          const isPdf = item.fileType === 'pdf';
          const isDocx = item.fileType === 'docx';
          const typeLabel = isPdf ? 'PDF' : isDocx ? 'DOCX' : 'TEXT';
          const badgeStyle = isPdf ? styles.badgePdf : isDocx ? styles.badgeDocx : styles.badgeText;
          const imgUrl = item.imageUrl ? getMediaUrl(item.imageUrl) : null;
          const itemTitle = item.titleEn || item.title || '';
          const itemAuthor = item.authorEn || item.author || '';
          const fileUrl = item.fileUrl ? getMediaUrl(item.fileUrl) : null;
          const isCached = fileUrl ? (cachedBooks[fileUrl] || false) : false;
          const isDownloading = downloadingBook === item.id;
          const downloadProgress = fileUrl ? bookDownloads[fileUrl] : null;
          const TypeIcon = getTypeIcon(item.fileType);
          const typeColor = getTypeColor(item.fileType);

          return (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() => openCachedBook(item)}
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
                <View style={[styles.typeBadge, badgeStyle]}>
                  <TypeIcon size={10} color="#FFFFFF" />
                  <Text style={styles.typeBadgeText}>{typeLabel}</Text>
                </View>
                {isCached && (
                  <View style={styles.cachedBadge}>
                    <Check size={10} color="#FFFFFF" />
                    <Text style={styles.cachedBadgeText}>{t('Off', 'Off', 'محفوظ')}</Text>
                  </View>
                )}
              </View>
              <View style={styles.info}>
                <Text style={styles.title} numberOfLines={2}>{itemTitle}</Text>
                <View style={styles.authorRow}>
                  <Hash size={12} color={COLORS.secondary} />
                  <Text style={styles.author} numberOfLines={1}>{itemAuthor}</Text>
                </View>
                {item.category ? (
                  <View style={styles.categoryTag}>
                    <Text style={styles.categoryTagText}>{item.category}</Text>
                  </View>
                ) : null}
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.readBtn} onPress={() => openCachedBook(item)}>
                    <BookOpen size={14} color="#FFFFFF" />
                    <Text style={styles.readBtnText}>
                      {t('Soma', 'Read', 'اقرأ')}
                    </Text>
                  </TouchableOpacity>
                  {item.fileUrl ? (
                    isCached ? (
                      <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemoveBook(item)}>
                        <Text style={styles.removeBtnText}>{t('Siba', 'Remove', 'إزالة')}</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={[styles.downloadBtn, isDownloading && styles.downloadBtnDisabled]}
                        onPress={() => handleDownloadBook(item)}
                        disabled={isDownloading || isOffline}
                      >
                        {isDownloading ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <Download size={14} color="#FFFFFF" />
                        )}
                        <Text style={styles.downloadBtnText}>
                          {isDownloading
                            ? `${Math.round((downloadProgress?.progress || 0) * 100)}%`
                            : t('Kurura', 'Download', 'تحميل')}
                        </Text>
                      </TouchableOpacity>
                    )
                  ) : null}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 20 }} />
      </ScrollView>

      <Modal visible={readerVisible} animationType="slide" onRequestClose={closeBookReader}>
        {(() => {
          const selIcon = selectedBook ? getTypeIcon(selectedBook.fileType) : BookOpen;
          const selColor = selectedBook ? getTypeColor(selectedBook.fileType) : COLORS.secondary;
          return (
            <SafeAreaView style={styles.readerContainer}>
              <View style={styles.readerHeader}>
                <View style={styles.readerHeaderLeft}>
                  <selIcon size={18} color={selColor} />
                  <Text style={styles.readerTitle} numberOfLines={1}>
                    {selectedBook ? (selectedBook.titleEn || selectedBook.title || '') : ''}
                  </Text>
                  {selectedBook?.fileType && (
                    <View style={[styles.readerTypeBadge, { backgroundColor: selColor + '30' }]}>
                      <Text style={[styles.readerTypeText, { color: selColor }]}>
                        {selectedBook.fileType.toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity onPress={closeBookReader} style={styles.readerCloseBtn}>
                  <Text style={styles.readerCloseBtnText}>×</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.readerBody}>
                {selectedBook && (selectedBook.fileType === 'pdf' || selectedBook.fileType === 'docx') && (selectedBook.localUri || selectedBook.fileUrl) ? (
                  <View style={styles.pdfContainer}>
                    <View style={styles.pdfIconWrap}>
                      <BookMarked size={64} color={selColor} />
                    </View>
                    <Text style={styles.pdfTitle}>{selectedBook.titleEn || selectedBook.title}</Text>
                    <Text style={styles.pdfAuthor}>{selectedBook.authorEn || selectedBook.author || ''}</Text>
                    <Text style={styles.pdfType}>{selectedBook.fileType.toUpperCase()}</Text>
                    {selectedBook.localUri ? (
                      <View style={styles.offlineReadyBadge}>
                        <Check size={16} color="#10B981" />
                        <Text style={styles.offlineReadyText}>{t('Birabonetse offline', 'Available offline', 'متاح بدون إنترنت')}</Text>
                      </View>
                    ) : null}
                    <TouchableOpacity
                      style={[styles.pdfOpenBtn, { backgroundColor: selColor }]}
                      onPress={() => {
                        const url = selectedBook.localUri || getMediaUrl(selectedBook.fileUrl);
                        Linking.openURL(url);
                      }}
                    >
                      <BookOpen size={18} color="#FFFFFF" />
                      <Text style={styles.pdfOpenBtnText}>
                        {selectedBook.fileType === 'docx'
                          ? t('Fungura DOCX', 'Open DOCX', 'فتح DOCX')
                          : t('Fungura PDF', 'Open PDF', 'فتح PDF')}
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
                    {selectedBook.category ? (
                      <View style={styles.textReaderCategory}>
                        <Text style={styles.textReaderCategoryText}>{selectedBook.category}</Text>
                      </View>
                    ) : null}
                    <Text style={styles.textReaderBody}>
                      {selectedBook.description || 'This book contains beneficial Islamic knowledge.\n\nMay Allah increase us in knowledge and benefit us with what we learn.'}
                    </Text>
                  </ScrollView>
                ) : null}
              </View>
            </SafeAreaView>
          );
        })()}
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
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerBadge: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 18,
    backgroundColor: 'rgba(15,118,110,0.2)',
  },
  headerCount: { fontSize: 14, fontWeight: '700', color: '#5EEAD4' },
  offlineIndicator: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
    backgroundColor: 'rgba(245,158,11,0.15)',
  },
  offlineText: { fontSize: 10, fontWeight: '600', color: '#F59E0B' },

  searchWrap: { paddingHorizontal: 20, marginBottom: 4, paddingTop: 8 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 14, gap: 8,
  },
  search: { flex: 1, fontSize: 14, paddingVertical: 12, color: '#FFFFFF' },
  clearBtn: { fontSize: 20, color: 'rgba(255,255,255,0.5)', paddingHorizontal: 4 },

  categoryWrap: { paddingHorizontal: 20, marginBottom: 8 },
  categoryScroll: { gap: 8, paddingVertical: 4 },
  categoryPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  categoryPillActive: {
    backgroundColor: 'rgba(20,184,166,0.25)', borderColor: '#14B8A6',
  },
  categoryPillText: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.6)' },
  categoryPillTextActive: { color: '#5EEAD4' },
  categoryCount: {
    fontSize: 10, fontWeight: '700', paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)',
  },
  categoryCountActive: { backgroundColor: 'rgba(20,184,166,0.3)', color: '#5EEAD4' },

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
  typeBadge: { position: 'absolute', top: 8, left: 8, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgePdf: { backgroundColor: COLORS.error },
  badgeDocx: { backgroundColor: '#2980B9' },
  badgeText: { backgroundColor: COLORS.secondary },
  typeBadgeText: { color: '#fff', fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  cachedBadge: {
    position: 'absolute', top: 8, right: 8, flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
    backgroundColor: 'rgba(16,185,129,0.9)',
  },
  cachedBadgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },

  info: { flex: 1, padding: 12, gap: 6 },
  title: { fontSize: 14, fontWeight: '600', lineHeight: 19, color: '#FFFFFF' },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  author: { fontSize: 12, flex: 1, fontWeight: '500', color: 'rgba(255,255,255,0.7)' },
  categoryTag: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
    alignSelf: 'flex-start', marginTop: 4, backgroundColor: 'rgba(255,255,255,0.08)',
  },
  categoryTagText: { fontSize: 10, fontWeight: '600', color: '#5EEAD4' },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 'auto', paddingTop: 4 },
  readBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10, borderRadius: 12,
    backgroundColor: COLORS.primary,
  },
  readBtnText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  downloadBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12,
    backgroundColor: 'rgba(20,184,166,0.3)', borderWidth: 1, borderColor: '#14B8A6',
  },
  downloadBtnDisabled: { opacity: 0.5 },
  downloadBtnText: { fontSize: 11, fontWeight: '600', color: '#5EEAD4' },
  removeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12,
    backgroundColor: 'rgba(239,68,68,0.15)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)',
  },
  removeBtnText: { fontSize: 11, fontWeight: '600', color: '#EF4444' },

  emptyState: { alignItems: 'center', marginTop: 60, gap: 16 },
  emptyIconWrap: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center',
  },
  emptyText: { fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.6)' },
  clearFilterBtn: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12,
    backgroundColor: 'rgba(20,184,166,0.2)', borderWidth: 1, borderColor: '#14B8A6',
  },
  clearFilterText: { fontSize: 12, fontWeight: '600', color: '#5EEAD4' },

  readerContainer: { flex: 1, backgroundColor: 'rgba(10,48,44,0.97)' },
  readerHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.3)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  readerHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  readerTitle: { flex: 1, fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  readerTypeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  readerTypeText: { fontSize: 10, fontWeight: '700' },
  readerCloseBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', marginLeft: 10,
  },
  readerCloseBtnText: { fontSize: 20, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },

  readerBody: { flex: 1 },
  pdfContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  pdfIconWrap: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center',
  },
  pdfTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', textAlign: 'center' },
  pdfAuthor: { fontSize: 14, color: 'rgba(255,255,255,0.7)' },
  pdfType: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.5)', letterSpacing: 1 },
  offlineReadyBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12,
    backgroundColor: 'rgba(16,185,129,0.15)', marginTop: 8,
  },
  offlineReadyText: { fontSize: 12, fontWeight: '600', color: '#10B981' },
  pdfOpenBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12, marginTop: 16,
  },
  pdfOpenBtnText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },

  textReaderContent: { padding: 24, paddingBottom: 60 },
  textReaderTitle: { fontSize: 22, textAlign: 'center', marginBottom: 16, fontWeight: '700', color: '#5EEAD4' },
  textReaderMeta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    marginBottom: 12, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  textReaderAuthor: { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.7)' },
  textReaderCategory: {
    alignSelf: 'center', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12,
    backgroundColor: 'rgba(20,184,166,0.2)', marginBottom: 16,
  },
  textReaderCategoryText: { fontSize: 11, fontWeight: '600', color: '#5EEAD4' },
  textReaderBody: { fontSize: 16, lineHeight: 28, color: '#FFFFFF' },
});
