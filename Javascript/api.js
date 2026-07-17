const API_BASE = window.location.origin + '/api';
const API_ORIGIN = window.location.origin;

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

async function fetchFromAPI(endpoint, options = {}) {
    try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            headers: { 'Accept': 'application/json', ...options.headers },
            ...options
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (err) {
        console.log(`API unavailable for ${endpoint}, using local data`);
        return null;
    }
}

async function loadDataFromAPI() {
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
    }

    if (apiSurahs && apiSurahs.length > 0) {
        hasAPIData = true;
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
    }

    if (apiAdhkar && apiAdhkar.length > 0) {
        hasAPIData = true;
        adhkarList.length = 0;
        apiAdhkar.forEach(a => {
            adhkarList.push({
                id: a.id,
                arabic: a.arabic_text,
                transliteration: a.transliteration,
                translation: a.translation_en || a.translation_rw,
                count: a.count_target,
                category: a.category || 'general',
                audio_url: a.audio_url || null
            });
        });
    }

    if (apiVideos && apiVideos.length > 0) {
        hasAPIData = true;
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
    }

    if (apiBooks && apiBooks.length > 0) {
        hasAPIData = true;
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
                pdfUrl: b.file_type === 'pdf' ? fileUrl : '',
                content: b.file_type === 'text' ? (b.description || '') : '',
                category: b.category || '',
                type: b.file_type || 'pdf',
                description: b.description || ''
            });
        });
    }

    if (!hasAPIData) {
        console.log('API returned no data, using fallback hardcoded data');
        initFallbackData();
        return;
    }

    if (typeof renderTracks === 'function') renderTracks();
    if (typeof renderCategoryTabs === 'function') renderCategoryTabs();
    if (typeof renderQuran === 'function') renderQuran();
    if (typeof renderVideos === 'function') renderVideos();
    if (typeof renderBooks === 'function') renderBooks();
    if (typeof renderFeaturedAudio === 'function') renderFeaturedAudio();
}
