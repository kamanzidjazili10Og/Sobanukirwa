import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

let checkInterval = null;
let currentSound = null;

const PRAYER_NAMES = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

export async function startAdhanManager(getPrayerTimes, showToast) {
  stopAdhanManager();

  checkInterval = setInterval(async () => {
    try {
      const settings = JSON.parse(await AsyncStorage.getItem('app_settings') || '{}');
      if (!settings.adhanEnabled) return;

      const times = await getPrayerTimes();
      if (!times) return;

      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      for (const prayer of PRAYER_NAMES) {
        const timeStr = times[prayer];
        if (!timeStr) continue;
        const cleanTime = timeStr.replace(/ \(.*\)/, '');
        const [h, m] = cleanTime.split(':').map(Number);
        const prayerMinutes = h * 60 + m;

        if (currentMinutes === prayerMinutes) {
          await playAdhan(settings.adhanVolume || 80);
          if (showToast) showToast(`Adhan for ${prayer}`, 'info');
          break;
        }
      }
    } catch (e) {}
  }, 60000);
}

export function stopAdhanManager() {
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
  }
}

async function playAdhan(volume = 80) {
  try {
    if (currentSound) {
      await currentSound.unloadAsync();
      currentSound = null;
    }
    const { sound } = await Audio.Sound.createAsync(
      { uri: 'https://server7.mp3quran.net/tn/ajms01.mp3' },
      { shouldPlay: true, volume: volume / 100 }
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
