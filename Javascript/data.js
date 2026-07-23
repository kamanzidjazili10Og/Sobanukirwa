// ===== FALLBACK DATA (used when API is unavailable) =====

const fallbackTracks = [
  { id: 1, title: "Al-Fatiha (Sample)", titleEn: "Al-Fatiha (Sample)", titleAr: "الفاتحة (نموذج)", audioUrl: "https://server7.mp3quran.net/ahmed/001.mp3", category: "Quran", artist: "Ahmed Al-Ajmi", duration: "01:30" },
  { id: 2, title: "Ayat Al-Kursi (Sample)", titleEn: "Ayat Al-Kursi (Sample)", titleAr: "آية الكرسي (نموذج)", audioUrl: "https://server7.mp3quran.net/ahmed/002.mp3", category: "Quran", artist: "Ahmed Al-Ajmi", duration: "01:45" },
  { id: 3, title: "Ar-Rahman (Sample)", titleEn: "Ar-Rahman (Sample)", titleAr: "الرحمن (نموذج)", audioUrl: "https://server7.mp3quran.net/ahmed/055.mp3", category: "Quran", artist: "Ahmed Al-Ajmi", duration: "08:30" },
  { id: 4, title: "Al-Waqiah (Sample)", titleEn: "Al-Waqiah (Sample)", titleAr: "الواقعة (نموذج)", audioUrl: "https://server7.mp3quran.net/ahmed/056.mp3", category: "Quran", artist: "Ahmed Al-Ajmi", duration: "06:15" },
  { id: 5, title: "Al-Mulk (Sample)", titleEn: "Al-Mulk (Sample)", titleAr: "الملك (نموذج)", audioUrl: "https://server7.mp3quran.net/ahmed/067.mp3", category: "Quran", artist: "Ahmed Al-Ajmi", duration: "07:20" },
  { id: 6, title: "Ya-Sin (Sample)", titleEn: "Ya-Sin (Sample)", titleAr: "يس (نموذج)", audioUrl: "https://server7.mp3quran.net/ahmed/036.mp3", category: "Quran", artist: "Ahmed Al-Ajmi", duration: "10:00" },
  { id: 7, title: "Adhkar (Sample)", titleEn: "Adhkar (Sample)", titleAr: "الأذكار (نموذج)", audioUrl: "audio/Subhanallah.m4a", category: "Adhkar", artist: "Sobanukirwa", duration: "05:00" },
  { id: 8, title: "Dhikr (Sample)", titleEn: "Dhikr (Sample)", titleAr: "الذكر (نموذج)", audioUrl: "audio/Subhanallah Alhamdulillah Wa La ilaha IlAllah (Dhikr).m4a", category: "Adhkar", artist: "Sobanukirwa", duration: "04:30" },
  { id: 101, title: "Isomo rya Tauhid - Part 1", titleEn: "Lesson of Tawheed - Part 1", titleAr: "درس التوحيد - الجزء الأول", audioUrl: "audio/Tauhid/Isomo rya Tauhid.aac", category: "Tauhid", artist: "Sheikh Uqash", duration: "42:15" },
  { id: 102, title: "Isomo rya Tauhid - Part 2", titleEn: "Lesson of Tawheed - Part 2", titleAr: "درس التوحيد - الجزء الثاني", audioUrl: "audio/Tauhid/Isomo rya Tauhid part2.m4a", category: "Tauhid", artist: "Sheikh Uqash", duration: "38:42" },
  { id: 103, title: "Isomo rya Tauhid - Final", titleEn: "Lesson of Tawheed - Final", titleAr: "درس التوحيد - الجزء الثالث", audioUrl: "audio/Tauhid/Isomo rya Tauhid part3.m4a", category: "Tauhid", artist: "Sheikh Uqash", duration: "45:08" },
  { id: 104, title: "Kwemera ndetse no kuzirikana Allah", titleEn: "Belief and Remembrance of Allah", titleAr: "الإيمان وذكر الله", audioUrl: "audio/Tauhid/Kwemera ndetse no kuzirikana  Allah.m4a", category: "Tauhid", artist: "Sheikh Uqash", duration: "31:20" },
  { id: 105, title: "Kwemera Igitabo", titleEn: "Belief in the Book", titleAr: "الإيمان بالكتاب", audioUrl: "audio/Tauhid/Kwemera igitabo by oqash.m4a", category: "Tauhid", artist: "Sheikh Uqash", duration: "28:55" },
  { id: 106, title: "Kwemera umunsi w'imperuka", titleEn: "Belief in the Last Day", titleAr: "الإيمان باليوم الآخر", audioUrl: "audio/Tauhid/Kwemera umunsi w'imperuka.aac", category: "Tauhid", artist: "Sheikh Uqash", duration: "35:10" },
  { id: 107, title: "Gusobanutsirwa kurusha ukundi kose - Part 1", titleEn: "The Greatest Explanation - Part 1", titleAr: "أعظم شرح - الجزء الأول", audioUrl: "audio/Tauhid/Gusobanutsirwa kurusha ukundi kose.m4a", category: "Tauhid", artist: "Sheikh Uqash", duration: "48:30" },
  { id: 108, title: "Gusobanutsirwa kurusha ukundi kose - Part 2", titleEn: "The Greatest Explanation - Part 2", titleAr: "أعظم شرح - الجزء الثاني", audioUrl: "audio/Tauhid/Gusobanutsirwa kurusha ukundi kose part2.m4a", category: "Tauhid", artist: "Sheikh Uqash", duration: "52:15" },
  { id: 109, title: "Gusobanutsirwa kurusha ukundi kose - Part 3", titleEn: "The Greatest Explanation - Part 3", titleAr: "أعظم شرح - الجزء الثالث", audioUrl: "audio/Tauhid/Gusobanutsirwa kurusha ukundi kose part3.m4a", category: "Tauhid", artist: "Sheikh Uqash", duration: "44:08" },
  { id: 110, title: "Gusobanutsirwa kurusha ukundi kose - Final", titleEn: "The Greatest Explanation - Final", titleAr: "أعظم شرح - الجزء الأخير", audioUrl: "audio/Tauhid/Gusobanutsirwa kurusha ukundi kose Final.m4a", category: "Tauhid", artist: "Sheikh Uqash", duration: "37:42" },
  { id: 201, title: "Amateka ya Aboubakar", titleEn: "Story of Abu Bakr", titleAr: "قصة أبي بكر", audioUrl: "audio/Sirah/Icyamatse ku mibereho ndetse n'imibanire y'intumwa y'imana Muhamad (S.A.W).aac", category: "Sirah", artist: "Sheikh Gahutu", duration: "33:50" },
  { id: 202, title: "Amateka ya Zaid bun Thabit", titleEn: "Story of Zaid ibn Thabit", titleAr: "قصة زيد بن ثابت", audioUrl: "audio/Sirah/Iherezo ry'imibanire nabanyamuryango itajyiriro.m4a", category: "Sirah", artist: "Sheikh Gahutu", duration: "29:10" },
  { id: 203, title: "Amateka ya Said ibn Zaid", titleEn: "Story of Sa'id ibn Zayd", titleAr: "قصة سعيد بن زيد", audioUrl: "audio/Sirah/Kurejyera mu busabe.aac", category: "Sirah", artist: "Sheikh Gahutu", duration: "41:22" },
  { id: 204, title: "Ukwihangana", titleEn: "Patience", titleAr: "الصبر", audioUrl: "audio/Sirah/Uko intumwa y'imana yabaniraga abane be part2.m4a", category: "Akhlaq", artist: "Sheikh Gahutu", duration: "26:45" },
  { id: 301, title: "Usuulu thalathat - Isomo rya Mbere", titleEn: "Usul al-Thalathah - Lesson 1", titleAr: "الأصول الثلاثة - الدرس الأول", audioUrl: "audio/Al Usuulu Thalathat/Usulu thalathat Isomo rya mbere.mp3", category: "Tauhid", artist: "Sheikh Djamidu", duration: "36:18" },
  { id: 302, title: "Usuulu thalathat - Isomo rya Kabiri", titleEn: "Usul al-Thalathah - Lesson 2", titleAr: "الأصول الثلاثة - الدرس الثاني", audioUrl: "audio/Al Usuulu Thalathat/Usulu thalathat isomo rya kabiri.mp3", category: "Tauhid", artist: "Sheikh Djamidu", duration: "42:05" },
  { id: 303, title: "Usuulu thalathat - Isomo rya Gatatu", titleEn: "Usul al-Thalathah - Lesson 3", titleAr: "الأصول الثلاثة - الدرس الثالث", audioUrl: "audio/Al Usuulu Thalathat/Usuulu thalathat isomo rya gatatu.m4a", category: "Tauhid", artist: "Sheikh Djamidu", duration: "38:30" },
  { id: 304, title: "Usuulu thalathat - Isomo rya Kane", titleEn: "Usul al-Thalathah - Lesson 4", titleAr: "الأصول الثلاثة - الدرس الرابع", audioUrl: "audio/Al Usuulu Thalathat/Usuulu thalathat isomo rya Kane.mp3", category: "Tauhid", artist: "Sheikh Djamidu", duration: "44:12" },
  { id: 305, title: "Usuulu thalathat - Isomo rya Gatanu", titleEn: "Usul al-Thalathah - Lesson 5", titleAr: "الأصول الثلاثة - الدرس الخامس", audioUrl: "audio/Al Usuulu Thalathat/Usuulu thalathat Isomo rya Gatanu.m4a", category: "Tauhid", artist: "Sheikh Djamidu", duration: "41:50" },
  { id: 306, title: "Usuulu thalathat - Isomo rya Gatandatu", titleEn: "Usul al-Thalathah - Lesson 6", titleAr: "الأصول الثلاثة - الدرس السادس", audioUrl: "audio/Al Usuulu Thalathat/Usuulu thalathat isomo rya Gatandatu.m4a", category: "Tauhid", artist: "Sheikh Djamidu", duration: "37:25" },
  { id: 307, title: "Usuulu thalathat - Isomo rya Karirwi", titleEn: "Usul al-Thalathah - Lesson 7", titleAr: "الأصول الثلاثة - الدرس السابع", audioUrl: "audio/Al Usuulu Thalathat/Usuulu thalathat isomo rya Karindwi.mp3", category: "Tauhid", artist: "Sheikh Djamidu", duration: "46:38" },
  { id: 308, title: "Usuulu thalathat - Isomo rya Munani", titleEn: "Usul al-Thalathah - Lesson 8", titleAr: "الأصول الثلاثة - الدرس الثامن", audioUrl: "audio/Al Usuulu Thalathat/Usuulu thatalathat isomo rya Munani.m4a", category: "Tauhid", artist: "Sheikh Djamidu", duration: "33:15" },
  { id: 309, title: "Usuulu thalathat - Isomo rya Cyenda", titleEn: "Usul al-Thalathah - Lesson 9", titleAr: "الأصول الثلاثة - الدرس التاسع", audioUrl: "audio/Al Usuulu Thalathat/Usuulu thalathat isomo rya Cyenda.m4a", category: "Tauhid", artist: "Sheikh Djamidu", duration: "39:48" },
  { id: 310, title: "Usuulu thalathat - Isomo rya Cumi", titleEn: "Usul al-Thalathah - Lesson 10", titleAr: "الأصول الثلاثة - الدرس العاشر", audioUrl: "audio/Al Usuulu Thalathat/Usuulu thalathat isomo rya cumi.m4a", category: "Tauhid", artist: "Sheikh Djamidu", duration: "43:02" },
  { id: 401, title: "Amateka y'intumwa y'imana Muhamad (S.A.W) part 1", titleEn: "Story of Prophet Muhammad (S.A.W) part 1", titleAr: "قصة النبي محمد - الجزء الأول", audioUrl: "audio/Sirah/Amateka y'intumwa y'imana Muhamad (S.A.W) part.aac", category: "Sirah", artist: "Sheikh Mutabaruka", duration: "34:12" },
  { id: 402, title: "Amateka y'intumwa y'imana Muhamad (S.A.W) part 2", titleEn: "Story of Prophet Muhammad (S.A.W) part 2", titleAr: "قصة النبي محمد - الجزء الثاني", audioUrl: "audio/Sirah/Amateka y'intumwa y'imana Muhamad (S.A.W) part-2.aac", category: "Sirah", artist: "Sheikh Mutabaruka", duration: "28:45" },
  { id: 403, title: "Amateka y'intumwa y'imana Muhamad (S.A.W) part 4", titleEn: "Story of Prophet Muhammad (S.A.W) part 4", titleAr: "قصة النبي محمد - الجزء الرابع", audioUrl: "audio/Sirah/Amateka y'intumwa y'imana Muhamad (S.A.W) part - 4.aac", category: "Sirah", artist: "Sheikh Mutabaruka", duration: "31:30" },
  { id: 404, title: "Amateka y'intumwa y'imana Muhamad (S.A.W) part 5", titleEn: "Story of Prophet Muhammad (S.A.W) part 5", titleAr: "قصة النبي محمد - الجزء الخامس", audioUrl: "audio/Sirah/Amateka y'intumwa y'imana Muhamad (S.A.W) part -5.aac", category: "Sirah", artist: "Sheikh Mutabaruka", duration: "36:18" },
  { id: 405, title: "Athikar zikorwa mugitondo na nimugoroba", titleEn: "Morning and Evening Adhkar", titleAr: "أذكار الصباح والمساء", audioUrl: "audio/Sirah/Amateka y'intumwa y'imana Muhamad (S.A.W) part -6.aac", category: "Adhkar", artist: "Sheikh Mutabaruka", duration: "22:40" },
  { id: 406, title: "Athikar zikorwa umuntu ajyiye kuryama", titleEn: "Bedtime Adhkar", titleAr: "أذكار النوم", audioUrl: "audio/Sirah/Amateka y'intumwa y'imana Muhamad (S.A.W) part - 8.aac", category: "Adhkar", artist: "Sheikh Mutabaruka", duration: "18:55" },
  { id: 501, title: "Icyamatse mu gusobanutsirwa amazina ya Allah", titleEn: "Understanding Allah's Names", titleAr: "شرح أسماء الله", audioUrl: "audio/Tauhid/Isomo rya Tauhid.aac", category: "Tauhid", artist: "Sheikh Muhamad Sulaiman", duration: "47:22" },
  { id: 502, title: "Izina ALLAHU", titleEn: "The Name Allah", titleAr: "اسم الله", audioUrl: "audio/Tauhid/Isomo rya Tauhid part2.m4a", category: "Tauhid", artist: "Sheikh Muhamad Sulaiman", duration: "38:15" },
  { id: 503, title: "Inabi Wifuriza Abandi Irakugarukira", titleEn: "Evil Wished Upon Others Returns", titleAr: "الشر الذي تتمناه للغير يعود عليك", audioUrl: "audio/Tauhid/Isomo rya Tauhid.aac", category: "Akhlaq", artist: "Sheikh Uwamungu", duration: "25:30" },
  { id: 504, title: "Aya magambo akomeye", titleEn: "Important Words", titleAr: "كلمات مهمة", audioUrl: "audio/Tauhid/Isomo rya Tauhid part2.m4a", category: "Akhlaq", artist: "Sheikh Uwamungu", duration: "31:48" },
  { id: 505, title: "Haranira ko ubuzima bugoye", titleEn: "Strive Though Life is Hard", titleAr: "اجتهد ولو كانت الحياة صعبة", audioUrl: "audio/Tauhid/Isomo rya Tauhid part3.m4a", category: "Akhlaq", artist: "Sheikh Uwamungu", duration: "27:14" },
  { id: 601, title: "Khutbah ku wa Gatanu", titleEn: "Friday Khutbah", titleAr: "خطبة الجمعة", audioUrl: "audio/Khutubah/sample_khutbah.mp3", category: "Khutubah", artist: "Sheikh Mutabaruka", duration: "15:00" },
  { id: 701, title: "Urukundo mu Buvandimwe", titleEn: "Love and Brotherhood", titleAr: "الحب في الأخوة", audioUrl: "Videos/5.mp4", category: "Social", artist: "Various", duration: "00:17", image: "Images/ok10.jpg" },
  { id: 702, title: "Kwemera Imana", titleEn: "Belief in God", titleAr: "الإيمان بالله", audioUrl: "audio/Tauhid/Kwemera ndetse no kuzirikana  Allah.m4a", category: "Tauhid", artist: "Sheikh Uqash", duration: "00:30", image: "Images/ok11.jpg" }
];

const fallbackVideos = [
  { id: 1, title: "Amateka y'intumwa y'imana Muhamad (S.A.W)", titleEn: "The Story of Prophet Muhammad (PBUH)", titleAr: "قصة النبي محمد (ص)", videoUrl: "Videos/1.mp4", thumbnail: "Images/ok9.jpg" },
  { id: 2, title: "Inyigisho ku Kwihangana", titleEn: "Lesson on Patience", titleAr: "درس في الصبر", videoUrl: "Videos/2.mp4", thumbnail: "Images/ok10.jpg" },
  { id: 3, title: "Gusobanukirwa Icyo Kwemera Ari cyo", titleEn: "Understanding Faith", titleAr: "فهم الإيمان", videoUrl: "Videos/3.mp4", thumbnail: "Images/ok11.jpg" },
  { id: 4, title: "Uburyo bwo Gusenga", titleEn: "The Method of Prayer", titleAr: "كيفية الصلاة", videoUrl: "Videos/4.mp4", thumbnail: "Images/ok12.jpg" },
  { id: 5, title: "Urukundo mu Buvandimwe", titleEn: "Love and Brotherhood", titleAr: "الحب في الأخوة", videoUrl: "Videos/5.mp4", thumbnail: "Images/ok13.jpg" },
  { id: 6, title: "Inyigisho - Part 6", videoUrl: "Videos/6.mp4", thumbnail: "Images/logo2.png" },
  { id: 7, title: "Inyigisho - Part 7", videoUrl: "Videos/7.mp4", thumbnail: "Images/logo2.png" },
  { id: 8, title: "Inyigisho - Part 8", videoUrl: "Videos/8.mp4", thumbnail: "Images/logo2.png" },
  { id: 9, title: "Inyigisho - Part 9", videoUrl: "Videos/9.mp4", thumbnail: "Images/logo2.png" },
  { id: 10, title: "Inyigisho - Part 10", videoUrl: "Videos/10.mp4", thumbnail: "Images/logo2.png" },
  { id: 11, title: "INZOZI ZITANGAJE ZA IBN JAWZI", videoUrl: "Videos/INZOZI ZITANGAJE ZA IBN JAWZI.mp4", thumbnail: "Images/logo2.png" },
  { id: 12, title: "Imyigishirize - Sheikh Uthman Mutabaruka", videoUrl: "Videos/lv_0_20240411195650.mp4", thumbnail: "Images/logo2.png" },
  { id: 13, title: "Inyigisho - Sheikh Gahutu", videoUrl: "Videos/lv_0_20240518191511.mp4", thumbnail: "Images/logo2.png" },
  { id: 14, title: "Inyigisho - Sheikh Uwamungu", videoUrl: "Videos/lv_0_20240806153929.mp4", thumbnail: "Images/logo2.png" },
  { id: 15, title: "Kwerekeza mu buryo bwiza", videoUrl: "Videos/lv_0_20240809203410.mp4", thumbnail: "Images/logo2.png" },
  { id: 16, title: "Inyigisho - Sheikh Uqash", videoUrl: "Videos/lv_0_20240916181930.mp4", thumbnail: "Images/logo2.png" },
  { id: 17, title: "Inyigisho - Part 17", videoUrl: "Videos/lv_0_20241109092913.mp4", thumbnail: "Images/logo2.png" },
  { id: 18, title: "Inyigisho - Part 18", videoUrl: "Videos/lv_0_20241123220626.mp4", thumbnail: "Images/logo2.png" },
  { id: 19, title: "Inyigisho - Part 19", videoUrl: "Videos/lv_0_20241125101246.mp4", thumbnail: "Images/logo2.png" },
  { id: 20, title: "Inyigisho - Part 20", videoUrl: "Videos/lv_0_20250325162043.mp4", thumbnail: "Images/logo2.png" }
];

const fallbackSurahs = [];

for (let i = 1; i <= 114; i++) {
  const names = [
    [1, "Al-Fatiha", "الفاتحة", 7, "Makkah"], [2, "Al-Baqarah", "البقرة", 286, "Madani"], [3, "Ali Imran", "آل عمران", 200, "Madani"],
    [4, "An-Nisa", "النساء", 176, "Madani"], [5, "Al-Maidah", "المائدة", 120, "Madani"], [6, "Al-Anam", "الأنعام", 165, "Makkah"],
    [7, "Al-Araf", "الأعراف", 206, "Makkah"], [8, "Al-Anfal", "الأنفال", 75, "Madani"], [9, "At-Tawbah", "التوبة", 129, "Madani"],
    [10, "Yunus", "يونس", 109, "Makkah"], [11, "Hud", "هود", 123, "Makkah"], [12, "Yusuf", "يوسف", 111, "Makkah"],
    [13, "Ar-Rad", "الرعد", 43, "Madani"], [14, "Ibrahim", "إبراهيم", 52, "Makkah"], [15, "Al-Hijr", "الحجر", 99, "Makkah"],
    [16, "An-Nahl", "النحل", 128, "Makkah"], [17, "Al-Isra", "الإسراء", 111, "Makkah"], [18, "Al-Kahf", "الكهف", 110, "Makkah"],
    [19, "Maryam", "مريم", 98, "Makkah"], [20, "Taha", "طه", 135, "Makkah"], [21, "Al-Anbya", "الأنبياء", 112, "Makkah"],
    [22, "Al-Hajj", "الحج", 78, "Madani"], [23, "Al-Muminun", "المؤمنون", 118, "Makkah"], [24, "An-Nur", "النور", 64, "Madani"],
    [25, "Al-Furqan", "الفرقان", 77, "Makkah"], [26, "Ash-Shuara", "الشعراء", 227, "Makkah"], [27, "An-Naml", "النمل", 93, "Makkah"],
    [28, "Al-Qasas", "القصص", 88, "Makkah"], [29, "Al-Ankabut", "العنكبوت", 69, "Makkah"], [30, "Ar-Rum", "الروم", 60, "Makkah"],
    [31, "Luqman", "لقمان", 34, "Makkah"], [32, "As-Sajdah", "السجدة", 30, "Makkah"], [33, "Al-Ahzab", "الأحزاب", 73, "Madani"],
    [34, "Saba", "سبأ", 54, "Makkah"], [35, "Fatir", "فاطر", 45, "Makkah"], [36, "Ya-Sin", "يس", 83, "Makkah"],
    [37, "As-Saffat", "الصافات", 182, "Makkah"], [38, "Sad", "ص", 88, "Makkah"], [39, "Az-Zumar", "الزمر", 75, "Makkah"],
    [40, "Ghafir", "غافر", 85, "Makkah"], [41, "Fussilat", "فصلت", 54, "Makkah"], [42, "Ash-Shura", "الشورى", 53, "Makkah"],
    [43, "Az-Zukhruf", "الزخرف", 89, "Makkah"], [44, "Ad-Dukhan", "الدخان", 59, "Makkah"], [45, "Al-Jathiyah", "الجاثية", 37, "Makkah"],
    [46, "Al-Ahqaf", "الأحقاف", 35, "Makkah"], [47, "Muhammad", "محمد", 38, "Madani"], [48, "Al-Fath", "الفتح", 29, "Madani"],
    [49, "Al-Hujurat", "الحجرات", 18, "Madani"], [50, "Qaf", "ق", 45, "Makkah"], [51, "Adh-Dhariyat", "الذاريات", 60, "Makkah"],
    [52, "At-Tur", "الطور", 49, "Makkah"], [53, "An-Najm", "النجم", 62, "Makkah"], [54, "Al-Qamar", "القمر", 55, "Makkah"],
    [55, "Ar-Rahman", "الرحمن", 78, "Madani"], [56, "Al-Waqiah", "الواقعة", 96, "Makkah"], [57, "Al-Hadid", "الحديد", 29, "Madani"],
    [58, "Al-Mujadila", "المجادلة", 22, "Madani"], [59, "Al-Hashr", "الحشر", 24, "Madani"], [60, "Al-Mumtahanah", "الممتحنة", 13, "Madani"],
    [61, "As-Saf", "الصف", 14, "Madani"], [62, "Al-Jumuah", "الجمعة", 11, "Madani"], [63, "Al-Munafiqun", "المنافقون", 11, "Madani"],
    [64, "At-Taghabun", "التغابن", 18, "Madani"], [65, "At-Talaq", "الطلاق", 12, "Madani"], [66, "At-Tahrim", "التحريم", 12, "Madani"],
    [67, "Al-Mulk", "الملك", 30, "Makkah"], [68, "Al-Qalam", "القلم", 52, "Makkah"], [69, "Al-Haqqah", "الحاقة", 52, "Makkah"],
    [70, "Al-Maarij", "المعارج", 44, "Makkah"], [71, "Nuh", "نوح", 28, "Makkah"], [72, "Al-Jinn", "الجن", 28, "Makkah"],
    [73, "Al-Muzzammil", "المزمل", 20, "Makkah"], [74, "Al-Muddaththir", "المدثر", 56, "Makkah"], [75, "Al-Qiyamah", "القيامة", 40, "Makkah"],
    [76, "Al-Insan", "الإنسان", 31, "Madani"], [77, "Al-Mursalat", "المرسلات", 50, "Makkah"], [78, "An-Naba", "النبأ", 40, "Makkah"],
    [79, "An-Naziat", "النازعات", 46, "Makkah"], [80, "Abasa", "عبس", 42, "Makkah"], [81, "At-Takwir", "التكوير", 29, "Makkah"],
    [82, "Al-Infitar", "الإنفطار", 19, "Makkah"], [83, "Al-Mutaffifin", "المطففين", 36, "Makkah"], [84, "Al-Inshiqaq", "الإنشقاق", 25, "Makkah"],
    [85, "Al-Buruj", "البروج", 22, "Makkah"], [86, "At-Tariq", "الطارق", 17, "Makkah"], [87, "Al-Ala", "الأعلى", 19, "Makkah"],
    [88, "Al-Ghashiyah", "الغاشية", 26, "Makkah"], [89, "Al-Fajr", "الفجر", 30, "Makkah"], [90, "Al-Balad", "البلد", 20, "Makkah"],
    [91, "Ash-Shams", "الشمس", 15, "Makkah"], [92, "Al-Layl", "الليل", 21, "Makkah"], [93, "Ad-Duhaa", "الضحى", 11, "Makkah"],
    [94, "Ash-Sharh", "الشرح", 8, "Makkah"], [95, "At-Tin", "التين", 8, "Makkah"], [96, "Al-Alaq", "العلق", 19, "Makkah"],
    [97, "Al-Qadr", "القدر", 5, "Makkah"], [98, "Al-Bayyinah", "البينة", 8, "Madani"], [99, "Az-Zalzalah", "الزلزلة", 8, "Madani"],
    [100, "Al-Adiyat", "العاديات", 11, "Makkah"], [101, "Al-Qariah", "القارعة", 11, "Makkah"], [102, "At-Takathur", "التكاثر", 8, "Makkah"],
    [103, "Al-Asr", "العصر", 3, "Makkah"], [104, "Al-Humazah", "الهمزة", 9, "Makkah"], [105, "Al-Fil", "الفيل", 5, "Makkah"],
    [106, "Quraysh", "قريش", 4, "Makkah"], [107, "Al-Maun", "الماعون", 7, "Makkah"], [108, "Al-Kawthar", "الكوثر", 3, "Makkah"],
    [109, "Al-Kafirun", "الكافرون", 6, "Makkah"], [110, "An-Nasr", "النصر", 3, "Madani"], [111, "Al-Masad", "المسد", 5, "Makkah"],
    [112, "Al-Ikhlas", "الإخلاص", 4, "Makkah"], [113, "Al-Falaq", "الفلق", 5, "Makkah"], [114, "An-Nas", "الناس", 6, "Makkah"]
  ];
  const s = names[i-1];
  if (s) {
    fallbackSurahs.push({
      number: s[0], name: s[1], nameArabic: s[2], ayahs: s[3], type: s[4],
      audioUrl: `https://server7.mp3quran.net/ahmed/${String(s[0]).padStart(3,'0')}.mp3`
    });
  }
}

const fallbackBooks = [
  { id: 1, title: "Usul al-Thalathah", titleEn: "The Three Fundamentals", titleAr: "الأصول الثلاثة", author: "Sheikh Muhammad ibn Abdul Wahhab", authorEn: "Sheikh Muhammad ibn Abdul Wahhab", authorAr: "الشيخ محمد بن عبد الوهاب", image: "Images/logo2.png", pdfUrl: "", content: "", category: "Tauhid", type: "pdf", description: "A brief explanation of the three fundamental pillars of Islam." },
  { id: 2, title: "Al-Qawa'id al-Arba'", titleEn: "The Four Rules", titleAr: "القواعد الأربعة", author: "Sheikh Muhammad ibn Abdul Wahhab", authorEn: "Sheikh Muhammad ibn Abdul Wahhab", authorAr: "الشيخ محمد بن عبد الوهاب", image: "Images/logo2.png", pdfUrl: "", content: "", category: "Tauhid", type: "pdf", description: "Four rules that every Muslim must know about shirk and tawheed." },
  { id: 3, title: "Kitab al-Tawhid", titleEn: "The Book of Monotheism", titleAr: "كتاب التوحيد", author: "Sheikh Muhammad ibn Abdul Wahhab", authorEn: "Sheikh Muhammad ibn Abdul Wahhab", authorAr: "الشيخ محمد بن عبد الوهاب", image: "Images/logo2.png", pdfUrl: "", content: "", category: "Tauhid", type: "pdf", description: "The foundational book on Islamic monotheism." }
];

const fallbackAdhkar = [
  { arabic: "سُبْحَانَ اللَّهِ", transliteration: "Subhanallah", translation: "Ibyubahiro ni ibya Allah", count: 33, category: "general", audioFile: "audio/Subhanallah.m4a" },
  { arabic: "الْحَمْدُ لِلَّهِ", transliteration: "Alhamdulillah", translation: "Ishimwe n'ikuzo ni ibya Allah", count: 33, category: "general", audioFile: "audio/Subhanallah.m4a" },
  { arabic: "اللَّهُ أَكْبَرُ", transliteration: "Allahu Akbar", translation: "Allah ni Umukuru w'ikirenga", count: 34, category: "general", audioFile: "audio/Subhanallah.m4a" },
  { arabic: "لَا إِلَٰهَ إِلَّا اللَّهُ", transliteration: "La ilaha illallah", translation: "Nta mana iri isobok uretse Allah", count: 10, category: "general", audioFile: "audio/Subhanallah.m4a" },
  { arabic: "أَسْتَغْفِرُ اللَّهَ", transliteration: "Astaghfirullah", translation: "Nsaba imbabazi kwa Allah", count: 10, category: "general", audioFile: "audio/Subhanallah.m4a" },
  { arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", transliteration: "Subhanallahi wa bihamdihi", translation: "Ibyubahiro n'ishimwe ni ibya Allah", count: 100, category: "morning", audioFile: "audio/Subhanallah.m4a" },
  { arabic: "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ", transliteration: "La ilaha illallahu wahdahu la sharika lah", translation: "Nta mana iri isobok uretse Allah wenyine, ntawo umufatanyije", count: 10, category: "morning", audioFile: "audio/Subhanallah.m4a" },
  { arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ", transliteration: "Subhanallahi wa bihamdihi, Subhanallahil Azeem", translation: "Ibyubahiro n'ishimwe ni ibya Allah, ibyubahiro ni ibya Allah, Ukomeye", count: 10, category: "general", audioFile: "audio/Subhanallah.m4a" },
  { arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ", transliteration: "La hawla wa la quwwata illa billah", translation: "Nta mbaraga n'imbaraga uretse Allah", count: 10, category: "general", audioFile: "audio/Subhanallah.m4a" },
  { arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", transliteration: "Bismillahir Rahmanir Rahim", translation: "Mu izina rya Allah, Nyirimpuhwe, Nyirimbabazi", count: 7, category: "general", audioFile: "audio/Subhanallah.m4a" },
  { arabic: "اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ", transliteration: "Allahumma salli ala Muhammad", translation: "Allah uheshe imigisha intumwa Muhamad", count: 10, category: "general", audioFile: "audio/Subhanallah.m4a" },
  { arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ", transliteration: "Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan waqina azaban-nar", translation: "Nyagasani wacu duhe byiza hano ku isi n'byiza mu mperuka, udukize ibihano by'umuriro", count: 3, category: "general", audioFile: "audio/Subhanallah.m4a" },
  { arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ", transliteration: "Allahumma anta Rabbi la ilaha illa anta", translation: "Allah wowe ni Nyagasani wange, nta yindi mana itegerejwe uretse wowe", count: 1, category: "evening", audioFile: "audio/Subhanallah.m4a" },
  { arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ", transliteration: "Amsayna wa amsal mulku lillah", translation: "Twageze nimugoroba n'ubwami bwose n'ibya Allah", count: 1, category: "evening", audioFile: "audio/Subhanallah.m4a" },
  { arabic: "رَضِيتُ بِاللَّهِ رَبًّا وَبِالْإِسْلَامِ دِينًا وَبِمُحَمَّدٍ نَبِيًّا", transliteration: "Radeetu billahi rabban wa bil-islami deenan wa bi-Muhammadin nabiyya", translation: "Nyishimiye Allah kuba Nyagasani, Islam kuba idini, Muhamad kuba intumwa", count: 3, category: "evening", audioFile: "audio/Subhanallah.m4a" }
];

const categoryNames = {
  Quran: { ar: 'القرآن', en: 'Quran' },
  Tauhid: { ar: 'التوحيد', en: 'Tawheed' },
  Sirah: { ar: 'السيرة', en: 'Seerah' },
  Fiqih: { ar: 'الفقه', en: 'Fiqh' },
  Khutubah: { ar: 'الخطب', en: 'Khutbah' },
  Akhlaq: { ar: 'الأخلاق', en: 'Akhlaq' },
  Adhkar: { ar: 'الأذكار', en: 'Adhkar' },
  Social: { ar: 'اجتماعي', en: 'Social' },
  General: { ar: 'عام', en: 'General' }
};

function initFallbackData() {
  tracksData.length = 0;
  surahs.length = 0;
  adhkarList.length = 0;
  videosData.length = 0;
  booksData.length = 0;
  fallbackTracks.forEach(t => tracksData.push({
    ...t,
    categoryAr: categoryNames[t.category]?.ar || t.category,
    categoryEn: categoryNames[t.category]?.en || t.category
  }));
  fallbackSurahs.forEach(s => surahs.push({...s}));
  fallbackAdhkar.forEach(a => adhkarList.push({...a}));
  fallbackVideos.forEach(v => videosData.push({...v}));
  fallbackBooks.forEach(b => booksData.push({...b}));
  if (typeof renderTracks === 'function') renderTracks();
  if (typeof renderCategoryTabs === 'function') renderCategoryTabs();
  if (typeof renderQuran === 'function') renderQuran();
  if (typeof renderVideos === 'function') renderVideos();
  if (typeof renderBooks === 'function') renderBooks();
  if (typeof renderAdhkarCards === 'function') renderAdhkarCards();
  if (typeof renderFeaturedAudio === 'function') renderFeaturedAudio();
}
