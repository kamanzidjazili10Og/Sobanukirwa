import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

const COLORS = {
  surface: 'rgba(20, 35, 55, 0.7)',
  primaryText: '#e8edf5',
  secondaryText: 'rgba(232, 237, 245, 0.5)',
  accent: '#c9a84c',
  success: '#2ecc71',
  border: 'rgba(201, 168, 76, 0.2)',
};

const TYPE_CONFIG = {
  image: {
    icon: 'image-outline',
    accept: 'image/*',
    label: 'Choose Image',
  },
  audio: {
    icon: 'musical-notes-outline',
    accept: 'audio/*',
    label: 'Choose Audio',
  },
  video: {
    icon: 'videocam-outline',
    accept: 'video/*',
    label: 'Choose Video',
  },
  document: {
    icon: 'document-text-outline',
    accept: '*/*',
    label: 'Choose Document',
  },
};

export default function FileUpload({ type = 'document', onFileSelected, label }) {
  const [fileName, setFileName] = useState(null);
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.document;

  const handlePress = async () => {
    try {
      let result;

      if (type === 'image') {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Permission Required', 'Please grant media library access.');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
        });
        if (!result.canceled && result.assets?.[0]) {
          const asset = result.assets[0];
          setFileName(asset.fileName || 'image.jpg');
          onFileSelected?.({ uri: asset.uri, name: asset.fileName || 'image.jpg', type: asset.mimeType });
        }
        return;
      }

      result = await DocumentPicker.getDocumentAsync({
        type: config.accept,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.[0]) {
        const file = result.assets[0];
        setFileName(file.name);
        onFileSelected?.(file);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to pick file. Please try again.');
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.iconBox}>
        <Ionicons name={fileName ? 'checkmark-circle' : config.icon} size={24} color={fileName ? COLORS.success : COLORS.accent} />
      </View>
      <View style={styles.info}>
        <Text style={styles.label}>{label || config.label}</Text>
        {fileName ? (
          <Text style={styles.fileName} numberOfLines={1}>{fileName}</Text>
        ) : (
          <Text style={styles.hint}>Tap to select a file</Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={18} color={COLORS.secondaryText} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(201, 168, 76, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primaryText,
  },
  hint: {
    fontSize: 12,
    color: COLORS.secondaryText,
    marginTop: 2,
  },
  fileName: {
    fontSize: 12,
    color: COLORS.success,
    marginTop: 2,
  },
});
