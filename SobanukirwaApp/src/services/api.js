const PRODUCTION_API = 'https://sobanukirwa-production.up.railway.app/api';
const LOCAL_ANDROID = 'http://10.0.2.2:5000/api';
const LOCAL_IOS = 'http://localhost:5000/api';

import { Platform } from 'react-native';

const BASE = PRODUCTION_API;

export async function fetchTracks(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE}/tracks${query ? '?' + query : ''}`);
    return await res.json();
  } catch { return []; }
}

export async function fetchCategories() {
  try {
    const res = await fetch(`${BASE}/categories`);
    return await res.json();
  } catch { return []; }
}

export async function fetchSurahs() {
  try {
    const res = await fetch(`${BASE}/quran/surahs`);
    return await res.json();
  } catch { return []; }
}

const fallbackVideos = [
  { id: 1, title: "Amateka y'intumwa y'imana Muhamad (S.A.W)", videoUrl: "Videos/1.mp4", thumbnail: "Images/logo2.png" },
  { id: 2, title: "Inyigisho - Part 2", videoUrl: "Videos/2.mp4", thumbnail: "Images/logo2.png" },
  { id: 3, title: "Inyigisho - Part 3", videoUrl: "Videos/3.mp4", thumbnail: "Images/logo2.png" },
  { id: 4, title: "Inyigisho - Part 4", videoUrl: "Videos/4.mp4", thumbnail: "Images/logo2.png" },
  { id: 5, title: "Inyigisho - Part 5", videoUrl: "Videos/5.mp4", thumbnail: "Images/logo2.png" },
  { id: 6, title: "Inyigisho - Part 6", videoUrl: "Videos/6.mp4", thumbnail: "Images/logo2.png" },
  { id: 7, title: "Inyigisho - Part 7", videoUrl: "Videos/7.mp4", thumbnail: "Images/logo2.png" },
  { id: 8, title: "Inyigisho - Part 8", videoUrl: "Videos/8.mp4", thumbnail: "Images/logo2.png" },
  { id: 9, title: "Inyigisho - Part 9", videoUrl: "Videos/9.mp4", thumbnail: "Images/logo2.png" },
  { id: 10, title: "Inyigisho - Part 10", videoUrl: "Videos/10.mp4", thumbnail: "Images/logo2.png" },
  { id: 11, title: "Inyigisho - Part 11", videoUrl: "Videos/11.mp4", thumbnail: "Images/logo2.png" },
  { id: 12, title: "Inyigisho - Part 12", videoUrl: "Videos/12.mp4", thumbnail: "Images/logo2.png" },
  { id: 13, title: "Inyigisho - Part 13", videoUrl: "Videos/13.mp4", thumbnail: "Images/logo2.png" },
  { id: 14, title: "Inyigisho - Part 14", videoUrl: "Videos/14.mp4", thumbnail: "Images/logo2.png" },
  { id: 15, title: "Inyigisho - Part 15", videoUrl: "Videos/15.mp4", thumbnail: "Images/logo2.png" },
  { id: 16, title: "Inyigisho - Part 16", videoUrl: "Videos/16.mp4", thumbnail: "Images/logo2.png" },
  { id: 17, title: "Inyigisho - Part 17", videoUrl: "Videos/17.mp4", thumbnail: "Images/logo2.png" },
  { id: 18, title: "Inyigisho - Part 18", videoUrl: "Videos/18.mp4", thumbnail: "Images/logo2.png" },
  { id: 19, title: "Inyigisho - Part 19", videoUrl: "Videos/19.mp4", thumbnail: "Images/logo2.png" },
  { id: 20, title: "Inyigisho - Part 20", videoUrl: "Videos/20.mp4", thumbnail: "Images/logo2.png" },
];

export async function fetchVideos() {
  try {
    const res = await fetch(`${BASE}/videos`);
    const data = await res.json();
    if (data && data.length > 0) {
      return data.map(v => ({
        id: v.id,
        title: v.title,
        videoUrl: v.video_url || v.videoUrl,
        thumbnail: v.thumbnail_url || v.thumbnail || 'Images/logo2.png',
      }));
    }
    return fallbackVideos;
  } catch { return fallbackVideos; }
}

export async function fetchBooks() {
  try {
    const res = await fetch(`${BASE}/books`);
    const data = await res.json();
    if (data && data.length > 0) {
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
    return fallbackBooks;
  } catch { return fallbackBooks; }
}

const fallbackBooks = [
  { id: 1, title: 'madina-book-1', titleAr: 'صحيح مسلم', titleEn: 'madina-book-1', author: 'Imam Muslim', authorAr: 'الإمام مسلم', authorEn: 'Imam Muslim', description: '', imageUrl: 'Images/see.jpg', fileUrl: 'Document/reba.pdf', fileType: 'pdf', category: 'hadith' },
  { id: 2, title: 'Riyad as-Salihin', titleAr: 'رياض الصالحين', titleEn: 'Riyad as-Salihin', author: 'Imam Nawawi', authorAr: 'الإمام النووي', authorEn: 'Imam Nawawi', description: 'Iki gitabo kirimo hadithi nyinshi zifasha umwemeramana mu buzima bwe bwa buri munsi.', imageUrl: 'Images/ok11.jpg', fileUrl: '', fileType: 'text', category: 'hadith' },
];

export async function fetchPrayerTimes(lat, lng) {
  try {
    const date = new Date();
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    const res = await fetch(
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
    const res = await fetch(`https://api.aladhan.com/v1/gToH?date=${yyyy}-${mm}-${dd}`);
    const data = await res.json();
    if (data.code === 200) return data.data.hijri.date;
  } catch {}
  return '';
}

export async function loginAdmin(username, password) {
  try {
    const res = await fetch(`${BASE}/auth/login`, {
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
  return `${base}/${path}`;
}

async function adminFetch(url, options = {}) {
  try {
    const headers = { Accept: 'application/json', ...options.headers };
    if (options.body && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    const res = await fetch(url, { ...options, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  } catch (e) {
    throw e;
  }
}

export async function fetchArtists() {
  try { const res = await fetch(`${BASE}/artists`); return await res.json(); } catch { return []; }
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
    const res = await fetch(url); return await res.json();
  } catch { return []; }
}
export async function createAdhkar(data) {
  return adminFetch(`${BASE}/adhkar`, { method: 'POST', body: JSON.stringify(data) });
}
export async function updateAdhkar(id, data) {
  return adminFetch(`${BASE}/adhkar/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}
export async function deleteAdhkar(id) {
  return adminFetch(`${BASE}/adhkar/${id}`, { method: 'DELETE' });
}

export async function uploadSurahAudio(surahNumber, formData) {
  return adminFetch(`${BASE}/quran/surahs/${surahNumber}/audio`, { method: 'PUT', body: formData });
}

export async function fetchDashboard() {
  try { const res = await fetch(`${BASE}/stats/dashboard`); return await res.json(); } catch { return null; }
}
export async function fetchHealth() {
  try { const res = await fetch(`${BASE.replace('/api', '')}/api/health`); return await res.json(); } catch { return null; }
}
