const PRODUCTION_API = 'https://sobanukirwa-production.up.railway.app/api';
const LOCAL_ANDROID = 'http://10.0.2.2:5000/api';
const LOCAL_IOS = 'http://localhost:5000/api';
const LOCAL_WEB = 'http://localhost:5000/api';

import { Platform } from 'react-native';

const BASE = PRODUCTION_API;

export async function fetchTracks(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE}/tracks${query ? '?' + query : ''}`);
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
    const res = await fetch(`${BASE}/categories`);
    return await res.json();
  } catch { return []; }
}

const fallbackSurahs = [
  { id: 1, surah_number: 1, name: 'Al-Fatihah', name_arabic: 'الفاتحة', translation: 'The Opening' },
  { id: 2, surah_number: 2, name: 'Al-Baqarah', name_arabic: 'البقرة', translation: 'The Cow' },
  { id: 3, surah_number: 3, name: 'Ali Imran', name_arabic: 'آل عمران', translation: 'Family of Imran' },
  { id: 4, surah_number: 4, name: 'An-Nisa', name_arabic: 'النساء', translation: 'The Women' },
  { id: 5, surah_number: 5, name: 'Al-Ma\'idah', name_arabic: 'المائدة', translation: 'The Table Spread' },
  { id: 6, surah_number: 6, name: 'Al-An\'am', name_arabic: 'الأنعام', translation: 'The Cattle' },
  { id: 7, surah_number: 7, name: 'Al-A\'raf', name_arabic: 'الأعراف', translation: 'The Heights' },
  { id: 8, surah_number: 8, name: 'Al-Anfal', name_arabic: 'الأنفال', translation: 'The Spoils of War' },
  { id: 9, surah_number: 9, name: 'At-Tawbah', name_arabic: 'التوبة', translation: 'The Repentance' },
  { id: 10, surah_number: 10, name: 'Yunus', name_arabic: 'يونس', translation: 'Jonah' },
  { id: 11, surah_number: 11, name: 'Hud', name_arabic: 'هود', translation: 'Hud' },
  { id: 12, surah_number: 12, name: 'Yusuf', name_arabic: 'يوسف', translation: 'Joseph' },
  { id: 13, surah_number: 13, name: 'Ar-Ra\'d', name_arabic: 'الرعد', translation: 'The Thunder' },
  { id: 14, surah_number: 14, name: 'Ibrahim', name_arabic: 'إبراهيم', translation: 'Abraham' },
  { id: 15, surah_number: 15, name: 'Al-Hijr', name_arabic: 'الحجر', translation: 'The Rocky Tract' },
  { id: 16, surah_number: 16, name: 'An-Nahl', name_arabic: 'النحل', translation: 'The Bee' },
  { id: 17, surah_number: 17, name: 'Al-Isra', name_arabic: 'الإسراء', translation: 'The Night Journey' },
  { id: 18, surah_number: 18, name: 'Al-Kahf', name_arabic: 'الكهف', translation: 'The Cave' },
  { id: 19, surah_number: 19, name: 'Maryam', name_arabic: 'مريم', translation: 'Mary' },
  { id: 20, surah_number: 20, name: 'Taha', name_arabic: 'طه', translation: 'Ta-Ha' },
  { id: 21, surah_number: 21, name: 'Al-Anbiya', name_arabic: 'الأنبياء', translation: 'The Prophets' },
  { id: 22, surah_number: 22, name: 'Al-Hajj', name_arabic: 'الحج', translation: 'The Pilgrimage' },
  { id: 23, surah_number: 23, name: 'Al-Mu\'minun', name_arabic: 'المؤمنون', translation: 'The Believers' },
  { id: 24, surah_number: 24, name: 'An-Nur', name_arabic: 'النور', translation: 'The Light' },
  { id: 25, surah_number: 25, name: 'Al-Furqan', name_arabic: 'الفرقان', translation: 'The Criterion' },
  { id: 26, surah_number: 26, name: 'Ash-Shu\'ara', name_arabic: 'الشعراء', translation: 'The Poets' },
  { id: 27, surah_number: 27, name: 'An-Naml', name_arabic: 'النمل', translation: 'The Ant' },
  { id: 28, surah_number: 28, name: 'Al-Qasas', name_arabic: 'القصص', translation: 'The Stories' },
  { id: 29, surah_number: 29, name: 'Al-Ankabut', name_arabic: 'العنكبوت', translation: 'The Spider' },
  { id: 30, surah_number: 30, name: 'Ar-Rum', name_arabic: 'الروم', translation: 'The Romans' },
  { id: 31, surah_number: 31, name: 'Luqman', name_arabic: 'لقمان', translation: 'Luqman' },
  { id: 32, surah_number: 32, name: 'As-Sajdah', name_arabic: 'السجدة', translation: 'The Prostration' },
  { id: 33, surah_number: 33, name: 'Al-Ahzab', name_arabic: 'الأحزاب', translation: 'The Combined Forces' },
  { id: 34, surah_number: 34, name: 'Saba', name_arabic: 'سبأ', translation: 'Sheba' },
  { id: 35, surah_number: 35, name: 'Fatir', name_arabic: 'فاطر', translation: 'Originator' },
  { id: 36, surah_number: 36, name: 'Ya-Sin', name_arabic: 'يس', translation: 'Ya-Sin' },
  { id: 37, surah_number: 37, name: 'As-Saffat', name_arabic: 'الصافات', translation: 'Those Ranged in Ranks' },
  { id: 38, surah_number: 38, name: 'Sad', name_arabic: 'ص', translation: 'Sad' },
  { id: 39, surah_number: 39, name: 'Az-Zumar', name_arabic: 'الزمر', translation: 'The Troops' },
  { id: 40, surah_number: 40, name: 'Ghafir', name_arabic: 'غافر', translation: 'The Forgiver' },
  { id: 41, surah_number: 41, name: 'Fussilat', name_arabic: 'فصلت', translation: 'Explained in Detail' },
  { id: 42, surah_number: 42, name: 'Ash-Shura', name_arabic: 'الشورى', translation: 'The Consultation' },
  { id: 43, surah_number: 43, name: 'Az-Zukhruf', name_arabic: 'الزخرف', translation: 'The Ornaments of Gold' },
  { id: 44, surah_number: 44, name: 'Ad-Dukhan', name_arabic: 'الدخان', translation: 'The Smoke' },
  { id: 45, surah_number: 45, name: 'Al-Jathiyah', name_arabic: 'الجاثية', translation: 'The Crouching' },
  { id: 46, surah_number: 46, name: 'Al-Ahqaf', name_arabic: 'الأحقاف', translation: 'The Wind-Curved Sandhills' },
  { id: 47, surah_number: 47, name: 'Muhammad', name_arabic: 'محمد', translation: 'Muhammad' },
  { id: 48, surah_number: 48, name: 'Al-Fath', name_arabic: 'الفتح', translation: 'The Victory' },
  { id: 49, surah_number: 49, name: 'Al-Hujurat', name_arabic: 'الحجرات', translation: 'The Rooms' },
  { id: 50, surah_number: 50, name: 'Qaf', name_arabic: 'ق', translation: 'Qaf' },
  { id: 51, surah_number: 51, name: 'Adh-Dhariyat', name_arabic: 'الذاريات', translation: 'The Winnowing Winds' },
  { id: 52, surah_number: 52, name: 'At-Tur', name_arabic: 'الطور', translation: 'The Mount' },
  { id: 53, surah_number: 53, name: 'An-Najm', name_arabic: 'النجم', translation: 'The Star' },
  { id: 54, surah_number: 54, name: 'Al-Qamar', name_arabic: 'القمر', translation: 'The Moon' },
  { id: 55, surah_number: 55, name: 'Ar-Rahman', name_arabic: 'الرحمن', translation: 'The Beneficent' },
  { id: 56, surah_number: 56, name: 'Al-Waqi\'ah', name_arabic: 'الواقعة', translation: 'The Inevitable' },
  { id: 57, surah_number: 57, name: 'Al-Hadid', name_arabic: 'الحديد', translation: 'The Iron' },
  { id: 58, surah_number: 58, name: 'Al-Mujadilah', name_arabic: 'المجادلة', translation: 'The Pleading Woman' },
  { id: 59, surah_number: 59, name: 'Al-Hashr', name_arabic: 'الحشر', translation: 'The Exile' },
  { id: 60, surah_number: 60, name: 'Al-Mumtahanah', name_arabic: 'الممتحنة', translation: 'She That is Examined' },
  { id: 61, surah_number: 61, name: 'As-Saff', name_arabic: 'الصف', translation: 'The Ranks' },
  { id: 62, surah_number: 62, name: 'Al-Jumu\'ah', name_arabic: 'الجمعة', translation: 'Friday' },
  { id: 63, surah_number: 63, name: 'Al-Munafiqun', name_arabic: 'المنافقون', translation: 'The Hypocrites' },
  { id: 64, surah_number: 64, name: 'At-Taghabun', name_arabic: 'التغابن', translation: 'The Mutual Disillusion' },
  { id: 65, surah_number: 65, name: 'At-Talaq', name_arabic: 'الطلاق', translation: 'The Divorce' },
  { id: 66, surah_number: 66, name: 'At-Tahrim', name_arabic: 'التحريم', translation: 'The Prohibition' },
  { id: 67, surah_number: 67, name: 'Al-Mulk', name_arabic: 'الملك', translation: 'The Sovereignty' },
  { id: 68, surah_number: 68, name: 'Al-Qalam', name_arabic: 'القلم', translation: 'The Pen' },
  { id: 69, surah_number: 69, name: 'Al-Haqqah', name_arabic: 'الحاقة', translation: 'The Reality' },
  { id: 70, surah_number: 70, name: 'Al-Ma\'arij', name_arabic: 'المعارج', translation: 'The Ascending Stairways' },
  { id: 71, surah_number: 71, name: 'Nuh', name_arabic: 'نوح', translation: 'Noah' },
  { id: 72, surah_number: 72, name: 'Al-Jinn', name_arabic: 'الجن', translation: 'The Jinn' },
  { id: 73, surah_number: 73, name: 'Al-Muzzammil', name_arabic: 'المزمل', translation: 'The Enshrouded One' },
  { id: 74, surah_number: 74, name: 'Al-Muddaththir', name_arabic: 'المدثر', translation: 'The Cloaked One' },
  { id: 75, surah_number: 75, name: 'Al-Qiyamah', name_arabic: 'القيامة', translation: 'The Resurrection' },
  { id: 76, surah_number: 76, name: 'Al-Insan', name_arabic: 'الإنسان', translation: 'The Man' },
  { id: 77, surah_number: 77, name: 'Al-Mursalat', name_arabic: 'المرسلات', translation: 'The Emissaries' },
  { id: 78, surah_number: 78, name: 'An-Naba', name_arabic: 'النبأ', translation: 'The Tidings' },
  { id: 79, surah_number: 79, name: 'An-Nazi\'at', name_arabic: 'النازعات', translation: 'Those Who Drag Forth' },
  { id: 80, surah_number: 80, name: 'Abasa', name_arabic: 'عبس', translation: 'He Frowned' },
  { id: 81, surah_number: 81, name: 'At-Takwir', name_arabic: 'التكوير', translation: 'The Overthrowing' },
  { id: 82, surah_number: 82, name: 'Al-Infitar', name_arabic: 'الانفطار', translation: 'The Cleaving' },
  { id: 83, surah_number: 83, name: 'Al-Mutaffifin', name_arabic: 'المطففين', translation: 'The Defrauding' },
  { id: 84, surah_number: 84, name: 'Al-Inshiqaq', name_arabic: 'الانشقاق', translation: 'The Sundering' },
  { id: 85, surah_number: 85, name: 'Al-Buruj', name_arabic: 'البروج', translation: 'The Mansions of the Stars' },
  { id: 86, surah_number: 86, name: 'At-Tariq', name_arabic: 'الطارق', translation: 'The Morning Star' },
  { id: 87, surah_number: 87, name: 'Al-A\'la', name_arabic: 'الأعلى', translation: 'The Most High' },
  { id: 88, surah_number: 88, name: 'Al-Ghashiyah', name_arabic: 'الغاشية', translation: 'The Overwhelming' },
  { id: 89, surah_number: 89, name: 'Al-Fajr', name_arabic: 'الفجر', translation: 'The Dawn' },
  { id: 90, surah_number: 90, name: 'Al-Balad', name_arabic: 'البلد', translation: 'The City' },
  { id: 91, surah_number: 91, name: 'Ash-Shams', name_arabic: 'الشمس', translation: 'The Sun' },
  { id: 92, surah_number: 92, name: 'Al-Layl', name_arabic: 'الليل', translation: 'The Night' },
  { id: 93, surah_number: 93, name: 'Ad-Duhaa', name_arabic: 'الضحى', translation: 'The Morning Hours' },
  { id: 94, surah_number: 94, name: 'Ash-Sharh', name_arabic: 'الشرح', translation: 'The Relief' },
  { id: 95, surah_number: 95, name: 'At-Tin', name_arabic: 'التين', translation: 'The Fig' },
  { id: 96, surah_number: 96, name: 'Al-Alaq', name_arabic: 'العلق', translation: 'The Clot' },
  { id: 97, surah_number: 97, name: 'Al-Qadr', name_arabic: 'القدر', translation: 'The Power' },
  { id: 98, surah_number: 98, name: 'Al-Bayyinah', name_arabic: 'البينة', translation: 'The Clear Proof' },
  { id: 99, surah_number: 99, name: 'Az-Zalzalah', name_arabic: 'الزلزلة', translation: 'The Earthquake' },
  { id: 100, surah_number: 100, name: 'Al-Adiyat', name_arabic: 'العاديات', translation: 'The Chargers' },
  { id: 101, surah_number: 101, name: 'Al-Qari\'ah', name_arabic: 'القارعة', translation: 'The Calamity' },
  { id: 102, surah_number: 102, name: 'At-Takathur', name_arabic: 'التكاثر', translation: 'The Rivalry in Worldly Increase' },
  { id: 103, surah_number: 103, name: 'Al-Asr', name_arabic: 'العصر', translation: 'The Declining Day' },
  { id: 104, surah_number: 104, name: 'Al-Humazah', name_arabic: 'الهمزة', translation: 'The Traducer' },
  { id: 105, surah_number: 105, name: 'Al-Fil', name_arabic: 'الفيل', translation: 'The Elephant' },
  { id: 106, surah_number: 106, name: 'Quraysh', name_arabic: 'قريش', translation: 'Quraysh' },
  { id: 107, surah_number: 107, name: 'Al-Ma\'un', name_arabic: 'الماعون', translation: 'The Small Kindnesses' },
  { id: 108, surah_number: 108, name: 'Al-Kawthar', name_arabic: 'الكوثر', translation: 'The Abundance' },
  { id: 109, surah_number: 109, name: 'Al-Kafirun', name_arabic: 'الكافرون', translation: 'The Disbelievers' },
  { id: 110, surah_number: 110, name: 'An-Nasr', name_arabic: 'النصر', translation: 'The Divine Support' },
  { id: 111, surah_number: 111, name: 'Al-Masad', name_arabic: 'المسد', translation: 'The Palm Fiber' },
  { id: 112, surah_number: 112, name: 'Al-Ikhlas', name_arabic: 'الإخلاص', translation: 'The Sincerity' },
  { id: 113, surah_number: 113, name: 'Al-Falaq', name_arabic: 'الفلق', translation: 'The Daybreak' },
  { id: 114, surah_number: 114, name: 'An-Nas', name_arabic: 'الناس', translation: 'Mankind' },
];

export async function fetchSurahs() {
  try {
    const res = await fetch(`${BASE}/quran/surahs`);
    const data = await res.json();
    if (data && data.length > 0) return data;
    return fallbackSurahs;
  } catch { return fallbackSurahs; }
}

const fallbackVideos = [
  { id: 1, title: "Amateka y'intumwa y'imana Muhamad (S.A.W)", videoUrl: "/uploads/videos/sample-1.mp4", thumbnail: "Images/logo2.png", author: 'Sheikh Uqash', durationStr: '45:00', description: 'Amateka y\'Intumwa Muhamad (SAW).' },
  { id: 2, title: "Inyigisho ku Kwihangana", videoUrl: "/uploads/videos/sample-2.mp4", thumbnail: "Images/logo2.png", author: 'Sheikh Mutabaruka', durationStr: '32:00', description: 'Inyigisho zerekerana no kwihangana.' },
  { id: 3, title: "Gusobanukirwa Icyo Kwemera Ari cyo", videoUrl: "/uploads/videos/sample-3.mp4", thumbnail: "Images/logo2.png", author: 'Sheikh Gahutu', durationStr: '28:00', description: 'Ubusobanuro bwa Imani.' },
  { id: 4, title: "Uburyo bwo Gusenga", videoUrl: "/uploads/videos/sample-4.mp4", thumbnail: "Images/logo2.png", author: 'Sheikh Djamidu', durationStr: '38:00', description: 'Inama zerekerana no gusenga.' },
  { id: 5, title: "Urukundo mu Buvandimwe", videoUrl: "/uploads/videos/sample-5.mp4", thumbnail: "Images/logo2.png", author: 'Sheikh Uwamungu', durationStr: '25:00', description: 'Urukundo n\'ubuvandimwe mu Isilamu.' },
  { id: 6, title: "Kubaha Ababyeyi", videoUrl: "/uploads/videos/sample-6.mp4", thumbnail: "Images/logo2.png", author: 'Sheikh Mugabo', durationStr: '30:00', description: 'Ubuheburyo bw\'ubuhizi.' },
  { id: 7, title: "Ingaruka z'Ubuyobe", videoUrl: "/uploads/videos/sample-7.mp4", thumbnail: "Images/logo2.png", author: 'Sheikh Habyarimana', durationStr: '27:00', description: 'Ingaruka z\'ubusambanyi.' },
  { id: 8, title: "Uburenganzira bw'Umugore mu Isilamu", videoUrl: "/uploads/videos/sample-8.mp4", thumbnail: "Images/logo2.png", author: 'Sheikh Uwimana', durationStr: '35:00', description: 'Uburenganzira bwa so.' },
  { id: 9, title: "Akamaro k'Ishuri", videoUrl: "/uploads/videos/sample-9.mp4", thumbnail: "Images/logo2.png", author: 'Sheikh Niyonzima', durationStr: '22:00', description: 'Akamaro k\'ubumenyi.' },
  { id: 10, title: "Kugirana Imyifatire Myiza", videoUrl: "/uploads/videos/sample-10.mp4", thumbnail: "Images/logo2.png", author: 'Sheikh Tuyisenge', durationStr: '29:00', description: 'Imyifatire myiza mu buzima.' },
  { id: 11, title: "Urupfu n'Ubuzima nyuma y'Urupfu", videoUrl: "/uploads/videos/sample-11.mp4", thumbnail: "Images/logo2.png", author: 'Sheikh Munyaneza', durationStr: '40:00', description: 'Ijambo rerekerana urupfu.' },
  { id: 12, title: "Ubumwe n'Urukundo mu Bamisilamu", videoUrl: "/uploads/videos/sample-12.mp4", thumbnail: "Images/logo2.png", author: 'Sheikh Nsabimana', durationStr: '33:00', description: 'Ubumwe n\'urukundo.' },
];

export async function fetchVideos() {
  try {
    const res = await fetch(`${BASE}/videos`);
    const data = await res.json();
    if (data && data.length > 0) {
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
  if (/^audio\//i.test(path)) return `${base}/uploads/${path}`;
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
