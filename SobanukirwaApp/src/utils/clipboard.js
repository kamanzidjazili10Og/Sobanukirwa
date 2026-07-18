import { Platform, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';

export async function copyToClipboard(text, label) {
  try {
    await Clipboard.setStringAsync(text || '');
    Alert.alert('Copied', `${label || 'Text'} copied to clipboard`);
  } catch (e) {
    Alert.alert('Copy failed', 'Could not copy text');
  }
}

export async function shareText(text, title) {
  try {
    const { Share } = require('react-native');
    await Share.share({ message: text, title: title || 'Sobanukirwa' });
  } catch (e) {}
}
