import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

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
  const { COLORS } = useApp();

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
        tabBarLabel: 'Home',
      }} />
      <Tab.Screen name="Prayer" component={PrayerScreen} options={{
        tabBarIcon: ({ color, size }) => <Ionicons name="time" size={size} color={color} />,
        tabBarLabel: 'Prayer',
      }} />
      <Tab.Screen name="Quran" component={QuranScreen} options={{
        tabBarIcon: ({ color, size }) => <Ionicons name="book" size={size} color={color} />,
        tabBarLabel: 'Quran',
      }} />
      <Tab.Screen name="Audio" component={AudioScreen} options={{
        tabBarIcon: ({ color, size }) => <Ionicons name="headset" size={size} color={color} />,
        tabBarLabel: 'Audio',
      }} />
      <Tab.Screen name="Books" component={BooksScreen} options={{
        tabBarIcon: ({ color, size }) => <Ionicons name="book-open" size={size} color={color} />,
        tabBarLabel: 'Books',
      }} />
      <Tab.Screen name="Videos" component={VideoScreen} options={{
        tabBarIcon: ({ color, size }) => <Ionicons name="videocam" size={size} color={color} />,
        tabBarLabel: 'Videos',
      }} />
      <Tab.Screen name="About" component={AboutScreen} options={{
        tabBarIcon: ({ color, size }) => <Ionicons name="ellipsis-horizontal" size={size} color={color} />,
        tabBarLabel: 'About',
      }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
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
  );
}
