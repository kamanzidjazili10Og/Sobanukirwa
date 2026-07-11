import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const COLORS = {
  background: '#0a1220',
  primaryText: '#e8edf5',
  accent: '#c9a84c',
  success: '#2ecc71',
  error: '#e74c3c',
  warning: '#f39c12',
  info: '#3498db',
};

const SIZES = {
  small: { paddingH: 8, paddingV: 3, fontSize: 10 },
  medium: { paddingH: 12, paddingV: 5, fontSize: 12 },
  large: { paddingH: 16, paddingV: 7, fontSize: 14 },
};

export default function AdminBadge({ text, color, size = 'medium' }) {
  const badgeColor = color || COLORS.accent;
  const sizeStyle = SIZES[size] || SIZES.medium;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: badgeColor + '20',
          borderColor: badgeColor + '40',
          paddingHorizontal: sizeStyle.paddingH,
          paddingVertical: sizeStyle.paddingV,
        },
      ]}
    >
      <Text style={[styles.text, { color: badgeColor, fontSize: sizeStyle.fontSize }]}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    borderWidth: 1,
  },
  text: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
