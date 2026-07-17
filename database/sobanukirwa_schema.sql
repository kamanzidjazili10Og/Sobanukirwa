-- ============================================================
-- Sobanukirwa - Complete MySQL Database Schema
-- Version 1.0
-- ============================================================

CREATE DATABASE IF NOT EXISTS sobanukirwa
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE sobanukirwa;

-- ============================================================
-- USERS / ADMIN TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) DEFAULT NULL,
    role ENUM('admin', 'editor', 'viewer') DEFAULT 'admin',
    avatar_url VARCHAR(500) DEFAULT NULL,
    is_active TINYINT(1) DEFAULT 1,
    last_login DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default admin: admin / admin123 (bcrypt hash)
INSERT IGNORE INTO users (username, email, password_hash, full_name, role) VALUES
('admin', 'admin@sobanukirwa.com', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGmHgm5LM6CqBiCJXvHde', 'Administrator', 'admin');

-- ============================================================
-- CATEGORIES (for audio tracks)
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100) DEFAULT NULL,
    name_en VARCHAR(100) DEFAULT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT DEFAULT NULL,
    icon VARCHAR(50) DEFAULT NULL,
    sort_order INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO categories (name, name_ar, name_en, slug, sort_order) VALUES
('Tauhid', 'التوحيد', 'Tawheed', 'tauhid', 1),
('Fiqih', 'الفقه', 'Fiqh', 'fiqih', 2),
('Sirah', 'السيرة', 'Seerah', 'sirah', 3),
('Khutubah', 'الخطب', 'Khutbah', 'khutubah', 4),
('Akhlaq', 'الأخلاق', 'Akhlaq', 'akhlaq', 5),
('Adhkar', 'الأذكار', 'Adhkar', 'adhkar', 6);

-- ============================================================
-- ARTISTS (Teachers / Speakers)
-- ============================================================
CREATE TABLE IF NOT EXISTS artists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    name_ar VARCHAR(200) DEFAULT NULL,
    name_en VARCHAR(200) DEFAULT NULL,
    bio TEXT DEFAULT NULL,
    image_url VARCHAR(500) DEFAULT NULL,
    total_lessons INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO artists (name, name_ar, name_en, image_url) VALUES
('Sheikh Uqash', 'الشيخ عقاش', 'Sheikh Uqash', 'Images/usi6.jpg'),
('Sheikh Mutabaruka Uthman', 'الشيخ موتاباروكا', 'Sheikh Mutabaruka', 'Images/usi5.jpg'),
('Sheikh Muhamad Sulaiman', 'الشيخ محمد سليمان', 'Sheikh Muhamad Sulaiman', 'Images/usi4.jpg'),
('Sheikh Gahutu', 'الشيخ غاهوتو', 'Sheikh Gahutu', 'Images/usi3.jpg'),
('Sheikh Djamidu', 'الشيخ جميدو', 'Sheikh Djamidu', 'Images/usi2.jpg'),
('Sheikh Uwamungu', 'الشيخ أومونغو', 'Sheikh Uwamungu', 'Images/usi1.jpg');

-- ============================================================
-- AUDIO TRACKS
-- ============================================================
CREATE TABLE IF NOT EXISTS tracks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    artist_id INT NOT NULL,
    category_id INT DEFAULT NULL,
    title VARCHAR(300) NOT NULL,
    title_ar VARCHAR(300) DEFAULT NULL,
    title_en VARCHAR(300) DEFAULT NULL,
    audio_url VARCHAR(500) NOT NULL,
    description TEXT DEFAULT NULL,
    duration INT DEFAULT 0 COMMENT 'Duration in seconds',
    duration_str VARCHAR(10) DEFAULT '00:00',
    file_size BIGINT DEFAULT 0,
    plays_count INT DEFAULT 0,
    downloads_count INT DEFAULT 0,
    is_featured TINYINT(1) DEFAULT 0,
    sort_order INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- VIDEOS
-- ============================================================
CREATE TABLE IF NOT EXISTS videos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    title_ar VARCHAR(300) DEFAULT NULL,
    title_en VARCHAR(300) DEFAULT NULL,
    author VARCHAR(200) DEFAULT NULL,
    author_ar VARCHAR(200) DEFAULT NULL,
    author_en VARCHAR(200) DEFAULT NULL,
    description TEXT DEFAULT NULL,
    thumbnail_url VARCHAR(500) DEFAULT NULL,
    video_url VARCHAR(500) NOT NULL,
    duration INT DEFAULT 0 COMMENT 'Duration in seconds',
    duration_str VARCHAR(10) DEFAULT NULL,
    file_size BIGINT DEFAULT 0,
    views_count INT DEFAULT 0,
    is_featured TINYINT(1) DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- BOOKS / DOCUMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    title_ar VARCHAR(300) DEFAULT NULL,
    title_en VARCHAR(300) DEFAULT NULL,
    author VARCHAR(200) DEFAULT NULL,
    author_ar VARCHAR(200) DEFAULT NULL,
    author_en VARCHAR(200) DEFAULT NULL,
    description TEXT DEFAULT NULL,
    image_url VARCHAR(500) DEFAULT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_type ENUM('pdf', 'text', 'docx') DEFAULT 'pdf',
    category VARCHAR(100) DEFAULT NULL,
    pages_count INT DEFAULT 0,
    downloads_count INT DEFAULT 0,
    is_featured TINYINT(1) DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- QURAN SURAHS
-- ============================================================
CREATE TABLE IF NOT EXISTS quran_surahs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    surah_number INT NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    name_arabic VARCHAR(100) NOT NULL,
    ayahs_count INT DEFAULT 0,
    revelation_type ENUM('Makkah', 'Madani') DEFAULT 'Makkah',
    audio_url VARCHAR(500) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO quran_surahs (surah_number, name, name_arabic, ayahs_count, revelation_type, audio_url) VALUES
(1, 'Al-Fatiha', 'الفاتحة', 7, 'Makkah', 'https://server7.mp3quran.net/ahmed/001.mp3'),
(2, 'Al-Baqarah', 'البقرة', 286, 'Madani', 'https://server7.mp3quran.net/ahmed/002.mp3'),
(3, 'Ali Imran', 'آل عمران', 200, 'Madani', 'https://server7.mp3quran.net/ahmed/003.mp3'),
(4, 'An-Nisa', 'النساء', 176, 'Madani', 'https://server7.mp3quran.net/ahmed/004.mp3'),
(5, 'Al-Maidah', 'المائدة', 120, 'Madani', 'https://server7.mp3quran.net/ahmed/005.mp3'),
(6, 'Al-Anam', 'الأنعام', 165, 'Makkah', 'https://server7.mp3quran.net/ahmed/006.mp3'),
(7, 'Al-Araf', 'الأعراف', 206, 'Makkah', 'https://server7.mp3quran.net/ahmed/007.mp3'),
(8, 'Al-Anfal', 'الأنفال', 75, 'Madani', 'https://server7.mp3quran.net/ahmed/008.mp3'),
(9, 'At-Tawbah', 'التوبة', 129, 'Madani', 'https://server7.mp3quran.net/ahmed/009.mp3'),
(10, 'Yunus', 'يونس', 109, 'Makkah', 'https://server7.mp3quran.net/ahmed/010.mp3'),
(11, 'Hud', 'هود', 123, 'Makkah', 'https://server7.mp3quran.net/ahmed/011.mp3'),
(12, 'Yusuf', 'يوسف', 111, 'Makkah', 'https://server7.mp3quran.net/ahmed/012.mp3'),
(13, 'Ar-Rad', 'الرعد', 43, 'Madani', 'https://server7.mp3quran.net/ahmed/013.mp3'),
(14, 'Ibrahim', 'إبراهيم', 52, 'Makkah', 'https://server7.mp3quran.net/ahmed/014.mp3'),
(15, 'Al-Hijr', 'الحجر', 99, 'Makkah', 'https://server7.mp3quran.net/ahmed/015.mp3'),
(16, 'An-Nahl', 'النحل', 128, 'Makkah', 'https://server7.mp3quran.net/ahmed/016.mp3'),
(17, 'Al-Isra', 'الإسراء', 111, 'Makkah', 'https://server7.mp3quran.net/ahmed/017.mp3'),
(18, 'Al-Kahf', 'الكهف', 110, 'Makkah', 'https://server7.mp3quran.net/ahmed/018.mp3'),
(19, 'Maryam', 'مريم', 98, 'Makkah', 'https://server7.mp3quran.net/ahmed/019.mp3'),
(20, 'Taha', 'طه', 135, 'Makkah', 'https://server7.mp3quran.net/ahmed/020.mp3'),
(21, 'Al-Anbya', 'الأنبياء', 112, 'Makkah', 'https://server7.mp3quran.net/ahmed/021.mp3'),
(22, 'Al-Hajj', 'الحج', 78, 'Madani', 'https://server7.mp3quran.net/ahmed/022.mp3'),
(23, 'Al-Muminun', 'المؤمنون', 118, 'Makkah', 'https://server7.mp3quran.net/ahmed/023.mp3'),
(24, 'An-Nur', 'النور', 64, 'Madani', 'https://server7.mp3quran.net/ahmed/024.mp3'),
(25, 'Al-Furqan', 'الفرقان', 77, 'Makkah', 'https://server7.mp3quran.net/ahmed/025.mp3'),
(26, 'Ash-Shuara', 'الشعراء', 227, 'Makkah', 'https://server7.mp3quran.net/ahmed/026.mp3'),
(27, 'An-Naml', 'النمل', 93, 'Makkah', 'https://server7.mp3quran.net/ahmed/027.mp3'),
(28, 'Al-Qasas', 'القصص', 88, 'Makkah', 'https://server7.mp3quran.net/ahmed/028.mp3'),
(29, 'Al-Ankabut', 'العنكبوت', 69, 'Makkah', 'https://server7.mp3quran.net/ahmed/029.mp3'),
(30, 'Ar-Rum', 'الروم', 60, 'Makkah', 'https://server7.mp3quran.net/ahmed/030.mp3'),
(31, 'Luqman', 'لقمان', 34, 'Makkah', 'https://server7.mp3quran.net/ahmed/031.mp3'),
(32, 'As-Sajdah', 'السجدة', 30, 'Makkah', 'https://server7.mp3quran.net/ahmed/032.mp3'),
(33, 'Al-Ahzab', 'الأحزاب', 73, 'Madani', 'https://server7.mp3quran.net/ahmed/033.mp3'),
(34, 'Saba', 'سبأ', 54, 'Makkah', 'https://server7.mp3quran.net/ahmed/034.mp3'),
(35, 'Fatir', 'فاطر', 45, 'Makkah', 'https://server7.mp3quran.net/ahmed/035.mp3'),
(36, 'Ya-Sin', 'يس', 83, 'Makkah', 'https://server7.mp3quran.net/ahmed/036.mp3'),
(37, 'As-Saffat', 'الصافات', 182, 'Makkah', 'https://server7.mp3quran.net/ahmed/037.mp3'),
(38, 'Sad', 'ص', 88, 'Makkah', 'https://server7.mp3quran.net/ahmed/038.mp3'),
(39, 'Az-Zumar', 'الزمر', 75, 'Makkah', 'https://server7.mp3quran.net/ahmed/039.mp3'),
(40, 'Ghafir', 'غافر', 85, 'Makkah', 'https://server7.mp3quran.net/ahmed/040.mp3'),
(41, 'Fussilat', 'فصلت', 54, 'Makkah', 'https://server7.mp3quran.net/ahmed/041.mp3'),
(42, 'Ash-Shura', 'الشورى', 53, 'Makkah', 'https://server7.mp3quran.net/ahmed/042.mp3'),
(43, 'Az-Zukhruf', 'الزخرف', 89, 'Makkah', 'https://server7.mp3quran.net/ahmed/043.mp3'),
(44, 'Ad-Dukhan', 'الدخان', 59, 'Makkah', 'https://server7.mp3quran.net/ahmed/044.mp3'),
(45, 'Al-Jathiyah', 'الجاثية', 37, 'Makkah', 'https://server7.mp3quran.net/ahmed/045.mp3'),
(46, 'Al-Ahqaf', 'الأحقاف', 35, 'Makkah', 'https://server7.mp3quran.net/ahmed/046.mp3'),
(47, 'Muhammad', 'محمد', 38, 'Madani', 'https://server7.mp3quran.net/ahmed/047.mp3'),
(48, 'Al-Fath', 'الفتح', 29, 'Madani', 'https://server7.mp3quran.net/ahmed/048.mp3'),
(49, 'Al-Hujurat', 'الحجرات', 18, 'Madani', 'https://server7.mp3quran.net/ahmed/049.mp3'),
(50, 'Qaf', 'ق', 45, 'Makkah', 'https://server7.mp3quran.net/ahmed/050.mp3'),
(51, 'Adh-Dhariyat', 'الذاريات', 60, 'Makkah', 'https://server7.mp3quran.net/ahmed/051.mp3'),
(52, 'At-Tur', 'الطور', 49, 'Makkah', 'https://server7.mp3quran.net/ahmed/052.mp3'),
(53, 'An-Najm', 'النجم', 62, 'Makkah', 'https://server7.mp3quran.net/ahmed/053.mp3'),
(54, 'Al-Qamar', 'القمر', 55, 'Makkah', 'https://server7.mp3quran.net/ahmed/054.mp3'),
(55, 'Ar-Rahman', 'الرحمن', 78, 'Madani', 'https://server7.mp3quran.net/ahmed/055.mp3'),
(56, 'Al-Waqiah', 'الواقعة', 96, 'Makkah', 'https://server7.mp3quran.net/ahmed/056.mp3'),
(57, 'Al-Hadid', 'الحديد', 29, 'Madani', 'https://server7.mp3quran.net/ahmed/057.mp3'),
(58, 'Al-Mujadila', 'المجادلة', 22, 'Madani', 'https://server7.mp3quran.net/ahmed/058.mp3'),
(59, 'Al-Hashr', 'الحشر', 24, 'Madani', 'https://server7.mp3quran.net/ahmed/059.mp3'),
(60, 'Al-Mumtahanah', 'الممتحنة', 13, 'Madani', 'https://server7.mp3quran.net/ahmed/060.mp3'),
(61, 'As-Saf', 'الصف', 14, 'Madani', 'https://server7.mp3quran.net/ahmed/061.mp3'),
(62, 'Al-Jumuah', 'الجمعة', 11, 'Madani', 'https://server7.mp3quran.net/ahmed/062.mp3'),
(63, 'Al-Munafiqun', 'المنافقون', 11, 'Madani', 'https://server7.mp3quran.net/ahmed/063.mp3'),
(64, 'At-Taghabun', 'التغابن', 18, 'Madani', 'https://server7.mp3quran.net/ahmed/064.mp3'),
(65, 'At-Talaq', 'الطلاق', 12, 'Madani', 'https://server7.mp3quran.net/ahmed/065.mp3'),
(66, 'At-Tahrim', 'التحريم', 12, 'Madani', 'https://server7.mp3quran.net/ahmed/066.mp3'),
(67, 'Al-Mulk', 'الملك', 30, 'Makkah', 'https://server7.mp3quran.net/ahmed/067.mp3'),
(68, 'Al-Qalam', 'القلم', 52, 'Makkah', 'https://server7.mp3quran.net/ahmed/068.mp3'),
(69, 'Al-Haqqah', 'الحاقة', 52, 'Makkah', 'https://server7.mp3quran.net/ahmed/069.mp3'),
(70, 'Al-Maarij', 'المعارج', 44, 'Makkah', 'https://server7.mp3quran.net/ahmed/070.mp3'),
(71, 'Nuh', 'نوح', 28, 'Makkah', 'https://server7.mp3quran.net/ahmed/071.mp3'),
(72, 'Al-Jinn', 'الجن', 28, 'Makkah', 'https://server7.mp3quran.net/ahmed/072.mp3'),
(73, 'Al-Muzzammil', 'المزمل', 20, 'Makkah', 'https://server7.mp3quran.net/ahmed/073.mp3'),
(74, 'Al-Muddaththir', 'المدثر', 56, 'Makkah', 'https://server7.mp3quran.net/ahmed/074.mp3'),
(75, 'Al-Qiyamah', 'القيامة', 40, 'Makkah', 'https://server7.mp3quran.net/ahmed/075.mp3'),
(76, 'Al-Insan', 'الإنسان', 31, 'Madani', 'https://server7.mp3quran.net/ahmed/076.mp3'),
(77, 'Al-Mursalat', 'المرسلات', 50, 'Makkah', 'https://server7.mp3quran.net/ahmed/077.mp3'),
(78, 'An-Naba', 'النبأ', 40, 'Makkah', 'https://server7.mp3quran.net/ahmed/078.mp3'),
(79, 'An-Naziat', 'النازعات', 46, 'Makkah', 'https://server7.mp3quran.net/ahmed/079.mp3'),
(80, 'Abasa', 'عبس', 42, 'Makkah', 'https://server7.mp3quran.net/ahmed/080.mp3'),
(81, 'At-Takwir', 'التكوير', 29, 'Makkah', 'https://server7.mp3quran.net/ahmed/081.mp3'),
(82, 'Al-Infitar', 'الإنفطار', 19, 'Makkah', 'https://server7.mp3quran.net/ahmed/082.mp3'),
(83, 'Al-Mutaffifin', 'المطففين', 36, 'Makkah', 'https://server7.mp3quran.net/ahmed/083.mp3'),
(84, 'Al-Inshiqaq', 'الإنشقاق', 25, 'Makkah', 'https://server7.mp3quran.net/ahmed/084.mp3'),
(85, 'Al-Buruj', 'البروج', 22, 'Makkah', 'https://server7.mp3quran.net/ahmed/085.mp3'),
(86, 'At-Tariq', 'الطارق', 17, 'Makkah', 'https://server7.mp3quran.net/ahmed/086.mp3'),
(87, 'Al-Ala', 'الأعلى', 19, 'Makkah', 'https://server7.mp3quran.net/ahmed/087.mp3'),
(88, 'Al-Ghashiyah', 'الغاشية', 26, 'Makkah', 'https://server7.mp3quran.net/ahmed/088.mp3'),
(89, 'Al-Fajr', 'الفجر', 30, 'Makkah', 'https://server7.mp3quran.net/ahmed/089.mp3'),
(90, 'Al-Balad', 'البلد', 20, 'Makkah', 'https://server7.mp3quran.net/ahmed/090.mp3'),
(91, 'Ash-Shams', 'الشمس', 15, 'Makkah', 'https://server7.mp3quran.net/ahmed/091.mp3'),
(92, 'Al-Layl', 'الليل', 21, 'Makkah', 'https://server7.mp3quran.net/ahmed/092.mp3'),
(93, 'Ad-Duhaa', 'الضحى', 11, 'Makkah', 'https://server7.mp3quran.net/ahmed/093.mp3'),
(94, 'Ash-Sharh', 'الشرح', 8, 'Makkah', 'https://server7.mp3quran.net/ahmed/094.mp3'),
(95, 'At-Tin', 'التين', 8, 'Makkah', 'https://server7.mp3quran.net/ahmed/095.mp3'),
(96, 'Al-Alaq', 'العلق', 19, 'Makkah', 'https://server7.mp3quran.net/ahmed/096.mp3'),
(97, 'Al-Qadr', 'القدر', 5, 'Makkah', 'https://server7.mp3quran.net/ahmed/097.mp3'),
(98, 'Al-Bayyinah', 'البينة', 8, 'Madani', 'https://server7.mp3quran.net/ahmed/098.mp3'),
(99, 'Az-Zalzalah', 'الزلزلة', 8, 'Madani', 'https://server7.mp3quran.net/ahmed/099.mp3'),
(100, 'Al-Adiyat', 'العاديات', 11, 'Makkah', 'https://server7.mp3quran.net/ahmed/100.mp3'),
(101, 'Al-Qariah', 'القارعة', 11, 'Makkah', 'https://server7.mp3quran.net/ahmed/101.mp3'),
(102, 'At-Takathur', 'التكاثر', 8, 'Makkah', 'https://server7.mp3quran.net/ahmed/102.mp3'),
(103, 'Al-Asr', 'العصر', 3, 'Makkah', 'https://server7.mp3quran.net/ahmed/103.mp3'),
(104, 'Al-Humazah', 'الهمزة', 9, 'Makkah', 'https://server7.mp3quran.net/ahmed/104.mp3'),
(105, 'Al-Fil', 'الفيل', 5, 'Makkah', 'https://server7.mp3quran.net/ahmed/105.mp3'),
(106, 'Quraysh', 'قريش', 4, 'Makkah', 'https://server7.mp3quran.net/ahmed/106.mp3'),
(107, 'Al-Maun', 'الماعون', 7, 'Makkah', 'https://server7.mp3quran.net/ahmed/107.mp3'),
(108, 'Al-Kawthar', 'الكوثر', 3, 'Makkah', 'https://server7.mp3quran.net/ahmed/108.mp3'),
(109, 'Al-Kafirun', 'الكافرون', 6, 'Makkah', 'https://server7.mp3quran.net/ahmed/109.mp3'),
(110, 'An-Nasr', 'النصر', 3, 'Madani', 'https://server7.mp3quran.net/ahmed/110.mp3'),
(111, 'Al-Masad', 'المسد', 5, 'Makkah', 'https://server7.mp3quran.net/ahmed/111.mp3'),
(112, 'Al-Ikhlas', 'الإخلاص', 4, 'Makkah', 'https://server7.mp3quran.net/ahmed/112.mp3'),
(113, 'Al-Falaq', 'الفلق', 5, 'Makkah', 'https://server7.mp3quran.net/ahmed/113.mp3'),
(114, 'An-Nas', 'الناس', 6, 'Makkah', 'https://server7.mp3quran.net/ahmed/114.mp3');

-- ============================================================
-- PLAY HISTORY (for tracking listens/views)
-- ============================================================
CREATE TABLE IF NOT EXISTS play_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL,
    track_id INT DEFAULT NULL,
    video_id INT DEFAULT NULL,
    played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE SET NULL,
    FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SETTINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT DEFAULT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO settings (setting_key, setting_value) VALUES
('site_name', 'Sobanukirwa'),
('default_language', 'rw'),
('adhan_enabled', 'true'),
('prayer_calculation_method', '3');

-- ============================================================
-- ADHKAR (Remembrances)
-- ============================================================
CREATE TABLE IF NOT EXISTS adhkar (
    id INT AUTO_INCREMENT PRIMARY KEY,
    arabic_text VARCHAR(500) NOT NULL,
    transliteration VARCHAR(300) DEFAULT NULL,
    translation_rw VARCHAR(500) DEFAULT NULL,
    translation_en VARCHAR(500) DEFAULT NULL,
    translation_ar VARCHAR(500) DEFAULT NULL,
    count_target INT DEFAULT 33 COMMENT 'Recommended repetition count',
    category VARCHAR(100) DEFAULT 'general' COMMENT 'morning, evening, general, sleep, etc.',
    audio_url VARCHAR(500) DEFAULT NULL,
    reference VARCHAR(300) DEFAULT NULL COMMENT 'Source reference (e.g. Quran, Hadith)',
    sort_order INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO adhkar (arabic_text, transliteration, translation_rw, translation_en, count_target, category, sort_order) VALUES
('سُبْحَانَ اللَّهِ', 'Subhanallah', 'Ibyubahiro ni ibya Allah', 'Glory be to Allah', 33, 'general', 1),
('الْحَمْدُ لِلَّهِ', 'Alhamdulillah', 'Ishimwe n''ikuzo ni ibya Allah', 'Praise be to Allah', 33, 'general', 2),
('اللَّهُ أَكْبَرُ', 'Allahu Akbar', 'Allah ni Umukuru w''ikirenga', 'Allah is the Greatest', 34, 'general', 3),
('لَا إِلَٰهَ إِلَّا اللَّهُ', 'La ilaha illallah', 'Nta mana iri isobok uretse Allah', 'There is no god but Allah', 10, 'general', 4),
('أَسْتَغْفِرُ اللَّهَ', 'Astaghfirullah', 'Nsaba imbabazi kwa Allah', 'I seek forgiveness from Allah', 10, 'general', 5),
('سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', 'Subhanallahi wa bihamdihi', 'Ibyubahiro n''ishimwe ni ibya Allah', 'Glory and praise be to Allah', 100, 'morning', 6),
('لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ', 'La ilaha illallahu wahdahu la sharika lah', 'Nta mana iri isobok uretse Allah wenyine, ntawo umufatanyije', 'There is no god but Allah alone, He has no partner', 10, 'morning', 7);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_tracks_artist ON tracks(artist_id);
CREATE INDEX idx_tracks_category ON tracks(category_id);
CREATE INDEX idx_tracks_featured ON tracks(is_featured);
CREATE INDEX idx_videos_featured ON videos(is_featured);
CREATE INDEX idx_books_category ON books(category);
CREATE INDEX idx_play_history_date ON play_history(played_at);
CREATE INDEX idx_quran_surah_number ON quran_surahs(surah_number);
