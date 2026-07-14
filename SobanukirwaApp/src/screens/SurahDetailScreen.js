import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useApp } from '../context/AppContext';
import { getMediaUrl } from '../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SURAH_LIST = Array.from({ length: 114 }, (_, i) => ({
  number: i + 1,
  name: ['الفاتحة','البقرة','آل عمران','النساء','المائدة','الأنعام','الأعراف','الأنفال','التوبة','يونس','هود','يوسف','الرعد','إبراهيم','الحجر','النحل','الإسراء','الكهف','مريم','طه','الأنبياء','الحج','المؤمنون','النور','الفرقان','الشعراء','القصص','العنكبوت','الروم','لقمان','السجدة','الأحزاب','سبأ','فاطر','يس','الصافات','ص','الزمر','غافر','فصلت','الشورى','الزخرف','الدخان','الجاثية','الأحقاف','محمد','الفتح','الحجرات','ق','الذاريات','الطور','النجم','القمر','الرحمن','الواقعة','الحديد','المجادلة','الحشر','الممتحنة','الصف','الجمعة','المنافقون','التغابن','الطلاق','التحريم','الملك','القلم','الحاقة','المعارج','نوح','الجن','المزمل','المدثر','القيامة','الإنسان','المرسلات','النبأ','النازعات','عبس','التكوير','الانفطار','المطففين','الانشقاق','البروج','الطارق','الأعلى','الغاشية','الفجر','الشرح','التين','العلق','القدر','البينة','الزلزلة','العاديات','القارعة','التكاثر','العصر','الهمزة','الفيل','قريش','الماعون','الكوثر','الكافرون','النصر','المسد','الإخلاص','الفلق','الناس'],
  englishName: ['Al-Fatihah','Al-Baqarah','Ali Imran','An-Nisa','Al-Ma\'idah','Al-An\'am','Al-A\'raf','Al-Anfal','At-Tawbah','Yunus','Hud','Yusuf','Ar-Ra\'d','Ibrahim','Al-Hijr','An-Nahl','Al-Isra','Al-Kahf','Maryam','Taha','Al-Anbiya','Al-Hajj','An-Nur','Al-Furqan','Ash-Shu\'ara','Al-Qasas','Al-Ankabut','Ar-Rum','Luqman','As-Sajdah','Ar-Ra\'d','Al-Ahzab','Saba','Fatir','Ya-Sin','As-Saffat','Sad','Az-Zumar','Ghafir','Fussilat','Ash-Shura','Az-Zukhruf','Ad-Dukhan','Al-Jathiyah','Al-Ahqaf','Muhammad','Al-Fath','Al-Hujurat','Qaf','Adh-Dhariyat','At-Tur','An-Najm','Al-Qamar','Ar-Rahman','Al-Waqi\'ah','Al-Hadid','Al-Mujadilah','Al-Hashr','Al-Mumtahanah','As-Saf','Al-Jumu\'ah','Al-Munafiqun','At-At-Taghabun','At-Talaq','At-Tahrim','Al-Mulk','Al-Qalam','Al-Haqqah','Al-Ma\'arij','Nuh','Al-Jinn','Al-Muzzammil','Al-Muddathir','Al-Qiyamah','Al-Insan','Al-Mursalat','An-Naba','An-Naziat','Abasa','At-Takwir','Al-Infitar','Al-Mutaffifin','Al-Inshiqaq','Al-Buruj','At-Tariq','Al-A\'la','Al-Ghashiyah','Al-Fajr','Ash-Sharh','At-Tin','Al-Alaq','Al-Qadr','Al-Bayyinah','Az-Zalzalah','Al-Adiyat','Al-Qari\'ah','At-Takathur','Al-Asr','Al-Humazah','Al-Fil','Quraysh','Al-Ma\'un','Al-Kawthar','Al-Kafirun','An-Nasr','Al-Masad','Al-Ikhlas','Al-Falaq','An-Nas'],
  englishNameTranslation: ['The Opening','The Cow','The Family of Imran','The Table Spread','The Cattle','The Heights','The Spoils of War','Repentance','Jonah','Hud','Joseph','The Thunder','Abraham','The Rocky Tract','The Bee','The Night Journey','The Cave','Mary','Ta-Ha','The Prophets','The Pilgrimage','The Light','The Criterion','The Poets','The Story','The Spider','The Romans','Luqman','The Prophets','The Rustling','The Believers','The Wind-Curled','The Bees','The Creator','Ya-Sin','Those Ranged in Ranks','The Letter Sad','The Troops','The Forgiver','Expounded','The Consultation','The Ornaments','The Smoke','The Crouching','The Wind-Curled','Muhammad','The Victory','The Rooms','The Letter Qaf','The Winnowing Winds','The Mount','The Star','The Moon','The Beneficent','The Inevitable','The Iron','The Pleading Woman','The Exile','She That is to be Examined','The Ranks','The Congregation','The Hypocrites','The Mutual Disillusion','The Divorce','The Prohibition','The Sovereign','The Pen','The Inevitable','The Ways','Noah','The Jinn','The Enshrouded One','The Cloaked One','The Resurrection','Man','The Emissaries','The Tidings','Those Who Drag Forth','He Frowned','The Overthrowing','The Cleaving','The Defrauding','The Splitting Open','The Mansions of the Stars','The Morning Star','The Most High','The Overwhelming','The Dawn','The Relief','The Fig','The Clot','The Power','The Clear Proof','The Earthquake','The Coursers','The Shock','The Rivalry','The Declining Day','The Traducer','The Elephant','Quraysh','The Small Kindnesses','The Abundance','The Disbelievers','The Divine Support','The Palm Fiber','The Sincerity','The Daybreak','Mankind'],
  numberOfAyahs: [7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,64,77,227,88,69,60,34,30,73,92,54,45,83,182,88,75,85,54,53,89,59,38,28,38,29,18,45,60,49,62,55,78,96,29,22,72,18,28,18,24,11,11,18,12,12,30,52,52,44,28,28,20,56,40,56,53,19,36,25,22,17,19,26,30,20,15,21,11,8,5,19,5,8,8,11,11,8,3,9,5,4,6,3,6,3,5,4,5,6,3,3,5,4,5,3,3,5,3,3,12,9,9,14],
  revelationType: ['Meccan','Medinan','Medinan','Medinan','Medinan','Meccan','Meccan','Medinan','Medinan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Medinan','Medinan','Medinan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Medinan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Medinan','Medinan','Medinan','Meccan','Meccan','Meccan','Meccan','Meccan','Medinan','Meccan','Medinan','Medinan','Medinan','Medinan','Medinan','Medinan','Medinan','Medinan','Medinan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan']
}));

function formatTime(ms) {
  if (!ms || ms < 0) return '0:00';
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function SurahDetailScreen({ route, navigation }) {
  const { surah } = route.params;
  const { t, COLORS } = useApp();
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const soundRef = useRef(null);
  const spinAnim = useRef(new Animated.Value(0)).current;

  const surahData = SURAH_LIST.find(s => s.number === surah.number) || surah;
  const totalAyahs = surahData.numberOfAyahs || surah.numberOfAyahs || 7;
  const juz = Math.ceil(surah.number / 20);
  const isMeccan = surahData.revelationType === 'Meccan';

  useEffect(() => {
    if (playing) {
      Animated.loop(
        Animated.timing(spinAnim, { toValue: 1, duration: 12000, useNativeDriver: true })
      ).start();
    } else {
      spinAnim.stopAnimation();
    }
  }, [playing]);

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  async function playAudio() {
    try {
      if (soundRef.current) { await soundRef.current.unloadAsync(); }
      setLoading(true);
      const backendAudio = surah.audio_url;
      let url;
      if (backendAudio && backendAudio.trim()) {
        url = backendAudio.startsWith('http') ? backendAudio : getMediaUrl(backendAudio);
      } else {
        url = `https://server7.mp3quran.net/ahmed/${String(surah.number).padStart(3, '0')}.mp3`;
      }
      const { sound } = await Audio.Sound.createAsync({ uri: url }, { shouldPlay: true });
      soundRef.current = sound;
      setPlaying(true);
      setLoading(false);
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setPosition(status.positionMillis || 0);
          setDuration(status.durationMillis || 0);
        }
        if (status.didJustFinish) {
          setPlaying(false);
          setPosition(0);
        }
      });
    } catch (e) {
      console.log('Audio error:', e);
      setLoading(false);
    }
  }

  async function stopAudio() {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    setPlaying(false);
    setPosition(0);
    setDuration(0);
  }

  async function togglePlayPause() {
    if (!soundRef.current) { playAudio(); return; }
    if (playing) {
      await soundRef.current.pauseAsync();
      setPlaying(false);
    } else {
      await soundRef.current.playAsync();
      setPlaying(true);
    }
  }

  async function seekTo(millis) {
    if (soundRef.current) {
      await soundRef.current.setPositionAsync(millis);
      setPosition(millis);
    }
  }

  useEffect(() => {
    return () => { if (soundRef.current) soundRef.current.unloadAsync(); };
  }, []);

  const progress = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      <View style={[styles.header, { backgroundColor: COLORS.primaryDark, borderBottomColor: COLORS.border }]}>
        <TouchableOpacity onPress={() => { stopAudio(); navigation.goBack(); }} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: COLORS.secondary }]} numberOfLines={1}>
            {surah.englishName || surahData.englishName}
          </Text>
          <Text style={[styles.headerSub, { color: COLORS.textMuted }]}>
            {surah.name || surahData.name} • {totalAyahs} ayahs
          </Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.heroSection, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
          <View style={[styles.heroDecorCircle, { borderColor: 'rgba(212,175,55,0.08)' }]} />
          <View style={[styles.heroDecorCircle2, { borderColor: 'rgba(212,175,55,0.05)' }]} />

          <Text style={[styles.heroSurahNum, { color: COLORS.textMuted }]}>
            {t('Sura', 'Surah', 'سورة')} {surah.number}
          </Text>

          <Text style={[styles.heroArabicName, { color: COLORS.secondary }]}>
            {surahData.name}
          </Text>

          <Text style={[styles.heroBismillah, { color: COLORS.text }]}>
            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
          </Text>

          <View style={[styles.heroDivider, { backgroundColor: 'rgba(212,175,55,0.25)' }]} />

          <Text style={[styles.heroEnglishName, { color: COLORS.text }]}>
            {surah.englishName || surahData.englishName}
          </Text>
          <Text style={[styles.heroTranslation, { color: COLORS.textMuted }]}>
            {surahData.englishNameTranslation}
          </Text>

          <View style={styles.heroBadges}>
            <View style={[styles.badge, { backgroundColor: isMeccan ? 'rgba(231,76,60,0.1)' : 'rgba(39,174,96,0.1)' }]}>
              <Ionicons name={isMeccan ? 'flame' : 'leaf'} size={12} color={isMeccan ? '#e74c3c' : '#27ae60'} />
              <Text style={[styles.badgeText, { color: isMeccan ? '#e74c3c' : '#27ae60' }]}>{surahData.revelationType}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: 'rgba(212,175,55,0.1)' }]}>
              <Ionicons name="document-text" size={12} color={COLORS.secondary} />
              <Text style={[styles.badgeText, { color: COLORS.secondary }]}>{totalAyahs} {t('ayahs', 'ayahs', 'آية')}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: 'rgba(212,175,55,0.1)' }]}>
              <Ionicons name="book" size={12} color={COLORS.secondary} />
              <Text style={[styles.badgeText, { color: COLORS.secondary }]}>{t('Juz', 'Juz', 'جزء')} {juz}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.playerCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
          <View style={styles.playerTop}>
            <Animated.View style={[styles.playerDisc, {
              borderColor: playing ? COLORS.secondary : 'rgba(212,175,55,0.2)',
              backgroundColor: playing ? 'rgba(212,175,55,0.08)' : 'rgba(212,175,55,0.03)',
              transform: [{ rotate: spin }]
            }]}>
              <Ionicons name="book" size={28} color={COLORS.secondary} />
            </Animated.View>
            <View style={styles.playerInfo}>
              <Text style={[styles.playerTitle, { color: COLORS.text }]} numberOfLines={1}>
                {surah.englishName || surahData.englishName}
              </Text>
              <Text style={[styles.playerSub, { color: COLORS.textMuted }]}>
                {loading ? t('Turimo gufungura...', 'Loading...', 'جاري التحميل...') :
                 playing ? t('Kuri gukina...', 'Playing...', 'يعمل...') :
                 t('Kanda kugirango ukine', 'Tap to play', 'اضغط للتشغيل')}
              </Text>
            </View>
          </View>

          <View style={styles.progressWrap}>
            <TouchableOpacity
              style={styles.progressTouch}
              onPress={(e) => {
                if (duration > 0) {
                  const barWidth = SCREEN_WIDTH - 80;
                  const pct = Math.max(0, Math.min(1, e.nativeEvent.locationX / barWidth));
                  seekTo(pct * duration);
                }
              }}
            >
              <View style={[styles.progressTrack, { backgroundColor: 'rgba(212,175,55,0.12)' }]}>
                <View style={[styles.progressFill, { backgroundColor: COLORS.secondary, width: `${progress}%` }]} />
                {duration > 0 && (
                  <View style={[styles.progressThumb, { left: `${progress}%`, backgroundColor: COLORS.secondary }]} />
                )}
              </View>
            </TouchableOpacity>
            <View style={styles.progressTimes}>
              <Text style={[styles.progressTime, { color: COLORS.textMuted }]}>{formatTime(position)}</Text>
              <Text style={[styles.progressTime, { color: COLORS.textMuted }]}>
                {duration > 0 ? formatTime(duration) : '--:--'}
              </Text>
            </View>
          </View>

          <View style={styles.playerControls}>
            <TouchableOpacity style={styles.ctrlBtn} onPress={stopAudio}>
              <Ionicons name="stop" size={22} color={COLORS.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.playBtn, { backgroundColor: COLORS.secondary }]}
              onPress={togglePlayPause}
            >
              {loading ? (
                <Ionicons name="hourglass" size={28} color={COLORS.primaryDark} />
              ) : (
                <Ionicons name={playing ? 'pause' : 'play'} size={28} color={COLORS.primaryDark} style={!playing ? { marginLeft: 3 } : {}} />
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.ctrlBtn} onPress={() => { stopAudio(); playAudio(); }}>
              <Ionicons name="refresh" size={22} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.infoRow, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
          <View style={[styles.infoItem, { borderRightColor: COLORS.border }]}>
            <Ionicons name="person" size={18} color={COLORS.secondary} />
            <Text style={[styles.infoLabel, { color: COLORS.textMuted }]}>{t('Mukuru', 'Reciter', 'القارئ')}</Text>
            <Text style={[styles.infoValue, { color: COLORS.text }]}>Ahmed Al-Ajmi</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="mic" size={18} color={COLORS.secondary} />
            <Text style={[styles.infoLabel, { color: COLORS.textMuted }]}>{t('Igitangiro', 'Starts with', 'يبدأ بـ')}</Text>
            <Text style={[styles.infoValue, { color: COLORS.text }]}>بِسْمِ</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, gap: 10 },
  backBtn: { padding: 8 },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  headerSub: { fontSize: 11, marginTop: 2 },
  content: { padding: 16, paddingBottom: 40 },
  heroSection: { padding: 28, borderRadius: 24, borderWidth: 1.5, alignItems: 'center', marginBottom: 14, overflow: 'hidden' },
  heroDecorCircle: { position: 'absolute', top: -50, right: -50, width: 140, height: 140, borderRadius: 70, borderWidth: 1 },
  heroDecorCircle2: { position: 'absolute', bottom: -60, left: -30, width: 160, height: 160, borderRadius: 80, borderWidth: 1 },
  heroSurahNum: { fontSize: 13, fontWeight: '600', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 },
  heroArabicName: { fontSize: 42, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  heroBismillah: { fontSize: 22, lineHeight: 38, textAlign: 'center', marginBottom: 16 },
  heroDivider: { width: 80, height: 2.5, borderRadius: 1.25, marginBottom: 16 },
  heroEnglishName: { fontSize: 20, fontWeight: '700', marginBottom: 4, textAlign: 'center' },
  heroTranslation: { fontSize: 14, marginBottom: 16 },
  heroBadges: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, gap: 5 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  playerCard: { padding: 20, borderRadius: 20, borderWidth: 1.5, marginBottom: 14 },
  playerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 18, gap: 14 },
  playerDisc: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  playerInfo: { flex: 1 },
  playerTitle: { fontSize: 16, fontWeight: '700' },
  playerSub: { fontSize: 12, marginTop: 3 },
  progressWrap: { marginBottom: 18 },
  progressTouch: { paddingVertical: 6 },
  progressTrack: { height: 6, borderRadius: 3, overflow: 'visible', position: 'relative' },
  progressFill: { height: '100%', borderRadius: 3 },
  progressThumb: { width: 16, height: 16, borderRadius: 8, position: 'absolute', top: -5, marginLeft: -8, borderWidth: 2, borderColor: '#fff' },
  progressTimes: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  progressTime: { fontSize: 12, fontVariant: ['tabular-nums'] },
  playerControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 28 },
  ctrlBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(212,175,55,0.08)' },
  playBtn: { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center', elevation: 8, shadowColor: '#d4af37', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 12 },
  infoRow: { flexDirection: 'row', borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  infoItem: { flex: 1, alignItems: 'center', padding: 14, gap: 4, borderRightWidth: 1 },
  infoLabel: { fontSize: 11, fontWeight: '500' },
  infoValue: { fontSize: 13, fontWeight: '700' },
});
