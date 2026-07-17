const API_BASE = window.location.origin + '/api';
let currentPage = 'dashboard';

function getMediaUrl(path) {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return window.location.origin + (path.startsWith('/') ? path : '/' + path);
}
let currentLang = localStorage.getItem('admin_lang') || 'en';
let adminToken = sessionStorage.getItem('admin_token');

function handleLogin() {
    const pw = document.getElementById('loginPassword');
    const errEl = document.getElementById('loginError');
    const btn = document.getElementById('loginBtn');
    if (!pw || !pw.value) { errEl.textContent = 'Please enter password'; errEl.style.display = 'block'; return; }
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    btn.disabled = true;
    fetch(API_BASE + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw.value })
    }).then(function(r) { return r.json(); }).then(function(data) {
        if (data.success) {
            sessionStorage.setItem('admin_token', data.token);
            adminToken = data.token;
            document.getElementById('loginScreen').style.display = 'none';
            document.getElementById('dashboardScreen').style.display = 'flex';
            document.getElementById('dashboardScreen').style.flexDirection = 'column';
            document.getElementById('dashboardScreen').style.height = '100vh';
            setLang(currentLang);
            navigateTo('dashboard');
        } else {
            errEl.textContent = data.message || 'Invalid password';
            errEl.style.display = 'block';
        }
    }).catch(function() {
        errEl.textContent = 'Connection failed. Try again.';
        errEl.style.display = 'block';
    }).finally(function() {
        btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
        btn.disabled = false;
    });
}

function handleLogout() {
    sessionStorage.removeItem('admin_token');
    adminToken = null;
    document.getElementById('dashboardScreen').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('loginPassword').value = '';
}

const LANG = {
    en: {
        dashboard: 'Dashboard', artists: 'Artists', tracks: 'Tracks', videos: 'Videos',
        adhkar: 'Adhkar', quran: 'Quran', books: 'Books', categories: 'Categories', settings: 'Settings',
        add: 'Add', edit: 'Edit', save: 'Save', cancel: 'Cancel', delete: 'Delete',
        search: 'Search...', view: 'View', refresh: 'Refresh', noData: 'No data found',
        addArtist: 'Add Artist', editArtist: 'Edit Artist', addTrack: 'Add Track', editTrack: 'Edit Track',
        addVideo: 'Add Video', editVideo: 'Edit Video', addAdhkar: 'Add Adhkar', editAdhkar: 'Edit Adhkar',
        addBook: 'Add Book', editBook: 'Edit Book', addCategory: 'Add Category', editCategory: 'Edit Category',
        saved: 'saved successfully', deleted: 'deleted', upload: 'Upload', website: 'View Website',
        category: 'Category',
        surah: 'Surah', name: 'Name', arabic: 'Arabic', verses: 'Verses', type: 'Type',
        audio: 'Audio', author: 'Author', duration: 'Duration', actions: 'Actions',
        thumbnail: 'Thumbnail', title: 'Title', cover: 'Cover', slug: 'Slug', tracks: 'Tracks',
        image: 'Image', plays: 'Plays', noSurahs: 'No surahs found', noCategories: 'No categories found',
        apiConfig: 'API Configuration', serverStatus: 'Server Status', systemInfo: 'System Info',
        checkConn: 'Check Connection', online: 'Online', offline: 'Offline',
        saving: 'Saving...', uploadAudio: 'Upload Audio', replace: 'Replace',
        searchVideos: 'Search videos...', noVideos: 'No videos found', views: 'Views',
        searchAdhkar: 'Search adhkar...', noAdhkar: 'No adhkar found', count: 'Count',
        searchBooks: 'Search books...', noBooks: 'No books found', cover: 'Cover',
        videoSaved: 'Video saved successfully', videoDeleted: 'Video deleted',
        adhkarSaved: 'Adhkar saved successfully', adhkarDeleted: 'Adhkar deleted',
        bookSaved: 'Book saved successfully', bookDeleted: 'Book deleted',
        confirmDeleteVideo: 'Delete this video?', confirmDeleteAdhkar: 'Delete this adhkar?',
        confirmDeleteBook: 'Delete this book?',
        confirmDeleteCategory: 'Delete this category?',
        play: 'Play',
        videoFile: 'Video File', clickToUpload: 'Click to upload',
        appVersion: 'App Version', adminPanel: 'Admin Panel', noLoginRequired: 'No Login Required',
        general: 'General', morning: 'Morning', evening: 'Evening', sleep: 'Sleep',
        descriptionLabel: 'Description / Meaning', audioFile: 'Audio File',
        uploadVideo: 'Upload Video', uploadThumbnail: 'Upload Thumbnail',
        arabicText: 'Arabic Text', translation: 'Translation', reference: 'Reference',
        fileType: 'File Type', file: 'File', coverImage: 'Cover Image',
        icon: 'Icon', sortOrder: 'Sort Order', bio: 'Bio',
    },
    rw: {
        dashboard: 'Ikibaho', artists: 'Abahanzi', tracks: 'Inyigo', videos: 'Amashusho',
        adhkar: 'Adhkar', quran: 'Qur\'an', books: 'Ibitabo', categories: 'Ibyiciro', settings: 'Igenamiterere',
        add: 'Ongeraho', edit: 'Hindura', save: 'Bika', cancel: 'Reka', delete: 'Siba',
        search: 'Shaka...', view: 'Reba', refresh: 'Ongera', noData: 'Nta makuru abonetse',
        addArtist: 'Ongeraho Umunyamererwa', editArtist: 'Hindura Umunyamererwa',
        addTrack: 'Ongeraho Inyigo', editTrack: 'Hindura Inyigo',
        addVideo: 'Ongeraho Amashusho', editVideo: 'Hindura Amashusho',
        addAdhkar: 'Ongeraho Adhkar', editAdhkar: 'Hindura Adhkar',
        addBook: 'Ongeraho Igitabo', editBook: 'Hindura Igitabo',
        addCategory: 'Ongeraho Icyiciro', editCategory: 'Hindura Icyiciro',
        saved: 'bibye neza', deleted: 'byakurwaho', upload: 'Shyira', website: 'Reba Urubuga',
        category: 'Icyiciro',
        surah: 'Isura', name: 'Izina', arabic: 'Icyarabu', verses: 'Imirongo', type: 'Ubwoko',
        audio: 'Amaradiyo', author: 'Umwanditsi', duration: 'Igihe', actions: 'Ibikorwa',
        thumbnail: 'Ifoto', title: 'Umutwe', cover: 'Igifuniko', slug: 'Slug', tracks: 'Inyigo',
        image: 'Ifoto', plays: 'Gukina', noSurahs: 'Nta sura zibonetse', noCategories: 'Nta byiciro bibonetse',
        apiConfig: 'Igenamiterere rya API', serverStatus: 'Imiterere ya Seriveri', systemInfo: 'Amakuru ya Sisitemu',
        checkConn: 'Gerageza', online: 'Ikora', offline: 'Ntibikora',
        saving: 'Irabika...', uploadAudio: 'Shyira Amaradiyo', replace: 'Gusimbuza',
        searchVideos: 'Shaka amashusho...', noVideos: 'Nta mashusho abonetse', views: 'Reba',
        searchAdhkar: 'Shaka adhkar...', noAdhkar: 'Nta adhkar ibonetse', count: 'Umubare',
        searchBooks: 'Shaka ibitabo...', noBooks: 'Nta bitabo bibonetse', cover: 'Igifuniko',
        videoSaved: 'Amashusho yabitswe neza', videoDeleted: 'Amashusho yakurwaho',
        adhkarSaved: 'Adhkar yabitswe neza', adhkarDeleted: 'Adhkar yakurwaho',
        bookSaved: 'Igitabo cyabitswe neza', bookDeleted: 'Igitabo cyakurwaho',
        confirmDeleteVideo: 'Usiba aya mashusho?', confirmDeleteAdhkar: 'Usiba adhkar?',
        confirmDeleteBook: 'Usiba iki gitabo?',
        confirmDeleteCategory: 'Usiba iki cyiciro?',
        play: 'Kina',
        videoFile: 'Dosiye y\'amashusho', clickToUpload: 'Kanda kugirango ushyire',
        appVersion: 'Verisiyo ya App', adminPanel: 'Ikibaho cy\'Abayobozi', noLoginRequired: 'Nta Kwinjira Bisabwa',
        general: 'Rusange', morning: 'Mu Gitondo', evening: 'Mu Mugoroba', sleep: 'Iryo Rara',
        descriptionLabel: 'Ibisobanuro / Ubusobanuro', audioFile: 'Dosiye y\'Amaradiyo',
        uploadVideo: 'Shyira Amashusho', uploadThumbnail: 'Shyira Ifoto',
        arabicText: 'Umwandiko w\'Icyarabu', translation: 'Ibisobanuro', reference: 'Inkomoko',
        fileType: 'Ubwoko bwa Dosiye', file: 'Dosiye', coverImage: 'Igifuniko',
        icon: 'Ikigaragamboneza', sortOrder: 'Itondekanya', bio: 'Ubuzima',
    },
    ar: {
        dashboard: 'لوحة التحكم', artists: 'الفنانون', tracks: 'المسارات الصوتية', videos: 'الفيديو',
        adhkar: 'الأذكار', quran: 'القرآن', books: 'الكتب', categories: 'التصنيفات', settings: 'الإعدادات',
        add: 'إضافة', edit: 'تعديل', save: 'حفظ', cancel: 'إلغاء', delete: 'حذف',
        search: 'بحث...', view: 'عرض', refresh: 'تحديث', noData: 'لا توجد بيانات',
        addArtist: 'إضافة فنان', editArtist: 'تعديل فنان',
        addTrack: 'إضافة مسار', editTrack: 'تعديل مسار',
        addVideo: 'إضافة فيديو', editVideo: 'تعديل فيديو',
        addAdhkar: 'إضافة ذكر', editAdhkar: 'تعديل ذكر',
        addBook: 'إضافة كتاب', editBook: 'تعديل كتاب',
        addCategory: 'إضافة تصنيف', editCategory: 'تعديل تصنيف',
        saved: 'تم الحفظ بنجاح', deleted: 'تم الحذف', upload: 'رفع', website: 'عرض الموقع',
        category: 'تصنيف',
        surah: 'سورة', name: 'الاسم', arabic: 'العربية', verses: 'الآيات', type: 'النوع',
        audio: 'الصوت', author: 'المؤلف', duration: 'المدة', actions: 'الإجراءات',
        thumbnail: 'الصورة المصغرة', title: 'العنوان', cover: 'الغلاف', slug: 'الرابط المختصر', tracks: 'المسارات',
        image: 'الصورة', plays: 'المشغلات', noSurahs: 'لا توجد سور', noCategories: 'لا توجد تصنيفات',
        apiConfig: 'إعدادات API', serverStatus: 'حالة الخادم', systemInfo: 'معلومات النظام',
        checkConn: 'فحص الاتصال', online: 'متصل', offline: 'غير متصل',
        saving: 'جاري الحفظ...', uploadAudio: 'رفع الصوت', replace: 'استبدال',
        searchVideos: 'بحث عن فيديو...', noVideos: 'لا توجد فيديوهات', views: 'المشاهدات',
        searchAdhkar: 'بحث عن ذكر...', noAdhkar: 'لا توجد أذكار', count: 'العدد',
        searchBooks: 'بحث عن كتاب...', noBooks: 'لا توجد كتب', cover: 'الغلاف',
        videoSaved: 'تم حفظ الفيديو بنجاح', videoDeleted: 'تم حذف الفيديو',
        adhkarSaved: 'تم حفظ الذكر بنجاح', adhkarDeleted: 'تم حذف الذكر',
        bookSaved: 'تم حفظ الكتاب بنجاح', bookDeleted: 'تم حذف الكتاب',
        confirmDeleteVideo: 'حذف هذا الفيديو؟', confirmDeleteAdhkar: 'حذف هذا الذكر؟',
        confirmDeleteBook: 'حذف هذا الكتاب؟',
        confirmDeleteCategory: 'حذف هذا التصنيف؟',
        play: 'تشغيل',
        videoFile: 'ملف الفيديو', clickToUpload: 'انقر للرفع',
        appVersion: 'إصدار التطبيق', adminPanel: 'لوحة الإدارة', noLoginRequired: 'لا يتطلب تسجيل الدخول',
        general: 'عام', morning: 'الصباح', evening: 'المساء', sleep: 'النوم',
        descriptionLabel: 'الوصف / المعنى', audioFile: 'ملف الصوت',
        uploadVideo: 'رفع الفيديو', uploadThumbnail: 'رفع الصورة المصغرة',
        arabicText: 'النص العربي', translation: 'الترجمة', reference: 'المرجع',
        fileType: 'نوع الملف', file: 'ملف', coverImage: 'صورة الغلاف',
        icon: 'أيقونة', sortOrder: 'الترتيب', bio: 'السيرة',
    }
};

function t(key) { return (LANG[currentLang] && LANG[currentLang][key]) || key; }

function setLang(lang) {
    currentLang = lang;
    localStorage.setItem('admin_lang', lang);
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
    document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-i18n]').forEach(el => { const k = el.dataset.i18n; if (t(k)) el.textContent = t(k); });
    document.title = 'Sobanukirwa - ' + t('adminPanel');
    if (currentPage) navigateTo(currentPage);
}

document.addEventListener('DOMContentLoaded', () => {
    if (adminToken) {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('dashboardScreen').style.display = 'flex';
        document.getElementById('dashboardScreen').style.flexDirection = 'column';
        document.getElementById('dashboardScreen').style.height = '100vh';
    }
    document.getElementById('loginPassword').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
    document.getElementById('menuToggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(item.dataset.page);
        });
    });
    document.getElementById('modalOverlay').addEventListener('click', function(e) {
        if (e.target === e.currentTarget) closeModal();
    });
    if (adminToken) {
        setLang(currentLang);
        navigateTo('dashboard');
    }
});

function navigateTo(page) {
    currentPage = page;
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const navItem = document.querySelector('.nav-item[data-page="' + page + '"]');
    if (navItem) navItem.classList.add('active');
    document.getElementById('pageTitle').textContent = t(page);
    document.getElementById('sidebar').classList.remove('open');
    var cb = document.getElementById('contentBody');
    cb.className = 'content-body page-' + page;
    var actions = {
        dashboard: loadDashboard,
        artists: loadArtists,
        tracks: loadTracks,
        videos: loadVideos,
        adhkar: loadAdhkar,
        quran: loadQuran,
        books: loadBooks,
        categories: loadCategories,
        settings: loadSettings
    };
    if (actions[page]) actions[page]();
}

function showLoading() {
    document.getElementById('contentBody').innerHTML = '<div class="spinner"><i class="fas fa-spinner fa-pulse"></i></div>';
}
function showError(msg) {
    document.getElementById('contentBody').innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-circle"></i><p>' + msg + '</p></div>';
}

function showToast(msg, type) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + (type || 'info');
    toast.innerHTML = msg;
    container.appendChild(toast);
    setTimeout(() => { toast.classList.add('toast-hide'); setTimeout(() => toast.remove(), 300); }, 3000);
}

function showModal(html) {
    document.getElementById('modalContent').innerHTML = html;
    document.getElementById('modalOverlay').style.display = 'flex';
}
function closeModal() {
    document.getElementById('modalOverlay').style.display = 'none';
    document.getElementById('modalContent').innerHTML = '';
}

function refreshCurrentPage() {
    navigateTo(currentPage);
}

async function api(url, options) {
    try {
        options = options || {};
        options.headers = { 'Accept': 'application/json', ...options.headers };
        var res = await fetch(url, options);
        var data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Request failed');
        return data;
    } catch (err) {
        throw err;
    }
}

// ===== DASHBOARD =====
async function loadDashboard() {
    showLoading();
    try {
        var data = await api(API_BASE + '/stats/dashboard');
        document.getElementById('contentBody').innerHTML =
            `<div class="stats-grid">
                <div class="stat-card" onclick="navigateTo('artists')"><i class="fas fa-users"></i><div class="stat-number">${data.total_artists}</div><div class="stat-label">${t('artists')}</div></div>
                <div class="stat-card" onclick="navigateTo('tracks')"><i class="fas fa-music"></i><div class="stat-number">${data.total_tracks}</div><div class="stat-label">${t('tracks')}</div></div>
                <div class="stat-card" onclick="navigateTo('videos')"><i class="fas fa-video"></i><div class="stat-number">${data.total_videos}</div><div class="stat-label">${t('videos')}</div></div>
                <div class="stat-card" onclick="navigateTo('books')"><i class="fas fa-book"></i><div class="stat-number">${data.total_books}</div><div class="stat-label">${t('books')}</div></div>
                <div class="stat-card" onclick="navigateTo('categories')"><i class="fas fa-tags"></i><div class="stat-number">${data.total_categories}</div><div class="stat-label">${t('categories')}</div></div>
                <div class="stat-card"><i class="fas fa-play"></i><div class="stat-number">${data.total_plays}</div><div class="stat-label">${t('plays')}</div></div>
            </div>
            <div class="charts-grid">
            <div class="chart-card"><h4><i class="fas fa-clock"></i> Recent Tracks</h4><ul class="top-list">` +
            (data.recentTracks || []).map(function(item) { return '<li><span>' + esc(item.title) + ' <span class="td-muted">- ' + (item.artist_name || '') + '</span></span><span class="count">' + new Date(item.created_at).toLocaleDateString() + '</span></li>'; }).join('') +
            '</ul></div>' +
            '<div class="chart-card"><h4><i class="fas fa-fire"></i> Top Tracks</h4><ul class="top-list">' +
            (data.topTracks || []).map(function(item) { return '<li><span>' + esc(item.title) + ' <span class="td-muted">- ' + (item.artist_name || '') + '</span></span><span class="count">' + item.plays_count + ' ' + t('plays') + '</span></li>'; }).join('') +
            '</ul></div></div>';
    } catch (err) { showError('Failed to load dashboard: ' + err.message); }
}

// ===== ARTISTS =====
async function loadArtists() {
    showLoading();
    try {
        var artists = await api(API_BASE + '/artists');
        var html = '<div class="toolbar"><div class="toolbar-left"><button class="btn-primary" onclick="showArtistForm()"><i class="fas fa-plus"></i> ' + t('addArtist') + '</button><input type="text" class="search-input" id="artistSearch" placeholder="' + t('search') + '" onkeyup="filterArtistTable()"></div></div>';
        html += '<div class="table-wrapper"><table class="data-table" id="artistTable"><thead><tr><th>' + t('image') + '</th><th>' + t('name') + '</th><th>' + t('name') + ' (Ar)</th><th>' + t('tracks') + '</th><th style="width:100px">' + t('actions') + '</th></tr></thead><tbody id="artistBody">';
        if (artists.length === 0) {
            html += '<tr><td colspan="5" class="td-muted" style="text-align:center">' + t('noData') + '</td></tr>';
        } else {
            for (var i = 0; i < artists.length; i++) {
                var a = artists[i];
                var img = getMediaUrl(a.image_url) || '../Images/logo2.png';
                html += '<tr data-name="' + esc((a.name + ' ' + (a.name_en || '') + ' ' + (a.name_ar || '')).toLowerCase()) + '"><td><img src="' + img + '" class="img-preview" onerror="this.src=\'../Images/logo2.png\'"></td>' +
                    '<td><strong>' + esc(a.name) + '</strong>' + (a.name_en ? '<br><span class="td-muted">' + esc(a.name_en) + '</span>' : '') + '</td>' +
                    '<td class="td-muted" style="font-size:1.1rem">' + (a.name_ar || '-') + '</td>' +
                    '<td>' + (a.total_tracks || 0) + '</td>' + '<td><div class="action-group"><button class="action-btn edit" onclick="showArtistForm(' + a.id + ')" title="' + t('edit') + '"><i class="fas fa-edit"></i></button>' +
                    '<button class="action-btn delete" onclick="deleteArtist(' + a.id + ')" title="' + t('delete') + '"><i class="fas fa-trash"></i></button></div></td></tr>';
            }
        }
        html += '</tbody></table></div>';
        document.getElementById('contentBody').innerHTML = html;
    } catch (err) { showError('Error: ' + err.message); }
}

function filterArtistTable() {
    var q = document.getElementById('artistSearch').value.toLowerCase();
    document.querySelectorAll('#artistBody tr').forEach(function(r) {
        r.style.display = r.getAttribute('data-name').includes(q) ? '' : 'none';
    });
}

async function showArtistForm(id) {
    var artist = { name: '', name_ar: '', name_en: '', bio: '', image_url: '' };
    if (id) { artist = await api(API_BASE + '/artists/' + id); }
    var imgLabel = artist.image_url ? 'Current: ' + artist.image_url.split('/').pop() : '';
    showModal('' +
        '<h3><i class="fas ' + (id ? 'fa-edit' : 'fa-plus') + '"></i> ' + (id ? t('editArtist') : t('addArtist')) + '</h3>' +
        '<form id="artistForm" enctype="multipart/form-data">' +
        '<div class="form-grid">' +
        '<div class="form-group"><label><i class="fas fa-user"></i> ' + t('name') + ' *</label><input type="text" id="af_name" value="' + esc(artist.name) + '" required placeholder="' + t('name') + '"></div>' +
        '<div class="form-group"><label><i class="fas fa-language"></i> ' + t('name') + ' (Ar)</label><input type="text" id="af_name_ar" value="' + esc(artist.name_ar || '') + '" placeholder="' + t('name') + ' (Ar)"></div>' +
        '<div class="form-group full-width"><label><i class="fas fa-globe"></i> ' + t('name') + ' (En)</label><input type="text" id="af_name_en" value="' + esc(artist.name_en || '') + '" placeholder="' + t('name') + ' (En)"></div>' +
        '<div class="form-group full-width"><label><i class="fas fa-align-left"></i> ' + t('bio') + '</label><textarea id="af_bio" placeholder="' + t('bio') + '...">' + esc(artist.bio || '') + '</textarea></div>' +
        '<div class="form-group full-width"><label><i class="fas fa-image"></i> ' + t('image') + '</label>' +
        '<div class="file-upload" onclick="document.getElementById(\'af_image\').click()"><i class="fas fa-cloud-upload-alt"></i><p>' + t('upload') + ' ' + t('image') + '</p><div class="file-name" id="af_image_name">' + imgLabel + '</div></div>' +
        '<input type="file" id="af_image" accept="image/*" style="display:none" onchange="document.getElementById(\'af_image_name\').textContent = this.files[0]?.name || \'\'">' +
        '</div>' +
        '</div>' +
        '<div class="modal-actions"><button type="submit" class="btn-primary" id="saveArtistBtn"><i class="fas fa-save"></i> ' + t('save') + '</button><button type="button" class="btn-secondary" onclick="closeModal()">' + t('cancel') + '</button></div></form>');
    document.getElementById('artistForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const saveBtn = document.getElementById('saveArtistBtn');
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + t('saving');
        var fd = new FormData();
        fd.append('name', document.getElementById('af_name').value);
        fd.append('name_ar', document.getElementById('af_name_ar').value);
        fd.append('name_en', document.getElementById('af_name_en').value);
        fd.append('bio', document.getElementById('af_bio').value);
        var img = document.getElementById('af_image').files[0];
        if (img) fd.append('image', img);
        try {
            await api(API_BASE + '/artists' + (id ? '/' + id : ''), { method: id ? 'PUT' : 'POST', body: fd });
            closeModal(); refreshCurrentPage();
            showToast(t('artists') + ' ' + t('saved'), 'success');
        } catch (err) { showToast('Error: ' + err.message, 'error'); } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fas fa-save"></i> ' + t('save');
        }
    });
}

async function deleteArtist(id) {
    if (!confirm(t('delete') + ' ' + t('artists') + '?')) return;
    try { await api(API_BASE + '/artists/' + id, { method: 'DELETE' }); refreshCurrentPage(); showToast(t('artists') + ' ' + t('deleted'), 'success'); }
    catch (err) { showToast('Error: ' + err.message, 'error'); }
}

// ===== TRACKS =====
async function loadTracks() {
    showLoading();
    try {
        var tracks = await api(API_BASE + '/tracks');
        var artists = await api(API_BASE + '/artists');
        var cats = await api(API_BASE + '/categories');
        window._artists = artists;
        window._categories = cats;
        var html = '<div class="toolbar"><div class="toolbar-left"><button class="btn-primary" onclick="showTrackForm()"><i class="fas fa-plus"></i> ' + t('addTrack') + '</button><input type="text" class="search-input" id="trackSearch" placeholder="' + t('search') + '" onkeyup="filterTrackTable()"></div></div>';
        html += '<div class="table-wrapper"><table class="data-table" id="trackTable"><thead><tr><th>' + t('title') + '</th><th>' + t('artists') + '</th><th>' + t('category') + '</th><th>' + t('duration') + '</th><th>' + t('plays') + '</th><th style="width:100px">' + t('actions') + '</th></tr></thead><tbody id="trackBody">';
        if (tracks.length === 0) {
            html += '<tr><td colspan="6" class="td-muted" style="text-align:center">' + t('noData') + '</td></tr>';
        } else {
            for (var i = 0; i < tracks.length; i++) {
                var tr = tracks[i];
                var desc = tr.description ? '<br><span class="td-muted">' + esc(tr.description.substring(0, 60)) + (tr.description.length > 60 ? '...' : '') + '</span>' : '';
                html += '<tr data-search="' + esc((tr.title + ' ' + (tr.artist_name || '') + ' ' + (tr.category_name || '')).toLowerCase()) + '"><td><strong>' + esc(tr.title) + '</strong>' + desc + '</td>' +
                    '<td>' + (tr.artist_name ? '<i class="fas fa-user-tie" style="color:var(--gold);font-size:0.75rem"></i> ' + esc(tr.artist_name) : '<span class="td-muted">--</span>') + '</td>' +
                    '<td>' + (tr.category_name || '<span class="td-muted">--</span>') + '</td>' +
                    '<td>' + (tr.duration_str || '00:00') + '</td>' +
                    '<td>' + (tr.plays_count || 0) + '</td>' + '<td><div class="action-group"><button class="action-btn edit" onclick="showTrackForm(' + tr.id + ')" title="' + t('edit') + '"><i class="fas fa-edit"></i></button>' +
                    '<button class="action-btn delete" onclick="deleteTrack(' + tr.id + ')" title="' + t('delete') + '"><i class="fas fa-trash"></i></button></div></td></tr>';
            }
        }
        html += '</tbody></table></div>';
        document.getElementById('contentBody').innerHTML = html;
    } catch (err) { showError('Error: ' + err.message); }
}

function filterTrackTable() {
    var q = document.getElementById('trackSearch').value.toLowerCase();
    document.querySelectorAll('#trackBody tr').forEach(function(r) {
        r.style.display = r.getAttribute('data-search').includes(q) ? '' : 'none';
    });
}

async function showTrackForm(id) {
    var track = { title: '', title_ar: '', title_en: '', description: '', artist_id: '', category_id: '', duration_str: '00:00', audio_url: '' };
    if (id) { track = await api(API_BASE + '/tracks/' + id); }
    var artists = window._artists || [];
    var cats = window._categories || [];
    var audioLabel = track.audio_url ? 'Current: ' + track.audio_url.split('/').pop() : '';
    var artistOpts = '<option value="">' + t('artists') + '</option>';
    for (var i = 0; i < artists.length; i++) {
        artistOpts += '<option value="' + artists[i].id + '"' + (artists[i].id == track.artist_id ? ' selected' : '') + '>' + esc(artists[i].name) + '</option>';
    }
    var catOpts = '<option value="">' + t('category') + '</option>';
    for (var i = 0; i < cats.length; i++) {
        catOpts += '<option value="' + cats[i].id + '"' + (cats[i].id == track.category_id ? ' selected' : '') + '>' + esc(cats[i].name) + '</option>';
    }
    showModal('' +
        '<h3><i class="fas ' + (id ? 'fa-edit' : 'fa-plus') + '"></i> ' + (id ? t('editTrack') : t('addTrack')) + '</h3>' +
        '<form id="trackForm" enctype="multipart/form-data"><div class="form-grid">' +
        '<div class="form-group"><label><i class="fas fa-heading"></i> ' + t('title') + ' *</label><input type="text" id="tf_title" value="' + esc(track.title) + '" required placeholder="' + t('title') + '"></div>' +
        '<div class="form-group"><label><i class="fas fa-language"></i> ' + t('title') + ' (Ar)</label><input type="text" id="tf_title_ar" value="' + esc(track.title_ar || '') + '" placeholder="' + t('title') + ' (Ar)"></div>' +
        '<div class="form-group"><label><i class="fas fa-user-tie"></i> ' + t('artists') + ' *</label><select id="tf_artist_id" required>' + artistOpts + '</select></div>' +
        '<div class="form-group"><label><i class="fas fa-tag"></i> ' + t('category') + '</label><select id="tf_category_id">' + catOpts + '</select></div>' +
        '<div class="form-group"><label><i class="fas fa-clock"></i> ' + t('duration') + '</label><input type="text" id="tf_duration" value="' + (track.duration_str || '00:00') + '" placeholder="MM:SS"></div>' +
        '<div class="form-group"><label><i class="fas fa-globe"></i> ' + t('title') + ' (En)</label><input type="text" id="tf_title_en" value="' + esc(track.title_en || '') + '" placeholder="' + t('title') + ' (En)"></div>' +
        '<div class="form-group full-width"><label><i class="fas fa-align-left"></i> ' + t('descriptionLabel') + '</label><textarea id="tf_description" placeholder="' + t('descriptionLabel') + '...">' + esc(track.description || '') + '</textarea></div>' +
        '<div class="form-group full-width"><label><i class="fas fa-music"></i> ' + t('audioFile') + '</label>' +
        '<div class="file-upload" onclick="document.getElementById(\'tf_audio\').click()"><i class="fas fa-cloud-upload-alt"></i><p>' + t('uploadAudio') + '</p><div class="file-name" id="tf_audio_name">' + audioLabel + '</div></div>' +
        '<input type="file" id="tf_audio" accept="audio/*" style="display:none">' +
        '</div>' +
        '</div>' +
        '<div class="modal-actions"><button type="submit" class="btn-primary" id="saveTrackBtn"><i class="fas fa-save"></i> ' + t('save') + '</button><button type="button" class="btn-secondary" onclick="closeModal()">' + t('cancel') + '</button></div></form>');

    document.getElementById('tf_audio').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        document.getElementById('tf_audio_name').textContent = file.name;
        const audio = new Audio(URL.createObjectURL(file));
        audio.addEventListener('loadedmetadata', function() {
            const duration = Math.round(audio.duration);
            const minutes = Math.floor(duration / 60);
            const seconds = duration % 60;
            document.getElementById('tf_duration').value = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            URL.revokeObjectURL(audio.src);
        });
    });

    document.getElementById('trackForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const saveBtn = document.getElementById('saveTrackBtn');
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + t('saving');
        var fd = new FormData();
        fd.append('title', document.getElementById('tf_title').value);
        fd.append('title_ar', document.getElementById('tf_title_ar').value);
        fd.append('title_en', document.getElementById('tf_title_en').value);
        fd.append('description', document.getElementById('tf_description').value);
        fd.append('artist_id', document.getElementById('tf_artist_id').value);
        fd.append('category_id', document.getElementById('tf_category_id').value);
        fd.append('duration_str', document.getElementById('tf_duration').value);
        var audioFile = document.getElementById('tf_audio').files[0];
        if (audioFile) fd.append('audio', audioFile);
        try {
            await api(API_BASE + '/tracks' + (id ? '/' + id : ''), { method: id ? 'PUT' : 'POST', body: fd });
            closeModal(); refreshCurrentPage();
            showToast(t('tracks') + ' ' + t('saved'), 'success');
        } catch (err) { showToast('Error: ' + err.message, 'error'); } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fas fa-save"></i> ' + t('save');
        }
    });
}

async function deleteTrack(id) {
    if (!confirm(t('delete') + ' ' + t('tracks') + '?')) return;
    try { await api(API_BASE + '/tracks/' + id, { method: 'DELETE' }); refreshCurrentPage(); showToast(t('tracks') + ' ' + t('deleted'), 'success'); }
    catch (err) { showToast('Error: ' + err.message, 'error'); }
}

// ===== VIDEOS =====
async function loadVideos() {
    showLoading();
    try {
        var videos = await api(API_BASE + '/videos');
        var html = '<div class="toolbar"><div class="toolbar-left"><button class="btn-primary" onclick="showVideoForm()"><i class="fas fa-plus"></i> ' + t('addVideo') + '</button><input type="text" class="search-input" id="videoSearch" placeholder="' + t('searchVideos') + '" onkeyup="filterVideoTable()"></div></div>';
        html += '<div class="table-wrapper"><table class="data-table" id="videoTable"><thead><tr><th>' + t('thumbnail') + '</th><th>' + t('title') + '</th><th>' + t('author') + '</th><th>' + t('duration') + '</th><th>' + t('views') + '</th><th style="width:100px">' + t('actions') + '</th></tr></thead><tbody id="videoBody">';
        if (videos.length === 0) {
            html += '<tr><td colspan="6" class="td-muted" style="text-align:center">' + t('noVideos') + '</td></tr>';
        } else {
            for (var i = 0; i < videos.length; i++) {
                var v = videos[i];
                var desc = v.description ? '<br><span class="td-muted">' + esc(v.description.substring(0, 50)) + (v.description.length > 50 ? '...' : '') + '</span>' : '';
                var viewBtn = v.video_url ? '<button class="action-btn view" onclick="window.open(\'' + v.video_url + '\')" title="' + t('view') + '"><i class="fas fa-eye"></i></button>' : '';
                var videoFrame = v.video_url
                    ? '<div class="video-preview" onclick="window.open(\'' + v.video_url + '\')"><video preload="metadata" muted playsinline src="' + v.video_url + '" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'"></video><div class="play-overlay"><i class="fas fa-play"></i></div><img src="../Images/logo2.png" class="img-preview" style="display:none" alt=""></div>'
                    : '<div class="video-preview"><img src="' + getMediaUrl(v.thumbnail_url || '../Images/logo2.png') + '" class="img-preview" alt=""></div>';
                html += '<tr data-search="' + esc((v.title + ' ' + (v.author || '')).toLowerCase()) + '"><td>' + videoFrame + '</td>' +
                    '<td><strong>' + esc(v.title) + '</strong>' + desc + '</td>' +
                    '<td>' + (v.author || '<span class="td-muted">--</span>') + '</td>' +
                    '<td>' + (v.duration_str || '00:00') + '</td>' +
                    '<td>' + (v.views_count || 0) + '</td>' +
                    '<td><div class="action-group">' + viewBtn +
                    '<button class="action-btn edit" onclick="showVideoForm(' + v.id + ')" title="' + t('edit') + '"><i class="fas fa-edit"></i></button>' +
                    '<button class="action-btn delete" onclick="deleteVideo(' + v.id + ')" title="' + t('delete') + '"><i class="fas fa-trash"></i></button></div></td></tr>';
            }
        }
        html += '</tbody></table></div>';
        document.getElementById('contentBody').innerHTML = html;
    } catch (err) { showError('Error: ' + err.message); }
}

function filterVideoTable() {
    var q = document.getElementById('videoSearch').value.toLowerCase();
    document.querySelectorAll('#videoBody tr').forEach(function(r) {
        r.style.display = r.getAttribute('data-search').includes(q) ? '' : 'none';
    });
}

async function showVideoForm(id) {
    var video = { title: '', title_ar: '', title_en: '', author: '', author_ar: '', author_en: '', description: '', video_url: '', thumbnail_url: '' };
    if (id) { video = await api(API_BASE + '/videos/' + id); }
    var videoLabel = video.video_url ? 'Current: ' + video.video_url.split('/').pop() : '';
    var thumbLabel = video.thumbnail_url ? 'Current: ' + video.thumbnail_url.split('/').pop() : '';
    showModal('' +
        '<h3><i class="fas ' + (id ? 'fa-edit' : 'fa-plus') + '"></i> ' + (id ? t('editVideo') : t('addVideo')) + '</h3>' +
        '<form id="videoForm"><div class="form-grid">' +
        '<div class="form-group"><label><i class="fas fa-heading"></i> ' + t('title') + ' *</label><input type="text" id="vf_title" value="' + esc(video.title) + '" required placeholder="' + t('title') + '"></div>' +
        '<div class="form-group"><label><i class="fas fa-language"></i> ' + t('title') + ' (Ar)</label><input type="text" id="vf_title_ar" value="' + esc(video.title_ar || '') + '" placeholder="' + t('title') + ' (Ar)"></div>' +
        '<div class="form-group"><label><i class="fas fa-user"></i> ' + t('author') + '</label><input type="text" id="vf_author" value="' + esc(video.author || '') + '" placeholder="' + t('author') + '"></div>' +
        '<div class="form-group"><label><i class="fas fa-globe"></i> ' + t('title') + ' (En)</label><input type="text" id="vf_title_en" value="' + esc(video.title_en || '') + '" placeholder="' + t('title') + ' (En)"></div>' +
        '<div class="form-group full-width"><label><i class="fas fa-align-left"></i> ' + t('descriptionLabel') + '</label><textarea id="vf_description" placeholder="' + t('descriptionLabel') + '...">' + esc(video.description || '') + '</textarea></div>' +
        '<div class="form-group full-width"><label><i class="fas fa-video"></i> ' + t('videoFile') + '</label>' +
        '<div class="file-upload" onclick="document.getElementById(\'vf_video\').click()"><i class="fas fa-cloud-upload-alt"></i><p>' + t('uploadVideo') + '</p><div class="file-name" id="vf_video_name">' + videoLabel + '</div></div>' +
        '<input type="file" id="vf_video" accept="video/*" style="display:none" onchange="document.getElementById(\'vf_video_name\').textContent = this.files[0]?.name || \'\'">' +
        '</div><div class="form-group full-width"><label><i class="fas fa-image"></i> ' + t('thumbnail') + '</label>' +
        '<div class="file-upload" onclick="document.getElementById(\'vf_thumbnail\').click()"><i class="fas fa-cloud-upload-alt"></i><p>' + t('uploadThumbnail') + '</p><div class="file-name" id="vf_thumbnail_name">' + thumbLabel + '</div></div>' +
        '<input type="file" id="vf_thumbnail" accept="image/*" style="display:none" onchange="document.getElementById(\'vf_thumbnail_name\').textContent = this.files[0]?.name || \'\'">' +
        '</div></div>' +
        '<div class="modal-actions"><button type="submit" class="btn-primary" id="saveVideoBtn"><i class="fas fa-save"></i> ' + t('save') + '</button><button type="button" class="btn-secondary" onclick="closeModal()">' + t('cancel') + '</button></div></form>');
    document.getElementById('videoForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const saveBtn = document.getElementById('saveVideoBtn');
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + t('saving');
        var fd = new FormData();
        fd.append('title', document.getElementById('vf_title').value);
        fd.append('title_ar', document.getElementById('vf_title_ar').value);
        fd.append('title_en', document.getElementById('vf_title_en').value);
        fd.append('author', document.getElementById('vf_author').value);
        fd.append('description', document.getElementById('vf_description').value);
        var vFile = document.getElementById('vf_video').files[0];
        if (vFile) fd.append('video', vFile);
        var tFile = document.getElementById('vf_thumbnail').files[0];
        if (tFile) fd.append('thumbnail', tFile);
        try {
            await api(API_BASE + '/videos' + (id ? '/' + id : ''), { method: id ? 'PUT' : 'POST', body: fd });
            closeModal(); loadVideos();
            showToast(t('videoSaved'), 'success');
        } catch (err) { showToast('Error: ' + err.message, 'error'); } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fas fa-save"></i> ' + t('save');
        }
    });
}

async function deleteVideo(id) {
    if (!confirm(t('confirmDeleteVideo'))) return;
    try { await api(API_BASE + '/videos/' + id, { method: 'DELETE' }); loadVideos(); showToast(t('videoDeleted'), 'success'); }
    catch (err) { showToast('Error: ' + err.message, 'error'); }
}

// ===== ADHKAR =====
async function loadAdhkar() {
    showLoading();
    try {
        var adhkar = await api(API_BASE + '/adhkar');
        var html = '<div class="toolbar"><div class="toolbar-left"><button class="btn-primary" onclick="showAdhkarForm()"><i class="fas fa-plus"></i> ' + t('addAdhkar') + '</button><input type="text" class="search-input" id="adhkarSearch" placeholder="' + t('searchAdhkar') + '" onkeyup="filterAdhkarTable()"></div></div>';
        html += '<div class="table-wrapper"><table class="data-table" id="adhkarTable"><thead><tr><th>' + t('arabic') + '</th><th>' + t('name') + '</th><th>' + t('translation') + '</th><th>' + t('count') + '</th><th>' + t('category') + '</th><th style="width:100px">' + t('actions') + '</th></tr></thead><tbody id="adhkarBody">';
        if (adhkar.length === 0) {
            html += '<tr><td colspan="6" class="td-muted" style="text-align:center">' + t('noAdhkar') + '</td></tr>';
        } else {
            for (var i = 0; i < adhkar.length; i++) {
                var a = adhkar[i];
                html += '<tr data-search="' + esc((a.arabic_text + ' ' + (a.transliteration || '') + ' ' + (a.translation_en || a.translation_rw || '')).toLowerCase()) + '">' +
                    '<td style="font-size:1.2rem;font-family:Amiri,serif">' + esc(a.arabic_text) + '</td>' +
                    '<td class="td-muted">' + esc(a.transliteration || '-') + '</td>' +
                    '<td>' + esc(a.translation_en || a.translation_rw || '-') + '</td>' +
                    '<td>' + (a.count_target || 33) + '</td>' +
                    '<td><span class="badge">' + t(a.category || 'general') + '</span></td>' +
                    '<td><div class="action-group"><button class="action-btn edit" onclick="showAdhkarForm(' + a.id + ')" title="' + t('edit') + '"><i class="fas fa-edit"></i></button>' +
                    '<button class="action-btn delete" onclick="deleteAdhkar(' + a.id + ')" title="' + t('delete') + '"><i class="fas fa-trash"></i></button></div></td></tr>';
            }
        }
        html += '</tbody></table></div>';
        document.getElementById('contentBody').innerHTML = html;
    } catch (err) { showError('Error: ' + err.message); }
}

function filterAdhkarTable() {
    var q = document.getElementById('adhkarSearch').value.toLowerCase();
    document.querySelectorAll('#adhkarBody tr').forEach(function(r) {
        r.style.display = r.getAttribute('data-search').includes(q) ? '' : 'none';
    });
}

async function showAdhkarForm(id) {
    var adhkar = { arabic_text: '', transliteration: '', translation_rw: '', translation_en: '', count_target: 33, category: 'general', reference: '' };
    if (id) { adhkar = await api(API_BASE + '/adhkar/' + id); }
    showModal('' +
        '<h3><i class="fas ' + (id ? 'fa-edit' : 'fa-plus') + '"></i> ' + (id ? t('editAdhkar') : t('addAdhkar')) + '</h3>' +
        '<form id="adhkarForm"><div class="form-grid">' +
        '<div class="form-group full-width"><label><i class="fas fa-language"></i> ' + t('arabicText') + ' *</label><textarea id="af_arabic" required placeholder="' + t('arabicText') + '">' + esc(adhkar.arabic_text || '') + '</textarea></div>' +
        '<div class="form-group full-width"><label><i class="fas fa-globe"></i> ' + t('name') + '</label><input type="text" id="af_trans" value="' + esc(adhkar.transliteration || '') + '" placeholder="Subhanallah"></div>' +
        '<div class="form-group"><label><i class="fas fa-globe"></i> ' + t('translation') + ' (RW)</label><textarea id="af_rw" placeholder="Translation in Kinyarwanda">' + esc(adhkar.translation_rw || '') + '</textarea></div>' +
        '<div class="form-group"><label><i class="fas fa-globe"></i> ' + t('translation') + ' (EN)</label><textarea id="af_en" placeholder="Translation in English">' + esc(adhkar.translation_en || '') + '</textarea></div>' +
        '<div class="form-group"><label><i class="fas fa-sort-numeric-up-alt"></i> ' + t('count') + '</label><input type="number" id="af_count" value="' + (adhkar.count_target || 33) + '" min="1"></div>' +
        '<div class="form-group"><label><i class="fas fa-tag"></i> ' + t('category') + '</label><select id="af_category">' +
        '<option value="general"' + (adhkar.category === 'general' ? ' selected' : '') + '>' + t('general') + '</option>' +
        '<option value="morning"' + (adhkar.category === 'morning' ? ' selected' : '') + '>' + t('morning') + '</option>' +
        '<option value="evening"' + (adhkar.category === 'evening' ? ' selected' : '') + '>' + t('evening') + '</option>' +
        '<option value="sleep"' + (adhkar.category === 'sleep' ? ' selected' : '') + '>' + t('sleep') + '</option>' +
        '</select></div>' +
        '<div class="form-group full-width"><label><i class="fas fa-link"></i> ' + t('reference') + '</label><input type="text" id="af_ref" value="' + esc(adhkar.reference || '') + '" placeholder="Quran or Hadith reference"></div>' +
        '</div>' +
        '<div class="modal-actions"><button type="submit" class="btn-primary" id="saveAdhkarBtn"><i class="fas fa-save"></i> ' + t('save') + '</button><button type="button" class="btn-secondary" onclick="closeModal()">' + t('cancel') + '</button></div></form>');
    document.getElementById('adhkarForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const saveBtn = document.getElementById('saveAdhkarBtn');
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + t('saving');
        var body = {
            arabic_text: document.getElementById('af_arabic').value,
            transliteration: document.getElementById('af_trans').value,
            translation_rw: document.getElementById('af_rw').value,
            translation_en: document.getElementById('af_en').value,
            count_target: parseInt(document.getElementById('af_count').value) || 33,
            category: document.getElementById('af_category').value,
            reference: document.getElementById('af_ref').value
        };
        try {
            await api(API_BASE + '/adhkar' + (id ? '/' + id : ''), { method: id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            closeModal(); loadAdhkar();
            showToast(t('adhkarSaved'), 'success');
        } catch (err) { showToast('Error: ' + err.message, 'error'); } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fas fa-save"></i> ' + t('save');
        }
    });
}

async function deleteAdhkar(id) {
    if (!confirm(t('confirmDeleteAdhkar'))) return;
    try { await api(API_BASE + '/adhkar/' + id, { method: 'DELETE' }); loadAdhkar(); showToast(t('adhkarDeleted'), 'success'); }
    catch (err) { showToast('Error: ' + err.message, 'error'); }
}

// ===== QURAN =====
async function loadQuran() {
    showLoading();
    try {
        var surahs = await api(API_BASE + '/quran/surahs');
        var html = '<div class="toolbar"><div class="toolbar-left"><input type="text" class="search-input" id="surahSearch" placeholder="' + t('search') + '" onkeyup="filterSurahTable()"></div></div>';
        html += '<div class="table-wrapper"><table class="data-table"><thead><tr><th>#</th><th>' + t('name') + '</th><th>' + t('arabic') + '</th><th>' + t('verses') + '</th><th>' + t('type') + '</th><th>' + t('audio') + '</th></tr></thead><tbody id="surahBody">';
        if (surahs.length === 0) {
            html += '<tr><td colspan="6" class="td-muted" style="text-align:center">' + t('noSurahs') + '</td></tr>';
        } else {
            for (var i = 0; i < surahs.length; i++) {
                var s = surahs[i];
                var hasAudio = s.audio_url ? '<button class="action-btn view" onclick="window.open(\'' + esc(s.audio_url) + '\')" title="' + t('play') + '"><i class="fas fa-play"></i></button>' : '';
                html += '<tr data-search="' + esc((s.name + ' ' + (s.name_arabic || '') + ' ' + s.surah_number).toLowerCase()) + '">' +
                    '<td class="td-muted">' + s.surah_number + '</td>' +
                    '<td><strong>' + esc(s.name) + '</strong></td>' +
                    '<td style="font-size:1.2rem;font-family:Amiri,serif">' + (s.name_arabic || '') + '</td>' +
                    '<td>' + (s.ayahs_count || 0) + '</td>' +
                    '<td><span class="badge">' + (s.revelation_type || '') + '</span></td>' +
                    '<td><div class="action-group" style="justify-content:center">' + hasAudio +
                    '<button class="action-btn upload-audio" onclick="uploadSurahAudio(' + s.surah_number + ')" title="' + t('uploadAudio') + '"><i class="fas fa-upload"></i></button></div></td></tr>';
            }
        }
        html += '</tbody></table></div>';
        document.getElementById('contentBody').innerHTML = html;
    } catch (err) { showError('Error: ' + err.message); }
}

function filterSurahTable() {
    var q = document.getElementById('surahSearch').value.toLowerCase();
    document.querySelectorAll('#surahBody tr').forEach(function(r) {
        r.style.display = r.getAttribute('data-search').includes(q) ? '' : 'none';
    });
}

function uploadSurahAudio(surahNumber) {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/*';
    input.onchange = async function() {
        if (!input.files[0]) return;
        var fd = new FormData();
        fd.append('audio', input.files[0]);
        try {
            var result = await api(API_BASE + '/quran/surahs/' + surahNumber + '/audio', { method: 'PUT', body: fd });
            showToast(t('surah') + ' ' + surahNumber + ' ' + t('saved'), 'success');
            loadQuran();
        } catch (err) { showToast('Error: ' + err.message, 'error'); }
    };
    input.click();
}

// ===== BOOKS =====
async function loadBooks() {
    showLoading();
    try {
        var books = await api(API_BASE + '/books');
        var html = '<div class="toolbar"><div class="toolbar-left"><button class="btn-primary" onclick="showBookForm()"><i class="fas fa-plus"></i> ' + t('addBook') + '</button><input type="text" class="search-input" id="bookSearch" placeholder="' + t('searchBooks') + '" onkeyup="filterBookTable()"></div></div>';
        html += '<div class="table-wrapper"><table class="data-table"><thead><tr><th>' + t('cover') + '</th><th>' + t('title') + '</th><th>' + t('author') + '</th><th>' + t('fileType') + '</th><th style="width:120px">' + t('actions') + '</th></tr></thead><tbody id="bookBody">';
        if (books.length === 0) {
            html += '<tr><td colspan="5" class="td-muted" style="text-align:center">' + t('noBooks') + '</td></tr>';
        } else {
            for (var i = 0; i < books.length; i++) {
                var b = books[i];
                var cover = getMediaUrl(b.image_url) || '../Images/logo2.png';
                var viewBtn = b.file_url ? '<button class="action-btn view" onclick="window.open(\'' + b.file_url + '\')" title="' + t('view') + '"><i class="fas fa-eye"></i></button>' : '';
                html += '<tr data-search="' + esc((b.title + ' ' + (b.author || '') + ' ' + (b.category || '')).toLowerCase()) + '"><td><img src="' + cover + '" class="img-preview" onerror="this.src=\'../Images/logo2.png\'"></td>' +
                    '<td><strong>' + esc(b.title) + '</strong></td>' +
                    '<td>' + (b.author || '<span class="td-muted">--</span>') + '</td>' +
                    '<td><span class="badge">' + (b.file_type || 'pdf') + '</span></td>' +
                    '<td><div class="action-group">' + viewBtn +
                    '<button class="action-btn edit" onclick="showBookForm(' + b.id + ')" title="' + t('edit') + '"><i class="fas fa-edit"></i></button>' +
                    '<button class="action-btn delete" onclick="deleteBook(' + b.id + ')" title="' + t('delete') + '"><i class="fas fa-trash"></i></button></div></td></tr>';
            }
        }
        html += '</tbody></table></div>';
        document.getElementById('contentBody').innerHTML = html;
    } catch (err) { showError('Error: ' + err.message); }
}

function filterBookTable() {
    var q = document.getElementById('bookSearch').value.toLowerCase();
    document.querySelectorAll('#bookBody tr').forEach(function(r) {
        r.style.display = r.getAttribute('data-search').includes(q) ? '' : 'none';
    });
}

async function showBookForm(id) {
    var book = { title: '', title_ar: '', title_en: '', author: '', author_ar: '', author_en: '', description: '', category: '', file_type: 'pdf', file_url: '', image_url: '' };
    if (id) { book = await api(API_BASE + '/books/' + id); }
    var fileLabel = book.file_url ? 'Current: ' + book.file_url.split('/').pop() : '';
    var imgLabel = book.image_url ? 'Current: ' + book.image_url.split('/').pop() : '';
    showModal('' +
        '<h3><i class="fas ' + (id ? 'fa-edit' : 'fa-plus') + '"></i> ' + (id ? t('editBook') : t('addBook')) + '</h3>' +
        '<form id="bookForm" enctype="multipart/form-data"><div class="form-grid">' +
        '<div class="form-group"><label><i class="fas fa-heading"></i> ' + t('title') + ' *</label><input type="text" id="bf_title" value="' + esc(book.title) + '" required></div>' +
        '<div class="form-group"><label><i class="fas fa-language"></i> ' + t('title') + ' (Ar)</label><input type="text" id="bf_title_ar" value="' + esc(book.title_ar || '') + '"></div>' +
        '<div class="form-group"><label><i class="fas fa-user"></i> ' + t('author') + '</label><input type="text" id="bf_author" value="' + esc(book.author || '') + '"></div>' +
        '<div class="form-group"><label><i class="fas fa-globe"></i> ' + t('title') + ' (En)</label><input type="text" id="bf_title_en" value="' + esc(book.title_en || '') + '"></div>' +
        '<div class="form-group"><label><i class="fas fa-tag"></i> ' + t('category') + '</label><input type="text" id="bf_category" value="' + esc(book.category || '') + '"></div>' +
        '<div class="form-group"><label><i class="fas fa-file"></i> ' + t('fileType') + '</label>' +
        '<select id="bf_file_type"><option value="pdf"' + (book.file_type === 'pdf' ? ' selected' : '') + '>PDF</option><option value="text"' + (book.file_type === 'text' ? ' selected' : '') + '>Text</option><option value="docx"' + (book.file_type === 'docx' ? ' selected' : '') + '>DOCX</option></select>' +
        '</div><div class="form-group full-width"><label><i class="fas fa-align-left"></i> ' + t('descriptionLabel') + '</label><textarea id="bf_description">' + esc(book.description || '') + '</textarea></div>' +
        '<div class="form-group full-width"><label><i class="fas fa-upload"></i> ' + t('file') + '</label>' +
        '<div class="file-upload" onclick="document.getElementById(\'bf_file\').click()"><i class="fas fa-cloud-upload-alt"></i><p>' + t('clickToUpload') + '</p><div class="file-name" id="bf_file_name">' + fileLabel + '</div></div>' +
        '<input type="file" id="bf_file" style="display:none" onchange="document.getElementById(\'bf_file_name\').textContent = this.files[0]?.name || \'\'">' +
        '</div><div class="form-group full-width"><label><i class="fas fa-image"></i> ' + t('coverImage') + '</label>' +
        '<div class="file-upload" onclick="document.getElementById(\'bf_image\').click()"><i class="fas fa-cloud-upload-alt"></i><p>' + t('clickToUpload') + '</p><div class="file-name" id="bf_image_name">' + imgLabel + '</div></div>' +
        '<input type="file" id="bf_image" accept="image/*" style="display:none" onchange="document.getElementById(\'bf_image_name\').textContent = this.files[0]?.name || \'\'">' +
        '</div>' +
        '</div>' +
        '<div class="modal-actions"><button type="submit" class="btn-primary" id="saveBookBtn"><i class="fas fa-save"></i> ' + t('save') + '</button><button type="button" class="btn-secondary" onclick="closeModal()">' + t('cancel') + '</button></div></form>');
    document.getElementById('bookForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const saveBtn = document.getElementById('saveBookBtn');
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + t('saving');
        var fd = new FormData();
        fd.append('title', document.getElementById('bf_title').value);
        fd.append('title_ar', document.getElementById('bf_title_ar').value);
        fd.append('title_en', document.getElementById('bf_title_en').value);
        fd.append('author', document.getElementById('bf_author').value);
        fd.append('description', document.getElementById('bf_description').value);
        fd.append('category', document.getElementById('bf_category').value);
        fd.append('file_type', document.getElementById('bf_file_type').value);
        var fFile = document.getElementById('bf_file').files[0];
        if (fFile) fd.append('file', fFile);
        var iFile = document.getElementById('bf_image').files[0];
        if (iFile) fd.append('image', iFile);
        try {
            await api(API_BASE + '/books' + (id ? '/' + id : ''), { method: id ? 'PUT' : 'POST', body: fd });
            closeModal(); loadBooks();
            showToast(t('bookSaved'), 'success');
        } catch (err) { showToast('Error: ' + err.message, 'error'); } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fas fa-save"></i> ' + t('save');
        }
    });
}

async function deleteBook(id) {
    if (!confirm(t('confirmDeleteBook'))) return;
    try { await api(API_BASE + '/books/' + id, { method: 'DELETE' }); loadBooks(); showToast(t('bookDeleted'), 'success'); }
    catch (err) { showToast('Error: ' + err.message, 'error'); }
}

// ===== CATEGORIES =====
async function loadCategories() {
    showLoading();
    try {
        var cats = await api(API_BASE + '/categories');
        var html = '<div class="toolbar"><div class="toolbar-left"><button class="btn-primary" onclick="showCategoryForm()"><i class="fas fa-plus"></i> ' + t('addCategory') + '</button><input type="text" class="search-input" id="catSearch" placeholder="' + t('search') + '" onkeyup="filterCatTable()"></div></div>';
        html += '<div class="table-wrapper"><table class="data-table"><thead><tr><th>' + t('name') + '</th><th>' + t('name') + ' (Ar)</th><th>' + t('name') + ' (En)</th><th>' + t('slug') + '</th><th>' + t('tracks') + '</th><th style="width:100px">' + t('actions') + '</th></tr></thead><tbody id="catBody">';
        if (cats.length === 0) {
            html += '<tr><td colspan="6" class="td-muted" style="text-align:center">' + t('noCategories') + '</td></tr>';
        } else {
            for (var i = 0; i < cats.length; i++) {
                var c = cats[i];
                html += '<tr data-search="' + esc((c.name + ' ' + (c.name_en || '') + ' ' + (c.name_ar || '') + ' ' + c.slug).toLowerCase()) + '">' +
                    '<td>' + esc(c.name) + '</td><td style="font-size:1.1rem">' + (c.name_ar || '-') + '</td><td>' + (c.name_en || '-') + '</td>' +
                    '<td><code class="slug-badge">' + esc(c.slug) + '</code></td><td>' + (c.total_tracks || 0) + '</td>' +
                    '<td><div class="action-group"><button class="action-btn edit" onclick="showCategoryForm(' + c.id + ')" title="' + t('edit') + '"><i class="fas fa-edit"></i></button>' +
                    '<button class="action-btn delete" onclick="deleteCategory(' + c.id + ')" title="' + t('delete') + '"><i class="fas fa-trash"></i></button></div></td></tr>';
            }
        }
        html += '</tbody></table></div>';
        document.getElementById('contentBody').innerHTML = html;
    } catch (err) { showError('Error loading categories: ' + err.message); }
}

function filterCatTable() {
    var q = document.getElementById('catSearch').value.toLowerCase();
    document.querySelectorAll('#catBody tr').forEach(function(r) {
        r.style.display = r.getAttribute('data-search').includes(q) ? '' : 'none';
    });
}

async function showCategoryForm(id) {
    var cat = { name: '', name_ar: '', name_en: '', slug: '', description: '', icon: '', sort_order: 0 };
    if (id) { cat = await api(API_BASE + '/categories/' + id); }
    showModal('' +
        '<h3><i class="fas ' + (id ? 'fa-edit' : 'fa-plus') + '"></i> ' + (id ? t('editCategory') : t('addCategory')) + '</h3>' +
        '<form id="catForm"><div class="form-grid">' +
        '<div class="form-group"><label><i class="fas fa-heading"></i> ' + t('name') + ' *</label><input type="text" id="cf_name" value="' + esc(cat.name) + '" required></div>' +
        '<div class="form-group"><label><i class="fas fa-link"></i> ' + t('slug') + ' *</label><input type="text" id="cf_slug" value="' + esc(cat.slug) + '" required></div>' +
        '<div class="form-group"><label><i class="fas fa-language"></i> ' + t('name') + ' (Ar)</label><input type="text" id="cf_name_ar" value="' + esc(cat.name_ar || '') + '"></div>' +
        '<div class="form-group"><label><i class="fas fa-globe"></i> ' + t('name') + ' (En)</label><input type="text" id="cf_name_en" value="' + esc(cat.name_en || '') + '"></div>' +
        '<div class="form-group"><label><i class="fas fa-tag"></i> ' + t('icon') + '</label><input type="text" id="cf_icon" value="' + esc(cat.icon || '') + '" placeholder="fas fa-book"></div>' +
        '<div class="form-group"><label><i class="fas fa-sort-numeric-up-alt"></i> ' + t('sortOrder') + '</label><input type="number" id="cf_sort" value="' + (cat.sort_order || 0) + '"></div>' +
        '<div class="form-group full-width"><label><i class="fas fa-align-left"></i> ' + t('descriptionLabel') + '</label><textarea id="cf_desc">' + esc(cat.description || '') + '</textarea></div>' +
        '</div>' +
        '<div class="modal-actions"><button type="submit" class="btn-primary" id="saveCatBtn"><i class="fas fa-save"></i> ' + t('save') + '</button><button type="button" class="btn-secondary" onclick="closeModal()">' + t('cancel') + '</button></div></form>');
    document.getElementById('catForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const btn = document.getElementById('saveCatBtn');
        btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + t('saving');
        try {
            var body = {
                name: document.getElementById('cf_name').value,
                slug: document.getElementById('cf_slug').value,
                name_ar: document.getElementById('cf_name_ar').value,
                name_en: document.getElementById('cf_name_en').value,
                icon: document.getElementById('cf_icon').value,
                sort_order: parseInt(document.getElementById('cf_sort').value) || 0,
                description: document.getElementById('cf_desc').value
            };
            await api(API_BASE + '/categories' + (id ? '/' + id : ''), {
                method: id ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            closeModal(); loadCategories();
            showToast(t('category') + ' ' + t('saved'), 'success');
        } catch (err) { showToast('Error: ' + err.message, 'error'); } finally {
            btn.disabled = false; btn.innerHTML = '<i class="fas fa-save"></i> ' + t('save');
        }
    });
}

async function deleteCategory(id) {
    if (!confirm(t('confirmDeleteCategory'))) return;
    try { await api(API_BASE + '/categories/' + id, { method: 'DELETE' }); loadCategories(); showToast(t('category') + ' ' + t('deleted'), 'success'); }
    catch (err) { showToast('Error: ' + err.message, 'error'); }
}

// ===== SETTINGS =====
function loadSettings() {
    document.getElementById('contentBody').innerHTML = '' +
        '<div class="settings-card">' +
        '<h3><i class="fas fa-info-circle"></i> ' + t('apiConfig') + '</h3>' +
        '<div class="form-group"><label>' + t('apiConfig') + '</label><input type="text" id="settingsApiUrl" value="' + API_BASE + '" class="form-input" readonly></div>' +
        '<p class="td-muted">' + t('apiConfig') + ' — <code>admin/admin.js</code></p>' +
        '</div>' +
        '<div class="settings-card">' +
        '<h3><i class="fas fa-server"></i> ' + t('serverStatus') + '</h3>' +
        '<div class="status-row"><span>Backend Server</span><span class="status-dot" id="serverStatus">' + t('checkConn') + '...</span></div>' +
        '<button class="btn-primary" onclick="checkServer()" style="margin-top:12px"><i class="fas fa-sync-alt"></i> ' + t('checkConn') + '</button>' +
        '<div id="serverResult" style="margin-top:10px"></div>' +
        '</div>' +
        '<div class="settings-card">' +
        '<h3><i class="fas fa-database"></i> ' + t('systemInfo') + '</h3>' +
        '<div class="info-row"><span>' + t('appVersion') + '</span><span class="td-muted">1.0.0</span></div>' +
        '<div class="info-row"><span>' + t('adminPanel') + '</span><span class="td-muted">' + t('noLoginRequired') + '</span></div>' +
        '</div>';
    checkServer();
}

async function checkServer() {
    var el = document.getElementById('serverStatus');
    var result = document.getElementById('serverResult');
    if (el) el.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> ' + t('checkConn') + '...';
    try {
        var data = await api(API_BASE + '/health');
        if (el) { el.innerHTML = '<span style="color:var(--success)"><i class="fas fa-check-circle"></i> ' + t('online') + '</span>'; }
        if (result) result.innerHTML = '<div class="toast toast-success">' + t('online') + '</div>';
    } catch (err) {
        if (el) { el.innerHTML = '<span style="color:var(--error)"><i class="fas fa-times-circle"></i> ' + t('offline') + '</span>'; }
        if (result) result.innerHTML = '<div class="toast toast-error">' + t('offline') + ': ' + err.message + '</div>';
    }
}

function esc(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
