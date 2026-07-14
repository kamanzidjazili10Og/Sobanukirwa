import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchTracks, fetchCategories, fetchSurahs, fetchVideos, fetchBooks } from '../services/api';

const AppContext = createContext();

const COLORS = {
  primary: '#1e3c5c',
  primaryDark: '#0f2a3f',
  primaryLight: '#2d5679',
  secondary: '#d4af37',
  secondaryLight: '#f1c40f',
  secondaryDark: '#b4941c',
  accent: '#8b6b4d',
  accentLight: '#b5926c',
  background: '#0b1a2a',
  surface: 'rgba(30, 60, 92, 0.2)',
  surfaceDark: 'rgba(11, 26, 42, 0.95)',
  text: '#f0f4fa',
  textMuted: '#a8c1d9',
  textGold: '#d4af37',
  error: '#e74c3c',
  success: '#27ae60',
  warning: '#f39c12',
  border: 'rgba(212, 175, 55, 0.2)',
};

export function AppProvider({ children }) {
  const [tracks, setTracks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [surahs, setSurahs] = useState([]);
  const [videos, setVideos] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [language, setLanguage] = useState('rw');
  const [error, setError] = useState(null);
  const [lastRead, setLastRead] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentCategoryTracks, setCurrentCategoryTracks] = useState([]);
  const [adhanEnabled, setAdhanEnabled] = useState(true);
  const [adhanVolume, setAdhanVolume] = useState(80);
  const [adhanReciter, setAdhanReciter] = useState('Adhan1');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderInterval, setReminderInterval] = useState(30);
  const [adhkarReminder, setAdhkarReminder] = useState(false);
  const [silentMode, setSilentMode] = useState(false);
  const [smartSilent, setSmartSilent] = useState(false);
  const [scheduledSilent, setScheduledSilent] = useState(false);
  const [silentFrom, setSilentFrom] = useState('22:00');
  const [silentTo, setSilentTo] = useState('06:00');
  const [silentPrayers, setSilentPrayers] = useState({ Fajr: true, Dhuhr: true, Asr: true, Maghrib: true, Isha: true });
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);

  const pauseAudioRef = useRef(null);
  const pauseVideoRef = useRef(null);
  const stopAdhanRef = useRef(null);

  const registerPauseAudio = useCallback((fn) => { pauseAudioRef.current = fn; }, []);
  const registerPauseVideo = useCallback((fn) => { pauseVideoRef.current = fn; }, []);
  const registerStopAdhan = useCallback((fn) => { stopAdhanRef.current = fn; }, []);

  const stopAllMedia = useCallback(() => {
    if (pauseAudioRef.current) pauseAudioRef.current();
    if (pauseVideoRef.current) pauseVideoRef.current();
    if (stopAdhanRef.current) stopAdhanRef.current();
  }, []);

  useEffect(() => {
    if (silentMode) stopAllMedia();
  }, [silentMode]);

  useEffect(() => {
    loadPersistedState();
  }, []);

  async function loadPersistedState() {
    try {
      const [lang, lastReadSurah, savedBookmarks, settings] = await Promise.all([
        AsyncStorage.getItem('app_language'),
        AsyncStorage.getItem('last_read_surah'),
        AsyncStorage.getItem('bookmarks'),
        AsyncStorage.getItem('app_settings'),
      ]);
      if (lang) setLanguage(lang);
      if (lastReadSurah) setLastRead(JSON.parse(lastReadSurah));
      if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));
      if (settings) {
        const s = JSON.parse(settings);
        if (s.adhanEnabled !== undefined) setAdhanEnabled(s.adhanEnabled);
        if (s.adhanVolume !== undefined) setAdhanVolume(s.adhanVolume);
        if (s.adhanReciter) setAdhanReciter(s.adhanReciter);
        if (s.reminderEnabled !== undefined) setReminderEnabled(s.reminderEnabled);
        if (s.reminderInterval) setReminderInterval(s.reminderInterval);
        if (s.adhkarReminder !== undefined) setAdhkarReminder(s.adhkarReminder);
        if (s.silentMode !== undefined) setSilentMode(s.silentMode);
        if (s.smartSilent !== undefined) setSmartSilent(s.smartSilent);
        if (s.scheduledSilent !== undefined) setScheduledSilent(s.scheduledSilent);
        if (s.silentFrom) setSilentFrom(s.silentFrom);
        if (s.silentTo) setSilentTo(s.silentTo);
        if (s.silentPrayers) setSilentPrayers(s.silentPrayers);
      }
    } catch (e) {}
  }

  async function saveSetting(key, value) {
    try {
      const settings = JSON.parse(await AsyncStorage.getItem('app_settings') || '{}');
      settings[key] = value;
      await AsyncStorage.setItem('app_settings', JSON.stringify(settings));
    } catch (e) {}
  }

  async function changeLanguage(lang) {
    setLanguage(lang);
    try { await AsyncStorage.setItem('app_language', lang); } catch (e) {}
  }

  async function saveLastRead(surah) {
    setLastRead(surah);
    try { await AsyncStorage.setItem('last_read_surah', JSON.stringify(surah)); } catch (e) {}
  }

  async function toggleBookmark(surah) {
    const exists = bookmarks.find(b => b.number === surah.number);
    const newBookmarks = exists ? bookmarks.filter(b => b.number !== surah.number) : [...bookmarks, surah];
    setBookmarks(newBookmarks);
    try { await AsyncStorage.setItem('bookmarks', JSON.stringify(newBookmarks)); } catch (e) {}
  }

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [t, c, s, v, b] = await Promise.all([
        fetchTracks(), fetchCategories(), fetchSurahs(), fetchVideos(), fetchBooks()
      ]);
      setTracks(t);
      setCategories(c);
      setSurahs(s);
      setVideos(v);
      setBooks(b);
    } catch (e) {
      setError('Failed to load data');
    }
    setLoading(false);
  };

  const refreshData = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const [t, c, s, v, b] = await Promise.all([
        fetchTracks(), fetchCategories(), fetchSurahs(), fetchVideos(), fetchBooks()
      ]);
      setTracks(t);
      setCategories(c);
      setSurahs(s);
      setVideos(v);
      setBooks(b);
    } catch (e) {
      setError('Failed to refresh');
    }
    setRefreshing(false);
  }, []);

  useEffect(() => { loadAllData(); }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') refreshData();
    });
    return () => sub.remove();
  }, [refreshData]);

  const tr = (rw, en, ar) => {
    if (language === 'en') return en;
    if (language === 'ar') return ar;
    return rw;
  };

  function isScheduledSilentActive() {
    if (!scheduledSilent) return false;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [sh, sm] = silentFrom.split(':').map(Number);
    const [eh, em] = silentTo.split(':').map(Number);
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;
    if (startMin <= endMin) return currentMinutes >= startMin && currentMinutes < endMin;
    return currentMinutes >= startMin || currentMinutes < endMin;
  }

  const isEffectivelySilent = silentMode || isScheduledSilentActive();

  return (
    <AppContext.Provider value={{
      tracks, categories, surahs, videos, books,
      loading, refreshing, error, language, setLanguage: changeLanguage,
      loadAllData, refreshData, t: tr, COLORS, saveSetting,
      lastRead, saveLastRead, bookmarks, toggleBookmark,
      currentTrack, setCurrentTrack, isPlaying, setIsPlaying,
      currentTrackIndex, setCurrentTrackIndex, currentCategoryTracks, setCurrentCategoryTracks,
      stopAllMedia, registerPauseAudio, registerPauseVideo, registerStopAdhan,
      adhanEnabled, setAdhanEnabled, adhanVolume, setAdhanVolume, adhanReciter, setAdhanReciter,
      reminderEnabled, setReminderEnabled, reminderInterval, setReminderInterval,
      adhkarReminder, setAdhkarReminder,
      silentMode, setSilentMode, smartSilent, setSmartSilent,
      scheduledSilent, setScheduledSilent, silentFrom, setSilentFrom, silentTo, setSilentTo,
      silentPrayers, setSilentPrayers,
      isEffectivelySilent, isScheduledSilentActive,
      adminLoggedIn, setAdminLoggedIn,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
