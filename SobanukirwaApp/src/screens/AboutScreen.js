import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import ScreenBackground from '../components/ScreenBackground';

const { width } = Dimensions.get('window');

const OTHER_APPS = [
  { name: 'Ingabo y\'Umusilam', nameEn: 'Shield of the Muslim', icon: 'shield-checkmark', color: '#27ae60', gradient: ['#27ae60','#2ecc71'], url: '#' },
  { name: 'Quran', nameEn: 'Quran App', icon: 'book', color: '#3498db', gradient: ['#3498db','#2980b9'], url: '#' },
  { name: 'Quran Kinyarwanda', nameEn: 'Kinyarwanda Quran', icon: 'book-outline', color: '#9b59b6', gradient: ['#9b59b6','#8e44ad'], url: '#' },
];

const FEATURES = [
  { icon: 'time', label: 'Prayer', labelRw: 'Isengesho', sublabel: 'Daily Times' },
  { icon: 'book', label: 'Quran', labelRw: 'Qur\'an', sublabel: '114 Surahs' },
  { icon: 'headset', label: 'Audio', labelRw: 'Inyigisho', sublabel: 'Lessons' },
  { icon: 'videocam', label: 'Videos', labelRw: 'Amashusho', sublabel: 'Teachings' },
  { icon: 'book-open', label: 'Books', labelRw: 'Amatabo', sublabel: 'Library' },
];

const SOCIALS = [
  { icon: 'logo-facebook', color: '#1877f2', url: 'https://facebook.com', label: 'Facebook' },
  { icon: 'logo-twitter', color: '#1da1f2', url: 'https://twitter.com', label: 'X / Twitter' },
  { icon: 'logo-youtube', color: '#ff0000', url: 'https://youtube.com', label: 'YouTube' },
  { icon: 'logo-instagram', color: '#e4405f', url: 'https://instagram.com', label: 'Instagram' },
];

const ISLAMIC_PATTERNS = ['﷽','﷽','﷽'];

export default function AboutScreen({ navigation }) {
  const { t, COLORS } = useApp();
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
        Animated.sequence([
          Animated.timing(rotateAnim, { toValue: 1, duration: 20000, useNativeDriver: true }),
        ])
      ),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, tension: 30, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
    ]).start();
  }, []);

  const spin = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      <ScreenBackground imageKey="bg-about">
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* === HERO SECTION === */}
        <Animated.View style={[styles.hero, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          {/* Decorative rotating ring */}
          <Animated.View style={[styles.decorRing, { borderColor: `${COLORS.secondary}25`, transform: [{ rotate: spin }] }]}>
            <View style={[styles.decorDot, { top: 0, left: '50%', backgroundColor: COLORS.secondary }]} />
            <View style={[styles.decorDot, { bottom: 0, left: '50%', backgroundColor: COLORS.secondary }]} />
            <View style={[styles.decorDot, { left: 0, top: '50%', backgroundColor: COLORS.secondary }]} />
            <View style={[styles.decorDot, { right: 0, top: '50%', backgroundColor: COLORS.secondary }]} />
          </Animated.View>

          {/* Glow */}
          <Animated.View style={[styles.heroGlow, { opacity: glowAnim, backgroundColor: 'rgba(212,175,55,0.12)' }]} />

          {/* Logo */}
          <View style={[styles.logoWrap, { borderColor: COLORS.secondary }]}>
            <View style={[styles.logoInner, { backgroundColor: 'rgba(212,175,55,0.12)' }]}>
              <Ionicons name="mosque" size={48} color={COLORS.secondary} />
            </View>
          </View>

          {/* Title */}
          <Text style={[styles.heroTitle, { color: COLORS.secondary }]}>Sobanukirwa</Text>
          <Text style={[styles.heroSubtitle, { color: COLORS.textMuted }]}>
            {t('Urumuri rw\'Imyemero', 'Light of Faith', 'نور الإيمان')}
          </Text>

          {/* Decorative divider with diamond */}
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: COLORS.secondary }]} />
            <View style={[styles.dividerDiamond, { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary }]}>
              <View style={[styles.dividerDiamondInner, { backgroundColor: COLORS.primaryDark }]} />
            </View>
            <View style={[styles.dividerLine, { backgroundColor: COLORS.secondary }]} />
          </View>

          {/* Tagline */}
          <View style={[styles.heroTag, { backgroundColor: 'rgba(212,175,55,0.08)', borderColor: 'rgba(212,175,55,0.25)' }]}>
            <Ionicons name="star" size={12} color={COLORS.secondary} />
            <Text style={[styles.heroTagText, { color: COLORS.secondary }]}>
              {t('Ubumenyi bw\'Igisilamu', 'Islamic Knowledge', 'المعرفة الإسلامية')}
            </Text>
            <Ionicons name="star" size={12} color={COLORS.secondary} />
          </View>
        </Animated.View>

        {/* === BISMILLAH === */}
        <View style={[styles.glassCard, styles.bismillahCard, { borderColor: 'rgba(212,175,55,0.3)' }]}>
          <View style={[styles.bismillahDecorLeft, { backgroundColor: 'rgba(212,175,55,0.06)' }]} />
          <View style={[styles.bismillahDecorRight, { backgroundColor: 'rgba(212,175,55,0.06)' }]} />
          <View style={[styles.bismillahIconWrap, { backgroundColor: 'rgba(212,175,55,0.12)' }]}>
            <Ionicons name="diamond" size={18} color={COLORS.secondary} />
          </View>
          <Text style={[styles.bismillahArabic, { color: COLORS.secondary }]}>
            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
          </Text>
          <Text style={[styles.bismillahTranslation, { color: COLORS.textMuted }]}>
            {t(
              'Mwimerere w\'Imana yose, Nyir\'Impuhuzo, Nyir\'Impuhuzo',
              'In the name of Allah, the Most Gracious, the Most Merciful',
              'بسم الله الرحمن الرحيم'
            )}
          </Text>
        </View>

        {/* === ABOUT MISSION === */}
        <View style={[styles.glassCard, { borderColor: COLORS.border }]}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.cardIconWrap, { backgroundColor: 'rgba(212,175,55,0.10)' }]}>
              <Ionicons name="information-circle" size={22} color={COLORS.secondary} />
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={[styles.cardSectionTitle, { color: COLORS.secondary }]}>
                {t('Ibyerekeye', 'About', 'حول التطبيق')}
              </Text>
              <Text style={[styles.cardSectionSub, { color: COLORS.textMuted }]}>
                {t('Ikibaho n\'Intego', 'Mission & Vision', 'الرسالة والرؤية')}
              </Text>
            </View>
          </View>
          <View style={[styles.accentLine, { backgroundColor: COLORS.secondary }]} />
          <Text style={[styles.aboutText, { color: COLORS.text }]}>
            {t(
              'Sobanukirwa ni urubuga rwo kwigisha Islamic mu rurimi rw\'Ikinyarwanda. Dufite intego yo gufasha abantu kumenya ukuri, ubuhanga, n\'ubwiza bwa Islam.',
              'Sobanukirwa is an Islamic learning platform in Kinyarwanda. Our goal is to help people understand the truth, knowledge, and beauty of Islam.',
              'سوبانوكيروا منصة تعليم إسلامي باللغة الكينيارواندية. هدفنا مساعدة الناس على فهم الحقيقة والمعرفة وجمال الإسلام.'
            )}
          </Text>
          <View style={[styles.aboutDivider, { backgroundColor: 'rgba(212,175,55,0.12)' }]} />
          <Text style={[styles.aboutText, { color: COLORS.text }]}>
            {t(
              'Twifuza ko uzabona inyigisho zifatika hano. Allah nawe aduhe gukora ibimushimisha.',
              'We hope you find beneficial lessons here. May Allah help us do what pleases Him.',
              'نأمل أن تجد دروسًا مفيدة هنا. وفقنا الله جميعًا لفعل ما يرضيه.'
            )}
          </Text>
        </View>

        {/* === FEATURES === */}
        <View style={[styles.glassCard, { borderColor: COLORS.border }]}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.cardIconWrap, { backgroundColor: 'rgba(212,175,55,0.10)' }]}>
              <Ionicons name="sparkles" size={22} color={COLORS.secondary} />
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={[styles.cardSectionTitle, { color: COLORS.secondary }]}>
                {t('Ibikoresho', 'Features', 'المميزات')}
              </Text>
              <Text style={[styles.cardSectionSub, { color: COLORS.textMuted }]}>
                {t('Ibikoresho vyose hamwe', 'All in one place', 'كل شيء في مكان واحد')}
              </Text>
            </View>
          </View>
          <View style={styles.featuresGrid}>
            {FEATURES.map((feat, i) => (
              <TouchableOpacity key={i} style={[styles.featureItem, { backgroundColor: 'rgba(212,175,55,0.06)', borderColor: 'rgba(212,175,55,0.18)' }]} activeOpacity={0.7}>
                <View style={[styles.featureIconWrap, { backgroundColor: 'rgba(212,175,55,0.12)' }]}>
                  <Ionicons name={feat.icon} size={22} color={COLORS.secondary} />
                </View>
                <Text style={[styles.featureName, { color: COLORS.text }]}>
                  {t(feat.labelRw, feat.label, feat.label)}
                </Text>
                <Text style={[styles.featureSub, { color: COLORS.textMuted }]}>{feat.sublabel}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* === OUR APPS === */}
        <View style={[styles.glassCard, { borderColor: COLORS.border }]}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.cardIconWrap, { backgroundColor: 'rgba(212,175,55,0.10)' }]}>
              <Ionicons name="logo-google-playstore" size={22} color={COLORS.secondary} />
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={[styles.cardSectionTitle, { color: COLORS.secondary }]}>
                {t('Porogaramu zacu', 'Our Apps', 'تطبيقاتنا')}
              </Text>
              <Text style={[styles.cardSectionSub, { color: COLORS.textMuted }]}>
                {t('Ziyungurure kuri Play Store', 'Download on Play Store', 'حمّل من متجر بلاي')}
              </Text>
            </View>
          </View>
          <View style={styles.appsGrid}>
            {OTHER_APPS.map((app, i) => (
              <TouchableOpacity key={i} style={styles.appCardOuter} onPress={() => app.url !== '#' && Linking.openURL(app.url)} activeOpacity={0.7}>
                <View style={[styles.appCard, { borderColor: COLORS.border }]}>
                  <View style={[styles.appIconBg, { backgroundColor: `${app.color}15` }]}>
                    <View style={[styles.appIconCircle, { backgroundColor: `${app.color}25`, borderColor: `${app.color}40` }]}>
                      <Ionicons name={app.icon} size={26} color={app.color} />
                    </View>
                  </View>
                  <Text style={[styles.appName, { color: COLORS.text }]} numberOfLines={1}>{app.name}</Text>
                  <Text style={[styles.appNameEn, { color: COLORS.textMuted }]} numberOfLines={1}>{app.nameEn}</Text>
                  <View style={[styles.playBtn, { backgroundColor: COLORS.secondary }]}>
                    <Ionicons name="logo-google-playstore" size={12} color={COLORS.primaryDark} />
                    <Text style={[styles.playBtnText, { color: COLORS.primaryDark }]}>
                      {t('Shyira ku Play Store', 'Play Store', 'متجر بلاي')}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* === SOCIAL === */}
        <View style={[styles.glassCard, { borderColor: COLORS.border }]}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.cardIconWrap, { backgroundColor: 'rgba(212,175,55,0.10)' }]}>
              <Ionicons name="heart" size={22} color={COLORS.secondary} />
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={[styles.cardSectionTitle, { color: COLORS.secondary }]}>
                {t('Duherereye', 'Follow Us', 'تابعنا')}
              </Text>
              <Text style={[styles.cardSectionSub, { color: COLORS.textMuted }]}>
                {t('Dukurikire kuri social media', 'Connect with us', 'تواصل معنا')}
              </Text>
            </View>
          </View>
          <View style={styles.socialRow}>
            {SOCIALS.map((social, i) => (
              <TouchableOpacity key={i} style={[styles.socialBtn, { backgroundColor: `${social.color}15`, borderColor: `${social.color}40` }]} onPress={() => Linking.openURL(social.url)} activeOpacity={0.7}>
                <Ionicons name={social.icon} size={26} color={social.color} />
                <Text style={[styles.socialLabel, { color: COLORS.textMuted }]}>{social.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* === DUA === */}
        <View style={[styles.glassCard, styles.duaCard, { borderColor: 'rgba(212,175,55,0.3)' }]}>
          <View style={[styles.duaDecorTop, { backgroundColor: 'rgba(212,175,55,0.08)' }]} />
          <View style={[styles.duaIconWrap, { backgroundColor: 'rgba(212,175,55,0.12)' }]}>
            <Ionicons name="hand-left" size={22} color={COLORS.secondary} />
          </View>
          <Text style={[styles.duaText, { color: COLORS.text }]}>
            {t(
              'Rabana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina \'adhaban-nar.',
              'Our Lord, give us in this world good and in the Hereafter good and protect us from the Fire.',
              'ربنا آتنا في الدنيا حسنة وفي الآخرة حسنة وقنا عذاب النار'
            )}
          </Text>
          <Text style={[styles.duaSource, { color: COLORS.secondary }]}>— Al-Baqarah: 201</Text>
        </View>

        {/* === FOOTER === */}
        <View style={styles.footerSection}>
          <View style={styles.footerDividerRow}>
            <View style={[styles.footerLine, { backgroundColor: 'rgba(212,175,55,0.15)' }]} />
            <Ionicons name="star" size={10} color={COLORS.secondary} />
            <View style={[styles.footerLine, { backgroundColor: 'rgba(212,175,55,0.15)' }]} />
          </View>
          <Text style={[styles.footerDisclaimer, { color: COLORS.textMuted }]}>
            {t(
              'Umusanzu wose uri mu Bwoko bw\'Igisilamu',
              'All content from Quran and Sunnah',
              'كل المحتوى من القرآن والسنة'
            )}
          </Text>
          <Text style={[styles.footerVersion, { color: COLORS.textMuted }]}>Sobanukirwa v1.0.0</Text>
        </View>

        {/* === SETTINGS BUTTON === */}
        <TouchableOpacity style={[styles.settingsBtn, { borderColor: COLORS.secondary, backgroundColor: 'rgba(212,175,55,0.06)' }]} onPress={() => navigation.navigate('Settings')} activeOpacity={0.7}>
          <Ionicons name="settings" size={20} color={COLORS.secondary} />
          <Text style={[styles.settingsBtnText, { color: COLORS.secondary }]}>
            {t('Igenamiterere', 'Settings', 'الإعدادات')}
          </Text>
          <Ionicons name="chevron-forward" size={18} color={COLORS.secondary} />
        </TouchableOpacity>

      </ScrollView>
      </ScreenBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
    width: 100, height: 100, borderRadius: 50, borderWidth: 3,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#d4af37', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 25, elevation: 12,
  },
  logoInner: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center' },
  heroTitle: { fontSize: 32, fontWeight: '700', fontFamily: 'serif', marginTop: 16 },
  heroSubtitle: { fontSize: 14, marginTop: 6, letterSpacing: 0.5 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16 },
  dividerLine: { width: 50, height: 2, borderRadius: 1 },
  dividerDiamond: { width: 12, height: 12, borderRadius: 2, transform: [{ rotate: '45deg' }], alignItems: 'center', justifyContent: 'center' },
  dividerDiamondInner: { width: 5, height: 5, borderRadius: 1 },
  heroTag: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1, marginTop: 16,
  },
  heroTagText: { fontSize: 12, fontWeight: '600' },

  /* === GLASS CARDS === */
  glassCard: {
    backgroundColor: 'rgba(30, 60, 92, 0.22)',
    borderRadius: 20, borderWidth: 1.5, padding: 18, gap: 12,
    overflow: 'hidden',
  },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  cardIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardHeaderText: { flex: 1 },
  cardSectionTitle: { fontSize: 17, fontWeight: '700' },
  cardSectionSub: { fontSize: 11, marginTop: 1 },
  accentLine: { width: 30, height: 3, borderRadius: 2 },

  /* === BISMILLAH === */
  bismillahCard: { alignItems: 'center', paddingVertical: 22 },
  bismillahDecorLeft: { position: 'absolute', top: 0, left: 0, width: 60, height: 60, borderBottomRightRadius: 60 },
  bismillahDecorRight: { position: 'absolute', bottom: 0, right: 0, width: 60, height: 60, borderTopLeftRadius: 60 },
  bismillahIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  bismillahArabic: { fontSize: 26, fontFamily: 'serif', textAlign: 'center', lineHeight: 42 },
  bismillahTranslation: { fontSize: 12, textAlign: 'center', fontStyle: 'italic', lineHeight: 18, paddingHorizontal: 10 },

  /* === ABOUT TEXT === */
  aboutText: { fontSize: 14, lineHeight: 23 },
  aboutDivider: { height: 1, marginVertical: 2 },

  /* === FEATURES === */
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  featureItem: {
    width: (width - 76) / 3, paddingVertical: 14, borderRadius: 16, borderWidth: 1,
    alignItems: 'center', gap: 6,
  },
  featureIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  featureName: { fontSize: 11, fontWeight: '700', textAlign: 'center' },
  featureSub: { fontSize: 9 },

  /* === APPS === */
  appsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  appCardOuter: { width: (width - 76) / 3 },
  appCard: {
    backgroundColor: 'rgba(30,60,92,0.25)', borderRadius: 18, borderWidth: 1.5,
    paddingVertical: 16, paddingHorizontal: 8, alignItems: 'center', gap: 5,
  },
  appIconBg: { width: 58, height: 58, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  appIconCircle: { width: 50, height: 50, borderRadius: 14, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  appName: { fontSize: 11, fontWeight: '700', textAlign: 'center' },
  appNameEn: { fontSize: 9, textAlign: 'center' },
  playBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16, marginTop: 4,
  },
  playBtnText: { fontSize: 9, fontWeight: '700' },

  /* === SOCIAL === */
  socialRow: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  socialBtn: {
    width: 72, height: 72, borderRadius: 18, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  socialLabel: { fontSize: 8, fontWeight: '600', textAlign: 'center' },

  /* === DUA === */
  duaCard: { alignItems: 'center', paddingVertical: 24 },
  duaDecorTop: { position: 'absolute', top: 0, left: '25%', right: '25%', height: 3, borderRadius: 2 },
  duaIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  duaText: { fontSize: 13, lineHeight: 22, textAlign: 'center', fontStyle: 'italic', paddingHorizontal: 10 },
  duaSource: { fontSize: 12, fontWeight: '700', marginTop: 8 },

  /* === FOOTER === */
  footerSection: { alignItems: 'center', gap: 8, marginTop: 6 },
  footerDividerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  footerLine: { width: 30, height: 2, borderRadius: 1 },
  footerDisclaimer: { fontSize: 11, textAlign: 'center' },
  footerVersion: { fontSize: 12, fontWeight: '600' },

  /* === SETTINGS === */
  settingsBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    padding: 16, borderRadius: 18, borderWidth: 2,
  },
  settingsBtnText: { fontSize: 15, fontWeight: '600', flex: 1, textAlign: 'center' },
});
