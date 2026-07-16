import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
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

const TAB_ICONS = {
  Home: { active: 'home', inactive: 'home-outline' },
  Prayer: { active: 'time', inactive: 'time-outline' },
  Quran: { active: 'book', inactive: 'book-outline' },
  Audio: { active: 'headset', inactive: 'headset-outline' },
  Books: { active: 'library', inactive: 'library-outline' },
  Videos: { active: 'film', inactive: 'film-outline' },
  About: { active: 'ellipsis-horizontal', inactive: 'ellipsis-horizontal-outline' },
};

function HomeTabs() {
  const { t } = useApp();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#5EEAD4',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.45)',
        tabBarStyle: {
          backgroundColor: 'rgba(6, 48, 44, 0.92)',
          borderTopColor: 'rgba(255,255,255,0.1)',
          borderTopWidth: 1,
          height: 65,
          paddingBottom: 8,
          paddingTop: 6,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 2,
          letterSpacing: 0.3,
        },
        tabBarHideOnKeyboard: true,
        tabBarIcon: ({ color, size, focused }) => {
          const icons = TAB_ICONS[route.name] || { active: 'ellipse', inactive: 'ellipse-outline' };
          return <Ionicons name={focused ? icons.active : icons.inactive} size={size} color={color} />;
        },
        tabBarLabel: t(
          route.name === 'Home' ? 'Ahabanza' : route.name === 'Prayer' ? 'Isengesho' : route.name === 'Quran' ? 'Qor\'an' : route.name === 'Audio' ? 'Inyigisho' : route.name === 'Books' ? 'Ibitabo' : route.name === 'Videos' ? 'Amashusho' : 'Ibyerekeye',
          route.name === 'Home' ? 'Home' : route.name === 'Prayer' ? 'Prayer' : route.name === 'Quran' ? 'Quran' : route.name === 'Audio' ? 'Audio' : route.name === 'Books' ? 'Books' : route.name === 'Videos' ? 'Videos' : 'About',
          route.name === 'Home' ? 'الرئيسية' : route.name === 'Prayer' ? 'الصلاة' : route.name === 'Quran' ? 'القرآن' : route.name === 'Audio' ? 'الدروس' : route.name === 'Books' ? 'الكتب' : route.name === 'Videos' ? 'الفيديو' : 'حول'
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Prayer" component={PrayerScreen} />
      <Tab.Screen name="Quran" component={QuranScreen} />
      <Tab.Screen name="Audio" component={AudioScreen} />
      <Tab.Screen name="Books" component={BooksScreen} />
      <Tab.Screen name="Videos" component={VideoScreen} />
      <Tab.Screen name="About" component={AboutScreen} />
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
