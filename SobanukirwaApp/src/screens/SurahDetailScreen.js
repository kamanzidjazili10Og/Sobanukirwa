import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useApp } from '../context/AppContext';

const SURAH_LIST = Array.from({ length: 114 }, (_, i) => ({
  number: i + 1,
  name: ['الفاتحة','البقرة','آل عمران','النساء','المائدة','الأنعام','الأعراف','الأنفال','التوبة','يونس','هود','يوسف','الرعد','إبراهيم','الحجر','النحل','الإسراء','الكهف','مريم','طه','الأنبياء','الحج','المؤمنون','النور','الفرقان','الشعراء','القصص','العنكبوت','الروم','لقمان','السجدة','الأحزاب','سبأ','فاطر','يس','الصافات','ص','الزمر','غافر','فصلت','الشورى','الزخرف','الدخان','الجاثية','الأحقاف','محمد','الفتح','الحجرات','ق','الذاريات','الطور','النجم','القمر','الرحمن','الواقعة','الحديد','المجادلة','الحشر','الممتحنة','الصف','الجمعة','المنافقون','التغابن','الطلاق','التحريم','الملك','القلم','الحاقة','المعارج|Al-Maarij','نوح','الجن','المزمل','المدثر','القيامة','الإنسان','المرسلات','النبأ','النازعات','عبس','التكوير','الانفطار','المطففين','الانشقاق','البروج','الطارق','الأعلى','الغاشية','الفجر','الشرح','التين','العلق','القدر','البينة','الزلزلة','العاديات','القارعة','التكاثر','العصر','الهمزة','الفيل','قريش','الماعون','الكوثر','الكافرون','النصر','المسد','الإخلاص','الفلق','الناس'],
  englishName: ['Al-Fatihah','Al-Baqarah','Ali Imran','An-Nisa','Al-Ma\'idah','Al-An\'am','Al-A\'raf','Al-Anfal','At-Tawbah','Yunus','Hud','Yusuf','Ar-Ra\'d','Ibrahim','Al-Hijr','An-Nahl','Al-Isra','Al-Kahf','Maryam','Taha','Al-Anbiya','Al-Hajj','An-Nur','Al-Furqan','Ash-Shu\'ara','Al-Qasas','Al-Ankabut','Ar-Rum','Luqman','As-Sajdah','Ar-Ra\'d','Al-Ahzab','Saba','Fatir','Ya-Sin','As-Saffat','Sad','Az-Zumar','Ghafir','Fussilat','Ash-Shura','Az-Zukhruf','Ad-Dukhan','Al-Jathiyah','Al-Ahqaf','Muhammad','Al-Fath','Al-Hujurat','Qaf','Adh-Dhariyat','At-Tur','An-Najm','Al-Qamar','Ar-Rahman','Al-Waqi\'ah','Al-Hadid','Al-Mujadilah','Al-Hashr','Al-Mumtahanah','As-Saf','Al-Jumu\'ah','Al-Munafiqun','At-At-Taghabun','At-Talaq','At-Tahrim','Al-Mulk','Al-Qalam','Al-Haqqah','Al-Ma\'arij','Nuh','Al-Jinn','Al-Muzzammil','Al-Muddathir','Al-Qiyamah','Al-Insan','Al-Mursalat','An-Naba','An-Naziat','Abasa','At-Takwir','Al-Infitar','Al-Mutaffifin','Al-Inshiqaq','Al-Buruj','At-Tariq','Al-A\'la','Al-Ghashiyah','Al-Fajr','Ash-Sharh','At-Tin','Al-Alaq','Al-Qadr','Al-Bayyinah','Az-Zalzalah','Al-Adiyat','Al-Qari\'ah','At-Takathur','Al-Asr','Al-Humazah','Al-Fil','Quraysh','Al-Ma\'un','Al-Kawthar','Al-Kafirun','An-Nasr','Al-Masad','Al-Ikhlas','Al-Falaq','An-Nas'],
  englishNameTranslation: ['The Opening','The Cow','The Family of Imran','The Table Spread','The Cattle','The Heights','The Spoils of War','Repentance','Jonah','Hud','Joseph','The Thunder','Abraham','The Rocky Tract','The Bee','The Night Journey','The Cave','Mary','Ta-Ha','The Prophets','The Pilgrimage','The Light','The Criterion','The Poets','The Story','The Spider','The Romans','Luqman','The Prophets','The Rustling','The Believers','The Wind-Curled','The Bees','The Creator','Ya-Sin','Those Ranged in Ranks','The Letter Sad','The Troops','The Forgiver','Expounded','The Consultation','The Ornaments','The Smoke','The Crouching','The Wind-Curled','Muhammad','The Victory','The Rooms','The Letter Qaf','The Winnowing Winds','The Mount','The Star','The Moon','The Beneficent','The Inevitable','The Iron','The Pleading Woman','The Exile','She That is to be Examined','The Ranks','The Congregation','The Hypocrites','The Mutual Disillusion','The Divorce','The Prohibition','The Sovereign','The Pen','The Inevitable','The Ways','Noah','The Jinn','The Enshrouded One','The Cloaked One','The Resurrection','Man','The Emissaries','The Tidings','Those Who Drag Forth','He Frowned','The Overthrowing','The Cleaving','The Defrauding','The Splitting Open','The Mansions of the Stars','The Morning Star','The Most High','The Overwhelming','The Dawn','The Relief','The Fig','The Clot','The Power','The Clear Proof','The Earthquake','The Coursers','The Shock','The Rivalry','The Declining Day','The Traducer','The Elephant','Quraysh','The Small Kindnesses','The Abundance','The Disbelievers','The Divine Support','The Palm Fiber','The Sincerity','The Daybreak','Mankind'],
  numberOfAyahs: [7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,64,77,227,88,69,60,34,30,73,92,54,45,83,182,88,75,85,54,53,89,59,38,28,38,29,18,45,60,49,62,55,78,96,29,22,72,18,28,18,24,11,11,18,12,12,30,52,52,44,28,28,20,56,40,56,53,19,36,25,22,17,19,26,30,20,15,21,11,8,5,19,5,8,8,11,11,8,3,9,5,4,6,3,6,3,5,4,5,6,3,3,5,4,5,3,3,5,3,3,12,9,9,14],
  revelationType: ['Meccan','Medinan','Medinan','Medinan','Medinan','Meccan','Meccan','Medinan','Medinan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Medinan','Medinan','Medinan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Medinan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Medinan','Medinan','Medinan','Meccan','Meccan','Meccan','Meccan','Meccan','Medinan','Meccan','Medinan','Medinan','Medinan','Medinan','Medinan','Medinan','Medinan','Medinan','Medinan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan','Meccan']
}));

export default function SurahDetailScreen({ route, navigation }) {
  const { surah } = route.params;
  const { t, COLORS } = useApp();
  const [playing, setPlaying] = useState(false);
  const [currentAyah, setCurrentAyah] = useState(0);
  const soundRef = useRef(null);

  const surahData = SURAH_LIST.find(s => s.number === surah.number) || surah;

  const ayahCount = surahData.numberOfAyahs || surah.numberOfAyahs || 0;
  const ayahs = Array.from({ length: ayahCount }, (_, i) => i + 1);

  async function playAyah(ayahNum) {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }
      const url = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${surah.number}.mp3`;
      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true }
      );
      soundRef.current = sound;
      setCurrentAyah(ayahNum);
      setPlaying(true);
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setPlaying(false);
          setCurrentAyah(0);
        }
      });
    } catch (e) {
      console.log('Audio error:', e);
    }
  }

  async function stopAudio() {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    setPlaying(false);
    setCurrentAyah(0);
  }

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const totalAyahs = ayahs.length;
  const totalRuku = Math.ceil(totalAyahs / 10);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      <View style={[styles.header, { backgroundColor: COLORS.primaryDark, borderBottomColor: COLORS.border }]}>
        <TouchableOpacity onPress={() => { stopAudio(); navigation.goBack(); }} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: COLORS.secondary }]} numberOfLines={1}>
            {t(surahData.name, surahData.englishName, surahData.name)}
          </Text>
          <Text style={[styles.headerSub, { color: COLORS.textMuted }]}>
            {surahData.englishNameTranslation || ''} • {totalAyahs} ayahs • {surahData.revelationType}
          </Text>
        </View>
        <TouchableOpacity onPress={playing ? stopAudio : () => playAyah(1)} style={[styles.playAllBtn, { backgroundColor: COLORS.secondary }]}>
          <Ionicons name={playing ? 'stop' : 'play'} size={20} color={COLORS.primaryDark} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        <View style={[styles.infoCard, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
          <Text style={[styles.surahNameAr, { color: COLORS.secondary }]}>{surahData.name}</Text>
          <Text style={[styles.surahNameEn, { color: COLORS.text }]}>{surahData.englishName}</Text>
          <Text style={[styles.surahMeta, { color: COLORS.textMuted }]}>
            {totalAyahs} Ayahs • {surahData.revelationType} • Juz {Math.ceil(surah.number / 20)}
          </Text>
        </View>

        {ayahs.map((ayahNum) => (
          <View
            key={ayahNum}
            style={[
              styles.ayahCard,
              { backgroundColor: COLORS.surface, borderColor: COLORS.border },
              currentAyah === ayahNum && { borderColor: COLORS.secondary, backgroundColor: 'rgba(212,175,55,0.08)' }
            ]}
          >
            <TouchableOpacity
              style={[styles.ayahNumber, { backgroundColor: currentAyah === ayahNum ? COLORS.secondary : 'rgba(212,175,55,0.12)' }]}
              onPress={() => playAyah(ayahNum)}
            >
              <Text style={[styles.ayahNumberText, { color: currentAyah === ayahNum ? COLORS.primaryDark : COLORS.secondary }]}>
                {ayahNum}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.ayahText, { color: COLORS.text }]}>
              بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
            </Text>
            <Text style={[styles.ayahTranslation, { color: COLORS.textMuted }]}>
              In the name of Allah, the Most Gracious, the Most Merciful
            </Text>
          </View>
        ))}
      </ScrollView>

      {playing && (
        <View style={[styles.miniPlayer, { backgroundColor: COLORS.primaryDark, borderTopColor: COLORS.border }]}>
          <Text style={[styles.miniPlayerText, { color: COLORS.text }]} numberOfLines={1}>
            {surahData.englishName} - Ayah {currentAyah}
          </Text>
          <TouchableOpacity onPress={stopAudio}>
            <Ionicons name="stop-circle" size={28} color={COLORS.secondary} />
          </TouchableOpacity>
        </View>
      )}
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
  playAllBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, gap: 10, paddingBottom: 80 },
  infoCard: { padding: 20, borderRadius: 16, borderWidth: 1.5, alignItems: 'center', marginBottom: 8 },
  surahNameAr: { fontSize: 32, fontWeight: '700', marginBottom: 4 },
  surahNameEn: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  surahMeta: { fontSize: 12 },
  ayahCard: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, borderRadius: 12, borderWidth: 1, gap: 10 },
  ayahNumber: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  ayahNumberText: { fontSize: 13, fontWeight: '700' },
  ayahText: { flex: 1, fontSize: 20, lineHeight: 36, fontFamily: 'serif', textAlign: 'right' },
  ayahTranslation: { flex: 1, fontSize: 12, lineHeight: 18, marginTop: 6 },
  miniPlayer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderTopWidth: 1 },
  miniPlayerText: { flex: 1, fontSize: 14, fontWeight: '600', marginRight: 12 },
});
