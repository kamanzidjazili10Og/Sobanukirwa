import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function AdminLayout({ navigation, title, subtitle, rightAction, children }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  return (
    <ImageBackground source={require('../../../assets/bg-home.jpg')} style={styles.bgImage} resizeMode="cover">
      <LinearGradient
        colors={['rgba(10,18,32,0.95)', 'rgba(0,0,0,0.85)']}
        style={styles.overlay}
      />
      <SafeAreaView style={styles.container}>
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <TouchableOpacity
            onPress={() => navigation.navigate('AdminDashboard')}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={22} color="#F59E0B" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{title}</Text>
            {subtitle && <Text style={styles.headerSub}>{subtitle}</Text>}
          </View>
          {rightAction || <View style={{ width: 36 }} />}
        </Animated.View>
        {children}
      </SafeAreaView>
    </ImageBackground>
  );
}

export function AdminSearchBar({ value, onChangeText, placeholder }) {
  return (
    <View style={styles.searchBar}>
      <Ionicons name="search" size={18} color="rgba(255,255,255,0.3)" />
      <View style={styles.searchInputWrap}>
        <AnimatedTextInput
          style={styles.searchInput}
          placeholder={placeholder || 'Search...'}
          placeholderTextColor="rgba(255,255,255,0.3)"
          value={value}
          onChangeText={onChangeText}
        />
      </View>
      {value ? (
        <TouchableOpacity onPress={() => onChangeText('')}>
          <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.3)" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

import { TextInput as AnimatedTextInput } from 'react-native';

export function AdminFAB({ onPress, icon }) {
  return (
    <TouchableOpacity style={styles.fab} onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={['#F59E0B', '#D97706']}
        style={styles.fabGradient}
      >
        <Ionicons name={icon || 'add'} size={28} color="#0a1220" />
      </LinearGradient>
    </TouchableOpacity>
  );
}

export function AdminEmptyState({ icon, message }) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconWrap}>
        <Ionicons name={icon || 'folder-open'} size={48} color="rgba(245,158,11,0.3)" />
      </View>
      <Text style={styles.emptyText}>{message || 'No items found'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bgImage: { flex: 1, width: '100%', height: '100%' },
  overlay: { ...StyleSheet.absoluteFillObject },
  container: { flex: 1, backgroundColor: 'transparent' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(201,168,76,0.1)',
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19, borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.3)', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(201,168,76,0.08)',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#F59E0B' },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1,
    paddingHorizontal: 14, height: 46, gap: 10, margin: 12,
    backgroundColor: 'rgba(20,35,55,0.6)', borderColor: 'rgba(201,168,76,0.15)',
  },
  searchInputWrap: { flex: 1 },
  searchInput: { fontSize: 14, color: '#FFFFFF', paddingVertical: 0 },
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  fabGradient: {
    width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center',
  },
  emptyState: { alignItems: 'center', marginTop: 80, gap: 12 },
  emptyIconWrap: {
    width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(245,158,11,0.06)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.12)',
  },
  emptyText: { fontSize: 15, color: 'rgba(255,255,255,0.4)', fontWeight: '500' },
});
