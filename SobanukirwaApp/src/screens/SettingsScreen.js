import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

const RECITER_OPTIONS = [
  { key: 'Adhan1', label: 'Adhan 1 (Makkah)', labelRw: 'Adhan 1 (Makka)' },
  { key: 'Adhan2', label: 'Adhan 2 (Madinah)', labelRw: 'Adhan 2 (Madina)' },
  { key: 'Mansour', label: 'Mansour Al-Qahtani', labelRw: 'Mansour Al-Qahtani' },
];

const PRAYER_KEYS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

export default function SettingsScreen({ navigation }) {
  const {
    t, COLORS, language, setLanguage, tracks, videos, books, surahs,
    adhanEnabled, setAdhanEnabled, adhanVolume, setAdhanVolume, adhanReciter, setAdhanReciter,
    reminderEnabled, setReminderEnabled, reminderInterval, setReminderInterval,
    silentMode, setSilentMode, smartSilent, setSmartSilent,
    scheduledSilent, setScheduledSilent, silentFrom, setSilentFrom, silentTo, setSilentTo,
    silentPrayers, setSilentPrayers,
    saveSetting, adhkarReminder, setAdhkarReminder,
  } = useApp();

  function handleReciterChange(key) {
    setAdhanReciter(key);
    saveSetting('adhanReciter', key);
  }

  function handleVolumeChange(val) {
    setAdhanVolume(val);
    saveSetting('adhanVolume', val);
  }

  function handleReminderIntervalChange(val) {
    setReminderInterval(val);
    saveSetting('reminderInterval', val);
  }

  function handleSilentFromChange() {
    Alert.alert('Silent From', 'Use +/- buttons', [
      { text: 'OK' }
    ]);
  }

  function togglePrayerSilent(prayer) {
    const updated = { ...silentPrayers, [prayer]: !silentPrayers[prayer] };
    setSilentPrayers(updated);
    saveSetting('silentPrayers', updated);
  }

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
          <Text style={[styles.versionText, { color: COLORS.textMuted }]}>v2.0.0</Text>
        </View>

        {/* Language */}
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

        {/* Adhan Settings */}
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

          {adhanEnabled && (
            <>
              <View style={styles.settingRow}>
                <Text style={[styles.settingLabel, { color: COLORS.text }]}>
                  {t('Igicuruzwa cya Adhan', 'Adhan Reciter', 'قارئ الأذان')}
                </Text>
              </View>
              <View style={styles.reciterRow}>
                {RECITER_OPTIONS.map(r => (
                  <TouchableOpacity
                    key={r.key}
                    style={[styles.reciterBtn, adhanReciter === r.key && { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary }]}
                    onPress={() => handleReciterChange(r.key)}
                  >
                    <Text style={[styles.reciterText, { color: adhanReciter === r.key ? COLORS.primaryDark : COLORS.text }]}>
                      {t(r.labelRw, r.label, r.label)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.settingRow}>
                <Text style={[styles.settingLabel, { color: COLORS.text }]}>
                  {t('Igiteretero', 'Volume', 'الصوت')} ({adhanVolume}%)
                </Text>
              </View>
              <View style={styles.sliderRow}>
                <Ionicons name="volume-low" size={16} color={COLORS.textMuted} />
                {[0, 25, 50, 75, 100].map(v => (
                  <TouchableOpacity
                    key={v}
                    style={[styles.volBtn, adhanVolume === v && { backgroundColor: COLORS.secondary }]}
                    onPress={() => handleVolumeChange(v)}
                  >
                    <Text style={[styles.volBtnText, { color: adhanVolume === v ? COLORS.primaryDark : COLORS.text }]}>
                      {v}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </View>

        {/* Reminders */}
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

          {reminderEnabled && (
            <>
              <View style={styles.settingRow}>
                <Text style={[styles.settingLabel, { color: COLORS.text }]}>
                  {t('Adhkar Reminder', 'Adhkar Reminder', 'تذكير الأذكار')}
                </Text>
                <Switch
                  value={adhkarReminder}
                  onValueChange={(v) => { setAdhkarReminder(v); saveSetting('adhkarReminder', v); }}
                  trackColor={{ false: 'rgba(255,255,255,0.12)', true: COLORS.secondary }}
                  thumbColor={adhkarReminder ? COLORS.primaryDark : '#f4f3f4'}
                />
              </View>
              <View style={styles.settingRow}>
                <Text style={[styles.settingLabel, { color: COLORS.text }]}>
                  {t('Igihe gitera', 'Interval', 'الفترة')} ({reminderInterval} min)
                </Text>
              </View>
              <View style={styles.sliderRow}>
                {[5, 15, 30, 45, 60].map(v => (
                  <TouchableOpacity
                    key={v}
                    style={[styles.volBtn, reminderInterval === v && { backgroundColor: COLORS.secondary }]}
                    onPress={() => handleReminderIntervalChange(v)}
                  >
                    <Text style={[styles.volBtnText, { color: reminderInterval === v ? COLORS.primaryDark : COLORS.text }]}>
                      {v}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </View>

        {/* Silent Mode */}
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

          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: COLORS.text }]}>
              {t('Smart Silent', 'Smart Silent (during prayer)', 'صامت ذكي')}
            </Text>
            <Switch
              value={smartSilent}
              onValueChange={(v) => { setSmartSilent(v); saveSetting('smartSilent', v); }}
              trackColor={{ false: 'rgba(255,255,255,0.12)', true: COLORS.secondary }}
              thumbColor={smartSilent ? COLORS.primaryDark : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: COLORS.text }]}>
              {t('Scheduled Silent', 'Scheduled Silent', 'صامت مجدول')}
            </Text>
            <Switch
              value={scheduledSilent}
              onValueChange={(v) => { setScheduledSilent(v); saveSetting('scheduledSilent', v); }}
              trackColor={{ false: 'rgba(255,255,255,0.12)', true: COLORS.secondary }}
              thumbColor={scheduledSilent ? COLORS.primaryDark : '#f4f3f4'}
            />
          </View>

          {scheduledSilent && (
            <View style={styles.timeRangeRow}>
              <View style={styles.timeInput}>
                <Text style={[styles.timeLabel, { color: COLORS.textMuted }]}>{t('Kuva', 'From', 'من')}</Text>
                <TouchableOpacity
                  style={[styles.timeBtn, { borderColor: COLORS.border }]}
                  onPress={() => {
                    const h = parseInt(silentFrom.split(':')[0]);
                    const newH = (h + 1) % 24;
                    const val = `${String(newH).padStart(2, '0')}:${silentFrom.split(':')[1]}`;
                    setSilentFrom(val);
                    saveSetting('silentFrom', val);
                  }}
                >
                  <Text style={[styles.timeText, { color: COLORS.text }]}>{silentFrom}</Text>
                  <Ionicons name="time" size={14} color={COLORS.secondary} />
                </TouchableOpacity>
              </View>
              <Ionicons name="arrow-forward" size={18} color={COLORS.textMuted} />
              <View style={styles.timeInput}>
                <Text style={[styles.timeLabel, { color: COLORS.textMuted }]}>{t('Kugeza', 'To', 'إلى')}</Text>
                <TouchableOpacity
                  style={[styles.timeBtn, { borderColor: COLORS.border }]}
                  onPress={() => {
                    const h = parseInt(silentTo.split(':')[0]);
                    const newH = (h + 1) % 24;
                    const val = `${String(newH).padStart(2, '0')}:${silentTo.split(':')[1]}`;
                    setSilentTo(val);
                    saveSetting('silentTo', val);
                  }}
                >
                  <Text style={[styles.timeText, { color: COLORS.text }]}>{silentTo}</Text>
                  <Ionicons name="time" size={14} color={COLORS.secondary} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {smartSilent && (
            <View style={styles.prayerCheckboxes}>
              <Text style={[styles.checkboxLabel, { color: COLORS.textMuted }]}>
                {t('Isengesho rigomba guceceka', 'Prayers for silent', 'صلوات للصمت')}
              </Text>
              <View style={styles.checkboxRow}>
                {PRAYER_KEYS.map(p => (
                  <TouchableOpacity
                    key={p}
                    style={[styles.checkbox, silentPrayers[p] && { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary }]}
                    onPress={() => togglePrayerSilent(p)}
                  >
                    <Text style={[styles.checkboxText, { color: silentPrayers[p] ? COLORS.primaryDark : COLORS.text }]}>
                      {t(p, p, p)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Statistics */}
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
              <Text style={[styles.statLabel, { color: COLORS.textMuted }]}>{t('Inyigisho', 'Lessons', 'دروس')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: COLORS.secondary }]}>{videos.length}</Text>
              <Text style={[styles.statLabel, { color: COLORS.textMuted }]}>{t('Amashusho', 'Videos', 'فيديو')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: COLORS.secondary }]}>{books.length}</Text>
              <Text style={[styles.statLabel, { color: COLORS.textMuted }]}>{t('Amatabo', 'Books', 'كتب')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: COLORS.secondary }]}>{surahs.length}</Text>
              <Text style={[styles.statLabel, { color: COLORS.textMuted }]}>{t('Sura', 'Surahs', 'سور')}</Text>
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
  reciterRow: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  reciterBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: 'rgba(212,175,55,0.2)', alignItems: 'center' },
  reciterText: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  sliderRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  volBtn: { width: 44, height: 32, borderRadius: 8, borderWidth: 1.5, borderColor: 'rgba(212,175,55,0.2)', alignItems: 'center', justifyContent: 'center' },
  volBtnText: { fontSize: 11, fontWeight: '700' },
  timeRangeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  timeInput: { flex: 1, gap: 4 },
  timeLabel: { fontSize: 11, textAlign: 'center' },
  timeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5 },
  timeText: { fontSize: 14, fontWeight: '700' },
  prayerCheckboxes: { paddingVertical: 8 },
  checkboxLabel: { fontSize: 12, marginBottom: 8 },
  checkboxRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  checkbox: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: 'rgba(212,175,55,0.2)' },
  checkboxText: { fontSize: 12, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' },
  statItem: { width: '47%', padding: 14, borderRadius: 12, backgroundColor: 'rgba(212,175,55,0.06)', alignItems: 'center', gap: 4 },
  statNumber: { fontSize: 24, fontWeight: '700' },
  statLabel: { fontSize: 12 },
  adminBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, borderRadius: 14, borderWidth: 1.5 },
  adminBtnText: { fontSize: 14, fontWeight: '600' },
});
