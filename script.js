// ===== AUTO-GENERATE IDS FUNCTION =====
function generateIds() {
    // Auto-generate artist IDs and track IDs
    artistsData.forEach((artist, artistIndex) => {
        artist.id = artistIndex + 1;
        artist.totalLessons = artist.tracks.length;
        
        artist.tracks.forEach((track, trackIndex) => {
            track.id = (artistIndex + 1) * 100 + trackIndex + 1;
        });
    });
    
    // Auto-generate book IDs
    booksData.forEach((book, index) => {
        book.id = index + 1;
    });
    
    // Auto-generate video IDs
    videosData.forEach((video, index) => {
        video.id = index + 1;
    });
}

// ===== ARTISTS DATA WITH AUTO IDS =====
const artistsData = [
    {
        name: "Sheikh Uqash",
        nameEn: "Sheikh Uqash",
        nameAr: "الشيخ عقاش",
        image: "Images/usi6.jpg",
        category: "Tauhid, Fiqih, Sirah",
        tracks: [
            { title: "Isomo rya Tauhid - Part 1", titleEn: "Lesson of Tawheed - Part 1", titleAr: "درس التوحيد - الجزء الأول", audioUrl: "audio/Tauhid/Isomo rya Tauhid.aac", category: "Tauhid" },
            { title: "Isomo rya Tauhid - Part 2", titleEn: "Lesson of Tawheed - Part 2", titleAr: "درس التوحيد - الجزء الثاني", audioUrl: "audio/Tauhid/Isomo rya Tauhid part2.m4a", category: "Tauhid" },
            { title: "Isomo rya Tauhid - Final", titleEn: "Lesson of Tawheed - Final", titleAr: "درس التوحيد - الجزء الثالث", audioUrl: "audio/Tauhid/Isomo rya Tauhid part3.m4a", category: "Tauhid" },
            { title: "Kwemera ndetse no kuzirikana  Allah", titleEn: "Lesson of Fiqh - Prayer", titleAr: "درس الفقه - الصلاة", audioUrl: "audio/Tauhid/Kwemera ndetse no kuzirikana  Allah.m4a", category: "Tauhid" },
            { title: "Kwemera Igitabo", titleEn: "Lesson of Fiqh - Prayer", titleAr: "درس الفقه - الصلاة", audioUrl: "audio/Tauhid/Kwemera igitabo by oqash.m4a", category: "Tauhid" },
            { title: "Kwemera umunsi w'imperuka ", titleEn: "Discussion on Hajj", titleAr: "حديث عن الحج", audioUrl: "audio/Tauhid/Kwemera umunsi w'imperuka.aac", category: "Tauhid" },
            { title: "Kwemera umunsi w'imperuka - Part 2", titleEn: "Having Good Friends", titleAr: "الصحبة الصالحة", audioUrl: "audio/Tauhid/Kwemera umunsi w'imperuka part2.aac", category: "Tauhid" },
            { title: "Gusobanutsirwa kurusha ukundi kose - Part 1", titleEn: "Lesson of Tawheed - Final", titleAr: "درس التوحيد - الجزء الثالث", audioUrl: "audio/Tauhid/Isomo rya Tauhid part3.m4a", category: "Tauhid" },
            { title: "Gusobanutsirwa kurusha ukundi kose - Part 2", titleEn: "Lesson of Fiqh - Prayer", titleAr: "درس الفقه - الصلاة", audioUrl: "audio/Tauhid/Gusobanutsirwa kurusha ukundi kose part2.m4a", category: "Tauhid" },
            { title: "Gusobanutsirwa kurusha ukundi kose - Part 3", titleEn: "Discussion on Hajj", titleAr: "حديث عن الحج", audioUrl: "audio/Tauhid/Gusobanutsirwa kurusha ukundi kose part3.m4a", category: "Tauhid" },
            { title: "Gusobanutsirwa kurusha ukundi kose - Part 4", titleEn: "Lesson of Tawheed - Final", titleAr: "درس التوحيد - الجزء الثالث", audioUrl: "audio/Tauhid/Gusobanutsirwa kurusha ukundi kose part4.m4a", category: "Tauhid" },
            { title: "Gusobanutsirwa kurusha ukundi kose - Part 5", titleEn: "Lesson of Fiqh - Prayer", titleAr: "درس الفقه - الصلاة", audioUrl: "audio/Tauhid/Gusobanutsirwa kurusha ukundi kose part5.m4a", category: "Tauhid" },
            { title: "Gusobanutsirwa kurusha ukundi kose - Final", titleEn: "Discussion on Hajj", titleAr: "حديث عن الحج", audioUrl: "audio/Tauhid/Gusobanutsirwa kurusha ukundi kose Final.m4a", category: "Tauhid" },
        ]
    },
    {
        name: "Sheikh Mutabaruka Uthman",
        nameEn: "Sheikh Mutabaruka",
        nameAr: "الشيخ موتاباروكا",
        image: "Images/usi5.jpg",
        category: "Sirah, Tauhid",
        tracks: [
            { title: "Isomo rya Sirah - Igice cya 1", titleEn: "Seerah Lesson - Part 1", titleAr: "درس السيرة - مولد النبي", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3", category: "Sirah" },
            { title: "Isomo rya Sirah - Ubutumwa", titleEn: "Seerah Lesson - Prophethood", titleAr: "درس السيرة - النبوة", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3", category: "Sirah" },
            { title: "Isomo rya Sirah - Hijra", titleEn: "Seerah Lesson - Migration", titleAr: "درس السيرة - الهجرة", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3", category: "Sirah" },
            { title: "Isomo rya Sirah - Intambara za Badr", titleEn: "Seerah Lesson - Battle of Badr", titleAr: "درس السيرة - غزوة بدر", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3", category: "Sirah" },
            { title: "IBYAHA BYACU", titleEn: "Our Sins", titleAr: "ذنوبنا", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3", category: "Tauhid" }
        ]
    },
    {
        name: "Sheikh Muhamad Sulaiman",
        nameEn: "Sheikh Muhamad Sulaiman",
        nameAr: "الشيخ محمد سليمان",
        image: "Images/usi4.jpg",
        category: "Adhkar, Tauhid",
        tracks: [
            { title: "Icyamatse mu gusobanutsirwa amazina ya Allah", titleEn: "Explanation of Allah's Names", titleAr: "شرح أسماء الله", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3", category: "Tauhid" },
            { title: "Izina ALLAHU", titleEn: "The Name Allah", titleAr: "اسم الله", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3", category: "Tauhid" },
            { title: "Izina Al-Rahiman Al-Rahim", titleEn: "The Names Ar-Rahman Ar-Raheem", titleAr: "اسما الرحمن الرحيم", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3", category: "Tauhid" },
            { title: "Izina Al-Hay Al-Qayum", titleEn: "The Names Al-Hayy Al-Qayyoom", titleAr: "اسما الحي القيوم", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3", category: "Tauhid" },
            { title: "Athikar zikorwa mugitondo na nimugoroba", titleEn: "Morning and Evening Adhkar", titleAr: "أذكار الصباح والمساء", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3", category: "Adhkar" },
            { title: "Athikar zikorwa umuntu ajyiye kuryama", titleEn: "Bedtime Adhkar", titleAr: "أذكار النوم", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-17.mp3", category: "Adhkar" }
        ]
    },
    {
        name: "Sheikh Gahutu",
        nameEn: "Sheikh Gahutu",
        nameAr: "الشيخ غاهوتو",
        image: "Images/usi3.jpg",
        category: "Sirah, Akhlaq",
        tracks: [
            { title: "Amateka ya Aboubakar", titleEn: "Story of Abu Bakr", titleAr: "قصة أبي بكر", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-18.mp3", category: "Sirah" },
            { title: "Amateka ya Zaid bun Thabit", titleEn: "Story of Zaid ibn Thabit", titleAr: "قصة زيد بن ثابت", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-19.mp3", category: "Sirah" },
            { title: "Amateka ya Said ibn Zaid", titleEn: "Story of Sa'id ibn Zayd", titleAr: "قصة سعيد بن زيد", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-20.mp3", category: "Sirah" },
            { title: "Ukwihangana", titleEn: "Patience", titleAr: "الصبر", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-21.mp3", category: "Akhlaq" }
        ]
    },
    {
        name: "Sheikh Djamidu",
        nameEn: "Sheikh Djamidu",
        nameAr: "الشيخ جميدو",
        image: "Images/usi2.jpg",
        category: "Fiqih, Khutubah, Tauhid",
        tracks: [
            { title: "Usuulu thalathat - Isomo rya Mbere", titleEn: "Prayer of Need (Salat al-Hajah)", titleAr: "صلاة الحاجة", audioUrl: "audio/Al Usuulu Thalathat/Usulu thalathat Isomo rya mbere.mp3", category: "Tauhid" },
            { title: "Usuulu thalathat - Isomo rya Kabiri", titleEn: "Khutbah on Tawheed and Prayer", titleAr: "خطبة التوحيد والصلاة", audioUrl: "audio/Al Usuulu Thalathat/Usulu thalathat isomo rya kabiri.mp3", category: "Tauhid" },
            { title: "Usuulu thalathat - Isomo rya Gatatu", titleEn: "Prayer of Need (Salat al-Hajah)", titleAr: "صلاة الحاجة", audioUrl: "audio/Al Usuulu Thalathat/Usuulu thalathat isomo rya gatatu.m4a", category: "Tauhid" },
            { title: "Usuulu thalathat - Isomo rya Kane", titleEn: "Khutbah on Tawheed and Prayer", titleAr: "خطبة التوحيد والصلاة", audioUrl: "audio/Al Usuulu Thalathat/Usuulu thalathat isomo rya Kane.mp3", category: "Tauhid" },
            { title: "Usuulu thalathat - Isomo rya Gatanu", titleEn: "Prayer of Need (Salat al-Hajah)", titleAr: "صلاة الحاجة", audioUrl: "audio/Al Usuulu Thalathat/Usuulu thalathat Isomo rya Gatanu.m4a", category: "Tauhid" },
            { title: "Usuulu thalathat - Isomo rya Gatandatu", titleEn: "Khutbah on Tawheed and Prayer", titleAr: "خطبة التوحيد والصلاة", audioUrl: "audio/Al Usuulu Thalathat/Usuulu thalathat isomo rya Gatandatu.m4a", category: "Tauhid" },
            { title: "Usuulu thalathat - Isomo rya Karirwi", titleEn: "Prayer of Need (Salat al-Hajah)", titleAr: "صلاة الحاجة", audioUrl: "audio/Al Usuulu Thalathat/Usuulu thalathat isomo rya Karindwi.mp3", category: "Tauhid" },
            { title: "Usuulu thalathat - Isomo rya Munani", titleEn: "Khutbah on Tawheed and Prayer", titleAr: "خطبة التوحيد والصلاة", audioUrl: "audio/Al Usuulu Thalathat/Usuulu thatalathat isomo rya Munani.m4a", category: "Tauhid" },
            { title: "Usuulu thalathat - Isomo rya Cyenda", titleEn: "Prayer of Need (Salat al-Hajah)", titleAr: "صلاة الحاجة", audioUrl: "audio/Al Usuulu Thalathat/Usuulu thalathat isomo rya Cyenda.m4a", category: "Tauhid" },
            { title: "Usuulu thalathat - Isomo rya Cumi", titleEn: "Khutbah on Tawheed and Prayer", titleAr: "خطبة التوحيد والصلاة", audioUrl: "audio/Al Usuulu Thalathat/Usuulu thalathat isomo rya cumi.m4a", category: "Tauhid" },
            { title: "Khutbah - Urupfu", titleEn: "Khutbah on Death", titleAr: "صلاة الحاجة", audioUrl: "D:/audio/Usuulu thalathat 'isomo rya cumi' by Djamidu NIYITANGA.m4a", category: "Khutubah" },
            { title: "Khutbah - Ubusambanyi", titleEn: "Khutbah on Tawheed and Prayer", titleAr: "خطبة التوحيد والصلاة", audioUrl: "audio/Al Usuulu Thalathat/Usulu thalathat Isomo rya mbere.m4a", category: "Khutubah" },
            { title: "Khutbah - Tauhid", titleEn: "Khutbah on Adultery", titleAr: "خطبة الزنا", audioUrl: "audio/Al Usuulu Thalathat/Usulu thalathat Isomo rya mbere.mp3", category: "Khutubah" }
        ]
    },
    {
        name: "Sheikh Uwamungu",
        nameEn: "Sheikh Uwamungu",
        nameAr: "الشيخ أومونغو",
        image: "Images/usi1.jpg",
        category: "Akhlaq, Sirah",
        tracks: [
            { title: "Inabi Wifuriza Abandi Irakugarukira", titleEn: "Evil you wish for others returns to you", titleAr: "الشر الذي تتمناه للغير يعود عليك", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-25.mp3", category: "Akhlaq" },
            { title: "Aya magambo akomeye", titleEn: "Important words", titleAr: "كلمات مهمة", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-26.mp3", category: "Akhlaq" },
            { title: "Haranira ko ubuzima bugoye", titleEn: "Strive even if life is difficult", titleAr: "اجتهد ولو كانت الحياة صعبة", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-27.mp3", category: "Akhlaq" }
        ]
    }
];

// ===== COMPLETE QURAN DATA (114 Surahs) =====
const surahs = [
    { number: 1, name: "Al-Fatiha", nameArabic: "الفاتحة", ayahs: 7, type: "Makkah", audioUrl: "C:/Users/Bassam/Downloads/Music/Al-Fatihah.mp3" },
    { number: 2, name: "Al-Baqarah", nameArabic: "البقرة", ayahs: 286, type: "Madani", audioUrl: "https://server7.mp3quran.net/ahmed/002.mp3" },
    { number: 3, name: "Ali 'Imran", nameArabic: "آل عمران", ayahs: 200, type: "Madani", audioUrl: "https://server7.mp3quran.net/ahmed/003.mp3" },
    { number: 4, name: "An-Nisa", nameArabic: "النساء", ayahs: 176, type: "Madani", audioUrl: "https://server7.mp3quran.net/ahmed/004.mp3" },
    { number: 5, name: "Al-Ma'idah", nameArabic: "المائدة", ayahs: 120, type: "Madani", audioUrl: "https://server7.mp3quran.net/ahmed/005.mp3" },
    { number: 6, name: "Al-An'am", nameArabic: "الأنعام", ayahs: 165, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/006.mp3" },
    { number: 7, name: "Al-A'raf", nameArabic: "الأعراف", ayahs: 206, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/007.mp3" },
    { number: 8, name: "Al-Anfal", nameArabic: "الأنفال", ayahs: 75, type: "Madani", audioUrl: "https://server7.mp3quran.net/ahmed/008.mp3" },
    { number: 9, name: "At-Tawbah", nameArabic: "التوبة", ayahs: 129, type: "Madani", audioUrl: "https://server7.mp3quran.net/ahmed/009.mp3" },
    { number: 10, name: "Yunus", nameArabic: "يونس", ayahs: 109, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/010.mp3" },
    { number: 11, name: "Hud", nameArabic: "هود", ayahs: 123, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/011.mp3" },
    { number: 12, name: "Yusuf", nameArabic: "يوسف", ayahs: 111, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/012.mp3" },
    { number: 13, name: "Ar-Ra'd", nameArabic: "الرعد", ayahs: 43, type: "Madani", audioUrl: "https://server7.mp3quran.net/ahmed/013.mp3" },
    { number: 14, name: "Ibrahim", nameArabic: "إبراهيم", ayahs: 52, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/014.mp3" },
    { number: 15, name: "Al-Hijr", nameArabic: "الحجر", ayahs: 99, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/015.mp3" },
    { number: 16, name: "An-Nahl", nameArabic: "النحل", ayahs: 128, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/016.mp3" },
    { number: 17, name: "Al-Isra", nameArabic: "الإسراء", ayahs: 111, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/017.mp3" },
    { number: 18, name: "Al-Kahf", nameArabic: "الكهف", ayahs: 110, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/018.mp3" },
    { number: 19, name: "Maryam", nameArabic: "مريم", ayahs: 98, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/019.mp3" },
    { number: 20, name: "Taha", nameArabic: "طه", ayahs: 135, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/020.mp3" },
    { number: 21, name: "Al-Anbya", nameArabic: "الأنبياء", ayahs: 112, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/021.mp3" },
    { number: 22, name: "Al-Hajj", nameArabic: "الحج", ayahs: 78, type: "Madani", audioUrl: "https://server7.mp3quran.net/ahmed/022.mp3" },
    { number: 23, name: "Al-Mu'minun", nameArabic: "المؤمنون", ayahs: 118, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/023.mp3" },
    { number: 24, name: "An-Nur", nameArabic: "النور", ayahs: 64, type: "Madani", audioUrl: "https://server7.mp3quran.net/ahmed/024.mp3" },
    { number: 25, name: "Al-Furqan", nameArabic: "الفرقان", ayahs: 77, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/025.mp3" },
    { number: 26, name: "Ash-Shu'ara", nameArabic: "الشعراء", ayahs: 227, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/026.mp3" },
    { number: 27, name: "An-Naml", nameArabic: "النمل", ayahs: 93, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/027.mp3" },
    { number: 28, name: "Al-Qasas", nameArabic: "القصص", ayahs: 88, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/028.mp3" },
    { number: 29, name: "Al-'Ankabut", nameArabic: "العنكبوت", ayahs: 69, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/029.mp3" },
    { number: 30, name: "Ar-Rum", nameArabic: "الروم", ayahs: 60, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/030.mp3" },
    { number: 31, name: "Luqman", nameArabic: "لقمان", ayahs: 34, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/031.mp3" },
    { number: 32, name: "As-Sajdah", nameArabic: "السجدة", ayahs: 30, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/032.mp3" },
    { number: 33, name: "Al-Ahzab", nameArabic: "الأحزاب", ayahs: 73, type: "Madani", audioUrl: "https://server7.mp3quran.net/ahmed/033.mp3" },
    { number: 34, name: "Saba", nameArabic: "سبإ", ayahs: 54, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/034.mp3" },
    { number: 35, name: "Fatir", nameArabic: "فاطر", ayahs: 45, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/035.mp3" },
    { number: 36, name: "Ya-Sin", nameArabic: "يس", ayahs: 83, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/036.mp3" },
    { number: 37, name: "As-Saffat", nameArabic: "الصافات", ayahs: 182, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/037.mp3" },
    { number: 38, name: "Sad", nameArabic: "ص", ayahs: 88, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/038.mp3" },
    { number: 39, name: "Az-Zumar", nameArabic: "الزمر", ayahs: 75, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/039.mp3" },
    { number: 40, name: "Ghafir", nameArabic: "غافر", ayahs: 85, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/040.mp3" },
    { number: 41, name: "Fussilat", nameArabic: "فصلت", ayahs: 54, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/041.mp3" },
    { number: 42, name: "Ash-Shuraa", nameArabic: "الشورى", ayahs: 53, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/042.mp3" },
    { number: 43, name: "Az-Zukhruf", nameArabic: "الزخرف", ayahs: 89, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/043.mp3" },
    { number: 44, name: "Ad-Dukhan", nameArabic: "الدخان", ayahs: 59, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/044.mp3" },
    { number: 45, name: "Al-Jathiyah", nameArabic: "الجاثية", ayahs: 37, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/045.mp3" },
    { number: 46, name: "Al-Ahqaf", nameArabic: "الأحقاف", ayahs: 35, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/046.mp3" },
    { number: 47, name: "Muhammad", nameArabic: "محمد", ayahs: 38, type: "Madani", audioUrl: "https://server7.mp3quran.net/ahmed/047.mp3" },
    { number: 48, name: "Al-Fath", nameArabic: "الفتح", ayahs: 29, type: "Madani", audioUrl: "https://server7.mp3quran.net/ahmed/048.mp3" },
    { number: 49, name: "Al-Hujurat", nameArabic: "الحجرات", ayahs: 18, type: "Madani", audioUrl: "https://server7.mp3quran.net/ahmed/049.mp3" },
    { number: 50, name: "Qaf", nameArabic: "ق", ayahs: 45, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/050.mp3" },
    { number: 51, name: "Adh-Dhariyat", nameArabic: "الذاريات", ayahs: 60, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/051.mp3" },
    { number: 52, name: "At-Tur", nameArabic: "الطور", ayahs: 49, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/052.mp3" },
    { number: 53, name: "An-Najm", nameArabic: "النجم", ayahs: 62, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/053.mp3" },
    { number: 54, name: "Al-Qamar", nameArabic: "القمر", ayahs: 55, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/054.mp3" },
    { number: 55, name: "Ar-Rahman", nameArabic: "الرحمن", ayahs: 78, type: "Madani", audioUrl: "https://server7.mp3quran.net/ahmed/055.mp3" },
    { number: 56, name: "Al-Waqi'ah", nameArabic: "الواقعة", ayahs: 96, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/056.mp3" },
    { number: 57, name: "Al-Hadid", nameArabic: "الحديد", ayahs: 29, type: "Madani", audioUrl: "https://server7.mp3quran.net/ahmed/057.mp3" },
    { number: 58, name: "Al-Mujadila", nameArabic: "المجادلة", ayahs: 22, type: "Madani", audioUrl: "https://server7.mp3quran.net/ahmed/058.mp3" },
    { number: 59, name: "Al-Hashr", nameArabic: "الحشر", ayahs: 24, type: "Madani", audioUrl: "https://server7.mp3quran.net/ahmed/059.mp3" },
    { number: 60, name: "Al-Mumtahanah", nameArabic: "الممتحنة", ayahs: 13, type: "Madani", audioUrl: "https://server7.mp3quran.net/ahmed/060.mp3" },
    { number: 61, name: "As-Saf", nameArabic: "الصف", ayahs: 14, type: "Madani", audioUrl: "https://server7.mp3quran.net/ahmed/061.mp3" },
    { number: 62, name: "Al-Jumu'ah", nameArabic: "الجمعة", ayahs: 11, type: "Madani", audioUrl: "https://server7.mp3quran.net/ahmed/062.mp3" },
    { number: 63, name: "Al-Munafiqun", nameArabic: "المنافقون", ayahs: 11, type: "Madani", audioUrl: "https://server7.mp3quran.net/ahmed/063.mp3" },
    { number: 64, name: "At-Taghabun", nameArabic: "التغابن", ayahs: 18, type: "Madani", audioUrl: "https://server7.mp3quran.net/ahmed/064.mp3" },
    { number: 65, name: "At-Talaq", nameArabic: "الطلاق", ayahs: 12, type: "Madani", audioUrl: "https://server7.mp3quran.net/ahmed/065.mp3" },
    { number: 66, name: "At-Tahrim", nameArabic: "التحريم", ayahs: 12, type: "Madani", audioUrl: "https://server7.mp3quran.net/ahmed/066.mp3" },
    { number: 67, name: "Al-Mulk", nameArabic: "الملك", ayahs: 30, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/067.mp3" },
    { number: 68, name: "Al-Qalam", nameArabic: "القلم", ayahs: 52, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/068.mp3" },
    { number: 69, name: "Al-Haqqah", nameArabic: "الحاقة", ayahs: 52, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/069.mp3" },
    { number: 70, name: "Al-Ma'arij", nameArabic: "المعارج", ayahs: 44, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/070.mp3" },
    { number: 71, name: "Nuh", nameArabic: "نوح", ayahs: 28, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/071.mp3" },
    { number: 72, name: "Al-Jinn", nameArabic: "الجن", ayahs: 28, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/072.mp3" },
    { number: 73, name: "Al-Muzzammil", nameArabic: "المزمل", ayahs: 20, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/073.mp3" },
    { number: 74, name: "Al-Muddaththir", nameArabic: "المدثر", ayahs: 56, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/074.mp3" },
    { number: 75, name: "Al-Qiyamah", nameArabic: "القيامة", ayahs: 40, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/075.mp3" },
    { number: 76, name: "Al-Insan", nameArabic: "الإنسان", ayahs: 31, type: "Madani", audioUrl: "https://server7.mp3quran.net/ahmed/076.mp3" },
    { number: 77, name: "Al-Mursalat", nameArabic: "المرسلات", ayahs: 50, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/077.mp3" },
    { number: 78, name: "An-Naba", nameArabic: "النبأ", ayahs: 40, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/078.mp3" },
    { number: 79, name: "An-Nazi'at", nameArabic: "النازعات", ayahs: 46, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/079.mp3" },
    { number: 80, name: "'Abasa", nameArabic: "عبس", ayahs: 42, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/080.mp3" },
    { number: 81, name: "At-Takwir", nameArabic: "التكوير", ayahs: 29, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/081.mp3" },
    { number: 82, name: "Al-Infitar", nameArabic: "الإنفطار", ayahs: 19, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/082.mp3" },
    { number: 83, name: "Al-Mutaffifin", nameArabic: "المطففين", ayahs: 36, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/083.mp3" },
    { number: 84, name: "Al-Inshiqaq", nameArabic: "الإنشقاق", ayahs: 25, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/084.mp3" },
    { number: 85, name: "Al-Buruj", nameArabic: "البروج", ayahs: 22, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/085.mp3" },
    { number: 86, name: "At-Tariq", nameArabic: "الطارق", ayahs: 17, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/086.mp3" },
    { number: 87, name: "Al-A'la", nameArabic: "الأعلى", ayahs: 19, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/087.mp3" },
    { number: 88, name: "Al-Ghashiyah", nameArabic: "الغاشية", ayahs: 26, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/088.mp3" },
    { number: 89, name: "Al-Fajr", nameArabic: "الفجر", ayahs: 30, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/089.mp3" },
    { number: 90, name: "Al-Balad", nameArabic: "البلد", ayahs: 20, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/090.mp3" },
    { number: 91, name: "Ash-Shams", nameArabic: "الشمس", ayahs: 15, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/091.mp3" },
    { number: 92, name: "Al-Layl", nameArabic: "الليل", ayahs: 21, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/092.mp3" },
    { number: 93, name: "Ad-Duhaa", nameArabic: "الضحى", ayahs: 11, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/093.mp3" },
    { number: 94, name: "Ash-Sharh", nameArabic: "الشرح", ayahs: 8, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/094.mp3" },
    { number: 95, name: "At-Tin", nameArabic: "التين", ayahs: 8, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/095.mp3" },
    { number: 96, name: "Al-'Alaq", nameArabic: "العلق", ayahs: 19, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/096.mp3" },
    { number: 97, name: "Al-Qadr", nameArabic: "القدر", ayahs: 5, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/097.mp3" },
    { number: 98, name: "Al-Bayyinah", nameArabic: "البينة", ayahs: 8, type: "Madani", audioUrl: "https://server7.mp3quran.net/ahmed/098.mp3" },
    { number: 99, name: "Az-Zalzalah", nameArabic: "الزلزلة", ayahs: 8, type: "Madani", audioUrl: "https://server7.mp3quran.net/ahmed/099.mp3" },
    { number: 100, name: "Al-'Adiyat", nameArabic: "العاديات", ayahs: 11, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/100.mp3" },
    { number: 101, name: "Al-Qari'ah", nameArabic: "القارعة", ayahs: 11, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/101.mp3" },
    { number: 102, name: "At-Takathur", nameArabic: "التكاثر", ayahs: 8, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/102.mp3" },
    { number: 103, name: "Al-'Asr", nameArabic: "العصر", ayahs: 3, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/103.mp3" },
    { number: 104, name: "Al-Humazah", nameArabic: "الهمزة", ayahs: 9, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/104.mp3" },
    { number: 105, name: "Al-Fil", nameArabic: "الفيل", ayahs: 5, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/105.mp3" },
    { number: 106, name: "Quraysh", nameArabic: "قريش", ayahs: 4, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/106.mp3" },
    { number: 107, name: "Al-Ma'un", nameArabic: "الماعون", ayahs: 7, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/107.mp3" },
    { number: 108, name: "Al-Kawthar", nameArabic: "الكوثر", ayahs: 3, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/108.mp3" },
    { number: 109, name: "Al-Kafirun", nameArabic: "الكافرون", ayahs: 6, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/109.mp3" },
    { number: 110, name: "An-Nasr", nameArabic: "النصر", ayahs: 3, type: "Madani", audioUrl: "https://server7.mp3quran.net/ahmed/110.mp3" },
    { number: 111, name: "Al-Masad", nameArabic: "المسد", ayahs: 5, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/111.mp3" },
    { number: 112, name: "Al-Ikhlas", nameArabic: "الإخلاص", ayahs: 4, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/112.mp3" },
    { number: 113, name: "Al-Falaq", nameArabic: "الفلق", ayahs: 5, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/113.mp3" },
    { number: 114, name: "An-Nas", nameArabic: "الناس", ayahs: 6, type: "Makkah", audioUrl: "https://server7.mp3quran.net/ahmed/114.mp3" }
];

// ===== BOOKS DATA WITH AUTO IDS =====
const booksData = [
    { 
        title: "madina-book-1", 
        titleEn: "madina-book-1", 
        titleAr: "صحيح مسلم",
        author: "Imam Muslim", 
        authorEn: "Imam Muslim", 
        authorAr: "الإمام مسلم",
        image: "Images/see.jpg",
        category: "hadith",
        type: "pdf",
        pdfUrl: "Document/reba.pdf"
    },
    { 
        title: "Riyad as-Salihin", 
        titleEn: "Riyad as-Salihin", 
        titleAr: "رياض الصالحين",
        author: "Imam Nawawi", 
        authorEn: "Imam Nawawi", 
        authorAr: "الإمام النووي",
        image: "Images/ok11.jpg",
        category: "hadith",
        type: "text",
        content: "Iki gitabo kirimo hadithi nyinshi zifasha umwemeramana mu buzima bwe bwa buri munsi."
    }
];

// ===== VIDEOS DATA WITH AUTO IDS =====
const videosData = [
    { 
        title: "Isomo rya Tauhid", 
        titleEn: "Lesson of Tawheed", 
        titleAr: "درس التوحيد",
        author: "Sheikh Uqash", 
        authorEn: "Sheikh Uqash", 
        authorAr: "الشيخ عقاش",
        thumbnail: "Images/ok9.jpg", 
        videoUrl: "Videos/1.mp4"
    },
    { 
        title: "Isomo rya Tauhid", 
        titleEn: "Lesson of Tawheed", 
        titleAr: "درس التوحيد",
        author: "Sheikh Uqash", 
        authorEn: "Sheikh Uqash", 
        authorAr: "الشيخ عقاش",
        thumbnail: "Images/ok9.jpg", 
        videoUrl: "Videos/2.mp4"
    },
    { 
        title: "Isomo rya Tauhid", 
        titleEn: "Lesson of Tawheed", 
        titleAr: "درس التوحيد",
        author: "Sheikh Uqash", 
        authorEn: "Sheikh Uqash", 
        authorAr: "الشيخ عقاش",
        thumbnail: "Images/ok9.jpg", 
        videoUrl: "Videos/3.mp4"
    },
    { 
        title: "Isomo rya Tauhid", 
        titleEn: "Lesson of Tawheed", 
        titleAr: "درس التوحيد",
        author: "Sheikh Uqash", 
        authorEn: "Sheikh Uqash", 
        authorAr: "الشيخ عقاش",
        thumbnail: "Images/ok9.jpg", 
        videoUrl: "Videos/4.mp4"
    },
    { 
        title: "Isomo rya Tauhid", 
        titleEn: "Lesson of Tawheed", 
        titleAr: "درس التوحيد",
        author: "Sheikh Uqash", 
        authorEn: "Sheikh Uqash", 
        authorAr: "الشيخ عقاش",
        thumbnail: "Images/ok9.jpg", 
        videoUrl: "Videos/5.mp4"
    }
];

// Generate all IDs automatically
generateIds();

// ===== TRANSLATIONS =====
const translations = {
    rw: {
        welcomeTitle: "Sobanukirwa Ubu Islam",
        welcomeSubtitle: "Menya ukuri, ubuhanga, n'ubwiza bwa Islam",
        home: "Ahabanza",
        qibla: "Qibla",
        qiblaDesc: "Shakisha icyerekezo cya Kaaba",
        prayer: "Isengesho",
        prayerTimes: "Ibihe by'Isengesho",
        prayerDesc: "Ibihe nyabyo by'amasengesho",
        quran: "Qur'an",
        quranDesc: "Soma untege amatwi",
        audioLessons: "Inyigisho za Audio",
        audioDesc: "Amasomo ya audio",
        books: "Ibisomwa",
        booksDesc: "Soma ibitabo",
        videos: "Amashusho",
        videosDesc: "Reba amashusho",
        about: "Ibyerekeye",
        aboutDesc: "Menya byinshi kuri twe",
        back: "Subira Inyuma",
        settings: "Igenamiterere",
        silentMode: "Ibyumweru byo guceceka",
        enableSilent: "Koresha uburyo bwo guceceka",
        smartSilent: "Guceceka mu bihe by'amasengesho",
        from: "Kuva",
        to: "Kugeza",
        dailyAdhkar: "Adhkar za buri munsi",
        gloryBeToAllah: "Ibyubahiro ni ibya Allah",
        praiseBeToAllah: "Ishimwe n'ikuzo ni ibya Allah",
        allahIsGreatest: "Allah ni Umukuru w'ikirenga",
        north: "N",
        south: "S",
        east: "E",
        west: "W",
        kaaba: "Kaaba",
        calculating: "Turimo kubara...",
        calibrate: "Gusana compass",
        nextPrayer: "Isengesho rikurikira:",
        nextPrayerIn: "Isengesho rikurikira:",
        teachers: "Abasobanuzi",
        lessons: "Inyigisho",
        footer: "byose bikubiye muri Qur'an na Sunah z'intumwa y'imana Muhamad(S.A.W).",
        searchSurah: "Shakisha Surati...",
        searchLesson: "Shakisha inyigisho...",
        searchArtist: "Shakisha umusobanuzi...",
        backToArtists: "Subira ku Basobanuzi",
        aboutText1: "Sobanukirwa ni urubuga rwo kwigisha Islamic mu rurimi rw'Ikinyarwanda. Dufite intego yo gufasha abantu kumenya ukuri, ubuhanga, n'ubwiza bwa Islam.",
        aboutText2: "Twifuza ko uzabona inyigisho zifatika hano. Allah nawe aduhe gukora ibimushimisha.",
        aboutSubtitle: "Urumuri rw'Imyemero",
        aboutTag: "Ubumenyi bw'Igisilamu",
        bismillahTrans: "Mwimerere w'Imana yose, Nyir'Impuhuzo, Nyir'Impuhuzo",
        features: "Ibikoresho",
        ourApps: "Porogaramu zacu",
        followUs: "Duherereye",
        duaText: "Rabana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina 'adhaban-nar.",
        duaTrans: "Yesu wacu, tuhe ikuzwa mu buzima bw'isi no mu buzima bwo hasi y'umuhero. Turinde ukuboko kw'inkoko.",
        loadingSubtitle: "Menya ukuri, ubuhanga, n'ubwiza bwa Islam",
        silentModeActive: "Ibyumweru byo guceceka birakora",
        reminders: "Icyibutso",
        enableReminders: "Koresha icyibutso",
        interval: "Igihe hagati y'ibyibutso (iminota)",
        qiblaFinder: "Icyerekezo cya Qibla",
        adhanSettings: "Igenamiterere rya Adhan",
        enableAdhan: "Koresha Adhan",
        volume: "Umuvuduko w'amajwi",
        prayerTimeMessage: "Ni igihe cy'isengesho",
        watch: "Reba",
        read: "Soma",
        loading: "Ikurura...",
        download: "Kumanura",
        customAdhan: "Shyiraho Adhan yawe",
        chooseFile: "Hitamo fayili y'amajwi",
        adhanUploadInfo: "Shyiraho fayili ya Adhan ukunda (MP3, WAV, M4A)",
        removeFile: "Kuraho",
        playstore: "Kuramo Izindi Porogaramu zacu za Kiyisilamu"
    },
    en: {
        welcomeTitle: "Understand Islam",
        welcomeSubtitle: "Learn the truth, knowledge, and beauty of Islam",
        home: "Home",
        qibla: "Qibla",
        qiblaDesc: "Find direction of Kaaba",
        prayer: "Prayer",
        prayerTimes: "Prayer Times",
        prayerDesc: "Accurate prayer times",
        quran: "Qur'an",
        quranDesc: "Read and listen",
        audioLessons: "Audio Lessons",
        audioDesc: "Audio lessons",
        books: "Books",
        booksDesc: "Read books",
        videos: "Videos",
        videosDesc: "Watch videos",
        about: "About",
        aboutDesc: "Learn about us",
        back: "Back",
        settings: "Settings",
        silentMode: "Silent Mode",
        enableSilent: "Enable Silent Mode",
        smartSilent: "Smart Silent (Prayer Times)",
        from: "From",
        to: "To",
        dailyAdhkar: "Daily Adhkar",
        gloryBeToAllah: "Glory be to Allah",
        praiseBeToAllah: "Praise be to Allah",
        allahIsGreatest: "Allah is the Greatest",
        north: "N",
        south: "S",
        east: "E",
        west: "W",
        kaaba: "Kaaba",
        calculating: "Calculating...",
        calibrate: "Calibrate Compass",
        nextPrayer: "Next prayer:",
        nextPrayerIn: "Next prayer in:",
        teachers: "Teachers",
        lessons: "Lessons",
        footer: "All rights reserved",
        searchSurah: "Search Surah...",
        searchLesson: "Search lesson...",
        searchArtist: "Search artist...",
        backToArtists: "Back to Artists",
        aboutText1: "Sobanukirwa is an Islamic learning platform in Kinyarwanda. Our goal is to help people understand the truth, knowledge, and beauty of Islam.",
        aboutText2: "We hope you find beneficial lessons here. May Allah help us do what pleases Him.",
        aboutSubtitle: "Light of Faith",
        aboutTag: "Islamic Knowledge",
        bismillahTrans: "In the name of Allah, the Most Gracious, the Most Merciful",
        features: "Features",
        ourApps: "Our Apps",
        followUs: "Follow Us",
        duaText: "Our Lord, give us in this world good and in the Hereafter good and protect us from the Fire.",
        duaTrans: "Our Lord, give us in this world good and in the Hereafter good and protect us from the Fire.",
        loadingSubtitle: "Learn the truth, knowledge, and beauty of Islam",
        silentModeActive: "Silent Mode Active",
        reminders: "Reminders",
        enableReminders: "Enable Reminders",
        interval: "Interval (minutes)",
        qiblaFinder: "Qibla Finder",
        adhanSettings: "Adhan Settings",
        enableAdhan: "Enable Adhan",
        volume: "Volume",
        prayerTimeMessage: "It's time for prayer",
        watch: "Watch",
        read: "Read",
        loading: "Loading...",
        download: "Download",
        customAdhan: "Upload Custom Adhan",
        chooseFile: "Choose audio file",
        adhanUploadInfo: "Upload your favorite Adhan file (MP3, WAV, M4A)",
        removeFile: "Remove",
        playstore: "Download Our Other Islamic Apps"
    },
    ar: {
        welcomeTitle: "افهم الإسلام",
        welcomeSubtitle: "تعلم الحقيقة والمعرفة وجمال الإسلام",
        home: "الرئيسية",
        qibla: "القبلة",
        qiblaDesc: "اعثر على اتجاه القبلة",
        prayer: "الصلاة",
        prayerTimes: "مواقيت الصلاة",
        prayerDesc: "مواقيت صلاة دقيقة",
        quran: "القرآن",
        quranDesc: "اقرأ واستمع",
        audioLessons: "الدروس الصوتية",
        audioDesc: "دروس صوتية",
        books: "الكتب",
        booksDesc: "اقرأ الكتب",
        videos: "الفيديو",
        videosDesc: "شاهد الفيديو",
        about: "حول",
        aboutDesc: "تعرف علينا",
        back: "رجوع",
        settings: "الإعدادات",
        silentMode: "الوضع الصامت",
        enableSilent: "تفعيل الوضع الصامت",
        smartSilent: "صامت ذكي (أوقات الصلاة)",
        from: "من",
        to: "إلى",
        dailyAdhkar: "الأذكار اليومية",
        gloryBeToAllah: "سبحان الله",
        praiseBeToAllah: "الحمد لله",
        allahIsGreatest: "الله أكبر",
        north: "شمال",
        south: "جنوب",
        east: "شرق",
        west: "غرب",
        kaaba: "الكعبة",
        calculating: "جاري الحساب...",
        calibrate: "معايرة البوصلة",
        nextPrayer: "الصلاة القادمة:",
        nextPrayerIn: "الصلاة القادمة بعد:",
        teachers: "المعلمون",
        lessons: "الدروس",
        footer: "جميع الحقوق محفوظة",
        searchSurah: "ابحث عن سورة...",
        searchLesson: "ابحث عن درس...",
        searchArtist: "ابحث عن فنان...",
        backToArtists: "العودة إلى الفنانين",
        aboutText1: "سوبانوكيروا منصة تعليم إسلامي باللغة الكينيارواندية. هدفنا مساعدة الناس على فهم الحقيقة والمعرفة وجمال الإسلام.",
        aboutText2: "نأمل أن تجد دروساً مفيدة هنا. وفقنا الله لفعل ما يرضيه.",
        aboutSubtitle: "نور الإيمان",
        aboutTag: "المعرفة الإسلامية",
        bismillahTrans: "بسم الله الرحمن الرحيم",
        features: "المميزات",
        ourApps: "تطبيقاتنا",
        followUs: "تابعنا",
        duaText: "ربنا آتنا في الدنيا حسنة وفي الآخرة حسنة وقنا عذاب النار",
        duaTrans: "ربنا آتنا في الدنيا حسنة وفي الآخرة حسنة وقنا عذاب النار",
        loadingSubtitle: "تعلم الحقيقة والمعرفة وجمال الإسلام",
        silentModeActive: "الوضع الصامت نشط",
        reminders: "تذكيرات",
        enableReminders: "تفعيل التذكيرات",
        interval: "الفاصل الزمني (دقائق)",
        qiblaFinder: "محدد القبلة",
        adhanSettings: "إعدادات الأذان",
        enableAdhan: "تفعيل الأذان",
        volume: "مستوى الصوت",
        prayerTimeMessage: "حان وقت الصلاة",
        watch: "شاهد",
        read: "اقرأ",
        loading: "جار التحميل...",
        download: "تحميل",
        customAdhan: "رفع أذان مخصص",
        chooseFile: "اختر ملف صوتي",
        adhanUploadInfo: "رفع ملف الأذان المفضل لديك (MP3, WAV, M4A)",
        removeFile: "إزالة",
        playstore: "حمّل تطبيقاتنا الإسلامية الأخرى"
    }
};

// ===== STATE =====
let currentLanguage = localStorage.getItem('language') || 'rw';
let silentMode = false;
let smartSilent = false;
let adhanEnabled = true;
let adhanVolume = 100;
let remindersEnabled = false;
let counters = [0, 0, 0, 0, 0];
const maxCounts = [33, 33, 34, 100, 100];
let currentQibla = 0;
let compassHeading = 0;
let watchId = null;
let prayerTimes = null;
let userLat = -1.9403;
let userLng = 29.8739;
let audioDurationsLoaded = false;
let videoDurationsLoaded = false;
let customAdhanBlob = null;
let customAdhanUrl = null;
let selectedArtist = null;
let currentTrack = null;
let currentTrackIndex = 0;
let isPlaying = false;
let isRandom = false;
let isRepeat = false;
let audio = new Audio();
let updateTimer = null;
let currentTracks = [];
let currentSurahIndex = -1;

// ===== AUDIO MANAGER =====
class AudioManager {
    constructor() {
        this.audioElements = {
            quran: document.getElementById('quranAudio'),
            lessons: audio,
            adhan: document.getElementById('adhanAudio')
        };
        this.currentSource = null;
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        if (this.audioElements.quran) {
            this.audioElements.quran.addEventListener('play', () => {
                this.stopOtherSources('quran');
                this.currentSource = 'quran';
                document.getElementById('quranPlayer')?.classList.add('active');
            });
            
            this.audioElements.quran.addEventListener('pause', () => {
                if (this.currentSource === 'quran') {
                    document.getElementById('quranPlayer')?.classList.remove('active');
                }
            });
        }
        
        audio.addEventListener('play', () => {
            this.stopOtherSources('lessons');
            this.currentSource = 'lessons';
        });
    }
    
    stopOtherSources(playingSource) {
        if (playingSource !== 'quran' && this.audioElements.quran && !this.audioElements.quran.paused) {
            this.audioElements.quran.pause();
        }
        if (playingSource !== 'lessons' && !audio.paused) {
            audio.pause();
            isPlaying = false;
            updatePlayPauseButton();
            playerArt?.classList.remove('rotate');
        }
    }
    
    stopAll() {
        if (this.audioElements.quran) this.audioElements.quran.pause();
        audio.pause();
        isPlaying = false;
        updatePlayPauseButton();
        playerArt?.classList.remove('rotate');
        this.currentSource = null;
    }
}

// ===== PDF MANAGER FOR QUICK OPENING =====
class PDFManager {
    constructor() {
        this.pdfDoc = null;
        this.currentPage = 1;
    }
    
    async openPDF(url, title) {
        // Open PDF in new tab for quick viewing
        window.open(url, '_blank');
        
        // Also show in document reader if needed
        this.showInReader(url, title);
    }
    
    showInReader(url, title) {
        const documentReader = document.getElementById('documentReader');
        const documentViewer = document.getElementById('documentViewer');
        const documentTitle = document.getElementById('documentTitle');
        
        if (!documentReader || !documentViewer) return;
        
        documentTitle.textContent = title;
        documentReader.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Create PDF viewer with iframe for quick loading
        documentViewer.innerHTML = `
            <div class="pdf-quick-viewer">
                <iframe 
                    src="${url}" 
                    class="pdf-iframe"
                    frameborder="0"
                    allowfullscreen
                ></iframe>
                <div class="pdf-quick-actions">
                    <a href="${url}" download class="pdf-download-btn">
                        <i class="fas fa-download"></i> Download PDF
                    </a>
                    <a href="${url}" target="_blank" class="pdf-open-btn">
                        <i class="fas fa-external-link-alt"></i> Open in New Tab
                    </a>
                </div>
            </div>
        `;
    }
}

// ===== SILENT MODE MANAGER =====
class SilentModeManager {
    constructor() {
        this.enabled = localStorage.getItem('scheduledSilent') === 'true';
        this.startTime = localStorage.getItem('silentStart') || '22:00';
        this.endTime = localStorage.getItem('silentEnd') || '06:00';
        this.active = false;
        this.originalVolumes = new Map();
        this.prayerMuteTimes = this.loadPrayerMuteSettings();
        this.startMonitoring();
    }
    
    loadPrayerMuteSettings() {
        try {
            const saved = localStorage.getItem('prayerMuteTimes');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.log('Error loading prayer mute settings:', e);
        }
        
        return [
            { prayer: 'Fajr', minutes: 15 },
            { prayer: 'Dhuhr', minutes: 15 },
            { prayer: 'Asr', minutes: 15 },
            { prayer: 'Maghrib', minutes: 15 },
            { prayer: 'Isha', minutes: 15 }
        ];
    }
    
    startMonitoring() {
        setInterval(() => this.checkSilentMode(), 30000);
        this.checkSilentMode();
    }
    
    checkSilentMode() {
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        let shouldBeSilent = false;
        
        if (this.enabled) {
            shouldBeSilent = this.isInTimeRange(currentTime, this.startTime, this.endTime);
        }
        
        if (!shouldBeSilent && smartSilent && prayerTimes) {
            shouldBeSilent = this.isPrayerTime(currentTime);
        }
        
        if (shouldBeSilent && !this.active) {
            this.activateSilentMode();
        } else if (!shouldBeSilent && this.active) {
            this.deactivateSilentMode();
        }
    }
    
    isPrayerTime(currentTime) {
        if (!prayerTimes) return false;
        
        const currentMins = this.timeToMinutes(currentTime);
        
        for (let prayer of this.prayerMuteTimes) {
            const prayerTime = prayerTimes[prayer.prayer];
            if (!prayerTime) continue;
            
            const prayerMins = this.timeToMinutes(prayerTime);
            const diff = Math.abs(currentMins - prayerMins);
            
            if (diff <= prayer.minutes) {
                return true;
            }
        }
        
        return false;
    }
    
    isInTimeRange(current, start, end) {
        const currentMins = this.timeToMinutes(current);
        const startMins = this.timeToMinutes(start);
        const endMins = this.timeToMinutes(end);
        
        if (startMins <= endMins) {
            return currentMins >= startMins && currentMins <= endMins;
        } else {
            return currentMins >= startMins || currentMins <= endMins;
        }
    }
    
    timeToMinutes(time) {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }
    
    activateSilentMode() {
        console.log('Silent mode activated');
        this.active = true;
        
        const audioElements = document.querySelectorAll('audio, video');
        audioElements.forEach(el => {
            if (!this.originalVolumes.has(el)) {
                this.originalVolumes.set(el, el.volume);
            }
            el.volume = 0;
        });
        
        const indicator = document.getElementById('silentModeIndicator');
        if (indicator) {
            indicator.classList.add('active');
            
            clearTimeout(this.indicatorTimeout);
            this.indicatorTimeout = setTimeout(() => {
                indicator.classList.remove('active');
            }, 3000);
        }
    }
    
    deactivateSilentMode() {
        console.log('Silent mode deactivated');
        
        this.originalVolumes.forEach((volume, el) => {
            el.volume = volume;
        });
        this.originalVolumes.clear();
        
        this.active = false;
        
        const indicator = document.getElementById('silentModeIndicator');
        if (indicator) {
            indicator.classList.remove('active');
        }
    }
    
    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('scheduledSilent', this.enabled);
        
        if (!this.enabled && this.active) {
            this.deactivateSilentMode();
        } else if (this.enabled) {
            this.checkSilentMode();
        }
    }
    
    setSchedule(start, end) {
        this.startTime = start;
        this.endTime = end;
        localStorage.setItem('silentStart', start);
        localStorage.setItem('silentEnd', end);
        this.checkSilentMode();
    }
}

// ===== PRAYER TIMES MANAGER =====
class PrayerTimesManager {
    constructor() {
        this.cache = {};
        this.methods = {
            MWL: 3,
            ISNA: 2,
            Egypt: 5,
            Makkahh: 4,
            Karachi: 1,
            Tehran: 7,
            Custom: 99
        };
        this.currentMethod = 3;
    }
    
    async getPrayerTimes(lat, lng, date = new Date()) {
        const cacheKey = `${lat}_${lng}_${date.toDateString()}`;
        
        if (this.cache[cacheKey]) {
            console.log('Using cached prayer times');
            return this.cache[cacheKey];
        }
        
        const apis = [
            this.fetchFromAladhan(lat, lng, date),
            this.calculateOffline(lat, lng, date)
        ];
        
        for (let api of apis) {
            try {
                const times = await api;
                if (times) {
                    this.cache[cacheKey] = times;
                    return times;
                }
            } catch (error) {
                console.log('API failed, trying next...');
            }
        }
        
        return this.calculateOffline(lat, lng, date);
    }
    
    async fetchFromAladhan(lat, lng, date) {
        const url = `https://api.aladhan.com/v1/timings/${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}?latitude=${lat}&longitude=${lng}&method=${this.currentMethod}`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.code === 200 && data.data) {
                return {
                    Fajr: data.data.timings.Fajr,
                    Sunrise: data.data.timings.Sunrise,
                    Dhuhr: data.data.timings.Dhuhr,
                    Asr: data.data.timings.Asr,
                    Maghrib: data.data.timings.Maghrib,
                    Isha: data.data.timings.Isha,
                    source: 'Aladhan API'
                };
            }
        } catch (error) {
            console.log('Aladhan API failed:', error);
        }
        return null;
    }
    
    calculateOffline(lat, lng, date) {
        // Simplified calculation for fallback
        return {
            Fajr: "05:00",
            Sunrise: "06:05",
            Dhuhr: "12:00",
            Asr: "15:30",
            Maghrib: "18:00",
            Isha: "19:30",
            source: 'Offline Calculation'
        };
    }
}

// ===== ADHAN MANAGER =====
class AdhanManager {
    constructor() {
        this.audio = document.getElementById('adhanAudio');
        this.currentReciter = localStorage.getItem('selectedReciter') || 'mishary';
        this.volume = parseInt(localStorage.getItem('adhanVolume')) || 100;
        this.enabled = localStorage.getItem('adhanEnabled') !== 'false';
        this.lastPlayed = {};
        this.setupAudioListeners();
    }
    
    setupAudioListeners() {
        this.audio.addEventListener('ended', () => {
            this.hideAdhanToast();
        });
    }
    
    async playAdhan(prayer) {
        if (!this.enabled) return;
        
        const now = Date.now();
        if (this.lastPlayed[prayer] && (now - this.lastPlayed[prayer]) < 30 * 60 * 1000) {
            return;
        }
        
        console.log(`Playing Adhan for ${prayer}`);
        this.showAdhanToast(prayer);
        this.sendNotification(prayer);
        this.audio.volume = this.volume / 100;
        
        const adhanUrls = {
            mishary: 'audio/Adhan2.mpeg',
            sudais: 'audio/Adhan1.mpeg',
            Mansour: 'audio/Mansour_Adhan.mpeg'
        };
        
        try {
            this.audio.src = adhanUrls[this.currentReciter];
            await this.audio.play();
            this.lastPlayed[prayer] = now;
            this.highlightPrayer(prayer);
        } catch (error) {
            console.log('Adhan playback failed');
        }
    }
    
    showAdhanToast(prayer) {
        const toast = document.getElementById('adhanToast');
        if (!toast) return;
        
        document.getElementById('adhanToastPrayer').textContent = prayer;
        document.getElementById('adhanToastMessage').textContent = `Time for ${prayer} prayer has arrived`;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 10000);
    }
    
    hideAdhanToast() {
        document.getElementById('adhanToast')?.classList.remove('show');
    }
    
    sendNotification(prayer) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Adhan Time', {
                body: `It's time for ${prayer} prayer. Allahu Akbar!`,
                icon: 'Images/logo2.png'
            });
        }
    }
    
    highlightPrayer(prayer) {
        document.querySelectorAll('.prayer-card').forEach(card => {
            card.classList.remove('adhan-playing');
        });
        
        const prayerCard = document.getElementById(`prayer-${prayer}`);
        if (prayerCard) {
            prayerCard.classList.add('adhan-playing');
        }
    }
    
    changeReciter(reciter) {
        this.currentReciter = reciter;
        localStorage.setItem('selectedReciter', reciter);
    }
    
    setVolume(volume) {
        this.volume = volume;
        if (this.audio) {
            this.audio.volume = this.volume / 100;
        }
        localStorage.setItem('adhanVolume', this.volume);
        
        const display = document.getElementById('adhanVolumeDisplay');
        if (display) {
            display.textContent = volume + '%';
        }
    }
    
    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('adhanEnabled', this.enabled);
        
        const toggle = document.getElementById('adhanToggle');
        if (toggle) {
            toggle.classList.toggle('active', this.enabled);
        }
    }
}

// ===== ADHKAR REMINDER MANAGER =====
class AdhkarReminderManager {
    constructor() {
        this.enabled = localStorage.getItem('adhkarReminders') !== 'false';
        this.interval = parseInt(localStorage.getItem('reminderInterval')) || 30;
        this.lastReminded = null;
        this.snoozeUntil = null;
        this.reminderInterval = null;
        this.currentAudio = null;
        
        this.adhkars = [
            { arabic: "سُبْحَانَ اللَّهِ", transliteration: "Subhanallah", translation: "Glory be to Allah", audio_url: "audio/Subhanallah.m4a" },
            { arabic: "الْحَمْدُ لِلَّهِ", transliteration: "Alhamdulillah", translation: "Praise be to Allah", audio_url: "audio/Subhanallah Alhamdulillah Wa La ilaha IlAllah (Dhikr).m4a" },
            { arabic: "اللَّهُ أَكْبَرُ", transliteration: "Allahu Akbar", translation: "Allah is the Greatest", audio_url: "audio/Subhanallah.m4a" },
            { arabic: "لَا إِلَٰهَ إِلَّا اللَّهُ", transliteration: "La ilaha illallah", translation: "There is no god but Allah", audio_url: "audio/Subhanallah Alhamdulillah Wa La ilaha IlAllah (Dhikr).m4a" },
            { arabic: "أَسْتَغْفِرُ اللَّهَ", transliteration: "Astaghfirullah", translation: "I seek forgiveness from Allah", audio_url: "audio/Subhanallah.m4a" },
            { arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", transliteration: "Subhanallahi wa bihamdihi", translation: "Glory and praise be to Allah", audio_url: "audio/Subhanallah.m4a" },
            { arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ", transliteration: "La hawla wa la quwwata illa billah", translation: "There is no power except with Allah", audio_url: "audio/Subhanallah.m4a" },
            { arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ", transliteration: "Allahumma salli ala Muhammad", translation: "O Allah, send blessings upon Muhammad", audio_url: "audio/Allahuma Salli Ala.m4a" }
        ];
        
        this.startReminders();
    }
    
    startReminders() {
        if (this.reminderInterval) {
            clearInterval(this.reminderInterval);
        }
        
        this.reminderInterval = setInterval(() => this.checkReminders(), 60000);
        this.checkReminders();
    }
    
    checkReminders() {
        if (!this.enabled) return;
        
        const now = Date.now();
        
        if (this.snoozeUntil && now < this.snoozeUntil) {
            return;
        }
        
        if (!this.lastReminded || (now - this.lastReminded) > this.interval * 60 * 1000) {
            this.showReminder();
        }
    }
    
    showReminder() {
        const randomAdhkar = this.adhkars[Math.floor(Math.random() * this.adhkars.length)];
        
        const popup = document.getElementById('adhkarReminderPopup');
        if (!popup) return;
        
        document.getElementById('reminderArabic').textContent = randomAdhkar.arabic;
        document.getElementById('reminderTransliteration').textContent = randomAdhkar.transliteration;
        document.getElementById('reminderTranslation').textContent = randomAdhkar.translation;
        
        popup.classList.add('show');
        
        this.lastReminded = Date.now();
        
        this.playReminderSound(randomAdhkar.audio_url);
        
        setTimeout(() => {
            popup.classList.remove('show');
        }, 120000);
    }
    
    playReminderSound(audioUrl) {
        if (!audioUrl) return;
        try {
            if (this.currentAudio) {
                this.currentAudio.pause();
                this.currentAudio = null;
            }
            this.currentAudio = new Audio('/' + audioUrl);
            this.currentAudio.volume = 0.6;
            this.currentAudio.play().catch(() => {});
        } catch (e) {}
    }
    
    snooze() {
        this.stopReminderSound();
        this.snoozeUntil = Date.now() + (5 * 60 * 1000);
        this.hideReminder();
        this.showToast('Reminder snoozed for 5 minutes');
    }
    
    dismiss() {
        this.stopReminderSound();
        this.hideReminder();
        this.showToast('Alhamdulillah! Remembered to recite Adhkar');
    }
    
    stopReminderSound() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
        }
    }
    
    hideReminder() {
        document.getElementById('adhkarReminderPopup')?.classList.remove('show');
    }
    
    showToast(message) {
        const toast = document.getElementById('adhanToast');
        if (!toast) return;
        
        document.getElementById('adhanToastPrayer').textContent = '📿';
        document.getElementById('adhanToastMessage').textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    setInterval(minutes) {
        this.interval = minutes;
        localStorage.setItem('reminderInterval', minutes);
        this.startReminders();
    }
    
    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('adhkarReminders', this.enabled);
        
        if (this.enabled) {
            this.startReminders();
        } else {
            this.hideReminder();
        }
    }
}

// ===== INITIALIZE MANAGERS =====
let prayerTimesManager, adhanManager, silentModeManager, adhkarReminderManager, audioManager, pdfManager;

// ===== DOM ELEMENTS =====
const sections = document.querySelectorAll('.section');
const loadingScreen = document.getElementById('loadingScreen');
const quranPlayer = document.getElementById('quranPlayer');
const documentReader = document.getElementById('documentReader');
const documentViewer = document.getElementById('documentViewer');
const artistsContainer = document.getElementById('artistsContainer');
const tracksContainer = document.getElementById('tracksContainer');
const tracksGrid = document.getElementById('tracksGrid');
const selectedArtistName = document.getElementById('selectedArtistName');

// Player elements
const audioPlayerSection = document.getElementById('audioPlayerSection');
const playerArtImg = document.getElementById('playerArtImg');
const playerArt = document.querySelector('.player-art');
const playerTrackTitle = document.getElementById('playerTrackTitle');
const playerArtistName = document.getElementById('playerArtistName');
const playPauseBtn = document.getElementById('playPauseBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const currentTimeSpan = document.getElementById('currentTime');
const totalDurationSpan = document.getElementById('totalDuration');
const progressFill = document.getElementById('progressFill');
const volumeFill = document.getElementById('volumeFill');

// ===== AUDIO DURATION LOADING =====
function loadAudioDurations() {
    artistsData.forEach(artist => {
        artist.tracks.forEach(track => {
            if (!track.duration) {
                track.duration = '00:00';
                
                const tempAudio = new Audio();
                
                const timeout = setTimeout(() => {
                    if (track.duration === '00:00') {
                        track.duration = '--:--';
                        if (selectedArtist && selectedArtist.id === artist.id) {
                            updateTrackListUI();
                        }
                    }
                }, 3000);
                
                tempAudio.addEventListener('loadedmetadata', function() {
                    clearTimeout(timeout);
                    if (this.duration && isFinite(this.duration)) {
                        track.duration = formatTime(this.duration);
                        if (selectedArtist && selectedArtist.id === artist.id) {
                            updateTrackListUI();
                        }
                    }
                }, { once: true });
                
                tempAudio.addEventListener('error', function() {
                    clearTimeout(timeout);
                    track.duration = '--:--';
                    if (selectedArtist && selectedArtist.id === artist.id) {
                        updateTrackListUI();
                    }
                }, { once: true });
                
                tempAudio.src = track.audioUrl;
                tempAudio.load();
            }
        });
    });
}

// ===== AUDIO PLAYER FUNCTIONS =====
function setupAudioListeners() {
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', () => {
        if (audio.duration && currentTracks[currentTrackIndex]) {
            const duration = formatTime(audio.duration);
            totalDurationSpan.textContent = duration;
            currentTracks[currentTrackIndex].duration = duration;
        }
    });
    audio.addEventListener('ended', handleTrackEnd);
    audio.addEventListener('play', () => {
        isPlaying = true;
        updatePlayPauseButton();
        playerArt?.classList.add('rotate');
        updateTrackListUI();
    });
    audio.addEventListener('pause', () => {
        isPlaying = false;
        updatePlayPauseButton();
        playerArt?.classList.remove('rotate');
        updateTrackListUI();
    });
    audio.addEventListener('error', (e) => {
        console.log('Audio error:', e);
        if (currentTracks.length > 1) {
            nextTrack();
        }
    });
}

function playTrack(artistId, trackId) {
    const artist = artistsData.find(a => a.id === artistId);
    if (!artist) return;
    
    const trackIndex = artist.tracks.findIndex(t => t.id === trackId);
    if (trackIndex === -1) return;
    
    // Stop Quran if playing
    const quranAudio = document.getElementById('quranAudio');
    if (quranAudio && !quranAudio.paused) {
        quranAudio.pause();
        document.getElementById('quranPlayer')?.classList.remove('active');
    }
    
    selectedArtist = artist;
    currentTrackIndex = trackIndex;
    currentTracks = artist.tracks;
    
    if (isPlaying) {
        audio.pause();
    }
    
    loadTrack();
    audio.play().then(() => {
        isPlaying = true;
        updatePlayPauseButton();
        playerArt?.classList.add('rotate');
        updateTrackListUI();
        
        if (!audioPlayerSection.classList.contains('active')) {
            audioPlayerSection.classList.add('active');
        }
    }).catch(e => {
        console.log('Playback failed:', e);
        showToast('Failed to play audio', 'error');
    });
}

function loadTrack() {
    if (!selectedArtist || !currentTracks[currentTrackIndex]) return;
    
    const track = currentTracks[currentTrackIndex];
    const artistName = currentLanguage === 'en' ? selectedArtist.nameEn : 
                       currentLanguage === 'ar' ? selectedArtist.nameAr : selectedArtist.name;
    const trackTitle = currentLanguage === 'en' ? track.titleEn : 
                       currentLanguage === 'ar' ? track.titleAr : track.title;
    
    if (playerArtImg) playerArtImg.src = selectedArtist.image;
    if (playerTrackTitle) playerTrackTitle.textContent = trackTitle;
    if (playerArtistName) playerArtistName.textContent = artistName;
    
    audio.src = track.audioUrl;
    audio.load();
    
    if (currentTimeSpan) currentTimeSpan.textContent = '00:00';
    if (totalDurationSpan) totalDurationSpan.textContent = track.duration || '00:00';
    if (progressFill) progressFill.style.width = '0%';
    
    document.title = `${trackTitle} - Sobanukirwa`;
    
    updateTrackListUI();
}

function togglePlayPause() {
    if (!selectedArtist) {
        showToast('Hitamo inyigisho mbere', 'info');
        return;
    }
    
    if (isPlaying) {
        audio.pause();
    } else {
        audio.play().then(() => {
            isPlaying = true;
        }).catch(e => console.log('Playback failed:', e));
    }
}

function updatePlayPauseButton() {
    if (!playPauseBtn) return;
    const icon = playPauseBtn.querySelector('i');
    if (icon) {
        icon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
    }
}

function nextTrack() {
    if (!selectedArtist || currentTracks.length === 0) return;
    
    if (isRandom) {
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * currentTracks.length);
        } while (randomIndex === currentTrackIndex && currentTracks.length > 1);
        currentTrackIndex = randomIndex;
    } else {
        currentTrackIndex = (currentTrackIndex + 1) % currentTracks.length;
    }
    
    loadTrack();
    if (isPlaying) {
        audio.play().then(() => {
            updatePlayPauseButton();
            playerArt?.classList.add('rotate');
        });
    }
}

function previousTrack() {
    if (!selectedArtist || currentTracks.length === 0) return;
    
    currentTrackIndex = (currentTrackIndex - 1 + currentTracks.length) % currentTracks.length;
    
    loadTrack();
    if (isPlaying) {
        audio.play().then(() => {
            updatePlayPauseButton();
            playerArt?.classList.add('rotate');
        });
    }
}

function handleTrackEnd() {
    if (isRepeat) {
        audio.currentTime = 0;
        audio.play();
    } else {
        nextTrack();
    }
}

function updateProgress() {
    if (audio.duration && currentTimeSpan && progressFill) {
        const progress = (audio.currentTime / audio.duration) * 100;
        progressFill.style.width = progress + '%';
        currentTimeSpan.textContent = formatTime(audio.currentTime);
    }
}

function seekTo(event) {
    if (!audio.duration) return;
    
    const progressBar = event.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const width = rect.width;
    const percentage = (x / width) * 100;
    const seekTime = (percentage / 100) * audio.duration;
    
    if (!isNaN(seekTime)) {
        audio.currentTime = seekTime;
    }
}

function setVolumeFromClick(event) {
    const volumeBar = event.currentTarget;
    const rect = volumeBar.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const width = rect.width;
    const percentage = (x / width) * 100;
    
    audio.volume = percentage / 100;
    if (volumeFill) volumeFill.style.width = percentage + '%';
}

function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function closePlayer() {
    audioPlayerSection?.classList.remove('active');
    audio.pause();
    isPlaying = false;
    updatePlayPauseButton();
    playerArt?.classList.remove('rotate');
}

function updateTrackListUI() {
    if (!tracksContainer?.classList.contains('active') || !selectedArtist) return;
    
    const trackCards = document.querySelectorAll('.track-card');
    trackCards.forEach((card, index) => {
        const track = selectedArtist.tracks[index];
        if (track) {
            const durationSpan = card.querySelector('.track-meta span:first-child');
            if (durationSpan) {
                durationSpan.innerHTML = `<i class="fas fa-clock"></i> ${track.duration || '00:00'}`;
            }
        }
        
        const playBtn = card.querySelector('.track-play-btn i');
        if (index === currentTrackIndex && isPlaying) {
            card.classList.add('playing');
            if (playBtn) playBtn.className = 'fas fa-pause';
        } else {
            card.classList.remove('playing');
            if (playBtn) playBtn.className = 'fas fa-play';
        }
    });
}

// ===== ARTISTS FUNCTIONS =====
function renderArtists() {
    if (!artistsContainer) return;
    
    artistsContainer.innerHTML = '';
    
    artistsData.forEach(artist => {
        const name = currentLanguage === 'en' ? artist.nameEn : 
                     currentLanguage === 'ar' ? artist.nameAr : artist.name;
        
        const card = document.createElement('div');
        card.className = 'artist-card';
        card.innerHTML = `
            <div class="artist-avatar" style="background-image: url('${artist.image}')"></div>
            <div class="artist-info">
                <div class="artist-name">${name}</div>
                <div class="artist-stats">
                    <span><i class="fas fa-music"></i> ${artist.tracks.length} Inyigisho</span>
                    <span><i class="fas fa-tag"></i> ${artist.category}</span>
                </div>
            </div>
            <i class="fas fa-chevron-right"></i>
        `;
        
        card.addEventListener('click', () => showArtistTracks(artist));
        artistsContainer.appendChild(card);
    });
}

function filterArtists() {
    const search = document.getElementById('artistSearch')?.value.toLowerCase() || '';
    const cards = document.querySelectorAll('.artist-card');
    cards.forEach(card => {
        const name = card.querySelector('.artist-name')?.textContent.toLowerCase() || '';
        card.style.display = name.includes(search) ? 'flex' : 'none';
    });
}

function showArtistTracks(artist) {
    selectedArtist = artist;
    if (tracksContainer) tracksContainer.classList.add('active');
    
    const name = currentLanguage === 'en' ? artist.nameEn : 
                 currentLanguage === 'ar' ? artist.nameAr : artist.name;
    if (selectedArtistName) selectedArtistName.textContent = name;
    
    if (tracksGrid) tracksGrid.innerHTML = '';
    
    artist.tracks.forEach((track, index) => {
        const title = currentLanguage === 'en' ? track.titleEn : 
                      currentLanguage === 'ar' ? track.titleAr : track.title;
        
        const trackCard = document.createElement('div');
        trackCard.className = 'track-card';
        trackCard.innerHTML = `
            <div class="track-info">
                <div class="track-number">${index + 1}</div>
                <div class="track-details">
                    <div class="track-title">${title}</div>
                    <div class="track-artist-name">${name}</div>
                    <div class="track-meta">
                        <span><i class="fas fa-clock"></i> ${track.duration || '00:00'}</span>
                        <span><i class="fas fa-tag"></i> ${track.category}</span>
                    </div>
                </div>
            </div>
            <button class="track-play-btn" onclick="playTrack(${artist.id}, ${track.id})">
                <i class="${(selectedArtist && selectedArtist.id === artist.id && currentTrackIndex === index && isPlaying) ? 'fas fa-pause' : 'fas fa-play'}"></i>
            </button>
        `;
        
        if (tracksGrid) tracksGrid.appendChild(trackCard);
    });
    
    // Load durations for tracks that don't have them
    artist.tracks.forEach(track => {
        if (!track.duration || track.duration === '00:00' || track.duration === '--:--') {
            const tempAudio = new Audio();
            tempAudio.addEventListener('loadedmetadata', function() {
                track.duration = formatTime(this.duration);
                updateTrackListUI();
            }, { once: true });
            tempAudio.src = track.audioUrl;
        }
    });
}

function showArtists() {
    if (tracksContainer) tracksContainer.classList.remove('active');
}

// ===== QIBLA FUNCTIONS =====
function generateCompassTicks() {
    const face = document.getElementById('compassFace');
    if (!face) return;
    const TICK_COUNT = 72;
    const DEGREE_MARKS = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
    const CARDINALS = [0, 90, 180, 270];
    for (let i = 0; i < TICK_COUNT; i++) {
        const deg = (i / TICK_COUNT) * 360;
        const rounded = Math.round(deg);
        const isMajor = DEGREE_MARKS.includes(rounded);
        const isCardinal = CARDINALS.includes(rounded);
        const tick = document.createElement('div');
        tick.style.cssText = `
            position: absolute; top: 8px; left: 50%; transform-origin: center 122px;
            width: ${isCardinal ? 2 : isMajor ? 1.5 : 1}px;
            height: ${isMajor ? 14 : 7}px;
            background: ${isCardinal ? '#D4AF37' : isMajor ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)'};
            transform: translateX(-50%) rotate(${deg}deg);
            border-radius: 1px;
        `;
        face.appendChild(tick);
    }
}

function initQibla() {
    const KAABA_LAT = 21.4225;
    const KAABA_LNG = 39.8262;
    
    // Generate compass tick marks
    generateCompassTicks();
    
    const savedLat = localStorage.getItem('userLat');
    const savedLng = localStorage.getItem('userLng');
    
    if (savedLat && savedLng) {
        userLat = parseFloat(savedLat);
        userLng = parseFloat(savedLng);
        calculateAndDisplayQibla(userLat, userLng, KAABA_LAT, KAABA_LNG);
    }
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLat = position.coords.latitude;
                userLng = position.coords.longitude;
                
                localStorage.setItem('userLat', userLat);
                localStorage.setItem('userLng', userLng);
                
                calculateAndDisplayQibla(userLat, userLng, KAABA_LAT, KAABA_LNG);
            },
            (error) => {
                if (!savedLat) {
                    calculateAndDisplayQibla(-1.9403, 29.8739, KAABA_LAT, KAABA_LNG);
                }
            }
        );
    }
    
    startCompass();
}

function calculateAndDisplayQibla(lat, lng, kaabaLat, kaabaLng) {
    const qibla = calculateQibla(lat, lng, kaabaLat, kaabaLng);
    currentQibla = qibla;
    
    const degreeEl = document.getElementById('qiblaDegree');
    const directionEl = document.getElementById('qiblaDirection');
    const distanceEl = document.getElementById('distanceInfo');
    
    if (degreeEl) degreeEl.textContent = Math.round(qibla) + '°';
    if (directionEl) directionEl.textContent = `Qibla: ${Math.round(qibla)}° kuva mu majyaruguru`;
    
    const distance = calculateDistance(lat, lng, kaabaLat, kaabaLng);
    if (distanceEl) distanceEl.textContent = `${Math.round(distance)} km kugera Kaaba`;
}

function calculateQibla(lat1, lon1, lat2, lon2) {
    const toRad = (deg) => deg * Math.PI / 180;
    const toDeg = (rad) => rad * 180 / Math.PI;
    
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δλ = toRad(lon2 - lon1);
    
    const x = Math.sin(Δλ) * Math.cos(φ2);
    const y = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    
    let qibla = toDeg(Math.atan2(x, y));
    return (qibla + 360) % 360;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const toRad = (deg) => deg * Math.PI / 180;
    
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function startCompass() {
    if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', handleOrientation);
    }
}

function handleOrientation(event) {
    let heading = null;
    
    if (event.webkitCompassHeading !== undefined) {
        heading = event.webkitCompassHeading;
    } else if (event.alpha !== null) {
        heading = 360 - event.alpha;
    }
    
    if (heading !== null) {
        compassHeading = heading;
        
        // Rotate compass face (inverse of heading so North stays up)
        const compassFace = document.getElementById('compassFace');
        if (compassFace) {
            compassFace.style.transform = `rotate(${-heading}deg)`;
        }
        
        // Position Qibla arrow and Kaaba marker at the Qibla angle
        const qiblaArrow = document.getElementById('qiblaArrowFixed');
        const kaabaMarker = document.getElementById('kaabaMarkerTop');
        if (qiblaArrow) {
            qiblaArrow.style.transform = `translateX(-50%) rotate(${currentQibla}deg)`;
            qiblaArrow.style.transformOrigin = 'center bottom';
        }
        if (kaabaMarker) {
            kaabaMarker.style.transform = `rotate(${currentQibla}deg)`;
        }
        
        // Update heading display
        const headingDisplay = document.getElementById('headingDisplay');
        if (headingDisplay) headingDisplay.textContent = Math.round(heading) + '°';
    }
}

function calibrateCompass() {
    showToast('Zunguza igikoresho cyawe mu buryo bwa 8', 'info');
}

// ===== PRAYER TIMES FUNCTIONS =====
function initPrayerTimes() {
    getUserLocation();
}

function getUserLocation() {
    const savedLat = localStorage.getItem('userLat');
    const savedLng = localStorage.getItem('userLng');
    
    if (savedLat && savedLng) {
        userLat = parseFloat(savedLat);
        userLng = parseFloat(savedLng);
        const coordsEl = document.getElementById('locationCoords');
        if (coordsEl) {
            coordsEl.textContent = `${userLat.toFixed(4)}°, ${userLng.toFixed(4)}°`;
        }
        fetchPrayerTimes(userLat, userLng);
    }
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLat = position.coords.latitude;
                userLng = position.coords.longitude;
                
                localStorage.setItem('userLat', userLat);
                localStorage.setItem('userLng', userLng);
                
                const coordsEl = document.getElementById('locationCoords');
                if (coordsEl) {
                    coordsEl.textContent = `${userLat.toFixed(4)}°, ${userLng.toFixed(4)}°`;
                }
                
                // Get location name
                fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLat}&lon=${userLng}&zoom=10`)
                    .then(res => res.json())
                    .then(data => {
                        const city = data.address.city || data.address.town || data.address.village || 'Kigali';
                        const country = data.address.country || 'Rwanda';
                        const locationEl = document.getElementById('locationName');
                        if (locationEl) locationEl.textContent = `${city}, ${country}`;
                    })
                    .catch(() => {
                        const locationEl = document.getElementById('locationName');
                        if (locationEl) locationEl.textContent = 'Aho uri';
                    });
                
                fetchPrayerTimes(userLat, userLng);
            },
            () => {
                if (!savedLat) {
                    const locationEl = document.getElementById('locationName');
                    if (locationEl) locationEl.textContent = 'Kigali, Rwanda';
                    fetchPrayerTimes(-1.9403, 29.8739);
                }
            }
        );
    }
}

async function fetchPrayerTimes(lat, lng) {
    if (!prayerTimesManager) return;
    
    const times = await prayerTimesManager.getPrayerTimes(lat, lng);
    if (times) {
        prayerTimes = times;
        displayPrayerTimes(times);
        
        localStorage.setItem('prayerTimes', JSON.stringify(times));
        localStorage.setItem('prayerDate', new Date().toDateString());
        
        const sourceEl = document.getElementById('prayerSource');
        if (sourceEl) sourceEl.textContent = `Source: ${times.source}`;
    }
}

function displayPrayerTimes(times) {
    const prayers = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    let html = '';
    
    prayers.forEach(prayer => {
        html += `
            <div class="prayer-card" id="prayer-${prayer}">
                <div class="prayer-name">${prayer}</div>
                <div class="prayer-time">${times[prayer]}</div>
            </div>
        `;
    });
    
    const container = document.getElementById('prayerTimes');
    if (container) {
        container.innerHTML = html;
    }
    calculateNextPrayer(times);
}

function calculateNextPrayer(times) {
    const now = new Date();
    const current = now.getHours() * 60 + now.getMinutes();
    
    const prayers = [
        { name: 'Fajr', time: times.Fajr },
        { name: 'Sunrise', time: times.Sunrise },
        { name: 'Dhuhr', time: times.Dhuhr },
        { name: 'Asr', time: times.Asr },
        { name: 'Maghrib', time: times.Maghrib },
        { name: 'Isha', time: times.Isha }
    ];
    
    let next = null;
    for (let p of prayers) {
        const [h, m] = p.time.split(':').map(Number);
        const prayerMins = h * 60 + m;
        if (prayerMins > current) {
            next = p;
            break;
        }
    }
    
    const nextPrayerText = document.getElementById('nextPrayerText');
    const nextPrayerCountdown = document.getElementById('nextPrayerCountdown');
    
    if (next) {
        const [h, m] = next.time.split(':').map(Number);
        const prayerMins = h * 60 + m;
        const diff = prayerMins - current;
        const hours = Math.floor(diff / 60);
        const mins = diff % 60;
        
        if (nextPrayerText) {
            nextPrayerText.textContent = `${next.name} nyuma ya ${hours}h ${mins}m`;
        }
        if (nextPrayerCountdown) {
            nextPrayerCountdown.innerHTML = `<span data-i18n="nextPrayerIn">Isengesho rikurikira:</span> ${hours}h ${mins}m`;
        }
    } else {
        const [h, m] = prayers[0].time.split(':').map(Number);
        const fajrMins = h * 60 + m;
        const diff = (24 * 60 - current) + fajrMins;
        const hours = Math.floor(diff / 60);
        const mins = diff % 60;
        
        if (nextPrayerText) {
            nextPrayerText.textContent = `Fajr nyuma ya ${hours}h ${mins}m`;
        }
    }
}

// ===== SECTION NAVIGATION =====
function switchSection(sectionId) {
    if (!loadingScreen?.classList.contains('hidden')) return;
    
    sections.forEach(s => s.classList.remove('active'));
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        
        if (sectionId === 'qibla') {
            setTimeout(() => initQibla(), 100);
        }
        if (sectionId === 'prayer') {
            updatePrayerTimes();
        }
        if (sectionId === 'audio') {
            showArtists();
        }
        if (sectionId === 'books') {
            renderBooks();
        }
    }

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-section') === sectionId);
    });
}

// ===== SCROLL BUTTONS =====
function scrollToTop() {
    const activeSection = document.querySelector('.section.active');
    if (activeSection) {
        activeSection.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function scrollToBottom() {
    const activeSection = document.querySelector('.section.active');
    if (activeSection) {
        activeSection.scrollTo({ top: activeSection.scrollHeight, behavior: 'smooth' });
    }
}

// Setup scroll buttons
document.querySelectorAll('.section').forEach(section => {
    section.addEventListener('scroll', () => {
        const scrollTop = section.scrollTop;
        const scrollHeight = section.scrollHeight;
        const clientHeight = section.clientHeight;
        
        const topBtn = document.getElementById('scrollTopBtn');
        const bottomBtn = document.getElementById('scrollBottomBtn');
        
        if (topBtn) topBtn.classList.toggle('visible', scrollTop > 100);
        if (bottomBtn) {
            bottomBtn.classList.toggle('visible', scrollTop + clientHeight < scrollHeight - 100);
        }
    });
});

// ===== DATE/TIME =====
function updateDateTime() {
    const now = new Date();
    const gregorianEl = document.getElementById('gregorianDate');
    const hijriEl = document.getElementById('hijriDate');
    
    if (gregorianEl) {
        gregorianEl.textContent = now.toLocaleDateString();
    }
    
    const hijri = getHijriDate(now);
    if (hijriEl) {
        hijriEl.textContent = hijri;
    }
}

function getHijriDate(date) {
    const hijriMonths = [
        'Muharram', 'Safar', 'Rabi\' al-Awwal', 'Rabi\' al-Thani',
        'Jumada al-Ula', 'Jumada al-Thani', 'Rajab', 'Sha\'ban',
        'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
    ];
    
    // Simplified - in production use a proper library
    return `27 ${hijriMonths[date.getMonth()]} 1445`;
}

// ===== QURAN FUNCTIONS =====
const API_BASE = 'https://sobanukirwa-production.up.railway.app/api';

async function renderQuran() {
    const container = document.getElementById('quranContainer');
    if (!container) return;
    
    container.innerHTML = '<div style="text-align:center;padding:2rem;color:#a8c1d9;"><i class="fas fa-spinner fa-spin"></i> Loading surahs...</div>';
    
    let data = surahs;
    try {
        const res = await fetch(`${API_BASE}/quran/surahs`);
        if (res.ok) {
            const apiData = await res.json();
            if (apiData && apiData.length > 0) data = apiData;
        }
    } catch (e) {
        console.log('API fetch failed, using local data');
    }
    
    container.innerHTML = '';
    data.forEach(surah => {
        const num = surah.surah_number || surah.number;
        const name = surah.name || `Surah ${num}`;
        const arabic = surah.name_arabic || surah.nameArabic || '';
        const ayahs = surah.ayahs_count || surah.ayahs || 0;
        const audioUrl = surah.audio_url || surah.audioUrl || '';
        
        const card = document.createElement('div');
        card.className = 'surah-card';
        card.innerHTML = `
            <div class="surah-info">
                <div class="surah-number">${num}</div>
                <div class="surah-details">
                    <div class="surah-name">${name}</div>
                    ${arabic ? `<div class="surah-name-arabic">${arabic}</div>` : ''}
                    ${ayahs ? `<div class="surah-meta">${ayahs} Ayat</div>` : ''}
                </div>
            </div>
            <div class="surah-actions">
                <button class="surah-play-btn" onclick="playSurahApi(${num}, '${name.replace(/'/g, "\\'")}', '${audioUrl}')">
                    <i class="fas fa-play"></i>
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

function filterSurahs() {
    const search = document.getElementById('quranSearch')?.value.toLowerCase() || '';
    const cards = document.querySelectorAll('.surah-card');
    cards.forEach(card => {
        const name = card.querySelector('.surah-name')?.textContent.toLowerCase() || '';
        const arabic = card.querySelector('.surah-name-arabic')?.textContent || '';
        const number = card.querySelector('.surah-number')?.textContent || '';
        card.style.display = (name.includes(search) || arabic.includes(search) || number.includes(search)) ? 'flex' : 'none';
    });
}

function playSurahApi(surahNumber, surahName, audioUrl) {
    // Stop lessons audio if playing
    if (isPlaying) {
        audio.pause();
        isPlaying = false;
        updatePlayPauseButton();
        playerArt?.classList.remove('rotate');
    }
    
    if (!audioUrl || audioUrl === 'undefined') {
        const padNum = String(surahNumber).padStart(3, '0');
        audioUrl = `https://server7.mp3quran.net/ahmed/${padNum}.mp3`;
    }
    
    if (quranPlayer) {
        quranPlayer.style.display = 'block';
        quranPlayer.classList.add('active');
    }
    
    const surahNameEl = document.getElementById('currentSurahName');
    if (surahNameEl) {
        surahNameEl.textContent = `${surahNumber}. ${surahName}`;
    }
    
    const quranAudio = document.getElementById('quranAudio');
    if (quranAudio) {
        quranAudio.src = audioUrl;
        quranAudio.play().catch(e => {
            console.log('Quran playback failed:', e);
            showToast('Failed to play Quran audio', 'error');
        });
    }
}

function playSurah(surahNumber) {
    const surahIndex = surahs.findIndex(s => s.number === surahNumber);
    if (surahIndex === -1) return;
    
    // Stop lessons audio if playing
    if (isPlaying) {
        audio.pause();
        isPlaying = false;
        updatePlayPauseButton();
        playerArt?.classList.remove('rotate');
    }
    
    currentSurahIndex = surahIndex;
    const surah = surahs[surahIndex];
    
    if (quranPlayer) {
        quranPlayer.style.display = 'block';
        quranPlayer.classList.add('active');
    }
    
    const surahNameEl = document.getElementById('currentSurahName');
    if (surahNameEl) {
        surahNameEl.textContent = `${surah.number}. ${surah.name} (${surah.nameArabic})`;
    }
    
    const quranAudio = document.getElementById('quranAudio');
    if (quranAudio) {
        quranAudio.src = surah.audioUrl;
        quranAudio.play().catch(e => {
            console.log('Quran playback failed:', e);
            showToast('Failed to play Quran audio', 'error');
        });
    }
    
    // Update UI for playing state
    document.querySelectorAll('.surah-play-btn').forEach(btn => {
        btn.classList.remove('playing');
        btn.innerHTML = '<i class="fas fa-play"></i>';
    });
    
    const activeBtn = document.querySelector(`.surah-play-btn[onclick="playSurah(${surahNumber})"]`);
    if (activeBtn) {
        activeBtn.classList.add('playing');
        activeBtn.innerHTML = '<i class="fas fa-pause"></i>';
    }
    
    if (quranAudio) {
        quranAudio.onended = function() {
            if (currentSurahIndex < surahs.length - 1) {
                setTimeout(() => {
                    playSurah(surahs[currentSurahIndex + 1].number);
                }, 1000);
            } else {
                currentSurahIndex = -1;
                if (quranPlayer) quranPlayer.classList.remove('active');
                if (activeBtn) {
                    activeBtn.classList.remove('playing');
                    activeBtn.innerHTML = '<i class="fas fa-play"></i>';
                }
            }
        };
        
        quranAudio.onpause = function() {
            if (activeBtn) {
                activeBtn.classList.remove('playing');
                activeBtn.innerHTML = '<i class="fas fa-play"></i>';
            }
        };
        
        quranAudio.onplay = function() {
            if (activeBtn) {
                activeBtn.classList.add('playing');
                activeBtn.innerHTML = '<i class="fas fa-pause"></i>';
            }
        };
    }
}

// ===== BOOKS FUNCTIONS =====
function renderBooks() {
    const container = document.getElementById('booksContainer');
    if (!container) return;
    
    container.innerHTML = '';
    booksData.forEach(book => {
        const title = currentLanguage === 'en' ? book.titleEn : 
                     currentLanguage === 'ar' ? book.titleAr : book.title;
        const author = currentLanguage === 'en' ? book.authorEn : 
                      currentLanguage === 'ar' ? book.authorAr : book.author;
        const typeClass = book.type === 'pdf' ? 'pdf' : 'text';
        const typeLabel = book.type === 'pdf' ? 'PDF' : 'TEXT';
        
        const card = document.createElement('div');
        card.className = 'book-card';
        card.setAttribute('data-title', title.toLowerCase());
        card.setAttribute('data-category', (book.category || '').toLowerCase());
        card.innerHTML = `
            <div class="book-cover">
                <img src="${book.image || 'Images/logo2.png'}" alt="${title}" loading="lazy">
                <div class="book-cover-overlay"></div>
                <span class="book-type-badge ${typeClass}">${typeLabel}</span>
                ${book.category ? `<span class="book-category-badge">${book.category}</span>` : ''}
            </div>
            <div class="book-info">
                <h3 class="book-title">${title}</h3>
                <div class="book-author">
                    <i class="fas fa-user"></i> ${author}
                </div>
                <button class="book-read-btn" onclick="event.stopPropagation(); openBook(${book.id})">
                    <i class="fas fa-book-open"></i> <span data-i18n="read">Soma</span>
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

function filterBooks() {
    const search = document.getElementById('booksSearch')?.value.toLowerCase() || '';
    const cards = document.querySelectorAll('.book-card');
    cards.forEach(card => {
        const title = card.getAttribute('data-title') || '';
        const category = card.getAttribute('data-category') || '';
        card.style.display = (title.includes(search) || category.includes(search)) ? '' : 'none';
    });
}

function openBook(bookId) {
    const book = booksData.find(b => b.id === bookId);
    if (!book) return;
    
    const title = currentLanguage === 'en' ? book.titleEn : 
                 currentLanguage === 'ar' ? book.titleAr : book.title;
    const author = currentLanguage === 'en' ? book.authorEn : 
                  currentLanguage === 'ar' ? book.authorAr : book.author;
    
    const modal = document.getElementById('bookReaderModal');
    const titleEl = document.getElementById('bookReaderTitle');
    const body = document.getElementById('bookReaderBody');
    if (!modal || !titleEl || !body) return;
    
    titleEl.textContent = title;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    if (book.type === 'pdf') {
        body.innerHTML = `<iframe src="${book.pdfUrl}" title="${title}"></iframe>`;
    } else {
        body.innerHTML = `
            <div class="book-reader-text">
                <h1>${title}</h1>
                <div class="book-meta">
                    <span><i class="fas fa-user"></i> ${author}</span>
                    ${book.category ? `<span><i class="fas fa-tag"></i> ${book.category}</span>` : ''}
                </div>
                <p>${book.content || 'This book contains beneficial Islamic knowledge.'}</p>
                <p>May Allah increase us in knowledge and benefit us with what we learn.</p>
            </div>
        `;
    }
}

function closeBookReader() {
    const modal = document.getElementById('bookReaderModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        const body = document.getElementById('bookReaderBody');
        if (body) body.innerHTML = '';
    }
}

function closeDocumentReader() {
    closeBookReader();
}

// ===== VIDEOS FUNCTIONS =====
function renderVideos() {
    const container = document.getElementById('videosContainer');
    if (!container) return;
    
    container.innerHTML = '';
    videosData.forEach(video => {
        const title = currentLanguage === 'en' ? video.titleEn : 
                     currentLanguage === 'ar' ? video.titleAr : video.title;
        const author = currentLanguage === 'en' ? video.authorEn : 
                      currentLanguage === 'ar' ? video.authorAr : video.author;
        
        const card = document.createElement('div');
        card.className = 'video-card';
        card.innerHTML = `
            <div class="video-thumbnail">
                <img src="${video.thumbnail}" alt="${title}">
                <div class="video-overlay">
                    <div class="play-button">
                        <i class="fas fa-play"></i>
                    </div>
                </div>
                <div class="video-duration">${video.duration || '00:00'}</div>
            </div>
            <div class="video-info">
                <h3 class="video-title">${title}</h3>
                <div class="video-author">
                    <i class="fas fa-user"></i> ${author}
                </div>
                <button class="watch-btn" onclick="playVideo(${video.id})">
                    <i class="fas fa-play-circle"></i> <span data-i18n="watch">Reba</span>
                </button>
            </div>
        `;
        container.appendChild(card);
    });
    
    loadVideoDurations();
}

function loadVideoDurations() {
    videosData.forEach(video => {
        if (!video.duration || video.duration === '00:00') {
            const tempVideo = document.createElement('video');
            tempVideo.addEventListener('loadedmetadata', function() {
                const minutes = Math.floor(this.duration / 60);
                const seconds = Math.floor(this.duration % 60);
                video.duration = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                renderVideos();
            }, { once: true });
            tempVideo.src = video.videoUrl;
        }
    });
}

function playVideo(videoId) {
    const video = videosData.find(v => v.id === videoId);
    if (!video) return;
    
    const title = currentLanguage === 'en' ? video.titleEn : 
                 currentLanguage === 'ar' ? video.titleAr : video.title;
    
    const videoElement = document.getElementById('videoElement');
    const videoTitleEl = document.getElementById('videoTitle');
    
    if (videoElement) videoElement.src = video.videoUrl;
    if (videoTitleEl) videoTitleEl.textContent = title;
    
    if (!video.duration || video.duration === '00:00') {
        if (videoElement) {
            videoElement.addEventListener('loadedmetadata', function() {
                const minutes = Math.floor(this.duration / 60);
                const seconds = Math.floor(this.duration % 60);
                video.duration = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }, { once: true });
        }
    }
    
    switchSection('videoPlayer');
}

function closeVideoPlayer() {
    const videoElement = document.getElementById('videoElement');
    if (videoElement) {
        videoElement.pause();
        videoElement.src = '';
    }
    switchSection('videos');
}

// ===== ADHKAR FUNCTIONS =====
function toggleAdhkar() {
    if (!loadingScreen?.classList.contains('hidden')) return;
    const panel = document.getElementById('adhkarPanel');
    if (panel) panel.classList.toggle('active');
}

function updateCounter(index, delta) {
    counters[index] = Math.max(0, Math.min(maxCounts[index], counters[index] + delta));
    const counterEl = document.getElementById(`counter` + index);
    if (counterEl) {
        counterEl.textContent = counters[index] + '/' + maxCounts[index];
    }
    localStorage.setItem('adhkarCounts', JSON.stringify(counters));
}

function updateAdhkarTimer() {
    const now = new Date();
    const timeEl = document.getElementById('currentTime');
    if (timeEl) {
        timeEl.textContent = now.toLocaleTimeString();
    }
    
    const hours = now.getHours();
    const nextAdhkarEl = document.getElementById('nextAdhkar');
    if (nextAdhkarEl) {
        if (hours < 6) {
            nextAdhkarEl.textContent = `Adhkar za Fajr nyuma ya ${6 - hours}h`;
        } else if (hours < 18) {
            nextAdhkarEl.textContent = 'Adhkar za Buri Munsi';
        } else {
            nextAdhkarEl.textContent = 'Adhkar za Fajr saa kumi n\'ebyiri';
        }
    }
}

// ===== SETTINGS FUNCTIONS =====
function toggleSettings() {
    if (!loadingScreen?.classList.contains('hidden')) return;
    const panel = document.getElementById('settingsPanel');
    if (panel) panel.classList.toggle('active');
}

function toggleSilentMode() {
    silentMode = !silentMode;
    const toggle = document.getElementById('silentToggle');
    if (toggle) toggle.classList.toggle('active', silentMode);
    document.body.classList.toggle('silent-mode', silentMode);
    localStorage.setItem('silentMode', silentMode);
}

function toggleSmartSilent() {
    smartSilent = !smartSilent;
    const toggle = document.getElementById('smartSilentToggle');
    if (toggle) toggle.classList.toggle('active', smartSilent);
    localStorage.setItem('smartSilent', smartSilent);
}

function renderPrayerCheckboxes() {
    const container = document.getElementById('prayerCheckboxes');
    if (!container) return;
    
    const prayers = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    
    container.innerHTML = '';
    prayers.forEach(prayer => {
        const div = document.createElement('div');
        div.className = 'prayer-checkbox';
        div.innerHTML = `
            <input type="checkbox" id="silent-${prayer}" value="${prayer}" checked>
            <label for="silent-${prayer}">${prayer}</label>
        `;
        container.appendChild(div);
    });
}

function checkSmartSilent() {
    if (!smartSilent || !prayerTimes) return;
    
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
    
    const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    let shouldBeSilent = false;
    
    for (let prayer of prayers) {
        const checkbox = document.getElementById(`silent-${prayer}`);
        if (checkbox && checkbox.checked && prayerTimes[prayer] === currentTime) {
            shouldBeSilent = true;
            break;
        }
    }
    
    if (shouldBeSilent && !silentMode) {
        silentMode = true;
        document.body.classList.add('silent-mode');
        const toggle = document.getElementById('silentToggle');
        if (toggle) toggle.classList.add('active');
    } else if (!shouldBeSilent && silentMode) {
        silentMode = false;
        document.body.classList.remove('silent-mode');
        const toggle = document.getElementById('silentToggle');
        if (toggle) toggle.classList.remove('active');
    }
}

function toggleAdhan() {
    if (adhanManager) {
        adhanManager.toggle();
        const toggle = document.getElementById('adhanToggle');
        if (toggle) toggle.classList.toggle('active', adhanManager.enabled);
    } else {
        adhanEnabled = !adhanEnabled;
        const toggle = document.getElementById('adhanToggle');
        if (toggle) toggle.classList.toggle('active', adhanEnabled);
        localStorage.setItem('adhanEnabled', adhanEnabled);
    }
}

function changeAdhanReciter(reciter) {
    if (adhanManager) {
        adhanManager.changeReciter(reciter);
    } else {
        localStorage.setItem('selectedReciter', reciter);
    }
}

function updateAdhanVolume(volume) {
    if (adhanManager) {
        adhanManager.setVolume(parseInt(volume));
    } else {
        const display = document.getElementById('adhanVolumeDisplay');
        if (display) display.textContent = volume + '%';
        localStorage.setItem('adhanVolume', volume);
    }
}

function setAdhanVolume() {
    const volume = document.getElementById('adhanVolume')?.value;
    if (volume) updateAdhanVolume(volume);
}

function toggleReminders() {
    remindersEnabled = !remindersEnabled;
    const toggle = document.getElementById('reminderToggle');
    if (toggle) toggle.classList.toggle('active', remindersEnabled);
    localStorage.setItem('remindersEnabled', remindersEnabled);
}

function updateReminderInterval(val) {
    const value = parseInt(val);
    const display = document.getElementById('reminderIntervalDisplay');
    if (display) display.textContent = value + ' minutes';
    localStorage.setItem('reminderInterval', value);
    
    if (adhkarReminderManager) {
        adhkarReminderManager.setInterval(value);
    }
}

function toggleScheduledSilent() {
    if (silentModeManager) {
        silentModeManager.toggle();
        const toggle = document.getElementById('scheduledSilentToggle');
        if (toggle) toggle.classList.toggle('active', silentModeManager.enabled);
    }
}

function updateSilentTimes() {
    const start = document.getElementById('silentStart')?.value;
    const end = document.getElementById('silentEnd')?.value;
    
    if (start && end) {
        if (silentModeManager) {
            silentModeManager.setSchedule(start, end);
        } else {
            localStorage.setItem('silentStart', start);
            localStorage.setItem('silentEnd', end);
        }
    }
}

function toggleAdhkarReminders() {
    if (adhkarReminderManager) {
        adhkarReminderManager.toggle();
        const toggle = document.getElementById('adhkarReminderToggle');
        if (toggle) toggle.classList.toggle('active', adhkarReminderManager.enabled);
    }
}

function snoozeAdhkar() {
    if (adhkarReminderManager) {
        adhkarReminderManager.snooze();
    }
}

function dismissAdhkar() {
    if (adhkarReminderManager) {
        adhkarReminderManager.dismiss();
    }
}

// ===== ADHAN FUNCTIONS =====
function checkAdhanTime() {
    if (!adhanManager || !adhanManager.enabled || silentMode) return;
    
    if (prayerTimes) {
        const now = new Date();
        const currentTime = now.getHours().toString().padStart(2,'0') + ':' + 
                          now.getMinutes().toString().padStart(2,'0');
        
        const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
        prayers.forEach(prayer => {
            if (prayerTimes[prayer] === currentTime) {
                adhanManager.playAdhan(prayer);
            }
        });
    }
}

function closeAdhanNotification() {
    const notification = document.getElementById('adhanNotification');
    if (notification) notification.classList.remove('show');
}

function setAdhanSource(reciter) {
    const adhanAudio = document.getElementById('adhanAudio');
    if (!adhanAudio) return;
    
    if (customAdhanUrl) {
        adhanAudio.src = customAdhanUrl;
        return;
    }
    
    const adhanUrls = {
        mishary: 'audio/Adhan2.mpeg',
        sudais: 'audio/Adhan1.mpeg',
        abdulbasit: 'audio/Mansour_Adhan.mpeg'
    };
    
    adhanAudio.src = adhanUrls[reciter] || adhanUrls.mishary;
}

function loadCustomAdhan() {
    const customAdhanData = localStorage.getItem('customAdhanData');
    const customAdhanName = localStorage.getItem('customAdhanName');
    
    if (customAdhanData) {
        fetch(customAdhanData)
            .then(res => res.blob())
            .then(blob => {
                customAdhanBlob = blob;
                customAdhanUrl = URL.createObjectURL(blob);
                
                const infoEl = document.getElementById('customAdhanInfo');
                const fileNameEl = document.getElementById('customAdhanFileName');
                const sourceEl = document.getElementById('customAdhanSource');
                const previewEl = document.getElementById('customAdhanPreview');
                
                if (infoEl) infoEl.style.display = 'block';
                if (fileNameEl) fileNameEl.textContent = customAdhanName || 'Custom Adhan';
                if (sourceEl) sourceEl.src = customAdhanUrl;
                if (previewEl) previewEl.load();
                
                const adhanAudio = document.getElementById('adhanAudio');
                if (adhanAudio) adhanAudio.src = customAdhanUrl;
            })
            .catch(err => console.log('Failed to load custom adhan:', err));
    }
}

function removeCustomAdhan() {
    if (customAdhanUrl) {
        URL.revokeObjectURL(customAdhanUrl);
        customAdhanUrl = null;
    }
    customAdhanBlob = null;
    
    const infoEl = document.getElementById('customAdhanInfo');
    const fileNameEl = document.getElementById('customAdhanFileName');
    const sourceEl = document.getElementById('customAdhanSource');
    
    if (infoEl) infoEl.style.display = 'none';
    if (fileNameEl) fileNameEl.textContent = '';
    if (sourceEl) sourceEl.src = '';
    
    localStorage.removeItem('customAdhanData');
    localStorage.removeItem('customAdhanName');
    localStorage.removeItem('customAdhanUploaded');
    
    const reciter = document.getElementById('adhanReciter')?.value;
    if (reciter) setAdhanSource(reciter);
}

function updatePrayerTimes() {
    if (prayerTimes) {
        calculateNextPrayer(prayerTimes);
    }
}

// ===== TOAST NOTIFICATION =====
function showToast(message, type = 'info') {
    const toast = document.getElementById('adhanToast');
    if (!toast) return;
    
    const icon = type === 'error' ? 'fa-exclamation-circle' : 
                 type === 'success' ? 'fa-check-circle' : 'fa-info-circle';
    const color = type === 'error' ? '#dc3545' : 
                  type === 'success' ? '#28a745' : '#d4af37';
    
    toast.innerHTML = `
        <i class="fas ${icon}" style="color: ${color}; font-size: 24px; margin-right: 10px;"></i>
        <div>
            <strong>${type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Info'}</strong>
            <p style="margin: 5px 0 0; font-size: 14px;">${message}</p>
        </div>
    `;
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ===== I18N FUNCTIONS =====
function applyLanguage(lang) {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    
    const currentLangEl = document.getElementById('currentLang');
    if (currentLangEl) {
        currentLangEl.textContent = lang === 'rw' ? 'RW' : lang.toUpperCase();
    }
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });
    
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[lang] && translations[lang][key]) {
            el.placeholder = translations[lang][key];
        }
    });
    
    document.querySelectorAll('.lang-option').forEach(opt => opt.classList.remove('active'));
    const activeOption = document.querySelector(`.lang-option[onclick="changeLanguage('${lang}')"]`);
    if (activeOption) activeOption.classList.add('active');
    
    localStorage.setItem('language', lang);
    
    renderQuran();
    renderArtists();
    renderBooks();
    renderVideos();
}

function changeLanguage(lang) {
    currentLanguage = lang;
    applyLanguage(lang);
    
    const dropdown = document.querySelector('.lang-dropdown');
    if (dropdown) dropdown.classList.remove('show');
}

function detectDeviceLanguage() {
    const deviceLang = navigator.language.split('-')[0];
    if (['en', 'fr', 'ar'].includes(deviceLang) && !localStorage.getItem('language')) {
        changeLanguage(deviceLang);
    }
}

// Language dropdown
const langBtn = document.querySelector('.lang-btn');
if (langBtn) {
    langBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        const dropdown = document.querySelector('.lang-dropdown');
        if (dropdown) dropdown.classList.toggle('show');
    });
}

document.addEventListener('click', function() {
    const dropdown = document.querySelector('.lang-dropdown');
    if (dropdown) dropdown.classList.remove('show');
});

// ===== LOAD/SAVE STATE =====
function loadSavedState() {
    const savedCounts = localStorage.getItem('adhkarCounts');
    if (savedCounts) {
        counters = JSON.parse(savedCounts);
        for (let i = 0; i < counters.length; i++) {
            const counterEl = document.getElementById(`counter` + i);
            if (counterEl) {
                counterEl.textContent = counters[i] + '/' + maxCounts[i];
            }
        }
    }
    
    const savedSilent = localStorage.getItem('silentMode');
    if (savedSilent === 'true') {
        silentMode = true;
        const toggle = document.getElementById('silentToggle');
        if (toggle) toggle.classList.add('active');
        document.body.classList.add('silent-mode');
    }
    
    const savedSmartSilent = localStorage.getItem('smartSilent');
    if (savedSmartSilent === 'true') {
        smartSilent = true;
        const toggle = document.getElementById('smartSilentToggle');
        if (toggle) toggle.classList.add('active');
    }
    
    const savedAdhan = localStorage.getItem('adhanEnabled');
    if (savedAdhan !== null) {
        adhanEnabled = savedAdhan === 'true';
        const toggle = document.getElementById('adhanToggle');
        if (toggle) toggle.classList.toggle('active', adhanEnabled);
    }
    
    const savedReminders = localStorage.getItem('remindersEnabled');
    if (savedReminders !== null) {
        remindersEnabled = savedReminders === 'true';
        const toggle = document.getElementById('reminderToggle');
        if (toggle) toggle.classList.toggle('active', remindersEnabled);
    }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    let progress = 0;
    const loadingBar = document.getElementById('loadingBar');
    const loadingPercentage = document.getElementById('loadingPercentage');
    
    const interval = setInterval(() => {
        progress += 2;
        if (loadingBar) loadingBar.style.width = progress + '%';
        if (loadingPercentage) loadingPercentage.textContent = progress + '%';
        
        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                if (loadingScreen) loadingScreen.classList.add('hidden');
                
                // Initialize managers
                prayerTimesManager = new PrayerTimesManager();
                adhanManager = new AdhanManager();
                silentModeManager = new SilentModeManager();
                adhkarReminderManager = new AdhkarReminderManager();
                audioManager = new AudioManager();
                pdfManager = new PDFManager();
                
                // Load saved states
                const scheduledToggle = document.getElementById('scheduledSilentToggle');
                if (scheduledToggle) scheduledToggle.classList.toggle('active', silentModeManager.enabled);
                
                const silentStart = document.getElementById('silentStart');
                if (silentStart) silentStart.value = silentModeManager.startTime;
                
                const silentEnd = document.getElementById('silentEnd');
                if (silentEnd) silentEnd.value = silentModeManager.endTime;
                
                const adhkarToggle = document.getElementById('adhkarReminderToggle');
                if (adhkarToggle) adhkarToggle.classList.toggle('active', adhkarReminderManager.enabled);
                
                const reminderInterval = document.getElementById('reminderInterval');
                if (reminderInterval) reminderInterval.value = adhkarReminderManager.interval;
                
                const intervalDisplay = document.getElementById('reminderIntervalDisplay');
                if (intervalDisplay) intervalDisplay.textContent = adhkarReminderManager.interval + ' minutes';
                
                // Load audio durations
                loadAudioDurations();
                
            }, 500);
        }
    }, 50);
    
    detectDeviceLanguage();
    
    // Render all sections
    renderQuran();
    renderArtists();
    renderBooks();
    renderVideos();
    updateDateTime();
    initPrayerTimes();
    initQibla();
    loadSavedState();
    renderPrayerCheckboxes();
    
    loadCustomAdhan();
    
    // Set intervals
    setInterval(updateDateTime, 1000);
    setInterval(updateAdhkarTimer, 1000);
    setInterval(checkAdhanTime, 10000);
    setInterval(checkSmartSilent, 30000);
    
    applyLanguage(currentLanguage);
    
    if ('Notification' in window) {
        Notification.requestPermission();
    }
    
    setupAudioListeners();
    
    // Close buttons
    const closeDocBtn = document.getElementById('closeDocument');
    if (closeDocBtn) {
        closeDocBtn.addEventListener('click', closeDocumentReader);
    }
    
    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            const viewer = document.getElementById('documentViewer');
            if (viewer) viewer.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});

// Make functions globally available
window.switchSection = switchSection;
window.toggleAdhkar = toggleAdhkar;
window.toggleSettings = toggleSettings;
window.changeLanguage = changeLanguage;
window.updateCounter = updateCounter;
window.toggleSilentMode = toggleSilentMode;
window.toggleSmartSilent = toggleSmartSilent;
window.toggleAdhan = toggleAdhan;
window.setAdhanVolume = setAdhanVolume;
window.toggleReminders = toggleReminders;
window.updateReminderInterval = updateReminderInterval;
window.calibrateCompass = calibrateCompass;
window.getUserLocation = getUserLocation;
window.filterSurahs = filterSurahs;
window.playSurah = playSurah;
window.filterArtists = filterArtists;
window.showArtists = showArtists;
window.playTrack = playTrack;
window.closeAdhanNotification = closeAdhanNotification;
window.scrollToTop = scrollToTop;
window.scrollToBottom = scrollToBottom;
window.closeVideoPlayer = closeVideoPlayer;
window.openBook = openBook;
window.playVideo = playVideo;
window.removeCustomAdhan = removeCustomAdhan;
window.togglePlayPause = togglePlayPause;
window.previousTrack = previousTrack;
window.nextTrack = nextTrack;
window.seekTo = seekTo;
window.setVolumeFromClick = setVolumeFromClick;
window.closePlayer = closePlayer;
window.changeAdhanReciter = changeAdhanReciter;
window.updateAdhanVolume = updateAdhanVolume;
window.toggleScheduledSilent = toggleScheduledSilent;
window.updateSilentTimes = updateSilentTimes;
window.toggleAdhkarReminders = toggleAdhkarReminders;
window.snoozeAdhkar = snoozeAdhkar;
window.dismissAdhkar = dismissAdhkar;