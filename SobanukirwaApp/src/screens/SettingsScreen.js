import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import ScreenBackground from '../components/ScreenBackground';
import SilentBanner from '../components/SilentBanner';

const RECITER_OPTIONS = [
  { key: 'Adhan1', label: 'Adhan 1 (Makkah)', labelRw: 'Adhan 1 (Makka)', icon: 'mic' },
  { key: 'Adhan2', label: 'Adhan 2 (Madinah)', labelRw: 'Adhan 2 (Madina)', icon: 'mic' },
  { key: 'Mansour', label: 'Mansour Al-Qahtani', labelRw: 'Mansour Al-Qahtani', icon: 'mic' },
];

const PRAYER_KEYS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const VOLUME_LEVELS = [0, 25, 50, 75, 100];
const INTERVAL_OPTIONS = [5, 15, 30, 45, 60];

function GoldToggle({ value, onValueChange }) {
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: 'rgba(255,255,255,0.1)', true: '#d4af37' }}
      thumbColor={value ? '#0f2a3f' : '#f4f3f4'}
      ios_backgroundColor="rgba(255,255,255,0.1)"
    />
  );
}

function SectionDivider() {
  return <View style={styles.sectionDivider} />;
}

export default function SettingsScreen({ navigation }) {
  const {
    t, COLORS, language, setLanguage, tracks, videos, books, surahs,
    adhanEnabled, setAdhanEnabled, adhanVolume, setAdhanVolume, adhanReciter, setAdhanReciter,
    reminderEnabled, setReminderEnabled, reminderInterval, setReminderInterval,
    silentMode, setSilentMode, smartSilent, setSmartSilent,
    scheduledSilent, setScheduledSilent, silentFrom, setSilentFrom, silentTo, setSilentTo,
    silentPrayers, setSilentPrayers,
    saveSetting, adhkarReminder, setAdhkarReminder,
    isEffectivelySilent,
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

  function togglePrayerSilent(prayer) {
    const updated = { ...silentPrayers, [prayer]: !silentPrayers[prayer] };
    setSilentPrayers(updated);
    saveSetting('silentPrayers', updated);
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      <SilentBanner visible={isEffectivelySilent} />
      <ScreenBackground imageKey="bg-settings">
        {/* Header with gradient */}
        <View style={[styles.header, { backgroundColor: 'rgba(15,42,63,0.95)' }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Ionicons name="settings" size={20} color={COLORS.secondary} />
            <Text style={[styles.headerTitle, { color: COLORS.secondary }]}>
              {t('Igenamiterere', 'Settings', 'الإعدادات')}
            </Text>
          </View>
          <View style={{ width: 38 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={[styles.logoRing, { borderColor: 'rgba(212,175,55,0.25)' }]}>
              <View style={[styles.logoGlow, { backgroundColor: 'rgba(212,175,55,0.1)' }]} />
              <View style={[styles.logoIcon, { borderColor: COLORS.secondary, backgroundColor: 'rgba(212,175,55,0.12)' }]}>
                <Image source={require('../../assets/icon.png')} style={styles.logoImage} resizeMode="contain" />
              </View>
            </View>
            <Text style={[styles.logoText, { color: COLORS.secondary }]}>Sobanukirwa</Text>
            <Text style={[styles.versionText, { color: COLORS.textMuted }]}>v2.0.0</Text>
            <View style={styles.diamondRow}>
              <View style={[styles.diamondLine, { backgroundColor: COLORS.secondary }]} />
              <View style={[styles.diamond, { backgroundColor: COLORS.secondary }]}>
                <View style={styles.diamondInner} />
              </View>
              <View style={[styles.diamondLine, { backgroundColor: COLORS.secondary }]} />
            </View>
          </View>

          {/* Language */}
          <View style={[styles.section, { backgroundColor: 'rgba(30,60,92,0.25)', borderColor: COLORS.border }]}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <Ionicons name="globe" size={18} color={COLORS.secondary} />
                <Text style={[styles.sectionTitle, { color: COLORS.secondary }]}>
                  {t('Ururimi', 'Language', 'اللغة')}
                </Text>
              </View>
            </View>
            <View style={styles.sectionDividerLine} />
            <View style={styles.langRow}>
              {[
                { key: 'rw', label: 'Kinyarwanda', flag: '🇷🇼' },
                { key: 'en', label: 'English', flag: '🇬🇧' },
                { key: 'ar', label: 'العربية', flag: '🇸🇦' },
              ].map(lang => (
                <TouchableOpacity
                  key={lang.key}
                  style={[
                    styles.langBtn,
                    { borderColor: 'rgba(212,175,55,0.2)', backgroundColor: 'rgba(255,255,255,0.03)' },
                    language === lang.key && { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary }
                  ]}
                  onPress={() => {
                    setLanguage(lang.key);
                    saveSetting('language', lang.key);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.langFlag}>{lang.flag}</Text>
                  <Text style={[styles.langLabel, { color: language === lang.key ? COLORS.primaryDark : COLORS.text }]}>
                    {lang.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Adhan Settings */}
          <View style={[styles.section, { backgroundColor: 'rgba(30,60,92,0.25)', borderColor: COLORS.border }]}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <Ionicons name="volume-high" size={18} color={COLORS.secondary} />
                <Text style={[styles.sectionTitle, { color: COLORS.secondary }]}>
                  {t('Amategeko y\'Adhan', 'Adhan Settings', 'إعدادات الأذان')}
                </Text>
              </View>
            </View>
            <View style={styles.sectionDividerLine} />

            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <Ionicons name="notifications" size={16} color={COLORS.textMuted} />
                <Text style={[styles.settingLabel, { color: COLORS.text }]}>
                  {t('Kubasha Adhan', 'Enable Adhan', 'تشغيل الأذان')}
                </Text>
              </View>
              <GoldToggle
                value={adhanEnabled}
                onValueChange={(v) => { setAdhanEnabled(v); saveSetting('adhanEnabled', v); }}
              />
            </View>

            {adhanEnabled && (
              <>
                <View style={styles.settingItem}>
                  <View style={styles.settingItemLeft}>
                    <Ionicons name="person" size={16} color={COLORS.textMuted} />
                    <Text style={[styles.settingLabel, { color: COLORS.text }]}>
                      {t('Igicuruzwa cya Adhan', 'Adhan Reciter', 'قارئ الأذان')}
                    </Text>
                  </View>
                </View>
                <View style={styles.reciterRow}>
                  {RECITER_OPTIONS.map(r => (
                    <TouchableOpacity
                      key={r.key}
                      style={[
                        styles.reciterBtn,
                        { borderColor: 'rgba(212,175,55,0.2)', backgroundColor: 'rgba(255,255,255,0.03)' },
                        adhanReciter === r.key && { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary }
                      ]}
                      onPress={() => handleReciterChange(r.key)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name={r.icon} size={14} color={adhanReciter === r.key ? COLORS.primaryDark : COLORS.secondary} />
                      <Text style={[styles.reciterText, { color: adhanReciter === r.key ? COLORS.primaryDark : COLORS.text }]}>
                        {t(r.labelRw, r.label, r.label)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.settingItem}>
                  <View style={styles.settingItemLeft}>
                    <Ionicons name="volume-low" size={16} color={COLORS.textMuted} />
                    <Text style={[styles.settingLabel, { color: COLORS.text }]}>
                      {t('Igiteretero', 'Volume', 'الصوت')}
                    </Text>
                  </View>
                  <Text style={[styles.settingValue, { color: COLORS.secondary }]}>{adhanVolume}%</Text>
                </View>
                <View style={styles.volumeBarRow}>
                  {VOLUME_LEVELS.map(v => {
                    const isActive = adhanVolume >= v;
                    const isExact = adhanVolume === v;
                    return (
                      <TouchableOpacity
                        key={v}
                        style={styles.volumeBarItem}
                        onPress={() => handleVolumeChange(v)}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.volumeBarTrack, { backgroundColor: 'rgba(255,255,255,0.08)' }]}>
                          <View style={[
                            styles.volumeBarFill,
                            {
                              height: `${Math.max(30, (v / 100) * 100)}%`,
                              backgroundColor: isActive ? COLORS.secondary : 'rgba(255,255,255,0.15)',
                            }
                          ]} />
                        </View>
                        <Text style={[styles.volumeBarLabel, { color: isExact ? COLORS.secondary : COLORS.textMuted }]}>
                          {v}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}
          </View>

          {/* Reminders */}
          <View style={[styles.section, { backgroundColor: 'rgba(30,60,92,0.25)', borderColor: COLORS.border }]}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <Ionicons name="notifications" size={18} color={COLORS.secondary} />
                <Text style={[styles.sectionTitle, { color: COLORS.secondary }]}>
                  {t('Umwirondoro', 'Reminders', 'التذكيرات')}
                </Text>
              </View>
            </View>
            <View style={styles.sectionDividerLine} />

            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <Ionicons name="alarm" size={16} color={COLORS.textMuted} />
                <Text style={[styles.settingLabel, { color: COLORS.text }]}>
                  {t('Kubasha Ukwirondoro', 'Enable Reminders', 'تفعيل التذكيرات')}
                </Text>
              </View>
              <GoldToggle
                value={reminderEnabled}
                onValueChange={(v) => { setReminderEnabled(v); saveSetting('reminderEnabled', v); }}
              />
            </View>

            {reminderEnabled && (
              <>
                <View style={styles.settingItem}>
                  <View style={styles.settingItemLeft}>
                    <Ionicons name="hands" size={16} color={COLORS.textMuted} />
                    <Text style={[styles.settingLabel, { color: COLORS.text }]}>
                      {t('Adhkar Reminder', 'Adhkar Reminder', 'تذكير الأذكار')}
                    </Text>
                  </View>
                  <GoldToggle
                    value={adhkarReminder}
                    onValueChange={(v) => { setAdhkarReminder(v); saveSetting('adhkarReminder', v); }}
                  />
                </View>
                <View style={styles.settingItem}>
                  <View style={styles.settingItemLeft}>
                    <Ionicons name="time" size={16} color={COLORS.textMuted} />
                    <Text style={[styles.settingLabel, { color: COLORS.text }]}>
                      {t('Igihe gitera', 'Interval', 'الفترة')}
                    </Text>
                  </View>
                  <Text style={[styles.settingValue, { color: COLORS.secondary }]}>{reminderInterval} min</Text>
                </View>
                <View style={styles.intervalRow}>
                  {INTERVAL_OPTIONS.map(v => (
                    <TouchableOpacity
                      key={v}
                      style={[
                        styles.intervalBtn,
                        { borderColor: 'rgba(212,175,55,0.2)', backgroundColor: 'rgba(255,255,255,0.03)' },
                        reminderInterval === v && { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary }
                      ]}
                      onPress={() => handleReminderIntervalChange(v)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.intervalText, { color: reminderInterval === v ? COLORS.primaryDark : COLORS.text }]}>
                        {v}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </View>

          {/* Silent Mode */}
          <View style={[styles.section, { backgroundColor: 'rgba(30,60,92,0.25)', borderColor: COLORS.border }]}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <Ionicons name="volume-mute" size={18} color={COLORS.secondary} />
                <Text style={[styles.sectionTitle, { color: COLORS.secondary }]}>
                  {t('Ubwiyumvire', 'Silent Mode', 'الوضع الصامت')}
                </Text>
              </View>
            </View>
            <View style={styles.sectionDividerLine} />

            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <Ionicons name="moon" size={16} color={COLORS.textMuted} />
                <Text style={[styles.settingLabel, { color: COLORS.text }]}>
                  {t('Kubasha Ukwiyumvire', 'Enable Silent Mode', 'تفعيل الوضع الصامت')}
                </Text>
              </View>
              <GoldToggle
                value={silentMode}
                onValueChange={(v) => { setSilentMode(v); saveSetting('silentMode', v); }}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <Ionicons name="flash" size={16} color={COLORS.textMuted} />
                <Text style={[styles.settingLabel, { color: COLORS.text }]}>
                  {t('Smart Silent', 'Smart Silent (during prayer)', 'صامت ذكي')}
                </Text>
              </View>
              <GoldToggle
                value={smartSilent}
                onValueChange={(v) => { setSmartSilent(v); saveSetting('smartSilent', v); }}
              />
            </View>

            {smartSilent && (
              <View style={styles.prayerCheckboxes}>
                <Text style={[styles.checkboxLabel, { color: COLORS.textMuted }]}>
                  {t('Isengesho rigomba guceceka', 'Prayers for silent', 'صلوات للصمت')}
                </Text>
                <View style={styles.checkboxRow}>
                  {PRAYER_KEYS.map(p => (
                    <TouchableOpacity
                      key={p}
                      style={[
                        styles.checkbox,
                        { borderColor: 'rgba(212,175,55,0.2)', backgroundColor: 'rgba(255,255,255,0.03)' },
                        silentPrayers[p] && { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary }
                      ]}
                      onPress={() => togglePrayerSilent(p)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={silentPrayers[p] ? 'checkmark-circle' : 'ellipse-outline'}
                        size={14}
                        color={silentPrayers[p] ? COLORS.primaryDark : COLORS.textMuted}
                      />
                      <Text style={[styles.checkboxText, { color: silentPrayers[p] ? COLORS.primaryDark : COLORS.text }]}>
                        {t(p, p, p)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <Ionicons name="calendar" size={16} color={COLORS.textMuted} />
                <Text style={[styles.settingLabel, { color: COLORS.text }]}>
                  {t('Scheduled Silent', 'Scheduled Silent', 'صامت مجدول')}
                </Text>
              </View>
              <GoldToggle
                value={scheduledSilent}
                onValueChange={(v) => { setScheduledSilent(v); saveSetting('scheduledSilent', v); }}
              />
            </View>

            {scheduledSilent && (
              <View style={styles.timeRangeRow}>
                <View style={styles.timeInput}>
                  <Text style={[styles.timeLabel, { color: COLORS.textMuted }]}>{t('Kuva', 'From', 'من')}</Text>
                  <TouchableOpacity
                    style={[styles.timeBtn, { borderColor: COLORS.border, backgroundColor: 'rgba(255,255,255,0.04)' }]}
                    onPress={() => {
                      const h = parseInt(silentFrom.split(':')[0]);
                      const newH = (h + 1) % 24;
                      const val = `${String(newH).padStart(2, '0')}:${silentFrom.split(':')[1]}`;
                      setSilentFrom(val);
                      saveSetting('silentFrom', val);
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="time" size={14} color={COLORS.secondary} />
                    <Text style={[styles.timeText, { color: COLORS.text }]}>{silentFrom}</Text>
                    <Ionicons name="chevron-up" size={12} color={COLORS.textMuted} />
                  </TouchableOpacity>
                </View>
                <View style={styles.timeArrow}>
                  <Ionicons name="arrow-forward" size={16} color={COLORS.secondary} />
                </View>
                <View style={styles.timeInput}>
                  <Text style={[styles.timeLabel, { color: COLORS.textMuted }]}>{t('Kugeza', 'To', 'إلى')}</Text>
                  <TouchableOpacity
                    style={[styles.timeBtn, { borderColor: COLORS.border, backgroundColor: 'rgba(255,255,255,0.04)' }]}
                    onPress={() => {
                      const h = parseInt(silentTo.split(':')[0]);
                      const newH = (h + 1) % 24;
                      const val = `${String(newH).padStart(2, '0')}:${silentTo.split(':')[1]}`;
                      setSilentTo(val);
                      saveSetting('silentTo', val);
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="time" size={14} color={COLORS.secondary} />
                    <Text style={[styles.timeText, { color: COLORS.text }]}>{silentTo}</Text>
                    <Ionicons name="chevron-up" size={12} color={COLORS.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Statistics */}
          <View style={[styles.section, { backgroundColor: 'rgba(30,60,92,0.25)', borderColor: COLORS.border }]}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <Ionicons name="bar-chart" size={18} color={COLORS.secondary} />
                <Text style={[styles.sectionTitle, { color: COLORS.secondary }]}>
                  {t('Ibiharuro', 'Statistics', 'الإحصائيات')}
                </Text>
              </View>
            </View>
            <View style={styles.sectionDividerLine} />
            <View style={styles.statsGrid}>
              {[
                { count: tracks.length, labelRw: 'Inyigisho', labelEn: 'Lessons', labelAr: 'دروس', icon: 'headset' },
                { count: videos.length, labelRw: 'Amashusho', labelEn: 'Videos', labelAr: 'فيديو', icon: 'videocam' },
                { count: books.length, labelRw: 'Ibitabo', labelEn: 'Books', labelAr: 'كتب', icon: 'book' },
                { count: surahs.length, labelRw: 'Sura', labelEn: 'Surahs', labelAr: 'سور', icon: 'book-outline' },
              ].map((stat, i) => (
                <View key={i} style={[styles.statItem, { backgroundColor: 'rgba(212,175,55,0.06)', borderColor: 'rgba(212,175,55,0.12)' }]}>
                  <View style={[styles.statIconWrap, { backgroundColor: 'rgba(212,175,55,0.12)' }]}>
                    <Ionicons name={stat.icon} size={18} color={COLORS.secondary} />
                  </View>
                  <Text style={[styles.statNumber, { color: COLORS.secondary }]}>{stat.count}</Text>
                  <Text style={[styles.statLabel, { color: COLORS.textMuted }]}>{t(stat.labelRw, stat.labelEn, stat.labelAr)}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Admin Access */}
          <TouchableOpacity
            style={[styles.section, { backgroundColor: 'rgba(30,60,92,0.25)', borderColor: COLORS.border, flexDirection: 'row', alignItems: 'center', gap: 12 }]}
            onPress={() => navigation.navigate('Admin')}
            activeOpacity={0.7}
          >
            <View style={[styles.sectionHeaderLeft]}>
              <Ionicons name="shield-checkmark" size={18} color={COLORS.secondary} />
              <Text style={[styles.sectionTitle, { color: COLORS.secondary }]}>
                {t('Admin', 'Admin Panel', 'لوحة الإدارة')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footerSection}>
            <View style={styles.footerDividerRow}>
              <View style={[styles.footerLine, { backgroundColor: 'rgba(212,175,55,0.15)' }]} />
              <Ionicons name="star" size={10} color={COLORS.secondary} />
              <View style={[styles.footerLine, { backgroundColor: 'rgba(212,175,55,0.15)' }]} />
            </View>
            <Text style={[styles.footerText, { color: COLORS.textMuted }]}>
              {t('Sobanukirwa v2.0.0', 'Sobanukirwa v2.0.0', 'Sobanukirwa v2.0.0')}
            </Text>
            <Text style={[styles.footerSubText, { color: COLORS.textMuted }]}>
              {t('Urumuri rw\'abemeramana', 'Light of Faith', 'نور الإيمان')}
            </Text>
          </View>

        </ScrollView>
      </ScreenBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: 'rgba(212,175,55,0.12)',
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(30,60,92,0.3)', borderWidth: 1.5, borderColor: 'rgba(212,175,55,0.2)',
  },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700', fontFamily: 'serif' },
  scroll: { padding: 16, paddingBottom: 40, gap: 14 },

  /* Logo */
  logoSection: { alignItems: 'center', paddingVertical: 16, gap: 6 },
  logoRing: {
    width: 88, height: 88, borderRadius: 44, borderWidth: 3,
    alignItems: 'center', justifyContent: 'center', position: 'relative',
    shadowColor: '#d4af37', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
  },
  logoGlow: {
    position: 'absolute', top: -12, left: -12, right: -12, bottom: -12,
    borderRadius: 56, opacity: 0.5,
  },
  logoIcon: {
    width: 72, height: 72, borderRadius: 36, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  logoImage: { width: 58, height: 58, borderRadius: 29 },
  logoText: { fontSize: 24, fontWeight: '700', fontFamily: 'serif', marginTop: 8 },
  versionText: { fontSize: 12, marginTop: 2 },
  diamondRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  diamondLine: { width: 36, height: 1.5, borderRadius: 1 },
  diamond: {
    width: 8, height: 8, borderRadius: 2, transform: [{ rotate: '45deg' }],
    alignItems: 'center', justifyContent: 'center',
  },
  diamondInner: { width: 3, height: 3, borderRadius: 1, backgroundColor: '#0a1220' },

  /* Sections */
  section: { borderRadius: 16, borderWidth: 1.5, padding: 16, overflow: 'hidden' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  sectionTitle: { fontSize: 15, fontWeight: '600', fontFamily: 'serif' },
  sectionDividerLine: { height: 1, backgroundColor: 'rgba(212,175,55,0.15)', marginVertical: 12 },
  sectionDivider: { height: 1, backgroundColor: 'rgba(212,175,55,0.1)', marginVertical: 4 },

  /* Language */
  langRow: { flexDirection: 'row', gap: 8 },
  langBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5,
    alignItems: 'center', gap: 4,
  },
  langFlag: { fontSize: 22 },
  langLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center' },

  /* Settings */
  settingItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  settingItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  settingLabel: { fontSize: 13, flex: 1 },
  settingValue: { fontSize: 13, fontWeight: '700' },

  /* Reciter */
  reciterRow: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  reciterBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5,
    alignItems: 'center', gap: 4,
  },
  reciterText: { fontSize: 10, fontWeight: '600', textAlign: 'center' },

  /* Volume Bars */
  volumeBarRow: {
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
    paddingVertical: 8, paddingHorizontal: 4, marginBottom: 8,
  },
  volumeBarItem: { alignItems: 'center', gap: 6, flex: 1 },
  volumeBarTrack: {
    width: 28, height: 50, borderRadius: 6, overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  volumeBarFill: { width: '100%', borderRadius: 6 },
  volumeBarLabel: { fontSize: 10, fontWeight: '600' },

  /* Interval */
  intervalRow: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  intervalBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, alignItems: 'center',
  },
  intervalText: { fontSize: 12, fontWeight: '700' },

  /* Prayer Checkboxes */
  prayerCheckboxes: { paddingVertical: 8 },
  checkboxLabel: { fontSize: 12, marginBottom: 8 },
  checkboxRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  checkbox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5,
  },
  checkboxText: { fontSize: 12, fontWeight: '600' },

  /* Time Range */
  timeRangeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  timeInput: { flex: 1, gap: 4 },
  timeLabel: { fontSize: 11, textAlign: 'center', fontWeight: '500' },
  timeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10, borderRadius: 10, borderWidth: 1.5,
  },
  timeText: { fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] },
  timeArrow: { paddingTop: 16 },

  /* Stats */
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statItem: {
    width: '47%', padding: 14, borderRadius: 12, borderWidth: 1,
    alignItems: 'center', gap: 6,
  },
  statIconWrap: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statNumber: { fontSize: 22, fontWeight: '700' },
  statLabel: { fontSize: 11, fontWeight: '500' },

  /* Footer */
  footerSection: { alignItems: 'center', paddingVertical: 16, gap: 6 },
  footerDividerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  footerLine: { width: 30, height: 1.5, borderRadius: 1 },
  footerText: { fontSize: 12, fontWeight: '600' },
  footerSubText: { fontSize: 11, fontStyle: 'italic' },
});
