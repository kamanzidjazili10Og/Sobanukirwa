import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Animated, Dimensions, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Settings, Globe, Bell, Volume2, Moon, Shield, ChevronLeft, ChevronRight, Check, HardDrive, Star } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import SilentBanner from '../components/SilentBanner';

const { width } = Dimensions.get('window');

const RECITER_OPTIONS = [
  { key: 'Adhan1', label: 'Adhan 1 (Makkah)', labelRw: 'Adhan 1 (Makka)' },
  { key: 'Adhan2', label: 'Adhan 2 (Madinah)', labelRw: 'Adhan 2 (Madina)' },
  { key: 'Mansour', label: 'Mansour Al-Qahtani', labelRw: 'Mansour Al-Qahtani' },
];

const PRAYER_KEYS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const VOLUME_LEVELS = [0, 25, 50, 75, 100];
const INTERVAL_OPTIONS = [5, 15, 30, 45, 60];

function GlassToggle({ value, onValueChange }) {
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: 'rgba(255,255,255,0.15)', true: '#14B8A6' }}
      thumbColor={value ? '#FFFFFF' : 'rgba(255,255,255,0.6)'}
      ios_backgroundColor="rgba(255,255,255,0.15)"
    />
  );
}

function SectionCard({ children, delay = 0 }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      {children}
    </Animated.View>
  );
}

export default function SettingsScreen({ navigation }) {
  const [cacheInfo, setCacheInfo] = useState({ lastUpdated: null, itemCounts: {}, totalItems: 0 });
  const headerFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerFade, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    loadCacheInfo();
  }, []);

  async function loadCacheInfo() {
    if (getCacheInfo) {
      const info = await getCacheInfo();
      setCacheInfo(info);
    }
  }

  async function handleClearCache() {
    if (clearCache) {
      await clearCache();
      loadCacheInfo();
    }
  }

  const {
    t, language, setLanguage, tracks, videos, books, surahs,
    adhanEnabled, setAdhanEnabled, adhanVolume, setAdhanVolume, adhanReciter, setAdhanReciter,
    reminderEnabled, setReminderEnabled, reminderInterval, setReminderInterval,
    silentMode, setSilentMode, smartSilent, setSmartSilent,
    scheduledSilent, setScheduledSilent, silentFrom, setSilentFrom, silentTo, setSilentTo,
    silentPrayers, setSilentPrayers,
    saveSetting, adhkarReminder, setAdhkarReminder,
    isEffectivelySilent, clearCache, getCacheInfo,
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
    <View style={styles.bgContainer}>
      <ImageBackground source={require('../../assets/bg-home.jpg')} style={styles.bgImage} resizeMode="cover">
        <LinearGradient
          colors={['rgba(11,26,42,0.9)', 'rgba(0,0,0,0.7)']}
          style={styles.overlay}
        />
        <SafeAreaView style={styles.container}>
          <SilentBanner visible={isEffectivelySilent} />

          <Animated.View style={[styles.header, { opacity: headerFade }]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <ChevronLeft size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <View style={styles.headerIconWrap}>
                <Settings size={16} color="#FFFFFF" />
              </View>
              <Text style={styles.headerTitle}>
                {t('Igenamiterere', 'Settings', 'الإعدادات')}
              </Text>
            </View>
            <View style={{ width: 38 }} />
          </Animated.View>

          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

            {/* Language */}
            <SectionCard delay={0}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderLeft}>
                  <View style={[styles.sectionIconWrap, { backgroundColor: 'rgba(20,184,166,0.15)' }]}>
                    <Globe size={18} color="#5EEAD4" />
                  </View>
                  <View>
                    <Text style={styles.sectionTitle}>
                      {t('Ururimi', 'Language', 'اللغة')}
                    </Text>
                    <Text style={styles.sectionSub}>{t('Hitamwo ururimi', 'Choose language', 'اختر اللغة')}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.sectionDivider} />
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
                      language === lang.key && styles.langBtnActive
                    ]}
                    onPress={() => {
                      setLanguage(lang.key);
                      saveSetting('language', lang.key);
                    }}
                    activeOpacity={0.7}
                  >
                    {language === lang.key && <Check size={12} color="#FFFFFF" style={styles.langCheck} />}
                    <Text style={styles.langFlag}>{lang.flag}</Text>
                    <Text style={[styles.langLabel, language === lang.key && styles.langLabelActive]}>
                      {lang.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </SectionCard>

            {/* Adhan Settings */}
            <SectionCard delay={80}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderLeft}>
                  <View style={[styles.sectionIconWrap, { backgroundColor: 'rgba(245,158,11,0.15)' }]}>
                    <Volume2 size={18} color="#FBBF24" />
                  </View>
                  <View>
                    <Text style={styles.sectionTitle}>
                      {t('Amategeko y\'Adhan', 'Adhan Settings', 'إعدادات الأذان')}
                    </Text>
                    <Text style={styles.sectionSub}>{t('Gushyiraho Adhan', 'Configure adhan', 'ضبط الأذان')}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.sectionDivider} />

              <View style={styles.settingItem}>
                <View style={styles.settingItemLeft}>
                  <Bell size={16} color="rgba(255,255,255,0.6)" />
                  <Text style={styles.settingLabel}>
                    {t('Kubasha Adhan', 'Enable Adhan', 'تشغيل الأذان')}
                  </Text>
                </View>
                <GlassToggle
                  value={adhanEnabled}
                  onValueChange={(v) => { setAdhanEnabled(v); saveSetting('adhanEnabled', v); }}
                />
              </View>

              {adhanEnabled && (
                <>
                  <View style={styles.settingItem}>
                    <View style={styles.settingItemLeft}>
                      <Text style={[styles.settingLabel, { paddingLeft: 26 }]}>
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
                          adhanReciter === r.key && styles.reciterBtnActive
                        ]}
                        onPress={() => handleReciterChange(r.key)}
                        activeOpacity={0.7}
                      >
                        {adhanReciter === r.key && <Check size={12} color="#FFFFFF" />}
                        <Text style={[styles.reciterText, adhanReciter === r.key && styles.reciterTextActive]}>
                          {t(r.labelRw, r.label, r.label)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={styles.settingItem}>
                    <View style={styles.settingItemLeft}>
                      <Volume2 size={16} color="rgba(255,255,255,0.6)" />
                      <Text style={styles.settingLabel}>
                        {t('Igiteretero', 'Volume', 'الصوت')}
                      </Text>
                    </View>
                    <Text style={styles.settingValue}>{adhanVolume}%</Text>
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
                          <View style={styles.volumeBarTrack}>
                            <View style={[
                              styles.volumeBarFill,
                              {
                                height: `${Math.max(30, (v / 100) * 100)}%`,
                                backgroundColor: isActive ? '#14B8A6' : 'rgba(255,255,255,0.1)',
                              }
                            ]} />
                          </View>
                          <Text style={[styles.volumeBarLabel, { color: isExact ? '#5EEAD4' : 'rgba(255,255,255,0.4)' }]}>
                            {v}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </>
              )}
            </SectionCard>

            {/* Reminders */}
            <SectionCard delay={160}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderLeft}>
                  <View style={[styles.sectionIconWrap, { backgroundColor: 'rgba(94,234,212,0.15)' }]}>
                    <Bell size={18} color="#5EEAD4" />
                  </View>
                  <View>
                    <Text style={styles.sectionTitle}>
                      {t('Umwirondoro', 'Reminders', 'التذكيرات')}
                    </Text>
                    <Text style={styles.sectionSub}>{t('Amabwiriza', 'Notifications', 'إشعارات')}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.sectionDivider} />

              <View style={styles.settingItem}>
                <View style={styles.settingItemLeft}>
                  <Bell size={16} color="rgba(255,255,255,0.6)" />
                  <Text style={styles.settingLabel}>
                    {t('Kubasha Ukwirondoro', 'Enable Reminders', 'تفعيل التذكيرات')}
                  </Text>
                </View>
                <GlassToggle
                  value={reminderEnabled}
                  onValueChange={(v) => { setReminderEnabled(v); saveSetting('reminderEnabled', v); }}
                />
              </View>

              {reminderEnabled && (
                <>
                  <View style={styles.settingItem}>
                    <View style={styles.settingItemLeft}>
                      <Moon size={16} color="rgba(255,255,255,0.6)" />
                      <Text style={styles.settingLabel}>
                        {t('Adhkar Reminder', 'Adhkar Reminder', 'تذكير الأذكار')}
                      </Text>
                    </View>
                    <GlassToggle
                      value={adhkarReminder}
                      onValueChange={(v) => { setAdhkarReminder(v); saveSetting('adhkarReminder', v); }}
                    />
                  </View>
                  <View style={styles.settingItem}>
                    <View style={styles.settingItemLeft}>
                      <Bell size={16} color="rgba(255,255,255,0.6)" />
                      <Text style={styles.settingLabel}>
                        {t('Igihe gitera', 'Interval', 'الفترة')}
                      </Text>
                    </View>
                    <Text style={styles.settingValue}>{reminderInterval} min</Text>
                  </View>
                  <View style={styles.intervalRow}>
                    {INTERVAL_OPTIONS.map(v => (
                      <TouchableOpacity
                        key={v}
                        style={[
                          styles.intervalBtn,
                          reminderInterval === v && styles.intervalBtnActive
                        ]}
                        onPress={() => handleReminderIntervalChange(v)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.intervalText, reminderInterval === v && styles.intervalTextActive]}>
                          {v}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}
            </SectionCard>

            {/* Silent Mode */}
            <SectionCard delay={240}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderLeft}>
                  <View style={[styles.sectionIconWrap, { backgroundColor: 'rgba(148,163,184,0.15)' }]}>
                    <Moon size={18} color="#94A3B8" />
                  </View>
                  <View>
                    <Text style={styles.sectionTitle}>
                      {t('Ubwiyumvire', 'Silent Mode', 'الوضع الصامت')}
                    </Text>
                    <Text style={styles.sectionSub}>{t('Guceceka mu gihe', 'Quiet hours', 'ساعات الصمت')}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.sectionDivider} />

              <View style={styles.settingItem}>
                <View style={styles.settingItemLeft}>
                  <Moon size={16} color="rgba(255,255,255,0.6)" />
                  <Text style={styles.settingLabel}>
                    {t('Kubasha Ukwiyumvire', 'Enable Silent Mode', 'تفعيل الوضع الصامت')}
                  </Text>
                </View>
                <GlassToggle
                  value={silentMode}
                  onValueChange={(v) => { setSilentMode(v); saveSetting('silentMode', v); }}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingItemLeft}>
                  <Moon size={16} color="rgba(255,255,255,0.6)" />
                  <Text style={styles.settingLabel}>
                    {t('Smart Silent', 'Smart Silent (during prayer)', 'صامت ذكي')}
                  </Text>
                </View>
                <GlassToggle
                  value={smartSilent}
                  onValueChange={(v) => { setSmartSilent(v); saveSetting('smartSilent', v); }}
                />
              </View>

              {smartSilent && (
                <View style={styles.prayerCheckboxes}>
                  <Text style={styles.checkboxLabel}>
                    {t('Isengesho rigomba guceceka', 'Prayers for silent', 'صلوات للصمت')}
                  </Text>
                  <View style={styles.checkboxRow}>
                    {PRAYER_KEYS.map(p => (
                      <TouchableOpacity
                        key={p}
                        style={[
                          styles.checkbox,
                          silentPrayers[p] && styles.checkboxActive
                        ]}
                        onPress={() => togglePrayerSilent(p)}
                        activeOpacity={0.7}
                      >
                        {silentPrayers[p] ? (
                          <Check size={14} color="#FFFFFF" />
                        ) : (
                          <View style={styles.checkboxEmpty} />
                        )}
                        <Text style={[styles.checkboxText, silentPrayers[p] && styles.checkboxTextActive]}>
                          {t(p, p, p)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              <View style={styles.settingItem}>
                <View style={styles.settingItemLeft}>
                  <Bell size={16} color="rgba(255,255,255,0.6)" />
                  <Text style={styles.settingLabel}>
                    {t('Scheduled Silent', 'Scheduled Silent', 'صامت مجدول')}
                  </Text>
                </View>
                <GlassToggle
                  value={scheduledSilent}
                  onValueChange={(v) => { setScheduledSilent(v); saveSetting('scheduledSilent', v); }}
                />
              </View>

              {scheduledSilent && (
                <View style={styles.timeRangeRow}>
                  <View style={styles.timeInput}>
                    <Text style={styles.timeLabel}>{t('Kuva', 'From', 'من')}</Text>
                    <TouchableOpacity
                      style={styles.timeBtn}
                      onPress={() => {
                        const h = parseInt(silentFrom.split(':')[0]);
                        const newH = (h + 1) % 24;
                        const val = `${String(newH).padStart(2, '0')}:${silentFrom.split(':')[1]}`;
                        setSilentFrom(val);
                        saveSetting('silentFrom', val);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.timeText}>{silentFrom}</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.timeArrow}>
                    <ChevronRight size={16} color="#5EEAD4" style={{ transform: [{ rotate: '0deg' }] }} />
                  </View>
                  <View style={styles.timeInput}>
                    <Text style={styles.timeLabel}>{t('Kugeza', 'To', 'إلى')}</Text>
                    <TouchableOpacity
                      style={styles.timeBtn}
                      onPress={() => {
                        const h = parseInt(silentTo.split(':')[0]);
                        const newH = (h + 1) % 24;
                        const val = `${String(newH).padStart(2, '0')}:${silentTo.split(':')[1]}`;
                        setSilentTo(val);
                        saveSetting('silentTo', val);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.timeText}>{silentTo}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </SectionCard>

            {/* Statistics */}
            <SectionCard delay={320}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderLeft}>
                  <View style={[styles.sectionIconWrap, { backgroundColor: 'rgba(245,158,11,0.15)' }]}>
                    <Star size={18} color="#F59E0B" />
                  </View>
                  <View>
                    <Text style={styles.sectionTitle}>
                      {t('Ibiharuro', 'Statistics', 'الإحصائيات')}
                    </Text>
                    <Text style={styles.sectionSub}>{t('Ibiciro vyose', 'Content overview', 'نظرة عامة')}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.sectionDivider} />
              <View style={styles.statsGrid}>
                {[
                  { count: tracks.length, labelRw: 'Inyigisho', labelEn: 'Lessons', labelAr: 'دروس', icon: 'headset', color: '#5EEAD4' },
                  { count: videos.length, labelRw: 'Amashusho', labelEn: 'Videos', labelAr: 'فيديو', icon: 'videocam', color: '#F59E0B' },
                  { count: books.length, labelRw: 'Ibitabo', labelEn: 'Books', labelAr: 'كتب', icon: 'book', color: '#14B8A6' },
                  { count: surahs.length, labelRw: 'Sura', labelEn: 'Surahs', labelAr: 'سور', icon: 'book-outline', color: '#FBBF24' },
                ].map((stat, i) => (
                  <View key={i} style={styles.statItem}>
                    <View style={[styles.statIconWrap, { backgroundColor: stat.color + '18' }]}>
                      <Volume2 size={18} color={stat.color} />
                    </View>
                    <Text style={[styles.statNumber, { color: stat.color }]}>{stat.count}</Text>
                    <Text style={styles.statLabel}>{t(stat.labelRw, stat.labelEn, stat.labelAr)}</Text>
                  </View>
                ))}
              </View>
            </SectionCard>

            {/* Offline Cache */}
            <SectionCard delay={400}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderLeft}>
                  <View style={[styles.sectionIconWrap, { backgroundColor: 'rgba(94,234,212,0.15)' }]}>
                    <HardDrive size={18} color="#5EEAD4" />
                  </View>
                  <View>
                    <Text style={styles.sectionTitle}>
                      {t('Ubukungu bw\'Offline', 'Offline Cache', 'التخزين المؤقت')}
                    </Text>
                    <Text style={styles.sectionSub}>{t('Ibihinguro vyabitswe', 'Stored data', 'البيانات المخزنة')}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.sectionDivider} />
              <View style={styles.settingItem}>
                <View style={styles.settingItemLeft}>
                  <HardDrive size={16} color="rgba(255,255,255,0.6)" />
                  <Text style={styles.settingLabel}>
                    {t('Ibihinguro vyabitswe', 'Cached Items', 'العناصر المخزنة')}
                  </Text>
                </View>
                <Text style={styles.settingValue}>{cacheInfo.totalItems}</Text>
              </View>
              {cacheInfo.lastUpdated && (
                <View style={styles.settingItem}>
                  <View style={styles.settingItemLeft}>
                    <Text style={[styles.settingLabel, { paddingLeft: 26 }]}>
                      {t('Igihe yavuguruwe', 'Last Updated', 'آخر تحديث')}
                    </Text>
                  </View>
                  <Text style={[styles.settingValue, { fontSize: 11, color: 'rgba(255,255,255,0.5)' }]}>
                    {cacheInfo.lastUpdated.toLocaleDateString()} {cacheInfo.lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              )}
              <TouchableOpacity style={styles.clearCacheBtn} onPress={handleClearCache} activeOpacity={0.7}>
                <Text style={styles.clearCacheBtnText}>
                  {t('Siba Ubukungu', 'Clear Cache', 'مسح التخزين المؤقت')}
                </Text>
              </TouchableOpacity>
            </SectionCard>

            {/* Admin Access */}
            <TouchableOpacity
              style={styles.adminCard}
              onPress={() => navigation.navigate('Admin')}
              activeOpacity={0.7}
            >
              <View style={styles.adminLeft}>
                <View style={[styles.sectionIconWrap, { backgroundColor: 'rgba(245,158,11,0.15)' }]}>
                  <Shield size={18} color="#F59E0B" />
                </View>
                <View>
                  <Text style={styles.sectionTitle}>
                    {t('Admin', 'Admin Panel', 'لوحة الإدارة')}
                  </Text>
                  <Text style={styles.sectionSub}>{t('Gukoza amategeko', 'Manage content', 'إدارة المحتوى')}</Text>
                </View>
              </View>
              <View style={styles.adminArrowWrap}>
                <ChevronRight size={18} color="rgba(255,255,255,0.4)" />
              </View>
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footerSection}>
              <View style={styles.footerDividerRow}>
                <View style={styles.footerLine} />
                <Settings size={10} color="rgba(255,255,255,0.3)" />
                <View style={styles.footerLine} />
              </View>
              <Text style={styles.footerText}>
                {t('Sobanukirwa v2.0.0', 'Sobanukirwa v2.0.0', 'Sobanukirwa v2.0.0')}
              </Text>
              <Text style={styles.footerSubText}>
                {t('Urumuri rw\'abemeramana', 'Light of Faith', 'نور الإيمان')}
              </Text>
            </View>

          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  bgContainer: { flex: 1 },
  bgImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  container: { flex: 1, backgroundColor: 'transparent' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerIconWrap: {
    width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(20,184,166,0.2)',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  scroll: { padding: 16, paddingBottom: 40, gap: 14 },

  /* Sections */
  section: {
    borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(0,0,0,0.25)', padding: 16, overflow: 'hidden',
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  sectionIconWrap: {
    width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  sectionSub: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  sectionDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 14 },

  /* Language */
  langRow: { flexDirection: 'row', gap: 8 },
  langBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)', backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center', gap: 4,
  },
  langBtnActive: {
    backgroundColor: 'rgba(20,184,166,0.25)', borderColor: '#14B8A6',
  },
  langCheck: { position: 'absolute', top: 6, right: 6 },
  langFlag: { fontSize: 22 },
  langLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center', color: 'rgba(255,255,255,0.6)' },
  langLabelActive: { color: '#5EEAD4' },

  /* Settings */
  settingItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  settingItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  settingLabel: { fontSize: 13, flex: 1, color: 'rgba(255,255,255,0.85)' },
  settingValue: { fontSize: 13, fontWeight: '700', color: '#5EEAD4' },

  /* Reciter */
  reciterRow: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  reciterBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center', gap: 4, flexDirection: 'row', justifyContent: 'center',
  },
  reciterBtnActive: { backgroundColor: 'rgba(20,184,166,0.25)', borderColor: '#14B8A6' },
  reciterText: { fontSize: 10, fontWeight: '600', textAlign: 'center', color: 'rgba(255,255,255,0.5)' },
  reciterTextActive: { color: '#5EEAD4' },

  /* Volume Bars */
  volumeBarRow: {
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
    paddingVertical: 8, paddingHorizontal: 4, marginBottom: 8,
  },
  volumeBarItem: { alignItems: 'center', gap: 6, flex: 1 },
  volumeBarTrack: {
    width: 28, height: 50, borderRadius: 6, overflow: 'hidden',
    justifyContent: 'flex-end', backgroundColor: 'rgba(255,255,255,0.06)',
  },
  volumeBarFill: { width: '100%', borderRadius: 6 },
  volumeBarLabel: { fontSize: 10, fontWeight: '600' },

  /* Interval */
  intervalRow: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  intervalBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1,
    alignItems: 'center', borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)',
  },
  intervalBtnActive: { backgroundColor: 'rgba(20,184,166,0.25)', borderColor: '#14B8A6' },
  intervalText: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.5)' },
  intervalTextActive: { color: '#5EEAD4' },

  /* Prayer Checkboxes */
  prayerCheckboxes: { paddingVertical: 8 },
  checkboxLabel: { fontSize: 12, marginBottom: 8, color: 'rgba(255,255,255,0.5)' },
  checkboxRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  checkbox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)',
  },
  checkboxActive: { backgroundColor: 'rgba(20,184,166,0.25)', borderColor: '#14B8A6' },
  checkboxEmpty: { width: 14, height: 14, borderRadius: 7, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)' },
  checkboxText: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.5)' },
  checkboxTextActive: { color: '#5EEAD4' },

  /* Time Range */
  timeRangeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  timeInput: { flex: 1, gap: 4 },
  timeLabel: { fontSize: 11, textAlign: 'center', fontWeight: '500', color: 'rgba(255,255,255,0.5)' },
  timeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10, borderRadius: 10, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)', backgroundColor: 'rgba(255,255,255,0.05)',
  },
  timeText: { fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'], color: '#FFFFFF' },
  timeArrow: { paddingTop: 16 },

  /* Clear Cache */
  clearCacheBtn: {
    width: '100%', paddingVertical: 12, borderRadius: 12, borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.4)', backgroundColor: 'rgba(239,68,68,0.1)',
    alignItems: 'center', justifyContent: 'center', marginTop: 8,
  },
  clearCacheBtnText: { fontSize: 14, fontWeight: '700', color: '#EF4444' },

  /* Stats */
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statItem: {
    width: '47%', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.03)',
  },
  statIconWrap: {
    width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  },
  statNumber: { fontSize: 24, fontWeight: '700' },
  statLabel: { fontSize: 11, fontWeight: '500', color: 'rgba(255,255,255,0.5)' },

  /* Admin */
  adminCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: 18, borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)',
    backgroundColor: 'rgba(245,158,11,0.06)', padding: 16,
  },
  adminLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  adminArrowWrap: {
    width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  /* Footer */
  footerSection: { alignItems: 'center', paddingVertical: 16, gap: 6 },
  footerDividerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  footerLine: { width: 30, height: 1.5, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.15)' },
  footerText: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.5)' },
  footerSubText: { fontSize: 11, fontStyle: 'italic', color: 'rgba(255,255,255,0.3)' },
});
