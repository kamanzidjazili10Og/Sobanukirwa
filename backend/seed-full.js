const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sobanukirwa',
  waitForConnections: true,
  connectionLimit: 1,
  queueLimit: 0,
  charset: 'utf8mb4'
});

const FALLBACK = {
  tracks: [
    { title: "Al-Fatiha (Sample)", titleEn: "Al-Fatiha (Sample)", titleAr: "الفاتحة (نموذج)", audioUrl: "https://server7.mp3quran.net/ahmed/001.mp3", category: "Quran", artist: "Ahmed Al-Ajmi", duration: "01:30" },
    { title: "Ayat Al-Kursi (Sample)", titleEn: "Ayat Al-Kursi (Sample)", titleAr: "آية الكرسي (نموذج)", audioUrl: "https://server7.mp3quran.net/ahmed/002.mp3", category: "Quran", artist: "Ahmed Al-Ajmi", duration: "01:45" },
    { title: "Ar-Rahman (Sample)", titleEn: "Ar-Rahman (Sample)", titleAr: "الرحمن (نموذج)", audioUrl: "https://server7.mp3quran.net/ahmed/055.mp3", category: "Quran", artist: "Ahmed Al-Ajmi", duration: "08:30" },
    { title: "Al-Waqiah (Sample)", titleEn: "Al-Waqiah (Sample)", titleAr: "الواقعة (نموذج)", audioUrl: "https://server7.mp3quran.net/ahmed/056.mp3", category: "Quran", artist: "Ahmed Al-Ajmi", duration: "06:15" },
    { title: "Al-Mulk (Sample)", titleEn: "Al-Mulk (Sample)", titleAr: "الملك (نموذج)", audioUrl: "https://server7.mp3quran.net/ahmed/067.mp3", category: "Quran", artist: "Ahmed Al-Ajmi", duration: "07:20" },
    { title: "Ya-Sin (Sample)", titleEn: "Ya-Sin (Sample)", titleAr: "يس (نموذج)", audioUrl: "https://server7.mp3quran.net/ahmed/036.mp3", category: "Quran", artist: "Ahmed Al-Ajmi", duration: "10:00" },
    { title: "Adhkar (Sample)", titleEn: "Adhkar (Sample)", titleAr: "الأذكار (نموذج)", audioUrl: "audio/Subhanallah.m4a", category: "Adhkar", artist: "Sobanukirwa", duration: "05:00" },
    { title: "Dhikr (Sample)", titleEn: "Dhikr (Sample)", titleAr: "الذكر (نموذج)", audioUrl: "audio/Subhanallah Alhamdulillah Wa La ilaha IlAllah (Dhikr).m4a", category: "Adhkar", artist: "Sobanukirwa", duration: "04:30" },
    { title: "Isomo rya Tauhid - Part 1", titleEn: "Lesson of Tawheed - Part 1", titleAr: "درس التوحيد - الجزء الأول", audioUrl: "audio/Tauhid/Isomo rya Tauhid.aac", category: "Tauhid", artist: "Sheikh Uqash", duration: "42:15" },
    { title: "Isomo rya Tauhid - Part 2", titleEn: "Lesson of Tawheed - Part 2", titleAr: "درس التوحيد - الجزء الثاني", audioUrl: "audio/Tauhid/Isomo rya Tauhid part2.m4a", category: "Tauhid", artist: "Sheikh Uqash", duration: "38:42" },
    { title: "Isomo rya Tauhid - Final", titleEn: "Lesson of Tawheed - Final", titleAr: "درس التوحيد - الجزء الثالث", audioUrl: "audio/Tauhid/Isomo rya Tauhid part3.m4a", category: "Tauhid", artist: "Sheikh Uqash", duration: "45:08" },
    { title: "Kwemera ndetse no kuzirikana Allah", titleEn: "Belief and Remembrance of Allah", titleAr: "الإيمان وذكر الله", audioUrl: "audio/Tauhid/Kwemera ndetse no kuzirikana  Allah.m4a", category: "Tauhid", artist: "Sheikh Uqash", duration: "31:20" },
    { title: "Kwemera Igitabo", titleEn: "Belief in the Book", titleAr: "الإيمان بالكتاب", audioUrl: "audio/Tauhid/Kwemera igitabo by oqash.m4a", category: "Tauhid", artist: "Sheikh Uqash", duration: "28:55" },
    { title: "Kwemera umunsi w'imperuka", titleEn: "Belief in the Last Day", titleAr: "الإيمان باليوم الآخر", audioUrl: "audio/Tauhid/Kwemera umunsi w'imperuka.aac", category: "Tauhid", artist: "Sheikh Uqash", duration: "35:10" },
    { title: "Gusobanutsirwa kurusha ukundi kose - Part 1", titleEn: "The Greatest Explanation - Part 1", titleAr: "أعظم شرح - الجزء الأول", audioUrl: "audio/Tauhid/Gusobanutsirwa kurusha ukundi kose.m4a", category: "Tauhid", artist: "Sheikh Uqash", duration: "48:30" },
    { title: "Gusobanutsirwa kurusha ukundi kose - Part 2", titleEn: "The Greatest Explanation - Part 2", titleAr: "أعظم شرح - الجزء الثاني", audioUrl: "audio/Tauhid/Gusobanutsirwa kurusha ukundi kose part2.m4a", category: "Tauhid", artist: "Sheikh Uqash", duration: "52:15" },
    { title: "Gusobanutsirwa kurusha ukundi kose - Part 3", titleEn: "The Greatest Explanation - Part 3", titleAr: "أعظم شرح - الجزء الثالث", audioUrl: "audio/Tauhid/Gusobanutsirwa kurusha ukundi kose part3.m4a", category: "Tauhid", artist: "Sheikh Uqash", duration: "44:08" },
    { title: "Gusobanutsirwa kurusha ukundi kose - Final", titleEn: "The Greatest Explanation - Final", titleAr: "أعظم شرح - الجزء الأخير", audioUrl: "audio/Tauhid/Gusobanutsirwa kurusha ukundi kose Final.m4a", category: "Tauhid", artist: "Sheikh Uqash", duration: "37:42" },
    { title: "Amateka ya Aboubakar", titleEn: "Story of Abu Bakr", titleAr: "قصة أبي بكر", audioUrl: "audio/Sirah/Icyamatse ku mibereho ndetse n'imibanire y'intumwa y'imana Muhamad (S.A.W).aac", category: "Sirah", artist: "Sheikh Gahutu", duration: "33:50" },
    { title: "Amateka ya Zaid bun Thabit", titleEn: "Story of Zaid ibn Thabit", titleAr: "قصة زيد بن ثابت", audioUrl: "audio/Sirah/Iherezo ry'imibanire nabanyamuryango itajyiriro.m4a", category: "Sirah", artist: "Sheikh Gahutu", duration: "29:10" },
    { title: "Amateka ya Said ibn Zaid", titleEn: "Story of Sa'id ibn Zayd", titleAr: "قصة سعيد بن زيد", audioUrl: "audio/Sirah/Kurejyera mu busabe.aac", category: "Sirah", artist: "Sheikh Gahutu", duration: "41:22" },
    { title: "Ukwihangana", titleEn: "Patience", titleAr: "الصبر", audioUrl: "audio/Sirah/Uko intumwa y'imana yabaniraga abane be part2.m4a", category: "Akhlaq", artist: "Sheikh Gahutu", duration: "26:45" },
    { title: "Usuulu thalathat - Isomo rya Mbere", titleEn: "Usul al-Thalathah - Lesson 1", titleAr: "الأصول الثلاثة - الدرس الأول", audioUrl: "audio/Al Usuulu Thalathat/Usulu thalathat Isomo rya mbere.mp3", category: "Tauhid", artist: "Sheikh Djamidu", duration: "36:18" },
    { title: "Usuulu thalathat - Isomo rya Kabiri", titleEn: "Usul al-Thalathah - Lesson 2", titleAr: "الأصول الثلاثة - الدرس الثاني", audioUrl: "audio/Al Usuulu Thalathat/Usulu thalathat isomo rya kabiri.mp3", category: "Tauhid", artist: "Sheikh Djamidu", duration: "42:05" },
    { title: "Usuulu thalathat - Isomo rya Gatatu", titleEn: "Usul al-Thalathah - Lesson 3", titleAr: "الأصول الثلاثة - الدرس الثالث", audioUrl: "audio/Al Usuulu Thalathat/Usuulu thalathat isomo rya gatatu.m4a", category: "Tauhid", artist: "Sheikh Djamidu", duration: "38:30" },
    { title: "Usuulu thalathat - Isomo rya Kane", titleEn: "Usul al-Thalathah - Lesson 4", titleAr: "الأصول الثلاثة - الدرس الرابع", audioUrl: "audio/Al Usuulu Thalathat/Usuulu thalathat isomo rya Kane.mp3", category: "Tauhid", artist: "Sheikh Djamidu", duration: "44:12" },
    { title: "Usuulu thalathat - Isomo rya Gatanu", titleEn: "Usul al-Thalathah - Lesson 5", titleAr: "الأصول الثلاثة - الدرس الخامس", audioUrl: "audio/Al Usuulu Thalathat/Usuulu thalathat Isomo rya Gatanu.m4a", category: "Tauhid", artist: "Sheikh Djamidu", duration: "41:50" },
    { title: "Usuulu thalathat - Isomo rya Gatandatu", titleEn: "Usul al-Thalathah - Lesson 6", titleAr: "الأصول الثلاثة - الدرس السادس", audioUrl: "audio/Al Usuulu Thalathat/Usuulu thalathat isomo rya Gatandatu.m4a", category: "Tauhid", artist: "Sheikh Djamidu", duration: "37:25" },
    { title: "Usuulu thalathat - Isomo rya Karirwi", titleEn: "Usul al-Thalathah - Lesson 7", titleAr: "الأصول الثلاثة - الدرس السابع", audioUrl: "audio/Al Usuulu Thalathat/Usuulu thalathat isomo rya Karindwi.mp3", category: "Tauhid", artist: "Sheikh Djamidu", duration: "46:38" },
    { title: "Usuulu thalathat - Isomo rya Munani", titleEn: "Usul al-Thalathah - Lesson 8", titleAr: "الأصول الثلاثة - الدرس الثامن", audioUrl: "audio/Al Usuulu Thalathat/Usuulu thatalathat isomo rya Munani.m4a", category: "Tauhid", artist: "Sheikh Djamidu", duration: "33:15" },
    { title: "Usuulu thalathat - Isomo rya Cyenda", titleEn: "Usul al-Thalathah - Lesson 9", titleAr: "الأصول الثلاثة - الدرس التاسع", audioUrl: "audio/Al Usuulu Thalathat/Usuulu thalathat isomo rya Cyenda.m4a", category: "Tauhid", artist: "Sheikh Djamidu", duration: "39:48" },
    { title: "Usuulu thalathat - Isomo rya Cumi", titleEn: "Usul al-Thalathah - Lesson 10", titleAr: "الأصول الثلاثة - الدرس العاشر", audioUrl: "audio/Al Usuulu Thalathat/Usuulu thalathat isomo rya cumi.m4a", category: "Tauhid", artist: "Sheikh Djamidu", duration: "43:02" },
    { title: "Amateka y'intumwa y'imana Muhamad (S.A.W) part 1", titleEn: "Story of Prophet Muhammad (S.A.W) part 1", titleAr: "قصة النبي محمد - الجزء الأول", audioUrl: "audio/Sirah/Amateka y'intumwa y'imana Muhamad (S.A.W) part.aac", category: "Sirah", artist: "Sheikh Mutabaruka", duration: "34:12" },
    { title: "Amateka y'intumwa y'imana Muhamad (S.A.W) part 2", titleEn: "Story of Prophet Muhammad (S.A.W) part 2", titleAr: "قصة النبي محمد - الجزء الثاني", audioUrl: "audio/Sirah/Amateka y'intumwa y'imana Muhamad (S.A.W) part-2.aac", category: "Sirah", artist: "Sheikh Mutabaruka", duration: "28:45" },
    { title: "Amateka y'intumwa y'imana Muhamad (S.A.W) part 4", titleEn: "Story of Prophet Muhammad (S.A.W) part 4", titleAr: "قصة النبي محمد - الجزء الرابع", audioUrl: "audio/Sirah/Amateka y'intumwa y'imana Muhamad (S.A.W) part - 4.aac", category: "Sirah", artist: "Sheikh Mutabaruka", duration: "31:30" },
    { title: "Amateka y'intumwa y'imana Muhamad (S.A.W) part 5", titleEn: "Story of Prophet Muhammad (S.A.W) part 5", titleAr: "قصة النبي محمد - الجزء الخامس", audioUrl: "audio/Sirah/Amateka y'intumwa y'imana Muhamad (S.A.W) part -5.aac", category: "Sirah", artist: "Sheikh Mutabaruka", duration: "36:18" },
    { title: "Athikar zikorwa mugitondo na nimugoroba", titleEn: "Morning and Evening Adhkar", titleAr: "أذكار الصباح والمساء", audioUrl: "audio/Sirah/Amateka y'intumwa y'imana Muhamad (S.A.W) part -6.aac", category: "Adhkar", artist: "Sheikh Mutabaruka", duration: "22:40" },
    { title: "Athikar zikorwa umuntu ajyiye kuryama", titleEn: "Bedtime Adhkar", titleAr: "أذكار النوم", audioUrl: "audio/Sirah/Amateka y'intumwa y'imana Muhamad (S.A.W) part - 8.aac", category: "Adhkar", artist: "Sheikh Mutabaruka", duration: "18:55" },
    { title: "Icyamatse mu gusobanutsirwa amazina ya Allah", titleEn: "Understanding Allah's Names", titleAr: "شرح أسماء الله", audioUrl: "audio/Tauhid/Isomo rya Tauhid.aac", category: "Tauhid", artist: "Sheikh Muhamad Sulaiman", duration: "47:22" },
    { title: "Izina ALLAHU", titleEn: "The Name Allah", titleAr: "اسم الله", audioUrl: "audio/Tauhid/Isomo rya Tauhid part2.m4a", category: "Tauhid", artist: "Sheikh Muhamad Sulaiman", duration: "38:15" },
    { title: "Inabi Wifuriza Abandi Irakugarukira", titleEn: "Evil Wished Upon Others Returns", titleAr: "الشر الذي تتمناه للغير يعود عليك", audioUrl: "audio/Tauhid/Isomo rya Tauhid.aac", category: "Akhlaq", artist: "Sheikh Uwamungu", duration: "25:30" },
    { title: "Aya magambo akomeye", titleEn: "Important Words", titleAr: "كلمات مهمة", audioUrl: "audio/Tauhid/Isomo rya Tauhid part2.m4a", category: "Akhlaq", artist: "Sheikh Uwamungu", duration: "31:48" },
    { title: "Haranira ko ubuzima bugoye", titleEn: "Strive Though Life is Hard", titleAr: "اجتهد ولو كانت الحياة صعبة", audioUrl: "audio/Tauhid/Isomo rya Tauhid part3.m4a", category: "Akhlaq", artist: "Sheikh Uwamungu", duration: "27:14" },
    { title: "Khutbah ku wa Gatanu", titleEn: "Friday Khutbah", titleAr: "خطبة الجمعة", audioUrl: "audio/Khutubah/sample_khutbah.mp3", category: "Khutubah", artist: "Sheikh Mutabaruka", duration: "15:00" },
    { title: "Urukundo mu Buvandimwe", titleEn: "Love and Brotherhood", titleAr: "الحب في الأخوة", audioUrl: "Videos/5.mp4", category: "Social", artist: "Various", duration: "00:17" },
    { title: "Kwemera Imana", titleEn: "Belief in God", titleAr: "الإيمان بالله", audioUrl: "audio/Tauhid/Kwemera ndetse no kuzirikana  Allah.m4a", category: "Tauhid", artist: "Sheikh Uqash", duration: "00:30" }
  ],
  videos: [
    { title: "Amateka y'intumwa y'imana Muhamad (S.A.W)", titleEn: "The Story of Prophet Muhammad (PBUH)", titleAr: "قصة النبي محمد (ص)", videoUrl: "Videos/1.mp4", thumbnail: "Images/ok9.jpg" },
    { title: "Inyigisho ku Kwihangana", titleEn: "Lesson on Patience", titleAr: "درس في الصبر", videoUrl: "Videos/2.mp4", thumbnail: "Images/ok10.jpg" },
    { title: "Gusobanukirwa Icyo Kwemera Ari cyo", titleEn: "Understanding Faith", titleAr: "فهم الإيمان", videoUrl: "Videos/3.mp4", thumbnail: "Images/ok11.jpg" },
    { title: "Uburyo bwo Gusenga", titleEn: "The Method of Prayer", titleAr: "كيفية الصلاة", videoUrl: "Videos/4.mp4", thumbnail: "Images/ok12.jpg" },
    { title: "Urukundo mu Buvandimwe", titleEn: "Love and Brotherhood", titleAr: "الحب في الأخوة", videoUrl: "Videos/5.mp4", thumbnail: "Images/ok13.jpg" },
    { title: "Inyigisho - Part 6", videoUrl: "Videos/6.mp4", thumbnail: "Images/logo2.png" },
    { title: "Inyigisho - Part 7", videoUrl: "Videos/7.mp4", thumbnail: "Images/logo2.png" },
    { title: "Inyigisho - Part 8", videoUrl: "Videos/8.mp4", thumbnail: "Images/logo2.png" },
    { title: "Inyigisho - Part 9", videoUrl: "Videos/9.mp4", thumbnail: "Images/logo2.png" },
    { title: "Inyigisho - Part 10", videoUrl: "Videos/10.mp4", thumbnail: "Images/logo2.png" },
    { title: "INZOZI ZITANGAJE ZA IBN JAWZI", videoUrl: "Videos/INZOZI ZITANGAJE ZA IBN JAWZI.mp4", thumbnail: "Images/logo2.png" },
    { title: "Imyigishirize - Sheikh Uthman Mutabaruka", videoUrl: "Videos/lv_0_20240411195650.mp4", thumbnail: "Images/logo2.png" },
    { title: "Inyigisho - Sheikh Gahutu", videoUrl: "Videos/lv_0_20240518191511.mp4", thumbnail: "Images/logo2.png" },
    { title: "Inyigisho - Sheikh Uwamungu", videoUrl: "Videos/lv_0_20240806153929.mp4", thumbnail: "Images/logo2.png" },
    { title: "Kwerekeza mu buryo bwiza", videoUrl: "Videos/lv_0_20240809203410.mp4", thumbnail: "Images/logo2.png" },
    { title: "Inyigisho - Sheikh Uqash", videoUrl: "Videos/lv_0_20240916181930.mp4", thumbnail: "Images/logo2.png" },
    { title: "Inyigisho - Part 17", videoUrl: "Videos/lv_0_20241109092913.mp4", thumbnail: "Images/logo2.png" },
    { title: "Inyigisho - Part 18", videoUrl: "Videos/lv_0_20241123220626.mp4", thumbnail: "Images/logo2.png" },
    { title: "Inyigisho - Part 19", videoUrl: "Videos/lv_0_20241125101246.mp4", thumbnail: "Images/logo2.png" },
    { title: "Inyigisho - Part 20", videoUrl: "Videos/lv_0_20250325162043.mp4", thumbnail: "Images/logo2.png" }
  ],
  adhkar: [
    { arabic: "سُبْحَانَ اللَّهِ", transliteration: "Subhanallah", translationRw: "Ibyubahiro ni ibya Allah", translationEn: "Glory be to Allah", count: 33, category: "general", audioFile: "audio/Subhanallah.m4a" },
    { arabic: "الْحَمْدُ لِلَّهِ", transliteration: "Alhamdulillah", translationRw: "Ishimwe n'ikuzo ni ibya Allah", translationEn: "Praise be to Allah", count: 33, category: "general", audioFile: "audio/Subhanallah.m4a" },
    { arabic: "اللَّهُ أَكْبَرُ", transliteration: "Allahu Akbar", translationRw: "Allah ni Umukuru w'ikirenga", translationEn: "Allah is the Greatest", count: 34, category: "general", audioFile: "audio/Subhanallah.m4a" },
    { arabic: "لَا إِلَٰهَ إِلَّا اللَّهُ", transliteration: "La ilaha illallah", translationRw: "Nta mana iri isobok uretse Allah", translationEn: "There is no god but Allah", count: 10, category: "general", audioFile: "audio/Subhanallah.m4a" },
    { arabic: "أَسْتَغْفِرُ اللَّهَ", transliteration: "Astaghfirullah", translationRw: "Nsaba imbabazi kwa Allah", translationEn: "I seek forgiveness from Allah", count: 10, category: "general", audioFile: "audio/Subhanallah.m4a" },
    { arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", transliteration: "Subhanallahi wa bihamdihi", translationRw: "Ibyubahiro n'ishimwe ni ibya Allah", translationEn: "Glory and praise be to Allah", count: 100, category: "morning", audioFile: "audio/Subhanallah.m4a" },
    { arabic: "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ", transliteration: "La ilaha illallahu wahdahu la sharika lah", translationRw: "Nta mana iri isobok uretse Allah wenyine", translationEn: "There is no god but Allah alone", count: 10, category: "morning", audioFile: "audio/Subhanallah.m4a" },
    { arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ", transliteration: "Subhanallahi wa bihamdihi, Subhanallahil Azeem", translationRw: "Ibyubahiro n'ishimwe ni ibya Allah, ibyubahiro ni ibya Allah, Ukomeye", translationEn: "Glory and praise be to Allah, Glory be to Allah the Almighty", count: 10, category: "general", audioFile: "audio/Subhanallah.m4a" },
    { arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ", transliteration: "La hawla wa la quwwata illa billah", translationRw: "Nta mbaraga n'imbaraga uretse Allah", translationEn: "There is no power nor strength except by Allah", count: 10, category: "general", audioFile: "audio/Subhanallah.m4a" },
    { arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", transliteration: "Bismillahir Rahmanir Rahim", translationRw: "Mu izina rya Allah, Nyirimpuhwe, Nyirimbabazi", translationEn: "In the name of Allah, the Most Gracious, the Most Merciful", count: 7, category: "general", audioFile: "audio/Subhanallah.m4a" },
    { arabic: "اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ", transliteration: "Allahumma salli ala Muhammad", translationRw: "Allah uheshe imigisha intumwa Muhamad", translationEn: "O Allah, send blessings upon Muhammad", count: 10, category: "general", audioFile: "audio/Subhanallah.m4a" },
    { arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ", transliteration: "Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan waqina azaban-nar", translationRw: "Nyagasani wacu duhe byiza hano ku isi n'byiza mu mperuka, udukize ibihano by'umuriro", translationEn: "Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire", count: 3, category: "general", audioFile: "audio/Subhanallah.m4a" },
    { arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ", transliteration: "Allahumma anta Rabbi la ilaha illa anta", translationRw: "Allah wowe ni Nyagasani wange, nta yindi mana itegerejwe uretse wowe", translationEn: "O Allah, You are my Lord, there is no god but You", count: 1, category: "evening", audioFile: "audio/Subhanallah.m4a" },
    { arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ", transliteration: "Amsayna wa amsal mulku lillah", translationRw: "Twageze nimugoroba n'ubwami bwose n'ibya Allah", translationEn: "We have entered the evening and the dominion belongs to Allah", count: 1, category: "evening", audioFile: "audio/Subhanallah.m4a" },
    { arabic: "رَضِيتُ بِاللَّهِ رَبًّا وَبِالْإِسْلَامِ دِينًا وَبِمُحَمَّدٍ نَبِيًّا", transliteration: "Radeetu billahi rabban wa bil-islami deenan wa bi-Muhammadin nabiyya", translationRw: "Nyishimiye Allah kuba Nyagasani, Islam kuba idini, Muhamad kuba intumwa", translationEn: "I am pleased with Allah as my Lord, Islam as my religion, and Muhammad as my Prophet", count: 3, category: "evening", audioFile: "audio/Subhanallah.m4a" }
  ],
  artists: [
    { name: "Ahmed Al-Ajmi", nameEn: "Ahmed Al-Ajmi", nameAr: "أحمد العجمي" },
    { name: "Sobanukirwa", nameEn: "Sobanukirwa", nameAr: "سبنوكيروا" },
    { name: "Various", nameEn: "Various", nameAr: "مختلف" }
  ],
  categories: [
    { name: "Quran", nameEn: "Quran", nameAr: "القرآن", slug: "quran" },
    { name: "Social", nameEn: "Social", nameAr: "اجتماعي", slug: "social" }
  ]
};

async function getOrCreateArtist(name, nameEn, nameAr) {
  const [rows] = await pool.query('SELECT id FROM artists WHERE name = ?', [name]);
  if (rows.length > 0) return rows[0].id;
  const [result] = await pool.query(
    'INSERT INTO artists (name, name_en, name_ar, is_active) VALUES (?, ?, ?, 1)',
    [name, nameEn || name, nameAr || name]
  );
  return result.insertId;
}

async function getOrCreateCategory(name, nameEn, nameAr, slug) {
  let [rows] = await pool.query('SELECT id FROM categories WHERE slug = ?', [slug]);
  if (rows.length > 0) {
    // Reactivate if inactive
    await pool.query('UPDATE categories SET is_active = 1 WHERE id = ?', [rows[0].id]);
    return rows[0].id;
  }
  const [result] = await pool.query(
    'INSERT INTO categories (name, name_en, name_ar, slug, is_active) VALUES (?, ?, ?, ?, 1)',
    [name, nameEn || name, nameAr || name, slug]
  );
  return result.insertId;
}

async function getArtistId(name) {
  const [rows] = await pool.query('SELECT id FROM artists WHERE name = ? AND is_active = 1', [name]);
  return rows.length > 0 ? rows[0].id : null;
}

async function getCategoryId(name) {
  const [rows] = await pool.query('SELECT id FROM categories WHERE name = ? AND is_active = 1', [name]);
  return rows.length > 0 ? rows[0].id : null;
}

async function seed() {
  console.log('Starting full database seed...\n');

  // 1. Ensure required categories exist
  console.log('Seeding categories...');
  const catQuran = await getOrCreateCategory('Quran', 'Quran', 'القرآن', 'quran');
  const catSocial = await getOrCreateCategory('Social', 'Social', 'اجتماعي', 'social');
  // Reactivate Adhkar category (id=6)
  await pool.query('UPDATE categories SET is_active = 1 WHERE id = 6');
  console.log('  Categories ready.');

  // 2. Ensure required artists exist
  console.log('Seeding artists...');
  for (const a of FALLBACK.artists) {
    await getOrCreateArtist(a.name, a.nameEn, a.nameAr);
  }
  console.log('  Artists ready.');

  // 3. Get all artists and categories maps
  const [artists] = await pool.query('SELECT id, name FROM artists WHERE is_active = 1');
  const artistMap = {};
  artists.forEach(a => { artistMap[a.name.toLowerCase()] = a.id; });

  const [cats] = await pool.query('SELECT id, name FROM categories WHERE is_active = 1');
  const catMap = {};
  cats.forEach(c => { catMap[c.name.toLowerCase()] = c.id; });

  // 4. Seed tracks - clear and re-insert
  console.log('Seeding tracks...');
  await pool.query('DELETE FROM tracks WHERE 1=1');
  let inserted = 0;
  for (const t of FALLBACK.tracks) {
    const artistId = artistMap[t.artist.toLowerCase()] || null;
    const catId = catMap[t.category.toLowerCase()] || null;
    if (!artistId) {
      console.log(`  WARNING: Artist "${t.artist}" not found for track "${t.title}"`);
      continue;
    }
    await pool.query(
      'INSERT INTO tracks (artist_id, category_id, title, title_en, title_ar, audio_url, duration_str, description, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)',
      [artistId, catId, t.title, t.titleEn || null, t.titleAr || null, t.audioUrl, t.duration, t.title + ' - Sample track']
    );
    inserted++;
  }
  console.log(`  Inserted ${inserted} tracks.`);

  // 5. Seed videos - clear and re-insert
  console.log('Seeding videos...');
  await pool.query('DELETE FROM videos WHERE 1=1');
  let vInserted = 0;
  for (const v of FALLBACK.videos) {
    await pool.query(
      'INSERT INTO videos (title, title_en, title_ar, description, video_url, thumbnail_url, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)',
      [v.title, v.titleEn || null, v.titleAr || null, v.title + ' - Sample video', v.videoUrl, v.thumbnail || null]
    );
    vInserted++;
  }
  console.log(`  Inserted ${vInserted} videos.`);

  // 6. Seed adhkar - clear and re-insert
  console.log('Seeding adhkar...');
  await pool.query('DELETE FROM adhkar WHERE 1=1');
  let aInserted = 0;
  let sortOrder = 1;
  for (const a of FALLBACK.adhkar) {
    await pool.query(
      'INSERT INTO adhkar (arabic_text, transliteration, translation_rw, translation_en, count_target, category, audio_url, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)',
      [a.arabic, a.transliteration, a.translationRw, a.translationEn, a.count, a.category, a.audioFile, sortOrder++]
    );
    aInserted++;
  }
  console.log(`  Inserted ${aInserted} adhkar entries.`);

  // 7. Verify counts
  console.log('\nVerification:');
  const [tCount] = await pool.query('SELECT COUNT(*) as c FROM tracks WHERE is_active = 1');
  const [vCount] = await pool.query('SELECT COUNT(*) as c FROM videos WHERE is_active = 1');
  const [aCount] = await pool.query('SELECT COUNT(*) as c FROM adhkar WHERE is_active = 1');
  const [qCount] = await pool.query('SELECT COUNT(*) as c FROM quran_surahs');
  const [bCount] = await pool.query('SELECT COUNT(*) as c FROM books WHERE is_active = 1');
  const [artCount] = await pool.query('SELECT COUNT(*) as c FROM artists WHERE is_active = 1');
  const [catCount] = await pool.query('SELECT COUNT(*) as c FROM categories WHERE is_active = 1');

  console.log(`  Artists:   ${artCount[0].c}`);
  console.log(`  Categories: ${catCount[0].c}`);
  console.log(`  Tracks:    ${tCount[0].c}`);
  console.log(`  Videos:    ${vCount[0].c}`);
  console.log(`  Adhkar:    ${aCount[0].c}`);
  console.log(`  Quran:     ${qCount[0].c} surahs`);
  console.log(`  Books:     ${bCount[0].c}`);

  console.log('\nSeed complete!');
  await pool.end();
}

seed().catch(err => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
