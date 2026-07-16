import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, Animated, Dimensions, Image, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');

const C = {
  primary: '#0F766E',
  secondary: '#14B8A6',
  accent: '#F59E0B',
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  border: '#E5E7EB',
  success: '#10B981',
  error: '#EF4444',
};

const OTHER_APPS = [
  { name: "Ingabo y'Umusilam", nameEn: 'Shield of the Muslim', icon: 'shield-checkmark', color: '#27ae60', url: '#' },
  { name: 'Quran', nameEn: 'Quran App', icon: 'book', color: '#3498db', url: '#' },
  { name: 'Quran Kinyarwanda', nameEn: 'Kinyarwanda Quran', icon: 'book-open', color: '#9b59b6', url: '#' },
];

const FEATURES = [
  { icon: 'time', labelRw: 'Isengesho', label: 'Prayer', sublabel: 'Daily Times' },
  { icon: 'book', labelRw: "Qor'an", label: 'Quran', sublabel: '114 Surahs' },
  { icon: 'headset', labelRw: 'Inyigisho', label: 'Audio', sublabel: 'Lessons' },
  { icon: 'film', labelRw: 'Amashusho', label: 'Videos', sublabel: 'Teachings' },
  { icon: 'library', labelRw: 'Ibitabo', label: 'Books', sublabel: 'Library' },
];

const SOCIALS = [
  { icon: 'logo-facebook', color: '#1877f2', url: 'https://facebook.com', label: 'Facebook' },
  { icon: 'logo-twitter', color: '#1da1f2', url: 'https://twitter.com', label: 'X / Twitter' },
  { icon: 'logo-youtube', color: '#ff0000', url: 'https://youtube.com', label: 'YouTube' },
  { icon: 'logo-instagram', color: '#e4405f', url: 'https://instagram.com', label: 'Instagram' },
];

export default function AboutScreen({ navigation }) {
  const { t } = useApp();
  const glowAnim = useRef(new Animated.Value(0.3)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 2500, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0.3, duration: 2500, useNativeDriver: true }),
        ])
      ),
      Animated.loop(
        Animated.timing(rotateAnim, { toValue: 1, duration: 20000, useNativeDriver: true })
      ),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, tension: 30, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
    ]).start();
  }, []);

  const spin = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <ImageBackground source={require('../../assets/bg-qibla.jpg')} style={styles.bgImage} resizeMode="cover">
      <View style={styles.overlay} />
      <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* === HERO SECTION === */}
        <Animated.View style={[styles.hero, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <Animated.View style={[styles.decorRing, { borderColor: `${C.secondary}25`, transform: [{ rotate: spin }] }]}>
            <View style={[styles.decorDot, { top: 0, left: '50%', backgroundColor: C.secondary }]} />
            <View style={[styles.decorDot, { bottom: 0, left: '50%', backgroundColor: C.secondary }]} />
            <View style={[styles.decorDot, { left: 0, top: '50%', backgroundColor: C.secondary }]} />
            <View style={[styles.decorDot, { right: 0, top: '50%', backgroundColor: C.secondary }]} />
          </Animated.View>
          <Animated.View style={[styles.heroGlow, { opacity: glowAnim, backgroundColor: 'rgba(20,184,166,0.08)' }]} />
          <View style={styles.logoWrap}>
            <Image source={require('../../assets/icon.png')} style={styles.logoImage} resizeMode="contain" />
          </View>
          <Text style={styles.heroTitle}>Sobanukirwa</Text>
          <Text style={styles.heroSubtitle}>
            {t('Urumuri rw\'abemeramana', 'Light of Faith', 'نور الإيمان')}
          </Text>
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <View style={styles.dividerDiamond}>
              <View style={styles.dividerDiamondInner} />
            </View>
            <View style={styles.dividerLine} />
          </View>
          <View style={styles.heroTag}>
            <Ionicons name="star" size={12} color={C.primary} />
            <Text style={styles.heroTagText}>
              {t('Ubumenyi bw\'ubusilamu', 'Islamic Knowledge', 'المعرفة الإسلامية')}
            </Text>
            <Ionicons name="star" size={12} color={C.primary} />
          </View>
        </Animated.View>

        {/* === BISMILLAH === */}
        <View style={[styles.card, styles.bismillahCard]}>
          <View style={styles.bismillahDecorLeft} />
          <View style={styles.bismillahDecorRight} />
          <View style={styles.bismillahIconWrap}>
            <Ionicons name="diamond" size={18} color={C.primary} />
          </View>
          <Text style={styles.bismillahArabic}>
            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
          </Text>
          <Text style={styles.bismillahTranslation}>
            {t(
              'Mwimerere w\'Imana yose, Nyir\'Impuhuzo, Nyir\'Impuhuzo',
              'In the name of Allah, the Most Gracious, the Most Merciful',
              'بسم الله الرحمن الرحيم'
            )}
          </Text>
        </View>

        {/* === ABOUT MISSION === */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardIconWrap}>
              <Ionicons name="information-circle" size={22} color={C.primary} />
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardSectionTitle}>
                {t('Ibyerekeye', 'About', 'حول التطبيق')}
              </Text>
              <Text style={styles.cardSectionSub}>
                {t('Ikibaho n\'Intego', 'Mission & Vision', 'الرسالة والرؤية')}
              </Text>
            </View>
          </View>
          <View style={styles.accentLine} />
          <Text style={styles.aboutText}>
            {t(
              'Sobanukirwa ni urubuga rwo kwigisha Islamic mu rurimi rw\'Ikinyarwanda. Dufite intego yo gufasha abantu kumenya ukuri, ubuhanga, n\'ubwiza bwa Islam.',
              'Sobanukirwa is an Islamic learning platform in Kinyarwanda. Our goal is to help people understand the truth, knowledge, and beauty of Islam.',
              'سوبانوكيروا منصة تعليم إسلامي باللغة الكينيارواندية. هدفنا مساعدة الناس على فهم الحقيقة والمعرفة وجمال الإسلام.'
            )}
          </Text>
          <View style={styles.aboutDivider} />
          <Text style={styles.aboutText}>
            {t(
              'Twifuza ko uzabona inyigisho zifatika hano. Allah nawe aduhe gukora ibimushimisha.',
              'We hope you find beneficial lessons here. May Allah help us do what pleases Him.',
              'نأمل أن تجد دروسًا مفيدة هنا. وفقنا الله جميعًا لفعل ما يرضيه.'
            )}
          </Text>
        </View>

        {/* === FEATURES === */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardIconWrap}>
              <Ionicons name="sparkles" size={22} color={C.primary} />
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardSectionTitle}>
                {t('Ibikoresho', 'Features', 'المميزات')}
              </Text>
              <Text style={styles.cardSectionSub}>
                {t('Ibikoresho vyose hamwe', 'All in one place', 'كل شيء في مكان واحد')}
              </Text>
            </View>
          </View>
          <View style={styles.featuresGrid}>
            {FEATURES.map((feat, i) => (
              <TouchableOpacity key={i} style={styles.featureItem} activeOpacity={0.7}>
                <View style={styles.featureIconWrap}>
                  <Ionicons name={feat.icon} size={22} color={C.primary} />
                </View>
                <Text style={styles.featureName}>
                  {t(feat.labelRw, feat.label, feat.label)}
                </Text>
                <Text style={styles.featureSub}>{feat.sublabel}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* === OUR APPS === */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardIconWrap}>
              <Ionicons name="logo-google-playstore" size={22} color={C.primary} />
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardSectionTitle}>
                {t('Porogaramu zacu', 'Our Apps', 'تطبيقاتنا')}
              </Text>
              <Text style={styles.cardSectionSub}>
                {t('Ziyungurure kuri Play Store', 'Download on Play Store', 'حمّل من متجر بلاي')}
              </Text>
            </View>
          </View>
          <View style={styles.appsGrid}>
            {OTHER_APPS.map((app, i) => (
              <TouchableOpacity key={i} style={styles.appCardOuter} onPress={() => app.url !== '#' && Linking.openURL(app.url)} activeOpacity={0.7}>
                <View style={styles.appCard}>
                  <View style={[styles.appIconBg, { backgroundColor: `${app.color}12` }]}>
                    <View style={[styles.appIconCircle, { borderColor: `${app.color}35` }]}>
                      <Ionicons name={app.icon} size={26} color={app.color} />
                    </View>
                  </View>
                  <Text style={styles.appName} numberOfLines={1}>{app.name}</Text>
                  <Text style={styles.appNameEn} numberOfLines={1}>{app.nameEn}</Text>
                  <View style={styles.playBtn}>
                    <Ionicons name="logo-google-playstore" size={12} color={C.surface} />
                    <Text style={styles.playBtnText}>
                      {t('Shyira ku Play Store', 'Play Store', 'متجر بلاي')}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* === SOCIAL === */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardIconWrap}>
              <Ionicons name="heart" size={22} color={C.primary} />
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardSectionTitle}>
                {t('Duherereye', 'Follow Us', 'تابعنا')}
              </Text>
              <Text style={styles.cardSectionSub}>
                {t('Dukurikire kuri social media', 'Connect with us', 'تواصل معنا')}
              </Text>
            </View>
          </View>
          <View style={styles.socialRow}>
            {SOCIALS.map((social, i) => (
              <TouchableOpacity key={i} style={[styles.socialBtn, { backgroundColor: `${social.color}10`, borderColor: `${social.color}30` }]} onPress={() => Linking.openURL(social.url)} activeOpacity={0.7}>
                <Ionicons name={social.icon} size={26} color={social.color} />
                <Text style={styles.socialLabel}>{social.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* === DUA === */}
        <View style={[styles.card, styles.duaCard]}>
          <View style={styles.duaDecorTop} />
          <View style={styles.duaIconWrap}>
            <Ionicons name="hand-holding-heart" size={22} color={C.primary} />
          </View>
          <Text style={styles.duaText}>
            {t(
              'Rabana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina \'adhaban-nar.',
              'Our Lord, give us in this world good and in the Hereafter good and protect us from the Fire.',
              'ربنا آتنا في الدنيا حسنة وفي الآخرة حسنة وقنا عذاب النار'
            )}
          </Text>
          <Text style={styles.duaSource}>— Al-Baqarah: 201</Text>
        </View>

        {/* === FOOTER === */}
        <View style={styles.footerSection}>
          <View style={styles.footerDividerRow}>
            <View style={styles.footerLine} />
            <Ionicons name="star" size={10} color={C.textTertiary} />
            <View style={styles.footerLine} />
          </View>
          <Text style={styles.footerDisclaimer}>
            {t(
              'Byose bikubiye muri Qur\'an na Sunah z\'intumwa y\'imana Muhamad (S.A.W).',
              'All content from Quran and Sunnah of Prophet Muhammad (PBUH).',
              'كل المحتوى من القرآن والسنة النبوية.'
            )}
          </Text>
          <Text style={styles.footerVersion}>Sobanukirwa v1.0.0</Text>
        </View>

        {/* === SETTINGS BUTTON === */}
        <TouchableOpacity style={styles.settingsBtn} onPress={() => navigation.navigate('Settings')} activeOpacity={0.7}>
          <Ionicons name="settings" size={20} color={C.primary} />
          <Text style={styles.settingsBtnText}>
            {t('Igenamiterere', 'Settings', 'الإعدادات')}
          </Text>
          <Ionicons name="chevron-forward" size={18} color={C.primary} />
        </TouchableOpacity>

      </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  bgImage: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(6, 48, 44, 0.6)' },
  scroll: { padding: 20, paddingBottom: 50, gap: 18 },

  /* === HERO === */
  hero: { alignItems: 'center', paddingVertical: 24, position: 'relative' },
  decorRing: {
    position: 'absolute', top: -10, width: 180, height: 180, borderRadius: 90,
    borderWidth: 1, borderStyle: 'dashed',
  },
  decorDot: { position: 'absolute', width: 6, height: 6, borderRadius: 3, marginLeft: -3, marginTop: -3 },
  heroGlow: { position: 'absolute', top: -20, width: 240, height: 240, borderRadius: 120 },
  logoWrap: {
    width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#14B8A6',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10,
  },
  logoImage: { width: 94, height: 94, borderRadius: 47 },
  heroTitle: { fontSize: 32, fontWeight: '700', color: '#FFFFFF', marginTop: 16 },
  heroSubtitle: { fontSize: 14, marginTop: 6, letterSpacing: 0.5, color: 'rgba(255,255,255,0.7)' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16 },
  dividerLine: { width: 50, height: 2, borderRadius: 1, backgroundColor: '#14B8A6' },
  dividerDiamond: {
    width: 12, height: 12, borderRadius: 2, transform: [{ rotate: '45deg' }],
    alignItems: 'center', justifyContent: 'center', backgroundColor: C.secondary, borderColor: C.secondary,
  },
  dividerDiamondInner: { width: 5, height: 5, borderRadius: 1, backgroundColor: 'rgba(10,48,44,0.8)' },
  heroTag: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1, marginTop: 16, backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)',
  },
  heroTagText: { fontSize: 12, fontWeight: '600', color: '#5EEAD4' },

  /* === CARDS === */
  card: {
    backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    padding: 18, gap: 12, overflow: 'hidden',
  },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  cardIconWrap: {
    width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  cardHeaderText: { flex: 1 },
  cardSectionTitle: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
  cardSectionSub: { fontSize: 11, marginTop: 1, color: 'rgba(255,255,255,0.6)' },
  accentLine: { width: 30, height: 3, borderRadius: 2, backgroundColor: C.primary },

  /* === BISMILLAH === */
  bismillahCard: { alignItems: 'center', paddingVertical: 22, borderColor: 'rgba(20,184,166,0.3)', backgroundColor: 'rgba(0,0,0,0.2)' },
  bismillahDecorLeft: {
    position: 'absolute', top: 0, left: 0, width: 60, height: 60, borderBottomRightRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  bismillahDecorRight: {
    position: 'absolute', bottom: 0, right: 0, width: 60, height: 60, borderTopLeftRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  bismillahIconWrap: {
    width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  bismillahArabic: { fontSize: 26, fontFamily: 'serif', textAlign: 'center', lineHeight: 42, color: '#FFFFFF' },
  bismillahTranslation: {
    fontSize: 12, textAlign: 'center', fontStyle: 'italic', lineHeight: 18, paddingHorizontal: 10,
    color: 'rgba(255,255,255,0.7)',
  },

  /* === ABOUT TEXT === */
  aboutText: { fontSize: 14, lineHeight: 23, color: 'rgba(255,255,255,0.85)' },
  aboutDivider: { height: 1, marginVertical: 2, backgroundColor: 'rgba(255,255,255,0.1)' },

  /* === FEATURES === */
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  featureItem: {
    width: (width - 76) / 3, paddingVertical: 14, borderRadius: 16, borderWidth: 1,
    alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.2)', borderColor: 'rgba(255,255,255,0.12)',
  },
  featureIconWrap: {
    width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  featureName: { fontSize: 11, fontWeight: '700', textAlign: 'center', color: '#FFFFFF' },
  featureSub: { fontSize: 9, color: 'rgba(255,255,255,0.6)' },

  /* === APPS === */
  appsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  appCardOuter: { width: (width - 76) / 3 },
  appCard: {
    backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 16, paddingHorizontal: 8, alignItems: 'center', gap: 5,
  },
  appIconBg: { width: 58, height: 58, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  appIconCircle: { width: 50, height: 50, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  appName: { fontSize: 11, fontWeight: '700', textAlign: 'center', color: '#FFFFFF' },
  appNameEn: { fontSize: 9, textAlign: 'center', color: 'rgba(255,255,255,0.6)' },
  playBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16, marginTop: 4,
    backgroundColor: C.primary,
  },
  playBtnText: { fontSize: 9, fontWeight: '700', color: '#FFFFFF' },

  /* === SOCIAL === */
  socialRow: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  socialBtn: {
    width: 72, height: 72, borderRadius: 18, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  socialLabel: { fontSize: 8, fontWeight: '600', textAlign: 'center', color: 'rgba(255,255,255,0.6)' },

  /* === DUA === */
  duaCard: { alignItems: 'center', paddingVertical: 24, borderColor: 'rgba(20,184,166,0.3)', backgroundColor: 'rgba(0,0,0,0.2)' },
  duaDecorTop: {
    position: 'absolute', top: 0, left: '25%', right: '25%', height: 3, borderRadius: 2,
    backgroundColor: 'rgba(20,184,166,0.4)',
  },
  duaIconWrap: {
    width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  duaText: { fontSize: 13, lineHeight: 22, textAlign: 'center', fontStyle: 'italic', paddingHorizontal: 10, color: 'rgba(255,255,255,0.85)' },
  duaSource: { fontSize: 12, fontWeight: '700', marginTop: 8, color: '#5EEAD4' },

  /* === FOOTER === */
  footerSection: { alignItems: 'center', gap: 8, marginTop: 6 },
  footerDividerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  footerLine: { width: 30, height: 2, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.15)' },
  footerDisclaimer: { fontSize: 11, textAlign: 'center', color: 'rgba(255,255,255,0.6)' },
  footerVersion: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.4)' },

  /* === SETTINGS === */
  settingsBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    padding: 16, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.08)',
  },
  settingsBtnText: { fontSize: 15, fontWeight: '600', flex: 1, textAlign: 'center', color: '#5EEAD4' },
});
