import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  surface: 'rgba(20, 35, 55, 0.7)',
  primaryText: '#e8edf5',
  secondaryText: 'rgba(232, 237, 245, 0.4)',
  accent: '#c9a84c',
  border: 'rgba(201, 168, 76, 0.2)',
};

export default function AdminSearchBar({ value, onChangeText, placeholder = 'Search...' }) {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={18} color={COLORS.accent} style={styles.icon} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.secondaryText}
        autoCorrect={false}
        autoCapitalize="none"
      />
      {value?.length > 0 && (
        <TouchableOpacity
          onPress={() => onChangeText('')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.clearBtn}
        >
          <Ionicons name="close-circle" size={18} color={COLORS.secondaryText} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 14,
    height: 44,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.primaryText,
    paddingVertical: 0,
  },
  clearBtn: {
    marginLeft: 8,
  },
});
