import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SilentBanner({ visible }) {
  if (!visible) return null;
  return (
    <View style={styles.container}>
      <Ionicons name="volume-mute" size={14} color="#0b1a2a" />
      <Text style={styles.text}>Silent Mode Active</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#f39c12',
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  text: { fontSize: 12, fontWeight: '700', color: '#0b1a2a' },
});
