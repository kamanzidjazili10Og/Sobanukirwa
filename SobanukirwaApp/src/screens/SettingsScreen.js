import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export default function SettingsScreen({ navigation }) {
  const {
    t, COLORS, language, setLanguage, tracks, videos, books, surahs,
    adhanEnabled, setAdhanEnabled, reminderEnabled, setReminderEnabled,
    silentMode, setSilentMode, saveSetting,
  } = useApp();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: COLORS.secondary }]}>
          {t('Igenamiterere', 'Settings', 'الإعدادات')}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.logoSection, { alignItems: 'center', marginBottom: 20 }]}>
          <View style={[styles.logoIcon, { backgroundColor: COLORS.secondary }]}>
            <Ionicons name="mosque" size={28} color={COLORS.primaryDark} />
          </View>
          <Text style={[styles.logoText, { color: COLORS.secondary }]}>Sobanukirwa</Text>
          <Text style={[styles.versionText, { color: COLORS.textMuted }]}>v1.0.0</Text>
        </View>

        <View style={[styles.card, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="globe" size={20} color={COLORS.secondary} />
            <Text style={[styles.cardTitle, { color: COLORS.secondary }]}>
              {t('Ururimi', 'Language', 'اللغة')}
            </Text>
          </View>
          <View style={styles.langRow}>
            {[
              { key: 'rw', label: 'Kinyarwanda', flag: '🇷🇼' },
              { key: 'en', label: 'English', flag: '🇬🇧' },
              { key: 'ar', label: 'العربية', flag: '🇸🇦' },
            ].map(lang => (
              <TouchableOpacity
                key={lang.key}
                style={[styles.langBtn, language === lang.key && { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary }]}
                onPress={() => {
                  setLanguage(lang.key);
                  saveSetting('language', lang.key);
                }}
              >
                <Text style={[styles.langFlag]}>{lang.flag}</Text>
                <Text style={[styles.langLabel, { color: language === lang.key ? COLORS.primaryDark : COLORS.text }]}>
                  {lang.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="volume-high" size={20} color={COLORS.secondary} />
            <Text style={[styles.cardTitle, { color: COLORS.secondary }]}>
              {t('Amategeko y\'Adhan', 'Adhan Settings', 'إعدادات الأذان')}
            </Text>
          </View>
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: COLORS.text }]}>
              {t('Kubasha Adhan', 'Enable Adhan', 'تشغيل الأذان')}
            </Text>
            <Switch
              value={adhanEnabled}
              onValueChange={(v) => { setAdhanEnabled(v); saveSetting('adhanEnabled', v); }}
              trackColor={{ false: 'rgba(255,255,255,0.12)', true: COLORS.secondary }}
              thumbColor={adhanEnabled ? COLORS.primaryDark : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="notifications" size={20} color={COLORS.secondary} />
            <Text style={[styles.cardTitle, { color: COLORS.secondary }]}>
              {t('Umwirondoro', 'Reminders', 'التذكيرات')}
            </Text>
          </View>
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: COLORS.text }]}>
              {t('Kubasha Ukwirondoro', 'Enable Reminders', 'تفعيل التذكيرات')}
            </Text>
            <Switch
              value={reminderEnabled}
              onValueChange={(v) => { setReminderEnabled(v); saveSetting('reminderEnabled', v); }}
              trackColor={{ false: 'rgba(255,255,255,0.12)', true: COLORS.secondary }}
              thumbColor={reminderEnabled ? COLORS.primaryDark : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="volume-mute" size={20} color={COLORS.secondary} />
            <Text style={[styles.cardTitle, { color: COLORS.secondary }]}>
              {t('Ubwiyumvire', 'Silent Mode', 'الوضع الصامت')}
            </Text>
          </View>
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: COLORS.text }]}>
              {t('Kubasha Ukwiyumvire', 'Enable Silent Mode', 'تفعيل الوضع الصامت')}
            </Text>
            <Switch
              value={silentMode}
              onValueChange={(v) => { setSilentMode(v); saveSetting('silentMode', v); }}
              trackColor={{ false: 'rgba(255,255,255,0.12)', true: COLORS.secondary }}
              thumbColor={silentMode ? COLORS.primaryDark : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="bar-chart" size={20} color={COLORS.secondary} />
            <Text style={[styles.cardTitle, { color: COLORS.secondary }]}>
              {t('Ibiharuro', 'Statistics', 'الإحصائيات')}
            </Text>
          </View>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: COLORS.secondary }]}>{tracks.length}</Text>
              <Text style={[styles.statLabel, { color: COLORS.textMuted }]}>
                {t('Inyigisho', 'Lessons', 'دروس')}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: COLORS.secondary }]}>{videos.length}</Text>
              <Text style={[styles.statLabel, { color: COLORS.textMuted }]}>
                {t('Amashusho', 'Videos', 'فيديو')}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: COLORS.secondary }]}>{books.length}</Text>
              <Text style={[styles.statLabel, { color: COLORS.textMuted }]}>
                {t('Amatabo', 'Books', 'كتب')}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: COLORS.secondary }]}>{surahs.length}</Text>
              <Text style={[styles.statLabel, { color: COLORS.textMuted }]}>
                {t('Sura', 'Surahs', 'سور')}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={[styles.adminBtn, { borderColor: COLORS.border }]} onPress={() => navigation.navigate('Admin')}>
          <Ionicons name="shield-checkmark" size={20} color={COLORS.secondary} />
          <Text style={[styles.adminBtnText, { color: COLORS.secondary }]}>
            {t('Admin Login', 'Admin Login', 'دخول المسؤول')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingBottom: 10, gap: 12 },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 24, fontWeight: '700' },
  scroll: { padding: 20, paddingTop: 0, gap: 16, paddingBottom: 40 },
  logoIcon: { width: 64, height: 64, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  logoText: { fontSize: 22, fontWeight: '700', fontFamily: 'serif' },
  versionText: { fontSize: 12, marginTop: 2 },
  card: { borderRadius: 16, borderWidth: 1.5, padding: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  cardTitle: { fontSize: 16, fontWeight: '600', flex: 1 },
  langRow: { flexDirection: 'row', gap: 8 },
  langBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, borderColor: 'rgba(212,175,55,0.2)', alignItems: 'center', gap: 4 },
  langFlag: { fontSize: 20 },
  langLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  settingLabel: { fontSize: 14, flex: 1 },
  settingValue: { fontSize: 14, fontWeight: '700' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' },
  statItem: { width: '47%', padding: 14, borderRadius: 12, backgroundColor: 'rgba(212,175,55,0.06)', alignItems: 'center', gap: 4 },
  statNumber: { fontSize: 24, fontWeight: '700' },
  statLabel: { fontSize: 12 },
  adminBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, borderRadius: 14, borderWidth: 1.5 },
  adminBtnText: { fontSize: 14, fontWeight: '600' },
});
