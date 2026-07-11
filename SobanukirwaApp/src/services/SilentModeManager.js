import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';

let silentInterval = null;

export async function startSilentModeManager() {
  stopSilentModeManager();

  silentInterval = setInterval(async () => {
    try {
      const settings = JSON.parse(await AsyncStorage.getItem('app_settings') || '{}');

      if (settings.scheduledSilent && settings.silentFrom && settings.silentTo) {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const [fromH, fromM] = settings.silentFrom.split(':').map(Number);
        const [toH, toM] = settings.silentTo.split(':').map(Number);
        const fromMinutes = fromH * 60 + fromM;
        const toMinutes = toH * 60 + toM;

        let isSilent;
        if (fromMinutes <= toMinutes) {
          isSilent = currentMinutes >= fromMinutes && currentMinutes < toMinutes;
        } else {
          isSilent = currentMinutes >= fromMinutes || currentMinutes < toMinutes;
        }

        if (isSilent) {
          await Audio.setAudioModeAsync({ staysActiveInBackground: false });
        }
      }
    } catch (e) {}
  }, 30000);
}

export function stopSilentModeManager() {
  if (silentInterval) {
    clearInterval(silentInterval);
    silentInterval = null;
  }
}
