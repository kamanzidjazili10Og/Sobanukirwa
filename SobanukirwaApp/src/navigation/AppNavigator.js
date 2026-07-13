import React, { useState, useEffect, useCallback } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { fetchAdhkar } from '../services/api';
import { startAdhanManager, stopAdhanManager, stopAdhan } from '../services/AdhanManager';
import { startAdhkarReminder, stopAdhkarReminder, AdhkarReminderModal } from '../components/AdhkarReminder';
import AdhanNotification from '../components/AdhanNotification';

import HomeScreen from '../screens/HomeScreen';
import AudioScreen from '../screens/AudioScreen';
import AudioPlayerScreen from '../screens/AudioPlayerScreen';
import VideoScreen from '../screens/VideoScreen';
import VideoPlayerScreen from '../screens/VideoPlayerScreen';
import QuranScreen from '../screens/QuranScreen';
import SurahDetailScreen from '../screens/SurahDetailScreen';
import PrayerScreen from '../screens/PrayerScreen';
import QiblaScreen from '../screens/QiblaScreen';
import AboutScreen from '../screens/AboutScreen';
import SettingsScreen from '../screens/SettingsScreen';
import BooksScreen from '../screens/BooksScreen';
import AdhkarScreen from '../screens/AdhkarScreen';
import AdminNavigator from './AdminNavigator';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeTabs() {
  const { COLORS, t } = useApp();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.primaryDark,
          borderTopColor: COLORS.border,
          borderTopWidth: 2,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.secondary,
        tabBarInactiveTintColor: COLORS.textMuted,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{
        tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        tabBarLabel: t('Ahabanza', 'Home', 'الرئيسية'),
      }} />
      <Tab.Screen name="Prayer" component={PrayerScreen} options={{
        tabBarIcon: ({ color, size }) => <Ionicons name="time" size={size} color={color} />,
        tabBarLabel: t('Isengesho', 'Prayer', 'الصلاة'),
      }} />
      <Tab.Screen name="Quran" component={QuranScreen} options={{
        tabBarIcon: ({ color, size }) => <Ionicons name="book" size={size} color={color} />,
        tabBarLabel: t('Qur\'an', 'Quran', 'القرآن'),
      }} />
      <Tab.Screen name="Audio" component={AudioScreen} options={{
        tabBarIcon: ({ color, size }) => <Ionicons name="headset" size={size} color={color} />,
        tabBarLabel: t('Inyigisho', 'Audio', 'الدروس'),
      }} />
      <Tab.Screen name="Books" component={BooksScreen} options={{
        tabBarIcon: ({ color, size }) => <Ionicons name="book-open" size={size} color={color} />,
        tabBarLabel: t('Ibikubiyemo', 'Books', 'الكتب'),
      }} />
      <Tab.Screen name="Videos" component={VideoScreen} options={{
        tabBarIcon: ({ color, size }) => <Ionicons name="videocam" size={size} color={color} />,
        tabBarLabel: t('Amashusho', 'Videos', 'الفيديو'),
      }} />
      <Tab.Screen name="About" component={AboutScreen} options={{
        tabBarIcon: ({ color, size }) => <Ionicons name="ellipsis-horizontal" size={size} color={color} />,
        tabBarLabel: t('Ibyerekeye', 'About', 'حول'),
      }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const {
    adhanEnabled, adhanReciter, adhanVolume,
    reminderEnabled, reminderInterval, adhkarReminder,
    isEffectivelySilent, language,
  } = useApp();

  const [adhanVisible, setAdhanVisible] = useState(false);
  const [adhanPrayer, setAdhanPrayer] = useState('');
  const [adhkarModalVisible, setAdhkarModalVisible] = useState(false);
  const [currentAdhkar, setCurrentAdhkar] = useState(null);

  useEffect(() => {
    if (adhanEnabled) {
      const getPrayerTimes = async () => {
        try {
          const { fetchPrayerTimes: ft } = require('../services/api');
          const data = await ft(-1.9403, 29.8739);
          if (data && data.timings) {
            const sanitized = {};
            ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].forEach(name => {
              const val = data.timings[name];
              if (val) {
                const clean = val.replace(/ \(.*\)/, '');
                if (/^\d{1,2}:\d{2}$/.test(clean)) sanitized[name] = clean;
              }
            });
            return sanitized;
          }
        } catch (e) {}
        return null;
      };
      startAdhanManager(getPrayerTimes, (prayer) => {
        setAdhanPrayer(prayer);
        setAdhanVisible(true);
      });
    }
    return () => stopAdhanManager();
  }, [adhanEnabled]);

  useEffect(() => {
    if (adhkarReminder && reminderEnabled) {
      fetchAdhkar().then(data => {
        const list = (data && data.length > 0) ? data.map(a => ({
          id: a.id,
          arabic: a.arabic_text,
          transliteration: a.transliteration,
          translation_en: a.translation_en || '',
          translation_rw: a.translation_rw || a.translation_en || '',
          audio_url: a.audio_url || null,
        })) : [
          { id: 1, arabic: 'سُبْحَانَ اللَّهِ', transliteration: 'Subhanallah', translation_en: 'Glory be to Allah', translation_rw: 'Imana ni yose' },
          { id: 2, arabic: 'الْحَمْدُ لِلَّهِ', transliteration: 'Alhamdulillah', translation_en: 'All praise is due to Allah', translation_rw: 'Ishimwe ryose ni ry\'Imana' },
          { id: 3, arabic: 'اللَّهُ أَكْبَرُ', transliteration: 'Allahu Akbar', translation_en: 'Allah is the Greatest', translation_rw: 'Imana ni Nkuru' },
        ];
        startAdhkarReminder(reminderInterval, list, (adhkar) => {
          setCurrentAdhkar(adhkar);
          setAdhkarModalVisible(true);
        });
      });
    } else {
      stopAdhkarReminder();
    }
    return () => stopAdhkarReminder();
  }, [adhkarReminder, reminderEnabled, reminderInterval]);

  return (
    <>
      <AdhanNotification
        visible={adhanVisible}
        prayerName={adhanPrayer}
        reciter={adhanReciter}
        volume={adhanVolume}
        onDismiss={() => { setAdhanVisible(false); stopAdhan(); }}
      />
      <AdhkarReminderModal
        visible={adhkarModalVisible}
        adhkar={currentAdhkar}
        language={language}
        silentMode={isEffectivelySilent}
        onSnooze={() => setAdhkarModalVisible(false)}
        onDismiss={() => setAdhkarModalVisible(false)}
      />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={HomeTabs} />
        <Stack.Screen name="AudioPlayer" component={AudioPlayerScreen} options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="VideoPlayer" component={VideoPlayerScreen} options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="SurahDetail" component={SurahDetailScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Qibla" component={QiblaScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Adhkar" component={AdhkarScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Admin" component={AdminNavigator} options={{ animation: 'slide_from_bottom' }} />
      </Stack.Navigator>
    </>
  );
}
