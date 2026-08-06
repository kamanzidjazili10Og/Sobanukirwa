import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMediaUrl } from './api';

const AUDIO_CACHE_DIR = `${FileSystem.cacheDirectory}audio/`;
const CACHE_INDEX_KEY = 'audio_cache_index';

let cacheIndex = {};

function resolveUrl(url) {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  return getMediaUrl(url);
}

async function ensureDir() {
  const dirInfo = await FileSystem.getInfoAsync(AUDIO_CACHE_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(AUDIO_CACHE_DIR, { intermediates: true });
  }
}

function getFileName(url) {
  const clean = resolveUrl(url).split('?')[0];
  const parts = clean.split('/');
  return parts[parts.length - 1] || 'audio.mp3';
}

function getCachePath(url) {
  return `${AUDIO_CACHE_DIR}${getFileName(url)}`;
}

export async function initAudioCache() {
  try {
    await ensureDir();
    const stored = await AsyncStorage.getItem(CACHE_INDEX_KEY);
    if (stored) cacheIndex = JSON.parse(stored);
    const files = await FileSystem.readDirectoryAsync(AUDIO_CACHE_DIR);
    const validKeys = {};
    for (const key of Object.keys(cacheIndex)) {
      if (files.includes(getFileName(key))) {
        validKeys[key] = cacheIndex[key];
      }
    }
    cacheIndex = validKeys;
    await AsyncStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(cacheIndex));
  } catch (e) {
    cacheIndex = {};
  }
}

export async function isAudioCached(url) {
  if (!url) return false;
  try {
    const info = await FileSystem.getInfoAsync(getCachePath(url));
    return info.exists;
  } catch {
    return false;
  }
}

export async function getCachedAudioPath(url) {
  if (!url) return null;
  try {
    const path = getCachePath(url);
    const info = await FileSystem.getInfoAsync(path);
    if (info.exists) return path;
    return null;
  } catch {
    return null;
  }
}

export async function downloadAudio(url, onProgress) {
  if (!url) return null;
  const fullUrl = resolveUrl(url);
  try {
    await ensureDir();
    const path = getCachePath(fullUrl);
    const downloadResult = await FileSystem.createDownloadResumable(
      fullUrl,
      path,
      {},
      (downloadProgress) => {
        if (onProgress && downloadProgress.totalBytesWritten && downloadProgress.totalBytesExpectedToWrite) {
          const pct = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          onProgress(Math.min(pct, 1));
        }
      }
    );
    const result = await downloadResult.downloadAsync();
    if (result && result.uri) {
      cacheIndex[fullUrl] = { path: result.uri, cachedAt: Date.now(), size: result.headers?.['content-length'] || 0 };
      await AsyncStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(cacheIndex));
      return result.uri;
    }
    return null;
  } catch (e) {
    return null;
  }
}

export async function removeCachedAudio(url) {
  if (!url) return;
  const fullUrl = resolveUrl(url);
  try {
    const path = getCachePath(fullUrl);
    const info = await FileSystem.getInfoAsync(path);
    if (info.exists) {
      await FileSystem.deleteAsync(path);
    }
    delete cacheIndex[fullUrl];
    await AsyncStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(cacheIndex));
  } catch (e) {}
}

export async function clearAllCachedAudio() {
  try {
    const dirInfo = await FileSystem.getInfoAsync(AUDIO_CACHE_DIR);
    if (dirInfo.exists) {
      await FileSystem.deleteAsync(AUDIO_CACHE_DIR);
    }
    cacheIndex = {};
    await AsyncStorage.removeItem(CACHE_INDEX_KEY);
  } catch (e) {}
}

export async function getCachedAudioCount() {
  return Object.keys(cacheIndex).length;
}

export async function getAudioCacheSize() {
  try {
    const dirInfo = await FileSystem.getInfoAsync(AUDIO_CACHE_DIR);
    if (dirInfo.exists && dirInfo.size) return dirInfo.size;
    let totalSize = 0;
    const files = await FileSystem.readDirectoryAsync(AUDIO_CACHE_DIR);
    for (const file of files) {
      const fileInfo = await FileSystem.getInfoAsync(`${AUDIO_CACHE_DIR}${file}`);
      if (fileInfo.exists && fileInfo.size) totalSize += fileInfo.size;
    }
    return totalSize;
  } catch (e) {
    return 0;
  }
}

export async function getAudioCacheInfo() {
  try {
    const count = await getCachedAudioCount();
    const size = await getAudioCacheSize();
    const tracks = Object.values(cacheIndex).map(v => ({
      url: v.path,
      cachedAt: v.cachedAt,
    }));
    return { count, size, tracks };
  } catch (e) {
    return { count: 0, size: 0, tracks: [] };
  }
}

export async function getAudioFileUri(url) {
  const cached = await getCachedAudioPath(url);
  if (cached) return cached;
  return null;
}

export async function downloadAllTracks(tracks, onProgress) {
  let downloaded = 0;
  const total = tracks.length;
  for (const track of tracks) {
    if (track.audioUrl || track.audio_url) {
      const url = track.audioUrl || track.audio_url;
      if (!(await isAudioCached(url))) {
        await downloadAudio(url, () => {});
      }
      downloaded++;
      if (onProgress) onProgress(downloaded, total);
    }
  }
  return downloaded;
}
