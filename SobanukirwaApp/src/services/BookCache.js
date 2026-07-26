import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BOOK_CACHE_DIR = `${FileSystem.cacheDirectory}books/`;
const CACHE_INDEX_KEY = 'book_cache_index';

let cacheIndex = {};

async function ensureDir() {
  const dirInfo = await FileSystem.getInfoAsync(BOOK_CACHE_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(BOOK_CACHE_DIR, { intermediates: true });
  }
}

function getFileName(url) {
  const clean = url.split('?')[0];
  const parts = clean.split('/');
  return parts[parts.length - 1] || 'book.pdf';
}

function getCachePath(url) {
  return `${BOOK_CACHE_DIR}${getFileName(url)}`;
}

export async function initBookCache() {
  try {
    await ensureDir();
    const stored = await AsyncStorage.getItem(CACHE_INDEX_KEY);
    if (stored) cacheIndex = JSON.parse(stored);
    const files = await FileSystem.readDirectoryAsync(BOOK_CACHE_DIR);
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

export async function isBookCached(url) {
  if (!url) return false;
  try {
    if (cacheIndex[url]) {
      const info = await FileSystem.getInfoAsync(getCachePath(url));
      return info.exists;
    }
    return false;
  } catch {
    return false;
  }
}

export async function getCachedBookPath(url) {
  if (!url) return null;
  try {
    if (cacheIndex[url]) {
      const path = getCachePath(url);
      const info = await FileSystem.getInfoAsync(path);
      if (info.exists) return path;
    }
    return null;
  } catch {
    return null;
  }
}

export async function downloadBook(url, onProgress) {
  if (!url) return null;
  try {
    await ensureDir();
    const path = getCachePath(url);
    const downloadResult = await FileSystem.createDownloadResumable(
      url,
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
      cacheIndex[url] = { path: result.uri, cachedAt: Date.now(), size: result.headers?.['content-length'] || 0 };
      await AsyncStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(cacheIndex));
      return result.uri;
    }
    return null;
  } catch (e) {
    return null;
  }
}

export async function removeCachedBook(url) {
  if (!url) return;
  try {
    const path = getCachePath(url);
    const info = await FileSystem.getInfoAsync(path);
    if (info.exists) {
      await FileSystem.deleteAsync(path);
    }
    delete cacheIndex[url];
    await AsyncStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(cacheIndex));
  } catch (e) {}
}

export async function clearAllCachedBooks() {
  try {
    const dirInfo = await FileSystem.getInfoAsync(BOOK_CACHE_DIR);
    if (dirInfo.exists) {
      await FileSystem.deleteAsync(BOOK_CACHE_DIR);
    }
    cacheIndex = {};
    await AsyncStorage.removeItem(CACHE_INDEX_KEY);
  } catch (e) {}
}

export async function getCachedBookCount() {
  return Object.keys(cacheIndex).length;
}

export async function getBookCacheSize() {
  try {
    const dirInfo = await FileSystem.getInfoAsync(BOOK_CACHE_DIR);
    if (dirInfo.exists && dirInfo.size) return dirInfo.size;
    let totalSize = 0;
    const files = await FileSystem.readDirectoryAsync(BOOK_CACHE_DIR);
    for (const file of files) {
      const fileInfo = await FileSystem.getInfoAsync(`${BOOK_CACHE_DIR}${file}`);
      if (fileInfo.exists && fileInfo.size) totalSize += fileInfo.size;
    }
    return totalSize;
  } catch (e) {
    return 0;
  }
}

export async function getBookCacheInfo() {
  try {
    const count = await getCachedBookCount();
    const size = await getBookCacheSize();
    const books = Object.entries(cacheIndex).map(([url, v]) => ({
      url,
      cachedAt: v.cachedAt,
    }));
    return { count, size, books };
  } catch (e) {
    return { count: 0, size: 0, books: [] };
  }
}

export async function getBookFileUri(url) {
  const cached = await getCachedBookPath(url);
  if (cached) return cached;
  return null;
}

export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}
