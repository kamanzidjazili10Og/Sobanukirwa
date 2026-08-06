import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMediaUrl } from './api';

const VIDEO_CACHE_DIR = `${FileSystem.cacheDirectory}videos/`;
const CACHE_INDEX_KEY = 'video_cache_index';

let cacheIndex = {};

function resolveUrl(url) {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  return getMediaUrl(url);
}

async function ensureDir() {
  const dirInfo = await FileSystem.getInfoAsync(VIDEO_CACHE_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(VIDEO_CACHE_DIR, { intermediates: true });
  }
}

function getFileName(url) {
  const clean = resolveUrl(url).split('?')[0];
  const parts = clean.split('/');
  return parts[parts.length - 1] || 'video.mp4';
}

function getCachePath(url) {
  return `${VIDEO_CACHE_DIR}${getFileName(url)}`;
}

export async function initVideoCache() {
  try {
    await ensureDir();
    const stored = await AsyncStorage.getItem(CACHE_INDEX_KEY);
    if (stored) cacheIndex = JSON.parse(stored);
    const files = await FileSystem.readDirectoryAsync(VIDEO_CACHE_DIR);
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

export async function isVideoCached(url) {
  if (!url) return false;
  try {
    const info = await FileSystem.getInfoAsync(getCachePath(url));
    return info.exists;
  } catch {
    return false;
  }
}

export async function getCachedVideoPath(url) {
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

export async function downloadVideo(url, onProgress) {
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
      cacheIndex[fullUrl] = { path: result.uri, cachedAt: Date.now() };
      await AsyncStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(cacheIndex));
      return result.uri;
    }
    return null;
  } catch (e) {
    return null;
  }
}

export async function removeCachedVideo(url) {
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

export async function clearAllCachedVideos() {
  try {
    const dirInfo = await FileSystem.getInfoAsync(VIDEO_CACHE_DIR);
    if (dirInfo.exists) {
      await FileSystem.deleteAsync(VIDEO_CACHE_DIR);
    }
    cacheIndex = {};
    await AsyncStorage.removeItem(CACHE_INDEX_KEY);
  } catch (e) {}
}

export async function getCachedVideoCount() {
  return Object.keys(cacheIndex).length;
}

export async function getVideoFileUri(url) {
  const cached = await getCachedVideoPath(url);
  if (cached) return cached;
  return null;
}
