import React from 'react';
import { Text, Platform, StyleSheet } from 'react-native';

export default function GradientText({ children, style, colors, start, end }) {
  if (Platform.OS === 'web') {
    return (
      <Text style={[style, {
        backgroundImage: `linear-gradient(90deg, ${(colors || ['#d4af37', '#f0d060', '#d4af37']).join(', ')})`,
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        color: 'transparent',
      }]}>
        {children}
      </Text>
    );
  }

  const MaskedView = require('@react-native-masked-view/masked-view').default;
  const { LinearGradient } = require('expo-linear-gradient');
  return (
    <MaskedView maskElement={<Text style={[style, { backgroundColor: 'transparent' }]}>{children}</Text>}>
      <LinearGradient
        colors={colors || ['#d4af37', '#f0d060', '#d4af37']}
        start={start || { x: 0, y: 0 }}
        end={end || { x: 1, y: 0 }}
      >
        <Text style={[style, { opacity: 0 }]}>{children}</Text>
      </LinearGradient>
    </MaskedView>
  );
}
