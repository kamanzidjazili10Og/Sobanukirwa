import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { fetchTracks, fetchCategories, fetchSurahs, fetchVideos, fetchBooks, fetchAdhkar, getMediaUrl } from '../services/api';
import { startAutoSync, processPendingOps, getPendingCount, onSyncStatusChange, addPendingOp } from '../services/SyncQueue';
import { initVideoCache, isVideoCached, downloadVideo, removeCachedVideo, getCachedVideoPath, clearAllCachedVideos } from '../services/VideoCache';
import { initAudioCache, isAudioCached, downloadAudio, removeCachedAudio, getCachedAudioPath, clearAllCachedAudio, getCachedAudioCount, getAudioCacheSize, downloadAllTracks, getAudioCacheInfo } from '../services/AudioCache';
import { initBookCache, isBookCached, downloadBook, removeCachedBook, getCachedBookPath, clearAllCachedBooks, getCachedBookCount, getBookCacheSize, getBookCacheInfo, formatFileSize } from '../services/BookCache';
import { startBidirectionalSync, addLocalChange, getSyncStatus, pullServerData, syncLocalChangesToServer, onSyncEvent } from '../services/OfflineSync';

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
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderInterval, setReminderInterval] = useState(10);
  const [adhkarReminder, setAdhkarReminder] = useState(true);
  const [silentMode, setSilentMode] = useState(false);
  const [smartSilent, setSmartSilent] = useState(false);
  const [scheduledSilent, setScheduledSilent] = useState(false);
  const [silentFrom, setSilentFrom] = useState('22:00');
  const [silentTo, setSilentTo] = useState('06:00');
  const [silentPrayers, setSilentPrayers] = useState({ Fajr: true, Dhuhr: true, Asr: true, Maghrib: true, Isha: true });
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [cachedVideos, setCachedVideos] = useState({});
  const [videoDownloads, setVideoDownloads] = useState({});
  const [cachedAudios, setCachedAudios] = useState({});
  const [audioDownloads, setAudioDownloads] = useState({});
  const [cachedBooks, setCachedBooks] = useState({});
  const [bookDownloads, setBookDownloads] = useState({});
  const [syncStatus, setSyncStatus] = useState({ pendingChanges: 0, lastSyncTime: null });
  const [offlineReady, setOfflineReady] = useState(false);
  const [autoDownloadProgress, setAutoDownloadProgress] = useState({ active: false, downloaded: 0, total: 0, phase: '' });
  const lastAutoDownloadRef = useRef(false);

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

  // Video cache
  const checkVideoCache = useCallback(async (videoUrl) => {
    if (!videoUrl) return false;
    try {
      const cached = await isVideoCached(videoUrl);
      setCachedVideos(prev => ({ ...prev, [videoUrl]: cached }));
      return cached;
    } catch { return false; }
  }, []);

  const cacheVideo = useCallback(async (videoUrl, onProgress) => {
    if (!videoUrl) return null;
    try {
      setVideoDownloads(prev => ({ ...prev, [videoUrl]: { progress: 0, downloading: true } }));
      const localUri = await downloadVideo(videoUrl, (pct) => {
        setVideoDownloads(prev => ({ ...prev, [videoUrl]: { progress: pct, downloading: true } }));
      });
      if (localUri) {
        setCachedVideos(prev => ({ ...prev, [videoUrl]: true }));
        setVideoDownloads(prev => ({ ...prev, [videoUrl]: { progress: 1, downloading: false } }));
        return localUri;
      }
      setVideoDownloads(prev => ({ ...prev, [videoUrl]: { progress: 0, downloading: false, error: true } }));
      return null;
    } catch {
      setVideoDownloads(prev => ({ ...prev, [videoUrl]: { progress: 0, downloading: false, error: true } }));
      return null;
    }
  }, []);

  const uncacheVideo = useCallback(async (videoUrl) => {
    await removeCachedVideo(videoUrl);
    setCachedVideos(prev => ({ ...prev, [videoUrl]: false }));
  }, []);

  const getVideoLocalUri = useCallback(async (videoUrl) => {
    return await getCachedVideoPath(videoUrl);
  }, []);

  const initAllVideoCaches = useCallback(async (videoList) => {
    await initVideoCache();
    const status = {};
    for (const v of videoList) {
      if (v.videoUrl) {
        try { status[v.videoUrl] = await isVideoCached(v.videoUrl); } catch { status[v.videoUrl] = false; }
      }
    }
    setCachedVideos(status);
  }, []);

  // Audio cache
  const checkAudioCache = useCallback(async (audioUrl) => {
    if (!audioUrl) return false;
    try {
      const cached = await isAudioCached(audioUrl);
      setCachedAudios(prev => ({ ...prev, [audioUrl]: cached }));
      return cached;
    } catch { return false; }
  }, []);

  const cacheAudio = useCallback(async (audioUrl, onProgress) => {
    if (!audioUrl) return null;
    try {
      setAudioDownloads(prev => ({ ...prev, [audioUrl]: { progress: 0, downloading: true } }));
      const localUri = await downloadAudio(audioUrl, (pct) => {
        setAudioDownloads(prev => ({ ...prev, [audioUrl]: { progress: pct, downloading: true } }));
      });
      if (localUri) {
        setCachedAudios(prev => ({ ...prev, [audioUrl]: true }));
        setAudioDownloads(prev => ({ ...prev, [audioUrl]: { progress: 1, downloading: false } }));
        return localUri;
      }
      setAudioDownloads(prev => ({ ...prev, [audioUrl]: { progress: 0, downloading: false, error: true } }));
      return null;
    } catch {
      setAudioDownloads(prev => ({ ...prev, [audioUrl]: { progress: 0, downloading: false, error: true } }));
      return null;
    }
  }, []);

  const uncacheAudio = useCallback(async (audioUrl) => {
    await removeCachedAudio(audioUrl);
    setCachedAudios(prev => ({ ...prev, [audioUrl]: false }));
  }, []);

  const getAudioLocalUri = useCallback(async (audioUrl) => {
    return await getCachedAudioPath(audioUrl);
  }, []);

  const initAllAudioCaches = useCallback(async (trackList) => {
    await initAudioCache();
    const status = {};
    for (const t of trackList) {
      const url = t.audioUrl || t.audio_url;
      if (url) {
        try { status[url] = await isAudioCached(url); } catch { status[url] = false; }
      }
    }
    setCachedAudios(status);
  }, []);

  const cacheAllAudios = useCallback(async (trackList, onProgress) => {
    await initAudioCache();
    let downloaded = 0;
    const total = trackList.filter(t => t.audioUrl || t.audio_url).length;
    for (const t of trackList) {
      const url = t.audioUrl || t.audio_url;
      if (url && !(await isAudioCached(url))) {
        await downloadAudio(url, () => {});
      }
      downloaded++;
      if (onProgress) onProgress(downloaded, total);
      if (url) {
        setCachedAudios(prev => ({ ...prev, [url]: true }));
      }
    }
    return downloaded;
  }, []);

  // Auto-download all content for offline use
  const autoDownloadAllContent = useCallback(async (trackList, bookList, videoList) => {
    if (lastAutoDownloadRef.current) return;
    lastAutoDownloadRef.current = true;
    setAutoDownloadProgress({ active: true, downloaded: 0, total: 0, phase: 'starting' });

    try {
      let downloaded = 0;
      const audioTracks = trackList.filter(t => t.audioUrl || t.audio_url);
      const pdfBooks = bookList.filter(b => b.fileUrl);
      const videoList2 = videoList.filter(v => v.videoUrl);
      const total = audioTracks.length + pdfBooks.length + videoList2.length;

      setAutoDownloadProgress({ active: true, downloaded: 0, total, phase: 'audio' });

      await initAudioCache();
      for (const t of audioTracks) {
        const url = t.audioUrl || t.audio_url;
        if (url && !(await isAudioCached(url))) {
          try {
            await downloadAudio(url, () => {});
          } catch (e) {}
        }
        downloaded++;
        setAutoDownloadProgress({ active: true, downloaded, total, phase: 'audio' });
        if (url) setCachedAudios(prev => ({ ...prev, [url]: true }));
      }

      setAutoDownloadProgress({ active: true, downloaded, total, phase: 'books' });
      await initBookCache();
      for (const b of pdfBooks) {
        const fullUrl = getMediaUrl(b.fileUrl);
        if (fullUrl && !(await isBookCached(fullUrl))) {
          try {
            await downloadBook(fullUrl, () => {});
          } catch (e) {}
        }
        downloaded++;
        setAutoDownloadProgress({ active: true, downloaded, total, phase: 'books' });
        if (fullUrl) setCachedBooks(prev => ({ ...prev, [fullUrl]: true }));
      }

      setAutoDownloadProgress({ active: true, downloaded, total, phase: 'videos' });
      await initVideoCache();
      for (const v of videoList2) {
        const url = v.videoUrl;
        if (url && !(await isVideoCached(url))) {
          try {
            await downloadVideo(url, () => {});
          } catch (e) {}
        }
        downloaded++;
        setAutoDownloadProgress({ active: true, downloaded, total, phase: 'videos' });
        if (url) setCachedVideos(prev => ({ ...prev, [url]: true }));
      }

      await AsyncStorage.setItem('auto_download_done', String(Date.now()));
      setAutoDownloadProgress({ active: false, downloaded: total, total, phase: 'done' });
    } catch (e) {
      setAutoDownloadProgress({ active: false, downloaded: 0, total: 0, phase: 'error' });
    }
    lastAutoDownloadRef.current = false;
  }, []);

  const triggerAutoDownload = useCallback(async (trackList, bookList, videoList) => {
    try {
      const info = await NetInfo.fetch();
      if (info.isConnected && info.isInternetReachable) {
        autoDownloadAllContent(trackList, bookList, videoList);
      }
    } catch (e) {}
  }, [autoDownloadAllContent]);

  // Book cache
  const checkBookCache = useCallback(async (bookUrl) => {
    if (!bookUrl) return false;
    try {
      const cached = await isBookCached(bookUrl);
      setCachedBooks(prev => ({ ...prev, [bookUrl]: cached }));
      return cached;
    } catch { return false; }
  }, []);

  const cacheBook = useCallback(async (bookUrl, onProgress) => {
    if (!bookUrl) return null;
    try {
      setBookDownloads(prev => ({ ...prev, [bookUrl]: { progress: 0, downloading: true } }));
      const localUri = await downloadBook(bookUrl, (pct) => {
        setBookDownloads(prev => ({ ...prev, [bookUrl]: { progress: pct, downloading: true } }));
      });
      if (localUri) {
        setCachedBooks(prev => ({ ...prev, [bookUrl]: true }));
        setBookDownloads(prev => ({ ...prev, [bookUrl]: { progress: 1, downloading: false } }));
        return localUri;
      }
      setBookDownloads(prev => ({ ...prev, [bookUrl]: { progress: 0, downloading: false, error: true } }));
      return null;
    } catch {
      setBookDownloads(prev => ({ ...prev, [bookUrl]: { progress: 0, downloading: false, error: true } }));
      return null;
    }
  }, []);

  const uncacheBook = useCallback(async (bookUrl) => {
    await removeCachedBook(bookUrl);
    setCachedBooks(prev => ({ ...prev, [bookUrl]: false }));
  }, []);

  const getBookLocalUri = useCallback(async (bookUrl) => {
    return await getCachedBookPath(bookUrl);
  }, []);

  const initAllBookCaches = useCallback(async (bookList) => {
    await initBookCache();
    const status = {};
    for (const b of bookList) {
      if (b.fileUrl) {
        const fullUrl = getMediaUrl(b.fileUrl);
        try { status[fullUrl] = await isBookCached(fullUrl); } catch { status[fullUrl] = false; }
      }
    }
    setCachedBooks(status);
  }, []);

  // Offline sync
  const recordLocalChange = useCallback(async (change) => {
    return await addLocalChange(change);
  }, []);

  const refreshSyncStatus = useCallback(async () => {
    const status = await getSyncStatus();
    setSyncStatus(status);
  }, []);

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
  const wasEffectivelySilentRef = useRef(isEffectivelySilent);

  useEffect(() => {
    if (isEffectivelySilent && !wasEffectivelySilentRef.current) {
      stopAllMedia();
    }
    wasEffectivelySilentRef.current = isEffectivelySilent;
  }, [isEffectivelySilent]);

  useEffect(() => {
    if (silentMode) stopAllMedia();
  }, [silentMode]);

  useEffect(() => {
    if (!scheduledSilent) return;
    const checkInterval = setInterval(() => {
      const inSilent = isScheduledSilentActive();
      if (inSilent && !wasEffectivelySilentRef.current) {
        stopAllMedia();
        wasEffectivelySilentRef.current = true;
      } else if (!inSilent && wasEffectivelySilentRef.current && !silentMode) {
        wasEffectivelySilentRef.current = false;
      }
    }, 15000);
    return () => clearInterval(checkInterval);
  }, [scheduledSilent, silentFrom, silentTo, silentMode]);

  useEffect(() => {
    loadPersistedState();
    initVideoCache().catch(() => {});
    initAudioCache().catch(() => {});
    initBookCache().catch(() => {});

    let lastServerVersion = null;

    async function checkServerVersion() {
      try {
        const res = await fetch('https://sobanukirwa-production.up.railway.app/api/version', {
          headers: { Accept: 'application/json' },
          signal: AbortSignal.timeout(10000),
        });
        if (!res.ok) return;
        const data = await res.json();
        const v = String(data.version);
        if (lastServerVersion && lastServerVersion !== v) {
          console.log('Server content updated, refreshing...');
          refreshData();
        }
        lastServerVersion = v;
      } catch {}
    }

    checkServerVersion();
    const versionInterval = setInterval(checkServerVersion, 60000);

    const unsub = NetInfo.addEventListener(state => {
      const offline = !state.isConnected || !state.isInternetReachable;
      setIsOffline(offline);
      if (!offline) {
        setTimeout(() => {
          syncLocalChangesToServer('https://sobanukirwa-production.up.railway.app/api').catch(() => {});
          refreshSyncStatus();
          checkServerVersion();
        }, 2000);
      }
    });

    const stopSync = startAutoSync(60000);
    const stopBidirectional = startBidirectionalSync(120000);

    const unsubSync = onSyncStatusChange((status) => {
      setPendingSyncCount(status.pending || 0);
      setIsSyncing(status.syncing || false);
    });

    const unsubSyncEvent = onSyncEvent((event) => {
      refreshSyncStatus();
    });

    getPendingCount().then(count => setPendingSyncCount(count));
    refreshSyncStatus();

    return () => {
      unsub();
      stopSync();
      stopBidirectional();
      unsubSync();
      unsubSyncEvent();
      clearInterval(versionInterval);
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

  async function clearAllCaches() {
    try {
      await clearCache();
      await clearAllCachedAudio();
      await clearAllCachedVideos();
      await clearAllCachedBooks();
      setCachedAudios({});
      setCachedVideos({});
      setCachedBooks({});
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
      const audioInfo = await getAudioCacheInfo().catch(() => ({ count: 0, size: 0 }));
      const bookInfo = await getBookCacheInfo().catch(() => ({ count: 0, size: 0 }));
      return {
        lastUpdated: cacheTime ? new Date(parseInt(cacheTime)) : null,
        itemCounts: { tracks: tracksCount, categories: categoriesCount, surahs: surahsCount, videos: videosCount, books: booksCount, adhkar: adhkarCount },
        totalItems: tracksCount + categoriesCount + surahsCount + videosCount + booksCount + adhkarCount,
        audioCache: audioInfo,
        bookCache: bookInfo,
      };
    } catch (e) {
      return { lastUpdated: null, itemCounts: { tracks: 0, categories: 0, surahs: 0, videos: 0, books: 0, adhkar: 0 }, totalItems: 0, audioCache: { count: 0, size: 0 }, bookCache: { count: 0, size: 0 } };
    }
  }

  const loadAllData = async () => {
    setLoading(true);
    setError(null);

    const cached = await loadCacheData();
    if (cached.surahs.length > 0 || cached.tracks.length > 0 || cached.books.length > 0) {
      setTracks(cached.tracks);
      setCategories(cached.categories);
      setSurahs(cached.surahs);
      setVideos(cached.videos);
      setBooks(cached.books);
      setAdhkar(cached.adhkar);
      setOfflineReady(true);
    }

    try {
      const [t, c, s, v, b, a] = await Promise.all([
        fetchTracks(), fetchCategories(), fetchSurahs(), fetchVideos(), fetchBooks(), fetchAdhkar()
      ]);
      const combinedOk = t.length > 0 || s.length > 0 || b.length > 0;
      const next = {
        tracks: combinedOk ? t : cached.tracks,
        categories: combinedOk ? c : cached.categories,
        surahs: combinedOk ? s : cached.surahs,
        videos: v != null ? v : cached.videos,
        books: combinedOk ? b : cached.books,
        adhkar: a && a.length > 0 ? a : cached.adhkar,
      };
      setTracks(next.tracks);
      setCategories(next.categories);
      setSurahs(next.surahs);
      setVideos(next.videos);
      setBooks(next.books);
      setAdhkar(next.adhkar);
      await saveCacheData(next);
      initAllVideoCaches(next.videos).catch(() => {});
      initAllAudioCaches(next.tracks).catch(() => {});
      initAllBookCaches(next.books).catch(() => {});
      setOfflineReady(true);
      triggerAutoDownload(next.tracks, next.books, next.videos).catch(() => {});
    } catch (e) {
      if (!cached || (cached.surahs.length === 0 && cached.tracks.length === 0 && cached.books.length === 0)) {
        setError('network');
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
      const cached = await loadCacheData();
      const combinedOk = t.length > 0 || s.length > 0 || b.length > 0;
      const next = {
        tracks: combinedOk ? t : cached.tracks,
        categories: combinedOk ? c : cached.categories,
        surahs: combinedOk ? s : cached.surahs,
        videos: v != null ? v : cached.videos,
        books: combinedOk ? b : cached.books,
        adhkar: a && a.length > 0 ? a : cached.adhkar,
      };
      setTracks(next.tracks);
      setCategories(next.categories);
      setSurahs(next.surahs);
      setVideos(next.videos);
      setBooks(next.books);
      setAdhkar(next.adhkar);
      await saveCacheData(next);
      initAllVideoCaches(next.videos).catch(() => {});
      initAllAudioCaches(next.tracks).catch(() => {});
      initAllBookCaches(next.books).catch(() => {});
      triggerAutoDownload(next.tracks, next.books, next.videos).catch(() => {});
    } catch (e) {
      const cached = await loadCacheData();
      if (cached.surahs.length > 0 || cached.tracks.length > 0 || cached.books.length > 0) {
        setTracks(cached.tracks);
        setCategories(cached.categories);
        setSurahs(cached.surahs);
        setVideos(cached.videos);
        setBooks(cached.books);
        setAdhkar(cached.adhkar);
        initAllVideoCaches(cached.videos).catch(() => {});
        initAllAudioCaches(cached.tracks).catch(() => {});
        initAllBookCaches(cached.books).catch(() => {});
      }
    }
    setRefreshing(false);
  }, []);

  useEffect(() => { loadAllData(); }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        refreshData();
        refreshSyncStatus();
      }
    });
    return () => sub.remove();
  }, [refreshData]);

  const tr = (rw, en, ar) => {
    if (language === 'en') return en;
    if (language === 'ar') return ar;
    return rw;
  };

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
      clearCache, clearAllCaches, getCacheInfo,
      isOffline, offlineReady,
      cachedVideos, videoDownloads, cacheVideo, uncacheVideo, getVideoLocalUri, checkVideoCache,
      cachedAudios, audioDownloads, cacheAudio, uncacheAudio, getAudioLocalUri, checkAudioCache, cacheAllAudios,
      cachedBooks, bookDownloads, cacheBook, uncacheBook, getBookLocalUri, checkBookCache,
      pendingSyncCount, isSyncing, processPendingOps,
      syncStatus, recordLocalChange, refreshSyncStatus,
      formatFileSize,
      autoDownloadProgress, triggerAutoDownload,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
