import AsyncStorage from '@react-native-async-storage/async-storage';

let Audio = null;
try { Audio = require('expo-av').Audio; } catch (e) {}

let checkInterval = null;
let currentSound = null;
let lastPlayedDate = '';

const PRAYER_NAMES = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

const ADHAN_FILES = {
  Adhan1: 'https://sobanukirwa-production.up.railway.app/Sounds/Adhan1.mpeg',
  Adhan2: 'https://sobanukirwa-production.up.railway.app/Sounds/Adhan2.mpeg',
  Mansour: 'https://sobanukirwa-production.up.railway.app/Sounds/Mansour_Adhan.mpeg',
};

export async function startAdhanManager(getPrayerTimes, onAdhanPlay) {
  stopAdhanManager();

  checkInterval = setInterval(async () => {
    try {
      const settings = JSON.parse(await AsyncStorage.getItem('app_settings') || '{}');
      if (!settings.adhanEnabled) return;

      const today = new Date().toDateString();
      if (lastPlayedDate === today) return;

      const times = await getPrayerTimes();
      if (!times) return;

      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      for (const prayer of PRAYER_NAMES) {
        const timeStr = times[prayer];
        if (!timeStr || prayer === 'Sunrise') continue;
        const cleanTime = timeStr.replace(/ \(.*\)/, '');
        const [h, m] = cleanTime.split(':').map(Number);
        const prayerMinutes = h * 60 + m;

        if (Math.abs(currentMinutes - prayerMinutes) <= 2) {
          const reciter = settings.adhanReciter || 'Adhan1';
          const volume = settings.adhanVolume || 80;
          await playAdhan(reciter, volume);
          lastPlayedDate = today;
          if (onAdhanPlay) onAdhanPlay(prayer);
          break;
        }
      }
    } catch (e) {}
  }, 30000);
}

export function stopAdhanManager() {
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
  }
}

async function playAdhan(reciter, volume) {
  if (!Audio) return;
  try {
    if (currentSound) {
      await currentSound.unloadAsync();
      currentSound = null;
    }
    const uri = ADHAN_FILES[reciter] || ADHAN_FILES.Adhan1;
    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true, volume: (volume || 80) / 100 }
    );
    currentSound = sound;
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        sound.unloadAsync();
        currentSound = null;
      }
    });
  } catch (e) {}
}

export async function stopAdhan() {
  if (currentSound) {
    try {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
      currentSound = null;
    } catch (e) {}
  }
}
