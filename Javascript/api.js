const API_BASE = window.location.origin + '/api';
const API_ORIGIN = window.location.origin;

const CACHE_PREFIX = 'sob_cache_';
const VERSION_KEY = 'sob_content_version';
const CACHE_DURATION = 30 * 60 * 1000;

function normalizeDuration(dur) {
    if (!dur) return '00:00';
    const s = String(dur).trim();
    const parts = s.split(':').map(Number);
    if (parts.some(isNaN) || parts.length < 1 || parts.length > 3) return '00:00';
    let h = 0, m = 0, sec = 0;
    if (parts.length === 3) { h = parts[0]; m = parts[1]; sec = parts[2]; }
    else if (parts.length === 2) { m = parts[0]; sec = parts[1]; }
    else { sec = parts[0]; }
    return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0');
}

function saveToCache(key, data) {
    try {
        localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ data, time: Date.now() }));
    } catch (e) { console.log('Cache save failed:', e); }
}

function loadFromCache(key, maxAge) {
    try {
        const raw = localStorage.getItem(CACHE_PREFIX + key);
        if (!raw) return null;
        const cached = JSON.parse(raw);
        if (maxAge && (Date.now() - cached.time > maxAge)) return null;
        return cached.data;
    } catch (e) { return null; }
}

async function fetchFromAPI(endpoint, options) {
    try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            headers: { 'Accept': 'application/json' },
            ...options
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (err) {
        console.log(`API unavailable for ${endpoint}`);
        return null;
    }
}

async function fetchServerVersion() {
    try {
        const res = await fetch(`${API_BASE}/version`, { headers: { 'Accept': 'application/json' } });
        if (!res.ok) return null;
        const data = await res.json();
        return data.version;
    } catch { return null; }
}

function applyTracksData(apiTracks) {
    if (!apiTracks || apiTracks.length === 0) return false;
    tracksData.length = 0;
    apiTracks.forEach(t => {
        tracksData.push({
            id: t.id,
            title: t.title,
            titleEn: t.title_en || t.title,
            titleAr: t.title_ar || t.title,
            audioUrl: t.audio_url && (t.audio_url.startsWith('http') ? t.audio_url : `${API_BASE.replace('/api', '')}${t.audio_url}`),
            category: t.category_name || 'General',
            categoryAr: t.category_name_ar || t.category_name || 'General',
            categoryEn: t.category_name_en || t.category_name || 'General',
            artist: t.artist_name || '',
            artistEn: t.artist_name_en || t.artist_name || '',
            artistAr: t.artist_name_ar || t.artist_name || '',
            image: t.image_url || 'Images/logo2.png',
            duration: normalizeDuration(t.duration_str || t.duration)
        });
    });
    return true;
}

function applySurahsData(apiSurahs) {
    if (!apiSurahs || apiSurahs.length === 0) return false;
    surahs.length = 0;
    apiSurahs.forEach(s => {
        surahs.push({
            number: s.surah_number,
            name: s.name,
            nameArabic: s.name_arabic,
            ayahs: s.ayahs_count,
            type: s.revelation_type,
            audioUrl: s.audio_url
        });
    });
    return true;
}

function applyAdhkarData(apiAdhkar) {
    if (!apiAdhkar || apiAdhkar.length === 0) return false;
    adhkarList.length = 0;
    const seen = new Set();
    apiAdhkar.forEach(a => {
        const key = a.arabic_text || a.transliteration;
        if (!seen.has(key)) {
            seen.add(key);
            adhkarList.push({
                id: a.id,
                arabic: a.arabic_text,
                transliteration: a.transliteration,
                translation: a.translation_en || a.translation_rw,
                count: a.count_target,
                category: a.category || 'general',
                audio_url: a.audio_url || null
            });
        }
    });
    return true;
}

function applyVideosData(apiVideos) {
    if (!apiVideos || apiVideos.length === 0) return false;
    videosData.length = 0;
    apiVideos.forEach(v => {
        const rawThumb = v.thumbnail_url || 'Images/logo2.png';
        const thumbUrl = rawThumb.startsWith('http') ? rawThumb : (rawThumb.startsWith('/') ? `${API_ORIGIN}${rawThumb}` : `${API_ORIGIN}/${rawThumb}`);
        const rawVideo = v.video_url || '';
        const vidUrl = rawVideo.startsWith('http') ? rawVideo : (rawVideo.startsWith('/') ? `${API_ORIGIN}${rawVideo}` : `${API_ORIGIN}/${rawVideo}`);
        videosData.push({
            id: v.id,
            title: v.title,
            titleEn: v.title_en || v.title,
            titleAr: v.title_ar || v.title,
            author: v.author || '',
            authorEn: v.author_en || v.author || '',
            authorAr: v.author_ar || v.author || '',
            description: v.description || '',
            videoUrl: vidUrl,
            thumbnail: thumbUrl,
            duration: v.duration_str || ''
        });
    });
    return true;
}

function applyBooksData(apiBooks) {
    if (!apiBooks || apiBooks.length === 0) return false;
    booksData.length = 0;
    apiBooks.forEach(b => {
        const rawImage = b.image_url || 'Images/logo2.png';
        const imageUrl = rawImage.startsWith('http') ? rawImage : (rawImage.startsWith('/') ? `${API_ORIGIN}${rawImage}` : `${API_ORIGIN}/${rawImage}`);
        const rawFile = b.file_url || '';
        const fileUrl = rawFile.startsWith('http') ? rawFile : (rawFile.startsWith('/') ? `${API_ORIGIN}${rawFile}` : `${API_ORIGIN}/${rawFile}`);
        booksData.push({
            id: b.id,
            title: b.title || '',
            titleEn: b.title_en || b.title || '',
            titleAr: b.title_ar || b.title || '',
            author: b.author || '',
            authorEn: b.author_en || b.author || '',
            authorAr: b.author_ar || b.author || '',
            image: imageUrl,
            pdfUrl: (b.file_type === 'pdf' || b.file_type === 'docx') ? fileUrl : '',
            content: b.file_type === 'text' ? (b.description || '') : '',
            category: b.category || '',
            type: b.file_type || 'pdf',
            description: b.description || ''
        });
    });
    return true;
}

function renderAll() {
    if (typeof renderTracks === 'function') renderTracks();
    if (typeof renderCategoryTabs === 'function') renderCategoryTabs();
    if (typeof renderQuran === 'function') renderQuran();
    if (typeof renderVideos === 'function') renderVideos();
    if (typeof renderBooks === 'function') renderBooks();
}

function loadCachedData() {
    const cachedTracks = loadFromCache('tracks', CACHE_DURATION);
    const cachedSurahs = loadFromCache('surahs', CACHE_DURATION);
    const cachedAdhkar = loadFromCache('adhkar', CACHE_DURATION);
    const cachedVideos = loadFromCache('videos', CACHE_DURATION);
    const cachedBooks = loadFromCache('books', CACHE_DURATION);

    let any = false;
    any = applyTracksData(cachedTracks) || any;
    any = applySurahsData(cachedSurahs) || any;
    any = applyAdhkarData(cachedAdhkar) || any;
    any = applyVideosData(cachedVideos) || any;
    any = applyBooksData(cachedBooks) || any;
    return any;
}

async function loadDataFromAPI() {
    const cachedVersion = localStorage.getItem(VERSION_KEY);
    const serverVersion = await fetchServerVersion();
    const versionChanged = serverVersion && cachedVersion && String(serverVersion) !== String(cachedVersion);
    const forceRefresh = versionChanged;

    if (forceRefresh) {
        localStorage.removeItem(CACHE_PREFIX + 'tracks');
        localStorage.removeItem(CACHE_PREFIX + 'surahs');
        localStorage.removeItem(CACHE_PREFIX + 'adhkar');
        localStorage.removeItem(CACHE_PREFIX + 'videos');
        localStorage.removeItem(CACHE_PREFIX + 'books');
        localStorage.removeItem(VERSION_KEY);
    }

    const [apiTracks, apiSurahs, apiAdhkar, apiVideos, apiBooks] = await Promise.all([
        fetchFromAPI('/tracks'),
        fetchFromAPI('/quran/surahs'),
        fetchFromAPI('/adhkar'),
        fetchFromAPI('/videos'),
        fetchFromAPI('/books')
    ]);

    let hasAPIData = false;

    if (apiTracks && apiTracks.length > 0) {
        hasAPIData = true;
        applyTracksData(apiTracks);
        saveToCache('tracks', apiTracks);
    }
    if (apiSurahs && apiSurahs.length > 0) {
        hasAPIData = true;
        applySurahsData(apiSurahs);
        saveToCache('surahs', apiSurahs);
    }
    if (apiAdhkar && apiAdhkar.length > 0) {
        hasAPIData = true;
        applyAdhkarData(apiAdhkar);
        saveToCache('adhkar', apiAdhkar);
    }
    if (apiVideos && apiVideos.length > 0) {
        hasAPIData = true;
        applyVideosData(apiVideos);
        saveToCache('videos', apiVideos);
    }
    if (apiBooks && apiBooks.length > 0) {
        hasAPIData = true;
        applyBooksData(apiBooks);
        saveToCache('books', apiBooks);
    }

    if (hasAPIData && serverVersion) {
        localStorage.setItem(VERSION_KEY, String(serverVersion));
    }

    if (!hasAPIData) {
        const loaded = loadCachedData();
        if (!loaded) {
            console.log('No API data and no cache, using fallback');
            initFallbackData();
        }
        return;
    }

    renderAll();
}

async function checkForUpdates() {
    const serverVersion = await fetchServerVersion();
    const cachedVersion = localStorage.getItem(VERSION_KEY);
    if (serverVersion && cachedVersion && String(serverVersion) !== String(cachedVersion)) {
        console.log('Content updated by admin, refreshing...');
        await loadDataFromAPI();
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
        }
    }
}

setInterval(checkForUpdates, 60000);
