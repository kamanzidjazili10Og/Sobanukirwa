import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from './src/context/AppContext';
import { ToastProvider } from './src/components/Toast';
import AppNavigator from './src/navigation/AppNavigator';
import LoadingScreen from './src/screens/LoadingScreen';

try {
  const Notifications = require('expo-notifications');
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
} catch (e) {}

export default function App() {
  const [loading, setLoading] = useState(true);

  return (
    <View style={styles.container}>
      <AppProvider>
        <ToastProvider>
          <NavigationContainer>
            <StatusBar style="light" />
            {!loading && <AppNavigator />}
            {loading && <LoadingScreen onFinish={() => setLoading(false)} />}
          </NavigationContainer>
        </ToastProvider>
      </AppProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1a2a' },
});
