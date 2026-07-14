import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, TextInput, Modal, StatusBar, RefreshControl, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { getMediaUrl } from '../services/api';
import ScreenBackground from '../components/ScreenBackground';

export default function BooksScreen() {
  const { books, t, COLORS, refreshing, refreshData } = useApp();
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
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      <ScreenBackground imageKey="bg-quran">
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: COLORS.secondary }]}>
          {t('Ibitabo', 'Books', 'الكتب')}
        </Text>
        <Text style={[styles.headerSub, { color: COLORS.textMuted }]}>
          {books.length} {t('itabo', 'books', 'كتاب')}
        </Text>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={16} color={COLORS.textMuted} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: COLORS.text, borderColor: COLORS.border, backgroundColor: COLORS.surface }]}
          placeholder={t('Shakisha itabo...', 'Search books...', 'ابحث عن الكتب...')}
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshData}
            tintColor={COLORS.secondary}
            colors={[COLORS.secondary]}
          />
        }
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="book" size={56} color={COLORS.secondary} />
            <Text style={[styles.emptyText, { color: COLORS.textMuted }]}>
              {t('Nta tabo tabonetse', 'No books found', 'لم يتم العثور على كتب')}
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
              style={[styles.card, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}
              onPress={() => openBook(item)}
              activeOpacity={0.85}
            >
              <View style={styles.coverWrap}>
                {imgUrl ? (
                  <Image source={{ uri: imgUrl }} style={styles.cover} resizeMode="cover" />
                ) : (
                  <View style={[styles.coverPlaceholder, { backgroundColor: 'rgba(212,175,55,0.1)' }]}>
                    <Ionicons name="book" size={40} color={COLORS.secondary} />
                  </View>
                )}
                <View style={styles.coverOverlay} />
                <View style={[styles.typeBadge, isPdf ? styles.badgePdf : styles.badgeText]}>
                  <Text style={styles.typeBadgeText}>{isPdf ? 'PDF' : 'TEXT'}</Text>
                </View>
                {item.category ? (
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{item.category}</Text>
                  </View>
                ) : null}
              </View>
              <View style={styles.info}>
                <Text style={[styles.title, { color: COLORS.text }]} numberOfLines={2}>{itemTitle}</Text>
                <View style={styles.authorRow}>
                  <Ionicons name="person" size={12} color={COLORS.secondary} />
                  <Text style={[styles.author, { color: COLORS.secondary }]} numberOfLines={1}>{itemAuthor}</Text>
                </View>
                <View style={[styles.readBtn, { backgroundColor: COLORS.secondary }]}>
                  <Ionicons name="book-open" size={14} color={COLORS.primaryDark} />
                  <Text style={[styles.readBtnText, { color: COLORS.primaryDark }]}>
                    {t('Soma', 'Read', 'اقرأ')}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      </ScreenBackground>

      <Modal visible={readerVisible} animationType="slide" onRequestClose={closeBookReader}>
        <SafeAreaView style={[styles.readerContainer, { backgroundColor: COLORS.background }]}>
          <View style={[styles.readerHeader, { backgroundColor: COLORS.primaryDark, borderBottomColor: COLORS.border }]}>
            <Text style={[styles.readerTitle, { color: COLORS.secondary }]} numberOfLines={1}>
              {selectedBook ? (selectedBook.titleEn || selectedBook.title || '') : ''}
            </Text>
            <TouchableOpacity onPress={closeBookReader} style={[styles.readerCloseBtn, { borderColor: COLORS.border }]}>
              <Ionicons name="close" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
          <View style={styles.readerBody}>
            {selectedBook && selectedBook.fileType === 'pdf' && selectedBook.fileUrl ? (
              <View style={styles.loadingOverlay}>
                <Ionicons name="document-text" size={64} color={COLORS.secondary} />
                <Text style={[styles.loadingText, { color: COLORS.text, fontSize: 16, fontWeight: '600' }]}>{selectedBook.titleEn || selectedBook.title}</Text>
                <Text style={[styles.loadingText, { color: COLORS.textMuted }]}>{selectedBook.authorEn || selectedBook.author || ''}</Text>
                <TouchableOpacity
                  style={[styles.readBtn, { backgroundColor: COLORS.secondary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12, marginTop: 16 }]}
                  onPress={() => Linking.openURL(getMediaUrl(selectedBook.fileUrl))}
                >
                  <Ionicons name="open-outline" size={18} color={COLORS.primaryDark} />
                  <Text style={[styles.readBtnText, { color: COLORS.primaryDark, fontSize: 15 }]}>
                    {t('Fungura PDF', 'Open PDF', 'فتح PDF')}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : selectedBook ? (
              <ScrollView contentContainerStyle={styles.textReaderContent}>
                <Text style={[styles.textReaderTitle, { color: COLORS.secondary }]}>{selectedBook.titleEn || selectedBook.title || ''}</Text>
                <View style={styles.textReaderMeta}>
                  <Ionicons name="person" size={14} color={COLORS.secondary} />
                  <Text style={[styles.textReaderAuthor, { color: COLORS.textMuted }]}>{selectedBook.authorEn || selectedBook.author || ''}</Text>
                  {selectedBook.category ? (
                    <>
                      <Text style={[styles.textReaderDot, { color: COLORS.textMuted }]}>-</Text>
                      <Ionicons name="pricetag" size={14} color={COLORS.secondary} />
                      <Text style={[styles.textReaderAuthor, { color: COLORS.textMuted }]}>{selectedBook.category}</Text>
                    </>
                  ) : null}
                </View>
                <Text style={[styles.textReaderBody, { color: COLORS.text }]}>
                  {selectedBook.description || 'This book contains beneficial Islamic knowledge.\n\nMay Allah increase us in knowledge and benefit us with what we learn.'}
                </Text>
              </ScrollView>
            ) : null}
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingBottom: 12 },
  headerTitle: { fontSize: 26, fontWeight: '700' },
  headerSub: { fontSize: 13, marginTop: 4 },
  searchWrap: { paddingHorizontal: 20, marginBottom: 8, position: 'relative' },
  searchIcon: { position: 'absolute', left: 32, top: 12, zIndex: 1 },
  searchInput: { width: '100%', paddingHorizontal: 36, paddingVertical: 10, borderRadius: 20, borderWidth: 1, fontSize: 14 },
  list: { padding: 20, paddingTop: 8, gap: 14, paddingBottom: 40 },
  card: { borderRadius: 16, borderWidth: 1.5, overflow: 'hidden', flexDirection: 'row' },
  coverWrap: { width: 110, minHeight: 150, position: 'relative' },
  cover: { width: '100%', height: '100%' },
  coverPlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  coverOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.15)' },
  typeBadge: { position: 'absolute', top: 6, left: 6, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  badgePdf: { backgroundColor: 'rgba(231,76,60,0.9)' },
  badgeText: { backgroundColor: 'rgba(52,152,219,0.9)' },
  typeBadgeText: { color: '#fff', fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  categoryBadge: { position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(212,175,55,0.9)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  categoryBadgeText: { color: '#0f2a3f', fontSize: 8, fontWeight: '700', textTransform: 'uppercase' },
  info: { flex: 1, padding: 12, justifyContent: 'space-between' },
  title: { fontSize: 14, fontWeight: '600', lineHeight: 19 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  author: { fontSize: 12, flex: 1 },
  readBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, borderRadius: 8, marginTop: 6 },
  readBtnText: { fontSize: 12, fontWeight: '700' },
  emptyState: { alignItems: 'center', marginTop: 80, gap: 16 },
  emptyText: { textAlign: 'center', fontSize: 15 },

  readerContainer: { flex: 1 },
  readerHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  readerTitle: { flex: 1, fontSize: 16, fontWeight: '600' },
  readerCloseBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
  readerBody: { flex: 1 },
  loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14 },
  textReaderContent: { padding: 24, paddingBottom: 60 },
  textReaderTitle: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 16, fontFamily: 'serif' },
  textReaderMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(212,175,55,0.2)' },
  textReaderAuthor: { fontSize: 13 },
  textReaderDot: { fontSize: 13 },
  textReaderBody: { fontSize: 16, lineHeight: 28, fontFamily: 'serif' },
});
