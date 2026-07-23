// ===== DATA ARRAYS (populated by API or fallback data) =====
const tracksData = [];
const surahs = [];
let currentVerseIndex = -1;
const adhkarList = [];
const videosData = [];
const booksData = [];
const versesOfTheDay = [
    {
        en: { verse: "So remember Me; I will remember you. And be grateful to Me and do not deny Me.", surah: "Qur'an 2:152" },
        rw: { verse: "Munyizirikane, nanjye nzabazirikana. Kandi munshime ntimuhakane.", surah: "Qur'an 2:152" },
        ar: { verse: "فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ", surah: "القرآن ٢:١٥٢" }
    },
    {
        en: { verse: "And He is with you wherever you are.", surah: "Qur'an 57:4" },
        rw: { verse: "Kandi we ari kumwe namwe aho muri hose.", surah: "Qur'an 57:4" },
        ar: { verse: "وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ", surah: "القرآن ٥٧:٤" }
    },
    {
        en: { verse: "Indeed, with hardship [will be] ease.", surah: "Qur'an 94:6" },
        rw: { verse: "Mu by’ukuri, hamwe n’ingorane haba koroha.", surah: "Qur'an 94:6" },
        ar: { verse: "إِنَّ مَعَ الْعُسْرِ يُسْرًا", surah: "القرآن ٩٤:٦" }
    },
    {
        en: { verse: "And seek help through patience and prayer.", surah: "Qur'an 2:45" },
        rw: { verse: "Kandi mwifashishe kwihangana n’iswala.", surah: "Qur'an 2:45" },
        ar: { verse: "وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ", surah: "القرآن ٢:٤٥" }
    },
    {
        en: { verse: "Verily, in the remembrance of Allah do hearts find rest.", surah: "Qur'an 13:28" },
        rw: { verse: "Mu by’ukuri, mu kwibuka Allah niho imitima iturira.", surah: "Qur'an 13:28" },
        ar: { verse: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ", surah: "القرآن ١٣:٢٨" }
    }
];

// ===== TRANSLATIONS =====
const translations = {
    rw: {
        welcomeTitle: "Sobanukirwa Ubu Islam",
        welcomeSubtitle: "Menya ukuri, ubuhanga, n'ubwiza bwa Islam",
        home: "Ahabanza", qibla: "Qibla", qiblaDesc: "Shakisha icyerekezo cya Kaaba",
        prayer: "Isengesho", prayerTimes: "Ibihe by'Isengesho", prayerDesc: "Ibihe nyabyo by'amasengesho",
        quran: "Qur'an", quranDesc: "Soma untege amatwi",
        audioLessons: "Inyigisho za Audio", audioDesc: "Amasomo ya audio",
        videos: "Amashusho", videosDesc: "Reba amashusho yigisha",
        about: "Ibyerekeye", aboutDesc: "Menya byinshi kuri twe",
        back: "Subira Inyuma", settings: "Igenamiterere",
        silentMode: "Ibyumweru byo guceceka", enableSilent: "Koresha uburyo bwo guceceka",
        smartSilent: "Guceceka mu bihe by'amasengesho", from: "Kuva", to: "Kugeza",
        dailyAdhkar: "Adhkar za buri munsi", gloryBeToAllah: "Ibyubahiro ni ibya Allah",
        praiseBeToAllah: "Ishimwe n'ikuzo ni ibya Allah", allahIsGreatest: "Allah ni Umukuru w'ikirenga",
        north: "N", south: "S", east: "E", west: "W", kaaba: "Kaaba",
        calculating: "Turimo kubara...", calibrate: "Gusana compass",
        nextPrayer: "Isengesho rikurikira:", nextPrayerIn: "Isengesho rikurikira:",
        footer: "byose bikubiye muri Qur'an na Sunah z'intumwa y'imana Muhamad(S.A.W).",
        searchSurah: "Shakisha Surati...", searchLesson: "Shakisha inyigisho...",
        aboutText1: "Sobanukirwa ni urubuga rwo kwigisha Islamic mu rurimi rw'Ikinyarwanda. Dufite intego yo gufasha abantu kumenya ukuri, ubuhanga, n'ubwiza bwa Islam.",
        aboutText2: "Twifuza ko uzabona inyigisho zifatika hano. Allah nawe aduhe gukora ibimushimisha.",
        aboutSubtitle: "Urumuri rw'Imyemero", aboutTag: "Ubumenyi bw'Igisilamu",
        bismillahTrans: "Mwimerere w'Imana yose, Nyir'Impuhuzo, Nyir'Impuhuzo",
        features: "Ibikoresho", ourApps: "Porogaramu zacu", followUs: "Duherereye",
        duaText: "Rabana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina 'adhaban-nar.",
        duaTrans: "Yesu wacu, tuhe ikuzwa mu buzima bw'isi no mu buzima bwo hasi y'umuhero.",
        loadingSubtitle: "Menya ukuri, ubuhanga, n'ubwiza bwa Islam",
        silentModeActive: "Ibyumweru byo guceceka birakora",
        reminders: "Icyibutso", enableReminders: "Koresha icyibutso",
        interval: "Igihe hagati y'ibyibutso (iminota)",
        qiblaFinder: "Icyerekezo cya Qibla",
        adhanSettings: "Igenamiterere rya Adhan", enableAdhan: "Koresha Adhan",
        volume: "Umuvuduko w'amajwi", prayerTimeMessage: "Ni igihe cy'isengesho",
        loading: "Ikurura...", playlist: "Urutonde rw'Inyigisho",
        todayPrayerTimes: "Ibihe by'Isengesho",
        allCategories: "Byose",
        books: "Amatabo", searchBook: "Shakisha itabo...", noBooks: "Nta bitabo byabonetse", noVideos: "Nta amashusho yabonetse",
        noTracks: "Nta nyigisho zibonetse", noSurahs: "Nta surahi zibonetse",
        adhkarReminders: "Adhkar zo Kwibutsa",
        scheduledSilent: "Guceceka bitewe n'ibihe"
    },
    en: {
        welcomeTitle: "Understand Islam",
        welcomeSubtitle: "Learn the truth, knowledge, and beauty of Islam",
        home: "Home", qibla: "Qibla", qiblaDesc: "Find direction of Kaaba",
        prayer: "Prayer", prayerTimes: "Prayer Times", prayerDesc: "Accurate prayer times",
        quran: "Qur'an", quranDesc: "Read and listen",
        audioLessons: "Audio Lessons", audioDesc: "Audio lessons",
        videos: "Videos", videosDesc: "Watch educational videos",
        about: "About", aboutDesc: "Learn about us",
        back: "Back", settings: "Settings",
        silentMode: "Silent Mode", enableSilent: "Enable Silent Mode",
        smartSilent: "Smart Silent (Prayer Times)", from: "From", to: "To",
        dailyAdhkar: "Daily Adhkar", gloryBeToAllah: "Glory be to Allah",
        praiseBeToAllah: "Praise be to Allah", allahIsGreatest: "Allah is the Greatest",
        north: "N", south: "S", east: "E", west: "W", kaaba: "Kaaba",
        calculating: "Calculating...", calibrate: "Calibrate Compass",
        nextPrayer: "Next prayer:", nextPrayerIn: "Next prayer in:",
        footer: "All rights reserved",
        searchSurah: "Search Surah...", searchLesson: "Search lesson...",
        aboutText1: "Sobanukirwa is an Islamic learning platform in Kinyarwanda. Our goal is to help people understand the truth, knowledge, and beauty of Islam.",
        aboutText2: "We hope you find beneficial lessons here. May Allah help us do what pleases Him.",
        aboutSubtitle: "Light of Faith", aboutTag: "Islamic Knowledge",
        bismillahTrans: "In the name of Allah, the Most Gracious, the Most Merciful",
        features: "Features", ourApps: "Our Apps", followUs: "Follow Us",
        duaText: "Our Lord, give us in this world good and in the Hereafter good and protect us from the Fire.",
        duaTrans: "Our Lord, give us in this world good and in the Hereafter good and protect us from the Fire.",
        loadingSubtitle: "Learn the truth, knowledge, and beauty of Islam",
        silentModeActive: "Silent Mode Active",
        reminders: "Reminders", enableReminders: "Enable Reminders",
        interval: "Interval (minutes)",
        qiblaFinder: "Qibla Finder",
        adhanSettings: "Adhan Settings", enableAdhan: "Enable Adhan",
        volume: "Volume", prayerTimeMessage: "It's time for prayer",
        loading: "Loading...", playlist: "Playlist",
        todayPrayerTimes: "Today's Prayer Times",
        allCategories: "All",
        books: "Books", searchBook: "Search books...", noBooks: "No books found", noVideos: "No videos found",
        noTracks: "No tracks found", noSurahs: "No surahs found",
        adhkarReminders: "Adhkar Reminders",
        scheduledSilent: "Scheduled Silent"
    },
    ar: {
        welcomeTitle: "افهم الإسلام",
        welcomeSubtitle: "تعلم الحقيقة والمعرفة وجمال الإسلام",
        home: "الرئيسية", qibla: "القبلة", qiblaDesc: "اعثر على اتجاه القبلة",
        prayer: "الصلاة", prayerTimes: "مواقيت الصلاة", prayerDesc: "مواقيت صلاة دقيقة",
        quran: "القرآن", quranDesc: "اقرأ واستمع",
        audioLessons: "الدروس الصوتية", audioDesc: "دروس صوتية",
        videos: "الفيديو", videosDesc: "شاهد فيديوهات تعليمية",
        about: "حول", aboutDesc: "تعرف علينا",
        back: "رجوع", settings: "الإعدادات",
        silentMode: "الوضع الصامت", enableSilent: "تفعيل الوضع الصامت",
        smartSilent: "صامت ذكي (أوقات الصلاة)", from: "من", to: "إلى",
        dailyAdhkar: "الأذكار اليومية", gloryBeToAllah: "سبحان الله",
        praiseBeToAllah: "الحمد لله", allahIsGreatest: "الله أكبر",
        north: "شمال", south: "جنوب", east: "شرق", west: "غرب", kaaba: "الكعبة",
        calculating: "جاري الحساب...", calibrate: "معايرة البوصلة",
        nextPrayer: "الصلاة التالية:", nextPrayerIn: "الصلاة التالية بعد:",
        footer: "جميع الحقوق محفوظة",
        searchSurah: "ابحث عن سورة...", searchLesson: "ابحث عن درس...",
        aboutText1: "منصة سوبانوكيروا هي منصة تعليم إسلامي بلغة كينيارواندا. هدفنا هو مساعدة الناس على فهم الحقيقة والمعرفة وجمال الإسلام.",
        aboutText2: "نأمل أن تجد دروساً مفيدة هنا. وفقنا الله لفعل ما يرضيه.",
        aboutSubtitle: "نور الإيمان", aboutTag: "المعرفة الإسلامية",
        bismillahTrans: "بسم الله الرحمن الرحيم",
        features: "المميزات", ourApps: "تطبيقاتنا", followUs: "تابعنا",
        duaText: "ربنا آتنا في الدنيا حسنة وفي الآخرة حسنة وقنا عذاب النار",
        duaTrans: "ربنا آتنا في الدنيا حسنة وفي الآخرة حسنة وقنا عذاب النار",
        loadingSubtitle: "تعلم الحقيقة والمعرفة وجمال الإسلام",
        silentModeActive: "الوضع الصامت نشط",
        reminders: "التذكيرات", enableReminders: "تفعيل التذكير",
        interval: "الفاصل الزمني (بالدقائق)",
        qiblaFinder: "اتجاه القبلة",
        adhanSettings: "إعدادات الأذان", enableAdhan: "تفعيل الأذان",
        volume: "مستوى الصوت", prayerTimeMessage: "حان وقت الصلاة",
        loading: "جارٍ التحميل...", playlist: "قائمة التشغيل",
        todayPrayerTimes: "أوقات الصلاة اليوم",
        allCategories: "الكل",
        books: "الكتب", searchBook: "ابحث عن كتاب...", noBooks: "لم يتم العثور على كتب", noVideos: "لم يتم العثور على فيديوهات",
        noTracks: "لم يتم العثور على مقاطع", noSurahs: "لم يتم العثور على سور",
        adhkarReminders: "تذكير الأذكار",
        scheduledSilent: "الصامت المجدول"
    }
};

let selectedArtist = null;
let currentTrackIndex = 0;
let isPlaying = false;
let isRandom = false;
let isRepeat = false;
let audio = new Audio();
let currentTracks = [];

class AudioManager {
    constructor() {
        this.audioElements = {
            quran: document.getElementById('quranAudio'),
            lessons: audio,
            adhan: document.getElementById('adhanAudio')
        };
        this.currentSource = null;
    }

    pause() {
        Object.values(this.audioElements).forEach(el => {
            if (el && !el.paused) {
                el.pause();
            }
        });
        isPlaying = false;
        this.updatePlayPauseButton();
    }

    updatePlayPauseButton() {
        const btn = document.getElementById('playPauseBtn');
        if (!btn) return;
        btn.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
    }
}

const audioManager = new AudioManager();

function setupAudioListeners() {
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', () => {
        if (audio.duration && currentTracks[currentTrackIndex]) {
            const duration = formatTime(audio.duration);
            document.getElementById('totalDuration').textContent = duration;
            currentTracks[currentTrackIndex].duration = duration;
        }
    });
    audio.addEventListener('ended', handleTrackEnd);
    audio.addEventListener('play', () => {
        isPlaying = true;
        updatePlayPauseButton();
        document.querySelector('.player-art')?.classList.add('rotate');
    });
    audio.addEventListener('pause', () => {
        isPlaying = false;
        updatePlayPauseButton();
        document.querySelector('.player-art')?.classList.remove('rotate');
    });
    audio.addEventListener('error', (e) => {
        console.log('Audio error:', e);
        if (currentTracks.length > 1) {
            nextTrack();
        }
    });
}

// ===== Convenience Functions (for HTML onclick) =====
function togglePlayPause() {
    if (!audio.src) return;
    if (isPlaying) {
        audio.pause();
    } else {
        audio.play().catch(e => console.error("Play failed", e));
    }
}

function nextTrack() {
    if (!selectedArtist || currentTracks.length === 0) return;
    currentTrackIndex = (currentTrackIndex + 1) % currentTracks.length;
    loadTrack();
    if (isPlaying) audio.play();
}

function previousTrack() {
    if (!selectedArtist || currentTracks.length === 0) return;
    if (audio.currentTime > 3) {
        audio.currentTime = 0;
        return;
    }
    currentTrackIndex = (currentTrackIndex - 1 + currentTracks.length) % currentTracks.length;
    loadTrack();
    if (isPlaying) audio.play();
}

function seekTo(event) {
    if (!audio.duration) return;
    const progressBar = event.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = (x / rect.width);
    audio.currentTime = percentage * audio.duration;
}

function setVolumeFromClick(event) {
    const volumeBar = event.currentTarget;
    const rect = volumeBar.getBoundingClientRect();
    const percentage = (event.clientX - rect.left) / rect.width;
    audio.volume = percentage;
    document.getElementById('volumeFill').style.width = (percentage * 100) + '%';
}

function toggleShuffle() {
    isRandom = !isRandom;
    document.getElementById('shuffleBtn')?.classList.toggle('active', isRandom);
}

function toggleRepeat() {
    isRepeat = !isRepeat;
    document.getElementById('repeatBtn')?.classList.toggle('active', isRepeat);
}

function closePlayer() {
    document.getElementById('audioPlayerSection')?.classList.remove('active');
    audio.pause();
}

function togglePlaylist() {
    const el = document.getElementById('playerPlaylist');
    if (el) el.classList.toggle('open');
}

function playTrack(artistId, trackId) {
    const fallbackAvailable = typeof fallbackTracks !== 'undefined';
    const artist = fallbackAvailable ? fallbackTracks.find(a => a.id === artistId) : null;
    if (!artist) {
        const track = tracksData.find(t => t.id === trackId);
        if (!track) return;
        selectedArtist = { name: track.artist, nameEn: track.artistEn, nameAr: track.artistAr, image: track.image };
        currentTracks = tracksData.filter(t => t.artist === track.artist);
        currentTrackIndex = currentTracks.findIndex(t => t.id === trackId);
    } else {
        selectedArtist = artist;
        currentTracks = artist.tracks;
        currentTrackIndex = artist.tracks.findIndex(t => t.id === trackId);
    }

    if (currentTrackIndex === -1) return;

    const vid = document.getElementById('videoElement');
    if (vid) { vid.pause(); vid.src = ''; }
    document.getElementById('videoPlayer')?.classList.remove('active');
    const quran = document.getElementById('quranAudio');
    if (quran) { quran.pause(); }

    loadTrack();
    audio.play().catch(e => console.error("Play failed", e));

    const section = document.getElementById('audioPlayerSection');
    if (section) section.classList.add('active');
}

// ===== TRACK RENDERING =====
let currentCategory = 'all';
let filteredTracks = [];

function loadTrack() {
    if (!selectedArtist || !currentTracks[currentTrackIndex]) return;

    const track = currentTracks[currentTrackIndex];
    const artistName = getArtistName(selectedArtist);
    const trackTitle = getTrackTitle(track);

    document.getElementById('playerArtImg').src = selectedArtist.image || 'Images/logo2.png';
    document.getElementById('playerTrackTitle').textContent = trackTitle;
    document.getElementById('playerArtistName').textContent = artistName;

    audio.src = track.audioUrl;
    audio.load();

    document.getElementById('currentTime').textContent = '00:00';
    document.getElementById('totalDuration').textContent = track.duration || '00:00';
    document.getElementById('progressFill').style.width = '0%';

    document.title = `${trackTitle} - Sobanukirwa`;
}

function handleTrackEnd() {
    if (isRepeat) {
        audio.currentTime = 0;
        audio.play().catch(function(){});
    } else {
        nextTrack();
    }
}

function updateProgress() {
    if (audio.duration) {
        const progressPercent = (audio.currentTime / audio.duration) * 100;
        document.getElementById('progressFill').style.width = `${progressPercent}%`;
        document.getElementById('currentTime').textContent = formatTime(audio.currentTime);
        const remaining = audio.duration - audio.currentTime;
        document.getElementById('totalDuration').textContent = `-${formatTime(remaining)}`;
    }
}

function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

function updatePlayPauseButton() { audioManager.updatePlayPauseButton(); }

function renderTracks() {
    const container = document.getElementById('tracksContainer');
    if (!container) return;
    const tracksToRender = tracksData.length > 0 ? tracksData : (typeof fallbackTracks !== 'undefined' ? fallbackTracks : []);
    filteredTracks = currentCategory === 'all'
        ? [...tracksToRender]
        : tracksToRender.filter(t => t.category === currentCategory);
    if (filteredTracks.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-music"></i><p data-i18n="noTracks">Nta nyigisho zibonetse</p></div>';
        return;
    }
    container.innerHTML = filteredTracks.map((track, i) => {
        const idx = tracksToRender.indexOf(track);
        const isCurrentlyPlaying = isPlaying && currentTracks === tracksToRender && currentTrackIndex === idx;
        return '<div class="track-card' + (isCurrentlyPlaying ? ' playing' : '') + '" data-index="' + idx + '">' +
            '<div class="track-info">' +
            '<button class="track-play-btn' + (isCurrentlyPlaying ? ' playing' : '') + '" onclick="playTrack(null, ' + track.id + ')" title="Play">' +
            '<i class="fas ' + (isCurrentlyPlaying ? 'fa-pause' : 'fa-play') + '"></i>' +
            '</button>' +
            '<div class="track-details">' +
            '<div class="track-title">' + getTrackTitle(track) + '</div>' +
            '<div class="track-artist-name">' + getArtistName(track) + '</div>' +
            '<div class="track-meta">' +
            '<span><i class="fas fa-tag"></i> ' + getCategoryName(track) + '</span>' +
            '<span><i class="fas fa-clock"></i> ' + (track.duration || '00:00') + '</span>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';
    }).join('');
}

function renderCategoryTabs() {
    const container = document.getElementById('categoryTabs');
    if (!container) return;
    const categories = [...new Set(tracksData.map(t => t.category).filter(Boolean))];
    const lang = document.body.getAttribute('data-language') || 'rw';
    const allLabel = translations[lang] && translations[lang].allCategories ? translations[lang].allCategories : 'All';
    container.innerHTML = '<button class="category-tab active" data-category="all" onclick="filterTracksByCategory(\'all\')">' + allLabel + '</button>' +
        categories.map(cat => {
            const sampleTrack = tracksData.find(t => t.category === cat);
            const displayName = sampleTrack ? getCategoryName(sampleTrack) : cat;
            return '<button class="category-tab" data-category="' + cat + '" onclick="filterTracksByCategory(\'' + cat + '\')">' + displayName + '</button>';
        }).join('');
}

function filterTracksByCategory(category) {
    currentCategory = category;
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.category === category);
    });
    renderTracks();
}

function filterTracks() {
    const query = document.getElementById('trackSearch').value.toLowerCase();
    const container = document.getElementById('tracksContainer');
    if (!container) return;
    const visible = currentCategory === 'all'
        ? tracksData.filter(t => getTrackTitle(t).toLowerCase().includes(query))
        : tracksData.filter(t => t.category === currentCategory && getTrackTitle(t).toLowerCase().includes(query));
    if (visible.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-search"></i><p data-i18n="noTracks">Nta nyigisho zibonetse</p></div>';
        return;
    }
    container.innerHTML = visible.map((track, i) => {
        const idx = tracksData.indexOf(track);
        const isCurrentlyPlaying = isPlaying && currentTracks === tracksData && currentTrackIndex === idx;
        return '<div class="track-card' + (isCurrentlyPlaying ? ' playing' : '') + '" data-index="' + idx + '">' +
            '<div class="track-info">' +
            '<button class="track-play-btn' + (isCurrentlyPlaying ? ' playing' : '') + '" onclick="playTrack(null, ' + track.id + ')" title="Play">' +
            '<i class="fas ' + (isCurrentlyPlaying ? 'fa-pause' : 'fa-play') + '"></i>' +
            '</button>' +
            '<div class="track-details">' +
            '<div class="track-title">' + getTrackTitle(track) + '</div>' +
            '<div class="track-artist-name">' + getArtistName(track) + '</div>' +
            '<div class="track-meta">' +
            '<span><i class="fas fa-tag"></i> ' + getCategoryName(track) + '</span>' +
            '<span><i class="fas fa-clock"></i> ' + (track.duration || '00:00') + '</span>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';
    }).join('');
}

function getTrackTitle(track) {
    const lang = document.body.getAttribute('data-language') || 'rw';
    if (lang === 'ar') return track.titleAr || track.title;
    if (lang === 'en') return track.titleEn || track.title;
    return track.title;
}

function getArtistName(track) { // track can be an artist object or a track object
    const lang = document.body.getAttribute('data-language') || 'rw';
    const name = track.artist || track.name;
    const nameEn = track.artistEn || track.nameEn;
    const nameAr = track.artistAr || track.nameAr;
    if (lang === 'ar') return nameAr || name;
    if (lang === 'en') return nameEn || name;
    return name;
}

function getCategoryName(track) {
    const lang = document.body.getAttribute('data-language') || 'rw';
    if (lang === 'ar') return track.categoryAr || track.category || 'General';
    if (lang === 'en') return track.categoryEn || track.category || 'General';
    return track.category || 'General';
}

// ===== VIDEOS =====
function renderVideos() {
	const container = document.getElementById('videosContainer');
	if (!container) return;

	// Use API data if available, otherwise use fallback data
	const videosToRender = videosData.length > 0 ? videosData : (typeof fallbackVideos !== 'undefined' ? fallbackVideos : []);

	if (videosToRender.length === 0) {
		container.innerHTML = '<div class="empty-state"><i class="fas fa-video"></i><p data-i18n="noVideos">No videos found</p></div>';
		return;
	}

	container.innerHTML = videosToRender.map((video, index) => {
		// Ensure each video has a unique ID for the onclick event
		const videoId = video.id || index;
		const title = getTrackTitle(video); // Reuse translation logic

		return `
            <div class="video-card" onclick="playVideo(${videoId})">
                <div class="video-thumb">
                    <img src="${video.thumbnail || 'Images/logo2.png'}" alt="${title}" loading="lazy">
                    <div class="video-play-overlay"><i class="fas fa-play"></i></div>
                </div>
                <div class="video-info">
                    <h4 class="video-title">${title}</h4>
                </div>
            </div>
        `;
	}).join('');
}

// ===== BOOKS =====
function renderBooks() {
    const container = document.getElementById('booksContainer');
    if (!container) return;
    const booksToRender = booksData.length > 0 ? booksData : (typeof fallbackBooks !== 'undefined' ? fallbackBooks : []);
    if (booksToRender.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-book"></i><p data-i18n="noBooks">No books found</p></div>';
        return;
    }
    const lang = document.body.getAttribute('data-language') || 'rw';
    container.innerHTML = booksToRender.map(function(book) {
        const title = lang === 'ar' ? (book.titleAr || book.title) : lang === 'en' ? (book.titleEn || book.title) : book.title;
        const author = lang === 'ar' ? (book.authorAr || book.author) : lang === 'en' ? (book.authorEn || book.author) : book.author;
        const cover = book.image || 'Images/logo2.png';
        const actionBtn = book.pdfUrl ? '<a href="' + book.pdfUrl + '" target="_blank" class="btn-download" onclick="event.stopPropagation()"><i class="fas fa-download"></i></a>' : '';
        return '<div class="book-card">' +
            '<div class="book-cover"><img src="' + cover + '" alt="' + title + '" loading="lazy" onerror="this.src=\'Images/logo2.png\'">' +
            (book.type === 'pdf' ? '<div class="book-badge"><i class="fas fa-file-pdf"></i> PDF</div>' : '') +
            '</div>' +
            '<div class="book-info">' +
            '<h4 class="book-title">' + title + '</h4>' +
            (author ? '<p class="book-author"><i class="fas fa-user"></i> ' + author + '</p>' : '') +
            (book.description ? '<p class="book-desc">' + book.description.substring(0, 100) + (book.description.length > 100 ? '...' : '') + '</p>' : '') +
            '<div class="book-actions">' + actionBtn + '</div>' +
            '</div></div>';
    }).join('');
}

function filterBooks() {
    const query = (document.getElementById('booksSearch')?.value || '').toLowerCase();
    const cards = document.querySelectorAll('#booksContainer .book-card');
    cards.forEach(function(card) {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(query) ? '' : 'none';
    });
}

function playVideo(id) {
	// Combine API and fallback data to ensure the video can be found
	const allVideos = videosData.length > 0 ? videosData : (typeof fallbackVideos !== 'undefined' ? fallbackVideos : []);
	const video = allVideos.find(v => v.id == id);

	if (!video) {
		console.error('Video not found with id:', id);
		return;
	}

	// Stop any other media playing
	audioManager.pause();
	document.getElementById('audioPlayerSection')?.classList.remove('active');
	document.getElementById('quranAudio')?.pause();

	// Show the video player
	const videoPlayerSection = document.getElementById('videoPlayer');
	const videoElement = document.getElementById('videoElement');
	const videoTitle = document.getElementById('videoTitle');

	if (videoPlayerSection && videoElement && videoTitle) {
		videoTitle.textContent = getTrackTitle(video);
		videoElement.src = video.videoUrl;
		videoElement.load();
		videoElement.play().catch(e => console.error("Video play failed:", e));

		// Switch to the video player view
		switchSection('videoPlayer');
	}
}

function closeVideoPlayer() {
    const el = document.getElementById('videoElement');
    if (el) { el.pause(); el.src = ''; }
    document.getElementById('videoPlayer')?.classList.remove('active');
    switchSection('videos');
}

// ===== SILENT MODE MANAGER =====
class SilentModeManager {
    constructor() {
        this.isActive = localStorage.getItem('silentMode') === 'true';
        this.isSmart = localStorage.getItem('smartSilent') === 'true';
        this.scheduledStart = localStorage.getItem('silentStart') || '22:00';
        this.scheduledEnd = localStorage.getItem('silentEnd') || '06:00';
        this.isScheduled = localStorage.getItem('scheduledSilent') === 'true';
        this.interval = null;
    }

    restoreUI() {
        document.getElementById('silentToggle')?.classList.toggle('active', this.isActive);
        document.getElementById('silentIndicator')?.classList.toggle('active', this.isActive);
        document.body.classList.toggle('silent-mode', this.isActive);
        document.getElementById('smartSilentToggle')?.classList.toggle('active', this.isSmart);
        document.getElementById('scheduledSilentToggle')?.classList.toggle('active', this.isScheduled);
        document.getElementById('silentStart').value = this.scheduledStart;
        document.getElementById('silentEnd').value = this.scheduledEnd;
        if (this.isActive) {
            var ra = document.getElementById('reminderAudio');
            if (ra && !ra.paused) { ra.pause(); }
        }
        if (this.isScheduled) this.startScheduledCheck();
        if (this.isSmart) this.checkSmartSilent();
    }

    toggle() {
        this.isActive = !this.isActive;
        document.body.classList.toggle('silent-mode', this.isActive);
        document.getElementById('silentToggle')?.classList.toggle('active', this.isActive);
        document.getElementById('silentIndicator')?.classList.toggle('active', this.isActive);
        localStorage.setItem('silentMode', this.isActive ? 'true' : 'false');
        if (this.isActive) {
            var ra = document.getElementById('reminderAudio');
            if (ra && !ra.paused) { ra.pause(); }
            if (typeof showToast === 'function') showToast(document.body.getAttribute('data-language') === 'rw' ? 'Ibyumweru byo guceceka byakozwe' : 'Silent mode activated', 'info');
        }
    }

    toggleSmart() {
        this.isSmart = !this.isSmart;
        document.getElementById('smartSilentToggle')?.classList.toggle('active', this.isSmart);
        localStorage.setItem('smartSilent', this.isSmart ? 'true' : 'false');
        if (this.isSmart) this.checkSmartSilent();
    }

    checkSmartSilent() {
        if (!this.isSmart) return;
        const now = new Date();
        const prayerTimes = document.querySelectorAll('.prayer-card');
        let isPrayerTime = false;
        prayerTimes.forEach(card => {
            if (card.classList.contains('adhan-playing')) isPrayerTime = true;
        });
        if (isPrayerTime && !this.isActive) {
            this.toggle();
        } else if (!isPrayerTime && this.isActive) {
            this.toggle();
        }
    }

    toggleScheduled() {
        this.isScheduled = !this.isScheduled;
        document.getElementById('scheduledSilentToggle')?.classList.toggle('active', this.isScheduled);
        localStorage.setItem('scheduledSilent', this.isScheduled ? 'true' : 'false');
        if (this.isScheduled) this.startScheduledCheck();
        else if (this.interval) clearInterval(this.interval);
    }

    startScheduledCheck() {
        if (this.interval) clearInterval(this.interval);
        this.interval = setInterval(() => this.checkScheduled(), 10000);
        this.checkScheduled();
    }

    checkScheduled() {
        if (!this.isScheduled) return;
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const startParts = this.scheduledStart.split(':').map(Number);
        const endParts = this.scheduledEnd.split(':').map(Number);
        const startMinutes = startParts[0] * 60 + startParts[1];
        const endMinutes = endParts[0] * 60 + endParts[1];
        let shouldBeActive;
        if (startMinutes <= endMinutes) {
            shouldBeActive = currentMinutes >= startMinutes && currentMinutes < endMinutes;
        } else {
            shouldBeActive = currentMinutes >= startMinutes || currentMinutes < endMinutes;
        }
        if (shouldBeActive && !this.isActive) this.toggle();
        else if (!shouldBeActive && this.isActive) this.toggle();
    }

    updateTimes(start, end) {
        this.scheduledStart = start;
        this.scheduledEnd = end;
        localStorage.setItem('silentStart', start);
        localStorage.setItem('silentEnd', end);
    }
}

const silentMode = new SilentModeManager();
function toggleSilentMode() { silentMode.toggle(); }
function toggleSmartSilent() { silentMode.toggleSmart(); }
function checkSmartSilent() { silentMode.checkSmartSilent(); }
function toggleScheduledSilent() { silentMode.toggleScheduled(); }
function updateSilentTimes() {
    const start = document.getElementById('silentStart')?.value || '22:00';
    const end = document.getElementById('silentEnd')?.value || '06:00';
    silentMode.updateTimes(start, end);
}

// ===== PRAYER TIMES MANAGER =====
class PrayerTimesManager {
    constructor() {
        this.prayerTimes = null;
        this.location = { lat: -1.9403, lng: 29.8739, name: 'Kigali, Rwanda' };
        this.prayerNames = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
        this.prayerNamesRw = ['Fajr', 'Umuseke', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
        this.prayerNamesAr = ['الفجر', 'الشروق', 'الظهر', 'العصر', 'المغرب', 'العشاء'];
    }

    async fetchTimes() {
        const today = new Date().toDateString();
        const cacheKey = 'prayerTimes_' + this.location.lat + '_' + this.location.lng;

        const cachedTimes = localStorage.getItem(cacheKey);
        const cachedDate = localStorage.getItem('prayerTimesDate');
        if (cachedTimes && cachedDate === today) {
            const parsed = JSON.parse(cachedTimes);
            if (this.isValidPrayerTimes(parsed)) {
                this.prayerTimes = parsed;
                const sourceEl = document.getElementById('prayerSource');
                if (sourceEl) sourceEl.textContent = 'Source: Cached';
                return true;
            }
            localStorage.removeItem(cacheKey);
            localStorage.removeItem('prayerTimesDate');
        }

        const offlineSuccess = this.calculateOffline();
        if (offlineSuccess) {
            this.displayTimes();
            updatePrayerSummary();
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        try {
            const date = new Date();
            const dd = String(date.getDate()).padStart(2, '0');
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const yyyy = date.getFullYear();
            const res = await fetch(`https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${this.location.lat}&longitude=${this.location.lng}&method=2`, { signal: controller.signal });
            clearTimeout(timeoutId);
            const data = await res.json();
            if (data.code === 200) {
                const timings = data.data.timings;
                const sanitized = this.sanitizePrayerTimes(timings);
                if (sanitized) {
                    this.prayerTimes = sanitized;
                    const sourceEl = document.getElementById('prayerSource');
                    if (sourceEl) sourceEl.textContent = 'Source: Aladhan API';
                    localStorage.setItem(cacheKey, JSON.stringify(this.prayerTimes));
                    localStorage.setItem('prayerTimesDate', today);
                    return true;
                }
            }
        } catch (e) {
            console.log('Prayer times API unavailable');
        }

        return offlineSuccess;
    }

    isValidPrayerTimes(times) {
        if (!times || typeof times !== 'object') return false;
        const required = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
        return required.every(name => {
            const t = times[name];
            return t && typeof t === 'string' && /^\d{1,2}:\d{2}$/.test(t);
        });
    }

    sanitizePrayerTimes(timings) {
        const result = {};
        const names = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
        for (const name of names) {
            let t = timings[name];
            if (!t) continue;
            t = String(t).trim();
            const match = t.match(/^(\d{1,2}):(\d{2})/);
            if (match) {
                result[name] = match[1].padStart(2, '0') + ':' + match[2];
            }
        }
        return this.isValidPrayerTimes(result) ? result : null;
    }

    calculateOffline() {
        const d = new Date();
        const lat = this.location.lat, lng = this.location.lng;
        const day = d.getDate(), month = d.getMonth() + 1, year = d.getFullYear();
        const times = this.calculatePrayerTimes(lat, lng, year, month, day);
        if (times) {
            this.prayerTimes = times;
            const sourceEl = document.getElementById('prayerSource');
            if (sourceEl) sourceEl.textContent = 'Source: Offline Calculation';
            return true;
        }
        return false;
    }

    calculatePrayerTimes(lat, lng, year, month, day) {
        const jd = this.julianDay(year, month, day) - lng / 360;
        const fajrAngle = 18, ishaAngle = 17;
        const times = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
        const result = {};
        const sunPosition = this.sunPosition(jd);
        const declination = sunPosition.declination;
        const equation = sunPosition.equation;
        const dhuhr = 12 + (lng * 4 - equation * 4) / 60;
        const midday = 12 - (lng * 4) / 360;
        result.Dhuhr = this.formatDecimalTime(dhuhr);
        const sunriseAngle = -0.833;
        const sunriseHour = dhuhr - this.hourAngle(lat, declination, sunriseAngle) / 15;
        result.Sunrise = this.formatDecimalTime(sunriseHour);
        const fajrHour = dhuhr - this.hourAngle(lat, declination, fajrAngle) / 15;
        result.Fajr = this.formatDecimalTime(fajrHour);
        const asrFactor = 1;
        const asrHour = dhuhr + this.asrHourAngle(lat, declination, asrFactor) / 15;
        result.Asr = this.formatDecimalTime(asrHour);
        const maghribHour = dhuhr + this.hourAngle(lat, declination, sunriseAngle) / 15;
        result.Maghrib = this.formatDecimalTime(maghribHour);
        const ishaHour = dhuhr + this.hourAngle(lat, declination, ishaAngle) / 15;
        result.Isha = this.formatDecimalTime(ishaHour);
        return result;
    }

    julianDay(year, month, day) {
        if (month <= 2) { year -= 1; month += 12; }
        const A = Math.floor(year / 100);
        const B = 2 - A + Math.floor(A / 4);
        return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
    }

    sunPosition(jd) {
        const T = (jd - 2451545) / 36525;
        const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
        const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(this.rad(M)) + (0.019993 - 0.000101 * T) * Math.sin(this.rad(2 * M));
        const lambda = 280.46646 + 36000.76983 * T + 0.0003032 * T * T + C;
        const epsilon = 23.439291 - 0.0130042 * T;
        const alpha = this.deg(Math.atan2(Math.cos(this.rad(epsilon)) * Math.sin(this.rad(lambda)), Math.cos(this.rad(lambda))));
        const declination = this.deg(Math.asin(Math.sin(this.rad(epsilon)) * Math.sin(this.rad(lambda))));
        const equation = (M + C) - alpha;
        return { declination, equation };
    }

    hourAngle(lat, decl, angle) {
        const latRad = this.rad(lat), declRad = this.rad(decl), angleRad = this.rad(angle);
        const cosHA = (Math.sin(angleRad) - Math.sin(latRad) * Math.sin(declRad)) / (Math.cos(latRad) * Math.cos(declRad));
        if (cosHA > 1 || cosHA < -1) return 0;
        return this.deg(Math.acos(cosHA));
    }

    asrHourAngle(lat, decl, factor) {
        const latRad = this.rad(lat), declRad = this.rad(decl);
        const tanArc = Math.atan(1 / (factor + Math.tan(Math.abs(latRad - declRad))));
        const cosHA = (Math.sin(tanArc) - Math.sin(latRad) * Math.sin(declRad)) / (Math.cos(latRad) * Math.cos(declRad));
        if (cosHA > 1 || cosHA < -1) return 0;
        return this.deg(Math.acos(cosHA));
    }

    rad(d) { return d * Math.PI / 180; }
    deg(r) { return r * 180 / Math.PI; }

    formatDecimalTime(hours) {
        const h = Math.floor(hours);
        const m = Math.floor((hours - h) * 60);
        return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
    }

    getNextPrayer() {
        if (!this.prayerTimes) return null;
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const orderedPrayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
        for (const name of orderedPrayers) {
            const t = this.prayerTimes[name];
            if (!t || !/^\d{1,2}:\d{2}$/.test(t)) continue;
            const parts = t.split(':');
            const prayerMinutes = parseInt(parts[0]) * 60 + parseInt(parts[1]);
            if (prayerMinutes > currentMinutes) {
                return { name, time: t, minutesUntil: prayerMinutes - currentMinutes };
            }
        }
        const fajr = this.prayerTimes.Fajr;
        if (!fajr || !/^\d{1,2}:\d{2}$/.test(fajr)) return null;
        const fajrParts = fajr.split(':');
        const fajrMinutes = parseInt(fajrParts[0]) * 60 + parseInt(fajrParts[1]);
        return { name: 'Fajr', time: fajr, minutesUntil: (24 * 60 - currentMinutes) + fajrMinutes };
    }

    displayTimes() {
        if (!this.prayerTimes) return;
        const grid = document.getElementById('prayerTimes');
        if (!grid) return;
        const lang = document.body.getAttribute('data-language') || 'rw';
        const names = lang === 'ar' ? this.prayerNamesAr : lang === 'rw' ? this.prayerNamesRw : this.prayerNames;
        const nextPrayer = this.getNextPrayer();
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        grid.innerHTML = this.prayerNames.map((name, i) => {
            const time = this.prayerTimes[name];
            if (!time || !/^\d{1,2}:\d{2}$/.test(time)) return '';
            const parts = time.split(':');
            const prayerMinutes = parseInt(parts[0]) * 60 + parseInt(parts[1]);
            const isNext = nextPrayer && nextPrayer.name === name;
            const isCurrent = Math.abs(currentMinutes - prayerMinutes) < 30 && currentMinutes >= prayerMinutes;
            return '<div class="prayer-card' + (isNext ? ' next-prayer' : '') + (isCurrent ? ' current-prayer' : '') + '" id="prayer-' + name + '">' +
                '<div class="prayer-name">' + names[i] + '</div>' +
                '<div class="prayer-time">' + time + '</div>' +
                (isNext ? '<div class="prayer-badge">Next</div>' : '') +
                '</div>';
        }).join('');

        this.updateNextPrayer(nextPrayer);
        this.updateDate();
    }

    updateDate() {
        const greg = document.getElementById('gregorianDate');
        const hijri = document.getElementById('hijriDate');
        if (greg) greg.textContent = new Date().toLocaleDateString();
        this.getHijriDate().then(h => { if (hijri) hijri.textContent = h; });
    }

    async getHijriDate() {
        try {
            const res = await fetch('https://api.aladhan.com/v1/gToH?date=' + new Date().toISOString().split('T')[0]);
            const data = await res.json();
            if (data.code === 200) return data.data.hijri.date;
        } catch (e) {}
        return '';
    }

    updateNextPrayer(next) {
        const text = document.getElementById('nextPrayerText');
        if (text && next) {
            text.textContent = next.name + ' - ' + next.time;
        }
    }
}

const prayerManager = new PrayerTimesManager();

// ===== SECTION SWITCHING =====
function switchSection(sectionId) {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen && !loadingScreen.classList.contains('hidden')) return;

    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(sectionId);
    if (target) target.classList.add('active');

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.section === sectionId);
    });

    if (sectionId === 'home') {
        updatePrayerSummary();
    }
    if (sectionId === 'prayer') {
        updatePrayerTimes();
    }
    if (sectionId === 'qibla') {
        setTimeout(() => initQibla(), 100);
    }
    if (sectionId === 'audio') {
        if (typeof renderTracks === 'function') renderTracks();
        if (typeof renderCategoryTabs === 'function') renderCategoryTabs();
    }
    if (sectionId === 'videos') {
        if (typeof renderVideos === 'function') renderVideos();
    }
    if (sectionId === 'books') {
        if (typeof renderBooks === 'function') renderBooks();
    }
    if (sectionId === 'quran') {
        if (typeof renderQuran === 'function') renderQuran();
    }
    if (sectionId === 'adhkar') {
        if (typeof renderAdhkarCards === 'function') renderAdhkarCards();
    }
}

// ===== QIBLA =====
let compassActive = false;
let qiblaState = { qiblaAngle: 0, heading: 0, wasAligned: false, lastPlayTime: 0 };

function initQibla() {
    buildCompassTicks();
    calculateAndDisplayQibla();
    startCompass();
}

function buildCompassTicks() {
    const face = document.getElementById('qiblaCompassFace');
    if (!face || face.querySelector('.qibla-tick')) return;
    const CARDINALS = { 0: 'N', 90: 'E', 180: 'S', 270: 'W' };
    const INTER = { 45: 'NE', 135: 'SE', 225: 'SW', 315: 'NW' };
    for (let i = 0; i < 72; i++) {
        const deg = (i / 72) * 360;
        const rounded = Math.round(deg);
        const isCard = CARDINALS[rounded] !== undefined;
        const isInter = INTER[rounded] !== undefined;
        const isMajor = rounded % 30 === 0;
        const tickH = isCard ? 16 : isMajor ? 12 : 6;
        const tick = document.createElement('div');
        tick.className = 'qibla-tick' + (isCard ? ' cardinal' : isMajor ? ' major' : '');
        tick.style.transform = 'rotate(' + deg + 'deg)';
        const line = document.createElement('div');
        line.className = 'qibla-tick-line';
        line.style.height = tickH + 'px';
        tick.appendChild(line);
        face.appendChild(tick);
    }
    var labels = [
        { deg: 0, label: 'N', cls: 'cardinal-label dir-n' },
        { deg: 45, label: 'NE', cls: 'intercardinal-label' },
        { deg: 90, label: 'E', cls: 'cardinal-label' },
        { deg: 135, label: 'SE', cls: 'intercardinal-label' },
        { deg: 180, label: 'S', cls: 'cardinal-label' },
        { deg: 225, label: 'SW', cls: 'intercardinal-label' },
        { deg: 270, label: 'W', cls: 'cardinal-label' },
        { deg: 315, label: 'NW', cls: 'intercardinal-label' }
    ];
    var radius = 95;
    labels.forEach(function(d) {
        var rad = (d.deg - 90) * Math.PI / 180;
        var el = document.createElement('div');
        el.className = 'qibla-dir-label ' + d.cls;
        el.textContent = d.label;
        var x = 130 + Math.cos(rad) * radius;
        var y = 130 + Math.sin(rad) * radius;
        el.style.left = (x - 15) + 'px';
        el.style.top = (y - 10) + 'px';
        el.style.width = '30px';
        el.style.textAlign = 'center';
        face.appendChild(el);
    });
    var ring = document.createElement('div');
    ring.className = 'qibla-compass-inner-ring';
    face.appendChild(ring);
    var center = document.createElement('div');
    center.className = 'qibla-compass-center';
    center.innerHTML = '<div class="qibla-compass-center-dot"></div>';
    face.appendChild(center);
}

function calculateAndDisplayQibla() {
    var result = calculateQibla(prayerManager.location.lat, prayerManager.location.lng);
    qiblaState.qiblaAngle = result.degrees;
    var bearingEl = document.getElementById('qiblaBearingValue');
    var bearingCard = document.getElementById('qiblaBearingCard');
    var distEl = document.getElementById('distanceInfo');
    if (bearingEl) bearingEl.textContent = result.degrees.toFixed(1) + '° ' + result.direction;
    if (bearingCard) bearingCard.textContent = result.degrees.toFixed(0) + '°';
    if (distEl) distEl.textContent = Math.round(result.distance).toLocaleString() + ' km';
    positionKaabaMarker(result.degrees);
}

function positionKaabaMarker(angle) {
    var marker = document.getElementById('qiblaKaabaMarker');
    if (!marker) return;
    var radius = 110;
    var rad = (angle - 90) * Math.PI / 180;
    var x = 130 + Math.cos(rad) * radius;
    var y = 130 + Math.sin(rad) * radius;
    marker.style.left = x + 'px';
    marker.style.top = y + 'px';
}

function calculateQibla(lat, lng) {
    var kaaba = { lat: 21.4225, lng: 39.8262 };
    var lat1 = lat * Math.PI / 180, lng1 = lng * Math.PI / 180;
    var lat2 = kaaba.lat * Math.PI / 180, lng2 = kaaba.lng * Math.PI / 180;
    var dLng = lng2 - lng1;
    var y = Math.sin(dLng);
    var x = Math.cos(lat1) * Math.tan(lat2) - Math.sin(lat1) * Math.cos(dLng);
    var angle = Math.atan2(y, x) * 180 / Math.PI;
    angle = (angle + 360) % 360;
    var directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    var dirIdx = Math.round(angle / 45) % 8;
    var distance = calculateDistance(lat, lng, kaaba.lat, kaaba.lng);
    return { degrees: angle, direction: directions[dirIdx], distance: distance };
}

function calculateDistance(lat1, lng1, lat2, lng2) {
    var R = 6371;
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLng = (lng2 - lng1) * Math.PI / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function startCompass() {
    if (compassActive) return;
    if (window.DeviceOrientationEvent) {
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission().then(function(state) {
                if (state === 'granted') {
                    compassActive = true;
                    window.addEventListener('deviceorientation', handleOrientation);
                }
            }).catch(function() {
                compassActive = true;
                window.addEventListener('deviceorientation', handleOrientation);
            });
        } else {
            compassActive = true;
            window.addEventListener('deviceorientation', handleOrientation);
        }
    }
}

function handleOrientation(event) {
    var face = document.getElementById('qiblaCompassFace');
    if (!face) return;
    var alpha = event.webkitCompassHeading || event.alpha;
    if (typeof alpha !== 'number') return;
    qiblaState.heading = alpha;
    face.style.transform = 'rotate(' + (-alpha) + 'deg)';
    var diffEl = document.getElementById('qiblaDiffValue');
    var labelEl = document.getElementById('qiblaDiffLabel');
    var headingEl = document.getElementById('headingDisplay');
    var glowRing = document.getElementById('qiblaGlowRing');
    var foundBadge = document.getElementById('qiblaFoundBadge');
    var qAngle = qiblaState.qiblaAngle;
    var diff = ((qAngle - alpha) % 360 + 360) % 360;
    if (diff > 180) diff = diff - 360;
    var absDiff = Math.abs(diff);
    if (headingEl) headingEl.textContent = Math.round(alpha) + '°';
    if (diffEl) {
        if (absDiff < 1) {
            diffEl.textContent = '✓';
        } else {
            diffEl.textContent = Math.round(absDiff) + '°';
        }
        diffEl.className = 'qibla-diff-value' + (absDiff < 5 ? ' aligned' : absDiff < 15 ? ' close' : '');
    }
    if (labelEl) {
        if (absDiff < 5) {
            labelEl.textContent = 'Qibla iri hano! Facing Qibla!';
            labelEl.className = 'qibla-diff-label aligned';
        } else if (diff > 0) {
            labelEl.textContent = 'Turn right ' + Math.round(absDiff) + '°';
            labelEl.className = 'qibla-diff-label';
        } else {
            labelEl.textContent = 'Turn left ' + Math.round(absDiff) + '°';
            labelEl.className = 'qibla-diff-label';
        }
    }
    var aligned = absDiff < 5;
    if (aligned && !qiblaState.wasAligned) {
        qiblaState.wasAligned = true;
        if (glowRing) glowRing.classList.add('aligned');
        if (foundBadge) foundBadge.classList.add('visible');
        if (Date.now() - qiblaState.lastPlayTime > 8000) {
            qiblaState.lastPlayTime = Date.now();
            if (navigator.vibrate) navigator.vibrate(200);
        }
    } else if (!aligned && qiblaState.wasAligned) {
        qiblaState.wasAligned = false;
        if (glowRing) glowRing.classList.remove('aligned');
        if (foundBadge) foundBadge.classList.remove('visible');
    }
}

function calibrateCompass() {
    if (compassActive) {
        window.removeEventListener('deviceorientation', handleOrientation);
        compassActive = false;
    }
    startCompass();
    calculateAndDisplayQibla();
}

// ===== QURAN =====
function renderQuran() {
    const container = document.getElementById('quranContainer');
    if (!container) return;
    const surahsToRender = surahs.length > 0 ? surahs : (typeof fallbackSurahs !== 'undefined' ? fallbackSurahs : []);
    if (surahsToRender.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-quran"></i><p data-i18n="noSurahs">Nta surahi zibonetse</p></div>';
        return;
    }
    container.innerHTML = surahsToRender.map(s => {
        const lang = document.body.getAttribute('data-language') || 'rw';
        const nameDisplay = lang === 'ar' ? s.nameArabic : s.name;
        const isMeccan = (s.type || '').toLowerCase() === 'makkah';
        const typeClass = isMeccan ? 'surah-type-makkah' : 'surah-type-madani';
        const typeLabel = isMeccan ? (lang === 'ar' ? 'مكية' : lang === 'rw' ? 'Makka' : 'Meccan') : (lang === 'ar' ? 'مدنية' : lang === 'rw' ? 'Madina' : 'Medinan');
        return '<div class="surah-card" onclick="playSurah(' + s.number + ')">' +
            '<div class="surah-info">' +
            '<div class="surah-number">' + s.number + '</div>' +
            '<div class="surah-details">' +
            '<div class="surah-name-arabic">' + s.nameArabic + '</div>' +
            '<div class="surah-name">' + s.name + '</div>' +
            '<div class="surah-meta">' +
            '<span class="surah-type-badge ' + typeClass + '">' + typeLabel + '</span> ' +
            (s.ayahs ? '<span class="surah-ayah-count">' + s.ayahs + ' ayahs</span>' : '') +
            '</div>' +
            '</div>' +
            '</div>' +
            '<button class="surah-play-btn" onclick="event.stopPropagation(); playSurah(' + s.number + ')"><i class="fas fa-play"></i></button>' +
            '</div>';
    }).join('');
}

function filterSurahs() {
    const query = document.getElementById('quranSearch').value.toLowerCase();
    const container = document.getElementById('quranContainer');
    if (!container) return;
    const filtered = surahs.filter(s => s.name.toLowerCase().includes(query) || s.nameArabic.includes(query) || String(s.number).includes(query));
    container.innerHTML = filtered.map(s => {
        const isMeccan = (s.type || '').toLowerCase() === 'makkah';
        const typeClass = isMeccan ? 'surah-type-makkah' : 'surah-type-madani';
        const lang = document.body.getAttribute('data-language') || 'rw';
        const typeLabel = isMeccan ? (lang === 'ar' ? 'مكية' : lang === 'rw' ? 'Makka' : 'Meccan') : (lang === 'ar' ? 'مدنية' : lang === 'rw' ? 'Madina' : 'Medinan');
        return '<div class="surah-card" onclick="playSurah(' + s.number + ')">' +
            '<div class="surah-info">' +
            '<div class="surah-number">' + s.number + '</div>' +
            '<div class="surah-details">' +
            '<div class="surah-name-arabic">' + s.nameArabic + '</div>' +
            '<div class="surah-name">' + s.name + '</div>' +
            '<div class="surah-meta">' +
            '<span class="surah-type-badge ' + typeClass + '">' + typeLabel + '</span> ' +
            (s.ayahs ? '<span class="surah-ayah-count">' + s.ayahs + ' ayahs</span>' : '') +
            '</div>' +
            '</div>' +
            '</div>' +
            '<button class="surah-play-btn" onclick="event.stopPropagation(); playSurah(' + s.number + ')"><i class="fas fa-play"></i></button>' +
            '</div>';
    }).join('');
}

let quranAudioEl = null;

function playSurah(number) {
    const surah = surahs.find(s => s.number === number);
    if (!surah) return;
    const player = document.getElementById('quranPlayer');
    const title = document.getElementById('currentSurahName');
    const audioEl = document.getElementById('quranAudio');
    if (!audioEl) return;
    audioManager.pause();
    document.getElementById('audioPlayerSection')?.classList.remove('active');
    const vid = document.getElementById('videoElement');
    if (vid) { vid.pause(); vid.src = ''; }
    document.getElementById('videoPlayer')?.classList.remove('active');
    if (player) player.style.display = 'block';
    if (title) title.textContent = surah.name + ' - ' + surah.nameArabic;
    var srcEl = audioEl.querySelector('source');
    if (srcEl) srcEl.src = surah.audioUrl;
    else audioEl.src = surah.audioUrl;
    audioEl.load();
    audioEl.play().catch(() => {});
    document.querySelectorAll('.surah-play-btn').forEach(btn => btn.classList.remove('playing'));
    var cards = document.querySelectorAll('.surah-card');
    for (var c = 0; c < cards.length; c++) {
        var numEl = cards[c].querySelector('.surah-number');
        if (numEl && numEl.textContent.trim() == number) {
            var playBtn = cards[c].querySelector('.surah-play-btn');
            if (playBtn) playBtn.classList.add('playing');
            break;
        }
    }
}

// ===== ADHAN MANAGER =====
class AdhanManager {
    constructor() {
        this.isEnabled = localStorage.getItem('adhanEnabled') !== 'false';
        this.volume = parseInt(localStorage.getItem('adhanVolume') || '100') / 100;
        this.reciter = localStorage.getItem('adhanReciter') || 'adhan1';
        this.audio = document.getElementById('adhanAudio');
        this.checkInterval = null;
        this.lastPlayedDate = '';
        if (this.audio) this.audio.volume = this.volume;
        this.toggle = document.getElementById('adhanToggle');
        if (this.toggle) this.toggle.classList.toggle('active', this.isEnabled);
    }

    check() {
        if (!this.isEnabled || !prayerManager.prayerTimes) return;
        const now = new Date();
        const today = now.toDateString();
        if (this.lastPlayedDate === today) return;
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const prayerName = this.getCurrentPrayerTime(currentMinutes);
        if (prayerName && prayerName !== 'Sunrise') {
            this.play(prayerName);
            this.lastPlayedDate = today;
        }
    }

    getCurrentPrayerTime(currentMinutes) {
        const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
        for (const name of prayers) {
            if (!prayerManager.prayerTimes[name]) continue;
            const parts = prayerManager.prayerTimes[name].split(':');
            const prayerMinutes = parseInt(parts[0]) * 60 + parseInt(parts[1]);
            if (Math.abs(currentMinutes - prayerMinutes) <= 2) return name;
        }
        return null;
    }

    play(prayerName) {
        if (!this.audio) return;
        const adhanFiles = {
            adhan1: 'Sounds/Adhan1.mpeg',
            adhan2: 'Sounds/Adhan2.mpeg',
            mansour: 'Sounds/Mansour_Adhan.mpeg'
        };
        this.audio.src = adhanFiles[this.reciter] || adhanFiles.adhan1;
        this.audio.volume = this.volume;
        this.audio.play().catch(() => {});
        const notification = document.getElementById('adhanNotification');
        const nameEl = document.getElementById('adhanPrayerName');
        if (notification && nameEl) {
            nameEl.textContent = prayerName;
            notification.classList.add('show');
        }
        const prayerCard = document.getElementById('prayer-' + prayerName);
        if (prayerCard) prayerCard.classList.add('adhan-playing');
        const toast = document.getElementById('adhanToast');
        const toastPrayer = document.getElementById('adhanToastPrayer');
        if (toast && toastPrayer) {
            toastPrayer.textContent = prayerName;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 5000);
        }
    }

    toggle() {
        this.isEnabled = !this.isEnabled;
        if (this.toggle) this.toggle.classList.toggle('active', this.isEnabled);
        localStorage.setItem('adhanEnabled', this.isEnabled ? 'true' : 'false');
    }

    setVolume(val) {
        this.volume = val / 100;
        if (this.audio) this.audio.volume = this.volume;
        localStorage.setItem('adhanVolume', String(val));
    }

    changeReciter(reciter) {
        this.reciter = reciter;
        localStorage.setItem('adhanReciter', reciter);
    }

    startCheck() {
        if (this.checkInterval) clearInterval(this.checkInterval);
        this.checkInterval = setInterval(() => this.check(), 30000);
    }
}

const adhanManager = new AdhanManager();
function toggleAdhan() { adhanManager.toggle(); }
function changeAdhanReciter(val) { adhanManager.changeReciter(val); }
function updateAdhanVolume(val) {
    adhanManager.setVolume(val);
    document.getElementById('adhanVolumeDisplay').textContent = val + '%';
}
function closeAdhanNotification() {
    document.getElementById('adhanNotification')?.classList.remove('show');
    document.querySelectorAll('.prayer-card.adhan-playing').forEach(c => c.classList.remove('adhan-playing'));
    var audio = document.getElementById('adhanAudio');
    if (audio) { audio.pause(); audio.currentTime = 0; }
}

// ===== ADHKAR REMINDER =====
class AdhkarReminder {
    constructor() {
        this.isEnabled = localStorage.getItem('adhkarReminder') !== 'false';
        this.interval = parseInt(localStorage.getItem('reminderInterval') || '30');
        this.timer = null;
        this.adhkarIndex = 0;
    }

    start() {
        if (this.timer) clearInterval(this.timer);
        if (!this.isEnabled) return;
        this.timer = setInterval(() => this.show(), this.interval * 60 * 1000);
    }

    show() {
        if (adhkarList.length === 0) return;
        const popup = document.getElementById('adhkarReminderPopup');
        const arabic = document.getElementById('reminderArabic');
        const trans = document.getElementById('reminderTransliteration');
        const translation = document.getElementById('reminderTranslation');
        if (!popup) return;
        const adhkar = adhkarList[this.adhkarIndex % adhkarList.length];
        this.adhkarIndex++;
        if (arabic) arabic.textContent = adhkar.arabic;
        if (trans) trans.textContent = adhkar.transliteration;
        if (translation) translation.textContent = adhkar.translation;
        popup.classList.add('show');
        var audioSrc = adhkar.audio_url || adhkar.audioFile || 'Sounds/Subhanallah.m4a';
        var silent = silentMode && (silentMode.isActive || (silentMode.isScheduled && (function(){ var n=new Date();var m=n.getHours()*60+n.getMinutes();var sp=silentMode.scheduledStart.split(':').map(Number);var ep=silentMode.scheduledEnd.split(':').map(Number);var sm=sp[0]*60+sp[1];var em=ep[0]*60+ep[1];if(sm<=em)return m>=sm&&m<em;return m>=sm||m<em;})()));
        if (!silent) {
            var audio = document.getElementById('reminderAudio');
            if (audio) { audio.src = audioSrc; audio.play().catch(function(){}); }
        }
    }

    stopAudio() {
        var audio = document.getElementById('reminderAudio');
        if (audio) { audio.pause(); audio.currentTime = 0; }
    }

    snooze() {
        this.stopAudio();
        document.getElementById('adhkarReminderPopup')?.classList.remove('show');
        setTimeout(() => this.show(), 5 * 60 * 1000);
    }

    dismiss() {
        this.stopAudio();
        document.getElementById('adhkarReminderPopup')?.classList.remove('show');
    }

    toggle() {
        this.isEnabled = !this.isEnabled;
        document.getElementById('adhkarReminderToggle')?.classList.toggle('active', this.isEnabled);
        localStorage.setItem('adhkarReminder', this.isEnabled ? 'true' : 'false');
        if (this.isEnabled) this.start();
        else if (this.timer) clearInterval(this.timer);
    }
}

const adhkarReminder = new AdhkarReminder();
function toggleAdhkarReminders() { adhkarReminder.toggle(); }
function snoozeAdhkar() { adhkarReminder.snooze(); }
function dismissAdhkar() { adhkarReminder.dismiss(); }

// ===== USER LOCATION =====
function getUserLocation() {
    if (!navigator.geolocation) {
        showToast('Geolocation not available', 'error');
        return;
    }
    navigator.geolocation.getCurrentPosition(
        pos => {
            prayerManager.location.lat = pos.coords.latitude;
            prayerManager.location.lng = pos.coords.longitude;
            document.getElementById('locationCoords').textContent = pos.coords.latitude.toFixed(4) + '°, ' + pos.coords.longitude.toFixed(4) + '°';
            updatePrayerTimes();
            showToast('Location updated', 'success');
        },
        err => {
            showToast('Could not get location', 'error');
        }
    );
}

// ===== UPDATE FUNCTIONS =====
function updatePrayerTimes() {
    prayerManager.fetchTimes().then(success => {
        if (!success) prayerManager.calculateOffline();
        prayerManager.displayTimes();
        updatePrayerSummary();
        adhanManager.startCheck();
    });
}

function updatePrayerSummary() {
    const list = document.getElementById('prayerSummaryList');
    const nextEl = document.getElementById('prayerSummaryNext');
    const dateEl = document.getElementById('prayerSummaryDate');
    if (!list) return;
    if (dateEl) {
        try { dateEl.textContent = new Date().toLocaleDateString(); } catch(e) {}
    }
    if (!prayerManager.prayerTimes) {
        list.innerHTML = '<div class="prayer-summary-loading">Loading...</div>';
        return;
    }
    const lang = document.body.getAttribute('data-language') || 'rw';
    const names = lang === 'ar' ? prayerManager.prayerNamesAr : lang === 'rw' ? prayerManager.prayerNamesRw : prayerManager.prayerNames;
    const next = prayerManager.getNextPrayer();
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    list.innerHTML = prayerManager.prayerNames.map((name, i) => {
        const time = prayerManager.prayerTimes[name];
        if (!time || !/^\d{1,2}:\d{2}$/.test(time)) return '';
        const parts = time.split(':');
        const prayerMinutes = parseInt(parts[0]) * 60 + parseInt(parts[1]);
        const isNext = next && next.name === name;
        const isCurrent = Math.abs(currentMinutes - prayerMinutes) < 30 && currentMinutes >= prayerMinutes;
        return '<div class="prayer-summary-row' + (isNext ? ' is-next' : '') + (isCurrent ? ' is-current' : '') + '">' +
            '<span class="prayer-summary-name">' + names[i] + '</span>' +
            '<span class="prayer-summary-value">' + time + '</span>' +
            (isNext ? '<span class="prayer-summary-badge">Next</span>' : '') +
            '</div>';
    }).join('');
    if (nextEl && next) {
        nextEl.innerHTML = '<i class="fas fa-bell"></i> <span>' + getTranslation('nextPrayer') + '</span> <strong>' + next.name + ' - ' + next.time + '</strong>';
    }
}

function getTranslation(key) {
    const lang = document.body.getAttribute('data-language') || 'rw';
    return (translations[lang] && translations[lang][key]) || key;
}

// ===== SETTINGS =====
function toggleSettings() {
    document.getElementById('settingsPanel')?.classList.toggle('active');
}

function toggleAdhkar() {
    document.getElementById('adhkarPanel')?.classList.toggle('active');
    renderAdhkarCards();
}

function updateAdhkarBadge() {
    var badge = document.getElementById('adhkarBadge');
    if (badge) badge.textContent = adhkarList.length || '0';
}

function renderAdhkarCards() {
    updateAdhkarBadge();
    const grid = document.getElementById('adhkarGrid');
    if (!grid) return;
    const adhkarToRender = adhkarList.length > 0 ? adhkarList : (typeof fallbackAdhkar !== 'undefined' ? fallbackAdhkar : []);
    if (adhkarToRender.length === 0) {
        grid.innerHTML = '<div class="empty-state"><i class="fas fa-hands-praying"></i><p>Nta adhkar yabonetse</p></div>';
        return;
    }
    grid.innerHTML = adhkarToRender.map(function(item, idx) {
        var current = localStorage.getItem('adhkar_' + idx);
        if (current === null) current = '0';
        return '<div class="adhkar-card">' +
            '<div class="adhkar-arabic">' + item.arabic + '</div>' +
            '<div class="adhkar-text">' + item.transliteration + '</div>' +
            '<div class="adhkar-translation">' + item.translation + '</div>' +
            '<div class="adhkar-count">' +
            '<button class="count-btn" onclick="updateCounter(' + idx + ',-1)">-</button>' +
            '<span class="count-number" id="counter' + idx + '">' + current + '/' + item.count + '</span>' +
            '<button class="count-btn" onclick="updateCounter(' + idx + ',1)">+</button>' +
            '</div>' +
            '</div>';
    }).join('');
}

let dhikrSound = null;
function playDhikrSound() {
    try {
        if (!dhikrSound) {
            dhikrSound = new Audio('Sounds/Subhanallah.m4a');
            dhikrSound.preload = 'auto';
        }
        const clone = dhikrSound.cloneNode();
        clone.volume = 0.6;
        clone.play().catch(function() {});
    } catch(e) {}
}

function playCompletionSound() {
    try {
        const audio = new Audio('Sounds/Subhanallah.m4a');
        audio.volume = 0.8;
        audio.play().catch(function() {});
    } catch(e) {}
}

function updateCounter(index, delta) {
    const el = document.getElementById('counter' + index);
    if (!el) return;
    const parts = el.textContent.split('/');
    let current = parseInt(parts[0]) + delta;
    const max = parseInt(parts[1]);
    if (current < 0) current = 0;
    if (current > max) current = 0;
    el.textContent = current + '/' + max;
    localStorage.setItem('adhkar_' + index, String(current));

    if (delta > 0) {
        if (current >= max) {
            el.parentElement.parentElement.classList.add('completed');
            playCompletionSound();
            el.style.transform = 'scale(1.3)';
            el.style.color = '#10B981';
            setTimeout(function() { el.style.transform = ''; }, 300);
        } else {
            playDhikrSound();
            el.style.transform = 'scale(1.2)';
            setTimeout(function() { el.style.transform = ''; }, 200);
        }
    } else {
        if (current < max) {
            el.parentElement.parentElement.classList.remove('completed');
            el.style.color = '';
        }
    }
}

function updateAdhkarTimer() {
    const el = document.getElementById('adhkarCurrentTime');
    if (el) {
        var panel = document.getElementById('adhkarPanel');
        if (!panel || panel.classList.contains('active')) {
            el.textContent = new Date().toLocaleTimeString();
        }
    }
    setTimeout(updateAdhkarTimer, 1000);
}

function toggleReminders() {
    const el = document.getElementById('reminderToggle');
    if (!el) return;
    const nowActive = !el.classList.contains('active');
    el.classList.toggle('active', nowActive);
    localStorage.setItem('reminderToggle', nowActive ? 'true' : 'false');
    if (nowActive) {
        adhkarReminder.isEnabled = true;
        adhkarReminder.start();
        document.getElementById('adhkarReminderToggle')?.classList.add('active');
    } else {
        adhkarReminder.isEnabled = false;
        if (adhkarReminder.timer) clearInterval(adhkarReminder.timer);
        document.getElementById('adhkarReminderToggle')?.classList.remove('active');
    }
    localStorage.setItem('adhkarReminder', nowActive ? 'true' : 'false');
}

function updateReminderInterval(val) {
    const display = document.getElementById('reminderIntervalDisplay');
    if (display) display.textContent = val + ' minutes';
    localStorage.setItem('reminderInterval', val);
    adhkarReminder.interval = parseInt(val);
    adhkarReminder.start();
}

// ===== TOAST NOTIFICATION =====
function showToast(message, type) {
    const toast = document.getElementById('adhanToast');
    if (!toast) return;
    const msgEl = document.getElementById('adhanToastMessage');
    if (msgEl) msgEl.textContent = message;
    const iconEl = toast.querySelector('i');
    if (iconEl) {
        if (type === 'success') iconEl.className = 'fas fa-check-circle';
        else if (type === 'error') iconEl.className = 'fas fa-exclamation-circle';
        else iconEl.className = 'fas fa-info-circle';
    }
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// ===== LANGUAGE =====
function applyLanguage(lang) {
    document.body.setAttribute('data-language', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.getElementById('currentLang').textContent = lang.toUpperCase();
    document.querySelectorAll('.lang-option').forEach(o => o.classList.remove('active'));
    const activeOpt = Array.from(document.querySelectorAll('.lang-option')).find(o => o.textContent.includes(lang === 'rw' ? 'Kinyarwanda' : lang === 'en' ? 'English' : 'العربية'));
    if (activeOpt) activeOpt.classList.add('active');
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            if (el.tagName === 'INPUT') el.setAttribute('placeholder', translations[lang][key]);
            else el.textContent = translations[lang][key];
        }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[lang] && translations[lang][key]) el.setAttribute('placeholder', translations[lang][key]);
    });
    document.querySelectorAll('.nav-label').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (key && translations[lang] && translations[lang][key]) el.textContent = translations[lang][key];
    });
    if (typeof renderTracks === 'function' && tracksData.length > 0) renderTracks();
    if (typeof renderCategoryTabs === 'function') renderCategoryTabs();
    if (typeof renderQuran === 'function') renderQuran();
    if (typeof updatePrayerTimes === 'function') updatePrayerTimes();
    if (typeof displayVerseOfTheDay === 'function') displayVerseOfTheDay();
    if (prayerManager.prayerTimes) prayerManager.displayTimes();
    if (typeof updatePrayerSummary === 'function') updatePrayerSummary();
    if (typeof renderAdhkarCards === 'function') renderAdhkarCards();
    localStorage.setItem('language', lang);
}

function renderFeaturedAudio() {
    const container = document.getElementById('featuredAudioContainer');
    if (!container) return;

    const audioToRender = tracksData.length > 0 ? tracksData : (typeof fallbackTracks !== 'undefined' ? fallbackTracks : []);
    
    const featured = audioToRender.filter(t => t.image).slice(0, 4);

    if (featured.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No featured audio available.</p></div>';
        return;
    }

    container.innerHTML = '<div class="featured-audio-grid">' + featured.map(track => {
        const title = getTrackTitle(track);
        const artistName = getArtistName(track);
        return `
            <div class="audio-card-mini" onclick="playTrack(null, ${track.id})">
                <div class="audio-card-mini-thumb">
                    <img src="${track.image || 'Images/logo2.png'}" alt="${title}" loading="lazy">
                    <div class="audio-play-overlay"><i class="fas fa-play"></i></div>
                </div>
                <div class="audio-card-mini-info">
                    <h4 class="audio-title-mini">${title}</h4>
                    <p class="audio-artist-mini">${artistName}</p>
                </div>
            </div>
        `;
    }).join('') + '</div>';
}

function displayVerseOfTheDay() {
    const lang = document.body.getAttribute('data-language') || 'rw';
    const verseWidget = document.getElementById('verseOfTheDayWidget');
    if (!verseWidget) return;

    // If no verse is selected, pick a random one
    if (currentVerseIndex === -1) {
        currentVerseIndex = Math.floor(Math.random() * versesOfTheDay.length);
    }

    const selectedVerse = versesOfTheDay[currentVerseIndex][lang] || versesOfTheDay[currentVerseIndex]['en'];

    const verseTextEl = document.getElementById('verseText');
    const verseSurahEl = document.getElementById('verseSurah');
    if (verseTextEl) verseTextEl.textContent = selectedVerse.verse;
    if (verseSurahEl) verseSurahEl.textContent = selectedVerse.surah;
}

function changeLanguage(lang) {
    applyLanguage(lang);
}

function detectDeviceLanguage() {
    const saved = localStorage.getItem('language');
    if (saved) { applyLanguage(saved); return; }
    const navLang = navigator.language || navigator.userLanguage || '';
    if (navLang.startsWith('ar')) applyLanguage('ar');
    else if (navLang.startsWith('rw') || navLang.startsWith('en')) applyLanguage('rw');
    else applyLanguage('rw');
}

// ===== SCROLL =====
function scrollToTop() { document.querySelector('.section.active')?.scrollTo({ top: 0, behavior: 'smooth' }); }
function scrollToBottom() { const el = document.querySelector('.section.active'); if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' }); }

// ===== DOWNLOAD =====
function downloadAllTracks() {
    tracksData.forEach(track => {
        const a = document.createElement('a');
        a.href = track.audioUrl;
        a.download = track.title + '.mp3';
        a.click();
    });
    showToast('Downloading all lessons...', 'info');
}

// ===== CACHE =====
function clearCache() {
    if ('caches' in window) {
        caches.keys().then(names => names.forEach(name => caches.delete(name)));
    }
    var keysToKeep = ['language', 'admin_lang', 'adhkarReminder', 'reminderInterval', 'reminderToggle',
        'adhanEnabled', 'adhanVolume', 'adhanReciter', 'silentMode', 'smartSilent', 'scheduledSilent',
        'silentStart', 'silentEnd', 'prayerCheckboxes', 'userLocation', 'selectedReciter'];
    Object.keys(localStorage).forEach(function(key) {
        if (keysToKeep.indexOf(key) === -1 && key.indexOf('adhkar_') !== 0) {
            localStorage.removeItem(key);
        }
    });
    showToast('Cache cleared', 'success');
}

// ===== INIT =====
function initApp() {
    // Clear stale prayer cache (old format without location key)
    try {
        const oldTimes = localStorage.getItem('prayerTimes');
        const oldDate = localStorage.getItem('prayerTimesDate');
        if (oldTimes && !localStorage.getItem('prayerTimes_-1.9403_29.8739')) {
            localStorage.removeItem('prayerTimes');
            localStorage.removeItem('prayerTimesDate');
        }
    } catch(e) {}

    const loadingScreen = document.getElementById('loadingScreen');
    const loadingBar = document.getElementById('loadingBar');
    const loadingPercentage = document.getElementById('loadingPercentage');
    const loadingStatus = document.getElementById('loadingStatus');
    let progress = 0;

    function updateLoading(pct, status) {
        progress = Math.min(pct, 100);
        if (loadingBar) loadingBar.style.width = progress + '%';
        if (loadingPercentage) loadingPercentage.textContent = progress + '%';
        if (loadingStatus) loadingStatus.textContent = status || 'Initializing...';
    }

    updateLoading(10, 'Loading data...');
    loadDataFromAPI().then(function() {
        updateLoading(60, 'Setting up prayer times...');
        updatePrayerTimes();
        detectDeviceLanguage();
        silentMode.restoreUI();
        renderPrayerCheckboxes();
        adhanManager.startCheck();
        adhkarReminder.start();
        updateLoading(100, 'Ready!');
        setTimeout(function() {
            if (loadingScreen) loadingScreen.classList.add('hidden');
            if (tracksData.length === 0 && typeof fallbackTracks !== 'undefined') {
                tracksData.length = 0;
                fallbackTracks.forEach(function(t) { tracksData.push({...t, categoryAr: (typeof categoryNames !== 'undefined' && categoryNames[t.category]) ? categoryNames[t.category].ar : t.category, categoryEn: (typeof categoryNames !== 'undefined' && categoryNames[t.category]) ? categoryNames[t.category].en : t.category }); });
                if (typeof renderTracks === 'function') renderTracks();
                if (typeof renderCategoryTabs === 'function') renderCategoryTabs();
            }
            if (videosData.length === 0 && typeof fallbackVideos !== 'undefined') {
                videosData.length = 0;
                fallbackVideos.forEach(function(v) { videosData.push({...v}); });
                if (typeof renderVideos === 'function') renderVideos();
            }
            if (booksData.length === 0 && typeof fallbackBooks !== 'undefined') {
                booksData.length = 0;
                fallbackBooks.forEach(function(b) { booksData.push({...b}); });
                if (typeof renderBooks === 'function') renderBooks();
            }
            if (adhkarList.length === 0 && typeof fallbackAdhkar !== 'undefined') {
                adhkarList.length = 0;
                fallbackAdhkar.forEach(function(a) { adhkarList.push({...a}); });
                if (typeof renderAdhkarCards === 'function') renderAdhkarCards();
            }
            if (surahs.length === 0 && typeof fallbackSurahs !== 'undefined') {
                surahs.length = 0;
                fallbackSurahs.forEach(function(s) { surahs.push({...s}); });
                if (typeof renderQuran === 'function') renderQuran();
            }
            updatePrayerSummary();
            displayVerseOfTheDay();
            renderFeaturedAudio();
            updateAdhkarTimer();
            setupAudioListeners();
        }, 500);
    }).catch(function(e) {
        console.error('loadDataFromAPI failed:', e.message);
        updateLoading(60, 'Setting up prayer times...');
        updatePrayerTimes();
        detectDeviceLanguage();
        silentMode.restoreUI();
        renderPrayerCheckboxes();
        adhanManager.startCheck();
        adhkarReminder.start();
        updateLoading(100, 'Ready!');
        setTimeout(function() {
            if (loadingScreen) loadingScreen.classList.add('hidden');
            tracksData.length = 0;
            if (typeof fallbackTracks !== 'undefined') {
                fallbackTracks.forEach(function(t) { tracksData.push({...t, categoryAr: (typeof categoryNames !== 'undefined' && categoryNames[t.category]) ? categoryNames[t.category].ar : t.category, categoryEn: (typeof categoryNames !== 'undefined' && categoryNames[t.category]) ? categoryNames[t.category].en : t.category }); });
            }
            videosData.length = 0;
            if (typeof fallbackVideos !== 'undefined') {
                fallbackVideos.forEach(function(v) { videosData.push({...v}); });
            }
            booksData.length = 0;
            if (typeof fallbackBooks !== 'undefined') {
                fallbackBooks.forEach(function(b) { booksData.push({...b}); });
            }
            adhkarList.length = 0;
            if (typeof fallbackAdhkar !== 'undefined') {
                fallbackAdhkar.forEach(function(a) { adhkarList.push({...a}); });
            }
            surahs.length = 0;
            if (typeof fallbackSurahs !== 'undefined') {
                fallbackSurahs.forEach(function(s) { surahs.push({...s}); });
            }
            if (typeof renderTracks === 'function') renderTracks();
            if (typeof renderCategoryTabs === 'function') renderCategoryTabs();
            if (typeof renderQuran === 'function') renderQuran();
            if (typeof renderVideos === 'function') renderVideos();
            if (typeof renderBooks === 'function') renderBooks();
            if (typeof renderAdhkarCards === 'function') renderAdhkarCards();
            updatePrayerSummary();
            displayVerseOfTheDay();
            renderFeaturedAudio();
            updateAdhkarTimer();
            setupAudioListeners();
        }, 500);
    });
}

// ===== PRAYER CHECKBOXES SETTINGS =====
function renderPrayerCheckboxes() {
    var container = document.getElementById('prayerCheckboxes');
    if (!container) return;
    var prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    var saved = localStorage.getItem('prayerCheckboxes');
    var checked = {};
    if (saved) { try { checked = JSON.parse(saved); } catch(e) {} }
    container.innerHTML = prayers.map(function(p) {
        var isChecked = checked[p] !== false;
        return '<label class="prayer-checkbox"><input type="checkbox" value="' + p + '"' + (isChecked ? ' checked' : '') + ' onchange="savePrayerCheckboxes()"> ' + p + '</label>';
    }).join('');
}
function savePrayerCheckboxes() {
    var checks = document.querySelectorAll('#prayerCheckboxes input[type="checkbox"]');
    var state = {};
    checks.forEach(function(cb) { state[cb.value] = cb.checked; });
    localStorage.setItem('prayerCheckboxes', JSON.stringify(state));
}

document.addEventListener('DOMContentLoaded', initApp);
