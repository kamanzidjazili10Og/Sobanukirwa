import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

let Audio = null;
try { Audio = require('expo-av').Audio; } catch (e) {}

const DEFAULT_ADHKAR = [
  { id: 1, arabic: 'سُبْحَانَ اللَّهِ', transliteration: 'Subhanallah', translation_en: 'Glory be to Allah', translation_rw: 'Imana ni yose', count_target: 33 },
  { id: 2, arabic: 'الْحَمْدُ لِلَّهِ', transliteration: 'Alhamdulillah', translation_en: 'All praise is due to Allah', translation_rw: 'Ishimwe ryose ni ry\'Imana', count_target: 33 },
  { id: 3, arabic: 'اللَّهُ أَكْبَرُ', transliteration: 'Allahu Akbar', translation_en: 'Allah is the Greatest', translation_rw: 'Imana ni Nkuru', count_target: 34 },
  { id: 4, arabic: 'لَا إِلَهَ إِلَّا اللَّهُ', transliteration: 'La ilaha illallah', translation_en: 'There is no god but Allah', translation_rw: 'Nta Imana yindi kugeza kuri Yewe', count_target: 100 },
  { id: 5, arabic: 'أَسْتَغْفِرُ اللَّهَ', transliteration: 'Astaghfirullah', translation_en: 'I seek forgiveness from Allah', translation_rw: 'Ndusaba imbababuko ku Mana', count_target: 100 },
  { id: 6, arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', transliteration: 'Subhanallahi wa bihamdihi', translation_en: 'Glory be to Allah and His praise', translation_rw: 'Imana ni yose mu kwishimira', count_target: 100 },
  { id: 7, arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', transliteration: 'La hawla wa la quwwata illa billah', translation_en: 'There is no power except with Allah', translation_rw: 'Nta muhungiro usibye ku Mana', count_target: 100 },
  { id: 8, arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ', transliteration: 'Allahumma salli ala Muhammad', translation_en: 'O Allah, send blessings upon Muhammad', translation_rw: 'Mana, endenciesa kuri Muhammad', count_target: 100 },
];

let reminderTimer = null;
let adhkarIndex = 0;

export function startAdhkarReminder(interval, adhkarList, onShow) {
  stopAdhkarReminder();
  if (!interval || interval <= 0) return;
  reminderTimer = setInterval(() => {
    if (adhkarList && adhkarList.length > 0) {
      const adhkar = adhkarList[adhkarIndex % adhkarList.length];
      adhkarIndex++;
      if (onShow) onShow(adhkar);
    }
  }, interval * 60 * 1000);
}

export function stopAdhkarReminder() {
  if (reminderTimer) {
    clearInterval(reminderTimer);
    reminderTimer = null;
  }
}

export function snoozeAdhkarReminder(adhkar, onShow) {
  setTimeout(() => {
    if (onShow) onShow(adhkar);
  }, 5 * 60 * 1000);
}

export function AdhkarReminderModal({ visible, adhkar, language, silentMode, onSnooze, onDismiss }) {
  const [sound, setSound] = useState(null);

  useEffect(() => {
    if (visible && !silentMode) {
      playReminderAudio();
    }
    return () => stopAudio();
  }, [visible]);

  async function playReminderAudio() {
    if (!Audio) return;
    try {
      if (sound) await sound.unloadAsync();
      const uri = adhkar?.audio_url || 'https://sobanukirwa-production.up.railway.app/Sounds/Subhanallah.m4a';
      const { sound: s } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true, volume: 0.6 }
      );
      setSound(s);
    } catch (e) {}
  }

  async function stopAudio() {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      }
    } catch (e) {}
  }

  function handleSnooze() {
    stopAudio();
    snoozeAdhkarReminder(adhkar, null);
    onSnooze && onSnooze();
  }

  function handleDismiss() {
    stopAudio();
    onDismiss && onDismiss();
  }

  if (!visible || !adhkar) return null;

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Ionicons name="notifications" size={24} color="#d4af37" />
            <Text style={styles.title}>{language === 'ar' ? 'تذكير الأذكار' : 'Adhkar Reminder'}</Text>
          </View>

          <Text style={styles.arabic}>{adhkar.arabic}</Text>
          <Text style={styles.translit}>{adhkar.transliteration}</Text>
          <Text style={styles.translation}>
            {language === 'ar' ? (adhkar.translation_rw || adhkar.translation_en) :
             language === 'rw' ? (adhkar.translation_rw || adhkar.translation_en) :
             adhkar.translation_en}
          </Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.btn, styles.snoozeBtn]} onPress={handleSnooze}>
              <Ionicons name="time" size={18} color="#fff" />
              <Text style={styles.btnText}>Snooze 5m</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.dismissBtn]} onPress={handleDismiss}>
              <Ionicons name="close" size={18} color="#fff" />
              <Text style={styles.btnText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modal: { backgroundColor: '#1e3c5c', borderRadius: 20, padding: 28, width: '100%', borderWidth: 2, borderColor: '#d4af37' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  title: { fontSize: 18, fontWeight: '700', color: '#d4af37' },
  arabic: { fontSize: 28, fontWeight: '700', color: '#d4af37', textAlign: 'center', lineHeight: 44, fontFamily: 'serif', marginBottom: 12 },
  translit: { fontSize: 16, fontWeight: '600', color: '#f0f4fa', textAlign: 'center', marginBottom: 8 },
  translation: { fontSize: 14, color: '#a8c1d9', textAlign: 'center', fontStyle: 'italic', marginBottom: 24 },
  buttonRow: { flexDirection: 'row', gap: 12 },
  btn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderRadius: 12 },
  snoozeBtn: { backgroundColor: '#f39c12' },
  dismissBtn: { backgroundColor: '#e74c3c' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
