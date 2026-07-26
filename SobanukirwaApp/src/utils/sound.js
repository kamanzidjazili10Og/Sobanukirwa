import { Audio } from 'expo-av';

let clickSound = null;

export async function playClickSound() {
  try {
    if (clickSound) {
      await clickSound.unloadAsync();
      clickSound = null;
    }
    const { sound } = await Audio.Sound.createAsync(
      require('../../assets/Subhanallah.m4a'),
      { volume: 0.2 }
    );
    clickSound = sound;
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        sound.unloadAsync().catch(() => {});
        clickSound = null;
      }
    });
  } catch (e) {}
}

export async function cleanupSound() {
  if (clickSound) {
    try {
      await clickSound.unloadAsync();
    } catch (e) {}
    clickSound = null;
  }
}
