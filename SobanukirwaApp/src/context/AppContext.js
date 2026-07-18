import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { fetchTracks, fetchCategories, fetchSurahs, fetchVideos, fetchBooks, fetchAdhkar } from '../services/api';
import { startAutoSync, processPendingOps, getPendingCount, onSyncStatusChange } from '../services/SyncQueue';

const AppContext = createContext();

const COLORS = {
  primary: '#0F766E',
  primaryDark: '#0D5C56',
  primaryLight: '#14B8A6',
  secondary: '#14B8A6',
  secondaryLight: '#2DD4BF',
  secondaryDark: '#0D9488',
  accent: '#F59E0B',
  accentLight: '#FBBF24',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceDark: '#F1F5F9',
  text: '#111827',
  textMuted: '#6B7280',
  textGold: '#F59E0B',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  border: '#E5E7EB',
};

const CACHE_KEYS = {
  tracks: 'cache_tracks',
  categories: 'cache_categories',
  surahs: 'cache_surahs',
  videos: 'cache_videos',
  books: 'cache_books',
  adhkar: 'cache_adhkar',
  cacheTime: 'cache_time',
};

const CACHE_DURATION = 24 * 60 * 60 * 1000;

export function AppProvider({ children }) {
  const [tracks, setTracks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [surahs, setSurahs] = useState([]);
  const [videos, setVideos] = useState([]);
  const [books, setBooks] = useState([]);
  const [adhkar, setAdhkar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [language, setLanguage] = useState('rw');
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
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
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

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
    const unsub = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected || !state.isInternetReachable);
    });

    const stopSync = startAutoSync(60000);

    const unsubSync = onSyncStatusChange((status) => {
      setPendingSyncCount(status.pending || 0);
      setIsSyncing(status.syncing || false);
    });

    getPendingCount().then(count => setPendingSyncCount(count));

    return () => {
      unsub();
      stopSync();
      unsubSync();
    };
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

  async function saveCacheData(data) {
    try {
      await Promise.all([
        AsyncStorage.setItem(CACHE_KEYS.tracks, JSON.stringify(data.tracks || [])),
        AsyncStorage.setItem(CACHE_KEYS.categories, JSON.stringify(data.categories || [])),
        AsyncStorage.setItem(CACHE_KEYS.surahs, JSON.stringify(data.surahs || [])),
        AsyncStorage.setItem(CACHE_KEYS.videos, JSON.stringify(data.videos || [])),
        AsyncStorage.setItem(CACHE_KEYS.books, JSON.stringify(data.books || [])),
        AsyncStorage.setItem(CACHE_KEYS.adhkar, JSON.stringify(data.adhkar || [])),
        AsyncStorage.setItem(CACHE_KEYS.cacheTime, String(Date.now())),
      ]);
    } catch (e) {}
  }

  async function loadCacheData() {
    try {
      const [cachedTracks, cachedCategories, cachedSurahs, cachedVideos, cachedBooks, cachedAdhkar] = await Promise.all([
        AsyncStorage.getItem(CACHE_KEYS.tracks),
        AsyncStorage.getItem(CACHE_KEYS.categories),
        AsyncStorage.getItem(CACHE_KEYS.surahs),
        AsyncStorage.getItem(CACHE_KEYS.videos),
        AsyncStorage.getItem(CACHE_KEYS.books),
        AsyncStorage.getItem(CACHE_KEYS.adhkar),
      ]);
      return {
        tracks: cachedTracks ? JSON.parse(cachedTracks) : [],
        categories: cachedCategories ? JSON.parse(cachedCategories) : [],
        surahs: cachedSurahs ? JSON.parse(cachedSurahs) : [],
        videos: cachedVideos ? JSON.parse(cachedVideos) : [],
        books: cachedBooks ? JSON.parse(cachedBooks) : [],
        adhkar: cachedAdhkar ? JSON.parse(cachedAdhkar) : [],
      };
    } catch (e) {
      return { tracks: [], categories: [], surahs: [], videos: [], books: [], adhkar: [] };
    }
  }

  async function clearCache() {
    try {
      await Promise.all([
        AsyncStorage.removeItem(CACHE_KEYS.tracks),
        AsyncStorage.removeItem(CACHE_KEYS.categories),
        AsyncStorage.removeItem(CACHE_KEYS.surahs),
        AsyncStorage.removeItem(CACHE_KEYS.videos),
        AsyncStorage.removeItem(CACHE_KEYS.books),
        AsyncStorage.removeItem(CACHE_KEYS.adhkar),
        AsyncStorage.removeItem(CACHE_KEYS.cacheTime),
      ]);
    } catch (e) {}
  }

  async function getCacheInfo() {
    try {
      const [cacheTime, tracksCount, categoriesCount, surahsCount, videosCount, booksCount, adhkarCount] = await Promise.all([
        AsyncStorage.getItem(CACHE_KEYS.cacheTime),
        AsyncStorage.getItem(CACHE_KEYS.tracks).then(d => d ? JSON.parse(d).length : 0),
        AsyncStorage.getItem(CACHE_KEYS.categories).then(d => d ? JSON.parse(d).length : 0),
        AsyncStorage.getItem(CACHE_KEYS.surahs).then(d => d ? JSON.parse(d).length : 0),
        AsyncStorage.getItem(CACHE_KEYS.videos).then(d => d ? JSON.parse(d).length : 0),
        AsyncStorage.getItem(CACHE_KEYS.books).then(d => d ? JSON.parse(d).length : 0),
        AsyncStorage.getItem(CACHE_KEYS.adhkar).then(d => d ? JSON.parse(d).length : 0),
      ]);
      return {
        lastUpdated: cacheTime ? new Date(parseInt(cacheTime)) : null,
        itemCounts: { tracks: tracksCount, categories: categoriesCount, surahs: surahsCount, videos: videosCount, books: booksCount, adhkar: adhkarCount },
        totalItems: tracksCount + categoriesCount + surahsCount + videosCount + booksCount + adhkarCount,
      };
    } catch (e) {
      return { lastUpdated: null, itemCounts: { tracks: 0, categories: 0, surahs: 0, videos: 0, books: 0, adhkar: 0 }, totalItems: 0 };
    }
  }

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [t, c, s, v, b, a] = await Promise.all([
        fetchTracks(), fetchCategories(), fetchSurahs(), fetchVideos(), fetchBooks(), fetchAdhkar()
      ]);
      setTracks(t);
      setCategories(c);
      setSurahs(s);
      setVideos(v);
      setBooks(b);
      setAdhkar(a);
      await saveCacheData({ tracks: t, categories: c, surahs: s, videos: v, books: b, adhkar: a });
    } catch (e) {
      const cached = await loadCacheData();
      if (cached.surahs.length > 0 || cached.tracks.length > 0) {
        setTracks(cached.tracks);
        setCategories(cached.categories);
        setSurahs(cached.surahs);
        setVideos(cached.videos);
        setBooks(cached.books);
        setAdhkar(cached.adhkar);
      } else {
        setError('Failed to load data');
      }
    }
    setLoading(false);
  };

  const refreshData = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const [t, c, s, v, b, a] = await Promise.all([
        fetchTracks(), fetchCategories(), fetchSurahs(), fetchVideos(), fetchBooks(), fetchAdhkar()
      ]);
      setTracks(t);
      setCategories(c);
      setSurahs(s);
      setVideos(v);
      setBooks(b);
      setAdhkar(a);
      await saveCacheData({ tracks: t, categories: c, surahs: s, videos: v, books: b, adhkar: a });
    } catch (e) {
      const cached = await loadCacheData();
      if (cached.surahs.length > 0 || cached.tracks.length > 0) {
        setTracks(cached.tracks);
        setCategories(cached.categories);
        setSurahs(cached.surahs);
        setVideos(cached.videos);
        setBooks(cached.books);
        setAdhkar(cached.adhkar);
      }
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
      tracks, categories, surahs, videos, books, adhkar,
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
      clearCache, getCacheInfo,
      isOffline,
      pendingSyncCount, isSyncing, processPendingOps,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
