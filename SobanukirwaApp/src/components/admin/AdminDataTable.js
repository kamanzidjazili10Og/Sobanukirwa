import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AdminSearchBar from './AdminSearchBar';

const COLORS = {
  background: '#0a1220',
  surface: 'rgba(20, 35, 55, 0.7)',
  primaryText: '#e8edf5',
  secondaryText: 'rgba(232, 237, 245, 0.5)',
  accent: '#c9a84c',
  border: 'rgba(201, 168, 76, 0.2)',
};

const defaultKeyExtractor = (item) => item?.id?.toString() || Math.random().toString();

export default function AdminDataTable({
  data,
  renderItem,
  searchPlaceholder = 'Search...',
  onSearch,
  keyExtractor,
  searchValue,
}) {
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="folder-open-outline" size={56} color={COLORS.accent} />
      <Text style={styles.emptyTitle}>No Data Found</Text>
      <Text style={styles.emptySubtitle}>There are no items to display</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {onSearch && (
        <AdminSearchBar
          value={searchValue}
          onChangeText={onSearch}
          placeholder={searchPlaceholder}
        />
      )}
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor || defaultKeyExtractor}
        contentContainerStyle={data?.length === 0 ? styles.listEmpty : styles.list}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  listEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.primaryText,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.secondaryText,
    marginTop: 6,
    textAlign: 'center',
  },
});
