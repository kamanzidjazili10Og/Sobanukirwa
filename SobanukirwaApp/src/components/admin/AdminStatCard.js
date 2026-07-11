import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  surface: 'rgba(20, 35, 55, 0.7)',
  primaryText: '#e8edf5',
  secondaryText: 'rgba(232, 237, 245, 0.5)',
  accent: '#c9a84c',
  border: 'rgba(201, 168, 76, 0.2)',
};

export default function AdminStatCard({ icon, number, label, color }) {
  const accentColor = color || COLORS.accent;

  return (
    <View style={[styles.card, { borderLeftColor: accentColor }]}>
      <View style={[styles.iconContainer, { backgroundColor: accentColor + '20' }]}>
        <Ionicons name={icon} size={22} color={accentColor} />
      </View>
      <View style={styles.info}>
        <Text style={styles.number}>{number}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderLeftWidth: 3,
    padding: 16,
    gap: 14,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  number: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primaryText,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.secondaryText,
    marginTop: 2,
  },
});
