const PRODUCTION_API = 'https://sobanukirwa.onrender.com/api';
const LOCAL_ANDROID = 'http://10.0.2.2:5000/api';
const LOCAL_IOS = 'http://localhost:5000/api';
const LOCAL_WEB = 'http://localhost:5000/api';

import { Platform } from 'react-native';

const BASE = PRODUCTION_API;

async function safeFetch(url, options = {}) {
  const timeout = options.timeout || 15000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

export async function fetchTracks(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await safeFetch(`${BASE}/tracks${query ? '?' + query : ''}`);
    const data = await res.json();
    if (Array.isArray(data)) {
      return data.map(t => ({
        ...t,
        duration_str: normalizeDuration(t.duration_str || t.duration),
      }));
    }
    return [];
  } catch { return []; }
}

export async function fetchCategories() {
  try {
    const res = await safeFetch(`${BASE}/categories`);
    return await res.json();
  } catch { return []; }
}

export async function fetchSurahs() {
  try {
    const res = await safeFetch(`${BASE}/quran/surahs`);
    const data = await res.json();
    if (Array.isArray(data)) return data;
    return [];
  } catch { return []; }
}

export async function createSurah(data) {
  return adminFetch(`${BASE}/quran/surahs`, { method: 'POST', body: JSON.stringify(data) });
}

export async function deleteSurah(surahNumber) {
  return adminFetch(`${BASE}/quran/surahs/${surahNumber}`, { method: 'DELETE' });
}

export async function fetchVideos() {
  try {
    const res = await safeFetch(`${BASE}/videos`);
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map(v => ({
      id: v.id,
      title: v.title,
      titleAr: v.title_ar || null,
      titleEn: v.title_en || null,
      videoUrl: v.video_url || v.videoUrl,
      thumbnail: v.thumbnail_url || v.thumbnail || 'Images/logo2.png',
      author: v.author || v.author_en || '',
      authorAr: v.author_ar || null,
      description: v.description || '',
      duration: v.duration || 0,
      durationStr: normalizeDuration(v.duration_str || v.duration),
      viewsCount: v.views_count || 0,
      createdAt: v.created_at || null,
    }));
  } catch { return []; }
}

export async function fetchBooks() {
  try {
    const res = await safeFetch(`${BASE}/books`);
    const data = await res.json();
    if (Array.isArray(data)) {
      return data.map(b => ({
        id: b.id,
        title: b.title,
        titleAr: b.title_ar,
        titleEn: b.title_en,
        author: b.author,
        authorAr: b.author_ar,
        authorEn: b.author_en,
        description: b.description,
        imageUrl: b.image_url,
        fileUrl: b.file_url,
        fileType: b.file_type || 'pdf',
        category: b.category,
        pagesCount: b.pages_count,
        downloadsCount: b.downloads_count,
        isFeatured: b.is_featured,
      }));
    }
    return [];
  } catch { return []; }
}

export async function fetchPrayerTimes(lat, lng) {
  try {
    const date = new Date();
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    const res = await safeFetch(
      `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${lat}&longitude=${lng}&method=3`
    );
    const data = await res.json();
    return data.data;
  } catch { return null; }
}

export async function fetchHijriDate() {
  try {
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const res = await safeFetch(`https://api.aladhan.com/v1/gToH?date=${yyyy}-${mm}-${dd}`);
    const data = await res.json();
    if (data.code === 200) return data.data.hijri.date;
  } catch {}
  return '';
}

export async function loginAdmin(username, password) {
  try {
    const res = await safeFetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return await res.json();
  } catch { return null; }
}

export function getMediaUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const base = BASE.replace('/api', '');
  if (path.startsWith('/')) return `${base}${path}`;
  if (/^audio\//i.test(path)) return `${base}/${path}`;
  if (/^Videos\//i.test(path)) return `${base}/uploads/videos/${path.replace(/^Videos\//i, '')}`;
  if (/^Images\//i.test(path)) return `${base}/${path}`;
  return `${base}/${path}`;
}

export function normalizeDuration(dur) {
  if (!dur) return '00:00';
  const s = String(dur).trim();
  const parts = s.split(':').map(Number);
  if (parts.some(isNaN) || parts.length < 1 || parts.length > 3) return '00:00';
  let h = 0, m = 0, sec = 0;
  if (parts.length === 3) { h = parts[0]; m = parts[1]; sec = parts[2]; }
  else if (parts.length === 2) { m = parts[0]; sec = parts[1]; }
  else { sec = parts[0]; }
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

async function adminFetch(url, options = {}) {
  try {
    const headers = { Accept: 'application/json', ...options.headers };
    const isFormData = options.body instanceof FormData;
    if (options.body && !isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    const timeout = isFormData ? 120000 : 20000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    const res = await fetch(url, { ...options, headers, signal: controller.signal });
    clearTimeout(timer);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  } catch (e) {
    throw e;
  }
}

export async function fetchArtists() {
  try { const res = await safeFetch(`${BASE}/artists`); return await res.json(); } catch { return []; }
}
export async function createArtist(formData) {
  return adminFetch(`${BASE}/artists`, { method: 'POST', body: formData });
}
export async function updateArtist(id, formData) {
  return adminFetch(`${BASE}/artists/${id}`, { method: 'PUT', body: formData });
}
export async function deleteArtist(id) {
  return adminFetch(`${BASE}/artists/${id}`, { method: 'DELETE' });
}

export async function createTrack(formData) {
  return adminFetch(`${BASE}/tracks`, { method: 'POST', body: formData });
}
export async function updateTrack(id, formData) {
  return adminFetch(`${BASE}/tracks/${id}`, { method: 'PUT', body: formData });
}
export async function deleteTrack(id) {
  return adminFetch(`${BASE}/tracks/${id}`, { method: 'DELETE' });
}
export async function incrementPlay(id) {
  return adminFetch(`${BASE}/tracks/${id}/play`, { method: 'POST' });
}

export async function createVideo(formData) {
  return adminFetch(`${BASE}/videos`, { method: 'POST', body: formData });
}
export async function updateVideo(id, formData) {
  return adminFetch(`${BASE}/videos/${id}`, { method: 'PUT', body: formData });
}
export async function deleteVideo(id) {
  return adminFetch(`${BASE}/videos/${id}`, { method: 'DELETE' });
}

export async function createBook(formData) {
  return adminFetch(`${BASE}/books`, { method: 'POST', body: formData });
}
export async function updateBook(id, formData) {
  return adminFetch(`${BASE}/books/${id}`, { method: 'PUT', body: formData });
}
export async function deleteBook(id) {
  return adminFetch(`${BASE}/books/${id}`, { method: 'DELETE' });
}

export async function createCategory(data) {
  return adminFetch(`${BASE}/categories`, { method: 'POST', body: JSON.stringify(data) });
}
export async function updateCategory(id, data) {
  return adminFetch(`${BASE}/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}
export async function deleteCategory(id) {
  return adminFetch(`${BASE}/categories/${id}`, { method: 'DELETE' });
}

export async function fetchAdhkar(category) {
  try {
    const url = category ? `${BASE}/adhkar?category=${category}` : `${BASE}/adhkar`;
    const res = await safeFetch(url); return await res.json();
  } catch { return []; }
}
export async function createAdhkar(data) {
  const isFormData = data instanceof FormData;
  return adminFetch(`${BASE}/adhkar`, { method: 'POST', body: isFormData ? data : JSON.stringify(data) });
}
export async function updateAdhkar(id, data) {
  const isFormData = data instanceof FormData;
  return adminFetch(`${BASE}/adhkar/${id}`, { method: 'PUT', body: isFormData ? data : JSON.stringify(data) });
}
export async function deleteAdhkar(id) {
  return adminFetch(`${BASE}/adhkar/${id}`, { method: 'DELETE' });
}

export async function uploadSurahAudio(surahNumber, formData) {
  return adminFetch(`${BASE}/quran/surahs/${surahNumber}/audio`, { method: 'PUT', body: formData });
}

export async function updateSurah(surahNumber, data) {
  return adminFetch(`${BASE}/quran/surahs/${surahNumber}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function fetchDashboard() {
  try { const res = await safeFetch(`${BASE}/stats/dashboard`); return await res.json(); } catch { return null; }
}
export async function fetchHealth() {
  try { const res = await safeFetch(`${BASE.replace('/api', '')}/api/health`); return await res.json(); } catch { return null; }
}

export async function fetchSettings() {
  try { const res = await safeFetch(`${BASE}/settings`); return await res.json(); } catch { return {}; }
}
export async function updateSetting(key, value) {
  return adminFetch(`${BASE}/settings/${key}`, { method: 'PUT', body: JSON.stringify({ value }) });
}
export async function deleteSetting(key) {
  return adminFetch(`${BASE}/settings/${key}`, { method: 'DELETE' });
}

export async function prepareFileForUpload(file, fallbackName, fallbackType) {
  if (!file || !file.uri) return null;
  if (Platform.OS === 'web') {
    if (file.uri.startsWith('blob:') || file.uri.startsWith('data:')) {
      const resp = await fetch(file.uri);
      const blob = await resp.blob();
      const name = file.name || fallbackName;
      const type = file.type || file.mimeType || fallbackType;
      return new File([blob], name, { type });
    }
    return file;
  }
  return { uri: file.uri, name: file.name || fallbackName, type: file.type || fallbackType };
}
